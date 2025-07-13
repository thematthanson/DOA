// ================================
// RUMI TIMELINE MANAGER
// Channel timeline and progression logic
// ================================

import { RumiError } from '../core/error-handling.js';
// State-management module registers a global instance on window.RumiState.
// Import the module for side-effects only, then alias the instance.
import '../core/state-management.js';
const RumiState = window.RumiState;

class RumiTimelineManager {
    constructor() {
        this.timeline = [];
        this.currentIndex = 0;
        this.totalDuration = 0;
        this.currentTime = 0;
        this.isActive = false;
        
        // Timeline markers
        this.markers = {
            time: [0, 30, 60, 90, 120, 180, 240],
            multiplier: [1.0, 1.1, 1.2, 1.4, 1.6, 1.8]
        };
        
        // Animation state
        this.animationFrame = null;
        this.lastUpdateTime = 0;
        
        // Event listeners
        this.listeners = new Map();
        
        // State synchronization
        this.syncWithState();
        
        // Last known good state
        this.lastGoodState = null;
    }
    
    // ================================
    // TIMELINE SETUP
    // ================================
    
    setTimeline(content, targetDuration = 240) {
        this.timeline = this.createTimelineFromContent(content, targetDuration);
        this.totalDuration = this.calculateTotalDuration();
        this.currentIndex = 0;
        this.currentTime = 0;
        
        console.log(`🎯 TIMELINE: Set timeline - ${this.timeline.length} blocks, ${this.totalDuration}min total`);
        this.notifyListeners('timelineSet', {
            timeline: this.timeline,
            totalDuration: this.totalDuration
        });
        
        return this.timeline;
    }
    
    createTimelineFromContent(content, targetDuration) {
        if (!content || content.length === 0) {
            return this.createDefaultTimeline(targetDuration);
        }
        
        const timeline = [];
        let currentTime = 0;
        
        content.forEach((item, index) => {
            const block = {
                id: `block-${index}`,
                title: item.title,
                service: item.service,
                genre: item.genre,
                duration: item.duration || 45,
                startTime: currentTime,
                endTime: currentTime + (item.duration || 45),
                index: index,
                type: 'content',
                data: item
            };
            
            timeline.push(block);
            currentTime += item.duration || 45;
        });
        
        // Add timeline markers
        this.addTimelineMarkers(timeline);
        
        return timeline;
    }
    
    createDefaultTimeline(duration) {
        const timeline = [];
        const blockCount = Math.ceil(duration / 45);
        
        for (let i = 0; i < blockCount; i++) {
            const block = {
                id: `default-block-${i}`,
                title: `Content Block ${i + 1}`,
                service: 'Default',
                genre: 'Mixed',
                duration: 45,
                startTime: i * 45,
                endTime: (i + 1) * 45,
                index: i,
                type: 'default',
                data: null
            };
            
            timeline.push(block);
        }
        
        this.addTimelineMarkers(timeline);
        return timeline;
    }
    
    addTimelineMarkers(timeline) {
        // Add time markers
        this.markers.time.forEach(time => {
            const marker = {
                id: `time-marker-${time}`,
                type: 'time-marker',
                time: time,
                position: time,
                label: this.formatTime(time)
            };
            
            timeline.push(marker);
        });
        
        // Add multiplier markers
        this.markers.multiplier.forEach((multiplier, index) => {
            const time = this.markers.time[index];
            const marker = {
                id: `multiplier-marker-${time}`,
                type: 'multiplier-marker',
                time: time,
                position: time,
                multiplier: multiplier,
                label: `${multiplier}x`
            };
            
            timeline.push(marker);
        });
        
        // Sort timeline by position
        timeline.sort((a, b) => a.position - b.position);
    }
    
    // ================================
    // TIMELINE PROGRESSION
    // ================================
    
    startTimeline() {
        if (this.isActive) {
            console.warn('Timeline already active');
            return false;
        }
        
        this.isActive = true;
        this.lastUpdateTime = performance.now();
        this.startAnimationLoop();
        
        console.log('🎯 TIMELINE: Started');
        this.notifyListeners('started', { startTime: Date.now() });
        
        return true;
    }
    
    stopTimeline() {
        if (!this.isActive) {
            console.warn('Timeline not active');
            return false;
        }
        
        this.isActive = false;
        this.stopAnimationLoop();
        
        console.log('🎯 TIMELINE: Stopped');
        this.notifyListeners('stopped', { stopTime: Date.now() });
        
        return true;
    }
    
    pauseTimeline() {
        if (!this.isActive) return false;
        
        this.stopAnimationLoop();
        
        console.log('🎯 TIMELINE: Paused');
        this.notifyListeners('paused', { pauseTime: Date.now() });
        
        return true;
    }
    
