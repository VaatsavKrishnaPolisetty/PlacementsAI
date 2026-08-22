import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';

// Register plugins once
gsap.registerPlugin(ScrollTrigger, Flip);

// Standard Easing Curves
export const EASINGS = {
  smooth: 'power2.out',
  snappy: 'power3.out',
  expo: 'expo.out',
  bounceOut: 'back.out(1.5)',
  softBounce: 'back.out(1.2)',
  inOut: 'power2.inOut',
};

// Global Defaults
gsap.defaults({
  ease: EASINGS.smooth,
  duration: 0.45,
});

export { gsap, ScrollTrigger, Flip };
export default gsap;
