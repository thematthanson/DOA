// ================================
// RUMI INDEXING ENGINE
// Core indexing logic and progression
// ================================

import RumiError from './error-handling.js';
import RumiState from './state-management.js';

class RumiIndexingEngine {
    constructor() {
        this.isRunning = false;
        this.startTime = null;
        this.lastUpdateTime = null;
        this.updateInterval = null;
        this.turboMultiplier = 1;
        
        // Indexing state
        this.currentBlock = 0;
        this.totalBlocks = 0;
        this.blockDuration = 0;
        this.blockStartTime = 0;
        
        // Performance tracking
        this.pointsEarned = 0;
        this.multiplier = 1.0;
        this.sessionTime = 0;
        
        // Content tracking
        this.currentContent = null;
        this.contentQueue = [];
        
        // Animation state
        this.animationFrame = null;
        this.lastAnimationTime = 0;
        this.animationInterval = 1000; // Assuming a default animation interval
        
        // Event listeners
        this.listeners = new Map();
    }
    
    // ================================
    // CORE INDEXING METHODS
    // ================================
    
    async startSession(mode = 'detection') {
        try {
        this.isRunning = true;
        this.startTime = Date.now();
        this.lastUpdateTime = Date.now();
        this.sessionTime = 0;
        this.pointsEarned = 0;
        this.currentBlock = 0;
        
        // Set content if provided
            if (this.currentContent) {
                this.setContent(this.currentContent);
        }
        
            // Start session in state manager
            await RumiState.startSession(mode);
        
            console.log('🎯 INDEXING: Session started in', mode, 'mode');
        } catch (error) {
            console.error('🎯 INDEXING: Failed to start session:', error);
            throw error;
    }
    }
    
    endSession(reason = 'completed') {
        try {
        this.isRunning = false;
        this.stopUpdateLoop();
        
        // Calculate final session time
        const sessionDuration = Date.now() - this.startTime;
        
            // End session in state manager
            RumiState.setState('sessionComplete', { reason });
        
        console.log(`🎯 INDEXING: Stopped - Duration: ${sessionDuration}ms, Points: ${this.pointsEarned}`);
        this.notifyListeners('stopped', { 
            duration: sessionDuration, 
            points: this.pointsEarned 
        });
        } catch (error) {
            console.error('🎯 INDEXING: Failed to end session:', error);
            throw error;
        }
    }
    
    pauseSession() {
        if (!this.isRunning || RumiState.getState('isPaused')) {
            return;
        }
        
        try {
            // Pause in state manager
            RumiState.setState('paused', true);
        
            console.log('🎯 INDEXING: Session paused');
        } catch (error) {
            console.error('🎯 INDEXING: Failed to pause session:', error);
            throw error;
        }
    }
    
    resumeSession() {
        if (!this.isRunning || !RumiState.getState('isPaused')) {
            return;
        }
        
        try {
            // Resume in state manager
            RumiState.setState('paused', false);
            
            console.log('🎯 INDEXING: Session resumed');
        } catch (error) {
            console.error('🎯 INDEXING: Failed to resume session:', error);
            throw error;
        }
    }
    
    // ================================
    // CONTENT LOGGING
    // ================================
    
    initializeContentLogging() {
        this.contentLog = {
            blocks: [],
            startTime: null,
            lastLogTime: null,
            totalDuration: 0,
            completedBlocks: 0
        };
    }

    logContentBlock(block, status = 'started') {
        if (!this.contentLog) {
            this.initializeContentLogging();
        }

        const timestamp = Date.now();
        const logEntry = {
            block: { ...block },
            status,
            timestamp,
            duration: block.duration_minutes || 45,
            blockIndex: this.currentBlock,
            totalBlocks: this.totalBlocks
        };

        // Add to log
        this.contentLog.blocks.push(logEntry);

        // Update log stats
        if (status === 'completed') {
            this.contentLog.completedBlocks++;
            this.contentLog.totalDuration += logEntry.duration;
        }

        // Update last log time
        this.contentLog.lastLogTime = timestamp;

        // Notify listeners
        this.notifyListeners('contentLogged', logEntry);
        
        console.log(`🎯 INDEXING: Block ${this.currentBlock + 1}/${this.totalBlocks} ${status} - ${block.title}`);
    }

