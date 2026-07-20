import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Counter({

    value,
    suffix = ""

}) {

    const number = useRef();

    useEffect(() => {

        const obj = {

            value: 0

        };

        gsap.to(obj, {

            value,

            duration: 2,

            ease: "power2.out",

            onUpdate: () => {

                if (!number.current) return;

                number.current.textContent =
                    Math.floor(obj.value).toLocaleString("de-DE") + suffix;

            }

        });

    }, [value, suffix]);

    return (

        <span ref={number}>

            0{suffix}

        </span>

    );

}