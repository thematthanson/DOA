// Overlap Detection Agent - Specialized for Genre Channel
// Detects and fixes overlapping blocks in genre channels

class OverlapDetector {
    constructor() {
        this.isActive = false;
        this.overlapThreshold = 0.1; // 0.1% overlap threshold
        this.detectionInterval = null;
        this.overlapHistory = [];
        this.fixesApplied = [];
        this.debugMode = false;
        this.isApplyingFixes = false; // Flag to prevent infinite loops
        this.lastFixTime = 0; // Track when fixes were last applied
        this.permanentlyDisabled = true; // Permanently disable to prevent conflicts
        
        console.log('🔍 Overlap Detector initialized (permanently disabled)');
    }

    // Start detection
    enable() {
        if (this.permanentlyDisabled) {
            console.log('🔍 Overlap Detector permanently disabled to prevent conflicts');
            return;
        }
        
        if (this.isActive) {
            console.log('🔍 Overlap Detector already active');
            return;
        }

        this.isActive = true;
        this.startDetection();
        console.log('🔍 Overlap Detector enabled');
    }

    // Stop detection
    disable() {
        this.isActive = false;
        this.stopDetection();
        console.log('🔍 Overlap Detector disabled');
    }

    // Start continuous detection
    startDetection() {
        // Permanently disabled to prevent conflicts
        if (this.permanentlyDisabled) {
            console.log('🔍 Overlap Detector permanently disabled - skipping detection start');
            return;
        }
        
        // Initial detection
        this.detectOverlaps();
        
        // Set up interval for continuous monitoring
        this.detectionInterval = setInterval(() => {
            if (!this.isActive) return;
            this.detectOverlaps();
        }, 2000); // Check every 2 seconds

        // Also monitor DOM changes
        this.setupMutationObserver();
    }

