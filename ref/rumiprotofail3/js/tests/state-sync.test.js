// ================================
// RUMI STATE SYNC TESTS
// Test suite for state synchronization
// ================================

import RumiSync from '../core/state-sync.js';
import RumiCache from '../core/cache-manager.js';

describe('RumiStateSyncManager', () => {
    beforeEach(() => {
        // Reset state before each test
        RumiSync.version = 0;
        RumiSync.pendingChanges.clear();
        RumiSync.stateVersions.clear();
    });
    
    // ================================
    // STATE VERSIONING TESTS
    // ================================
    
    describe('state versioning', () => {
        test('should increment version on save', async () => {
            const state = { value: 1 };
            const version = await RumiSync.saveState(state);
            expect(version).toBe(1);
            expect(RumiSync.version).toBe(1);
        });
        
        test('should maintain version history', async () => {
            await RumiSync.saveState({ value: 1 });
            await RumiSync.saveState({ value: 2 });
            
            const state1 = await RumiSync.loadState(1);
            const state2 = await RumiSync.loadState(2);
            
            expect(state1.value).toBe(1);
            expect(state2.value).toBe(2);
        });
        
        test('should limit version history size', async () => {
            for (let i = 0; i < 15; i++) {
                await RumiSync.saveState({ value: i });
            }
            
            expect(RumiSync.stateVersions.size).toBeLessThanOrEqual(10);
            expect(RumiSync.loadState(1)).rejects.toThrow();
        });
        
        test('should cache versions', async () => {
            const state = { value: 'test' };
            await RumiSync.saveState(state);
            
            const cached = await RumiCache.get('state', 'state_v1');
            expect(cached.state.value).toBe('test');
        });
    });
    
    // ================================
    // CHANGE TRACKING TESTS
    // ================================
    
    describe('change tracking', () => {
        test('should track changes', () => {
            RumiSync.trackChange('test', 123);
            expect(RumiSync.pendingChanges.get('test')).toMatchObject({
                key: 'test',
                value: 123
            });
        });
        
        test('should apply changes in order', async () => {
            RumiSync.trackChange('counter', 1);
            RumiSync.trackChange('counter', 2);
            RumiSync.trackChange('counter', 3);
            
            const state = await RumiSync.applyChanges({});
            expect(state.counter).toBe(3);
        });
        
        test('should clear pending changes after apply', async () => {
            RumiSync.trackChange('test', 123);
            await RumiSync.applyChanges({});
            expect(RumiSync.pendingChanges.size).toBe(0);
        });
        
        test('should validate changes before applying', async () => {
            RumiSync.trackChange('points', -1); // Invalid value
            await expect(RumiSync.applyChanges({})).rejects.toThrow();
        });
    });
    
    // ================================
    // CONFLICT RESOLUTION TESTS
    // ================================
    
    describe('conflict resolution', () => {
        test('should detect conflicts', () => {
            const state = { value: 1 };
            const change = { key: 'value', value: 2 };
            
            const conflict = RumiSync.detectConflict(state, change);
            expect(conflict).toMatchObject({
                key: 'value',
                current: 1,
                incoming: change
            });
        });
        
        test('should resolve numeric conflicts', async () => {
            const state = { points: 100 };
            RumiSync.trackChange('points', 150);
            
            const newState = await RumiSync.applyChanges(state);
            expect(newState.points).toBe(150);
        });
        
        test('should merge array conflicts', async () => {
            const state = { items: [1, 2] };
            RumiSync.trackChange('items', [2, 3]);
            
            const newState = await RumiSync.applyChanges(state);
            expect(newState.items).toEqual([1, 2, 3]);
        });
        
        test('should merge object conflicts', async () => {
            const state = { user: { name: 'John' } };
            RumiSync.trackChange('user', { age: 30 });
            
            const newState = await RumiSync.applyChanges(state);
            expect(newState.user).toEqual({
                name: 'John',
                age: 30
            });
        });
    });
    
    // ================================
    // STATE VALIDATION TESTS
    // ================================
    
    describe('state validation', () => {
        test('should validate session state', async () => {
            const state = {
                isActive: true,
                sessionStartTime: null
            };
            
            await expect(RumiSync.validateState(state))
                .rejects.toThrow('Active session must have start time');
        });
        
        test('should validate points', async () => {
            const state = {
                totalPoints: -10,
                currentMultiplier: 1
            };
            
            await expect(RumiSync.validateState(state))
                .rejects.toThrow('Total points cannot be negative');
        });
        
        test('should validate channel state', async () => {
            const state = {
                channelExpanded: true,
                channelContent: []
            };
            
            await expect(RumiSync.validateState(state))
                .rejects.toThrow('Expanded channel must have content');
        });
        
        test('should validate change before applying', async () => {
            RumiSync.trackChange('channelIndex', -1);
            
            await expect(RumiSync.applyChanges({}))
                .rejects.toThrow('Channel index cannot be negative');
        });
    });
    
    // ================================
    // ERROR RECOVERY TESTS
    // ================================
    
    describe('error recovery', () => {
        test('should recover from validation errors', async () => {
            const goodState = {
                isActive: true,
                sessionStartTime: Date.now()
            };
            
            await RumiSync.saveState(goodState);
            
            const badState = {
                isActive: true,
                sessionStartTime: null
            };
            
            try {
                await RumiSync.validateState(badState);
            } catch (error) {
                const recovered = await RumiSync.loadState(RumiSync.version);
                expect(recovered).toEqual(goodState);
            }
        });
        
        test('should recover from apply errors', async () => {
            const initialState = { counter: 0 };
            await RumiSync.saveState(initialState);
            
            RumiSync.trackChange('points', -1); // Invalid change
            
            try {
                await RumiSync.applyChanges(initialState);
            } catch (error) {
                const recovered = await RumiSync.loadState(RumiSync.version);
                expect(recovered).toEqual(initialState);
            }
        });
        
        test('should maintain last good state', async () => {
            const state1 = { value: 1 };
            const state2 = { value: 2 };
            
            await RumiSync.saveState(state1);
            await RumiSync.saveState(state2);
            
            // Simulate error and recovery
            try {
                await RumiSync.validateState({ value: null });
            } catch (error) {
                const recovered = await RumiSync.loadState(RumiSync.version);
                expect(recovered).toEqual(state2);
            }
        });
    });
}); 