import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";

export default function LogoGlow() {

    const mesh = useRef();
    const { camera } = useThree();

    useFrame(({ clock }) => {

        if (!mesh.current) return;

        mesh.current.lookAt(camera.position);

        const scale = 1.7 + Math.sin(clock.elapsedTime * 1.2) * 0.02;

        mesh.current.scale.set(scale, scale, 1);

    });

    return (

        <mesh
            ref={mesh}
            position={[0, 0, 1.68]}
        >

            <planeGeometry args={[1, 1]} />

            <meshBasicMaterial

                color="#3ecbff"

                transparent

                opacity={0.12}

                depthWrite={false}

            />

        </mesh>

    );

}