import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { gsap } from 'gsap';
import { useSettingsStore } from '../../store/useSettingsStore';

export interface TargetCursorProps {
  targetSelector?: string;
  spinDuration?: number;
  hideDefaultCursor?: boolean;
  hoverDuration?: number;
  parallaxOn?: boolean;
}

const TargetCursor: React.FC<TargetCursorProps> = ({
  targetSelector = 'a, button, input, textarea, select, option, [role="button"], .cursor-target',
  spinDuration = 3,
  hideDefaultCursor = true,
  hoverDuration = 0.15,
  parallaxOn = true
}) => {
  const { theme } = useSettingsStore();
  
  const cursorRef = useRef<HTMLDivElement>(null);
  const cornersRef = useRef<NodeListOf<HTMLDivElement> | null>(null);
  const spinTl = useRef<gsap.core.Timeline | null>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  const isActiveRef = useRef(false);
  const targetCornerPositionsRef = useRef<{ x: number; y: number }[] | null>(null);
  const tickerFnRef = useRef<(() => void) | null>(null);
  const activeStrengthRef = useRef({ current: 0 });

  // === DETEKSI MOBILE (REAKTIF) ===
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      if (typeof window === 'undefined') return;
      
      // 1. Cek pointer kasar (Touch)
      const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
      
      // 2. Cek ukuran layar (Fallback)
      const isSmallScreen = window.innerWidth <= 768;
      
      setIsMobile(isTouchDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const constants = useMemo(() => ({ borderWidth: 2, cornerSize: 10 }), []);

  const themeColor = useMemo(() => {
    if (theme === 'aya') return '#ec4899';
    if (theme === 'arjuna') return '#3b82f6';
    return '#e11d48';
  }, [theme]);

  // Update Warna
  useEffect(() => {
    if (dotRef.current) gsap.to(dotRef.current, { backgroundColor: themeColor, duration: 0.3 });
    if (cornersRef.current) gsap.to(cornersRef.current, { borderColor: themeColor, duration: 0.3 });
  }, [themeColor]);

  const moveCursor = useCallback((x: number, y: number) => {
    if (!cursorRef.current) return;
    gsap.to(cursorRef.current, { x, y, duration: 0.1, ease: 'power3.out', overwrite: 'auto' });
  }, []);

  useEffect(() => {
    // JIKA MOBILE, SKIP LOGIKA
    if (isMobile || !cursorRef.current) return;

    if (hideDefaultCursor) {
      document.documentElement.style.cursor = 'none';
      document.body.style.cursor = 'none';
    }

    const cursor = cursorRef.current;
    cornersRef.current = cursor.querySelectorAll<HTMLDivElement>('.target-cursor-corner');

    let activeTarget: Element | null = null;
    let currentLeaveHandler: (() => void) | null = null;
    let resumeTimeout: ReturnType<typeof setTimeout> | null = null;

    const cleanupTarget = (target: Element) => {
      if (currentLeaveHandler) {
        target.removeEventListener('mouseleave', currentLeaveHandler);
      }
      currentLeaveHandler = null;
    };

    gsap.set(cursor, { xPercent: -50, yPercent: -50, x: window.innerWidth / 2, y: window.innerHeight / 2 });

    const createSpinTimeline = () => {
      if (spinTl.current) spinTl.current.kill();
      spinTl.current = gsap.timeline({ repeat: -1 })
        .to(cursor, { rotation: '+=360', duration: spinDuration, ease: 'none' });
    };
    createSpinTimeline();

    const tickerFn = () => {
      if (!targetCornerPositionsRef.current || !cursorRef.current || !cornersRef.current) return;
      
      const strength = activeStrengthRef.current.current;
      if (strength <= 0.01) return;

      const cursorX = gsap.getProperty(cursorRef.current, 'x') as number;
      const cursorY = gsap.getProperty(cursorRef.current, 'y') as number;
      const corners = Array.from(cornersRef.current);

      corners.forEach((corner, i) => {
        const currentX = gsap.getProperty(corner, 'x') as number;
        const currentY = gsap.getProperty(corner, 'y') as number;
        const targetPos = targetCornerPositionsRef.current![i];
        
        const targetX = targetPos.x - cursorX;
        const targetY = targetPos.y - cursorY;

        const finalX = currentX + (targetX - currentX) * strength;
        const finalY = currentY + (targetY - currentY) * strength;

        const duration = strength >= 0.99 ? (parallaxOn ? 0.2 : 0) : 0.05;
        
        gsap.to(corner, {
          x: finalX,
          y: finalY,
          duration: duration,
          ease: duration === 0 ? 'none' : 'power1.out',
          overwrite: true
        });
      });
    };

    tickerFnRef.current = tickerFn;

    const moveHandler = (e: MouseEvent) => moveCursor(e.clientX, e.clientY);
    window.addEventListener('mousemove', moveHandler);

    const scrollHandler = () => {
      if (!activeTarget || !cursorRef.current) return;
      const mouseX = gsap.getProperty(cursorRef.current, 'x') as number;
      const mouseY = gsap.getProperty(cursorRef.current, 'y') as number;
      const elementUnderMouse = document.elementFromPoint(mouseX, mouseY);
      
      const isStillOverTarget = elementUnderMouse && (elementUnderMouse === activeTarget || elementUnderMouse.closest(targetSelector) === activeTarget);
      
      if (!isStillOverTarget) currentLeaveHandler?.();
    };
    window.addEventListener('scroll', scrollHandler, { passive: true });

    const mouseDownHandler = () => {
      if (!dotRef.current) return;
      gsap.to(dotRef.current, { scale: 0.7, duration: 0.15 });
      gsap.to(cursorRef.current, { scale: 0.9, duration: 0.15 });
    };
    const mouseUpHandler = () => {
      if (!dotRef.current) return;
      gsap.to(dotRef.current, { scale: 1, duration: 0.15 });
      gsap.to(cursorRef.current, { scale: 1, duration: 0.15 });
    };
    window.addEventListener('mousedown', mouseDownHandler);
    window.addEventListener('mouseup', mouseUpHandler);

    const enterHandler = (e: MouseEvent) => {
      const targetElement = (e.target as Element).closest(targetSelector);
      if (!targetElement || !cursorRef.current || !cornersRef.current) return;
      
      if (activeTarget === targetElement) return;
      if (activeTarget) cleanupTarget(activeTarget); 
      if (resumeTimeout) { clearTimeout(resumeTimeout); resumeTimeout = null; }

      activeTarget = targetElement;
      
      spinTl.current?.pause();
      gsap.set(cursorRef.current, { rotation: 0, overwrite: true });

      const rect = targetElement.getBoundingClientRect();
      const { borderWidth, cornerSize } = constants;
      
      targetCornerPositionsRef.current = [
        { x: rect.left - borderWidth, y: rect.top - borderWidth },
        { x: rect.right + borderWidth - cornerSize, y: rect.top - borderWidth },
        { x: rect.right + borderWidth - cornerSize, y: rect.bottom + borderWidth - cornerSize },
        { x: rect.left - borderWidth, y: rect.bottom + borderWidth - cornerSize }
      ];

      isActiveRef.current = true;
      gsap.ticker.add(tickerFnRef.current!);
      gsap.to(activeStrengthRef.current, { current: 1, duration: hoverDuration, ease: 'power2.out' });

      const leaveHandler = () => {
        gsap.ticker.remove(tickerFnRef.current!);
        isActiveRef.current = false;
        targetCornerPositionsRef.current = null;
        gsap.set(activeStrengthRef.current, { current: 0 });
        
        activeTarget = null;
        
        if (cornersRef.current) {
          const corners = Array.from(cornersRef.current);
          const { cornerSize } = constants;
          const positions = [
            { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
            { x: cornerSize * 0.5, y: -cornerSize * 1.5 },
            { x: cornerSize * 0.5, y: cornerSize * 0.5 },
            { x: -cornerSize * 1.5, y: cornerSize * 0.5 }
          ];
          corners.forEach((corner, index) => {
            gsap.to(corner, { x: positions[index].x, y: positions[index].y, duration: 0.25, ease: 'power2.out', overwrite: true });
          });
        }

        resumeTimeout = setTimeout(() => {
          if (!activeTarget && cursorRef.current && spinTl.current) {
             gsap.killTweensOf(cursorRef.current, "rotation");
             const currentRot = gsap.getProperty(cursorRef.current, 'rotation') as number;
             const nextRot = Math.ceil(currentRot / 360) * 360 + 360;
             
             gsap.to(cursorRef.current, { 
               rotation: nextRot, 
               duration: spinDuration, 
               ease: 'none',
               overwrite: true,
               onComplete: () => {
                 gsap.set(cursorRef.current, { rotation: 0 });
                 spinTl.current?.restart();
               } 
             });
          }
          resumeTimeout = null;
        }, 50);
        
        cleanupTarget(targetElement);
      };

      currentLeaveHandler = leaveHandler;
      targetElement.addEventListener('mouseleave', leaveHandler);
    };

    window.addEventListener('mouseover', enterHandler);

    return () => {
      if (tickerFnRef.current) gsap.ticker.remove(tickerFnRef.current);
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('mouseover', enterHandler);
      window.removeEventListener('scroll', scrollHandler);
      window.removeEventListener('mousedown', mouseDownHandler);
      window.removeEventListener('mouseup', mouseUpHandler);
      if (activeTarget) cleanupTarget(activeTarget);
      spinTl.current?.kill();
      
      document.body.style.cursor = '';
      document.documentElement.style.cursor = '';
    };
  }, [targetSelector, spinDuration, moveCursor, constants, hideDefaultCursor, isMobile, hoverDuration, parallaxOn]);

  if (isMobile) return null;

  return (
    // PERBAIKAN Z-INDEX: Menggunakan inline style zIndex maksimal (2147483647) 
    // agar selalu di atas notifikasi (Toaster/Sonner biasanya z-99999)
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 w-0 h-0 pointer-events-none"
      style={{ 
        willChange: 'transform',
        zIndex: 2147483647 // Angka Z-Index tertinggi yang mungkin dalam CSS
      }}
    >
      <div
        ref={dotRef}
        className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full -translate-x-1/2 -translate-y-1/2"
        style={{ backgroundColor: themeColor }}
      />
      <div
        className="target-cursor-corner absolute top-1/2 left-1/2 w-2.5 h-2.5 border-[2px] -translate-x-[150%] -translate-y-[150%] border-r-0 border-b-0 rounded-tl-sm"
        style={{ borderColor: themeColor }}
      />
      <div
        className="target-cursor-corner absolute top-1/2 left-1/2 w-2.5 h-2.5 border-[2px] translate-x-1/2 -translate-y-[150%] border-l-0 border-b-0 rounded-tr-sm"
        style={{ borderColor: themeColor }}
      />
      <div
        className="target-cursor-corner absolute top-1/2 left-1/2 w-2.5 h-2.5 border-[2px] translate-x-1/2 translate-y-1/2 border-l-0 border-t-0 rounded-br-sm"
        style={{ borderColor: themeColor }}
      />
      <div
        className="target-cursor-corner absolute top-1/2 left-1/2 w-2.5 h-2.5 border-[2px] -translate-x-[150%] translate-y-1/2 border-r-0 border-t-0 rounded-bl-sm"
        style={{ borderColor: themeColor }}
      />
    </div>
  );
};

export default TargetCursor;