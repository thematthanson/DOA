// ================================
// RUMI GENRE CHANNEL ENGINE
// Genre-based content progression
// ================================

class RumiGenreChannelEngine {
    constructor() {
        this.isActive = false;
        this.startTime = null;
        this.genre = null;
        this.sessionType = 'detection';
        this.chainCount = 0;
        
        // Content state
        this.content = [];
        this.currentBlock = 0;
        this.totalBlocks = 0;
        this.blockDuration = 0;
        this.totalDuration = 0;
        
        // Event listeners
        this.listeners = new Map();
    }
    
    // ================================
    // SESSION MANAGEMENT
    // ================================
    
    async startSession(genre = null, type = 'detection', chain = 0) {
        if (this.isActive) {
            console.warn('🎯 GENRE: Session already active');
            return false;
        }
        
        this.isActive = true;
        this.startTime = Date.now();
        this.sessionType = type;
        this.chainCount = chain;
        this.genre = genre;
        
        // Load content based on mode
        if (type === 'auto') {
            await this.setAutoModeContent();
        } else {
            await this.setDetectedContent(genre);
        }
        
        // Start block progression
        this.startBlockProgression();
        
        console.log(`🎯 GENRE: Session started - Type: ${type}, Chain: ${chain}`);
        this.notifyListeners('sessionStarted', {
            type: type,
            chain: chain,
            genre: genre
        });
        
        return true;
    }
    
    // ================================
    // CONTENT MANAGEMENT
    // ================================
    
    async setAutoModeContent() {
        try {
            // Get random bucket content
            const content = await RumiContent.getRandomBucketContent();
            
            if (!content || content.length === 0) {
                throw new Error('No content available for auto mode');
            }
            
            // Process and validate content
            const processedContent = this.processContentData(content);
            
            // Set content and notify channel
            this.setContent(processedContent);
            this.sendBlockProgressionToChannel();
            
            console.log(`🎯 GENRE: Auto mode content set - ${processedContent.length} items`);
            
        } catch (error) {
            console.error('🎯 GENRE: Failed to set auto mode content:', error);
            this.endSession('content_error');
        }
    }
    
    async setDetectedContent(genre) {
        try {
            if (!genre) {
                throw new Error('Genre required for detected mode');
            }
            
            // Get content for genre
            const content = await RumiContent.getContentByGenre(genre);
            
            if (!content || content.length === 0) {
                throw new Error(`No content available for genre: ${genre}`);
            }
            
            // Process and validate content
            const processedContent = this.processContentData(content);
            
            // Set content and notify channel
            this.setContent(processedContent);
            this.sendBlockProgressionToChannel();
            
            console.log(`🎯 GENRE: Detected content set - ${processedContent.length} items for ${genre}`);
            
        } catch (error) {
            console.error('🎯 GENRE: Failed to set detected content:', error);
            this.endSession('content_error');
        }
    }
    
    processContentData(content) {
        return content.map(item => {
            // Ensure required fields
            if (!item.title || !item.genre) {
                console.warn('🎯 GENRE: Invalid content item:', item);
                return null;
            }

            // Create content blocks based on duration
            const blockCount = Math.ceil(item.duration_minutes / 15); // 15-minute blocks
            const blocks = Array(blockCount).fill(null).map((_, index) => ({
                number: index + 1,
                title: item.title,
                genre: item.genre,
                duration: 15,
                timestamp: Date.now() + (index * 15 * 60 * 1000)
            }));

            // Return processed item
            return {
                title: item.title,
                genre: item.genre,
                duration_minutes: item.duration_minutes,
                blocks: blocks,
                metadata: {
                    service: item.service,
                    year: item.year,
                    type: item.type,
                    intelligence_bucket: item.intelligence_bucket
                }
            };
        }).filter(Boolean);
    }
    
    setContent(content) {
        this.content = content;
        this.currentBlock = 0;
        this.totalBlocks = content.reduce((sum, item) => sum + item.blocks.length, 0);
        this.totalDuration = content.reduce((sum, item) => sum + item.duration_minutes, 0);
        this.blockDuration = Math.floor(this.totalDuration / this.totalBlocks);
        
        // Update state
        RumiState.setState('channelContent', content);
        RumiState.setState('totalBlocks', this.totalBlocks);
        RumiState.setState('blockDuration', this.blockDuration);
    }
    
    // ================================
    // BLOCK PROGRESSION
    // ================================
    
