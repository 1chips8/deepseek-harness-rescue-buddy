# 奶油紫 · 救场搭子

DeepSeek Harness 0.2.1-rc.2 的本地界面装饰插件。浅色奶油水彩背景、紫色强调色、左下角搭子插画与聊天区右侧的持剑小猪。小猪的手采用参考图里的圆球轮廓，没有写实手指。窄窗口会自动隐藏右侧装饰，避免遮挡阅读和输入。

## 从 GitHub 安装

在**完全退出** DeepSeek Harness 后，于 PowerShell 运行：

```powershell
& 'H:\Deepseek_harness\resources\runtime\cli\bin\dsh.cmd' plugin --profile desktop add 'github:1chips8/deepseek-harness-rescue-buddy'
```

重新打开 Harness。`设置 → 通用设置 → 奶油紫 · 救场搭子` 可以开关主题、角色装饰及调整透明度。该命令同时把仓库包加入 Desktop profile 的依赖和 bundle 列表；无需手工编辑 profile 文件。如果安装路径不同，请将命令开头替换为实际的 `dsh.cmd` 路径。插件不需要登录 DeepSeek 账号或外部图片服务。

后续更新同样先退出 Harness，再运行：

```powershell
& 'H:\Deepseek_harness\resources\runtime\cli\bin\dsh.cmd' plugin --profile desktop add 'github:1chips8/deepseek-harness-rescue-buddy'
```

如果希望开发时使用本地目录，可将 GitHub 参数替换为 `link:<本仓库的绝对路径>`。本仓库提交了可直接运行的 `dist/`，普通使用不需要自己构建。

## 开发与验证

```powershell
npm test
npm run build
```

`src/` 是代码，`assets/` 是原始素材，`dist/` 是内嵌图片的独立运行文件。插件只修改 Harness 页面中的装饰图层和颜色，不调用模型或上传数据。外观开关保存在当前 Harness Web 视图的 localStorage 中。

这是非官方个人主题。角色插画基于使用者提供的参考图制作；不代表原作或 DeepSeek 官方授权。仓库没有为所参考的角色形象授予再分发许可。
