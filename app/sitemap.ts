import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/markdown';

// 본인의 실제 도메인 주소로 변경하여 배포하세요.
const BASE_URL = 'https://your-domain.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. 모든 포스트 조회
  const posts = getAllPosts();

  // 2. 포스트 정보 기반 사이트맵 리스트 작성
  const postUrls = posts.map((post) => ({
    url: `${BASE_URL}/posts/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // 3. 메인 루트 페이지 사이트맵 추가
  const routes = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
  ];

  return [...routes, ...postUrls];
}
