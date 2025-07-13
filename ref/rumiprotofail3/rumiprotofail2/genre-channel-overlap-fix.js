// Genre Channel Overlap Fix
// Comprehensive solution for preventing overlapping blocks in genre channels

class GenreChannelOverlapFix {
    constructor() {
        this.isEnabled = false;
        this.fixedBlocks = new Set();
        this.overlapHistory = [];
        this.debugMode = false;
        this.autoFillGaps = false; // Disable automatic gap filling to prevent infinite loops
        this.preserveTimePositions = false; // Disable time-based positioning preservation
        this.isFillingGaps = false; // Prevent infinite loops
        this.lastGapFillTime = 0; // Track last gap fill time
        this.blockPadding = 10; // 10px padding between blocks
        this.infiniteLoopPrevention = {
            lastGapFill: 0,
            gapFillCount: 0,
            maxGapFills: 3
        };
        
        console.log('🔧 Genre Channel Overlap Fix initialized');
    }

    // Simple width calculation - revert to original logic
    calculateWidth(duration, timelineDuration = 240) {
        // Use original width calculation without enhancements
        return (duration / timelineDuration) * 100;
    }

    // Simple left position calculation - revert to original logic
    calculateLeftPosition(minutes, timelineDuration = 240) {
        // Use original position calculation without enhancements
        return (minutes / timelineDuration) * 100;
    }

    // Enable the overlap fix
    enable() {
        this.isEnabled = true;
        console.log('🔧 Genre Channel Overlap Fix enabled');
        
        // Add CSS-based padding between blocks
        this.addBlockPadding();
        
        // Start monitoring for overlaps
        this.startMonitoring();
        
        // Monitor block creation and removal
        this.monitorBlockCreation();
        this.monitorBlockRemoval();
        
        // Apply initial fixes
        setTimeout(() => {
            this.checkAndFixOverlaps();
            this.fillGapsIfEnabled();
        }, 100);
    }

    // Add CSS-based padding without overriding width calculations
    addBlockPadding() {
        // Add CSS rule for block padding
        const style = document.createElement('style');
        style.id = 'block-padding-style';
        style.textContent = `
            .program-slot:not(.empty) {
                margin-right: 10px !important;
                box-sizing: border-box !important;
            }
            
            .program-slot:not(.empty):last-child {
                margin-right: 0 !important;
            }
        `;
        
        // Remove existing style if present
        const existingStyle = document.getElementById('block-padding-style');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        document.head.appendChild(style);
        console.log('🔧 Added 10px padding between blocks via CSS');
    }

    // Disable the overlap fix
    disable() {
        this.isEnabled = false;
        console.log('🔧 Genre Channel Overlap Fix disabled');
        
        if (this.blockObserver) {
            this.blockObserver.disconnect();
        }
    }

    // Toggle automatic gap filling
    toggleGapFilling() {
        this.autoFillGaps = !this.autoFillGaps;
        console.log(`🔧 Auto gap filling ${this.autoFillGaps ? 'enabled' : 'disabled'}`);
        
        if (this.autoFillGaps) {
            this.fillGapsIfEnabled();
        }
    }

    // Toggle time-based positioning preservation
    toggleTimePositions() {
        this.preserveTimePositions = !this.preserveTimePositions;
        console.log(`🔧 Time-based positioning preservation ${this.preserveTimePositions ? 'enabled' : 'disabled'}`);
    }

    // Start monitoring for overlaps
    startMonitoring() {
        // Monitor for DOM changes that might create overlaps
        this.mutationObserver = new MutationObserver((mutations) => {
            if (!this.isEnabled) return;

            let shouldCheck = false;
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' || mutation.type === 'attributes') {
                    shouldCheck = true;
                }
            });