    // Stop detection
    stopDetection() {
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
            this.detectionInterval = null;
        }
        
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
    }

    // Setup mutation observer for DOM changes
    setupMutationObserver() {
        // Permanently disabled to prevent conflicts
        if (this.permanentlyDisabled) {
            console.log('🔍 Overlap Detector permanently disabled - skipping mutation observer setup');
            return;
        }
        
        this.mutationObserver = new MutationObserver((mutations) => {
            if (!this.isActive) return;

            let shouldCheck = false;
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' || 
                    (mutation.type === 'attributes' && mutation.attributeName === 'style')) {
                    shouldCheck = true;
                }
            });

            if (shouldCheck) {
                // Debounce the check with longer delay to prevent infinite loops
                clearTimeout(this.checkTimeout);
                this.checkTimeout = setTimeout(() => {
                    // Only check if we haven't applied fixes recently
                    if (!this.isApplyingFixes) {
                        this.detectOverlaps();
                    }
                }, 500); // Increased debounce time
            }
        });

        // Observe the program track
        const programTrack = document.getElementById('program-track');
        if (programTrack) {
            this.mutationObserver.observe(programTrack, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style', 'class']
            });
        }
    }

    // Main overlap detection function
    detectOverlaps() {
        // Permanently disabled to prevent conflicts
        if (this.permanentlyDisabled) {
            console.log('🔍 Overlap Detector permanently disabled - skipping detection');
            return [];
        }
        
        const blocks = this.getProgramBlocks();
        const overlaps = this.findOverlaps(blocks);
        
        if (overlaps.length > 0) {
            console.warn('🔍 Overlapping blocks detected:', overlaps.length, 'overlaps');
            this.logOverlaps(overlaps);
            this.applyOverlapFixes(overlaps);
        } else if (this.debugMode) {
            console.log('✅ No overlaps detected');
        }

        // Store detection result
        this.overlapHistory.push({
            timestamp: Date.now(),
            blockCount: blocks.length,
            overlapCount: overlaps.length,
            overlaps: overlaps
        });

        // Keep only recent history
        if (this.overlapHistory.length > 20) {
            this.overlapHistory.shift();
        }

        return overlaps;
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
                right: right,
                originalLeft: left,
                originalWidth: width
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
                
                const overlap = this.calculateOverlap(block1, block2);
                if (overlap > this.overlapThreshold) {
                    overlaps.push({
                        block1: block1,
                        block2: block2,
                        overlap: overlap,
                        overlapWidth: this.getOverlapWidth(block1, block2)
                    });
                }
            }
        }

        return overlaps;
    }

    // Calculate overlap percentage
    calculateOverlap(block1, block2) {
        const overlapWidth = this.getOverlapWidth(block1, block2);
        if (overlapWidth <= 0) return 0;
        
        // Return overlap as percentage of the smaller block
        const smallerBlock = Math.min(block1.width, block2.width);
        return (overlapWidth / smallerBlock) * 100;
    }

    // Get overlap width
    getOverlapWidth(block1, block2) {
        const overlapStart = Math.max(block1.left, block2.left);
        const overlapEnd = Math.min(block1.right, block2.right);
        return Math.max(0, overlapEnd - overlapStart);
    }

    // Log overlap details
    logOverlaps(overlaps) {
        overlaps.forEach((overlap, index) => {
            console.warn(`🔍 Overlap ${index + 1}:`, {
                block1: {
                    title: overlap.block1.title,
                    left: overlap.block1.left,
                    width: overlap.block1.width,
                    right: overlap.block1.right
                },
                block2: {
                    title: overlap.block2.title,
                    left: overlap.block2.left,
                    width: overlap.block2.width,
                    right: overlap.block2.right
                },
                overlap: overlap.overlap.toFixed(2) + '%',
                overlapWidth: overlap.overlapWidth.toFixed(2) + '%'
            });
        });
    }

    // Apply fixes for overlapping blocks
    applyOverlapFixes(overlaps) {
        // Prevent infinite loops by checking if we recently applied fixes
        const now = Date.now();
        if (this.isApplyingFixes || (now - this.lastFixTime) < 1000) {
            console.log('🔧 Skipping overlap fixes - too recent or already applying');
            return;
        }
        
        this.isApplyingFixes = true;
        this.lastFixTime = now;
        
        // Temporarily disconnect mutation observer to prevent infinite loops
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
        
        console.log('🔧 Applying overlap fixes...');
        
        overlaps.forEach((overlap, index) => {
            const fix = this.calculateFix(overlap);
            this.applyFix(fix);
            
            console.log(`🔧 Applied fix ${index + 1}:`, fix);
        });

        // Record applied fixes
        this.fixesApplied.push({
            timestamp: Date.now(),
            overlapCount: overlaps.length,
            fixes: overlaps.map(overlap => this.calculateFix(overlap))
        });
        
        // Reconnect mutation observer and reset flag after a delay
        setTimeout(() => {
            this.isApplyingFixes = false;
            if (this.mutationObserver) {
                this.setupMutationObserver();
            }
        }, 1000);
    }

    // Calculate fix for an overlap
    calculateFix(overlap) {
        const { block1, block2 } = overlap;
        
        // Strategy 1: Try to fit both blocks without overlap
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
            // Need to compress blocks
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

    // Apply a calculated fix
    applyFix(fix) {
        // Apply block1 changes
        fix.block1.element.style.left = `${fix.block1.newLeft}%`;
        fix.block1.element.style.width = `${fix.block1.newWidth}%`;
        
        // Apply block2 changes
        fix.block2.element.style.left = `${fix.block2.newLeft}%`;
        fix.block2.element.style.width = `${fix.block2.newWidth}%`;
        
        // Add visual feedback
        this.addFixVisualFeedback(fix);
    }

    // Add visual feedback for applied fixes
    addFixVisualFeedback(fix) {
        const elements = [fix.block1.element, fix.block2.element];
        
        elements.forEach(element => {
            // Add temporary highlight
            element.style.borderColor = '#00ff41';
            element.style.backgroundColor = '#1a2a1a';
            
            // Remove highlight after 2 seconds
            setTimeout(() => {
                element.style.borderColor = '';
                element.style.backgroundColor = '';
            }, 2000);
        });
    }

    // Test function
    test() {
        console.log('🧪 Running Overlap Detector tests...');
        
        const blocks = this.getProgramBlocks();
        console.log('Total blocks found:', blocks.length);
        
        blocks.forEach((block, index) => {
            console.log(`Block ${index + 1}: "${block.title}" - left: ${block.left}%, width: ${block.width}%, right: ${block.right}%`);
        });
        
        const overlaps = this.detectOverlaps();
        console.log('Overlaps detected:', overlaps.length);
        
        return {
            blockCount: blocks.length,
            overlapCount: overlaps.length,
            overlaps: overlaps
        };
    }

    // Debug function
    debug() {
        console.log('🔍 Overlap Detector Debug Info:');
        console.log('Active:', this.isActive);
        console.log('Threshold:', this.overlapThreshold + '%');
        console.log('Recent detections:', this.overlapHistory.slice(-5));
        console.log('Fixes applied:', this.fixesApplied.slice(-5));
        
        const blocks = this.getProgramBlocks();
        console.log('Current blocks:', blocks.length);
        
        blocks.forEach((block, index) => {
            console.log(`  Block ${index + 1}: "${block.title}" - left: ${block.left}%, width: ${block.width}%`);
        });
    }

    // Get status
    getStatus() {
        return {
            isActive: this.isActive,
            blockCount: this.getProgramBlocks().length,
            recentOverlaps: this.overlapHistory.slice(-3),
            recentFixes: this.fixesApplied.slice(-3)
        };
    }

    // Toggle debug mode
    toggleDebug() {
        this.debugMode = !this.debugMode;
        console.log('🔍 Debug mode:', this.debugMode ? 'ON' : 'OFF');
    }

    // Reset history
    reset() {
        this.overlapHistory = [];
        this.fixesApplied = [];
        console.log('🔍 Overlap Detector history reset');
    }
}

// Initialize and export
window.OverlapDetector = OverlapDetector;
window.overlapDetector = new OverlapDetector();

// Auto-enable on page load (TEMPORARILY DISABLED to prevent conflicts)
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        // window.overlapDetector.enable(); // TEMPORARILY DISABLED
        console.log('🔍 Overlap Detector auto-enable disabled to prevent conflicts');
    }, 1000);
});

console.log('🔍 Overlap Detector loaded'); 