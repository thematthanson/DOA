// Event Bus for Rumi Extension
// Provides centralized event management across all modules

class RumiEventBus {
    constructor() {
        this.events = {};
        this.debug = false;
    }

    // Subscribe to an event
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
        
        if (this.debug) {
            console.log(`[EventBus] Subscribed to: ${event}`);
        }
    }

    // Unsubscribe from an event
    off(event, callback) {
        if (!this.events[event]) return;
        
        const index = this.events[event].indexOf(callback);
        if (index > -1) {
            this.events[event].splice(index, 1);
        }
        
        if (this.debug) {
            console.log(`[EventBus] Unsubscribed from: ${event}`);
        }
    }

    // Emit an event
    emit(event, data) {
        if (!this.events[event]) return;
        
        if (this.debug) {
            console.log(`[EventBus] Emitting: ${event}`, data);
        }
        
        this.events[event].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`[EventBus] Error in event handler for ${event}:`, error);
            }
        });
    }

    // Clear all events
    clear() {
        this.events = {};
        if (this.debug) {
            console.log('[EventBus] All events cleared');
        }
    }

    // Enable/disable debug logging
    setDebug(enabled) {
        this.debug = enabled;
    }
}

// Create global event bus instance
window.RumiEvents = new RumiEventBus();

// Enable debug in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.RumiEvents.setDebug(true);
} 