            if (shouldCheck) {
                setTimeout(() => {
                    this.checkAndFixOverlaps();
                    // Only fill gaps if explicitly enabled
                    if (this.autoFillGaps) {
                        this.fillGapsIfEnabled();
                    }
                }, 100); // Increased delay to reduce frequency
            }
        });

        // Observe the program track
        const programTrack = document.getElementById('program-track');
        if (programTrack) {
            this.mutationObserver.observe(programTrack, {
                childList: true,
                attributes: true,
                subtree: true
            });
        }
    }

    // Monitor block creation to prevent overlaps
    monitorBlockCreation() {
        // Create a mutation observer to watch for new blocks
        this.blockObserver = new MutationObserver((mutations) => {
            if (!this.isEnabled) return;

            let blocksAdded = false;
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE && 
                            node.classList && 
                            node.classList.contains('program-slot')) {
                            blocksAdded = true;
                        }
                    });
                }
            });

            if (blocksAdded) {
                // Wait a bit for all blocks to be created, then check for overlaps
                setTimeout(() => {
                    this.checkAndFixOverlaps();
                    // Also improve remove button visibility for all blocks
                    this.improveAllRemoveButtonVisibility();
                    // Only fill gaps if explicitly enabled
                    if (this.autoFillGaps) {
                        this.fillGapsIfEnabled();
                    }
                }, 100); // Increased delay to reduce frequency
            }
        });

        // Observe the program track
        const programTrack = document.getElementById('program-track');
        if (programTrack) {
            this.blockObserver.observe(programTrack, {
                childList: true,
                subtree: true
            });
        }
    }

    // Monitor block removal to trigger gap filling
    monitorBlockRemoval() {
        // Override the removeContent function to enable gap filling
        if (window.removeContent && !window.removeContent._overridden) {
            const originalRemoveContent = window.removeContent;
            
            window.removeContent = (index) => {
                // Call the original function
                originalRemoveContent.call(this, index);
                
                // After removal, fill gaps if enabled
                if (this.autoFillGaps && !this.preserveTimePositions) {
                    setTimeout(() => {
                        this.fillGapsIfEnabled();
                    }, 100);
                }
            };
            
            window.removeContent._overridden = true;
            console.log('🔧 Enhanced removeContent function with gap filling');
        }
    }

    // Check for overlaps and apply fixes
    checkAndFixOverlaps() {
        if (!this.isEnabled) return;

        const blocks = this.getProgramBlocks();
        const overlaps = this.findOverlaps(blocks);
        
        if (overlaps.length > 0) {
            console.log('🔧 Overlapping blocks detected:', overlaps.length, 'overlaps');
            this.applyOverlapFixes(overlaps);
        } else if (this.debugMode) {
            console.log('✅ No overlaps detected');
        }
    }

    // Fill gaps automatically if enabled with aggressive infinite loop prevention
    fillGapsIfEnabled() {
        if (!this.autoFillGaps || this.preserveTimePositions) return;
        
        // Aggressive infinite loop prevention
        const now = Date.now();
        if (this.isFillingGaps || (now - this.lastGapFillTime) < 2000) {
            console.log('🔧 Skipping gap fill - too recent or already filling');
            return;
        }
        
        // Check for infinite loop with more aggressive limits
        if (now - this.infiniteLoopPrevention.lastGapFill < 3000) {
            this.infiniteLoopPrevention.gapFillCount++;
            if (this.infiniteLoopPrevention.gapFillCount > 2) { // Reduced from 3 to 2
                console.log('🔧 Infinite loop detected - disabling gap filling permanently');
                this.autoFillGaps = false;
                this.infiniteLoopPrevention.gapFillCount = 0;
                return; // Don't re-enable automatically
            }
        } else {
            this.infiniteLoopPrevention.gapFillCount = 0;
        }
        
        this.infiniteLoopPrevention.lastGapFill = now;
        
        console.log('🔧 Checking for gaps to fill...');
        const gaps = this.findGaps();
        
        if (gaps.length > 0) {
            console.log(`🔧 Found ${gaps.length} gaps, filling automatically...`);
            this.fillGaps(gaps);
        } else {
            console.log('✅ No gaps found');
        }
    }

    // Find gaps in the timeline
    findGaps() {
        const blocks = this.getProgramBlocks();
        const gaps = [];
        
        if (blocks.length === 0) return gaps;
        
        // Sort blocks by left position
        const sortedBlocks = blocks.sort((a, b) => a.left - b.left);
        
        // Check for gaps between blocks
        for (let i = 0; i < sortedBlocks.length - 1; i++) {
            const currentBlock = sortedBlocks[i];
            const nextBlock = sortedBlocks[i + 1];
            
            const currentEnd = currentBlock.left + currentBlock.width;
            const gapStart = currentEnd;
            const gapEnd = nextBlock.left;
            
            if (gapEnd > gapStart) {
                gaps.push({
                    start: gapStart,
                    end: gapEnd,
                    duration: gapEnd - gapStart,
                    beforeBlock: currentBlock,
                    afterBlock: nextBlock
                });
            }
        }
        
        return gaps;
    }

    // Fill gaps by sliding blocks with padding
    fillGaps(gaps) {
        if (gaps.length === 0) return;
        
        // Set flag to prevent infinite loops
        this.isFillingGaps = true;
        this.lastGapFillTime = Date.now();
        
        console.log('🔧 Filling gaps by sliding blocks...');
        
        // Sort gaps by start position
        const sortedGaps = gaps.sort((a, b) => a.start - b.start);
        
        // Calculate total gap space
        const totalGapSpace = sortedGaps.reduce((total, gap) => total + gap.duration, 0);
        console.log(`🔧 Total gap space: ${totalGapSpace.toFixed(2)}%`);
        
        // Get all blocks that need to be moved
        const blocksToMove = new Set();
        sortedGaps.forEach(gap => {
            if (gap.afterBlock) {
                blocksToMove.add(gap.afterBlock);
            }
        });
        
        // Slide blocks to fill gaps with padding
        let currentPosition = 0;
        const blocks = this.getProgramBlocks().sort((a, b) => a.left - b.left);
        
        blocks.forEach((block, index) => {
            if (blocksToMove.has(block)) {
                // This block needs to be moved to fill gaps
                const newLeft = currentPosition;
                block.element.style.left = `${newLeft}%`;
                console.log(`🔧 Moved block "${block.title}" to ${newLeft.toFixed(2)}%`);
            }
            
            // Update current position with padding
            currentPosition = block.left + block.width + this.blockPadding;
        });
        
        // Remove gap indicators
        this.removeGapIndicators();
        
        // Improve remove button visibility for all blocks
        this.improveAllRemoveButtonVisibility();
        
        // Reset flag after a delay
        setTimeout(() => {
            this.isFillingGaps = false;
        }, 1000);
        
        console.log('✅ Gap filling complete');
    }

    // Remove gap indicators (+ buttons)
    removeGapIndicators() {
        const gapSlots = document.querySelectorAll('.program-slot.empty');
        gapSlots.forEach(slot => {
            if (slot.textContent === '+') {
                slot.remove();
                console.log('🔧 Removed gap indicator');
            }
        });
    }

    // Get all program blocks
    getProgramBlocks() {
        const blocks = document.querySelectorAll('.program-slot:not(.empty)');
        return Array.from(blocks).map((block, index) => {
            const left = parseFloat(block.style.left) || 0;
            const width = parseFloat(block.style.width) || 0;
            const right = left + width;
            const title = block.querySelector('.program-title')?.textContent || `Block ${index + 1}`;
            
            return {
                element: block,
                index: index,
                title: title,
                left: left,
                width: width,
                right: right
            };
        });
    }

    // Find overlapping blocks
    findOverlaps(blocks) {
        const overlaps = [];
        
        for (let i = 0; i < blocks.length; i++) {
            for (let j = i + 1; j < blocks.length; j++) {
                const block1 = blocks[i];
                const block2 = blocks[j];
                
                // Check if blocks overlap
                if (block1.left < block2.right && block2.left < block1.right) {
                    const overlapWidth = Math.min(block1.right, block2.right) - Math.max(block1.left, block2.left);
                    const overlapPercentage = (overlapWidth / Math.min(block1.width, block2.width)) * 100;
                    
                    if (overlapPercentage > 0.1) { // 0.1% threshold
                        overlaps.push({
                            block1: block1,
                            block2: block2,
                            overlap: overlapPercentage,
                            overlapWidth: overlapWidth
                        });
                    }
                }
            }
        }

        return overlaps;
    }

    // Apply fixes for overlapping blocks
    applyOverlapFixes(overlaps) {
        overlaps.forEach((overlap, index) => {
            const fix = this.calculateOverlapFix(overlap);
            this.applyOverlapFix(fix);
            
            // Record the fix
            this.overlapHistory.push({
                timestamp: Date.now(),
                overlap: overlap,
                fix: fix
            });
            
            console.log(`🔧 Applied overlap fix ${index + 1}:`, fix);
        });
    }

    // Calculate fix for an overlap
    calculateOverlapFix(overlap) {
        const { block1, block2 } = overlap;
        
        // Strategy: Reposition blocks to eliminate overlap
        const totalWidth = block1.width + block2.width;
        const availableSpace = 100;
        
        if (totalWidth <= availableSpace) {
            // Can fit both blocks side by side
            return {
                type: 'reposition',
                block1: {
                    element: block1.element,
                    newLeft: 0,
                    newWidth: block1.width
                },
                block2: {
                    element: block2.element,
                    newLeft: block1.width,
                    newWidth: block2.width
                }
            };
        } else {
            // Need to compress blocks proportionally
            const compressionRatio = availableSpace / totalWidth;
            const newWidth1 = block1.width * compressionRatio;
            const newWidth2 = block2.width * compressionRatio;
            
            return {
                type: 'compress',
                block1: {
                    element: block1.element,
                    newLeft: 0,
                    newWidth: newWidth1
                },
                block2: {
                    element: block2.element,
                    newLeft: newWidth1,
                    newWidth: newWidth2
                },
                compressionRatio: compressionRatio
            };
        }
    }

    // Apply a calculated overlap fix
    applyOverlapFix(fix) {
        // Apply block1 changes
        fix.block1.element.style.left = `${fix.block1.newLeft}%`;
        fix.block1.element.style.width = `${fix.block1.newWidth}%`;
        
        // Apply block2 changes
        fix.block2.element.style.left = `${fix.block2.newLeft}%`;
        fix.block2.element.style.width = `${fix.block2.newWidth}%`;
        
        // Improve remove button visibility for narrow blocks
        this.improveRemoveButtonVisibility(fix.block1.element);
        this.improveRemoveButtonVisibility(fix.block2.element);
        
        // Add visual feedback
        this.addFixVisualFeedback(fix);
        
        console.log(`🔧 Applied fix: ${fix.type}`);
    }

    // Improve remove button visibility for narrow blocks
    improveRemoveButtonVisibility(blockElement) {
        const removeBtn = blockElement.querySelector('.remove-btn');
        if (!removeBtn) return;
        
        const width = parseFloat(blockElement.style.width) || 0;
        
        // Enhanced remove button styling for all blocks
        removeBtn.style.transition = 'all 0.2s ease';
        removeBtn.style.borderRadius = '4px';
        removeBtn.style.fontWeight = 'bold';
        removeBtn.style.fontSize = '11px';
        removeBtn.style.padding = '2px 4px';
        removeBtn.style.minWidth = '16px';
        removeBtn.style.height = '16px';
        removeBtn.style.display = 'flex';
        removeBtn.style.alignItems = 'center';
        removeBtn.style.justifyContent = 'center';
        removeBtn.style.zIndex = '100';
        removeBtn.style.cursor = 'pointer';
        
        if (width < 10) {
            // Always visible for very narrow blocks
            removeBtn.style.opacity = '1';
            removeBtn.style.visibility = 'visible';
            removeBtn.style.background = '#ff4444';
            removeBtn.style.color = '#ffffff';
            removeBtn.style.fontSize = '10px';
            
            // Add a subtle glow effect
            removeBtn.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.5), 0 0 6px rgba(255, 68, 68, 0.3)';
            
            // Ensure it's positioned correctly
            removeBtn.style.top = '1px';
            removeBtn.style.right = '1px';
            removeBtn.style.position = 'absolute';
        } else if (width < 20) {
            // Semi-visible for moderately narrow blocks
            removeBtn.style.opacity = '0.8';
            removeBtn.style.visibility = 'visible';
            removeBtn.style.background = '#ff5555';
            removeBtn.style.color = '#ffffff';
            removeBtn.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.3)';
        } else {
            // Enhanced hover behavior for wider blocks
            removeBtn.style.opacity = '0.3';
            removeBtn.style.visibility = 'visible';
            removeBtn.style.background = '#ff6666';
            removeBtn.style.color = '#ffffff';
            removeBtn.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.2)';
        }
        
        // Add hover effects
        removeBtn.addEventListener('mouseenter', () => {
            removeBtn.style.opacity = '1';
            removeBtn.style.background = '#ff3333';
            removeBtn.style.transform = 'scale(1.1)';
            removeBtn.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.4), 0 0 8px rgba(255, 51, 51, 0.4)';
        });
        
        removeBtn.addEventListener('mouseleave', () => {
            removeBtn.style.transform = 'scale(1)';
            if (width < 10) {
                removeBtn.style.opacity = '1';
            } else if (width < 20) {
                removeBtn.style.opacity = '0.8';
            } else {
                removeBtn.style.opacity = '0.3';
            }
            removeBtn.style.boxShadow = width < 10 ? 
                '0 2px 4px rgba(0, 0, 0, 0.5), 0 0 6px rgba(255, 68, 68, 0.3)' :
                '0 1px 2px rgba(0, 0, 0, 0.2)';
        });
    }

    // Improve remove button visibility for all blocks
    improveAllRemoveButtonVisibility() {
        const blocks = document.querySelectorAll('.program-slot:not(.empty)');
        blocks.forEach(block => {
            this.improveRemoveButtonVisibility(block);
        });
    }

    // Add visual feedback for applied fixes
    addFixVisualFeedback(fix) {
        // Add a brief highlight effect to show the fix was applied
        const elements = [fix.block1.element, fix.block2.element];
        
        elements.forEach(element => {
            element.style.transition = 'all 0.3s ease';
            element.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.5)';
            
            setTimeout(() => {
                element.style.boxShadow = '';
            }, 1000);
        });
    }

    // Test function
    test() {
        console.log('🔧 Genre Channel Overlap Fix Test');
        console.log('Enabled:', this.isEnabled);
        console.log('Auto fill gaps:', this.autoFillGaps);
        console.log('Preserve time positions:', this.preserveTimePositions);
        console.log('Is filling gaps:', this.isFillingGaps);
        
        const blocks = this.getProgramBlocks();
        console.log('Current blocks:', blocks.length);
        
        const overlaps = this.findOverlaps(blocks);
        console.log('Current overlaps:', overlaps.length);
        
        const gaps = this.findGaps();
        console.log('Current gaps:', gaps.length);
        
        return {
            enabled: this.isEnabled,
            autoFillGaps: this.autoFillGaps,
            preserveTimePositions: this.preserveTimePositions,
            isFillingGaps: this.isFillingGaps,
            blockCount: blocks.length,
            overlapCount: overlaps.length,
            gapCount: gaps.length
        };
    }

    // Get status
    getStatus() {
        return {
            isEnabled: this.isEnabled,
            autoFillGaps: this.autoFillGaps,
            preserveTimePositions: this.preserveTimePositions,
            isFillingGaps: this.isFillingGaps,
            blockCount: this.getProgramBlocks().length,
            overlapCount: this.findOverlaps(this.getProgramBlocks()).length,
            gapCount: this.findGaps().length
        };
    }
}

// Create and auto-enable the overlap fix
const genreChannelOverlapFix = new GenreChannelOverlapFix();

// Auto-enable after DOM is loaded - DISABLED to prevent conflicts
// document.addEventListener('DOMContentLoaded', () => {
//     setTimeout(() => {
//         genreChannelOverlapFix.enable();
//     }, 1000);
// });

// Make it globally accessible
window.genreChannelOverlapFix = genreChannelOverlapFix;

// Add console commands for testing
window.testOverlapFix = () => genreChannelOverlapFix.test();
window.toggleGapFilling = () => genreChannelOverlapFix.toggleGapFilling();
window.toggleTimePositions = () => genreChannelOverlapFix.toggleTimePositions();
window.fillGaps = () => genreChannelOverlapFix.fillGapsIfEnabled();

console.log('🔧 Genre Channel Overlap Fix loaded'); 