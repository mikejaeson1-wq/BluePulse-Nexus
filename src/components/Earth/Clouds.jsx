import { forwardRef, useMemo } from "react";
import * as THREE from "three";

const Clouds = forwardRef(function Clouds(

    {

        radius,
        texture

    },

    ref

) {

    const material = useMemo(() => {

        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;

        return new THREE.MeshPhysicalMaterial({

            map: texture,

            transparent: true,

            opacity: 0.36,

            depthWrite: false,

            side: THREE.DoubleSide,

            roughness: 0.82,

            metalness: 0,

            clearcoat: 0.35,

            clearcoatRoughness: 0.95,

            alphaTest: 0.03

        });

    }, [texture]);

    return (

        <mesh ref={ref}>

            <sphereGeometry

                args={[

                    radius * 1.012,

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

});

export default Clouds;