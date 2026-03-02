import { App, TFolder, normalizePath } from 'obsidian';
import { Note } from '../types';

/**
 * 笔记服务类
 * 负责笔记的 CRUD 操作
 * 存储格式：YYYY/MM/YYYYMMDD.md（按日期分组存储）
 */
export class NoteService {
  private app: App;
  private notesFolder: string;

  constructor(app: App, notesFolder: string) {
    this.app = app;
    this.notesFolder = notesFolder;
  }

  /**
   * 更新笔记文件夹路径
   */
  setNotesFolder(folder: string): void {
    this.notesFolder = folder;
  }

  /**
   * 确保笔记文件夹存在
   */
  private async ensureFolderExists(): Promise<void> {
    const folder = this.app.vault.getAbstractFileByPath(this.notesFolder);
    if (!(folder instanceof TFolder)) {
      await this.app.vault.createFolder(this.notesFolder);
    }
  }

  /**
   * 格式化为东八区时间字符串
   */
  private formatUTC8Time(date: Date): string {
    // 转换为东八区时间
    const utc8Time = new Date(date.getTime() + 8 * 60 * 60 * 1000);
    const year = utc8Time.getUTCFullYear();
    const month = String(utc8Time.getUTCMonth() + 1).padStart(2, '0');
    const day = String(utc8Time.getUTCDate()).padStart(2, '0');
    const hours = String(utc8Time.getUTCHours()).padStart(2, '0');
    const minutes = String(utc8Time.getUTCMinutes()).padStart(2, '0');
    const seconds = String(utc8Time.getUTCSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  /**
   * 获取日期键（格式：YYYY/MM）
   */
  private getDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}/${month}`;
  }

  /**
   * 获取文件路径（格式：YYYY/MM/YYYYMMDD.md）
   */
  private getFilePath(date: Date): string {
    const dateKey = this.getDateKey(date);
    const dateStr = date.toISOString().replace(/[-:T.]/g, '').slice(0, 8);
    return normalizePath(`${this.notesFolder}/${dateKey}/${dateStr}.md`);
  }

  /**
   * 从文件内容解析笔记块
   * 格式：
   * 2024-03-01 12:00:00
   * 笔记内容 #标签 1 #标签 2
   */
  private parseNoteBlocks(content: string, filePath: string): Note[] {
    const notes: Note[] = [];
    
    // 使用分隔符分割笔记块
    const blocks = content.split(/\n---\n/g);
    
    for (const block of blocks) {
      const trimmedBlock = block.trim();
      if (!trimmedBlock) continue;

      // 解析笔记块：第一行是时间，后面是内容
      const lines = trimmedBlock.split('\n');
      if (lines.length < 2) continue;

      const timeLine = lines[0].trim();
      const contentLines = lines.slice(1).join('\n').trim();

      // 验证时间格式
      const timeMatch = timeLine.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})$/);
      if (!timeMatch) continue;

      const timeStr = timeMatch[1];
      
      // 从内容中提取标签
      const tags = this.extractTagsFromContent(contentLines);
      
      // 将时间转换为 ISO 格式用于排序
      const date = new Date(timeStr.replace(' ', 'T') + '+08:00');
      const isoTime = date.toISOString();
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      // 生成 ID（从时间字符串）
      const id = timeStr.replace(/[-: ]/g, '').padEnd(14, '0');

      notes.push({
        metadata: {
          id,
          created: isoTime,
          updated: isoTime,
          tags,
          source: 'noter-plugin',
        },
        content: contentLines,
        path: filePath,
        dateKey,
      });
    }

    return notes;
  }

  /**
   * 从内容中提取标签
   */
  private extractTagsFromContent(content: string): string[] {
    const tagPattern = /#([^#\s，。,.!！,?？]+)/g;
    const matches = content.match(tagPattern) || [];
    return [...new Set(matches.map(tag => tag.replace('#', '')))];
  }

  /**
   * 将笔记块格式化为字符串
   * 格式：
   * 2024-03-01 12:00:00
   * 笔记内容 #标签
   * 
   */
  private formatNoteBlock(createdAt: string, content: string): string {
    return `${createdAt}\n${content}\n\n`;
  }

  /**
   * 创建新笔记
   */
  async createNote(content: string, tags: string[]): Promise<Note> {
    await this.ensureFolderExists();

    const now = new Date();
    const filePath = this.getFilePath(now);
    const createdAt = this.formatUTC8Time(now);

    // 确保日期文件夹存在
    const folderPath = filePath.substring(0, filePath.lastIndexOf('/'));
    const folder = this.app.vault.getAbstractFileByPath(folderPath);
    if (!(folder instanceof TFolder)) {
      await this.app.vault.createFolder(folderPath);
    }

    // 读取现有内容
    let existingContent = '';
    const file = this.app.vault.getFileByPath(filePath);
    if (file) {
      existingContent = await this.app.vault.read(file);
    }

    // 格式化内容：标签已经在内容中，不需要重复添加
    let formattedContent = content;

    // 添加新笔记块
    const newBlock = this.formatNoteBlock(createdAt, formattedContent);
    const separator = existingContent ? '\n---\n' : '';
    const updatedContent = existingContent ? `${existingContent}${separator}${newBlock}` : `${newBlock}`;

    // 写入文件
    if (file) {
      await this.app.vault.modify(file, updatedContent);
    } else {
      await this.app.vault.create(filePath, updatedContent);
    }

    return {
      metadata: {
        id: createdAt.replace(/[-: ]/g, '').padEnd(14, '0'),
        created: now.toISOString(),
        updated: now.toISOString(),
        tags,
        source: 'noter-plugin',
      },
      content: formattedContent,
      path: filePath,
      dateKey: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
    };
  }

  /**
   * 更新笔记
   */
  async updateNote(path: string, noteId: string, content: string, tags: string[]): Promise<Note | null> {
    const file = this.app.vault.getFileByPath(path);
    if (!file) {
      throw new Error(`Note not found: ${path}`);
    }

    const fileContent = await this.app.vault.read(file);
    const blocks = fileContent.split(/\n---\n/g);
    const updatedBlocks: string[] = [];
    let found = false;
    let updatedNote: Note | null = null;

    const now = new Date();
    const updatedAt = this.formatUTC8Time(now);

    for (const block of blocks) {
      const trimmedBlock = block.trim();
      if (!trimmedBlock) continue;

      const lines = trimmedBlock.split('\n');
      if (lines.length >= 2) {
        const timeLine = lines[0].trim();
        const timeMatch = timeLine.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})$/);
        
        if (timeMatch) {
          const blockId = timeMatch[1].replace(/[-: ]/g, '').padEnd(14, '0');
          
          if (blockId === noteId) {
            // 更新这个笔记块
            let formattedContent = content;
            if (tags.length > 0) {
              formattedContent = `${content} ${tags.map(tag => `#${tag}`).join(' ')}`;
            }
            updatedBlocks.push(this.formatNoteBlock(updatedAt, formattedContent));
            found = true;
            
            updatedNote = {
              metadata: {
                id: noteId,
                created: now.toISOString(),
                updated: now.toISOString(),
                tags,
                source: 'noter-plugin',
              },
              content: formattedContent,
              path,
              dateKey: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
            };
            continue;
          }
        }
      }
      
      updatedBlocks.push(block);
    }

    if (!found) {
      throw new Error(`Note ${noteId} not found`);
    }

    await this.app.vault.modify(file, updatedBlocks.join('\n---\n'));
    return updatedNote;
  }

  /**
   * 删除笔记
   */
  async deleteNote(path: string, noteId: string): Promise<void> {
    const file = this.app.vault.getFileByPath(path);
    if (!file) {
      throw new Error(`Note not found: ${path}`);
    }

    const fileContent = await this.app.vault.read(file);
    const blocks = fileContent.split(/\n---\n/g);
    const filteredBlocks = blocks.filter(block => {
      const trimmedBlock = block.trim();
      if (!trimmedBlock) return false;

      const lines = trimmedBlock.split('\n');
      if (lines.length === 0) return true;

      const timeLine = lines[0].trim();
      const timeMatch = timeLine.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})$/);

      if (timeMatch) {
        const blockId = timeMatch[1].replace(/[-: ]/g, '').padEnd(14, '0');
        return blockId !== noteId;
      }
      return true;
    });

    await this.app.vault.modify(file, filteredBlocks.join('\n---\n'));
  }

  /**
   * 获取所有笔记
   */
  async getAllNotes(): Promise<Note[]> {
    await this.ensureFolderExists();

    const folder = this.app.vault.getAbstractFileByPath(this.notesFolder);
    if (!(folder instanceof TFolder)) {
      return [];
    }

    const files = this.app.vault.getMarkdownFiles()
      .filter(file => file.path.startsWith(this.notesFolder));

    const notes: Note[] = [];
    for (const file of files) {
      try {
        const content = await this.app.vault.read(file);
        const fileNotes = this.parseNoteBlocks(content, file.path);
        notes.push(...fileNotes);
      } catch (error) {
        console.error('Failed to read note file:', file.path, error);
      }
    }

    // 按创建时间倒序
    return notes.sort((a, b) => 
      new Date(b.metadata.created).getTime() - new Date(a.metadata.created).getTime()
    );
  }

  /**
   * 根据标签过滤笔记
   */
  async getNotesByTag(tag: string): Promise<Note[]> {
    const notes = await this.getAllNotes();
    return notes.filter(note => 
      note.metadata.tags.some(t => t === tag || t === `#${tag}`)
    );
  }

  /**
   * 根据 ID 获取笔记
   */
  async getNoteById(id: string): Promise<Note | null> {
    const notes = await this.getAllNotes();
    return notes.find(note => note.metadata.id === id) || null;
  }

  /**
   * 搜索笔记
   */
  async searchNotes(query: string): Promise<Note[]> {
    const notes = await this.getAllNotes();
    const lowerQuery = query.toLowerCase();

    return notes.filter(note => 
      note.content.toLowerCase().includes(lowerQuery) ||
      note.metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }
}
