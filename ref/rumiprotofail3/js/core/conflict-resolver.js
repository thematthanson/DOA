// ================================
// RUMI CONFLICT RESOLVER
// Resolve state conflicts with type-specific strategies
// ================================

import monitor from './performance-monitor.js';

class RumiConflictResolver {
    constructor() {
        this.strategies = new Map();
        this.initializeStrategies();
    }
    
    // ================================
    // STRATEGY INITIALIZATION
    // ================================
    
    initializeStrategies() {
        // Numeric values
        this.strategies.set('number', {
            detect: value => typeof value === 'number',
            resolve: (current, incoming, context) => {
                // For scores and points, take max
                if (context.key.includes('score') || context.key.includes('points')) {
                    return Math.max(current, incoming);
                }
                // For indexes and counts, prefer incoming
                if (context.key.includes('index') || context.key.includes('count')) {
                    return incoming;
                }
                // For timestamps, take most recent
                if (context.key.includes('time') || context.key.includes('date')) {
                    return Math.max(current, incoming);
                }
                // Default to incoming value
                return incoming;
            }
        });
        
        // Array values
        this.strategies.set('array', {
            detect: value => Array.isArray(value),
            resolve: (current, incoming, context) => {
                monitor.startMetric('arrayMerge');
                
                let result;
                // For unique collections, merge and deduplicate
                if (context.key.includes('ids') || context.key.includes('keys')) {
                    result = [...new Set([...current, ...incoming])];
                }
                // For ordered lists, prefer incoming order but keep unique items
                else if (context.key.includes('order') || context.key.includes('sequence')) {
                    const seen = new Set();
                    result = [...incoming, ...current].filter(item => {
                        if (seen.has(item)) return false;
                        seen.add(item);
                        return true;
                    });
                }
                // For stacks and queues, concatenate
                else if (context.key.includes('stack') || context.key.includes('queue')) {
                    result = [...current, ...incoming];
                }
                // Default to smart merge
                else {
                    result = this.smartArrayMerge(current, incoming);
                }
                
                monitor.endMetric('arrayMerge');
                return result;
            }
        });
        
        // Object values
        this.strategies.set('object', {
            detect: value => value && typeof value === 'object',
            resolve: (current, incoming, context) => {
                monitor.startMetric('objectMerge');
                
                let result;
                // For metadata, prefer incoming
                if (context.key.includes('meta') || context.key.includes('config')) {
                    result = { ...current, ...incoming };
                }
                // For nested state, deep merge
                else if (context.key.includes('state') || context.key.includes('data')) {
                    result = this.deepMerge(current, incoming);
                }
                // For user preferences, merge with current priority
                else if (context.key.includes('preferences') || context.key.includes('settings')) {
                    result = { ...incoming, ...current };
                }
                // Default to deep merge
                else {
                    result = this.deepMerge(current, incoming);
                }
                
                monitor.endMetric('objectMerge');
                return result;
            }
        });
        
        // String values
        this.strategies.set('string', {
            detect: value => typeof value === 'string',
            resolve: (current, incoming, context) => {
                // For text content, prefer incoming
                if (context.key.includes('content') || context.key.includes('text')) {
                    return incoming;
                }
                // For IDs and keys, keep current
                if (context.key.includes('id') || context.key.includes('key')) {
                    return current;
                }
                // Default to incoming
                return incoming;
            }
        });
        
        // Boolean values
        this.strategies.set('boolean', {
            detect: value => typeof value === 'boolean',
            resolve: (current, incoming, context) => {
                // For flags and toggles, OR the values
                if (context.key.includes('flag') || context.key.includes('enabled')) {
                    return current || incoming;
                }
                // For validity and completion, AND the values
                if (context.key.includes('valid') || context.key.includes('completed')) {
                    return current && incoming;
                }
                // Default to incoming
                return incoming;
            }
        });
    }
    
    // ================================
    // RESOLUTION METHODS
    // ================================
    
    /**
     * Resolve conflict between two values
     * @param {*} current - Current value
     * @param {*} incoming - Incoming value
     * @param {Object} context - Resolution context
     * @returns {*} Resolved value
     */
    resolve(current, incoming, context = {}) {
        monitor.startMetric('conflictResolution');
        
        // Handle null/undefined
        if (current === null || current === undefined) return incoming;
        if (incoming === null || incoming === undefined) return current;
        
        // Find appropriate strategy
        for (const [_, strategy] of this.strategies) {
            if (strategy.detect(current) && strategy.detect(incoming)) {
                const result = strategy.resolve(current, incoming, context);
                monitor.endMetric('conflictResolution');
                return result;
            }
        }
        
        // Default to incoming value
        monitor.endMetric('conflictResolution');
        return incoming;
    }
    
    /**
     * Smart merge for arrays with object elements
     * @param {Array} current - Current array
     * @param {Array} incoming - Incoming array
     * @returns {Array} Merged array
     */
    smartArrayMerge(current, incoming) {
        // If arrays contain primitives, concatenate and deduplicate
        if (current.every(item => typeof item !== 'object')) {
            return [...new Set([...current, ...incoming])];
        }
        
        // For arrays of objects, merge by ID if possible
        const merged = new Map();
        
        // Add current items
        for (const item of current) {
            const id = this.getItemId(item);
            if (id) merged.set(id, item);
        }
        
        // Merge incoming items
        for (const item of incoming) {
            const id = this.getItemId(item);
            if (id) {
                const existing = merged.get(id);
                if (existing) {
                    merged.set(id, this.deepMerge(existing, item));
                } else {
                    merged.set(id, item);
                }
            } else {
                // No ID, just append
                merged.set(Symbol(), item);
            }
        }
        
        return Array.from(merged.values());
    }
    
    /**
     * Deep merge two objects
     * @param {Object} current - Current object
     * @param {Object} incoming - Incoming object
     * @returns {Object} Merged object
     */
    deepMerge(current, incoming) {
        const result = { ...current };
        
        for (const [key, value] of Object.entries(incoming)) {
            if (key in result) {
                result[key] = this.resolve(result[key], value, { key });
            } else {
                result[key] = value;
            }
        }
        
        return result;
    }
    
    /**
     * Get ID from object using common ID fields
     * @param {Object} item - Object to get ID from
     * @returns {string|null} ID value or null
     */
    getItemId(item) {
        if (!item || typeof item !== 'object') return null;
        
        const idFields = ['id', '_id', 'uid', 'key', 'name'];
        for (const field of idFields) {
            if (field in item && item[field]) {
                return item[field].toString();
            }
        }
        
        return null;
    }
}

// Create singleton instance
const resolver = new RumiConflictResolver();
export default resolver; 