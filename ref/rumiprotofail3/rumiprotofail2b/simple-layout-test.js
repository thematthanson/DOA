// Simple Layout Fixes Test - Copy and paste this entire block into the console

(function() {
    console.log('🧪 Simple Layout Fixes Test Starting...');
    
    // Check if layout fixer exists
    if (typeof window.genreChannelLayoutFixer === 'undefined') {
        console.log('❌ Layout fixer not found');
        console.log('Available window objects with "genre":', Object.keys(window).filter(key => key.includes('genre')));
        return;
    }
    
    console.log('✅ Layout fixer found');
    console.log('Current status:', window.genreChannelLayoutFixer.isEnabled ? 'Enabled' : 'Disabled');
    
    // Enable if not already enabled
    if (!window.genreChannelLayoutFixer.isEnabled) {
        window.genreChannelLayoutFixer.enable();
        console.log('✅ Layout fixer enabled');
    }
    
    // Test basic functionality
    try {
        window.genreChannelLayoutFixer.test();
        console.log('✅ Layout fixer test completed');
    } catch (error) {
        console.log('❌ Layout fixer test failed:', error.message);
    }
    
    // Check current content
    if (typeof window.currentContent !== 'undefined') {
        console.log('✅ Current content found, length:', window.currentContent ? window.currentContent.length : 0);
    } else {
        console.log('❌ Current content not found');
    }
    
    // Check program track
    const programTrack = document.getElementById('program-track');
    if (programTrack) {
        const blocks = programTrack.querySelectorAll('.program-slot');
        console.log('✅ Program track found with', blocks.length, 'blocks');
    } else {
        console.log('❌ Program track not found');
    }
    
    console.log('🧪 Simple test complete!');
})(); 