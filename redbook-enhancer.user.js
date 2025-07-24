// ==UserScript==
// @name         小红书阅读增强器 (Redbook Enhancer)
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  增强小红书阅读体验：自动隐藏导航栏、展开内容、优化布局、添加快捷键
// @author       You
// @match        *://*.xiaohongshu.com/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-start
// @updateURL    https://raw.githubusercontent.com/your-repo/redbook-enhancer/main/redbook-enhancer.user.js
// @downloadURL  https://raw.githubusercontent.com/your-repo/redbook-enhancer/main/redbook-enhancer.user.js
// ==/UserScript==

(function() {
    'use strict';

    // 配置选项
    const config = {
        hideNavigation: GM_getValue('hideNavigation', true),
        expandContent: GM_getValue('expandContent', true),
        enhanceReading: GM_getValue('enhanceReading', true),
        enableShortcuts: GM_getValue('enableShortcuts', true),
        widescreenMode: GM_getValue('widescreenMode', false)
    };

    // 主要功能类
    class RedbookEnhancer {
        constructor() {
            this.isWidescreen = config.widescreenMode;
            this.init();
        }

        init() {
            // 添加自定义样式
            this.addStyles();
            
            // 等待DOM加载完成
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.enhance());
            } else {
                this.enhance();
            }

            // 设置变化监听器
            this.setupMutationObserver();
            
            // 设置键盘快捷键
            if (config.enableShortcuts) {
                this.setupKeyboardShortcuts();
            }

            // 显示初始化通知
            this.showNotification('小红书增强器已启用 🎉');
        }

        addStyles() {
            const css = `
                /* 隐藏干扰元素 */
                .top-nav,
                .download-app-bar,
                .login-bar,
                .app-download-banner,
                [class*="download-app"],
                [class*="login-prompt"],
                [class*="auth-banner"],
                .login-overlay,
                .register-overlay,
                .modal-mask,
                [class*="login-modal"],
                [class*="auth-modal"],
                [class*="login-dialog"] {
                    display: none !important;
                }

                /* 增强阅读体验 */
                body.redbook-enhanced {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                }

                /* 主内容居中 */
                body.redbook-enhanced main,
                body.redbook-enhanced .main-content,
                body.redbook-enhanced [class*="main"] {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 20px;
                    transition: max-width 0.3s ease;
                }

                /* 宽屏模式 */
                body.redbook-enhanced.redbook-widescreen main,
                body.redbook-enhanced.redbook-widescreen .main-content,
                body.redbook-enhanced.redbook-widescreen [class*="main"] {
                    max-width: 100%;
                    padding: 0 40px;
                }

                /* 内容展开 */
                body.redbook-enhanced .note-content,
                body.redbook-enhanced .content-container,
                body.redbook-enhanced [class*="content"] {
                    max-height: none !important;
                    overflow: visible !important;
                }

                /* 增强排版 */
                body.redbook-enhanced .note-content p,
                body.redbook-enhanced .content-text {
                    font-size: 16px;
                    line-height: 1.7;
                    margin-bottom: 1em;
                    color: #2c2c2c;
                }

                /* 改进卡片样式 */
                body.redbook-enhanced .note-card,
                body.redbook-enhanced .content-card,
                body.redbook-enhanced [class*="card"] {
                    border-radius: 12px;
                    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
                    border: 1px solid #f0f0f0;
                    transition: box-shadow 0.2s ease;
                    margin-bottom: 20px;
                }

                body.redbook-enhanced .note-card:hover,
                body.redbook-enhanced .content-card:hover,
                body.redbook-enhanced [class*="card"]:hover {
                    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
                }

                /* 通知样式 */
                .redbook-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #ff2442;
                    color: white;
                    padding: 12px 24px;
                    border-radius: 8px;
                    z-index: 10000;
                    font-size: 14px;
                    font-weight: 500;
                    box-shadow: 0 4px 20px rgba(255, 36, 66, 0.3);
                    animation: slideInRight 0.3s ease;
                }

                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                /* 响应式设计 */
                @media (max-width: 768px) {
                    body.redbook-enhanced main,
                    body.redbook-enhanced .main-content,
                    body.redbook-enhanced [class*="main"] {
                        padding: 0 16px;
                    }
                    
                    .redbook-notification {
                        top: 10px;
                        right: 10px;
                        left: 10px;
                        text-align: center;
                    }
                }

                /* 平滑滚动 */
                html.redbook-enhanced {
                    scroll-behavior: smooth;
                }
            `;

            GM_addStyle(css);
        }

        enhance() {
            // 应用增强样式
            document.documentElement.classList.add('redbook-enhanced');
            document.body.classList.add('redbook-enhanced');
            
            if (this.isWidescreen) {
                document.body.classList.add('redbook-widescreen');
            }

            if (config.hideNavigation) {
                this.hideNavigationElements();
            }

            if (config.expandContent) {
                this.expandContent();
            }

            if (config.enhanceReading) {
                this.enhanceReadingExperience();
            }
        }

        hideNavigationElements() {
            // 隐藏顶部导航栏
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

            // 隐藏登录弹窗
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
            // 自动点击展开按钮
            const expandButtons = document.querySelectorAll('[class*="expand"], [class*="show-more"], .展开');
            expandButtons.forEach(button => {
                if (button.textContent.includes('展开') || 
                    button.textContent.includes('更多') || 
                    button.textContent.includes('全文')) {
                    button.click();
                }
            });

            // 移除内容高度限制
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
            // 居中主内容
            const mainContent = document.querySelector('main, .main-content, [class*="main"]');
            if (mainContent) {
                mainContent.style.maxWidth = this.isWidescreen ? '100%' : '1200px';
                mainContent.style.margin = '0 auto';
                mainContent.style.padding = '0 20px';
            }
        }

        setupKeyboardShortcuts() {
            document.addEventListener('keydown', (event) => {
                // 忽略输入框中的按键
                if (event.target.tagName === 'INPUT' || 
                    event.target.tagName === 'TEXTAREA' || 
                    event.target.isContentEditable) {
                    return;
                }

                switch (event.key.toLowerCase()) {
                    case 'w':
                        this.toggleWidescreen();
                        event.preventDefault();
                        break;
                    case 'h':
                        this.toggleNavigationHiding();
                        event.preventDefault();
                        break;
                    case 'e':
                        this.expandAllContent();
                        event.preventDefault();
                        break;
                }
            });
        }

        toggleWidescreen() {
            this.isWidescreen = !this.isWidescreen;
            document.body.classList.toggle('redbook-widescreen', this.isWidescreen);
            this.enhanceReadingExperience();
            
            // 保存设置
            GM_setValue('widescreenMode', this.isWidescreen);
            
            this.showNotification(`宽屏模式: ${this.isWidescreen ? '开启' : '关闭'}`);
        }

        toggleNavigationHiding() {
            config.hideNavigation = !config.hideNavigation;
            GM_setValue('hideNavigation', config.hideNavigation);
            
            if (config.hideNavigation) {
                this.hideNavigationElements();
            } else {
                // 显示导航元素
                const hiddenElements = document.querySelectorAll('[style*="display: none"]');
                hiddenElements.forEach(el => {
                    el.style.display = '';
                });
            }

            this.showNotification(`导航隐藏: ${config.hideNavigation ? '开启' : '关闭'}`);
        }

        expandAllContent() {
            this.expandContent();
            this.showNotification('内容已展开');
        }

        showNotification(message) {
            const notification = document.createElement('div');
            notification.className = 'redbook-notification';
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 2000);
        }

        setupMutationObserver() {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        // 对新内容重新应用增强
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

    // 初始化增强器
    const enhancer = new RedbookEnhancer();

    // 添加控制台信息
    console.log('🎉 小红书阅读增强器已启用');
    console.log('快捷键: W-宽屏模式, H-隐藏导航, E-展开内容');

})();
