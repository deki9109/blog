'use client';

import { useEffect, useState } from 'react';

interface AdSenseAdProps {
  slot: string;
  client?: string; // 본인의 퍼블리셔 ID (기본값 설정 가능)
  format?: string;
  responsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export default function AdSenseAd({
  slot,
  client = 'ca-pub-XXXXXXXXXXXXXXXX', // 여기에 실제 게시자 ID를 입력하거나 props로 넘길 수 있습니다.
  format = 'auto',
  responsive = true,
  style = { display: 'block' },
  className = '',
}: AdSenseAdProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    try {
      // 1. 애드센스 스크립트 동적 로드 검증 (중복 삽입 차단)
      const scriptId = 'google-adsense-script';
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;
      
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
        script.async = true;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
      }

      // 2. 애드센스 광고 초기화 명령 푸시
      // window.adsbygoogle 객체가 생성되었는지 확인 후 광고 요청을 보냅니다.
      const adsbygoogle = (window as any).adsbygoogle || [];
      adsbygoogle.push({});
    } catch (err) {
      console.error('AdSense Initialization Error:', err);
    }
  }, [client]);

  // 3. 서버 사이드 렌더링 시에는 레이아웃 깨짐을 예방하기 위해 동일한 높이의 빈 플레이스홀더를 제공합니다.
  // 마운트 후 실제 구글 광고 영역으로 대체됩니다.
  if (!isMounted) {
    return (
      <div 
        className={`bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center py-6 text-xs text-slate-400/80 transition-colors ${className}`}
        style={{ ...style, minHeight: '100px' }}
      >
        [ 광고 영역 대기 중 ]
      </div>
    );
  }

  return (
    <div className={`w-full overflow-hidden my-8 rounded-xl ${className}`}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
