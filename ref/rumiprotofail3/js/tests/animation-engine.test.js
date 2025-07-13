// ================================
// RUMI ANIMATION ENGINE TESTS
// Test suite for animation system
// ================================

import animator from '../core/animation-engine.js';
import messageBus from '../core/message-bus.js';

describe('RumiAnimationEngine', () => {
    beforeEach(() => {
        animator.stop();
        animator.animations.clear();
        animator.frameCallbacks.clear();
        animator.frameCount = 0;
        animator.updateSettings({
            targetFps: 60,
            frameInterval: 1000 / 60,
            throttleThreshold: 1000 / 30,
            batchSize: 5,
            maxSkippedFrames: 2
        });
    });
    
    // ================================
    // ANIMATION CONTROL TESTS
    // ================================
    
    describe('animation control', () => {
        test('should start and stop animation loop', () => {
            expect(animator.isRunning).toBe(false);
            
            animator.start();
            expect(animator.isRunning).toBe(true);
            
            animator.stop();
            expect(animator.isRunning).toBe(false);
        });
        
        test('should not start multiple loops', () => {
            const spy = jest.spyOn(window, 'requestAnimationFrame');
            
            animator.start();
            animator.start();
            
            expect(spy).toHaveBeenCalledTimes(1);
            spy.mockRestore();
        });
        
        test('should process frame callbacks', () => {
            const callback = jest.fn();
            animator.onFrame(callback);
            
            // Simulate frame
            animator.start();
            jest.advanceTimersByTime(16);
            
            expect(callback).toHaveBeenCalled();
        });
        
        test('should remove frame callbacks', () => {
            const callback = jest.fn();
            animator.onFrame(callback);
            animator.offFrame(callback);
            
            // Simulate frame
            animator.start();
            jest.advanceTimersByTime(16);
            
            expect(callback).not.toHaveBeenCalled();
        });
    });
    
    // ================================
    // ANIMATION MANAGEMENT TESTS
    // ================================
    
    describe('animation management', () => {
        test('should create and track animations', () => {
            const update = jest.fn();
            const id = animator.animate({
                start: 0,
                end: 100,
                duration: 1000,
                update
            });
            
            expect(animator.animations.has(id)).toBe(true);
            expect(animator.animations.get(id)).toMatchObject({
                start: 0,
                end: 100,
                duration: 1000,
                elapsed: 0
            });
        });
        
        test('should cancel animations', () => {
            const id = animator.animate({
                start: 0,
                end: 100,
                update: jest.fn()
            });
            
            animator.cancel(id);
            expect(animator.animations.has(id)).toBe(false);
        });
        
        test('should complete animations', async () => {
            const update = jest.fn();
            const id = animator.animate({
                start: 0,
                end: 100,
                duration: 100,
                update
            });
            
            // Wait for animation to complete
            await new Promise(resolve => setTimeout(resolve, 150));
            
            expect(animator.animations.has(id)).toBe(false);
            expect(update).toHaveBeenCalledWith(100);
        });
        
        test('should handle multiple animations', () => {
            const count = 10;
            const ids = new Set();
            
            for (let i = 0; i < count; i++) {
                const id = animator.animate({
                    start: 0,
                    end: 100,
                    update: jest.fn()
                });
                ids.add(id);
            }
            
            expect(animator.animations.size).toBe(count);
            ids.forEach(id => {
                expect(animator.animations.has(id)).toBe(true);
            });
        });
    });
    
    // ================================
    // PERFORMANCE TESTS
    // ================================
    
    describe('performance', () => {
        test('should batch process animations', () => {
            const batchSize = 5;
            animator.updateSettings({ batchSize });
            
            // Create more animations than batch size
            const count = batchSize * 2;
            for (let i = 0; i < count; i++) {
                animator.animate({
                    start: 0,
                    end: 100,
                    update: jest.fn()
                });
            }
            
            // Simulate frame
            const timestamp = performance.now();
            animator.tick(timestamp);
            
            expect(animator.animations.size).toBe(count);
        });
        
        test('should handle performance drops', () => {
            const listener = jest.fn();
            messageBus.subscribe(animator.topics.performanceDrop, listener);
            
            // Simulate slow frame
            const timestamp = performance.now() + 100; // 100ms frame time
            animator.tick(timestamp);
            
            expect(listener).toHaveBeenCalledWith(
                expect.any(Object),
                expect.objectContaining({
                    frameTime: expect.any(Number),
                    skippedFrames: expect.any(Number)
                })
            );
        });
        
        test('should adjust settings for performance', () => {
            const originalInterval = animator.settings.frameInterval;
            
            // Create many animations
            for (let i = 0; i < 100; i++) {
                animator.animate({
                    start: 0,
                    end: 100,
                    update: jest.fn()
                });
            }
            
            // Simulate very slow frame
            const timestamp = performance.now() + 200; // 200ms frame time
            animator.tick(timestamp);
            
            expect(animator.settings.frameInterval).toBeGreaterThan(originalInterval);
            expect(animator.settings.batchSize).toBeLessThan(5);
        });
    });
    
    // ================================
    // ANIMATION BEHAVIOR TESTS
    // ================================
    
    describe('animation behavior', () => {
        test('should apply easing functions', () => {
            const easings = ['linear', 'easeIn', 'easeOut', 'easeInOut'];
            const progress = 0.5;
            
            const results = easings.map(easing => 
                animator.applyEasing(progress, easing)
            );
            
            // Verify each easing produces different results
            const unique = new Set(results);
            expect(unique.size).toBe(easings.length);
        });
        
        test('should interpolate values', () => {
            const start = 0;
            const end = 100;
            const progress = 0.5;
            
            const result = animator.defaultInterpolator(start, end, progress);
            expect(result).toBe(50);
        });
        
        test('should handle custom interpolators', () => {
            const customInterpolator = jest.fn((start, end, progress) => {
                return start + (end - start) * (progress * 2);
            });
            
            animator.animate({
                start: 0,
                end: 100,
                interpolate: customInterpolator,
                update: jest.fn()
            });
            
            // Simulate frame
            animator.tick(performance.now() + 16);
            
            expect(customInterpolator).toHaveBeenCalled();
        });
    });
    
    // ================================
    // MESSAGING TESTS
    // ================================
    
    describe('messaging', () => {
        test('should publish frame completion', () => {
            const listener = jest.fn();
            messageBus.subscribe(animator.topics.frameComplete, listener);
            
            // Simulate frame
            animator.tick(performance.now() + 16);
            
            expect(listener).toHaveBeenCalledWith(
                expect.any(Object),
                expect.objectContaining({
                    frameTime: expect.any(Number),
                    frameCount: expect.any(Number),
                    activeAnimations: expect.any(Number)
                })
            );
        });
        
        test('should publish animation completion', async () => {
            const listener = jest.fn();
            messageBus.subscribe(animator.topics.animationComplete, listener);
            
            const id = animator.animate({
                start: 0,
                end: 100,
                duration: 100,
                update: jest.fn()
            });
            
            // Wait for animation to complete
            await new Promise(resolve => setTimeout(resolve, 150));
            
            expect(listener).toHaveBeenCalledWith(
                expect.any(Object),
                expect.objectContaining({ id })
            );
        });
    });
    
    // ================================
    // ERROR HANDLING TESTS
    // ================================
    
    describe('error handling', () => {
        test('should handle callback errors', () => {
            const errorCallback = () => {
                throw new Error('Test error');
            };
            const goodCallback = jest.fn();
            
            animator.onFrame(errorCallback);
            animator.onFrame(goodCallback);
            
            // Simulate frame
            animator.tick(performance.now());
            
            expect(goodCallback).toHaveBeenCalled();
        });
        
        test('should handle animation errors', () => {
            const errorUpdate = () => {
                throw new Error('Test error');
            };
            const id = animator.animate({
                start: 0,
                end: 100,
                update: errorUpdate
            });
            
            // Simulate frame
            animator.tick(performance.now());
            
            expect(animator.animations.has(id)).toBe(false);
        });
    });
}); 