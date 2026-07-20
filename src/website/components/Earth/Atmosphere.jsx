import { useMemo } from "react";
import * as THREE from "three";

import { SUN_DIRECTION } from "./Sun";

export default function Atmosphere({ radius }) {

    const material = useMemo(() => {

        return new THREE.ShaderMaterial({

            transparent: true,

            side: THREE.BackSide,

            depthWrite: false,

            blending: THREE.AdditiveBlending,

            uniforms: {

                glowColor: {

                    value: new THREE.Color("#63b8ff")

                },

                sunDirection: {

                    value: SUN_DIRECTION

                }

            },

            vertexShader: `

                varying vec3 vNormal;
                varying vec3 vViewDir;

                void main(){

                    vec4 worldPos = modelMatrix * vec4(position,1.0);

                    vNormal = normalize(mat3(modelMatrix) * normal);

                    vViewDir = normalize(cameraPosition - worldPos.xyz);

                    gl_Position =
                        projectionMatrix *
                        viewMatrix *
                        worldPos;

                }

            `,

            fragmentShader: `

                uniform vec3 glowColor;
                uniform vec3 sunDirection;

                varying vec3 vNormal;
                varying vec3 vViewDir;

                void main(){

                    float fresnel = pow(

                        1.0 -

                        max(

                            dot(

                                normalize(vNormal),

                                normalize(vViewDir)

                            ),

                            0.0

                        ),

                        5.0

                    );

                    float sun = max(

                        dot(

                            normalize(vNormal),

                            normalize(sunDirection)

                        ),

                        0.0

                    );

                    sun = mix(

                        0.25,

                        1.0,

                        sun

                    );

                    float alpha =

                        fresnel *

                        sun *

                        0.18;

                    gl_FragColor = vec4(

                        glowColor,

                        alpha

                    );

                }

            `

        });

    }, []);

    return (

        <mesh>

            <sphereGeometry

                args={[

                    radius * 1.02,

                    128,

                    128

                ]}

            />

            <primitive

                object={material}

                attach="material"

            />

        </mesh>

    );

}