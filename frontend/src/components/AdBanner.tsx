import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdBannerProps {
  adSlot: string;
  adFormat?: 'horizontal' | 'rectangle';
  className?: string;
}

export default function AdBanner({ adSlot, adFormat = 'horizontal', className = '' }: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
      pushed.current = true;
    } catch {
      // Silently handle AdSense errors (e.g., ad blocker)
    }
  }, []);

  const isHorizontal = adFormat === 'horizontal';

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-sans mb-1 select-none">
        Advertisement
      </p>
      <div
        className={
          isHorizontal
            ? 'w-full max-w-[728px] min-h-[90px] bg-secondary/40 border border-border/60 overflow-hidden'
            : 'w-[300px] h-[250px] bg-secondary/40 border border-border/60 overflow-hidden'
        }
      >
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', height: '100%' }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot={adSlot}
          data-ad-format={isHorizontal ? 'horizontal' : 'rectangle'}
          data-full-width-responsive={isHorizontal ? 'true' : 'false'}
        />
      </div>
    </div>
  );
}
