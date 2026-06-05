import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllPosts, getPostBySlug } from '@/lib/markdown';
import TableOfContents from '@/components/TableOfContents';
import AdSenseAd from '@/components/AdSenseAd';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import type { Metadata } from 'next';

interface PostPageProps {
  params: {
    slug: string;
  };
}

// 1. 포스트 별 고유 SEO 메타데이터 동적 생성
export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) return {};

  return {
    title: post.metadata.title,
    description: post.metadata.description,
    openGraph: {
      title: post.metadata.title,
      description: post.metadata.description,
      type: 'article',
      publishedTime: post.metadata.date,
      tags: post.metadata.tags,
      url: `https://your-domain.com/posts/${params.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metadata.title,
      description: post.metadata.description,
    },
  };
}

// 2. SSG(Static Site Generation)을 위한 포스트 슬러그 리스트 생성
export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default function PostPage({ params }: PostPageProps) {
  const post = getPostBySlug(params.slug);

  // 포스트가 존재하지 않을 때 Next.js 404 페이지로 위임
  if (!post) {
    notFound();
  }

  return (
    <div className="relative flex flex-col gap-10 lg:flex-row lg:items-start">
      {/* 본문 영역 (좌측 3/4) */}
      <article className="w-full flex-grow lg:max-w-3xl xl:max-w-4xl">
        {/* 뒤로가기 버튼 */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors mb-6 group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to list
        </Link>

        {/* 포스트 헤더 */}
        <header className="border-b border-slate-200 dark:border-slate-800 pb-8 mb-8 space-y-4">
          <span className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
            {post.metadata.category}
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl leading-tight">
            {post.metadata.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            {/* 작성 시간 */}
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {post.metadata.date}
            </span>

            {/* 태그 리스트 */}
            {post.metadata.tags && post.metadata.tags.length > 0 && (
              <span className="flex items-center gap-1.5">
                <Tag className="h-4 w-4 shrink-0" />
                <span className="flex flex-wrap gap-1">
                  {post.metadata.tags.map((tag) => (
                    <span
                      key={tag}
                      className="after:content-[',_'] last:after:content-none font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </span>
              </span>
            )}
          </div>
        </header>

        {/* 광고 게재 영역 (본문 상단) */}
        <AdSenseAd slot="1111111111" className="bg-slate-100/50 dark:bg-slate-900/50" />

        {/* 마크다운 파싱 결과물 HTML 렌더링 영역 */}
        <div 
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }} 
        />

        {/* 광고 게재 영역 (본문 하단) */}
        <AdSenseAd slot="2222222222" className="bg-slate-100/50 dark:bg-slate-900/50 mt-12" />
      </article>

      {/* 목차(TOC) 영역 (우측 1/4, 큰 화면에서만 스티키 노출) */}
      <aside className="hidden lg:block lg:sticky lg:top-24 w-64 shrink-0 max-h-[calc(100vh-8rem)] overflow-y-auto px-2 border-l border-slate-100 dark:border-slate-900">
        <TableOfContents toc={post.toc} />
      </aside>
    </div>
  );
}
