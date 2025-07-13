// ================================
// RUMI ERROR HANDLING SYSTEM
// Error recovery and retry mechanisms
// ================================

// Note: This file is loaded in browser environment, so we'll use global references
// instead of ES6 imports to avoid module loading issues

class RumiErrorHandler {
    constructor() {
        this.maxRetries = 3;
        this.retryDelay = 1000; // ms
        this.errorHistory = [];
        this.maxHistorySize = 50;
        
        // Error recovery strategies
        this.recoveryStrategies = new Map();
        this.initializeRecoveryStrategies();
        
        console.log('🎯 ERROR: Handler initialized');
    }
    
    // ================================
    // RETRY MECHANISMS
    // ================================
    
    async retryOperation(operation, context = {}) {
        let lastError = null;
        let attempt = 0;
        
        while (attempt < this.maxRetries) {
            try {
                const result = await operation();
                if (attempt > 0) {
                    console.log(`🎯 ERROR: Operation succeeded after ${attempt + 1} attempts`);
                }
                return result;
            } catch (error) {
                lastError = error;
                attempt++;
                
                this.logError(error, context);
                
                if (attempt < this.maxRetries) {
                    console.log(`🎯 ERROR: Retry attempt ${attempt + 1}/${this.maxRetries}`);
                    await this.delay(this.retryDelay * attempt);
                }
            }
        }
        
        console.error(`🎯 ERROR: Operation failed after ${this.maxRetries} attempts:`, lastError);
        throw lastError;
    }
    
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // ================================
    // ERROR RECOVERY
    // ================================
    
    initializeRecoveryStrategies() {
        // Content loading errors
        this.recoveryStrategies.set('content-load', async (error, context) => {
            console.log('🎯 ERROR: Attempting content recovery');
            
            // Try loading from cache first
            const cachedContent = await this.loadFromCache(context);
            if (cachedContent) {
                return cachedContent;
            }
            
            // Fall back to mock data if cache fails
            return this.loadMockContent();
        });
        
        // State synchronization errors
        this.recoveryStrategies.set('state-sync', async (error, context) => {
            console.log('🎯 ERROR: Attempting state recovery');
            
            // Reset to last known good state
            if (context.lastGoodState) {
                return context.lastGoodState;
            }
            
            // If no good state, initialize fresh
            return this.getInitialState();
        });
        
        // Timeline progression errors
        this.recoveryStrategies.set('timeline', async (error, context) => {
            console.log('🎯 ERROR: Attempting timeline recovery');
            
            // Try to resume from last known position
            if (context.lastPosition) {
                return { type: 'resume', position: context.lastPosition };
            }
            
            // If position unknown, restart current block
            return { type: 'restart', block: context.currentBlock };
        });

        // Network connectivity errors
        this.recoveryStrategies.set('network', async (error, context) => {
            console.log('🎯 ERROR: Attempting network recovery');
            
            // Check if it's a timeout error
            if (error.name === 'TimeoutError') {
                return { 
                    type: 'retry',
                    timeout: Math.min((context.timeout || 5000) * 1.5, 30000) // Increase timeout up to 30s
                };
            }
            
            // For offline scenarios
            if (!navigator.onLine) {
                return { 
                    type: 'offline',
                    lastSyncedData: await this.loadFromCache({ key: 'lastSyncedData' })
                };
            }
            
            return { type: 'fail' };
        });

        // Memory management errors
        this.recoveryStrategies.set('memory', async (error, context) => {
            console.log('🎯 ERROR: Attempting memory recovery');
            
            // Clear non-essential caches
            this.clearErrorHistory();
            await this.clearOldCaches();
            
            // If we're dealing with large datasets
            if (context.dataSize && context.dataSize > 1000) {
                return {
                    type: 'paginate',
                    pageSize: Math.floor(context.dataSize / 2) // Cut batch size in half
                };
            }
            
            return { type: 'gc' }; // Suggest garbage collection
        });

        // Animation and rendering errors
        this.recoveryStrategies.set('animation', async (error, context) => {
            console.log('🎯 ERROR: Attempting animation recovery');
            
            // If frame rate drops below threshold
            if (context.fps && context.fps < 30) {
                return {
                    type: 'optimize',
                    reducedQuality: true,
                    skipFrames: true
                };
            }
            
            // If animation queue is backed up
            if (context.queueLength && context.queueLength > 100) {
                return {
                    type: 'clear-queue',
                    preserveKeyFrames: true
                };
            }
            
            return { type: 'disable' };
        });

        // Data corruption errors
        this.recoveryStrategies.set('data-corruption', async (error, context) => {
            console.log('🎯 ERROR: Attempting data recovery');
            
            // Try to recover from backup
            const backup = await this.loadFromCache({ key: 'dataBackup' });
            if (backup) {
                return {
                    type: 'restore',
                    data: backup,
                    timestamp: backup.timestamp
                };
            }
            
            // Try to repair corrupted data
            if (context.data) {
                const repaired = await this.repairData(context.data);
                if (repaired) {
                    return {
                        type: 'repair',
                        data: repaired
                    };
                }
            }
            
            return { type: 'reset' };
        });

        // Resource exhaustion errors
        this.recoveryStrategies.set('resource', async (error, context) => {
            console.log('🎯 ERROR: Attempting resource recovery');
            
            // If we're running out of memory
            if (error.name === 'OutOfMemoryError') {
                return {
                    type: 'reduce-memory',
                    clearCaches: true,
                    unloadNonEssential: true
                };
            }
            
            // If we're hitting CPU limits
            if (context.cpuUsage && context.cpuUsage > 80) {
                return {
                    type: 'throttle',
                    interval: 1000, // Add 1s delay between operations
                    priority: 'low'
                };
            }
            
            return { type: 'optimize' };
        });
    }
    
