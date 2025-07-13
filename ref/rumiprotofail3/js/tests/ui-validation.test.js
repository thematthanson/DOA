// ================================
// RUMI UI VALIDATION TESTS
// Test suite for visual and UI-specific validation
// ================================

class UIValidationTests {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0
        };
        
        // Define UI validation test cases
        this.testCases = {
            'Section 1: Entry Points & Activation': this.validateSection1.bind(this),
            'Section 2: Pre-Indexing & Channel View': this.validateSection2.bind(this),
            'Section 3: Active Indexing (Detected & Automode)': this.validateSection3.bind(this),
            'Section 4: Receipt View': this.validateSection4.bind(this)
        };
    }
    
    // ================================
    // TEST RUNNER
    // ================================
    
    async runAll() {
        console.log('🎯 UI TEST: Starting UI validation suite...');
        
        for (const [name, testFn] of Object.entries(this.testCases)) {
            await testFn(name);
        }
        
        this.reportResults();
    }
    
    // ================================
    // SECTION VALIDATION TESTS
    // ================================
    
    async validateSection1(testName) {
        console.log(`\n--- Running: ${testName} ---`);
        
        // Test content detect entry point (stream detector)
        const contentDetect = document.getElementById('stream-detector-entry');
        this.assert(contentDetect, 'Content detect entry point exists');
        
        // Test automode entry point
        const automodeButton = document.querySelector('.automode-button');
        this.assert(automodeButton, 'Automode button exists');
        
        // Test activation circle
        const activationCircle = document.getElementById('activation-circle');
        this.assert(activationCircle, 'Activation circle exists');
    }
    
    async validateSection2(testName) {
        console.log(`\n--- Running: ${testName} ---`);
        
        // Test channel section (expandable channel section)
        const channelSection = document.getElementById('expandable-channel-section');
        this.assert(channelSection, 'Channel section exists');
        
        // Test show name display (in holistic panel)
        const showInfo = document.getElementById('holistic-show-info');
        this.assert(showInfo, 'Show name display exists');
    }
    
    async validateSection3(testName) {
        console.log(`\n--- Running: ${testName} ---`);
        
        // Test detected mode styling
        if (window.rumiState) {
            window.rumiState.setMode('detected');
            await new Promise(resolve => setTimeout(resolve, 100)); // Allow styles to apply
            
            // Check if mode class is applied to body
            const hasDetectedClass = document.body.classList.contains('detected-mode') || 
                                    document.body.classList.contains('mode-detected');
            this.assert(hasDetectedClass, 'Detected mode class is applied');
            
            // Test primary CTA exists and has styling
            const primaryCta = document.querySelector('.primary-cta');
            this.assert(primaryCta, 'Primary CTA exists');
            
            // Test automode styling
            window.rumiState.setMode('auto');
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const hasAutoClass = document.body.classList.contains('auto-mode') || 
                               document.body.classList.contains('mode-auto');
            this.assert(hasAutoClass, 'Auto mode class is applied');
            
            // Test that primary CTA still exists after mode change
            const primaryCtaAfter = document.querySelector('.primary-cta');
            this.assert(primaryCtaAfter, 'Primary CTA exists after mode change');
        } else {
            this.assert(false, 'RumiState not available for mode testing');
        }
    }
    
    async validateSection4(testName) {
        console.log(`\n--- Running: ${testName} ---`);
        
        // Test receipt view elements
        const receiptContainer = document.getElementById('receipt-view');
        this.assert(receiptContainer, 'Receipt view exists');
        
        // Test receipt details exist
        const receiptDetails = receiptContainer.querySelector('.receipt-details');
        this.assert(receiptDetails, 'Receipt details exist');
        
        // Test nokia display section exists
        const nokiaDisplay = receiptContainer.querySelector('.nokia-section');
        this.assert(nokiaDisplay, 'Nokia display section exists');
    }
    
    // ================================
    // ASSERTION UTILITIES
    // ================================
    
    assert(condition, message) {
        this.testResults.total++;
        if (condition) {
            this.testResults.passed++;
            console.log(`✅ PASS: ${message}`);
        } else {
            this.testResults.failed++;
            console.error(`❌ FAIL: ${message}`);
        }
    }
    
    reportResults() {
        console.log('\n--- UI Validation Results ---');
        console.log(`Total: ${this.testResults.total}`);
        console.log(`Passed: ${this.testResults.passed}`);
        console.log(`Failed: ${this.testResults.failed}`);
    }
}

// Make available globally for tests.html
window.UIValidationTests = UIValidationTests; 