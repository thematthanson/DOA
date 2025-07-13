// ================================
// RUMI ANIMATION ENGINE
// Optimized animation system with performance monitoring
// ================================

import monitor from './performance-monitor.js';
import messageBus from './message-bus.js';

class RumiAnimationEngine {
    constructor() {
        this.animations = new Map();
        this.frameCallbacks = new Set();
        this.isRunning = false;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        
        // Animation settings
        this.settings = {
            targetFps: 60,
            frameInterval: 1000 / 60,
            throttleThreshold: 1000 / 30, // Throttle below 30fps
            batchSize: 5, // Max animations to process per frame
            maxSkippedFrames: 2
        };
        
        // Performance monitoring
        monitor.setThreshold('frameTime', this.settings.frameInterval * 1.2); // 20% buffer
        monitor.setThreshold('animationCount', 100);
        monitor.setThreshold('skippedFrames', this.settings.maxSkippedFrames);
        
        // Message bus topics
        this.topics = {
            frameComplete: 'animation:frame',
            performanceDrop: 'animation:performance',
            animationComplete: 'animation:complete'
        };
    }
    
    // ================================
    // ANIMATION CONTROL
    // ================================
    
    /**
     * Start animation loop
     */
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        requestAnimationFrame(this.tick.bind(this));
    }
    
    /**
     * Stop animation loop
     */
    stop() {
        this.isRunning = false;
    }
    
    /**
     * Main animation tick
     * @private
     */
    tick(timestamp) {
        if (!this.isRunning) return;
        
        monitor.startMetric('frameTime');
        this.frameCount++;
        
        // Calculate frame timing
        const deltaTime = timestamp - this.lastFrameTime;
        const skippedFrames = Math.floor(deltaTime / this.settings.frameInterval) - 1;
        
        // Check for performance issues
        if (skippedFrames > 0) {
            monitor.recordMetric('skippedFrames', skippedFrames);
            if (skippedFrames >= this.settings.maxSkippedFrames) {
                this.handlePerformanceDrop(deltaTime, skippedFrames);
            }
        }
        
        // Process animations in batches
        const activeAnimations = Array.from(this.animations.entries());
        monitor.recordMetric('animationCount', activeAnimations.length);
        
        for (let i = 0; i < activeAnimations.length; i += this.settings.batchSize) {
            const batch = activeAnimations.slice(i, i + this.settings.batchSize);
            this.processBatch(batch, deltaTime);
            
            // Check if we're exceeding frame budget
            if (performance.now() - timestamp > this.settings.frameInterval) {
                break;
            }
        }
        
        // Run frame callbacks
        this.frameCallbacks.forEach(callback => {
            try {
                callback(deltaTime);
            } catch (error) {
                console.error('Frame callback error:', error);
            }
        });
        
        // Publish frame completion
        messageBus.publish(this.topics.frameComplete, {
            frameTime: deltaTime,
            frameCount: this.frameCount,
            activeAnimations: this.animations.size
        });
        
        this.lastFrameTime = timestamp;
        monitor.endMetric('frameTime');
        
        // Schedule next frame
        requestAnimationFrame(this.tick.bind(this));
    }
    
    /**
     * Process a batch of animations
     * @param {Array} batch - Batch of animations to process
     * @param {number} deltaTime - Time since last frame
     * @private
     */
    processBatch(batch, deltaTime) {
        for (const [id, animation] of batch) {
            try {
                const completed = this.updateAnimation(animation, deltaTime);
                if (completed) {
                    this.animations.delete(id);
                    messageBus.publish(this.topics.animationComplete, { id });
                }
            } catch (error) {
                console.error('Animation update error:', error);
                this.animations.delete(id);
            }
        }
    }
    
    /**
     * Update single animation
     * @param {Object} animation - Animation object
     * @param {number} deltaTime - Time since last frame
     * @returns {boolean} Whether animation is complete
     * @private
     */
    updateAnimation(animation, deltaTime) {
        // Update progress
        animation.elapsed += deltaTime;
        const progress = Math.min(1, animation.elapsed / animation.duration);
        
        // Apply easing
        const easedProgress = this.applyEasing(progress, animation.easing);
        
        // Calculate current value
        const current = animation.interpolate(animation.start, animation.end, easedProgress);
        
        // Update element
        animation.update(current);
        
        return progress >= 1;
    }
    
    // ================================
    // ANIMATION MANAGEMENT
    // ================================
    
    /**
     * Add new animation
     * @param {Object} config - Animation configuration
     * @returns {string} Animation ID
     */
    animate(config) {
        const id = crypto.randomUUID();
        
        this.animations.set(id, {
            start: config.start,
            end: config.end,
            duration: config.duration || 300,
            elapsed: 0,
            easing: config.easing || 'linear',
            interpolate: config.interpolate || this.defaultInterpolator,
            update: config.update
        });
        
        if (!this.isRunning) this.start();
        return id;
    }
    
    /**
     * Cancel animation by ID
     * @param {string} id - Animation ID
     */
    cancel(id) {
        this.animations.delete(id);
    }
    
    /**
     * Add per-frame callback
     * @param {Function} callback - Frame callback
     */
    onFrame(callback) {
        this.frameCallbacks.add(callback);
    }
    
    /**
     * Remove per-frame callback
     * @param {Function} callback - Frame callback
     */
    offFrame(callback) {
        this.frameCallbacks.delete(callback);
    }
    
    // ================================
    // PERFORMANCE OPTIMIZATION
    // ================================
    
    /**
     * Handle performance degradation
     * @param {number} frameTime - Current frame time
     * @param {number} skippedFrames - Number of skipped frames
     * @private
     */
    handlePerformanceDrop(frameTime, skippedFrames) {
        // Notify about performance issues
        messageBus.publish(this.topics.performanceDrop, {
            frameTime,
            skippedFrames,
            targetInterval: this.settings.frameInterval,
            activeAnimations: this.animations.size
        });
        
        // Attempt to improve performance
        if (this.animations.size > 50) {
            // Reduce batch size
            this.settings.batchSize = Math.max(1, this.settings.batchSize - 1);
        }
        
        if (frameTime > this.settings.throttleThreshold) {
            // Increase frame interval (reduce target FPS)
            this.settings.frameInterval = Math.min(
                1000 / 30, // Don't go below 30fps
                this.settings.frameInterval * 1.2
            );
        }
    }
    
    /**
     * Update animation settings
     * @param {Object} settings - New settings
     */
    updateSettings(settings) {
        this.settings = {
            ...this.settings,
            ...settings
        };
        
        // Update related thresholds
        monitor.setThreshold('frameTime', this.settings.frameInterval * 1.2);
        monitor.setThreshold('skippedFrames', this.settings.maxSkippedFrames);
    }
    
    // ================================
    // UTILITIES
    // ================================
    
    /**
     * Default value interpolator
     * @param {number} start - Start value
     * @param {number} end - End value
     * @param {number} progress - Animation progress
     * @returns {number} Interpolated value
     */
    defaultInterpolator(start, end, progress) {
        return start + (end - start) * progress;
    }
    
    /**
     * Apply easing function
     * @param {number} progress - Linear progress
     * @param {string} easing - Easing name
     * @returns {number} Eased progress
     */
    applyEasing(progress, easing) {
        switch (easing) {
            case 'easeIn':
                return progress * progress;
            case 'easeOut':
                return 1 - (1 - progress) * (1 - progress);
            case 'easeInOut':
                return progress < 0.5
                    ? 2 * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            default:
                return progress;
        }
    }
    
    /**
     * Get animation statistics
     * @returns {Object} Animation stats
     */
    getStats() {
        return {
            activeAnimations: this.animations.size,
            frameCount: this.frameCount,
            settings: { ...this.settings },
            performance: {
                frameTime: monitor.getStats('frameTime'),
                skippedFrames: monitor.getStats('skippedFrames'),
                animationCount: monitor.getStats('animationCount')
            }
        };
    }
}

// Create singleton instance
const animator = new RumiAnimationEngine();
export default animator; 