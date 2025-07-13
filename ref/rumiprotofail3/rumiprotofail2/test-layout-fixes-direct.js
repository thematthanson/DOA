// Direct Test Script for Genre Channel Layout Fixes
// Run this in the browser console of Genre-channel_v2.html

console.log('🧪 Starting Direct Layout Fixes Test...');

// Test 1: Check if layout fixer is loaded
console.log('Test 1: Layout Fixer Availability');
if (typeof window.genreChannelLayoutFixer !== 'undefined') {
    console.log('✅ Layout fixer found');
    console.log('Status:', window.genreChannelLayoutFixer.isEnabled ? 'Enabled' : 'Disabled');
} else {
    console.log('❌ Layout fixer not found');
    console.log('Available window objects:', Object.keys(window).filter(key => key.includes('genre')));
}

// Test 2: Enable the layout fixer
console.log('\nTest 2: Enabling Layout Fixer');
if (window.genreChannelLayoutFixer) {
    window.genreChannelLayoutFixer.enable();
    console.log('✅ Layout fixer enabled');
} else {
    console.log('❌ Cannot enable - layout fixer not found');
}

// Test 3: Check current content
console.log('\nTest 3: Current Content Check');
if (typeof window.currentContent !== 'undefined') {
    console.log('✅ Current content found');
    console.log('Content length:', window.currentContent ? window.currentContent.length : 0);
    
    if (window.currentContent && window.currentContent.length > 0) {
        console.log('Content items:');
        window.currentContent.forEach((item, index) => {
            console.log(`  ${index + 1}. ${item.title} (${item.duration}min) at ${item.startTime}min`);
        });
    } else {
        console.log('⚠️ No content items found');
    }
} else {
    console.log('❌ Current content not found');
}

// Test 4: Test overlap prevention
console.log('\nTest 4: Overlap Prevention Test');
if (window.genreChannelLayoutFixer) {
    try {
        window.genreChannelLayoutFixer.preventOverlaps();
        console.log('✅ Overlap prevention test completed');
    } catch (error) {
        console.log('❌ Overlap prevention test failed:', error.message);
    }
} else {
    console.log('❌ Cannot test overlap prevention - layout fixer not found');
}

// Test 5: Test slide functionality
console.log('\nTest 5: Slide Blocks Test');
if (window.genreChannelLayoutFixer) {
    try {
        window.genreChannelLayoutFixer.slideBlocksLeft();
        console.log('✅ Slide blocks test completed');
    } catch (error) {
        console.log('❌ Slide blocks test failed:', error.message);
    }
} else {
    console.log('❌ Cannot test slide blocks - layout fixer not found');
}

// Test 6: Check program track
console.log('\nTest 6: Program Track Check');
const programTrack = document.getElementById('program-track');
if (programTrack) {
    console.log('✅ Program track found');
    const blocks = programTrack.querySelectorAll('.program-slot');
    console.log('Program blocks found:', blocks.length);
    
    if (blocks.length > 0) {
        console.log('Block details:');
        blocks.forEach((block, index) => {
            const title = block.querySelector('.program-title')?.textContent || 'No title';
            const left = block.style.left || '0%';
            const width = block.style.width || '0%';
            console.log(`  ${index + 1}. ${title} - left: ${left}, width: ${width}`);
        });
    }
} else {
    console.log('❌ Program track not found');
}

// Test 7: Test remove functionality
console.log('\nTest 7: Remove Functionality Test');
if (typeof window.removeContent === 'function') {
    console.log('✅ Remove content function found');
    console.log('Function type:', typeof window.removeContent);
} else {
    console.log('❌ Remove content function not found');
}

// Test 8: Test add functionality
console.log('\nTest 8: Add Functionality Test');
if (typeof window.addContentAtPosition === 'function') {
    console.log('✅ Add content function found');
    console.log('Function type:', typeof window.addContentAtPosition);
} else {
    console.log('❌ Add content function not found');
}

// Test 9: Check for gaps
console.log('\nTest 9: Gap Detection Test');
if (typeof window.findGaps === 'function') {
    try {
        const gaps = window.findGaps();
        console.log('✅ Gap detection working');
        console.log('Gaps found:', gaps.length);
        gaps.forEach((gap, index) => {
            console.log(`  Gap ${index + 1}: ${gap.start}min - ${gap.end}min (${gap.duration}min)`);
        });
    } catch (error) {
        console.log('❌ Gap detection failed:', error.message);
    }
} else {
    console.log('❌ Gap detection function not found');
}

// Test 10: Overall system health
console.log('\nTest 10: System Health Check');
const health = {
    layoutFixer: typeof window.genreChannelLayoutFixer !== 'undefined',
    currentContent: typeof window.currentContent !== 'undefined',
    programTrack: !!document.getElementById('program-track'),
    removeFunction: typeof window.removeContent === 'function',
    addFunction: typeof window.addContentAtPosition === 'function',
    gapFunction: typeof window.findGaps === 'function'
};

console.log('System health summary:');
Object.entries(health).forEach(([component, status]) => {
    console.log(`  ${status ? '✅' : '❌'} ${component}: ${status ? 'OK' : 'Missing'}`);
});

const allHealthy = Object.values(health).every(status => status);
console.log(`\n${allHealthy ? '✅' : '❌'} Overall system health: ${allHealthy ? 'HEALTHY' : 'ISSUES DETECTED'}`);

console.log('\n🧪 Direct Layout Fixes Test Complete!');

// Make test functions available globally
window.runLayoutTest = function() {
    console.log('Running layout test...');
    // Re-run the test
    eval(document.currentScript.textContent);
};

window.checkLayoutFixer = function() {
    console.log('Layout fixer status:', {
        exists: typeof window.genreChannelLayoutFixer !== 'undefined',
        enabled: window.genreChannelLayoutFixer?.isEnabled || false,
        functions: window.genreChannelLayoutFixer ? Object.keys(window.genreChannelLayoutFixer) : []
    });
};

console.log('\n💡 Available test functions:');
console.log('  runLayoutTest() - Run the full test again');
console.log('  checkLayoutFixer() - Check layout fixer status'); 