    async attemptRecovery(errorType, error, context = {}) {
        const strategy = this.recoveryStrategies.get(errorType);
        if (!strategy) {
            console.warn(`🎯 ERROR: No recovery strategy for ${errorType}`);
            return null;
        }
        
        try {
            const result = await strategy(error, context);
            console.log(`🎯 ERROR: Recovery successful for ${errorType}`);
            return result;
        } catch (recoveryError) {
            console.error(`🎯 ERROR: Recovery failed for ${errorType}:`, recoveryError);
            return null;
        }
    }
    
    // ================================
    // HELPER METHODS
    // ================================
    
    async loadFromCache(context) {
        try {
            if (!window.RumiCache) {
                return null;
            }
            
            // Try to load from content cache first
            let cachedData = await window.RumiCache.get('content', context.key || 'default');
            if (cachedData) {
                return cachedData;
            }
            
            // Try backup cache if content cache fails
            cachedData = await window.RumiCache.get('backup', context.key || 'default');
            if (cachedData) {
                // Restore to content cache for future use
                await window.RumiCache.set('content', context.key || 'default', cachedData);
                return cachedData;
            }
            
            return null;
        } catch (error) {
            console.warn('Cache load failed:', error);
            return null;
        }
    }
    
    async saveToCache(key, data, type = 'content') {
        try {
            if (!window.RumiCache) {
                return false;
            }
            
            await window.RumiCache.set(type, key, data);
            
            // Also save to backup if it's important data
            if (type === 'content' || type === 'state') {
                await window.RumiCache.set('backup', key, data);
            }
            
            return true;
        } catch (error) {
            console.warn('Cache save failed:', error);
            return false;
        }
    }
    
    loadMockContent() {
        return [
            {
                title: 'Backup Content 1',
                duration: 30,
                type: 'fallback'
            },
            {
                title: 'Backup Content 2',
                duration: 30,
                type: 'fallback'
            }
        ];
    }
    
    getInitialState() {
        return {
            isActive: false,
            currentBlock: null,
            progress: 0,
            errors: []
        };
    }
    
    logError(error, context = {}) {
        const errorLog = {
            timestamp: Date.now(),
            error: error.message,
            stack: error.stack,
            context: context
        };
        
        this.errorHistory.unshift(errorLog);
        
        // Trim history if too long
        if (this.errorHistory.length > this.maxHistorySize) {
            this.errorHistory.pop();
        }
    }
    
    getErrorHistory() {
        return [...this.errorHistory];
    }
    
    clearErrorHistory() {
        this.errorHistory = [];
    }

    // Add helper methods for new strategies
    async clearOldCaches() {
        try {
            const cacheKeys = await caches.keys();
            const oldCaches = cacheKeys.filter(key => 
                key.startsWith('rumi-') && 
                !key.includes('essential')
            );
            
            await Promise.all(
                oldCaches.map(key => caches.delete(key))
            );
            
            console.log(`🎯 ERROR: Cleared ${oldCaches.length} old caches`);
            return true;
        } catch (error) {
            console.warn('Failed to clear caches:', error);
            return false;
        }
    }

    async repairData(data) {
        try {
            // Basic data structure validation and repair
            if (!data) return null;
            
            // Remove null/undefined values
            if (Array.isArray(data)) {
                return data.filter(item => item != null);
            }
            
            if (typeof data === 'object') {
                const repaired = {};
                for (const [key, value] of Object.entries(data)) {
                    if (value != null) {
                        repaired[key] = value;
                    }
                }
                return repaired;
            }
            
            return data;
        } catch (error) {
            console.warn('Data repair failed:', error);
            return null;
        }
    }
}

// Create singleton instance and make globally available
const RumiError = new RumiErrorHandler();
window.RumiError = RumiError; 

// Provide ES module default export for compatibility with module imports
export default RumiError; 