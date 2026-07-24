import {
    useLayoutEffect
} from "react";

import gsap from "gsap";

function prefersReducedMotion() {
    return Boolean(
        globalThis.window
            ?.matchMedia?.(
                "(prefers-reduced-motion: reduce)"
            )
            ?.matches
    );
}

export default function useReveal(
    ref,
    options = {}
) {
    useLayoutEffect(() => {
        const element =
            ref.current;

        if (!element) {
            return undefined;
        }

        if (
            prefersReducedMotion()
        ) {
            gsap.set(
                element,
                {
                    opacity:
                        1,

                    y:
                        0,

                    clearProps:
                        "transform"
                }
            );

            return () => {
                gsap.killTweensOf(
                    element
                );
            };
        }

        gsap.set(
            element,
            {
                opacity:
                    1,

                y:
                    0
            }
        );

        const animation =
            gsap.fromTo(
                element,
                {
                    opacity:
                        0,

                    y:
                        options.y ??
                        60
                },
                {
                    opacity:
                        1,

                    y:
                        0,

                    duration:
                        options.duration ??
                        1,

                    delay:
                        options.delay ??
                        0,

                    ease:
                        "power3.out"
                }
            );

        return () => {
            animation.kill();
        };
    }, []);
}
