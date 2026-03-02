#!/bin/bash
# Noter 插件部署脚本

VAULT_PATH="/Users/limaosheng/Library/Mobile Documents/iCloud~md~obsidian/Documents/lms"
PLUGIN_PATH="$VAULT_PATH/.obsidian/plugins/noter"

echo "🔨 构建插件..."
npm run build

echo "📦 复制插件到 Obsidian..."
mkdir -p "$PLUGIN_PATH"
cp dist/* "$PLUGIN_PATH/"

echo "✅ 部署完成！"
echo "💡 在 Obsidian 中刷新插件或重启即可看到更新"
