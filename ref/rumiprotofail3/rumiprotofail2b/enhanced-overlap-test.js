// Enhanced Overlap Test Script
// Copy and paste this into the browser console when viewing the genre channel

console.log('🧪 Enhanced Overlap Test Starting...');

// Wait for layout fixer to be available
function waitForLayoutFixer() {
    return new Promise((resolve) => {
        const checkFixer = () => {
            if (window.genreChannelLayoutFixer) {
                resolve(window.genreChannelLayoutFixer);
            } else {
                setTimeout(checkFixer, 100);
            }
        };
        checkFixer();
    });
}

// Test overlap prevention across different scenarios
async function runEnhancedOverlapTest() {
    console.log('🔍 Waiting for layout fixer...');
    const fixer = await waitForLayoutFixer();
    
    console.log('✅ Layout fixer found:', fixer.isEnabled ? 'ENABLED' : 'DISABLED');
    
    if (!fixer.isEnabled) {
        console.log('🔧 Enabling layout fixer...');
        fixer.enable();
    }
    
    // Test 1: Check current state
    console.log('\n📊 Test 1: Current Content State');
    if (window.currentContent) {
        console.log('Content count:', window.currentContent.length);
        console.log('Content items:', window.currentContent.map(item => ({
            title: item.title,
            startTime: item.startTime,
            duration: item.duration
        })));
    } else {
        console.log('No current content');
    }
    
    // Test 2: Detect overlaps
    console.log('\n🔍 Test 2: Overlap Detection');
    const hasOverlaps = fixer.detectOverlaps();
    
    // Test 3: Apply fixes if needed
    if (hasOverlaps) {
        console.log('\n🔧 Test 3: Applying Overlap Fixes');
        fixer.preventOverlaps();
        
        console.log('\n🔍 Test 4: Verifying Fixes');
        fixer.detectOverlaps();
    } else {
        console.log('\n✅ Test 3: No overlaps detected - no fixes needed');
    }
    
    // Test 4: Force sequential positioning
    console.log('\n🔧 Test 4: Force Sequential Positioning');
    fixer.forceSequentialPositioning();
    
    // Test 5: Final verification
    console.log('\n🔍 Test 5: Final Overlap Check');
    fixer.detectOverlaps();
    
    console.log('\n✅ Enhanced Overlap Test Complete!');
    console.log('💡 The layout fixer should now prevent overlaps consistently across all genres');
    console.log('💡 Try switching between different genres to test consistency');
}

// Run the test
runEnhancedOverlapTest().catch(console.error);

// Also provide manual test functions
window.enhancedOverlapTest = {
    runTest: runEnhancedOverlapTest,
    checkCurrentGenre: () => {
        const genreSelect = document.getElementById('genre-select');
        return genreSelect ? genreSelect.value : 'unknown';
    },
    testGenreSwitch: async () => {
        console.log('🔄 Testing genre switch consistency...');
        const fixer = await waitForLayoutFixer();
        
        // Get current genre
        const currentGenre = window.enhancedOverlapTest.checkCurrentGenre();
        console.log('Current genre:', currentGenre);
        
        // Check for overlaps before switch
        console.log('Before genre switch:');
        fixer.detectOverlaps();
        
        // Simulate genre switch by triggering content change
        if (typeof window.createLineup === 'function') {
            console.log('Triggering lineup recreation...');
            window.createLineup();
            
            // Wait and check again
            setTimeout(() => {
                console.log('After genre switch:');
                fixer.detectOverlaps();
            }, 500);
        }
    }
};

console.log('💡 Available test functions:');
console.log('   - window.enhancedOverlapTest.runTest() - Run full test');
console.log('   - window.enhancedOverlapTest.testGenreSwitch() - Test genre switching');
console.log('   - window.enhancedOverlapTest.checkCurrentGenre() - Check current genre'); 