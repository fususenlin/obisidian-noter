import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { NoterView, VIEW_TYPE_NOTER } from './FlomoView';
import { DEFAULT_SETTINGS, NoterSettings } from './types';
import './styles.css';

/**
 * Noter 插件设置面板
 */
class NoterSettingTab extends PluginSettingTab {
  plugin: NoterPlugin;

  constructor(app: App, plugin: NoterPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'Noter 插件设置' });

    new Setting(containerEl)
      .setName('笔记文件夹')
      .setDesc('笔记存储的文件夹路径（相对于 Vault 根目录）')
      .addText(text =>
        text
          .setPlaceholder('Noter/Notes')
          .setValue(this.plugin.settings.notesFolder)
          .onChange(async value => {
            this.plugin.settings.notesFolder = value || 'Noter/Notes';
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('日期格式')
      .setDesc('笔记 ID 的日期格式')
      .addText(text =>
        text
          .setPlaceholder('YYYY-MM-DD-HHmmss')
          .setValue(this.plugin.settings.dateFormat)
          .onChange(async value => {
            this.plugin.settings.dateFormat = value || 'YYYY-MM-DD-HHmmss';
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('发送快捷键')
      .setDesc('选择发送笔记的快捷键方式')
      .addDropdown(dropdown =>
        dropdown
          .addOption('enter', 'Enter 发送 (Shift+Enter 换行)')
          .addOption('ctrl-enter', 'Ctrl/Cmd+Enter 发送')
          .setValue(this.plugin.settings.sendKeyMode)
          .onChange(async value => {
            this.plugin.settings.sendKeyMode = value as 'enter' | 'ctrl-enter';
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('关于')
      .setDesc('Noter 插件版本：1.0.0 | 类似 Flomo 的快速笔记工具');
  }
}

/**
 * Noter 插件主类
 */
export default class NoterPlugin extends Plugin {
  settings: NoterSettings = DEFAULT_SETTINGS;

  async onload(): Promise<void> {
    await this.loadSettings();

    // 注册视图
    this.registerView(VIEW_TYPE_NOTER, leaf => 
      new NoterView(leaf, this.app, this.settings.notesFolder, this.settings)
    );

    // 添加侧边栏图标
    this.addRibbonIcon('pencil', 'Noter', () => {
      this.activateView();
    });

    // 添加命令
    this.addCommand({
      id: 'open-noter',
      name: '打开 Noter',
      callback: () => this.activateView(),
    });

    // 添加设置面板
    this.addSettingTab(new NoterSettingTab(this.app, this));

    // 启动时自动打开视图（可选）
    this.app.workspace.onLayoutReady(() => {
      // 可以在这里添加自动打开逻辑
    });

    console.log('Noter 插件已加载');
  }

  onunload(): void {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_NOTER);
    console.log('Noter 插件已卸载');
  }

  /**
   * 激活 Noter 视图
   */
  async activateView(): Promise<void> {
    // 查找现有视图
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_NOTER);
    
    if (leaves.length === 0) {
      // 在右侧边栏打开视图
      const leaf = this.app.workspace.getRightLeaf(false);
      if (leaf) {
        await leaf.setViewState({
          type: VIEW_TYPE_NOTER,
        });
      }
    }

    // 激活视图
    const viewLeaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_NOTER);
    if (viewLeaves.length > 0) {
      this.app.workspace.revealLeaf(viewLeaves[0]);
    }
  }

  /**
   * 加载设置
   */
  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  /**
   * 保存设置
   */
  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
    
    // 更新视图的文件夹路径
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_NOTER);
    leaves.forEach(leaf => {
      if (leaf.view instanceof NoterView) {
        // 重新加载视图
        (leaf.view as NoterView).loadNotes();
      }
    });
  }
}
