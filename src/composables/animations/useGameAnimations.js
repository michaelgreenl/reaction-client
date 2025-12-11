import { onUnmounted } from 'vue';
import { gsap } from 'gsap';
import { useGsap } from '@/composables/useGsap.js';

export function useGameAnimations({ isXlDesktop, showRecentGames }) {
    const { registerAnim } = useGsap();

    const openRecentGamesAnim = registerAnim(({ tl }) => {
        tl.to('.recent-games', { duration: 0.3, ease: 'expo', width: 'auto', height: 'auto', opacity: 1, x: 0 }).to(
            '.recent-games-list',
            { duration: 0.3, ease: 'power3.out', opacity: 1 },
            0.1,
        );
    });

    const hideRecentGamesAnim = registerAnim(({ tl, onComplete }) => {
        if (showRecentGames.value) {
            tl.to('.recent-games-list', { duration: 0.2, ease: 'expo', opacity: 0, onComplete }).to(
                '.recent-games',
                { duration: 0.2, ease: 'expo', width: '11.5em', height: '3.25em', opacity: 0, x: -250 },
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

    const closeRecentGamesAnim = registerAnim(({ tl, onStart }) => {
        tl.to('.recent-games-list', { duration: 0.2, ease: 'expo', opacity: 0 }).to(
            '.recent-games',
            { duration: 0.2, ease: 'expo', width: '11.5em', height: '3.25em', opacity: 1, x: 0, onStart },
            0.1,
        );
    });

    const showRecentGamesAnim = registerAnim(({ tl }) => {
        tl.to('.recent-games', { duration: 0.2, ease: 'expo', width: '11.5em', height: '3.25em', opacity: 1, x: 0 });
    });

    const enterButtonAnim = registerAnim(({ tl }) => {
        tl.to('.main-button', { duration: 0.8, ease: 'expo', opacity: 1, stagger: 0.1 });
    });

    const exitButtonAnim = registerAnim(({ tl, onComplete }) => {
        tl.to('.main-button', { duration: 0.2, ease: 'linear', opacity: 0, stagger: 0.1, onComplete });
    });

    const showButtonsAnim = registerAnim(({ tl }) => {
        tl.to('.main-button, .start-button', { duration: 0.8, ease: 'expo', opacity: 1, stagger: 0.1 });
    });

    const hideButtonsAnim = registerAnim(({ tl }) => {
        tl.to('.main-button, .start-button', { duration: 0.2, ease: 'linear', opacity: 0, stagger: 0.1 });
    });

    const showEndScreenAnim = registerAnim(({ tl }) => {
        tl.to('.end-screen', {
            duration: 0.3,
            ease: 'expo',
            width: !isXlDesktop.value ? '16.6em' : '20.5em',
            height: !isXlDesktop.value ? '7.125em' : '9.125em',
        }).to('.end-screen-child', { duration: 0.3, ease: 'linear', opacity: 1, stagger: 0.05 }, 0.1);
    });

    const hideEndScreenAnim = registerAnim(({ tl, onComplete }) => {
        tl.to('.end-screen-child', { duration: 0.1, ease: 'linear', opacity: 0, stagger: 0.1 }).to(
            '.end-screen',
            { duration: 0.3, ease: 'expo', width: 0, height: 0, opacity: 0, onComplete },
            0.1,
        );
    });

    const shrinkButtonDivAnim = registerAnim(({ tl, delay }) => {
        gsap.set('.main-buttons', { width: !isXlDesktop.value ? '17.9em' : '20em' });

        tl.to('.main-buttons', {
            duration: 0.5,
            ease: 'power3.out',
            width: !isXlDesktop.value ? '13.9em' : '17.5em',
            delay,
        });
    });

    const growButtonDivAnim = registerAnim(({ tl }) => {
        gsap.set('.main-buttons', { width: !isXlDesktop.value ? '13.9em' : '17.5em' });

        tl.to('.main-buttons', { duration: 0.3, ease: 'power3.out', width: !isXlDesktop.value ? '17.9em' : '20em' });
    });

    return {
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
