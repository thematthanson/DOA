// ================================
// RUMI STATE SYNC MANAGER
// State synchronization and conflict resolution
// ================================

// Note: This file is loaded in browser environment, so we'll use global references
// instead of ES6 imports to avoid module loading issues

class RumiStateSyncManager {
    constructor() {
        this.version = 0;
        this.pendingChanges = new Map();
        this.stateVersions = new Map();
        this.conflictHandlers = new Map();
        this.validators = new Map();
        
        // Initialize conflict handlers
        this.initializeConflictHandlers();
        
        // Initialize validators
        this.initializeValidators();
        
        console.log('🎯 SYNC: Manager initialized');
    }
    
    async initialize(initialState) {
        try {
            // Save the initial state as version 1
            await this.saveState(initialState);
            console.log('🎯 SYNC: Initial state saved as version 1');
        } catch (error) {
            console.error('🎯 SYNC: Failed to initialize with state:', error);
        }
    }
    
    // ================================
    // STATE VERSIONING
    // ================================
    
    async saveState(state, source = 'main') {
        try {
            // Increment version
            this.version++;
            
            // Create versioned state
            const versionedState = {
                version: this.version,
                timestamp: Date.now(),
                source: source,
                state: { ...state }
            };
            
            // Save to version history
            this.stateVersions.set(this.version, versionedState);
            
            // Trim old versions (keep last 10)
            while (this.stateVersions.size > 10) {
                const oldestVersion = Math.min(...this.stateVersions.keys());
                this.stateVersions.delete(oldestVersion);
            }
            
            // Cache state
            if (window.RumiCache) {
                await window.RumiCache.set('state', `state_v${this.version}`, versionedState);
            }
            
            console.log(`🎯 SYNC: Saved state version ${this.version}`);
            return this.version;
        } catch (error) {
            console.error('🎯 SYNC: Failed to save state:', error);
            throw error;
        }
    }
    
    async loadState(version = null) {
        try {
            if (version === null) {
                version = this.version;
            }
            
            // Return initial state if version is 0
            if (version === 0) {
                return {
                    mode: 'detected',
                    sessionTime: 0,
                    multiplier: 1.0,
                    points: 0,
                    chainBonus: 0,
                    intelligence: 'Content Intelligence',
                    paused: false,
                    blockProgression: {
                        type: 'normal',
                        blocks: [],
                        delay: 1000
                    }
                };
            }
            
            // Try memory first
            let versionedState = this.stateVersions.get(version);
            
            // Try cache if not in memory
            if (!versionedState && window.RumiCache) {
                versionedState = await window.RumiCache.get('state', `state_v${version}`);
            }
            
            if (!versionedState) {
                throw new Error(`State version ${version} not found`);
            }
            
            return versionedState.state;
        } catch (error) {
            console.error('🎯 SYNC: Failed to load state:', error);
            throw error;
        }
    }
    
    // ================================
    // CHANGE TRACKING
    // ================================
    
    trackChange(key, value, source = 'main') {
        const change = {
            key,
            value,
            source,
            timestamp: Date.now(),
            version: this.version
        };
        
        this.pendingChanges.set(key, change);
    }
    
    async applyChanges(state) {
        const changes = Array.from(this.pendingChanges.values());
        
        // Sort changes by timestamp
        changes.sort((a, b) => a.timestamp - b.timestamp);
        
        for (const change of changes) {
            try {
                // Validate change
                await this.validateChange(change);
                
                // Check for conflicts
                const conflict = this.detectConflict(state, change);
                if (conflict) {
                    state = await this.resolveConflict(state, conflict);
                    continue;
                }
                
                // Apply change
                state[change.key] = change.value;
            } catch (error) {
                console.error(`🎯 SYNC: Failed to apply change to ${change.key}:`, error);
                
                // Attempt recovery
                let recovery = null;
                if (window.RumiError) {
                    recovery = await window.RumiError.attemptRecovery('state-sync', error, {
                        state,
                        change,
                        lastGoodState: await this.loadState(this.version - 1)
                    });
                }
                
                if (recovery) {
                    state = recovery;
                }
            }
        }
        
        // Clear applied changes
        this.pendingChanges.clear();
        
        return state;
    }
    
