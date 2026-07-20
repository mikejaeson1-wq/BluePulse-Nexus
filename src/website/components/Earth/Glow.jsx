import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export default function Glow({ radius, earthRef }) {

    const meshRef = useRef();

    const earthPosition = useMemo(
        () => new THREE.Vector3(),
        []
    );

    const direction = useMemo(
        () => new THREE.Vector3(),
        []
    );

    const material = useMemo(() => {

        return new THREE.ShaderMaterial({

            transparent: true,

            depthWrite: false,

            depthTest: true,

            blending: THREE.AdditiveBlending,

            uniforms: {

                uOpacity: {
                    value: 0.2
                },

                uColor: {
                    value: new THREE.Color("#39d8ff")
                }

            },

            vertexShader: `

                varying vec2 vUv;

                void main(){

                    vUv = uv;

                    gl_Position = projectionMatrix *
                                  modelViewMatrix *
                                  vec4(position,1.0);

                }

            `,

            fragmentShader: `

                varying vec2 vUv;

                uniform float uOpacity;
                uniform vec3 uColor;

                void main(){

                    vec2 uv = vUv - 0.5;

                    float dist = length(uv);

                    float alpha = smoothstep(
                        0.50,
                        0.0,
                        dist
                    );

                    alpha = pow(alpha, 2.8);

                    gl_FragColor = vec4(
                        uColor,
                        alpha * uOpacity
                    );

                }

            `

        });

    }, []);

    useFrame((state) => {

        if (
            !meshRef.current ||
            !earthRef.current
        ) return;

        earthRef.current.getWorldPosition(
            earthPosition
        );

        direction
            .subVectors(
                state.camera.position,
                earthPosition
            )
            .normalize();

        meshRef.current.position.copy(
            direction.multiplyScalar(
                radius + 0.0
            )
        );

        meshRef.current.lookAt(
            state.camera.position
        );

        const pulse =
            1 +
            Math.sin(
                state.clock.elapsedTime * 2
            ) * 0.02;

        meshRef.current.scale.set(
            3.3 * pulse,
            3.3 * pulse,
            1
        );

    });

    return (

        <mesh
            ref={meshRef}
            material={material}
        >

            <planeGeometry
                args={[1,1]}
            />

        </mesh>

    );

}