    verifyContentLogging() {
        if (!this.contentLog) {
            return { verified: false, error: 'No content log available' };
        }

        const verification = {
            totalBlocks: this.totalBlocks,
            loggedBlocks: this.contentLog.blocks.length,
            completedBlocks: this.contentLog.completedBlocks,
            expectedDuration: this.totalDuration,
            loggedDuration: this.contentLog.totalDuration,
            verified: true,
            errors: []
        };

        // Check block count
        if (verification.loggedBlocks !== verification.totalBlocks) {
            verification.verified = false;
            verification.errors.push(`Block count mismatch: ${verification.loggedBlocks} logged vs ${verification.totalBlocks} total`);
        }

        // Check completed blocks
        if (verification.completedBlocks < verification.totalBlocks) {
            verification.verified = false;
            verification.errors.push(`Incomplete blocks: ${verification.completedBlocks} completed vs ${verification.totalBlocks} total`);
        }

        // Check duration
        if (Math.abs(verification.loggedDuration - verification.expectedDuration) > 5) {
            verification.verified = false;
            verification.errors.push(`Duration mismatch: ${verification.loggedDuration}min logged vs ${verification.expectedDuration}min expected`);
        }

        return verification;
    }
    
    // ================================
    // UPDATE LOOP
    // ================================
    
    startUpdateLoop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        // Initialize content logging
        this.initializeContentLogging();
        this.contentLog.startTime = Date.now();
        
        // Update interval based on turbo mode
        const updateInterval = this.turboMultiplier > 1 ? 50 : 100;
        
        // Update every interval for smooth progression
        this.updateInterval = setInterval(() => {
            this.updateIndexing();
        }, updateInterval);
        
        // Start animation loop
        this.startAnimationLoop();
        
