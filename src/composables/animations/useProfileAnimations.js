import { onUnmounted } from 'vue';
import { gsap } from 'gsap';
import { useGsap } from '@/composables/useGsap.js';

export function useProfileAnimations({ visibleFilterInputs, showSettings, isMobile }) {
    const { registerAnim } = useGsap();

    const showFilterDropdownAnim = registerAnim(({ tl }) => {
        tl.to('.filter-toggles', { duration: 0.4, ease: 'power4.out', width: 'auto' })
            .to('.filter-toggles', { duration: 0.3, ease: 'power3.out', height: 'auto' }, 0.05)
            .to('.filter-toggles-form-group', { duration: 0.2, ease: 'linear', opacity: 1 }, 0.1)
            .to('.filter-toggles-button', { duration: 0.2, ease: 'linear', opacity: 1 }, 0.15);
    });

    const hideFilterDropdownAnim = registerAnim(({ tl, onComplete }) => {
        tl.to('.filter-toggles-button', { duration: 0.2, ease: 'linear', opacity: 0, onComplete })
            .to('.filter-toggles-form-group', { duration: 0.2, ease: 'linear', opacity: 0 }, 0.05)
            .to('.filter-toggles', { duration: 0.3, ease: 'power3.out', height: 0 }, 0.1)
            .to('.filter-toggles', { duration: 0.4, ease: 'power4.out', width: 0 }, 0.15);
    });

    const showFilterInputsAnim = registerAnim(({ tl, onStart }) => {
        tl.to('.filters', { duration: 0.4, ease: 'power3.out', height: 'auto', onStart });
    });

    const hideFilterInputsAnim = registerAnim(({ tl, onComplete }) => {
        tl.to('.filter-form-button', { duration: 0.1, ease: 'linear', opacity: 0 }).to(
            '.filters',
            { duration: 0.4, ease: 'power3.out', height: 0, onComplete },
            0.1,
        );
    });

    const enterFilterInputAnim = registerAnim(({ key, tl, delay, onComplete }) => {
        const seperatorSelector =
            visibleFilterInputs.value.length === 1 ? null : `.seperator-${visibleFilterInputs.value.length - 2}`;

        if (!seperatorSelector || !showSettings.value || isMobile.value) {
            tl.to(`.form-group-${key}`, { duration: 0.3, ease: 'power3.out', opacity: 1, delay, onComplete });
        } else {
            tl.to(seperatorSelector, { duration: 0.3, ease: 'linear', opacity: 1, scale: 1, delay }).to(
                `.form-group-${key}`,
                { duration: 0.3, ease: 'power3.out', delay, opacity: 1, onComplete },
                0,
            );
        }
    });

    const exitFilterInputAnim = registerAnim(({ key, tl, onComplete }) => {
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

    const enterAllFilterInputsAnim = registerAnim(({ tl, onComplete }) => {
        tl.to('.filter-form-seperator', { duration: 0.3, ease: 'linear', opacity: 1, scale: 1 }, 0).to(
            '.filter-form-group',
            { duration: 0.3, ease: 'power3.out', opacity: 1, stagger: 0.1, onComplete },
            0,
        );
    });

    const exitAllFilterInputsAnim = registerAnim(({ tl, onStart, onComplete }) => {
        tl.to('.filter-form-seperator', { duration: 0.3, ease: 'linear', opacity: 0, scale: 0 }).to(
            '.filter-form-group',
            { duration: 0.3, ease: 'power3.out', opacity: 0, stagger: 0.05, onStart, onComplete },
            0,
        );
    });

    const enterFilterButtonsAnim = registerAnim(({ tl, onComplete }) => {
        tl.to('.filter-form-button', { duration: 0.3, ease: 'linear', opacity: 1, x: 0, stagger: 0.1, onComplete });
    });

    const showTableCellsAnim = registerAnim(({ tl }) => {
        gsap.set('.column-cell', { opacity: 0 });

        tl.to('.column-cell', {
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

    const hideTableCellsAnim = registerAnim(({ tl, onComplete }) => {
        tl.to('.column-cell', {
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

    const showSettingsColumnsAnim = registerAnim(({ tl }) => {
        // tl.to('', {});
    });

    const hideSettingsColumnsAnim = registerAnim(({ tl, onComplete }) => {
        // TODO: switch from using table to flex and columns
        // tl.to('.setting-cell, .column-header-setting', {
        //     duration: 0.2,
        //     ease: 'linear',
        //     opacity: 0,
        //     border: 0,
        //     stagger: {
        //         amount: 0.2,
        //         from: 'random',
        //         grid: 'auto',
        //     },
        // }).to(
        //     '.setting-cell, .column-header-setting',
        //     {
        //         duration: 5,
        //         ease: 'linear',
        //         paddingLeft: 0,
        //         paddingRight: 0,
        //         borderWidth: 0,
        //         width: 0,
        //         overflow: 'hidden',
        //         onComplete,
        //     },
        //     0,
        // );
    });

    return {
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
        showSettingsColumnsAnim,
        hideSettingsColumnsAnim,
    };
}
