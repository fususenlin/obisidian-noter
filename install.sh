#!/bin/bash

# Noter 插件安装脚本
# 使用方法：./install.sh /path/to/your/vault

# 检查参数
if [ -z "$1" ]; then
    echo "使用方法：$0 <vault 路径>"
    echo "示例：$0 ~/Documents/ObsidianVault"
    exit 1
fi

VAULT_PATH="$1"
PLUGIN_DIR="$VAULT_PATH/.obsidian/plugins/noter"

# 检查 Vault 是否存在
if [ ! -d "$VAULT_PATH" ]; then
    echo "错误：Vault 目录不存在：$VAULT_PATH"
    exit 1
fi

# 检查是否已构建
if [ ! -d "dist" ]; then
    echo "错误：dist 目录不存在，请先运行 npm run build"
    exit 1
fi

# 创建插件目录
echo "创建插件目录：$PLUGIN_DIR"
mkdir -p "$PLUGIN_DIR"

# 复制文件
echo "复制插件文件..."
cp dist/main.js "$PLUGIN_DIR/"
cp dist/manifest.json "$PLUGIN_DIR/"
cp dist/styles.css "$PLUGIN_DIR/"

echo "✅ Noter 插件已安装到：$PLUGIN_DIR"
echo ""
echo "请在 Obsidian 中："
echo "1. 打开 设置 → 第三方插件"
echo "2. 关闭安全模式（如果首次使用）"
echo "3. 找到 Noter 并启用"
echo "4. 点击右侧边栏的 📝 图标打开 Noter"
