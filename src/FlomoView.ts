import { ItemView, WorkspaceLeaf, App, Notice, TFile, setIcon } from 'obsidian';
import { NoteService } from './services/NoteService';
import { TagService } from './services/TagService';
import { Note, TagInfo, NoterSettings, DEFAULT_SETTINGS } from './types';

export const VIEW_TYPE_NOTER = 'noter-view';

/**
 * Noter 主视图组件 - 使用原生 JavaScript 实现
 * 提供类似 Flomo 的快速笔记界面
 */
export class NoterView extends ItemView {
  private noteService: NoteService;
  private tagService: TagService;
  public settings: NoterSettings;

  private notes: Note[] = [];
  private tags: TagInfo[] = [];
  private filteredNotes: Note[] = [];
  private selectedTag: string | null = null;
  private isLoading = true;
  private currentTime: string = '';
  private timeInterval: number | null = null;

  // DOM 元素引用
  private containerDiv: HTMLElement | null = null;
  private contentDiv: HTMLElement | null = null;
  private noteListDiv: HTMLElement | null = null;
  private textarea: HTMLTextAreaElement | null = null;
  private submitBtn: HTMLButtonElement | null = null;
  private timeSpan: HTMLElement | null = null;

  constructor(leaf: WorkspaceLeaf, app: App, notesFolder: string, settings: NoterSettings = DEFAULT_SETTINGS) {
    super(leaf);
    this.noteService = new NoteService(app, notesFolder);
    this.tagService = new TagService();
    this.settings = settings;
  }

  getViewType(): string {
    return VIEW_TYPE_NOTER;
  }

  getDisplayText(): string {
    return 'Noter';
  }

  getIcon(): string {
    return 'pencil';
  }

  async onOpen(): Promise<void> {
    this.containerEl.empty();
    this.containerEl.addClass('noter-view');

    // 创建主容器
    this.containerDiv = this.containerEl.createDiv('noter-container');

    // 创建头部
    this.renderHeader();

    // 创建输入框
    this.renderInput();

    // 创建内容区域（可滚动）
    this.renderContent();

    await this.loadNotes();

    // 自动聚焦输入框
    this.focusInput();

    // 启动时间更新
    this.startTimeUpdate();
  }

  async onClose(): Promise<void> {
    // 清理时间更新
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  /**
   * 启动时间更新
   */
  private startTimeUpdate(): void {
    this.updateTime();
    this.timeInterval = window.setInterval(() => {
      this.updateTime();
    }, 1000);
  }

  /**
   * 更新时间显示
   */
  private updateTime(): void {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    this.currentTime = `${hours}:${minutes}:${seconds}`;

    if (this.timeSpan) {
      this.timeSpan.textContent = this.currentTime;
    }
  }

  /**
   * 聚焦输入框
   */
  private focusInput(): void {
    if (this.textarea) {
      this.textarea.focus();
    }
  }

  /**
   * 渲染头部
   */
  private renderHeader(): void {
    if (!this.containerDiv) return;

    const header = this.containerDiv.createDiv('noter-header');
    const titleDiv = header.createDiv('noter-title');
    titleDiv.createEl('h2', { text: 'Noter' });
    this.timeSpan = titleDiv.createSpan({
      cls: 'noter-time',
      text: this.currentTime
    });


  }

  /**
   * 渲染输入框
   */
  private renderInput(): void {
    if (!this.containerDiv) return;

    const inputContainer = this.containerDiv.createDiv('noter-input-container');

    // 输入框容器（蓝色边框）
    const inputWrapper = inputContainer.createDiv('noter-input-wrapper');

    // textarea
    this.textarea = inputWrapper.createEl('textarea', {
      cls: 'noter-textarea',
      placeholder: '现在的想法是……',
      attr: {
        rows: '3'
      }
    });

    // 工具栏
    const toolbar = inputContainer.createDiv('noter-toolbar');

    // 左侧工具按钮
    const toolLeft = toolbar.createDiv('noter-toolbar-left');

    // # 标签按钮
    const hashBtn = toolLeft.createEl('button', {
      cls: 'noter-toolbar-btn',
      text: '#'
    });
    hashBtn.title = '插入标签';
    hashBtn.onclick = () => {
      if (this.textarea) {
        this.insertAtCursor('#');
      }
    };

    // @ 按钮
    const atBtn = toolLeft.createEl('button', {
      cls: 'noter-toolbar-btn',
      text: '@'
    });
    atBtn.title = '提及';
    atBtn.onclick = () => {
      if (this.textarea) {
        this.insertAtCursor('@');
      }
    };

    // 右侧发布按钮
    const toolRight = toolbar.createDiv('noter-toolbar-right');
    this.submitBtn = toolRight.createEl('button', {
      cls: 'noter-toolbar-submit',
      attr: {
        disabled: 'disabled'
      }
    });
    setIcon(this.submitBtn, 'send');
    this.submitBtn.title = '发布';

    // 验证输入
    this.textarea.oninput = () => {
      const hasContent = this.textarea!.value.trim().length > 0;
      this.submitBtn!.disabled = !hasContent;
    };

    // 键盘事件处理
    this.textarea.onkeydown = (e: KeyboardEvent) => {
      if (this.settings.sendKeyMode === 'enter') {
        // Enter 发送，Shift+Enter 换行
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          if (this.submitBtn && !this.submitBtn.disabled) {
            this.submitNote(this.textarea!.value);
          }
        }
      } else {
        // Ctrl/Cmd+Enter 发送
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          if (this.submitBtn && !this.submitBtn.disabled) {
            this.submitNote(this.textarea!.value);
          }
        }
      }
    };

