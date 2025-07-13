// ================================
// RUMI MESSAGE BUS TESTS
// Test suite for message passing
// ================================

import messageBus from '../core/message-bus.js';

describe('RumiMessageBus', () => {
    beforeEach(() => {
        messageBus.reset();
    });
    
    // ================================
    // SUBSCRIPTION TESTS
    // ================================
    
    describe('subscription management', () => {
        test('should subscribe to topics', () => {
            const callback = jest.fn();
            messageBus.subscribe('test', callback);
            
            expect(messageBus.getStats().totalSubscribers).toBe(1);
        });
        
        test('should unsubscribe from topics', () => {
            const callback = jest.fn();
            const unsubscribe = messageBus.subscribe('test', callback);
            
            unsubscribe();
            expect(messageBus.getStats().totalSubscribers).toBe(0);
        });
        
        test('should handle multiple subscribers', () => {
            const callback1 = jest.fn();
            const callback2 = jest.fn();
            
            messageBus.subscribe('test', callback1);
            messageBus.subscribe('test', callback2);
            
            expect(messageBus.getStats().totalSubscribers).toBe(2);
        });
        
        test('should handle multiple topics', () => {
            const callback = jest.fn();
            
            messageBus.subscribe('topic1', callback);
            messageBus.subscribe('topic2', callback);
            
            expect(messageBus.getStats().activeTopics).toBe(2);
        });
    });
    
    // ================================
    // MESSAGE DELIVERY TESTS
    // ================================
    
    describe('message delivery', () => {
        test('should deliver messages to subscribers', async () => {
            const callback = jest.fn();
            messageBus.subscribe('test', callback);
            
            await messageBus.publish('test', { data: 'test' });
            
            // Wait for async delivery
            await new Promise(resolve => setTimeout(resolve, 0));
            
            expect(callback).toHaveBeenCalledWith(
                { data: 'test' },
                expect.objectContaining({
                    topic: 'test',
                    payload: { data: 'test' }
                })
            );
        });
        
        test('should handle messages without subscribers', async () => {
            await messageBus.publish('test', { data: 'test' });
            
            // Wait for async delivery
            await new Promise(resolve => setTimeout(resolve, 0));
            
            const stats = messageBus.getStats().performance;
            expect(stats.undeliveredMessages.recent).toBe(1);
        });
        
        test('should respect message priority', async () => {
            const received = [];
            const callback = (payload) => received.push(payload);
            
            messageBus.subscribe('test', callback);
            
            await messageBus.publish('test', 'low', { priority: 0 });
            await messageBus.publish('test', 'high', { priority: 1 });
            
            // Wait for async delivery
            await new Promise(resolve => setTimeout(resolve, 0));
            
            expect(received[0]).toBe('high');
            expect(received[1]).toBe('low');
        });
        
        test('should handle message expiry', async () => {
            const callback = jest.fn();
            messageBus.subscribe('test', callback);
            
            await messageBus.publish('test', 'data', {
                expiry: Date.now() - 1000 // Already expired
            });
            
            // Wait for async delivery
            await new Promise(resolve => setTimeout(resolve, 0));
            
            expect(callback).not.toHaveBeenCalled();
            const stats = messageBus.getStats().performance;
            expect(stats.expiredMessages.recent).toBe(1);
        });
    });
    
    // ================================
    // ERROR HANDLING TESTS
    // ================================
    
    describe('error handling', () => {
        test('should retry failed deliveries', async () => {
            let attempts = 0;
            const callback = jest.fn().mockImplementation(() => {
                attempts++;
                if (attempts < 2) throw new Error('Test error');
            });
            
            messageBus.subscribe('test', callback);
            await messageBus.publish('test', 'data');
            
            // Wait for retries
            await new Promise(resolve => setTimeout(resolve, 500));
            
            expect(attempts).toBe(2);
            expect(callback).toHaveBeenCalledTimes(2);
        });
        
        test('should handle subscriber timeout', async () => {
            const callback = jest.fn().mockImplementation(() => {
                return new Promise(resolve => setTimeout(resolve, 6000));
            });
            
            messageBus.subscribe('test', callback, { timeout: 100 });
            await messageBus.publish('test', 'data');
            
            // Wait for timeout
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const stats = messageBus.getStats().performance;
            expect(stats.deliveryErrors.recent).toBe(1);
        });
        
        test('should stop retrying after max attempts', async () => {
            const callback = jest.fn().mockRejectedValue(new Error('Test error'));
            
            messageBus.subscribe('test', callback);
            await messageBus.publish('test', 'data', { retries: 2 });
            
            // Wait for retries
            await new Promise(resolve => setTimeout(resolve, 500));
            
            expect(callback).toHaveBeenCalledTimes(3); // Initial + 2 retries
            const stats = messageBus.getStats().performance;
            expect(stats.failedMessages.recent).toBe(1);
        });
    });
    
    // ================================
    // PERFORMANCE TESTS
    // ================================
    
    describe('performance', () => {
        test('should handle high message volume', async () => {
            const callback = jest.fn();
            messageBus.subscribe('test', callback);
            
            const count = 100;
            const start = performance.now();
            
            // Publish many messages
            for (let i = 0; i < count; i++) {
                await messageBus.publish('test', `message-${i}`);
            }
            
            // Wait for processing
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const duration = performance.now() - start;
            expect(duration).toBeLessThan(1000); // Should process 100 messages in under 1s
            expect(callback).toHaveBeenCalledTimes(count);
        });
        
        test('should maintain queue size limit', async () => {
            const callback = jest.fn().mockImplementation(() => {
                return new Promise(resolve => setTimeout(resolve, 50));
            });
            
            messageBus.subscribe('test', callback);
            
            // Publish many messages quickly
            for (let i = 0; i < 200; i++) {
                await messageBus.publish('test', `message-${i}`);
            }
            
            const stats = messageBus.getStats();
            expect(stats.queueSize).toBeLessThanOrEqual(100);
        });
    });
    
    // ================================
    // CONFIGURATION TESTS
    // ================================
    
    describe('configuration', () => {
        test('should update retry config', () => {
            messageBus.setRetryConfig({
                maxRetries: 5,
                backoffMs: 200
            });
            
            const callback = jest.fn().mockRejectedValue(new Error('Test error'));
            messageBus.subscribe('test', callback);
            
            return expect(messageBus.publish('test', 'data'))
                .resolves.toBeDefined();
        });
        
        test('should respect subscriber options', async () => {
            const callback = jest.fn();
            messageBus.subscribe('test', callback, {
                priority: 2,
                timeout: 1000,
                retries: 1
            });
            
            await messageBus.publish('test', 'data');
            
            // Wait for processing
            await new Promise(resolve => setTimeout(resolve, 0));
            
            expect(callback).toHaveBeenCalled();
        });
    });
}); 