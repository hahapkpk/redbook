/**
 * Redbook Enhancer - Content Script
 * Enhances the Redbook (小红书) reading experience
 */

class RedbookEnhancer {
  constructor() {
    this.isWidescreen = false;
    this.settings = {
      hideNavigation: true,
      expandContent: true,
      enhanceReading: true,
      enableShortcuts: true
    };
    
    this.init();
  }

  async init() {
    // Load user settings
    await this.loadSettings();
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.enhance());
    } else {
      this.enhance();
    }
    
    // Setup mutation observer for dynamic content
    this.setupMutationObserver();
    
    // Setup keyboard shortcuts
    if (this.settings.enableShortcuts) {
      this.setupKeyboardShortcuts();
    }
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(this.settings);
      this.settings = { ...this.settings, ...result };
    } catch (error) {
      console.log('Using default settings');
    }
  }

  enhance() {
    if (this.settings.hideNavigation) {
      this.hideNavigationElements();
    }
    
    if (this.settings.expandContent) {
      this.expandContent();
    }
    
    if (this.settings.enhanceReading) {
      this.enhanceReadingExperience();
    }
  }

  hideNavigationElements() {
    // Hide top navigation bar with download app prompts
    const topNavSelectors = [
      '.top-nav',
      '.download-app-bar',
      '.login-bar',
      '.app-download-banner',
      '[class*="download"]',
      '[class*="login-prompt"]'
    ];
    
    topNavSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.style.display = 'none';
      });
    });

    // Hide login/registration overlays
    const overlaySelectors = [
      '.login-overlay',
      '.register-overlay',
      '.modal-mask',
      '[class*="login-modal"]',
      '[class*="auth-modal"]'
    ];
    
    overlaySelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.style.display = 'none';
      });
    });
  }

  expandContent() {
    // Auto-expand truncated text content
    const expandButtons = document.querySelectorAll('[class*="expand"], [class*="show-more"], .展开');
    expandButtons.forEach(button => {
      if (button.textContent.includes('展开') || button.textContent.includes('更多')) {
        button.click();
      }
    });

    // Remove height restrictions on content containers
    const contentSelectors = [
      '.note-content',
      '.content-container',
      '[class*="content"]'
    ];
    
    contentSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.style.maxHeight = 'none';
        el.style.overflow = 'visible';
      });
    });
  }

  enhanceReadingExperience() {
    // Add custom CSS class to body for styling
    document.body.classList.add('redbook-enhanced');
    
    // Center main content
    const mainContent = document.querySelector('main, .main-content, [class*="main"]');
    if (mainContent) {
      mainContent.style.maxWidth = this.isWidescreen ? '100%' : '1200px';
      mainContent.style.margin = '0 auto';
      mainContent.style.padding = '0 20px';
    }
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
      // Ignore if user is typing in input fields
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      switch (event.key.toLowerCase()) {
        case 'w':
          this.toggleWidescreen();
          break;
        case 'h':
          this.toggleNavigationHiding();
          break;
        case 'e':
          this.expandAllContent();
          break;
      }
    });
  }

  toggleWidescreen() {
    this.isWidescreen = !this.isWidescreen;
    document.body.classList.toggle('redbook-widescreen', this.isWidescreen);
    this.enhanceReadingExperience();
    
    // Show notification
    this.showNotification(`宽屏模式: ${this.isWidescreen ? '开启' : '关闭'}`);
  }

  toggleNavigationHiding() {
    this.settings.hideNavigation = !this.settings.hideNavigation;
    if (this.settings.hideNavigation) {
      this.hideNavigationElements();
    } else {
      // Show navigation elements
      const hiddenElements = document.querySelectorAll('[style*="display: none"]');
      hiddenElements.forEach(el => {
        el.style.display = '';
      });
    }
    
    this.showNotification(`导航隐藏: ${this.settings.hideNavigation ? '开启' : '关闭'}`);
  }

  expandAllContent() {
    this.expandContent();
    this.showNotification('内容已展开');
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'redbook-notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ff2442;
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      z-index: 10000;
      font-size: 14px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 2000);
  }

  setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Re-apply enhancements to new content
          setTimeout(() => this.enhance(), 100);
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// Initialize the enhancer
const redbookEnhancer = new RedbookEnhancer();

// Make it globally accessible for background script
window.redbookEnhancer = redbookEnhancer;

// Handle messages from popup and background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'setMode':
      if (request.mode === 'widescreen') {
        redbookEnhancer.isWidescreen = true;
        document.body.classList.add('redbook-widescreen');
      } else {
        redbookEnhancer.isWidescreen = false;
        document.body.classList.remove('redbook-widescreen');
      }
      redbookEnhancer.enhanceReadingExperience();
      sendResponse({ success: true });
      break;

    case 'expandAll':
      redbookEnhancer.expandAllContent();
      sendResponse({ success: true });
      break;

    case 'settingsChanged':
      redbookEnhancer.loadSettings().then(() => {
        redbookEnhancer.enhance();
      });
      sendResponse({ success: true });
      break;

    case 'toggle':
      const isEnabled = document.body.classList.contains('redbook-enhanced');
      if (isEnabled) {
        document.body.classList.remove('redbook-enhanced', 'redbook-widescreen');
      } else {
        document.body.classList.add('redbook-enhanced');
        redbookEnhancer.enhance();
      }
      sendResponse({ success: true, enabled: !isEnabled });
      break;

    default:
      sendResponse({ error: 'Unknown action' });
  }
});