    resumeTimeline() {
        if (!this.isActive) return false;
        
        this.startAnimationLoop();
        
        console.log('🎯 TIMELINE: Resumed');
        this.notifyListeners('resumed', { resumeTime: Date.now() });
        
        return true;
    }
    
    // ================================
    // ANIMATION LOOP
    // ================================
    
    startAnimationLoop() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        const animate = (currentTime) => {
            if (!this.isActive || RumiState.getState('isPaused')) {
                return;
            }
            
            this.updateTimeline(currentTime);
            this.animationFrame = requestAnimationFrame(animate);
        };
        
        this.animationFrame = requestAnimationFrame(animate);
    }
    
    stopAnimationLoop() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }
    
    updateTimeline(currentTime) {
        if (!this.isActive) return;
        
        try {
            const deltaTime = currentTime - this.lastUpdateTime;
            this.lastUpdateTime = currentTime;
            
            // Update current time (convert ms → minutes), allow debug speed multiplier
            const scale = window.DEBUG_TIME_SCALE || 1;
            this.currentTime += (deltaTime / 60000) * scale;
            
            // Check for block changes
            const previousIndex = this.currentIndex;
            this.updateCurrentIndex();
            
            if (this.currentIndex !== previousIndex) {
                const currentBlock = this.getCurrentBlock();
                this.onBlockChange(currentBlock);
            }
            
            // Save good state after successful update
            this.lastGoodState = {
                currentTime: this.currentTime,
                currentIndex: this.currentIndex,
                lastUpdateTime: this.lastUpdateTime
            };
            
            // Update UI
            this.updateContentDisplay(this.getCurrentBlock());
            this.updateProgramTrack(this.getCurrentBlock());
            this.updateTimelineMarkers();
            this.updateProgressIndicators();

            // Auto-complete when end reached
            if (this.currentTime >= this.totalDuration) {
                this.stopTimeline();
                console.log('🎯 TIMELINE: Completed');
                this.notifyListeners('completed', { endTime: Date.now() });
            }
        } catch (error) {
            console.error('Timeline update error:', error);
            
            // Attempt recovery
            RumiError.attemptRecovery('timeline', error, {
                lastPosition: this.lastGoodState,
                currentBlock: this.getCurrentBlock()
            }).then(recovery => {
                if (recovery) {
                    if (recovery.type === 'resume') {
                        // Resume from last good state
                        Object.assign(this, recovery.position);
                        console.log('🎯 TIMELINE: Resumed from last good state');
                    } else if (recovery.type === 'restart') {
                        // Restart current block
                        this.jumpToBlock(this.currentIndex);
                        console.log('🎯 TIMELINE: Restarted current block');
                    }
                }
            }).catch(recoveryError => {
                console.error('Timeline recovery failed:', recoveryError);
                this.stopTimeline();
            });
        }
    }
    
    updateCurrentIndex() {
        const contentBlocks = this.timeline.filter(block => block.type === 'content');
        
        for (let i = 0; i < contentBlocks.length; i++) {
            const block = contentBlocks[i];
            
            if (this.currentTime >= block.startTime && this.currentTime < block.endTime) {
                if (this.currentIndex !== i) {
                    this.currentIndex = i;
                    this.onBlockChange(block);
                }
                break;
            }
        }
    }
    
    onBlockChange(block) {
        try {
            if (!block) {
                throw new Error('Invalid block data');
            }
            
            // Update state
            this.notifyListeners('blockChange', {
                block: block,
                index: this.currentIndex,
                time: this.currentTime
            });
            
            // Update displays
            this.updateContentDisplay(block);
            this.updateProgramTrack(block);
        } catch (error) {
            console.error('Block change error:', error);
            
            // Attempt recovery
            RumiError.attemptRecovery('timeline', error, {
                lastPosition: this.lastGoodState,
                currentBlock: block
            }).catch(recoveryError => {
                console.error('Block change recovery failed:', recoveryError);
            });
        }
    }
    
    // ================================
    // CONTENT DISPLAY UPDATES
    // ================================
    
    updateContentDisplay(currentBlock) {
        // Update program track
        this.updateProgramTrack(currentBlock);
        
        // Update timeline markers
        this.updateTimelineMarkers();
        
        // Update progress indicators
        this.updateProgressIndicators();
    }
    
    updateProgramTrack(currentBlock) {
        const programTrack = document.getElementById('program-track');
        if (!programTrack) return;
        
        // Highlight current block
        const blocks = programTrack.querySelectorAll('.program-item');
        blocks.forEach((block, index) => {
            if (index === currentBlock.index) {
                block.classList.add('active');
                block.classList.add('current');
            } else if (index < currentBlock.index) {
                block.classList.add('completed');
                block.classList.remove('active', 'current');
            } else {
                block.classList.remove('active', 'current', 'completed');
            }
        });
    }
    
    updateTimelineMarkers() {
        const timelineMarkers = document.querySelectorAll('.timeline-marker');
        timelineMarkers.forEach(marker => {
            const markerTime = parseInt(marker.dataset.time) || 0;
            
            if (this.currentTime >= markerTime) {
                marker.classList.add('active');
            } else {
                marker.classList.remove('active');
            }
        });
    }
    
    updateProgressIndicators() {
        const progress = (this.currentTime / this.totalDuration) * 100;
        
        // Update progress bar
        const progressBar = document.querySelector('.progress-bar-fill');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        // Update time display
        const timeDisplay = document.querySelector('.current-time');
        if (timeDisplay) {
            timeDisplay.textContent = this.formatTime(this.currentTime);
        }
    }
    
    // ================================
    // STATE SYNCHRONIZATION
    // ================================
    
    syncWithState() {
        // Get current state
        const stateIndex = RumiState.getState('channelIndex');
        if (stateIndex !== undefined) {
            this.currentIndex = stateIndex;
        }
        
        const stateContent = RumiState.getState('channelContent');
        if (stateContent) {
            this.timeline = this.createTimelineFromContent(stateContent);
            this.totalDuration = this.calculateTotalDuration();
            this.currentTime = 0;
        }
    }
    
    // ================================
    // TIMELINE NAVIGATION
    // ================================
    
    jumpToBlock(blockIndex) {
        if (blockIndex < 0 || blockIndex >= this.timeline.length) {
            console.warn(`Invalid block index: ${blockIndex}`);
            return false;
        }
        
        const block = this.timeline[blockIndex];
        this.currentIndex = blockIndex;
        this.currentTime = block.startTime;
        
        console.log(`🎯 TIMELINE: Jumped to block ${blockIndex} - ${block.title}`);
        this.notifyListeners('jumped', { block: block, index: blockIndex });
        
        return true;
    }
    
    jumpToTime(timeInMinutes) {
        if (timeInMinutes < 0) {
            console.warn(`Invalid time: ${timeInMinutes} minutes`);
            return false;
        }

        // If overshooting total duration, jump to end and complete
        if (timeInMinutes >= this.totalDuration) {
            this.currentTime = this.totalDuration;
            this.updateCurrentIndex();
            this.updateContentDisplay(this.getCurrentBlock());
            this.updateProgramTrack(this.getCurrentBlock());
            this.updateTimelineMarkers();
            this.updateProgressIndicators();
            this.stopTimeline();
            console.log('🎯 TIMELINE: Completed (overshoot)');
            this.notifyListeners('completed', { endTime: Date.now() });
            return true;
        }
        
        this.currentTime = timeInMinutes;
        this.updateCurrentIndex();
        
        console.log(`🎯 TIMELINE: Jumped to time ${timeInMinutes} minutes`);
        this.notifyListeners('timeJumped', { time: timeInMinutes });
        
        return true;
    }
    
    // ================================
    // UTILITY METHODS
    // ================================
    
    formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = Math.floor(minutes % 60);
        
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        } else {
            return `${mins}m`;
        }
    }
    
    calculateTotalDuration() {
        const contentBlocks = this.timeline.filter(block => block.type === 'content');
        return contentBlocks.reduce((total, block) => total + block.duration, 0);
    }
    
    getCurrentBlock() {
        const contentBlocks = this.timeline.filter(block => block.type === 'content');
        return contentBlocks[this.currentIndex] || null;
    }
    
    getProgress() {
        if (this.totalDuration === 0) return 0;
        return (this.currentTime / this.totalDuration) * 100;
    }
    
    getTimelineData() {
        return {
            timeline: this.timeline,
            currentIndex: this.currentIndex,
            currentTime: this.currentTime,
            totalDuration: this.totalDuration,
            progress: this.getProgress(),
            isActive: this.isActive
        };
    }
    
    // ================================
    // EVENT SYSTEM
    // ================================
    
    subscribe(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
        
        return () => {
            const callbacks = this.listeners.get(event);
            if (callbacks) {
                callbacks.delete(callback);
            }
        };
    }
    
    notifyListeners(event, data) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Timeline manager listener error:', error);
                }
            });
        }
    }
    
    // ================================
    // RESET AND CLEANUP
    // ================================
    
    reset() {
        this.stopTimeline();
        this.timeline = [];
        this.currentIndex = 0;
        this.totalDuration = 0;
        this.currentTime = 0;
        this.isActive = false;
        this.lastUpdateTime = 0;
        
        console.log('🎯 TIMELINE: Reset');
    }
}

// Global instance
window.RumiTimeline = new RumiTimelineManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RumiTimelineManager;
} 