import Link from 'next/link';
import { PostMetadata } from '@/lib/types';
import { Calendar, Tag } from 'lucide-react';

interface PostCardProps {
  post: PostMetadata;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900 dark:hover:border-indigo-900/60 dark:hover:shadow-indigo-950/20">
      <Link href={`/posts/${post.slug}`} className="absolute inset-0 z-10">
        <span className="sr-only">Read {post.title}</span>
      </Link>
      
      <div>
        {/* 카테고리 태그 */}
        <span className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
          {post.category}
        </span>

        {/* 포스트 제목 */}
        <h3 className="mt-4 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {post.title}
        </h3>

        {/* 포스트 요약 */}
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {post.description}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
        {/* 작성일 */}
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          {post.date}
        </span>

        {/* 태그 (최대 2개 표시) */}
        {post.tags && post.tags.length > 0 && (
          <span className="flex items-center gap-1.5 max-w-full overflow-hidden">
            <Tag className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {post.tags.slice(0, 2).join(', ')}
              {post.tags.length > 2 && ' ...'}
            </span>
          </span>
        )}
      </div>
    </article>
  );
}
