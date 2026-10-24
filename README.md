# 奶油紫 · 救场搭子

DeepSeek Harness 0.2.1-rc.2 的本地界面装饰插件。浅色奶油水彩背景、紫色强调色、左下角搭子插画与聊天区右侧的持剑小猪。小猪的手采用参考图里的圆球轮廓，没有写实手指。窄窗口会自动隐藏右侧装饰，避免遮挡阅读和输入。

### 1.1.0 更新

- 换用更鲜明的淡紫、蜜桃、奶油黄和天空蓝水彩底图，加入星星、涂鸦与纸张纹理。
- 修复旧版超长 CSS 变量导致底图不显示的问题；正文区域增加柔和遮罩，侧栏纹理保持比例。
- 输入框增加淡紫描边和柔和阴影；保留圆球手角色造型。

![水彩背景](assets/cream-watercolor.png)

## 从 GitHub 安装

在**完全退出** DeepSeek Harness 后，于 PowerShell 运行：

```powershell
& 'H:\Deepseek_harness\resources\runtime\cli\bin\dsh.cmd' plugin --profile desktop add 'github:1chips8/deepseek-harness-rescue-buddy#v1.1.0'
```

重新打开 Harness。`设置 → 通用设置 → 奶油紫 · 救场搭子` 可以开关主题、角色装饰及调整透明度。该命令同时把仓库包加入 Desktop profile 的依赖和 bundle 列表；无需手工编辑 profile 文件。如果安装路径不同，请将命令开头替换为实际的 `dsh.cmd` 路径。插件不需要登录 DeepSeek 账号或外部图片服务。

后续更新同样先退出 Harness，再运行：

```powershell
& 'H:\Deepseek_harness\resources\runtime\cli\bin\dsh.cmd' plugin --profile desktop add 'github:1chips8/deepseek-harness-rescue-buddy#v1.1.0'
```

如果希望开发时使用本地目录，可将 GitHub 参数替换为 `link:<本仓库的绝对路径>`。本仓库提交了可直接运行的 `dist/`，普通使用不需要自己构建。

## 开发与验证

```powershell
npm test
npm run build
```

`src/` 是代码，`assets/` 是原始素材，`dist/` 是内嵌图片的独立运行文件。插件只修改 Harness 页面中的装饰图层和颜色，不调用模型或上传数据。外观开关保存在当前 Harness Web 视图的 localStorage 中。

1.1.0 在本机独立 Harness Web profile 中完成加载、1918×995 宽屏预览、主题开关恢复和深色模式检查。该验证未改动正在运行的 Desktop profile，也未向模型发送测试消息。

这是非官方个人主题。角色插画基于使用者提供的参考图制作；不代表原作或 DeepSeek 官方授权。仓库没有为所参考的角色形象授予再分发许可。
