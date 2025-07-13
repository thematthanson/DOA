// ================================
// RUMI PERFORMANCE MONITOR TESTS
// Test suite for performance monitoring
// ================================

import monitor from '../core/performance-monitor.js';

describe('RumiPerformanceMonitor', () => {
    beforeEach(() => {
        monitor.reset();
    });
    
    // ================================
    // METRIC TRACKING TESTS
    // ================================
    
    describe('metric tracking', () => {
        test('should track timing metrics', () => {
            monitor.startMetric('test');
            const duration = monitor.endMetric('test');
            expect(duration).toBeGreaterThan(0);
        });
        
        test('should handle missing metrics gracefully', () => {
            const duration = monitor.endMetric('nonexistent');
            expect(duration).toBe(0);
        });
        
        test('should record single values', () => {
            monitor.recordMetric('memory', 1024);
            const stats = monitor.getStats('memory');
            expect(stats.recent).toBe(1024);
        });
        
        test('should maintain history limit', () => {
            for (let i = 0; i < 150; i++) {
                monitor.recordMetric('test', i);
            }
            const stats = monitor.getStats('test');
            expect(stats.count).toBeLessThanOrEqual(100);
        });
    });
    
    // ================================
    // THRESHOLD TESTS
    // ================================
    
    describe('thresholds', () => {
        test('should detect threshold violations', () => {
            const violations = [];
            monitor.addListener(event => violations.push(event));
            
            monitor.setThreshold('test', 100);
            monitor.recordMetric('test', 150);
            
            expect(violations.length).toBe(1);
            expect(violations[0]).toMatchObject({
                type: 'threshold_exceeded',
                metric: 'test',
                value: 150,
                threshold: 100
            });
        });
        
        test('should not trigger on values below threshold', () => {
            const violations = [];
            monitor.addListener(event => violations.push(event));
            
            monitor.setThreshold('test', 100);
            monitor.recordMetric('test', 50);
            
            expect(violations.length).toBe(0);
        });
        
        test('should handle multiple listeners', () => {
            const violations1 = [];
            const violations2 = [];
            
            monitor.addListener(event => violations1.push(event));
            monitor.addListener(event => violations2.push(event));
            
            monitor.setThreshold('test', 100);
            monitor.recordMetric('test', 150);
            
            expect(violations1.length).toBe(1);
            expect(violations2.length).toBe(1);
        });
        
        test('should remove listeners', () => {
            const violations = [];
            const listener = event => violations.push(event);
            
            monitor.addListener(listener);
            monitor.removeListener(listener);
            
            monitor.setThreshold('test', 100);
            monitor.recordMetric('test', 150);
            
            expect(violations.length).toBe(0);
        });
    });
    
    // ================================
    // STATISTICS TESTS
    // ================================
    
    describe('statistics', () => {
        test('should calculate basic statistics', () => {
            monitor.recordMetric('test', 10);
            monitor.recordMetric('test', 20);
            monitor.recordMetric('test', 30);
            
            const stats = monitor.getStats('test');
            expect(stats).toMatchObject({
                min: 10,
                max: 30,
                avg: 20,
                median: 20,
                count: 3
            });
        });
        
        test('should handle empty metrics', () => {
            const stats = monitor.getStats('nonexistent');
            expect(stats).toBeNull();
        });
        
        test('should calculate percentiles correctly', () => {
            for (let i = 1; i <= 100; i++) {
                monitor.recordMetric('test', i);
            }
            
            const stats = monitor.getStats('test');
            expect(stats.p95).toBe(95);
        });
    });
    
    // ================================
    // PROBLEM DETECTION TESTS
    // ================================
    
    describe('problem detection', () => {
        test('should identify problem metrics', () => {
            monitor.setThreshold('cpu', 80);
            monitor.setThreshold('memory', 1000);
            
            monitor.recordMetric('cpu', 90);
            monitor.recordMetric('memory', 800);
            
            const problems = monitor.getProblems();
            expect(problems.length).toBe(1);
            expect(problems[0].metric).toBe('cpu');
        });
        
        test('should sort problems by severity', () => {
            monitor.setThreshold('metric1', 100);
            monitor.setThreshold('metric2', 100);
            
            monitor.recordMetric('metric1', 150); // 1.5x threshold
            monitor.recordMetric('metric2', 300); // 3x threshold
            
            const problems = monitor.getProblems();
            expect(problems[0].metric).toBe('metric2');
            expect(problems[1].metric).toBe('metric1');
        });
        
        test('should ignore metrics without thresholds', () => {
            monitor.recordMetric('test', 1000);
            const problems = monitor.getProblems();
            expect(problems.length).toBe(0);
        });
    });
    
    // ================================
    // ERROR HANDLING TESTS
    // ================================
    
    describe('error handling', () => {
        test('should handle listener errors gracefully', () => {
            const errorListener = () => {
                throw new Error('Test error');
            };
            const goodListener = jest.fn();
            
            monitor.addListener(errorListener);
            monitor.addListener(goodListener);
            
            monitor.setThreshold('test', 100);
            monitor.recordMetric('test', 150);
            
            expect(goodListener).toHaveBeenCalled();
        });
        
        test('should handle invalid metric values', () => {
            expect(() => {
                monitor.recordMetric('test', NaN);
            }).not.toThrow();
            
            const stats = monitor.getStats('test');
            expect(stats.count).toBe(1);
        });
    });
}); 