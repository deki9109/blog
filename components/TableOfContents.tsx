'use client';

import { useEffect, useState } from 'react';
import { TOCItem } from '@/lib/types';

interface TOCProps {
  toc: TOCItem[];
}

export default function TableOfContents({ toc }: TOCProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (toc.length === 0) return;

    // 현재 스크롤 영역에 있는 heading을 감지하는 observer 설정
    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      // 화면 내에 감지된 제목(Intersecting) 중 활성화할 첫 번째 제목을 찾습니다.
      const visibleEntries = entries.filter((entry) => entry.isIntersecting);
      if (visibleEntries.length > 0) {
        // 상단에 가장 근접해 있는 것을 활성화
        const topEntry = visibleEntries.reduce((prev, curr) => 
          prev.boundingClientRect.top < curr.boundingClientRect.top ? prev : curr
        );
        setActiveId(topEntry.target.id);
      }
    };

    const observer = new IntersectionObserver(handleObserver, {
      // 스크롤 상단에서 약 15% 하단부터 감지되도록 오프셋 조절
      rootMargin: '-80px 0px -80% 0px',
      threshold: [0.1, 0.5, 1.0],
    });

    // TOC의 모든 h2, h3 요소 관찰 시작
    toc.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [toc]);

  if (toc.length === 0) return null;

  return (
    <aside className="w-full">
      <h4 className="text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-3 px-3">
        On This Page
      </h4>
      <nav className="relative border-l border-slate-200 dark:border-slate-800 py-1 space-y-1">
        {toc.map((item) => {
          const isActive = item.id === activeId;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById(item.id);
                if (element) {
                  const offset = 90; // Header 높이를 고려한 스크롤 오프셋
                  const elementPosition = element.getBoundingClientRect().top + window.scrollY;
                  const offsetPosition = elementPosition - offset;

                  window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                  });
                  
                  // URL 해시 업데이트
                  window.history.pushState(null, '', `#${item.id}`);
                  setActiveId(item.id);
                }
              }}
              className={`block text-xs py-1.5 transition-all -ml-px border-l-2 pl-3 hover:text-indigo-600 dark:hover:text-indigo-400 ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-semibold bg-indigo-50/50 dark:bg-indigo-950/20'
                  : 'border-transparent text-slate-500 dark:text-slate-400'
              } ${item.level === 3 ? 'pl-6 text-[11px]' : 'pl-3 text-xs'}`}
            >
              {item.text}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
