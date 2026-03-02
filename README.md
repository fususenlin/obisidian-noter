# Noter - Obsidian 插件

一个类似 Flomo 的快速笔记插件，集成在 Obsidian 侧边栏，提供流畅的卡片笔记体验。

## ✨ 功能特性

- 🚀 **快速记录**：类似 Flomo 的简洁输入框，支持快速记录想法
- 🏷️ **标签管理**：自动识别 `#标签`，支持标签筛选和标签云
- 📅 **回顾功能**：支持今日往昔、随机漫步等回顾模式
- 💾 **本地存储**：笔记以 Markdown 格式存储在本地，完全掌控数据
- 🎨 **美观界面**：卡片式设计，支持 Obsidian 主题
- 🔍 **快速搜索**：支持按内容或标签搜索笔记

## 📦 安装方法

### 方法一：手动安装（推荐）

1. 下载插件文件
   - 从 GitHub Releases 下载最新版本的 `main.js`、`manifest.json` 和 `styles.css`

2. 创建插件目录
   - 在你的 Obsidian Vault 中找到 `.obsidian/plugins/` 目录
   - 创建新文件夹 `noter`

3. 复制文件
   - 将 `main.js`、`manifest.json` 和 `styles.css` 复制到 `noter` 文件夹

4. 启用插件
   - 打开 Obsidian
   - 进入 设置 → 第三方插件
   - 关闭"安全模式"（如果首次使用第三方插件）
   - 在"已安装的插件"中找到 "Noter"
   - 点击开关启用插件

### 方法二：开发环境安装

```bash
# 克隆项目
git clone <repository-url>
cd noter

# 安装依赖
npm install

# 构建项目
npm run build

# 复制 dist 目录到 Obsidian 插件目录
cp -r dist/* /path/to/your/vault/.obsidian/plugins/noter/
```

## 🚀 使用方法

### 打开 Noter

1. **点击侧边栏图标**：点击 Obsidian 右侧边栏的铅笔图标 📝
2. **使用命令面板**：
   - 按下 `Cmd/Ctrl + P`
   - 输入 "Noter"
   - 选择 "打开 Noter"

### 创建笔记

1. 在顶部的输入框中输入内容
2. 使用 `#标签` 语法添加标签（例如：`#灵感 #工作`）
3. 按下 `Ctrl/Cmd + Enter` 或点击"发送"按钮
4. 笔记会自动保存到配置的文件夹

### 标签管理

- **查看所有标签**：输入框下方显示所有标签
- **筛选笔记**：点击标签云中的标签，只显示包含该标签的笔记
- **取消筛选**：再次点击已选中的标签或点击"#全部"

### 搜索笔记

- 在搜索栏中输入关键词
- 实时搜索笔记内容和标签
- 点击清除按钮清空搜索

### 回顾功能

1. 点击右上角的 📅 回顾按钮
2. 选择回顾模式：
   - **今日往昔**：查看往年的今天记录的笔记
   - **随机漫步**：随机展示 10 条旧笔记
3. 使用"上一条"/"下一条"浏览笔记

### 笔记操作

- **展开/收起**：点击笔记卡片查看完整内容
- **编辑**：点击编辑按钮在 Obsidian 编辑器中打开
- **删除**：点击删除按钮删除笔记
- **链接**：创建笔记之间的关联

## ⚙️ 设置

进入 设置 → Noter，可以配置：

- **笔记文件夹**：笔记存储的文件夹路径（默认：`Noter/Notes`）
- **启用回顾功能**：是否显示回顾按钮（默认：启用）
- **日期格式**：笔记 ID 的日期格式（默认：`YYYY-MM-DD-HHmmss`）

## 📁 笔记存储格式

笔记按日期分组存储，格式为 `YYYY/MM/YYYYMMDD.md`：

```
Vault/Noter/Notes/
└── 2026/
    └── 03/
        └── 20260301.md  # 包含 3 月 1 日的所有笔记
```

### 文件内容格式

```markdown
[20260301120000] {灵感，产品} [2026-03-01T12:00:00.000Z] 今天想到一个很好的产品创意

---
[20260301143000] {工作，会议} [2026-03-01T14:30:00.000Z] 下午的项目会议定在周三

---
[20260301180000] {读书，成长} [2026-03-01T18:00:00.000Z] 读《深度工作》有感...
```

**格式说明**：
- `[ID]` - 14 位数字唯一标识符
- `{标签}` - 逗号分隔的标签列表
- `[时间]` - ISO 8601 格式的创建时间
- `内容` - 笔记正文，支持 Markdown

详见：[存储格式说明](STORAGE_FORMAT.md)

## 🛠️ 开发

### 环境要求

- Node.js >= 18
- npm >= 9

### 开发命令

```bash
# 安装依赖
npm install

# 开发模式（监听文件变化）
npm run dev

# 构建生产版本
npm run build

# 类型检查
npm run typecheck

# 清理构建文件
npm run clean
```

### 项目结构

```
noter/
├── src/
│   ├── main.ts              # 插件入口
│   ├── FlomoView.tsx        # 主视图组件
│   ├── styles.css           # 样式文件
│   ├── components/          # UI 组件
│   │   ├── NoteInput.tsx
│   │   ├── NoteCard.tsx
│   │   ├── NoteList.tsx
│   │   ├── TagCloud.tsx
│   │   ├── ReviewModal.tsx
│   │   └── SearchBar.tsx
│   ├── services/            # 业务逻辑
│   │   ├── NoteService.ts
│   │   ├── TagService.ts
│   │   └── ReviewService.ts
│   └── types/               # 类型定义
│       └── index.ts
├── dist/                    # 构建输出目录
├── manifest.json            # 插件清单
├── package.json
└── README.md
```

## 🎯 使用技巧

### 快捷键

- `Ctrl/Cmd + Enter`：快速发送笔记
- `Ctrl/Cmd + P` → "Noter"：打开 Noter 面板

### 标签最佳实践

1. **保持简洁**：使用简短的标签名（如 `#工作` 而不是 `#工作相关`）
2. **层级标签**：可以使用 `/` 创建层级（如 `#项目/Noter`）
3. **一致性**：尽量使用统一的标签命名

### 数据备份

由于笔记存储在本地 Markdown 文件中，你可以：

- 使用 Obsidian Sync 同步
- 使用 Git 进行版本控制
- 使用 iCloud、Dropbox 等云盘同步

## 🐛 问题反馈

如果遇到问题或有建议，请：

1. 检查是否已启用最新的 Obsidian 版本
2. 尝试禁用其他插件排查冲突
3. 查看控制台错误信息（`Ctrl/Cmd + Shift + I`）

## 📄 许可证

MIT License

## 🙏 致谢

- 灵感来自 [Flomo](https://flomoapp.com/)
- 基于 [Obsidian](https://obsidian.md/) 开发

---

**享受快速笔记的乐趣！** 📝✨
