import { useLayoutEffect } from "react";
import gsap from "gsap";

export default function useReveal(ref, options = {}) {

    useLayoutEffect(() => {

        if (!ref.current) return;

        gsap.set(ref.current, {

            opacity: 1,
            y: 0

        });

        const animation = gsap.fromTo(

            ref.current,

            {

                opacity: 0,
                y: options.y ?? 60

            },

            {

                opacity: 1,
                y: 0,
                duration: options.duration ?? 1,
                delay: options.delay ?? 0,
                ease: "power3.out"

            }

        );

        return () => animation.kill();

    }, []);

}