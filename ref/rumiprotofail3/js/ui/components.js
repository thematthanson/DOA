// ================================
// RUMI UI COMPONENTS
// UI component functions and interactions
// ================================

class RumiUIComponents {
    constructor() {
        this.components = new Map();
        this.animations = new Map();
        this.eventListeners = new Map();

        // Initialize mode-specific UI
        if (window.RumiState) {
            const currentMode = window.RumiState.getState('mode');
            this.updateModeSpecificUI(currentMode);
        }

        // Listen for mode changes
        if (window.RumiState) {
            window.RumiState.addStateHandler('mode', (newMode) => {
                this.updateModeSpecificUI(newMode);
            });
        }
    }
    
    // ================================
    // COMPONENT REGISTRATION
    // ================================
    
    registerComponent(name, element, config = {}) {
        this.components.set(name, {
            element: element,
            config: config,
            state: {}
        });
        
        console.log(`🎯 UI: Component registered - ${name}`);
    }
    
    getComponent(name) {
        return this.components.get(name);
    }
    
    // ================================
    // ANIMATION SYSTEM
    // ================================
    
    animateElement(element, animation, duration = 1000, easing = 'ease-in-out') {
        const keyframes = this.getAnimationKeyframes(animation);
        
        if (!keyframes) {
            console.warn(`🎯 UI: Unknown animation - ${animation}`);
            return;
        }
        
        const animationId = `${element.id || 'anonymous'}-${animation}`;
        
        // Cancel existing animation
        if (this.animations.has(animationId)) {
            this.animations.get(animationId).cancel();
        }
        
        const anim = element.animate(keyframes, {
            duration: duration,
            easing: easing,
            fill: 'forwards'
        });
        
        this.animations.set(animationId, anim);
        
        anim.onfinish = () => {
            this.animations.delete(animationId);
        };
        
        return anim;
    }
    
    getAnimationKeyframes(animation) {
        const keyframes = {
            fadeIn: [
                { opacity: 0, transform: 'translateY(10px)' },
                { opacity: 1, transform: 'translateY(0)' }
            ],
            fadeOut: [
                { opacity: 1, transform: 'translateY(0)' },
                { opacity: 0, transform: 'translateY(-10px)' }
            ],
            slideIn: [
                { transform: 'translateX(-100%)' },
                { transform: 'translateX(0)' }
            ],
            slideOut: [
                { transform: 'translateX(0)' },
                { transform: 'translateX(100%)' }
            ],
            pulse: [
                { transform: 'scale(1)' },
                { transform: 'scale(1.05)' },
                { transform: 'scale(1)' }
            ],
            shake: [
                { transform: 'translateX(0)' },
                { transform: 'translateX(-5px)' },
                { transform: 'translateX(5px)' },
                { transform: 'translateX(-5px)' },
                { transform: 'translateX(0)' }
            ],
            glow: [
                { boxShadow: '0 0 5px #00ff41' },
                { boxShadow: '0 0 20px #00ff41, 0 0 30px #00ff41' },
                { boxShadow: '0 0 5px #00ff41' }
            ]
        };
        
        return keyframes[animation];
    }
    
    // ================================
    // MESSAGE SYSTEM
    // ================================
    
    showMessage(message, type = 'info', duration = 5000) {
        const messageArea = document.getElementById('message-area');
        const messageText = document.getElementById('message-text');
        
        if (!messageArea || !messageText) {
            console.warn('🎯 UI: Message area not found');
            return;
        }
        
        // Clear existing classes
        messageArea.className = 'message-area';
        
        // Add mode-specific class
        if (window.RumiState) {
            const currentMode = window.RumiState.getState('mode');
            messageArea.classList.add(currentMode === 'auto' ? 'automode' : 'detected-mode');
        }
        
        // Set message content and type
        messageText.textContent = message;
        if (type !== 'normal') {
            messageArea.classList.add(type);
        }
        
        // Show message
        messageArea.style.display = 'flex';
        
        // Auto-hide after duration
        if (duration > 0) {
            setTimeout(() => {
                this.hideMessage();
            }, duration);
        }
        
        console.log(`🎯 UI: Message shown - ${type}: ${message}`);
    }
    
    hideMessage() {
        const messageArea = document.getElementById('message-area');
        if (messageArea) {
            messageArea.style.display = 'none';
        }
    }
    
    showError(message, details = '') {
        this.showMessage(message, 'error');
        
        if (details) {
            const messageDetails = document.getElementById('message-details');
            if (messageDetails) {
                messageDetails.innerHTML = details;
                messageDetails.style.display = 'block';
            }
        }
    }
    
