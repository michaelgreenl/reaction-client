import { onUnmounted } from 'vue';
import { gsap } from 'gsap';
import Flip from 'gsap/Flip';

gsap.registerPlugin(Flip);

export function useProfileAnimations({ visibleFilterInputs, showSettings, isMobile }) {
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

    function showFilterDropdownAnim({ tl = gsap.timeline() } = {}) {
        runInContext(() => {
            tl.to('.filter-toggles', { duration: 0.4, ease: 'power4.out', width: 'auto' })
                .to('.filter-toggles', { duration: 0.3, ease: 'power3.out', height: 'auto' }, 0.05)
                .to('.filter-toggles-form-group', { duration: 0.2, ease: 'linear', opacity: 1 }, 0.1)
                .to('.filter-toggles-button', { duration: 0.2, ease: 'linear', opacity: 1 }, 0.15);
        });
    }

    function hideFilterDropdownAnim({ tl = gsap.timeline(), onComplete = () => {} } = {}) {
        runInContext(() => {
            tl.to('.filter-toggles-button', { duration: 0.2, ease: 'linear', opacity: 0, onComplete })
                .to('.filter-toggles-form-group', { duration: 0.2, ease: 'linear', opacity: 0 }, 0.05)
                .to('.filter-toggles', { duration: 0.3, ease: 'power3.out', height: 0 }, 0.1)
                .to('.filter-toggles', { duration: 0.4, ease: 'power4.out', width: 0 }, 0.15);
        });
    }

    function showFilterInputsAnim({ tl = gsap.timeline(), onStart = () => {} } = {}) {
        runInContext(() => {
            tl.to('.filters', { duration: 0.4, ease: 'power3.out', height: 'auto', onStart });
        });
    }

    function hideFilterInputsAnim({ tl = gsap.timeline(), onComplete = () => {} } = {}) {
        runInContext(() => {
            tl.to('.filter-form-button', { duration: 0.1, ease: 'linear', opacity: 0 }).to(
                '.filters',
                { duration: 0.4, ease: 'power3.out', height: 0, onComplete },
                0.1,
            );
        });
    }

    function enterFilterInputAnim(key, { tl = gsap.timeline(), delay = 0, onComplete = () => {} } = {}) {
        runInContext(() => {
            const seperatorSelector =
                visibleFilterInputs.value.length === 1 ? null : `.seperator-${visibleFilterInputs.value.length - 2}`;

            if (!seperatorSelector || !showSettings.value || isMobile.value) {
                tl.to(`.form-group-${key}`, { duration: 0.3, ease: 'power3.out', opacity: 1, delay, onComplete });
            } else {
                tl.to(seperatorSelector, { duration: 0.3, ease: 'power3.out', opacity: 1, scale: 1, delay }).to(
                    `.form-group-${key}`,
                    { duration: 0.3, ease: 'power3.out', delay, opacity: 1, onComplete },
                    0,
                );
            }
        });
    }

    function exitFilterInputAnim(key, { tl = gsap.timeline(), onComplete = () => {} } = {}) {
        runInContext(() => {
            const seperatorSelector =
                visibleFilterInputs.value.length === 1 ? null : `.seperator-${visibleFilterInputs.value.length - 2}`;

            if (!seperatorSelector || !showSettings.value || isMobile.value) {
                tl.to(`.form-group-${key}`, { duration: 0.3, ease: 'power3.out', opacity: 0, onComplete });
            } else {
                tl.to(seperatorSelector, { duration: 0.3, ease: 'linear', opacity: 0, scale: 0 }).to(
                    `.form-group-${key}`,
                    { duration: 0.3, ease: 'power3.out', opacity: 0, onComplete },
                    0,
                );
            }
        });
    }

    function enterAllFilterInputsAnim({ tl = gsap.timeline(), onComplete = () => {} } = {}) {
        runInContext(() => {
            tl.to('.filter-form-seperator', { duration: 0.3, ease: 'linear', opacity: 1, scale: 1 }, 0).to(
                '.filter-form-group',
                { duration: 0.3, ease: 'power3.out', opacity: 1, stagger: 0.1, onComplete },
                0,
            );
        });
    }

    function exitAllFilterInputsAnim({ tl = gsap.timeline(), onComplete = () => {}, onStart = () => {} } = {}) {
        runInContext(() => {
            tl.to('.filter-form-seperator', { duration: 0.3, ease: 'linear', opacity: 0, scale: 0 }).to(
                '.filter-form-group',
                { duration: 0.3, ease: 'power3.out', opacity: 0, stagger: 0.05, onStart, onComplete },
                0,
            );
        });
    }

    function enterFilterButtonsAnim({ tl = gsap.timeline(), onComplete = () => {} } = {}) {
        runInContext(() => {
            tl.to('.filter-form-button', { duration: 0.3, ease: 'linear', opacity: 1, x: 0, stagger: 0.1, onComplete });
        });
    }

    function showTableCellsAnim({ tl = gsap.timeline() } = {}) {
        runInContext(() => {
            gsap.set('td', { opacity: 0 });

            tl.to('td', {
                duration: 0.2,
                ease: 'linear',
                opacity: 1,
                stagger: {
                    amount: 0.2,
                    from: 'random',
                    grid: 'auto',
                },
            });
        });
    }

    function hideTableCellsAnim({ tl = gsap.timeline(), onComplete = () => {} } = {}) {
        runInContext(() => {
            gsap.set('td', { opacity: 1 });

            tl.to('td', {
                duration: 0.2,
                ease: 'linear',
                opacity: 0,
                stagger: {
                    amount: 0.2,
                    from: 'random',
                    grid: 'auto',
                },
                onComplete,
            });
        });
    }

    function showSettingsColumns({ tl = gsap.timeline() } = {}) {
        runInContext(() => {});
    }

    function hideSettingsColumns({ tl = gsap.timeline() } = {}) {
        runInContext(() => {});
    }

    return {
        initContext,
        showFilterDropdownAnim,
        hideFilterDropdownAnim,
        showFilterInputsAnim,
        hideFilterInputsAnim,
        enterFilterInputAnim,
        exitFilterInputAnim,
        enterAllFilterInputsAnim,
        exitAllFilterInputsAnim,
        enterFilterButtonsAnim,
        showTableCellsAnim,
        hideTableCellsAnim,
        showSettingsColumns,
        hideSettingsColumns,
    };
}
