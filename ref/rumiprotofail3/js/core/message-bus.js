// ================================
// RUMI MESSAGE BUS
// Robust message passing between components
// ================================

import monitor from './performance-monitor.js';

class RumiMessageBus {
    constructor() {
        this.subscribers = new Map();
        this.messageQueue = [];
        this.processingQueue = false;
        this.retryConfig = {
            maxRetries: 3,
            backoffMs: 100
        };
        
        // Initialize performance monitoring
        monitor.setThreshold('messageProcessing', 50); // 50ms per message
        monitor.setThreshold('queueSize', 100); // Max 100 messages in queue
    }
    
    // ================================
    // SUBSCRIPTION MANAGEMENT
    // ================================
    
    /**
     * Subscribe to messages
     * @param {string} topic - Message topic
     * @param {Function} callback - Message handler
     * @param {Object} options - Subscription options
     * @returns {Function} Unsubscribe function
     */
    subscribe(topic, callback, options = {}) {
        if (!this.subscribers.has(topic)) {
            this.subscribers.set(topic, new Set());
        }
        
        const subscription = {
            callback,
            options: {
                priority: options.priority || 0,
                timeout: options.timeout || 5000,
                retries: options.retries || this.retryConfig.maxRetries
            }
        };
        
        this.subscribers.get(topic).add(subscription);
        
        // Return unsubscribe function
        return () => {
            const subs = this.subscribers.get(topic);
            if (subs) {
                subs.delete(subscription);
                if (subs.size === 0) {
                    this.subscribers.delete(topic);
                }
            }
        };
    }
    
    // ================================
    // MESSAGE PUBLISHING
    // ================================
    
    /**
     * Publish a message to subscribers
     * @param {string} topic - Message topic
     * @param {*} payload - Message payload
     * @param {Object} options - Publishing options
     * @returns {Promise} Resolution status
     */
    async publish(topic, payload, options = {}) {
        monitor.startMetric('messagePublish');
        
        const message = {
            id: crypto.randomUUID(),
            topic,
            payload,
            timestamp: Date.now(),
            options: {
                priority: options.priority || 0,
                expiry: options.expiry || Date.now() + 60000, // 1 minute default
                retries: options.retries || this.retryConfig.maxRetries
            }
        };
        
        // Add to queue
        this.messageQueue.push(message);
        monitor.recordMetric('queueSize', this.messageQueue.length);
        
        // Start queue processing if not already running
        if (!this.processingQueue) {
            this.processQueue();
        }
        
        monitor.endMetric('messagePublish');
        return message.id;
    }
    
    // ================================
    // QUEUE PROCESSING
    // ================================
    
    /**
     * Process message queue
     * @private
     */
    async processQueue() {
        if (this.processingQueue) return;
        this.processingQueue = true;
        
        while (this.messageQueue.length > 0) {
            // Sort by priority and timestamp
            this.messageQueue.sort((a, b) => {
                if (a.options.priority !== b.options.priority) {
                    return b.options.priority - a.options.priority;
                }
                return a.timestamp - b.timestamp;
            });
            
            const message = this.messageQueue.shift();
            
            // Skip expired messages
            if (message.options.expiry < Date.now()) {
                monitor.recordMetric('expiredMessages', 1);
                continue;
            }
            
            try {
                await this.deliverMessage(message);
            } catch (error) {
                console.error('Error delivering message:', error);
                
                // Retry if attempts remain
                if (message.options.retries > 0) {
                    message.options.retries--;
                    message.timestamp = Date.now();
                    this.messageQueue.push(message);
                } else {
                    monitor.recordMetric('failedMessages', 1);
                }
            }
            
            monitor.recordMetric('queueSize', this.messageQueue.length);
        }
        
        this.processingQueue = false;
    }
    
    /**
     * Deliver message to subscribers
     * @param {Object} message - Message object
     * @private
     */
    async deliverMessage(message) {
        monitor.startMetric('messageProcessing');
        
        const subscribers = this.subscribers.get(message.topic);
        if (!subscribers || subscribers.size === 0) {
            monitor.recordMetric('undeliveredMessages', 1);
            monitor.endMetric('messageProcessing');
            return;
        }
        
        // Create delivery promises
        const deliveries = Array.from(subscribers).map(async (subscription) => {
            const { callback, options } = subscription;
            
            try {
                // Create timeout promise
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Delivery timeout')), options.timeout);
                });
                
                // Attempt delivery with timeout
                await Promise.race([
                    callback(message.payload, message),
                    timeoutPromise
                ]);
                
                monitor.recordMetric('deliveredMessages', 1);
            } catch (error) {
                monitor.recordMetric('deliveryErrors', 1);
                throw error;
            }
        });
        
        // Wait for all deliveries
        await Promise.all(deliveries);
        
        monitor.endMetric('messageProcessing');
    }
    
    // ================================
    // ERROR HANDLING
    // ================================
    
    /**
     * Configure retry behavior
     * @param {Object} config - Retry configuration
     */
    setRetryConfig(config) {
        this.retryConfig = {
            ...this.retryConfig,
            ...config
        };
    }
    
    /**
     * Get message bus statistics
     * @returns {Object} Statistics object
     */
    getStats() {
        return {
            queueSize: this.messageQueue.length,
            activeTopics: this.subscribers.size,
            totalSubscribers: Array.from(this.subscribers.values())
                .reduce((total, subs) => total + subs.size, 0),
            performance: {
                messageProcessing: monitor.getStats('messageProcessing'),
                queueSize: monitor.getStats('queueSize'),
                deliveredMessages: monitor.getStats('deliveredMessages'),
                deliveryErrors: monitor.getStats('deliveryErrors'),
                expiredMessages: monitor.getStats('expiredMessages'),
                undeliveredMessages: monitor.getStats('undeliveredMessages')
            }
        };
    }
    
    /**
     * Clear all subscriptions and queued messages
     */
    reset() {
        this.subscribers.clear();
        this.messageQueue = [];
        this.processingQueue = false;
    }
}

// Create singleton instance
const messageBus = new RumiMessageBus();
export default messageBus; 