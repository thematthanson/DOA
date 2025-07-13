// ================================
// RUMI EVENT BUS
// Centralized event system for module communication
// ================================

window.RumiEvents = {
    listeners: new Map(),
    debug: true,

    // Subscribe to an event
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
        
        if (this.debug) console.log(`🎯 EVENT: Subscribed to ${event}`);
    },

    // Unsubscribe from an event
    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
                if (this.debug) console.log(`🎯 EVENT: Unsubscribed from ${event}`);
            }
        }
    },

    // Emit an event
    emit(event, data = null) {
        if (this.debug) console.log(`🎯 EVENT: Emitting ${event}`, data);
        
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`🎯 EVENT: Error in ${event} callback:`, error);
                }
            });
        }
    },

    // Clear all listeners for an event
    clear(event) {
        if (event) {
            this.listeners.delete(event);
            if (this.debug) console.log(`🎯 EVENT: Cleared all listeners for ${event}`);
        } else {
            this.listeners.clear();
            if (this.debug) console.log(`🎯 EVENT: Cleared all listeners`);
        }
    },

    // Get listener count for an event
    getListenerCount(event) {
        return this.listeners.has(event) ? this.listeners.get(event).length : 0;
    },

    // List all registered events
    getEvents() {
        return Array.from(this.listeners.keys());
    }
};

// Common event types
window.RumiEventTypes = {
    // Session events
    SESSION_START: 'session:start',
    SESSION_STOP: 'session:stop',
    SESSION_UPDATE: 'session:update',
    
    // Content events
    CONTENT_LOADED: 'content:loaded',
    CONTENT_PROGRESS: 'content:progress',
    CONTENT_COMPLETE: 'content:complete',
    
    // UI events
    UI_UPDATE: 'ui:update',
    UI_SECTION_CHANGE: 'ui:section:change',
    UI_ASCII_UPDATE: 'ui:ascii:update',
    
    // Backend events
    BACKEND_READY: 'backend:ready',
    BACKEND_ERROR: 'backend:error',
    BACKEND_DATA_UPDATE: 'backend:data:update',
    
    // Channel events
    CHANNEL_UPDATE: 'channel:update',
    CHANNEL_CONTENT_LOAD: 'channel:content:load',
    
    // Fast mode events
    FAST_MODE_ENABLE: 'fast:mode:enable',
    FAST_MODE_DISABLE: 'fast:mode:disable',
    
    // Debug events
    DEBUG_LOG: 'debug:log',
    DEBUG_ERROR: 'debug:error'
};

console.log('🎯 EVENT: Event bus initialized'); 