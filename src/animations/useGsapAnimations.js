import { useEffect, useRef } from 'react';
import { gsap, EASINGS } from './gsapUtils';

/**
 * Hook for staggered entrance animation of child elements within a container.
 */
export function useStaggerEntrance(containerRef, selector = '.animate-card', triggerKey = '', options = {}) {
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const elements = containerRef.current.querySelectorAll(selector);
      if (elements.length === 0) return;

      gsap.fromTo(
        elements,
        {
          opacity: 0,
          y: options.y ?? 16,
          scale: options.scale ?? 0.98,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: options.duration ?? 0.45,
          stagger: options.stagger ?? 0.06,
          ease: options.ease ?? EASINGS.snappy,
          delay: options.delay ?? 0.05,
          clearProps: 'opacity,transform',
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [containerRef, selector, triggerKey, options.y, options.scale, options.duration, options.stagger, options.ease, options.delay]);
}

/**
 * Hook for numerical count-up animation on numeric values.
 */
export function useCountUp(numberRef, targetValue, duration = 1.2) {
  useEffect(() => {
    if (!numberRef.current) return;

    // Parse target number (handles strings like '412', '156', '85.2%')
    const numericStr = String(targetValue).replace(/[^0-9.]/g, '');
    const targetNum = parseFloat(numericStr);
    if (isNaN(targetNum)) return;

    const obj = { val: 0 };
    const isDecimal = String(targetValue).includes('.');
    const suffix = String(targetValue).includes('%') ? '%' : String(targetValue).includes('LPA') ? ' LPA' : '';
    const prefix = String(targetValue).startsWith('₹') ? '₹' : '';

    const ctx = gsap.context(() => {
      gsap.to(obj, {
        val: targetNum,
        duration: duration,
        ease: EASINGS.expo,
        onUpdate: () => {
          if (numberRef.current) {
            const formatted = isDecimal ? obj.val.toFixed(1) : Math.round(obj.val);
            numberRef.current.innerText = `${prefix}${formatted}${suffix}`;
          }
        },
      });
    }, numberRef);

    return () => ctx.revert();
  }, [numberRef, targetValue, duration]);
}

/**
 * Hook for animated progress bars expansion.
 */
export function useProgressBarAnimation(containerRef, selector = '.animate-progress-bar', triggerKey = '') {
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const bars = containerRef.current.querySelectorAll(selector);
      bars.forEach((bar) => {
        const targetWidth = bar.getAttribute('data-width') || bar.style.width || '100%';
        gsap.fromTo(
          bar,
          { width: '0%' },
          {
            width: targetWidth,
            duration: 0.8,
            ease: EASINGS.snappy,
            delay: 0.1,
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, [containerRef, selector, triggerKey]);
}

/**
 * Hook for interactive card micro-hover animation.
 */
export function useCardHoverPhysics(cardRef) {
  const isHovered = useRef(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const handleMouseEnter = () => {
      isHovered.current = true;
      gsap.to(el, {
        y: -3,
        scale: 1.01,
        boxShadow: '0 12px 24px -6px rgba(15, 23, 42, 0.08), 0 8px 12px -4px rgba(15, 23, 42, 0.04)',
        duration: 0.25,
        ease: EASINGS.softBounce,
      });
    };

    const handleMouseLeave = () => {
      isHovered.current = false;
      gsap.to(el, {
        y: 0,
        scale: 1,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.07), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        duration: 0.25,
        ease: EASINGS.smooth,
      });
    };

    el.addEventListener('mouseenter', handleMouseEnter);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mouseenter', handleMouseEnter);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [cardRef]);
}

/**
 * Hook for smooth modal popup animation.
 */
export function useModalEntrance(modalRef, backdropRef) {
  useEffect(() => {
    // Lock background body scrolling while modal popup is open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    if (modalRef.current) {
      const ctx = gsap.context(() => {
        if (backdropRef?.current) {
          gsap.fromTo(
            backdropRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.25, ease: EASINGS.smooth }
          );
        }

        gsap.fromTo(
          modalRef.current,
          { opacity: 0, scale: 0.94, y: 15 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.35,
            ease: EASINGS.bounceOut,
          }
        );
      }, modalRef);
    }

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [modalRef, backdropRef]);
}
