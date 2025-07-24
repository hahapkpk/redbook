# 安装指南 (Installation Guide)

## 快速安装 (Quick Install)

### 第一步：安装 Tampermonkey
1. 根据你的浏览器选择对应的扩展：
   - **Chrome**: https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo
   - **Firefox**: https://addons.mozilla.org/firefox/addon/tampermonkey/
   - **Edge**: https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd
   - **Safari**: https://apps.apple.com/app/tampermonkey/id1482490089

### 第二步：安装脚本
1. 点击项目中的 `redbook-enhancer.user.js` 文件
2. 复制所有代码内容
3. 打开 Tampermonkey 管理面板（点击浏览器工具栏中的 Tampermonkey 图标）
4. 点击 "创建新脚本" 或 "添加新脚本"
5. 删除默认内容，粘贴复制的代码
6. 按 `Ctrl+S` (Windows) 或 `Cmd+S` (Mac) 保存脚本
7. 访问 xiaohongshu.com 即可看到效果！

## 功能验证

安装成功后，访问小红书网站，你应该能看到：
- 页面右上角出现 "小红书阅读增强器已启用 🎉" 的通知
- 顶部的下载App提示被隐藏
- 页面内容自动居中显示
- 可以使用快捷键：
  - `W`: 切换宽屏模式
  - `H`: 切换导航栏隐藏  
  - `E`: 展开所有内容

## 故障排除

### 脚本没有生效？
1. 确认 Tampermonkey 扩展已启用
2. 检查脚本是否已保存并启用
3. 刷新小红书页面
4. 查看浏览器控制台是否有错误信息

### 快捷键不工作？
1. 确保不在输入框中按快捷键
2. 检查是否与其他扩展的快捷键冲突
3. 尝试在页面的空白区域按快捷键

### 样式显示异常？
1. 清除浏览器缓存
2. 检查是否有其他样式扩展冲突
3. 尝试禁用其他相关扩展

## 更新脚本

当有新版本时：
1. 复制新版本的代码
2. 在 Tampermonkey 管理面板中找到旧脚本
3. 点击编辑，替换为新代码
4. 保存并刷新页面

## 卸载脚本

如需卸载：
1. 打开 Tampermonkey 管理面板
2. 找到 "小红书阅读增强器" 脚本
3. 点击删除按钮
4. 刷新小红书页面即可恢复原样
