import { onUnmounted } from 'vue';
import { gsap } from 'gsap';
import Flip from 'gsap/Flip';

gsap.registerPlugin(Flip);

export function useGameAnimations({ isXlDesktop, showRecentGames }) {
    let ctx;

    const initContext = () => {
        ctx = gsap.context(() => {});
    };

    const cleanup = () => {
        ctx && ctx.revert();
    };

    onUnmounted(() => {
        cleanup();
    });

    const runInContext = (fn) => {
        if (!ctx) initContext();
        ctx.add(fn);
    };

    function openRecentGamesAnim({ tl = gsap.timeline() } = {}) {
        runInContext(() => {
            tl.to('.recent-games', { duration: 0.3, ease: 'expo', width: 'auto', height: 'auto', opacity: 1, x: 0 }).to(
                '.recent-games-list',
                { duration: 0.3, ease: 'power3.out', opacity: 1 },
                0.1,
            );
        });
    }

    function hideRecentGamesAnim({ tl = gsap.timeline(), onComplete = () => {} } = {}) {
        runInContext(() => {
            if (showRecentGames.value) {
                tl.to('.recent-games-list', { duration: 0.2, ease: 'expo', opacity: 0, onComplete }).to(
                    '.recent-games',
                    { duration: 0.2, ease: 'expo', width: '11em', height: '3em', opacity: 0, x: -250 },
                    0.1,
                );
            } else {
                tl.to('.recent-games', {
                    duration: 0.2,
                    ease: 'expo',
                    width: '11em',
                    height: '3em',
                    opacity: 0,
                    x: -250,
                    onComplete,
                });
            }
        });
    }

    function closeRecentGamesAnim({ tl = gsap.timeline(), onStart = () => {} } = {}) {
        runInContext(() => {
            tl.to('.recent-games-list', { duration: 0.2, ease: 'expo', opacity: 0 }).to(
                '.recent-games',
                { duration: 0.2, ease: 'expo', width: '11em', height: '3em', opacity: 1, x: 0, onStart },
                0.1,
            );
        });
    }

    function showRecentGamesAnim({ tl = gsap.timeline() } = {}) {
        runInContext(() => {
            tl.to('.recent-games', { duration: 0.2, ease: 'expo', width: '11em', height: '3em', opacity: 1, x: 0 });
        });
    }

    function enterButtonAnim({ tl = gsap.timeline() } = {}) {
        runInContext(() => {
            tl.to('.main-button', { duration: 0.8, ease: 'expo', opacity: 1, stagger: 0.1 });
        });
    }

    function exitButtonAnim({ tl = gsap.timeline(), onComplete = () => {} } = {}) {
        runInContext(() => {
            tl.to('.main-button', { duration: 0.2, ease: 'linear', opacity: 0, stagger: 0.1, onComplete });
        });
    }

    function showButtonsAnim({ tl = gsap.timeline() } = {}) {
        runInContext(() => {
            tl.to('.main-button, .start-button', { duration: 0.8, ease: 'expo', opacity: 1, stagger: 0.1 });
        });
    }

    function hideButtonsAnim({ tl = gsap.timeline() } = {}) {
        runInContext(() => {
            tl.to('.main-button, .start-button', { duration: 0.2, ease: 'linear', opacity: 0, stagger: 0.1 });
        });
    }

    function showEndScreenAnim({ tl = gsap.timeline() } = {}) {
        runInContext(() => {
            tl.to('.end-screen', {
                duration: 0.3,
                ease: 'expo',
                width: !isXlDesktop.value ? '265px' : '328px',
                height: !isXlDesktop.value ? '114px' : '146px',
            }).to('.end-screen-child', { duration: 0.3, ease: 'linear', opacity: 1, stagger: 0.05 }, 0.1);
        });
    }

    function hideEndScreenAnim({ tl = gsap.timeline(), onComplete = () => {} } = {}) {
        runInContext(() => {
            tl.to('.end-screen-child', { duration: 0.1, ease: 'linear', opacity: 0, stagger: 0.1 }).to(
                '.end-screen',
                { duration: 0.3, ease: 'expo', width: 0, height: 0, opacity: 0, onComplete },
                0.1,
            );
        });
    }

    function shrinkButtonDivAnim({ tl = gsap.timeline(), delay = 0 } = {}) {
        runInContext(() => {
            tl.to('.buttons', { duration: 0.5, ease: 'expo', width: !isXlDesktop.value ? '222px' : '280px', delay });
        });
    }

    function growButtonDivAnim({ tl = gsap.timeline() } = {}) {
        runInContext(() => {
            tl.to('.buttons', { duration: 0.4, ease: 'expo', width: !isXlDesktop.value ? '287px' : '400px' });
        });
    }

    return {
        initContext,
        openRecentGamesAnim,
        hideRecentGamesAnim,
        closeRecentGamesAnim,
        showRecentGamesAnim,
        enterButtonAnim,
        exitButtonAnim,
        showButtonsAnim,
        hideButtonsAnim,
        showEndScreenAnim,
        hideEndScreenAnim,
        shrinkButtonDivAnim,
        growButtonDivAnim,
    };
}