    // ================================
    // CONFLICT HANDLING
    // ================================
    
    initializeConflictHandlers() {
        // Handle numeric value conflicts
        this.conflictHandlers.set('numeric', (current, incoming) => {
            // Take the larger value for points
            if (incoming.key.includes('points')) {
                return Math.max(current, incoming.value);
            }
            // Take the more recent value for timestamps
            if (incoming.key.includes('time')) {
                return incoming.value;
            }
            // Default to incoming value
            return incoming.value;
        });
        
        // Handle array merges
        this.conflictHandlers.set('array', (current, incoming) => {
            // Merge unique values
            return [...new Set([...current, ...incoming.value])];
        });
        
        // Handle object merges
        this.conflictHandlers.set('object', (current, incoming) => {
            return {
                ...current,
                ...incoming.value
            };
        });
    }
    
    detectConflict(state, change) {
        const currentValue = state[change.key];
        
        // No conflict if key doesn't exist
        if (currentValue === undefined) {
            return null;
        }
        
        // Check if values are different
        if (JSON.stringify(currentValue) === JSON.stringify(change.value)) {
            return null;
        }
        
        return {
            key: change.key,
            current: currentValue,
            incoming: change
        };
    }
    
    async resolveConflict(state, conflict) {
        const { key, current, incoming } = conflict;
        
        try {
            // Determine value type
            const valueType = Array.isArray(current) ? 'array' :
                            typeof current === 'number' ? 'numeric' :
                            typeof current === 'object' ? 'object' : 'default';
            
            // Get appropriate handler
            const handler = this.conflictHandlers.get(valueType);
            
            if (handler) {
                state[key] = handler(current, incoming);
                console.log(`🎯 SYNC: Resolved ${valueType} conflict for ${key}`);
            } else {
                // Default to incoming value
                state[key] = incoming.value;
                console.log(`🎯 SYNC: Used default resolution for ${key}`);
            }
        } catch (error) {
            console.error(`🎯 SYNC: Conflict resolution failed for ${key}:`, error);
            
            // On error, keep current value
            state[key] = current;
        }
        
        return state;
    }
    
    // ================================
    // STATE VALIDATION
    // ================================
    
    initializeValidators() {
        // Validate session state
        this.validators.set('session', state => {
            if (state.isActive && !state.sessionStartTime) {
                throw new Error('Active session must have start time');
            }
            if (state.sessionEndTime && state.sessionStartTime > state.sessionEndTime) {
                throw new Error('Session end time must be after start time');
            }
            return true;
        });
        
        // Validate points and multipliers
        this.validators.set('points', state => {
            if (state.totalPoints < 0) {
                throw new Error('Total points cannot be negative');
            }
            if (state.currentMultiplier < 1) {
                throw new Error('Multiplier cannot be less than 1');
            }
            return true;
        });
        
        // Validate channel state
        this.validators.set('channel', state => {
            if (state.channelExpanded && !state.channelContent?.length) {
                throw new Error('Expanded channel must have content');
            }
            if (state.channelIndex < 0) {
                throw new Error('Channel index cannot be negative');
            }
            return true;
        });
    }
    
    async validateChange(change) {
        // Find relevant validators
        const relevantValidators = Array.from(this.validators.entries())
            .filter(([key]) => change.key.toLowerCase().includes(key));
        
        // Apply all relevant validators
        for (const [type, validator] of relevantValidators) {
            try {
                await validator({ [change.key]: change.value });
            } catch (error) {
                console.error(`🎯 SYNC: Validation failed (${type}) for ${change.key}:`, error);
                throw error;
            }
        }
        
        return true;
    }
    
    async validateState(state) {
        // Apply all validators
        for (const [type, validator] of this.validators) {
            try {
                await validator(state);
            } catch (error) {
                console.error(`🎯 SYNC: State validation failed (${type}):`, error);
                throw error;
            }
        }
        
        return true;
    }
}

// Create singleton instance and make globally available
const RumiSync = new RumiStateSyncManager();
window.RumiSync = RumiSync; 