import { Note, TagInfo } from '../types';

/**
 * 标签服务类
 * 负责标签的提取、统计和管理
 */
export class TagService {
  /**
   * 从内容中提取标签
   */
  extractTags(content: string): string[] {
    const tagPattern = /#([^#\s，。,.!！,?？]+)/g;
    const matches = content.match(tagPattern) || [];
    
    return matches
      .map(tag => tag.replace('#', ''))
      .filter((tag, index, self) => self.indexOf(tag) === index);
  }

  /**
   * 从笔记列表中提取所有标签
   */
  extractAllTags(notes: Note[]): TagInfo[] {
    const tagMap = new Map<string, number>();

    notes.forEach(note => {
      note.metadata.tags.forEach(tag => {
        const cleanTag = tag.replace('#', '');
        tagMap.set(cleanTag, (tagMap.get(cleanTag) || 0) + 1);
      });

      const contentTags = this.extractTags(note.content);
      contentTags.forEach(tag => {
        const cleanTag = tag.replace('#', '');
        tagMap.set(cleanTag, (tagMap.get(cleanTag) || 0) + 1);
      });
    });

    const tagInfos: TagInfo[] = [];
    tagMap.forEach((count, name) => {
      tagInfos.push({ name, count });
    });

    return tagInfos.sort((a, b) => b.count - a.count);
  }

  /**
   * 获取常用标签
   */
  getPopularTags(notes: Note[], limit: number = 20): TagInfo[] {
    const allTags = this.extractAllTags(notes);
    return allTags.slice(0, limit);
  }

  /**
   * 搜索标签
   */
  searchTags(notes: Note[], query: string): TagInfo[] {
    const allTags = this.extractAllTags(notes);
    const lowerQuery = query.toLowerCase();

    return allTags.filter(tag => 
      tag.name.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * 合并标签
   */
  mergeTags(tag1: string, tag2: string): string {
    const cleanTag1 = tag1.replace('#', '');
    const cleanTag2 = tag2.replace('#', '');
    
    if (cleanTag1.length <= cleanTag2.length) {
      return cleanTag1;
    }
    return cleanTag2;
  }

  /**
   * 格式化标签显示
   */
  formatTag(tag: string): string {
    return tag.replace('#', '');
  }
}