    showWarning(message) {
        this.showMessage(message, 'warning');
    }
    
    showInfo(message) {
        this.showMessage(message, 'info');
    }
    
    // ================================
    // MODAL SYSTEM
    // ================================
    
    showModal(content, options = {}) {
        const modal = this.createModal(content, options);
        document.body.appendChild(modal);
        
        // Animate in
        this.animateElement(modal, 'fadeIn', 300);
        
        return modal;
    }
    
    createModal(content, options = {}) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.cssText = `
            background: #111;
            border: 1px solid #333;
            border-radius: 8px;
            padding: 20px;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
            color: #fff;
            font-family: 'SF Mono', monospace;
        `;
        
        modalContent.innerHTML = content;
        modal.appendChild(modalContent);
        
        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
            }
        });
        
        return modal;
    }
    
    closeModal(modal) {
        if (!modal) return;
        
        this.animateElement(modal, 'fadeOut', 300).onfinish = () => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        };
    }
    
    // ================================
    // TOOLTIP SYSTEM
    // ================================
    
    showTooltip(element, text, position = 'top') {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        tooltip.style.cssText = `
            position: absolute;
            background: #000;
            color: #fff;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 11px;
            font-family: 'SF Mono', monospace;
            z-index: 1000;
            pointer-events: none;
            white-space: nowrap;
            border: 1px solid #333;
        `;
        
        document.body.appendChild(tooltip);
        
        // Position tooltip
        this.positionTooltip(tooltip, element, position);
        
        // Show tooltip
        this.animateElement(tooltip, 'fadeIn', 200);
        
        return tooltip;
    }
    
    positionTooltip(tooltip, element, position) {
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let top, left;
        
        switch (position) {
            case 'top':
                top = rect.top - tooltipRect.height - 8;
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'bottom':
                top = rect.bottom + 8;
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'left':
                top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                left = rect.left - tooltipRect.width - 8;
                break;
            case 'right':
                top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                left = rect.right + 8;
                break;
        }
        
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
    }
    
    hideTooltip(tooltip) {
        if (!tooltip) return;
        
        this.animateElement(tooltip, 'fadeOut', 200).onfinish = () => {
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        };
    }
    
    // ================================
    // PROGRESS INDICATORS
    // ================================
    
    updateProgressBar(element, progress, animate = true) {
        if (!element) return;
        
        const fill = element.querySelector('.progress-fill') || element;
        const targetWidth = `${progress}%`;
        
        if (animate) {
            fill.style.transition = 'width 0.3s ease';
        } else {
            fill.style.transition = 'none';
        }
        
        fill.style.width = targetWidth;
    }
    
    createProgressBar(container, options = {}) {
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.style.cssText = `
            width: 100%;
            height: 8px;
            background: #333;
            border-radius: 4px;
            overflow: hidden;
            position: relative;
        `;
        
        const fill = document.createElement('div');
        fill.className = 'progress-fill';
        fill.style.cssText = `
            height: 100%;
            background: #00ff41;
            width: 0%;
            transition: width 0.3s ease;
        `;
        
        progressBar.appendChild(fill);
        container.appendChild(progressBar);
        
        return progressBar;
    }
    
    // ================================
    // NOTIFICATION SYSTEM
    // ================================
    
    showNotification(message, type = 'info', duration = 3000) {
        const notification = this.createNotification(message, type);
        document.body.appendChild(notification);
        
        // Position notification
        this.positionNotification(notification);
        
        // Animate in
        this.animateElement(notification, 'slideIn', 300);
        
        // Auto-remove
        setTimeout(() => {
            this.hideNotification(notification);
        }, duration);
        
        return notification;
    }
    
    createNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        
        const colors = {
            info: '#00ff41',
            warning: '#ffaa00',
            error: '#ff4444',
            success: '#00ff41'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #111;
            color: #fff;
            padding: 12px 16px;
            border-radius: 6px;
            border: 1px solid ${colors[type] || colors.info};
            font-family: 'SF Mono', monospace;
            font-size: 12px;
            z-index: 1000;
            max-width: 300px;
            transform: translateX(100%);
        `;
        
        notification.textContent = message;
        
        return notification;
    }
    
    positionNotification(notification) {
        const notifications = document.querySelectorAll('.notification');
        const topOffset = 20 + (notifications.length - 1) * 60;
        notification.style.top = `${topOffset}px`;
    }
    
    hideNotification(notification) {
        if (!notification) return;
        
        this.animateElement(notification, 'slideOut', 300).onfinish = () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        };
    }
    
    // ================================
    // FORM COMPONENTS
    // ================================
    
    createInput(config) {
        const input = document.createElement('input');
        input.type = config.type || 'text';
        input.placeholder = config.placeholder || '';
        input.value = config.value || '';
        
        input.style.cssText = `
            background: #222;
            border: 1px solid #333;
            color: #fff;
            padding: 8px 12px;
            border-radius: 4px;
            font-family: 'SF Mono', monospace;
            font-size: 12px;
            width: 100%;
            box-sizing: border-box;
        `;
        
        if (config.onChange) {
            input.addEventListener('input', config.onChange);
        }
        
        return input;
    }
    
    createSelect(options, config = {}) {
        const select = document.createElement('select');
        
        select.style.cssText = `
            background: #222;
            border: 1px solid #333;
            color: #fff;
            padding: 8px 12px;
            border-radius: 4px;
            font-family: 'SF Mono', monospace;
            font-size: 12px;
            width: 100%;
            box-sizing: border-box;
        `;
        
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            select.appendChild(optionElement);
        });
        
        if (config.onChange) {
            select.addEventListener('change', config.onChange);
        }
        
        return select;
    }
    
    createButton(text, config = {}) {
        const button = document.createElement('button');
        button.textContent = text;
        
        const baseStyle = `
            background: #222;
            border: 1px solid #00ff41;
            color: #00ff41;
            padding: 8px 16px;
            border-radius: 4px;
            font-family: 'SF Mono', monospace;
            font-size: 12px;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 1px;
            transition: all 0.2s ease;
        `;
        
        button.style.cssText = baseStyle;
        
        if (config.primary) {
            button.style.background = '#00ff41';
            button.style.color = '#000';
        }
        
        if (config.danger) {
            button.style.borderColor = '#ff4444';
            button.style.color = '#ff4444';
        }
        
        if (config.onClick) {
            button.addEventListener('click', config.onClick);
        }
        
        return button;
    }
    
    // ================================
    // UTILITY FUNCTIONS
    // ================================
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // ================================
    // EVENT HANDLING
    // ================================
    
    addEventListener(element, event, handler, options = {}) {
        const key = `${element.id || 'anonymous'}-${event}`;
        
        if (!this.eventListeners.has(key)) {
            this.eventListeners.set(key, []);
        }
        
        this.eventListeners.get(key).push(handler);
        element.addEventListener(event, handler, options);
    }
    
    removeEventListener(element, event, handler) {
        const key = `${element.id || 'anonymous'}-${event}`;
        const handlers = this.eventListeners.get(key);
        
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
                element.removeEventListener(event, handler);
            }
        }
    }
    
    // ================================
    // CLEANUP
    // ================================
    
    cleanup() {
        // Cancel all animations
        this.animations.forEach(animation => {
            animation.cancel();
        });
        this.animations.clear();
        
        // Remove all event listeners
        this.eventListeners.forEach(handlers => {
            handlers.forEach(handler => {
                // Note: We can't easily remove these without tracking the original elements
                // This is a simplified cleanup
            });
        });
        this.eventListeners.clear();
        
        // Clear components
        this.components.clear();
        
        console.log('🎯 UI: Components cleaned up');
    }

    // ================================
    // SHOW DETECTION DISPLAY
    // ================================

    showDetectedShow(showName) {
        const showDisplay = document.querySelector('.show-name-display');
        if (!showDisplay) {
            console.warn('🎯 UI: Show name display not found');
            return;
        }

        showDisplay.textContent = showName;
        showDisplay.style.display = 'block';
        this.animateElement(showDisplay, 'fadeIn', 300);
    }

    // ================================
    // CONTENT BLOCK SYNC
    // ================================

    syncContentBlockWithNokia(blockData) {
        const nokiaSection = document.querySelector('.nokia-section');
        const contentBlock = document.querySelector('.content-block');
        
        if (!nokiaSection || !contentBlock) {
            console.warn('🎯 UI: Nokia or content block not found');
            return;
        }

        // Update Nokia display
        const nokiaDisplay = nokiaSection.querySelector('pre');
        if (nokiaDisplay) {
            nokiaDisplay.textContent = this.formatNokiaDisplay(blockData);
        }

        // Update content block
        const blockDisplay = contentBlock.querySelector('.block-content');
        if (blockDisplay) {
            blockDisplay.textContent = blockData.content;
        }

        // Animate sync
        this.animateElement(nokiaSection, 'pulse', 300);
        this.animateElement(contentBlock, 'pulse', 300);
    }

    formatNokiaDisplay(blockData) {
        return `
${blockData.title}
[Block ${blockData.index}/${blockData.total}]
${'-'.repeat(20)}
${blockData.content.substring(0, 30)}...
`;
    }

    // ================================
    // MODE-SPECIFIC UI
    // ================================

    updateModeSpecificUI(mode) {
        // Update button states
        const buttons = document.querySelectorAll('.primary-cta, .secondary-button');
        buttons.forEach(button => {
            button.classList.remove('detected-mode', 'automode');
            button.classList.add(mode === 'auto' ? 'automode' : 'detected-mode');
        });

        // Update animations
        const animations = document.querySelectorAll('.holistic-animation pre');
        animations.forEach(animation => {
            animation.classList.remove('detected-mode', 'automode');
            animation.classList.add(mode === 'auto' ? 'automode' : 'detected-mode');
        });

        // Update Nokia display
        const nokiaDisplay = document.querySelector('.nokia-visual');
        if (nokiaDisplay) {
            nokiaDisplay.classList.remove('detected-mode', 'automode');
            nokiaDisplay.classList.add(mode === 'auto' ? 'automode' : 'detected-mode');
        }

        // Update points display
        const pointsElements = document.querySelectorAll('.points-total, .points-multiplier');
        pointsElements.forEach(element => {
            element.classList.remove('detected-mode', 'automode');
            element.classList.add(mode === 'auto' ? 'automode' : 'detected-mode');
        });
    }

    // ================================
    // HOLISTIC PANEL ENHANCEMENTS
    // ================================

    initializeHolisticPanel() {
        const holisticPanel = document.querySelector('.holistic-panel');
        if (holisticPanel) {
            holisticPanel.addEventListener('mouseenter', this.handleHolisticPanelHover.bind(this));
            holisticPanel.addEventListener('mouseleave', this.handleHolisticPanelLeave.bind(this));
        }
    }

    async handleHolisticPanelHover(event) {
        const content = RumiState.getState('channelContent');
        if (!content || content.length === 0) return;

        const upcomingContent = content.slice(0, 5).map(item => `<li>${item.title}</li>`).join('');
        const tooltipContent = `
            <strong>Upcoming Content:</strong>
            <ul style="list-style: none; padding: 0; margin-top: 5px;">${upcomingContent}</ul>
        `;
        
        this.currentTooltip = this.showTooltip(event.currentTarget, tooltipContent, 'bottom');
    }

    handleHolisticPanelLeave(event) {
        if (this.currentTooltip) {
            this.hideTooltip(this.currentTooltip);
            this.currentTooltip = null;
        }
    }
}

// Global instance
window.RumiUI = new RumiUIComponents();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RumiUIComponents;
}

/**
 * Populate receipt view with session data
 * @param {Object} sessionData Session data
 */
async function populateReceiptView(sessionData) {
    // Update points and pending
    document.getElementById('receipt-total-points').textContent = 
        `+${sessionData.totalPoints.toFixed(2)}`;
    document.getElementById('receipt-total-pending').textContent = 
        `${sessionData.pendingPoints.toFixed(2)}`;

    // Update session details
    document.getElementById('receipt-duration').textContent = 
        formatDuration(sessionData.sessionDuration);
    document.getElementById('receipt-multiplier').textContent = 
        `${sessionData.multiplier.toFixed(1)}x`;
    document.getElementById('receipt-content').textContent = 
        sessionData.contentType || 'Unknown';
    document.getElementById('receipt-chain-bonus').textContent = 
        `+${sessionData.chainBonus.toFixed(1)}`;

    // Generate and update Nokia display
    if (sessionData.completedShows && sessionData.completedShows.length > 0) {
        const lastShow = sessionData.completedShows[sessionData.completedShows.length - 1];
        const asciiArt = await window.RumiAscii.generateNokiaDisplay(lastShow.title, {
            duration: sessionData.sessionDuration,
            blocks: sessionData.completedShows.length
        });
        window.RumiAscii.updateNokiaSection(asciiArt);
    }

    // Show receipt view
    document.getElementById('receipt-view').style.display = 'block';
    document.getElementById('main-view').style.display = 'none';

    // Add content indexed logging
    const contentLog = document.createElement('div');
    contentLog.className = 'content-log';
    contentLog.innerHTML = `
        <h3>Content Indexed</h3>
        <div class="indexed-content">
            ${sessionData.indexedContent.map(content => `
                <div class="content-item">
                    <span class="content-title">${content.title}</span>
                    <span class="content-time">${content.timestamp}</span>
                </div>
            `).join('')}
        </div>
    `;
    
    receiptContainer.appendChild(contentLog);
} 