    startBlockProgression() {
        if (!this.content || this.content.length === 0) {
            console.warn('🎯 GENRE: No content for progression');
            return;
        }
        
        // Initialize first block
        this.updateCurrentBlock();
        
        // Start progression timer
        this.progressionTimer = setInterval(() => {
            this.progressToNextBlock();
        }, this.blockDuration * 60 * 1000);
    }
    
    updateCurrentBlock() {
        const currentItem = this.getCurrentContentItem();
        if (!currentItem) return;
        
        const block = this.getCurrentBlock();
        if (!block) return;
        
        // Update state with mode-specific data
        const blockData = {
            ...block,
            content: currentItem,
            mode: currentItem.metadata.mode,
            description: block.description,
            type: block.type
        };

        // Add mode-specific UI updates
        if (currentItem.metadata.mode === 'auto') {
            blockData.style = {
                color: 'var(--automode-color)',
                background: 'var(--automode-bg)',
                duration: '5min'
            };
        } else {
            blockData.style = {
                color: 'var(--detected-color)',
                background: 'var(--detected-bg)',
                duration: '15min'
            };
            
            // Add extra metadata for detected mode
            if (currentItem.metadata.type === 'episode') {
                blockData.episodeInfo = {
                    season: currentItem.metadata.season,
                    episode: currentItem.metadata.episode
                };
            }
        }
        
        // Update state
        RumiState.setState('currentBlock', blockData);
        
        // Update UI
        this.updateBlockDisplay(blockData);
    }
    
    updateBlockDisplay(blockData) {
        // Update Nokia display
        const nokiaDisplay = document.querySelector('.nokia-visual');
        if (nokiaDisplay) {
            nokiaDisplay.style.color = blockData.style.color;
            nokiaDisplay.style.background = blockData.style.background;
            
            // Update content
            const contentDisplay = nokiaDisplay.querySelector('.content-display');
            if (contentDisplay) {
                contentDisplay.innerHTML = `
                    <div class="block-header">
                        <span class="block-number">#${blockData.number}</span>
                        <span class="block-duration">${blockData.style.duration}</span>
                    </div>
                    <div class="block-title">${blockData.title}</div>
                    <div class="block-description">${blockData.description}</div>
                `;
            }
        }
        
        // Update progress indicators
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.setProperty('--progress-color', blockData.style.color);
            progressBar.style.setProperty('--progress-bg', blockData.style.background);
        }
    }
    
    getCurrentContentItem() {
        let blockCount = 0;
        for (const item of this.content) {
            if (blockCount + item.blocks.length > this.currentBlock) {
                return item;
            }
            blockCount += item.blocks.length;
        }
        return null;
    }
    
    getCurrentBlock() {
        const item = this.getCurrentContentItem();
        if (!item) return null;
        
        let blockCount = 0;
        for (const contentItem of this.content) {
            if (contentItem === item) {
                const blockIndex = this.currentBlock - blockCount;
                return item.blocks[blockIndex];
            }
            blockCount += contentItem.blocks.length;
        }
        return null;
    }
    
    progressToNextBlock() {
        if (this.currentBlock >= this.totalBlocks - 1) {
            this.endSession('completed');
            return;
        }
        
        this.currentBlock++;
        this.updateCurrentBlock();
        this.sendBlockProgressionToChannel();
    }
    
    // ================================
    // CHANNEL COMMUNICATION
    // ================================
    
    sendBlockProgressionToChannel() {
        const currentItem = this.getCurrentContentItem();
        const block = this.getCurrentBlock();
        
        if (!currentItem || !block) return;
        
        // Send to channel
        RumiState.setState('channelProgression', {
            currentBlock: this.currentBlock,
            totalBlocks: this.totalBlocks,
            currentItem: currentItem,
            block: block,
            progress: (this.currentBlock / this.totalBlocks) * 100
        });
    }
    
    // ================================
    // SESSION CONTROL
    // ================================
    
    endSession(reason = 'completed') {
        if (!this.isActive) return;
        
        // Clear progression timer
        if (this.progressionTimer) {
            clearInterval(this.progressionTimer);
            this.progressionTimer = null;
        }
        
        // Reset state
        this.isActive = false;
        this.content = [];
        this.currentBlock = 0;
        this.totalBlocks = 0;
        
        // Notify listeners
        this.notifyListeners('sessionEnded', { reason });
        
        console.log(`🎯 GENRE: Session ended - ${reason}`);
    }
    
    reset() {
        this.endSession('reset');
        this.genre = null;
        this.sessionType = 'detection';
        this.chainCount = 0;
        this.startTime = null;
    }
}

// Global instance
window.RumiGenre = new RumiGenreChannelEngine();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RumiGenreChannelEngine;
} 