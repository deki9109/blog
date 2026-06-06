// 포스트 메타데이터 타입 정의
export interface PostMetadata {
  slug: string;
  title: string;
  date: string;
  category: string;
  tags: string[];
  description: string;
}

// TOC(목차) 아이템 타입 정의
export interface TOCItem {
  id: string;
  text: string;
  level: number; // 2 = h2, 3 = h3
}
