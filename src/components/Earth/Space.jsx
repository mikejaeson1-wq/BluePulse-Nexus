import { Stars, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { BackSide, SRGBColorSpace } from "three";
import { useRef } from "react";

import starsMilky from "../../assets/textures/stars_milky.jpg";

export default function Space() {

    const sky = useRef();

    const milkyWay = useTexture(starsMilky);

    milkyWay.colorSpace = SRGBColorSpace;

    useFrame((_, delta) => {

        if (sky.current) {

            // Langsame Rotation der Milchstraße
            sky.current.rotation.y += delta * 0.0008;

        }

    });

    return (

        <>

            {/* Milchstraße */}

            <mesh ref={sky}>

                <sphereGeometry

                    args={[120, 64, 64]}

                />

                <meshBasicMaterial

                    map={milkyWay}

                    side={BackSide}

                    transparent

                    opacity={0.22}

                />

            </mesh>

            {/* Ferne Sterne */}

            <Stars

                radius={420}

                depth={220}

                count={12000}

                factor={1.2}

                saturation={0}

                fade

                speed={0.004}

            />

            {/* Mittlere Sterne */}

            <Stars

                radius={220}

                depth={120}

                count={2200}

                factor={3}

                saturation={0}

                fade

                speed={0.008}

            />

            {/* Helle nahe Sterne */}

            <Stars

                radius={110}

                depth={45}

                count={180}

                factor={10}

                saturation={0}

                fade

                speed={0.015}

            />

        </>

    );

}