/**
 * Redbook Enhancer - Popup Script
 * Handles the extension popup interface
 */

class PopupManager {
  constructor() {
    this.settings = {};
    this.init();
  }

  async init() {
    await this.loadSettings();
    this.setupEventListeners();
    this.updateUI();
    this.checkStatus();
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get({
        hideNavigation: true,
        expandContent: true,
        enhanceReading: true,
        enableShortcuts: true,
        widescreenMode: false
      });
      this.settings = result;
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  async saveSettings() {
    try {
      await chrome.storage.sync.set(this.settings);
      this.showFeedback('设置已保存');
    } catch (error) {
      console.error('Failed to save settings:', error);
      this.showFeedback('保存失败', 'error');
    }
  }

  setupEventListeners() {
    // Setting checkboxes
    const checkboxes = ['hideNavigation', 'expandContent', 'enhanceReading', 'enableShortcuts'];
    checkboxes.forEach(setting => {
      const checkbox = document.getElementById(setting);
      if (checkbox) {
        checkbox.addEventListener('change', (e) => {
          this.settings[setting] = e.target.checked;
          this.saveSettings();
        });
      }
    });

    // Mode buttons
    document.getElementById('normalMode')?.addEventListener('click', () => {
      this.setMode('normal');
    });

    document.getElementById('widescreenMode')?.addEventListener('click', () => {
      this.setMode('widescreen');
    });

    // Action buttons
    document.getElementById('expandAll')?.addEventListener('click', () => {
      this.expandAllContent();
    });

    document.getElementById('resetSettings')?.addEventListener('click', () => {
      this.resetSettings();
    });
  }

  updateUI() {
    // Update checkboxes
    Object.keys(this.settings).forEach(setting => {
      const checkbox = document.getElementById(setting);
      if (checkbox && typeof this.settings[setting] === 'boolean') {
        checkbox.checked = this.settings[setting];
      }
    });

    // Update mode buttons
    const normalBtn = document.getElementById('normalMode');
    const widescreenBtn = document.getElementById('widescreenMode');
    
    if (this.settings.widescreenMode) {
      normalBtn?.classList.remove('active');
      widescreenBtn?.classList.add('active');
    } else {
      normalBtn?.classList.add('active');
      widescreenBtn?.classList.remove('active');
    }
  }

  async setMode(mode) {
    this.settings.widescreenMode = (mode === 'widescreen');
    await this.saveSettings();
    this.updateUI();

    // Send message to content script
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url && tab.url.includes('xiaohongshu.com')) {
        await chrome.tabs.sendMessage(tab.id, {
          action: 'setMode',
          mode: mode
        });
      }
    } catch (error) {
      console.log('Could not send message to content script');
    }
  }

  async expandAllContent() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url && tab.url.includes('xiaohongshu.com')) {
        await chrome.tabs.sendMessage(tab.id, {
          action: 'expandAll'
        });
        this.showFeedback('内容已展开');
      } else {
        this.showFeedback('请在小红书页面使用此功能', 'warning');
      }
    } catch (error) {
      console.error('Failed to expand content:', error);
      this.showFeedback('操作失败', 'error');
    }
  }

  async resetSettings() {
    if (confirm('确定要重置所有设置吗？')) {
      const defaultSettings = {
        hideNavigation: true,
        expandContent: true,
        enhanceReading: true,
        enableShortcuts: true,
        widescreenMode: false
      };
      
      this.settings = defaultSettings;
      await this.saveSettings();
      this.updateUI();
      this.showFeedback('设置已重置');
    }
  }

  async checkStatus() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const statusText = document.getElementById('statusText');
      const statusDot = document.querySelector('.status-dot');
      
      if (tab && tab.url && tab.url.includes('xiaohongshu.com')) {
        statusText.textContent = '已启用';
        statusDot.classList.add('active');
      } else {
        statusText.textContent = '未在小红书页面';
        statusDot.classList.remove('active');
      }
    } catch (error) {
      console.error('Failed to check status:', error);
    }
  }

  showFeedback(message, type = 'success') {
    // Create feedback element
    const feedback = document.createElement('div');
    feedback.className = `feedback ${type}`;
    feedback.textContent = message;
    feedback.style.cssText = `
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      z-index: 1000;
      animation: fadeInOut 2s ease;
      ${type === 'success' ? 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;' : ''}
      ${type === 'error' ? 'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;' : ''}
      ${type === 'warning' ? 'background: #fff3cd; color: #856404; border: 1px solid #ffeaa7;' : ''}
    `;

    document.body.appendChild(feedback);

    // Remove after animation
    setTimeout(() => {
      feedback.remove();
    }, 2000);
  }
}

// Add CSS for feedback animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
    20% { opacity: 1; transform: translateX(-50%) translateY(0); }
    80% { opacity: 1; transform: translateX(-50%) translateY(0); }
    100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
  }
`;
document.head.appendChild(style);

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});

// Handle messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'updatePopup':
      // Refresh popup state
      window.location.reload();
      break;
  }
});
