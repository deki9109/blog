import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

// 포스트 저장 경로
const postsDirectory = path.join(process.cwd(), 'posts');

import { PostMetadata, TOCItem } from './types';

// 텍스트를 HTML 헤더 ID로 변환하는 함수 (한글/영문 대응 및 특수문자 정제)
function generateId(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, '') // HTML 태그가 있다면 제거
    .replace(/[^\w\s\uAC00-\uD7A3\-]+/g, '') // 영문, 한글, 숫자, 공백, 하이픈 외 제거
    .trim()
    .replace(/\s+/g, '-') // 공백을 하이픈으로 변경
    .replace(/-+/g, '-'); // 중복 하이픈 축소
}

// 본문 원문 마크다운에서 H2, H3 제목들을 추출하여 TOC 목록 생성
function extractTOC(content: string): TOCItem[] {
  const lines = content.split('\n');
  const toc: TOCItem[] = [];

  lines.forEach((line) => {
    // ## 제목 또는 ### 제목 패턴 매칭
    const match = line.match(/^(##|###)\s+(.+)$/);
    if (match) {
      const level = match[1].length; // 2 또는 3
      const rawText = match[2].trim();

      // 마크다운 문법(링크, 볼드 등) 정제
      const text = rawText
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [텍스트](링크) -> 텍스트
        .replace(/[*_`~]/g, ''); // 포맷팅 특수문자 제거

      const id = generateId(text);

      toc.push({ id, text, level });
    }
  });

  return toc;
}

// 커스텀 렌더러 생성 (marked 컴파일 시 h2, h3 태그에 알맞은 ID 속성 자동 주입)
const renderer = new marked.Renderer();
renderer.heading = function (text, level, raw) {
  const id = generateId(raw);
  return `<h${level} id="${id}">${text}</h${level}>`;
};

// marked 설정
marked.setOptions({
  renderer: renderer,
  gfm: true,
  breaks: true,
});

// 모든 포스트 목록 조회 (날짜 역순 정렬)
export function getAllPosts(): PostMetadata[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      // frontmatter 파싱
      const { data } = matter(fileContents);

      return {
        slug,
        title: data.title || slug,
        date: data.date || '',
        category: data.category || 'Uncategorized',
        tags: data.tags || [],
        description: data.description || '',
      } as PostMetadata;
    });

  // 최근 날짜 순으로 정렬
  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

// 특정 슬러그(slug)에 해당하는 포스트 상세 데이터 조회
export function getPostBySlug(slug: string) {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  // 마크다운 본문을 HTML로 컴파일 (동기식 빌드 지원)
  const contentHtml = marked.parse(content) as string;

  // 본문에서 TOC 추출
  const toc = extractTOC(content);

  const metadata: PostMetadata = {
    slug,
    title: data.title || slug,
    date: data.date || '',
    category: data.category || 'Uncategorized',
    tags: data.tags || [],
    description: data.description || '',
  };

  return {
    metadata,
    contentHtml,
    toc,
  };
}
