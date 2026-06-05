import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/ThemeContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Tech.Log - 개인 기술 블로그',
    template: '%s | Tech.Log',
  },
  description: '개발, 웹 프로그래밍, SEO 및 구글 애드센스 등 유용한 기술 정보를 다루는 개인 테크 블로그입니다.',
  keywords: ['Next.js', 'React', 'Tailwind CSS', 'SEO', '구글 애드센스', '기술 블로그'],
  authors: [{ name: 'TechLogger' }],
  creator: 'TechLogger',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://your-domain.com',
    title: 'Tech.Log - 개인 기술 블로그',
    description: '웹 프론트엔드 개발 및 최신 기술 이슈를 정리하는 블로그입니다.',
    siteName: 'Tech.Log',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tech.Log - 개인 기술 블로그',
    description: '웹 프론트엔드 개발 및 최신 기술 이슈를 정리하는 블로그입니다.',
  },
  // 브라우저 뷰포트 및 아이콘 관련 설정
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="scroll-smooth" suppressHydrationWarning>
      <head>
        {/* 다크 모드 초기 깜빡임(FOUC) 방지를 위한 차단성 인라인 스크립트 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var savedTheme = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <Header />
          <main className="mx-auto w-full max-w-5xl flex-grow px-4 py-8 sm:px-6 md:py-12">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
