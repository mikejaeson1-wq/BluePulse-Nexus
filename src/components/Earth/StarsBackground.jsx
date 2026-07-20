import { Stars } from "@react-three/drei";

export default function StarsBackground() {

    return (

        <Stars
            radius={250}
            depth={120}
            count={12000}
            factor={6}
            saturation={0}
            fade
            speed={0.25}
        />

    );

}