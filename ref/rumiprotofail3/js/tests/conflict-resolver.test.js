// ================================
// RUMI CONFLICT RESOLVER TESTS
// Test suite for conflict resolution
// ================================

import resolver from '../core/conflict-resolver.js';

describe('RumiConflictResolver', () => {
    // ================================
    // NUMERIC RESOLUTION TESTS
    // ================================
    
    describe('numeric resolution', () => {
        test('should take max for scores', () => {
            const result = resolver.resolve(100, 150, { key: 'userScore' });
            expect(result).toBe(150);
        });
        
        test('should prefer incoming for indexes', () => {
            const result = resolver.resolve(5, 3, { key: 'currentIndex' });
            expect(result).toBe(3);
        });
        
        test('should take max for timestamps', () => {
            const now = Date.now();
            const past = now - 1000;
            const result = resolver.resolve(past, now, { key: 'lastUpdateTime' });
            expect(result).toBe(now);
        });
    });
    
    // ================================
    // ARRAY RESOLUTION TESTS
    // ================================
    
    describe('array resolution', () => {
        test('should merge and deduplicate IDs', () => {
            const current = ['a', 'b', 'c'];
            const incoming = ['b', 'c', 'd'];
            const result = resolver.resolve(current, incoming, { key: 'userIds' });
            expect(result).toEqual(['a', 'b', 'c', 'd']);
        });
        
        test('should preserve order for sequences', () => {
            const current = [1, 2, 3];
            const incoming = [3, 4, 5];
            const result = resolver.resolve(current, incoming, { key: 'playOrder' });
            expect(result).toEqual([3, 4, 5, 1, 2]);
        });
        
        test('should concatenate for stacks', () => {
            const current = ['a', 'b'];
            const incoming = ['c', 'd'];
            const result = resolver.resolve(current, incoming, { key: 'messageStack' });
            expect(result).toEqual(['a', 'b', 'c', 'd']);
        });
        
        test('should smart merge object arrays', () => {
            const current = [
                { id: 1, name: 'John' },
                { id: 2, name: 'Jane' }
            ];
            const incoming = [
                { id: 2, age: 30 },
                { id: 3, name: 'Bob' }
            ];
            const result = resolver.resolve(current, incoming, { key: 'users' });
            expect(result).toEqual([
                { id: 1, name: 'John' },
                { id: 2, name: 'Jane', age: 30 },
                { id: 3, name: 'Bob' }
            ]);
        });
    });
    
    // ================================
    // OBJECT RESOLUTION TESTS
    // ================================
    
    describe('object resolution', () => {
        test('should prefer incoming for metadata', () => {
            const current = { version: 1, type: 'user' };
            const incoming = { version: 2, status: 'active' };
            const result = resolver.resolve(current, incoming, { key: 'metadata' });
            expect(result).toEqual({
                version: 2,
                type: 'user',
                status: 'active'
            });
        });
        
        test('should deep merge state objects', () => {
            const current = {
                user: { name: 'John' },
                settings: { theme: 'dark' }
            };
            const incoming = {
                user: { age: 30 },
                settings: { sound: 'on' }
            };
            const result = resolver.resolve(current, incoming, { key: 'appState' });
            expect(result).toEqual({
                user: { name: 'John', age: 30 },
                settings: { theme: 'dark', sound: 'on' }
            });
        });
        
        test('should prioritize current for preferences', () => {
            const current = { theme: 'dark', fontSize: 14 };
            const incoming = { theme: 'light', sound: 'on' };
            const result = resolver.resolve(current, incoming, { key: 'preferences' });
            expect(result).toEqual({
                theme: 'dark',
                fontSize: 14,
                sound: 'on'
            });
        });
    });
    
    // ================================
    // STRING RESOLUTION TESTS
    // ================================
    
    describe('string resolution', () => {
        test('should prefer incoming for content', () => {
            const result = resolver.resolve('old', 'new', { key: 'messageContent' });
            expect(result).toBe('new');
        });
        
        test('should keep current for IDs', () => {
            const result = resolver.resolve('abc123', 'def456', { key: 'userId' });
            expect(result).toBe('abc123');
        });
    });
    
    // ================================
    // BOOLEAN RESOLUTION TESTS
    // ================================
    
    describe('boolean resolution', () => {
        test('should OR flags', () => {
            expect(resolver.resolve(true, false, { key: 'isEnabled' })).toBe(true);
            expect(resolver.resolve(false, true, { key: 'isEnabled' })).toBe(true);
            expect(resolver.resolve(false, false, { key: 'isEnabled' })).toBe(false);
        });
        
        test('should AND validity', () => {
            expect(resolver.resolve(true, true, { key: 'isValid' })).toBe(true);
            expect(resolver.resolve(true, false, { key: 'isValid' })).toBe(false);
            expect(resolver.resolve(false, true, { key: 'isValid' })).toBe(false);
        });
    });
    
    // ================================
    // EDGE CASE TESTS
    // ================================
    
    describe('edge cases', () => {
        test('should handle null values', () => {
            expect(resolver.resolve(null, 'new')).toBe('new');
            expect(resolver.resolve('current', null)).toBe('current');
            expect(resolver.resolve(null, null)).toBeNull();
        });
        
        test('should handle undefined values', () => {
            expect(resolver.resolve(undefined, 'new')).toBe('new');
            expect(resolver.resolve('current', undefined)).toBe('current');
            expect(resolver.resolve(undefined, undefined)).toBeUndefined();
        });
        
        test('should handle empty arrays', () => {
            expect(resolver.resolve([], [1, 2])).toEqual([1, 2]);
            expect(resolver.resolve([1, 2], [])).toEqual([1, 2]);
            expect(resolver.resolve([], [])).toEqual([]);
        });
        
        test('should handle empty objects', () => {
            expect(resolver.resolve({}, { a: 1 })).toEqual({ a: 1 });
            expect(resolver.resolve({ a: 1 }, {})).toEqual({ a: 1 });
            expect(resolver.resolve({}, {})).toEqual({});
        });
    });
    
    // ================================
    // PERFORMANCE TESTS
    // ================================
    
    describe('performance', () => {
        test('should handle large arrays efficiently', () => {
            const size = 1000;
            const current = Array.from({ length: size }, (_, i) => ({ id: i, value: i }));
            const incoming = Array.from({ length: size }, (_, i) => ({ id: i, updated: true }));
            
            const start = performance.now();
            const result = resolver.resolve(current, incoming, { key: 'items' });
            const duration = performance.now() - start;
            
            expect(duration).toBeLessThan(100); // Should complete in under 100ms
            expect(result).toHaveLength(size);
            expect(result[0]).toEqual({ id: 0, value: 0, updated: true });
        });
        
        test('should handle deep object merges efficiently', () => {
            const createDeepObject = (depth) => {
                let obj = { value: depth };
                if (depth > 0) {
                    obj.nested = createDeepObject(depth - 1);
                }
                return obj;
            };
            
            const current = createDeepObject(10);
            const incoming = createDeepObject(10);
            
            const start = performance.now();
            const result = resolver.resolve(current, incoming, { key: 'deepState' });
            const duration = performance.now() - start;
            
            expect(duration).toBeLessThan(50); // Should complete in under 50ms
            expect(result.nested.nested.nested).toBeDefined();
        });
    });
}); 