// ================================
// RUMI ERROR HANDLING TESTS
// Test suite for error recovery system
// ================================

import RumiError from '../core/error-handling.js';

describe('RumiErrorHandler', () => {
    beforeEach(() => {
        // Reset error handler state
        RumiError.clearErrorHistory();
    });
    
    // ================================
    // RETRY MECHANISM TESTS
    // ================================
    
    describe('retryOperation', () => {
        test('should succeed on first try', async () => {
            const operation = jest.fn().mockResolvedValue('success');
            const result = await RumiError.retryOperation(operation);
            expect(result).toBe('success');
            expect(operation).toHaveBeenCalledTimes(1);
        });
        
        test('should retry failed operation', async () => {
            const operation = jest.fn()
                .mockRejectedValueOnce(new Error('fail'))
                .mockResolvedValueOnce('success');
            
            const result = await RumiError.retryOperation(operation);
            expect(result).toBe('success');
            expect(operation).toHaveBeenCalledTimes(2);
        });
        
        test('should fail after max retries', async () => {
            const operation = jest.fn().mockRejectedValue(new Error('fail'));
            
            await expect(RumiError.retryOperation(operation))
                .rejects.toThrow('fail');
            expect(operation).toHaveBeenCalledTimes(3);
        });
    });
    
    // ================================
    // RECOVERY STRATEGY TESTS
    // ================================
    
    describe('content-load strategy', () => {
        test('should try cache first', async () => {
            const mockCache = { title: 'Cached Content' };
            jest.spyOn(RumiError, 'loadFromCache')
                .mockResolvedValueOnce(mockCache);
            
            const result = await RumiError.attemptRecovery('content-load', new Error());
            expect(result).toEqual(mockCache);
        });
        
        test('should fall back to mock data', async () => {
            jest.spyOn(RumiError, 'loadFromCache')
                .mockResolvedValueOnce(null);
            
            const result = await RumiError.attemptRecovery('content-load', new Error());
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(0);
        });
    });
    
    describe('state-sync strategy', () => {
        test('should restore last good state', async () => {
            const lastGoodState = { value: 'good' };
            const result = await RumiError.attemptRecovery('state-sync', new Error(), {
                lastGoodState
            });
            expect(result).toEqual(lastGoodState);
        });
        
        test('should initialize fresh state if no backup', async () => {
            const result = await RumiError.attemptRecovery('state-sync', new Error());
            expect(result).toHaveProperty('isActive', false);
        });
    });
    
    describe('timeline strategy', () => {
        test('should resume from last position', async () => {
            const lastPosition = { time: 100 };
            const result = await RumiError.attemptRecovery('timeline', new Error(), {
                lastPosition
            });
            expect(result).toEqual({
                type: 'resume',
                position: lastPosition
            });
        });
        
        test('should restart block if no position', async () => {
            const currentBlock = { id: 'block1' };
            const result = await RumiError.attemptRecovery('timeline', new Error(), {
                currentBlock
            });
            expect(result).toEqual({
                type: 'restart',
                block: currentBlock
            });
        });
    });
    
    describe('network strategy', () => {
        test('should handle timeout errors', async () => {
            const error = new Error();
            error.name = 'TimeoutError';
            
            const result = await RumiError.attemptRecovery('network', error, {
                timeout: 5000
            });
            
            expect(result).toEqual({
                type: 'retry',
                timeout: 7500
            });
        });
        
        test('should handle offline state', async () => {
            Object.defineProperty(navigator, 'onLine', {
                value: false,
                writable: true
            });
            
            const mockData = { lastSync: Date.now() };
            jest.spyOn(RumiError, 'loadFromCache')
                .mockResolvedValueOnce(mockData);
            
            const result = await RumiError.attemptRecovery('network', new Error());
            expect(result).toEqual({
                type: 'offline',
                lastSyncedData: mockData
            });
        });
    });
    
    // ================================
    // HELPER METHOD TESTS
    // ================================
    
    describe('clearOldCaches', () => {
        test('should clear non-essential caches', async () => {
            const mockCaches = {
                keys: jest.fn().mockResolvedValue(['rumi-temp', 'rumi-essential']),
                delete: jest.fn().mockResolvedValue(undefined)
            };
            
            global.caches = mockCaches;
            
            await RumiError.clearOldCaches();
            expect(mockCaches.delete).toHaveBeenCalledWith('rumi-temp');
            expect(mockCaches.delete).not.toHaveBeenCalledWith('rumi-essential');
        });
    });
    
    describe('repairData', () => {
        test('should remove null values from arrays', async () => {
            const data = [1, null, 2, undefined, 3];
            const result = await RumiError.repairData(data);
            expect(result).toEqual([1, 2, 3]);
        });
        
        test('should remove null values from objects', async () => {
            const data = {
                a: 1,
                b: null,
                c: 2,
                d: undefined
            };
            const result = await RumiError.repairData(data);
            expect(result).toEqual({
                a: 1,
                c: 2
            });
        });
    });
    
    // ================================
    // ERROR HISTORY TESTS
    // ================================
    
    describe('error history', () => {
        test('should maintain error history', () => {
            const error = new Error('test');
            const context = { source: 'test' };
            
            RumiError.logError(error, context);
            
            const history = RumiError.getErrorHistory();
            expect(history).toHaveLength(1);
            expect(history[0]).toMatchObject({
                error: 'test',
                context: { source: 'test' }
            });
        });
        
        test('should limit history size', () => {
            for (let i = 0; i < 100; i++) {
                RumiError.logError(new Error(`error${i}`));
            }
            
            const history = RumiError.getErrorHistory();
            expect(history).toHaveLength(50);
            expect(history[0].error).toBe('error99');
        });
    });
}); 