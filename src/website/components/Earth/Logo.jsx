import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { TextureLoader } from "three";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import logoTexture from "@assets/logos/bluepulse-emblem.png";

export default function Logo({ radius, earthRef }) {

    const meshRef = useRef();

    const { camera } = useThree();

    const texture = useLoader(
        TextureLoader,
        logoTexture
    );

    const earthPosition = useMemo(
        () => new THREE.Vector3(),
        []
    );

    const direction = useMemo(
        () => new THREE.Vector3(),
        []
    );

    useFrame((state) => {

        if (
            !meshRef.current ||
            !earthRef?.current
        ) return;

        // Mittelpunkt der Erde bestimmen
        earthRef.current.getWorldPosition(
            earthPosition
        );

        // Richtung Erde -> Kamera
        direction
            .subVectors(
                camera.position,
                earthPosition
            )
            .normalize();

        // Logo auf der Kameraseite der Erde platzieren
        meshRef.current.position.copy(
            direction.multiplyScalar(
                radius + 0.22
            )
        );

        // Feintuning der Position
        meshRef.current.position.x += 0.03;
        meshRef.current.position.y -= 0.2

        // Leichtes Schweben
        meshRef.current.position.y +=
            Math.sin(
                state.clock.elapsedTime * 1.2
            ) * 0.012;

        // Immer zur Kamera ausrichten
        meshRef.current.lookAt(
            camera.position
        );

        // Optisch etwas nach rechts zurück kippen
        meshRef.current.rotateY(
            THREE.MathUtils.degToRad(15)
        );

    });

    return (

        <mesh ref={meshRef}>

            <planeGeometry
                args={[2.58,1.98]}
            />

            <meshBasicMaterial
                map={texture}
                transparent
                toneMapped={false}
            />

        </mesh>

    );

}