'use client';

import Link from 'next/link';
import { useTheme } from './ThemeContext';
import { Sun, Moon, Github } from 'lucide-react';

export default function Header() {
  const { theme, toggleTheme, mounted } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/80 transition-colors duration-300">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* 로고 영역 */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold transition-transform group-hover:scale-105">
            T
          </div>
          <span className="font-sans text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 transition-colors">
            Tech<span className="text-indigo-600 dark:text-indigo-400">.</span>Log
          </span>
        </Link>

        {/* 내비게이션 메뉴 및 액션 버튼 */}
        <nav className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors"
          >
            Posts
          </Link>

          {/* 구분선 */}
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

          {/* 깃허브 링크 */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-50 transition-all"
            aria-label="GitHub Repository"
          >
            <Github className="h-5 w-5" />
          </a>

          {/* 테마 토글 버튼 */}
          <button
            onClick={toggleTheme}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-50 transition-all focus:outline-none"
            aria-label="Toggle Theme"
          >
            {mounted ? (
              theme === 'dark' ? (
                <Sun className="h-5 w-5 text-amber-500 transition-transform hover:rotate-45 duration-300" />
              ) : (
                <Moon className="h-5 w-5 text-indigo-600 transition-transform hover:-rotate-12 duration-300" />
              )
            ) : (
              // Hydration 이전에는 빈 자리를 채우는 투명 더미
              <div className="h-5 w-5" />
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
