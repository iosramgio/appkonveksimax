import AOS from 'aos';
import 'aos/dist/aos.css';

/**
 * Initialize AOS with optimized settings for smoother animations
 */
export const initAOS = () => {
  AOS.init({
    duration: 800,
    easing: 'ease-out',
    once: true,
    offset: 50,
    delay: 0,
    // Disable animations on mobile for better performance
    disable: window.innerWidth < 768 && 'mobile',
    // Throttle events for better performance
    throttleDelay: 99,
    // Use transform instead of top/left for better performance
    useClassNames: true,
    disableMutationObserver: false,
  });
};

/**
 * Refresh AOS animations (useful after dynamic content changes)
 */
export const refreshAOS = () => {
  AOS.refresh();
}; 