import * as THREE from "three";

import { SUN_DIRECTION } from "./Sun";

export default function createEarthMaterial({

    dayMap,
    nightMap,
    normalMap,
    specularMap

}) {

    const material = new THREE.MeshPhysicalMaterial({

        map: dayMap,

        normalMap,

        roughness: 0.88,

        metalness: 0.0,

        clearcoat: 0.18,

        clearcoatRoughness: 0.85

    });

    material.onBeforeCompile = (shader) => {

        shader.uniforms.nightMap = {

            value: nightMap

        };

        shader.uniforms.specularMap = {

            value: specularMap

        };

        shader.uniforms.sunDirection = {

            value: SUN_DIRECTION

        };

        shader.vertexShader = shader.vertexShader

            .replace(

                "#include <common>",

                `
                #include <common>

                varying vec2 vUv2;
                varying vec3 vWorldNormal;
                `

            )

            .replace(

                "#include <uv_vertex>",

                `
                #include <uv_vertex>

                vUv2 = uv;
                `

            )

            .replace(

                "#include <beginnormal_vertex>",

                `
                #include <beginnormal_vertex>

                vWorldNormal =
                    normalize(mat3(modelMatrix) * objectNormal);
                `

            );

        shader.fragmentShader = shader.fragmentShader

            .replace(

                "#include <common>",

                `
                #include <common>

                uniform sampler2D nightMap;
                uniform sampler2D specularMap;
                uniform vec3 sunDirection;

                varying vec2 vUv2;
                varying vec3 vWorldNormal;
                `

            )

            .replace(

                "#include <dithering_fragment>",

                `

                float ndl = dot(

                    normalize(vWorldNormal),

                    normalize(sunDirection)

                );

                float daylight = smoothstep(

                    -0.15,

                    0.20,

                    ndl

                );

                vec3 nightColor =
                    texture2D(
                        nightMap,
                        vUv2
                    ).rgb;

                vec3 spec =
                    texture2D(
                        specularMap,
                        vUv2
                    ).rgb;

                gl_FragColor.rgb = mix(

                    nightColor,

                    gl_FragColor.rgb,

                    daylight

                );

                float ocean = spec.r;

                float highlight =

                    ocean *

                    pow(

                        max(ndl,0.0),

                        6.0

                    ) *

                    0.20;

                gl_FragColor.rgb += highlight;

                #include <dithering_fragment>

                `

            );

    };

    material.needsUpdate = true;

    return material;

}