# Noter 插件发布指南

## 已完成的准备工作

- [x] 英文 README.md
- [x] manifest.json（包含 authorUrl、英文描述）
- [x] icon.svg（144x144 插件图标）
- [x] package.json（包含 author 字段）

## 发布步骤

### 1. 创建 GitHub 仓库

如果还没有公开仓库，需要创建：

1. 在 GitHub 上创建新仓库 `noter`
2. 推送代码：
   ```bash
   git add .
   git commit -m "Prepare for Obsidian community plugin submission"
   git push origin main
   ```

3. 创建 Release：
   - 在 GitHub 上创建新的 Release
   - Tag 版本：`v1.2.0`
   - 上传构建产物（main.js, manifest.json, styles.css）
   - 或者使用自动打包

### 2. 构建生产版本

```bash
npm install
npm run build
```

确保 `dist/` 目录包含：
- main.js
- manifest.json
- styles.css

### 3. Fork 社区插件仓库

1. 访问 https://github.com/obsidianmd/obsidian-releases
2. Fork 到自己的账户

### 4. 提交插件信息

1. 在 fork 的仓库中，编辑 `community-plugins.json`
2. 添加你的插件信息：

```json
{
  "id": "noter",
  "name": "Noter",
  "description": "A Flomo-style quick note plugin for capturing ideas instantly with tag management.",
  "author": "limaosheng",
  "repo": "你的 GitHub 用户名/noter"
}
```

3. 提交 PR 到 `obsidianmd/obsidian-releases` 的 `master` 分支

### 5. 等待审核

- Obsidian 团队会审核你的插件
- 可能需要根据反馈进行修改
- 审核通过后，插件会出现在社区插件列表中

## 检查清单

在提交 PR 之前，请确保：

- [ ] GitHub 仓库是公开的
- [ ] README.md 是英文的
- [ ] manifest.json 中的 `authorUrl` 指向有效的 URL（如 GitHub 个人主页）
- [ ] 有插件图标（icon.svg 或 icon.png）
- [ ] 插件可以正常构建和运行
- [ ] 没有使用任何可能引起安全问题的外部依赖

## 后续维护

发布后：

1. **版本更新**：每次更新后创建新的 GitHub Release
2. **更新 community-plugins.json**：如果仓库名变更，需要更新
3. **回应用户反馈**：及时处理 issue 和 PR

## 相关链接

- [Obsidian 插件开发文档](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- [社区插件提交流程](https://docs.obsidian.md/Plugins/Releasing/Submit+a+plugin)
- [community-plugins.json 示例](https://github.com/obsidianmd/obsidian-releases/blob/master/community-plugins.json)

---

祝发布顺利！
