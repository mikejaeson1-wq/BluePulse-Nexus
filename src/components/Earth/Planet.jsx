import { useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import * as THREE from "three";

import Clouds from "./Clouds";
import Atmosphere from "./Atmosphere";
import Logo from "./Logo";
import Glow from "./Glow";

import createEarthMaterial from "./EarthMaterial";

import earthDay from "../../assets/textures/earth_day.jpg";
import earthNight from "../../assets/textures/earth_night.jpg";
import earthNormal from "../../assets/textures/earth_normal.png";
import earthSpecular from "../../assets/textures/earth_specular.png";
import earthClouds from "../../assets/textures/earth_clouds.png";

const EARTH_RADIUS = 1.6;

export default function Planet() {

    const earthGroupRef = useRef();
    const cloudRef = useRef();

    const [
        dayMap,
        nightMap,
        normalMap,
        specularMap,
        cloudMap
    ] = useLoader(TextureLoader, [
        earthDay,
        earthNight,
        earthNormal,
        earthSpecular,
        earthClouds
    ]);

    const material = useMemo(() => {

        return createEarthMaterial({

            dayMap,
            nightMap,
            normalMap,
            specularMap

        });

    }, [

        dayMap,
        nightMap,
        normalMap,
        specularMap

    ]);

    useFrame((_, delta) => {

        if (earthGroupRef.current) {

            earthGroupRef.current.rotation.y += delta * 0.015;

        }

        if (cloudRef.current) {

            cloudRef.current.rotation.y += delta * 0.018;

        }

    });

    return (

        <group
            position={[2, 0, 0]}
            scale={0.98}
        >

            <group
                ref={earthGroupRef}
                rotation={[
                    0,
                    THREE.MathUtils.degToRad(120),
                    0
                ]}
            >

                <mesh>

                    <sphereGeometry
                        args={[
                            EARTH_RADIUS,
                            256,
                            256
                        ]}
                    />

                    <primitive
                        object={material}
                        attach="material"
                    />

                </mesh>

                <Clouds
                    ref={cloudRef}
                    radius={EARTH_RADIUS}
                    texture={cloudMap}
                />

                <Atmosphere
                    radius={EARTH_RADIUS}
                />

            </group>

            <Glow
                radius={EARTH_RADIUS}
                earthRef={earthGroupRef}
            />

            <Logo
                radius={EARTH_RADIUS}
                earthRef={earthGroupRef}
            />

        </group>

    );

}