        console.log('🎯 INDEXING: Update loop started');
    }
    
    stopUpdateLoop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }
    
    startAnimationLoop() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        const animate = (currentTime) => {
            if (!this.isRunning || RumiState.getState('isPaused')) {
                return;
            }
            
            // Calculate delta time for smooth animations
            const deltaTime = currentTime - this.lastAnimationTime;
            this.lastAnimationTime = currentTime;
            
            // Update visual elements
            this.updateAnimation(deltaTime);
            
            // Request next frame
            this.animationFrame = requestAnimationFrame(animate);
        };
        
        this.animationFrame = requestAnimationFrame(animate);
    }
    
    // ================================
    // INDEXING UPDATE LOGIC
    // ================================
    
    updateIndexing() {
        if (!this.isRunning || RumiState.getState('isPaused')) {
            return;
        }
        
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastUpdateTime;
        this.lastUpdateTime = currentTime;
        
        // Calculate session time
        this.sessionTime = currentTime - this.startTime;
        
        // Calculate points based on time
        const pointsThisUpdate = this.calculatePoints(deltaTime);
        this.pointsEarned += pointsThisUpdate;
        
        // Update multiplier based on session time
        this.updateMultiplier();
        
        // Update block progression
        this.updateBlockProgression();
        
        // Log current block if needed
        const currentBlock = this.contentQueue[this.currentBlock];
        if (currentBlock) {
            this.logContentBlock(currentBlock, 'in_progress');
        }
        
        // Update state
        RumiState.addPoints(pointsThisUpdate, 'indexing');
        RumiState.setMultiplier(this.multiplier);
        
        // Notify listeners
        this.notifyListeners('update', {
            sessionTime: this.sessionTime,
            points: this.pointsEarned,
            multiplier: this.multiplier,
            currentBlock: this.currentBlock,
            deltaTime: deltaTime
        });
    }
    
    updateAnimation(deltaTime) {
        if (!this.isRunning || !this.currentContent) {
            return;
        }
        
        // Calculate current block progress
        const blockElapsed = (Date.now() - this.blockStartTime) / (1000 * 60); // Minutes
        const currentBlock = this.contentQueue[this.currentBlock];
        const blockDuration = currentBlock ? (currentBlock.duration_minutes || 45) : this.blockDuration;
        const blockProgress = Math.min(blockElapsed / blockDuration, 1);
        
        // Calculate total progress
        const completedDuration = this.contentQueue
            .slice(0, this.currentBlock)
            .reduce((sum, item) => sum + (item.duration_minutes || 45), 0);
        const currentBlockContribution = blockProgress * blockDuration;
        const totalProgress = this.totalDuration > 0 ?
            ((completedDuration + currentBlockContribution) / this.totalDuration) * 100 : 0;
        
        // Update state with progress
        RumiState.update({
            channelProgress: totalProgress,
            channelBlockStartTime: this.blockStartTime,
            channelBlockDuration: blockDuration
        });
        
        // Notify listeners of animation update
        this.notifyListeners('animationUpdate', {
            blockProgress: blockProgress,
            totalProgress: totalProgress,
            currentTime: completedDuration + currentBlockContribution,
            deltaTime: deltaTime
        });
    }
    
    // ================================
    // POINTS AND MULTIPLIER CALCULATION
    // ================================
    
    calculatePoints(deltaTime) {
        if (!this.isRunning || !this.currentContent) {
            return 0;
        }
        
        // Base points per minute
        const basePointsPerMinute = 0.1;
        
        // Convert delta time to minutes
        const minutes = deltaTime / (1000 * 60);
        
        // Calculate points with multiplier
        const points = basePointsPerMinute * minutes * this.multiplier * this.turboMultiplier;
        
        return points;
    }
    
    updateMultiplier() {
        const sessionMinutes = this.sessionTime / (1000 * 60);
        
        // Multiplier increases every 30 minutes
        const multiplierSteps = [
            { time: 0, value: 1.0 },
            { time: 30, value: 1.1 },
            { time: 60, value: 1.2 },
            { time: 90, value: 1.4 },
            { time: 120, value: 1.6 },
            { time: 180, value: 1.8 },
            { time: 240, value: 2.0 }
        ];
        
        // Find the highest applicable multiplier
        for (let i = multiplierSteps.length - 1; i >= 0; i--) {
            if (sessionMinutes >= multiplierSteps[i].time) {
                this.multiplier = multiplierSteps[i].value;
                break;
            }
        }
    }
    
    // ================================
    // BLOCK PROGRESSION
    // ================================
    
    setContent(content) {
        this.currentContent = content;
        this.contentQueue = Array.isArray(content) ? [...content] : [content];
        this.totalBlocks = this.contentQueue.length;
        this.currentBlock = 0;
        this.blockStartTime = Date.now();
        
        // Calculate durations
        if (this.totalBlocks > 0) {
            this.totalDuration = this.contentQueue.reduce((sum, item) => sum + (item.duration_minutes || 45), 0);
            this.blockDuration = Math.floor(this.totalDuration / this.totalBlocks);
            
            // Set initial block duration
            const firstBlock = this.contentQueue[0];
            const initialBlockDuration = firstBlock ? (firstBlock.duration_minutes || 45) : this.blockDuration;
            
            // Update state
            RumiState.update({
                channelContent: this.contentQueue,
                channelIndex: 0,
                channelBlockStartTime: this.blockStartTime,
                channelBlockDuration: initialBlockDuration,
                channelTotalDuration: this.totalDuration,
                channelProgress: 0
            });
        }
        
        console.log(`🎯 INDEXING: Content set - ${this.totalBlocks} blocks, ${this.totalDuration}min total`);
        this.notifyListeners('contentSet', { 
            content: this.contentQueue,
            totalBlocks: this.totalBlocks,
            totalDuration: this.totalDuration,
            blockDuration: this.blockDuration
        });
    }
    
    updateBlockProgression() {
        if (!this.currentContent || this.totalBlocks === 0) {
            return;
        }
        
        const currentBlock = this.contentQueue[this.currentBlock];
        const blockDuration = currentBlock ? (currentBlock.duration_minutes || 45) : this.blockDuration;
        const blockElapsed = (Date.now() - this.blockStartTime) / (1000 * 60); // Minutes
        
        // Check if current block should complete
        if (blockElapsed >= blockDuration && this.currentBlock < this.totalBlocks - 1) {
            this.advanceToNextBlock();
        }
    }
    
    advanceToNextBlock() {
        // Log completion of current block
        const currentBlock = this.contentQueue[this.currentBlock];
        if (currentBlock) {
            this.logContentBlock(currentBlock, 'completed');
        }

        this.currentBlock++;
            this.blockStartTime = Date.now();
            
        const newBlock = this.contentQueue[this.currentBlock];
        const blockDuration = newBlock ? (newBlock.duration_minutes || 45) : this.blockDuration;
        
        // Calculate progress
        const completedDuration = this.contentQueue
            .slice(0, this.currentBlock)
            .reduce((sum, item) => sum + (item.duration_minutes || 45), 0);
        const totalProgress = this.totalDuration > 0 ?
            (completedDuration / this.totalDuration) * 100 : 0;
        
        // Update state
        RumiState.update({
            channelIndex: this.currentBlock,
            channelProgress: totalProgress,
            channelBlockStartTime: this.blockStartTime,
            channelBlockDuration: blockDuration
        });
        
        // Log start of new block
        if (newBlock) {
            this.logContentBlock(newBlock, 'started');
        }
            
            console.log(`🎯 INDEXING: Advanced to block ${this.currentBlock + 1}/${this.totalBlocks}`);
            this.notifyListeners('blockAdvanced', {
                block: this.currentBlock,
                totalBlocks: this.totalBlocks,
            content: newBlock,
            progress: totalProgress,
            blockDuration: blockDuration
            });
            
        // Check for show interrupt
            this.checkForShowInterrupt();
    }
    
    // ================================
    // SHOW INTERRUPT DETECTION
    // ================================
    
    checkForShowInterrupt() {
        const currentBlock = this.contentQueue[this.currentBlock];
        if (!currentBlock) return;
        
        // Check if we should interrupt based on content
        const shouldInterrupt = this.shouldInterruptForContent(currentBlock);
        
        if (shouldInterrupt) {
            RumiState.handleShowInterrupt(currentBlock);
        
            console.log(`🎯 INDEXING: Show interrupt triggered for ${currentBlock.title}`);
            this.notifyListeners('showInterrupt', {
                block: this.currentBlock,
                content: currentBlock
            });
    }
    }
    
    shouldInterruptForContent(content) {
        if (!content) return false;
        
        // Add your interrupt detection logic here
        // For example, check for specific genres, high-value content, etc.
        return false;
    }
    
    // ================================
    // TURBO MODE
    // ================================
    
    setTurboMode(enabled) {
        const prevState = this.turboMultiplier > 1;
        
        // Set turbo multiplier
        this.turboMultiplier = enabled ? 2 : 1;
        
        // Update block duration for faster progression
        if (this.totalBlocks > 0) {
            const baseBlockDuration = Math.floor(this.totalDuration / this.totalBlocks);
            this.blockDuration = enabled ? baseBlockDuration / 2 : baseBlockDuration;
        }
        
        // Update state
        RumiState.setState('turboMode', enabled);
        
        // Update animation speed
        if (enabled !== prevState) {
            this.updateAnimationSpeed(enabled);
        }
        
        console.log(`🎯 INDEXING: Turbo mode ${enabled ? 'enabled' : 'disabled'} (${this.turboMultiplier}x)`);
        this.notifyListeners('turboModeChanged', { 
            enabled: enabled, 
            multiplier: this.turboMultiplier,
            blockDuration: this.blockDuration
        });
    }
    
    updateAnimationSpeed(turboEnabled) {
        // Update animation frame timing
        if (turboEnabled) {
            this.animationInterval = Math.floor(this.animationInterval / 2);
            this.lastAnimationTime = Date.now();
        } else {
            this.animationInterval = Math.floor(this.animationInterval * 2);
            this.lastAnimationTime = Date.now();
        }

        // Update UI elements for turbo mode
        const nokiaSection = document.querySelector('.nokia-visual');
        const progressBar = document.querySelector('.progress-bar');
        
        if (nokiaSection) {
            nokiaSection.style.transition = `all ${turboEnabled ? '0.1s' : '0.3s'} ease`;
        }
        
        if (progressBar) {
            progressBar.style.transition = `width ${turboEnabled ? '0.1s' : '0.3s'} linear`;
        }
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
                    console.error('Indexing engine listener error:', error);
                }
            });
        }
    }
    
    // ================================
    // UTILITY METHODS
    // ================================
    
    getStatus() {
        return {
            isRunning: this.isRunning,
            isPaused: RumiState.getState('isPaused'),
            sessionTime: this.sessionTime,
            pointsEarned: this.pointsEarned,
            multiplier: this.multiplier,
            currentBlock: this.currentBlock,
            totalBlocks: this.totalBlocks,
            turboMode: this.turboMultiplier > 1
        };
    }
    
    getProgress() {
        if (this.totalBlocks === 0) return 0;
        return (this.currentBlock / this.totalBlocks) * 100;
    }
    
    reset() {
        this.endSession();
        this.isRunning = false;
        this.startTime = null;
        this.lastUpdateTime = null;
        this.currentBlock = 0;
        this.totalBlocks = 0;
        this.blockDuration = 0;
        this.blockStartTime = 0;
        this.pointsEarned = 0;
        this.multiplier = 1.0;
        this.sessionTime = 0;
        this.currentContent = null;
        this.contentQueue = [];
        this.turboMultiplier = 1;
        
        console.log('🎯 INDEXING: Reset');
    }
}

// Global instance
window.RumiIndexing = new RumiIndexingEngine();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RumiIndexingEngine;
} 