    // 提交按钮点击
    this.submitBtn.onclick = () => {
      if (this.submitBtn && !this.submitBtn.disabled && this.textarea) {
        this.submitNote(this.textarea.value);
      }
    };
  }

  /**
   * 在光标位置插入文本
   */
  private insertAtCursor(text: string): void {
    if (!this.textarea) return;

    const start = this.textarea.selectionStart;
    const end = this.textarea.selectionEnd;
    const value = this.textarea.value;

    this.textarea.value = value.substring(0, start) + text + value.substring(end);
    this.textarea.selectionStart = this.textarea.selectionEnd = start + text.length;
    this.textarea.focus();

    // 触发 input 事件
    this.textarea.dispatchEvent(new Event('input'));
  }

  /**
   * 提交笔记
   */
  private async submitNote(content: string): Promise<void> {
    const text = content.trim();
    if (!text) return;

    // 提取标签
    const tagRegex = /#([^\s#]+)/g;
    const tags: string[] = [];
    let match;
    while ((match = tagRegex.exec(text)) !== null) {
      tags.push(match[1]);
    }

    try {
      await this.noteService.createNote(text, tags);
      new Notice('✅ 笔记已发布');
      // 清空输入框
      if (this.textarea) {
        this.textarea.value = '';
        this.submitBtn!.disabled = true;
      }
      await this.loadNotes();
      // 重新聚焦输入框
      this.focusInput();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '发布失败';
      new Notice(`❌ ${errorMsg}`);
      console.error('Failed to create note:', error);
    }
  }

  /**
   * 渲染内容区域（可滚动）
   */
  private renderContent(): void {
    if (!this.containerDiv) return;

    // 创建可滚动内容区
    this.contentDiv = this.containerDiv.createDiv('noter-content');

    // 笔记列表
    this.noteListDiv = this.contentDiv.createDiv('noter-note-list');
    this.renderNoteList();
  }

  /**
   * 渲染笔记列表
   */
  private renderNoteList(): void {
    if (!this.noteListDiv) return;

    this.noteListDiv.empty();

    if (this.isLoading) {
      this.noteListDiv.createDiv('noter-loading', (el) => {
        el.createDiv('noter-spinner');
        el.createSpan({ text: '加载中...' });
      });
      return;
    }

    if (this.filteredNotes.length === 0) {
      this.noteListDiv.createDiv('noter-empty-state', (el) => {
        el.createDiv('noter-empty-icon');
        el.innerText = '📝';
        const textDiv = el.createDiv('noter-empty-text');
        textDiv.innerText = this.notes.length > 0
          ? '没有符合条件的笔记'
          : '还没有笔记，开始记录第一条吧！';
      });
      return;
    }

    this.filteredNotes.forEach((note, index) => {
      const noteItem = this.noteListDiv?.createDiv('noter-note-item');
      if (!noteItem) return;

      noteItem.style.animationDelay = `${index * 0.05}s`;

      // 创建卡片
      const card = noteItem.createDiv('noter-card');

      // 操作按钮区域
      const actions = card.createDiv('noter-card-actions');

      // 复制按钮
      const copyBtn = actions.createEl('button', {
        cls: 'noter-card-action-btn',
        text: '📋'
      });
      copyBtn.title = '复制内容';
      copyBtn.onclick = (e: MouseEvent) => {
        e.stopPropagation();
        this.copyNoteContent(note);
      };

      // 编辑按钮
      const editBtn = actions.createEl('button', {
        cls: 'noter-card-action-btn',
        text: '✏️'
      });
      editBtn.title = '编辑';
      editBtn.onclick = (e: MouseEvent) => {
        e.stopPropagation();
        this.editNote(note);
      };

      // 删除按钮
      const deleteBtn = actions.createEl('button', {
        cls: 'noter-card-action-btn',
        text: '🗑️'
      });
      deleteBtn.title = '删除';
      deleteBtn.onclick = (e: MouseEvent) => {
        e.stopPropagation();
        this.deleteNoteWithConfirm(note);
      };

      // 内容
      const content = card.createDiv('noter-card-content');
      const preview = this.getPreview(note.content);
      const previewDiv = content.createDiv('noter-card-preview');
      previewDiv.innerText = preview;

      // 时间 - 左下角
      card.createSpan({
        cls: 'noter-card-time',
        text: this.formatTime(note.metadata.created)
      });

      // 点击打开笔记
      card.onclick = (e: MouseEvent) => {
        // 如果点击的是操作按钮，不打开笔记
        if ((e.target as HTMLElement).closest('.noter-card-actions')) {
          return;
        }
        this.openNoteInObsidian(note);
      };
    });
  }

  /**
   * 复制笔记内容
   */
  private async copyNoteContent(note: Note): Promise<void> {
    try {
      await navigator.clipboard.writeText(note.content);
      new Notice('✅ 已复制到剪贴板');
    } catch (error) {
      new Notice('❌ 复制失败');
      console.error('Failed to copy:', error);
    }
  }

  /**
   * 编辑笔记
   */
  private async editNote(note: Note): Promise<void> {
    const newContent = prompt('编辑笔记内容：', note.content);
    if (newContent === null || newContent === note.content) {
      return; // 用户取消或未修改
    }

    // 提取新标签
    const tagRegex = /#([^\s#]+)/g;
    const tags: string[] = [];
    let match;
    while ((match = tagRegex.exec(newContent)) !== null) {
      tags.push(match[1]);
    }

    try {
      await this.noteService.updateNote(note.path, note.metadata.id, newContent, tags);
      new Notice('✅ 笔记已更新');
      await this.loadNotes();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '更新失败';
      new Notice(`❌ ${errorMsg}`);
      console.error('Failed to update note:', error);
    }
  }

  /**
   * 删除笔记（带确认）
   */
  private async deleteNoteWithConfirm(note: Note): Promise<void> {
    const preview = this.getPreview(note.content, 50);
    const confirmed = confirm(`确定要删除这条笔记吗？\n\n"${preview}"`);
    if (!confirmed) return;

    try {
      await this.noteService.deleteNote(note.path, note.metadata.id);
      new Notice('✅ 笔记已删除');
      await this.loadNotes();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '删除失败';
      new Notice(`❌ ${errorMsg}`);
      console.error('Failed to delete note:', error);
    }
  }

  /**
   * 获取内容预览
   */
  private getPreview(content: string, maxLength: number = 150): string {
    const cleanContent = content.replace(/#+\s/g, '').trim();
    if (cleanContent.length <= maxLength) {
      return cleanContent;
    }
    return cleanContent.substring(0, maxLength) + '...';
  }

  /**
   * 格式化时间
   */
  private formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return '刚刚';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}分钟前`;
    } else if (diffHours < 24) {
      return `${diffHours}小时前`;
    } else if (diffDays < 30) {
      return `${diffDays}天前`;
    } else {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  }

  /**
   * 加载笔记
   */
  async loadNotes(): Promise<void> {
    this.isLoading = true;
    this.renderNoteList();

    try {
      this.notes = await this.noteService.getAllNotes();
      this.tags = this.tagService.extractAllTags(this.notes);
      this.applyFilters();
    } catch (error) {
      new Notice('❌ 加载笔记失败');
      console.error('Failed to load notes:', error);
      this.isLoading = false;
      this.renderNoteList();
    }
  }

  /**
   * 应用过滤器
   */
  applyFilters(): void {
    let filtered = [...this.notes];

    // 按标签过滤
    if (this.selectedTag) {
      filtered = filtered.filter(note =>
        note.metadata.tags.some(tag => tag === this.selectedTag)
      );
    }

    this.filteredNotes = filtered;
    this.isLoading = false;
    this.renderNoteList();
  }

  /**
   * 创建新笔记
   */
  async createNote(content: string, tags: string[]): Promise<void> {
    try {
      await this.noteService.createNote(content, tags);
      await this.loadNotes();
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  }

  /**
   * 删除笔记
   */
  async deleteNote(note: Note): Promise<void> {
    try {
      await this.noteService.deleteNote(note.path, note.metadata.id);
      await this.loadNotes();
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  }

  /**
   * 在 Obsidian 中打开笔记文件并定位
   */
  async openNoteInObsidian(note: Note): Promise<void> {
    try {
      const file = this.app.vault.getFileByPath(note.path);
      if (file) {
        const leaf = this.app.workspace.getUnpinnedLeaf();
        await leaf.openFile(file);
      }
    } catch (error) {
      console.error('Failed to open note in Obsidian:', error);
    }
  }

  /**
   * 选择标签
   */
  handleSelectTag(tag: string | null): void {
    this.selectedTag = tag;
    this.applyFilters();
  }
}
