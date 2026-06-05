import { getAllPosts } from '@/lib/markdown';
import HomeClient from '@/components/HomeClient';

export default function Home() {
  // 1. 서버 사이드 환경에서 파일시스템(fs)을 안전하게 읽어 모든 포스트 데이터 로드
  const posts = getAllPosts();

  // 2. 검색 엔진 최적화(SEO) 수집을 위한 정적 HTML 뼈대를 구성하는 클라이언트 컴포넌트에 주입
  return <HomeClient posts={posts} />;
}
