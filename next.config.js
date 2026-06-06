/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 배포 시 애드센스 스크립트 등 외부 도메인 최적화를 위해 이미지나 헤더 등을 필요에 따라 구성할 수 있습니다.
  images: {
    unoptimized: true, // 정적 호스팅(Vercel, GitHub Pages 등) 시 이미지 로딩 오류 방지
  },
};

module.exports = nextConfig;
