// ================================
// RUMI ANIMATIONS
// Animation utilities and effects
// ================================

class RumiAnimations {
    constructor() {
        this.animations = new Map();
        this.frameCallbacks = new Set();
        this.frameCount = 0;
        this.isRunning = false;
        
        // Animation settings
        this.settings = {
            targetFps: 60,
            frameInterval: 1000 / 60,
            throttleThreshold: 1000 / 30,
            batchSize: 5,
            maxSkippedFrames: 2
        };
    }
    
    // ================================
    // ANIMATION CONTROL
    // ================================
    
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        requestAnimationFrame(this.tick.bind(this));
    }
    
    stop() {
        this.isRunning = false;
    }
    
    tick(timestamp) {
        if (!this.isRunning) return;
        
        // Calculate frame delta
        const delta = timestamp - this.lastFrameTime;
        
        // Skip frame if too soon
        if (delta < this.settings.frameInterval) {
            requestAnimationFrame(this.tick.bind(this));
            return;
        }
        
        // Update animations
        this.updateAnimations(delta);
        
        // Call frame callbacks
        this.frameCallbacks.forEach(callback => {
            try {
                callback(delta);
            } catch (error) {
                console.error('🎯 ANIMATION: Frame callback error:', error);
            }
        });
        
        // Update frame count and time
        this.frameCount++;
        this.lastFrameTime = timestamp;
        
        // Request next frame
        requestAnimationFrame(this.tick.bind(this));
    }
    
    // ================================
    // ANIMATION MANAGEMENT
    // ================================
    
    addAnimation(options) {
        const id = Math.random().toString(36).substr(2, 9);
        this.animations.set(id, {
            ...options,
            startTime: performance.now(),
            isComplete: false
        });
        return id;
    }
    
    removeAnimation(id) {
        this.animations.delete(id);
    }
    
    updateAnimations(delta) {
        this.animations.forEach((animation, id) => {
            if (animation.isComplete) {
                this.removeAnimation(id);
                return;
            }
            
            const elapsed = performance.now() - animation.startTime;
            const progress = Math.min(elapsed / animation.duration, 1);
            
            try {
                animation.update(progress);
            } catch (error) {
                console.error('🎯 ANIMATION: Update error:', error);
                this.removeAnimation(id);
            }
            
            if (progress >= 1) {
                animation.isComplete = true;
            }
        });
    }
    
    // ================================
    // FRAME CALLBACKS
    // ================================
    
    addFrameCallback(callback) {
        this.frameCallbacks.add(callback);
    }
    
    removeFrameCallback(callback) {
        this.frameCallbacks.delete(callback);
    }
    
    // ================================
    // UTILITY FUNCTIONS
    // ================================
    
    easeInOut(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    
    lerp(start, end, t) {
        return start + (end - start) * t;
    }
}

// Create global instance
window.RumiAnimations = new RumiAnimations(); 