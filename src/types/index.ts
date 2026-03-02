/**
 * 笔记元数据接口
 */
export interface NoteMetadata {
  id: string;
  created: string;
  updated: string;
  tags: string[];
  source: string;
}

/**
 * 笔记块接口（用于存储在同一文件中的多条笔记）
 */
export interface NoteBlock {
  id: string;
  created: string;
  updated: string;
  tags: string[];
  content: string;
}

/**
 * 笔记完整接口
 */
export interface Note {
  metadata: NoteMetadata;
  content: string;
  path: string;
  dateKey?: string; // 日期标识，用于分组
}

/**
 * 标签统计信息
 */
export interface TagInfo {
  name: string;
  count: number;
}

/**
 * 发送快捷键模式
 */
export type SendKeyMode = 'enter' | 'ctrl-enter';

/**
 * 插件设置接口
 */
export interface NoterSettings {
  vaultPath: string;
  notesFolder: string;
  dateFormat: string;
  enableAI: boolean;
  sendKeyMode: SendKeyMode;
}

/**
 * 默认设置
 */
export const DEFAULT_SETTINGS: NoterSettings = {
  vaultPath: '',
  notesFolder: 'Noter/Notes',
  dateFormat: 'YYYY-MM-DD-HHmmss',
  enableAI: false,
  sendKeyMode: 'enter', // 默认 Enter 发送
};
