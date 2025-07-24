/**
 * Redbook Enhancer - Background Script
 * Handles extension lifecycle and settings management
 */

// Initialize extension
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default settings on first install
    const defaultSettings = {
      hideNavigation: true,
      expandContent: true,
      enhanceReading: true,
      enableShortcuts: true,
      widescreenMode: false
    };
    
    chrome.storage.sync.set(defaultSettings);
    
    // Open welcome page or show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Redbook Enhancer 已安装',
      message: '点击扩展图标来配置设置，或按 W 键切换宽屏模式！'
    });
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Check if we're on a Redbook page
  if (tab.url && tab.url.includes('xiaohongshu.com')) {
    // Toggle the extension on/off or open popup
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: toggleExtension
    });
  } else {
    // Show notification if not on Redbook
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Redbook Enhancer',
      message: '请在小红书网站上使用此扩展'
    });
  }
});

// Function to inject into page for toggling
function toggleExtension() {
  const body = document.body;
  const isEnabled = body.classList.contains('redbook-enhanced');
  
  if (isEnabled) {
    body.classList.remove('redbook-enhanced', 'redbook-widescreen');
    // Show notification
    const notification = document.createElement('div');
    notification.className = 'redbook-notification';
    notification.textContent = 'Redbook Enhancer 已禁用';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #666;
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      z-index: 10000;
      font-size: 14px;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
  } else {
    body.classList.add('redbook-enhanced');
    // Re-initialize enhancer
    if (window.redbookEnhancer) {
      window.redbookEnhancer.enhance();
    }
  }
}

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'updateSettings':
      chrome.storage.sync.set(request.settings);
      sendResponse({ success: true });
      break;
      
    case 'getSettings':
      chrome.storage.sync.get(null, (settings) => {
        sendResponse({ settings });
      });
      return true; // Keep message channel open for async response
      
    case 'showNotification':
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: request.title || 'Redbook Enhancer',
        message: request.message
      });
      break;
      
    default:
      sendResponse({ error: 'Unknown action' });
  }
});

// Handle keyboard shortcuts (if defined in manifest)
chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab && tab.url && tab.url.includes('xiaohongshu.com')) {
      switch (command) {
        case 'toggle-widescreen':
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => {
              if (window.redbookEnhancer) {
                window.redbookEnhancer.toggleWidescreen();
              }
            }
          });
          break;
          
        case 'toggle-navigation':
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => {
              if (window.redbookEnhancer) {
                window.redbookEnhancer.toggleNavigationHiding();
              }
            }
          });
          break;
          
        case 'expand-content':
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => {
              if (window.redbookEnhancer) {
                window.redbookEnhancer.expandAllContent();
              }
            }
          });
          break;
      }
    }
  });
});

// Monitor tab updates to re-inject on navigation
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && 
      tab.url && 
      tab.url.includes('xiaohongshu.com')) {
    
    // Small delay to ensure page is fully loaded
    setTimeout(() => {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: () => {
          // Re-initialize if content script exists
          if (window.RedbookEnhancer) {
            new window.RedbookEnhancer();
          }
        }
      });
    }, 1000);
  }
});

// Handle storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    // Notify all Redbook tabs about settings changes
    chrome.tabs.query({ url: '*://*.xiaohongshu.com/*' }, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          action: 'settingsChanged',
          changes: changes
        }).catch(() => {
          // Ignore errors for tabs that don't have content script
        });
      });
    });
  }
});
