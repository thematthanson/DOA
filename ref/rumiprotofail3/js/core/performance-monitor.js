// ================================
// RUMI PERFORMANCE MONITOR
// Track and analyze system performance
// ================================

class RumiPerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.thresholds = new Map();
        this.history = new Map();
        this.listeners = new Set();
        
        // Initialize default thresholds
        this.setThreshold('stateSync', 100); // ms
        this.setThreshold('channelLoad', 200); // ms
        this.setThreshold('animationFrame', 16.67); // ms (60fps)
        this.setThreshold('memoryUsage', 50 * 1024 * 1024); // 50MB
    }
    
    // ================================
    // METRIC TRACKING
    // ================================
    
    /**
     * Start timing a metric
     * @param {string} name - Metric name
     */
    startMetric(name) {
        this.metrics.set(name, {
            startTime: performance.now(),
            measurements: []
        });
    }
    
    /**
     * End timing a metric and record result
     * @param {string} name - Metric name
     * @returns {number} Duration in ms
     */
    endMetric(name) {
        const metric = this.metrics.get(name);
        if (!metric) return 0;
        
        const duration = performance.now() - metric.startTime;
        metric.measurements.push(duration);
        
        // Keep history of last 100 measurements
        if (!this.history.has(name)) {
            this.history.set(name, []);
        }
        const history = this.history.get(name);
        history.push(duration);
        if (history.length > 100) history.shift();
        
        // Check threshold
        const threshold = this.thresholds.get(name);
        if (threshold && duration > threshold) {
            this.notifyListeners({
                type: 'threshold_exceeded',
                metric: name,
                value: duration,
                threshold
            });
        }
        
        return duration;
    }
    
    /**
     * Record a single metric value
     * @param {string} name - Metric name
     * @param {number} value - Metric value
     */
    recordMetric(name, value) {
        if (!this.history.has(name)) {
            this.history.set(name, []);
        }
        const history = this.history.get(name);
        history.push(value);
        if (history.length > 100) history.shift();
        
        const threshold = this.thresholds.get(name);
        if (threshold && value > threshold) {
            this.notifyListeners({
                type: 'threshold_exceeded',
                metric: name,
                value,
                threshold
            });
        }
    }
    
    // ================================
    // ANALYSIS
    // ================================
    
    /**
     * Get statistics for a metric
     * @param {string} name - Metric name
     * @returns {Object} Statistics object
     */
    getStats(name) {
        const history = this.history.get(name) || [];
        if (history.length === 0) return null;
        
        const sorted = [...history].sort((a, b) => a - b);
        const sum = sorted.reduce((a, b) => a + b, 0);
        
        return {
            min: sorted[0],
            max: sorted[sorted.length - 1],
            avg: sum / sorted.length,
            median: sorted[Math.floor(sorted.length / 2)],
            p95: sorted[Math.floor(sorted.length * 0.95)],
            count: sorted.length,
            recent: history[history.length - 1]
        };
    }
    
    /**
     * Get all metrics that exceeded their thresholds
     * @returns {Array} Array of problem metrics
     */
    getProblems() {
        const problems = [];
        for (const [name, history] of this.history.entries()) {
            const threshold = this.thresholds.get(name);
            if (!threshold) continue;
            
            const recent = history[history.length - 1];
            if (recent > threshold) {
                problems.push({
                    metric: name,
                    value: recent,
                    threshold,
                    ratio: recent / threshold
                });
            }
        }
        return problems.sort((a, b) => b.ratio - a.ratio);
    }
    
    // ================================
    // CONFIGURATION
    // ================================
    
    /**
     * Set threshold for a metric
     * @param {string} name - Metric name
     * @param {number} value - Threshold value
     */
    setThreshold(name, value) {
        this.thresholds.set(name, value);
    }
    
    /**
     * Add listener for threshold violations
     * @param {Function} callback
     */
    addListener(callback) {
        this.listeners.add(callback);
    }
    
    /**
     * Remove performance listener
     * @param {Function} callback
     */
    removeListener(callback) {
        this.listeners.delete(callback);
    }
    
    /**
     * Notify all listeners of an event
     * @param {Object} event - Event object
     */
    notifyListeners(event) {
        for (const listener of this.listeners) {
            try {
                listener(event);
            } catch (error) {
                console.error('Error in performance listener:', error);
            }
        }
    }
    
    /**
     * Clear all metrics and history
     */
    reset() {
        this.metrics.clear();
        this.history.clear();
    }
}

// Create singleton instance
const monitor = new RumiPerformanceMonitor();
export default monitor; 