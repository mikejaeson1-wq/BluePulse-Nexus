import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

import EarthScene from "./EarthScene";

import "./EarthCanvas.css";

export default function EarthCanvas() {

    return (

        <div className="earthCanvas">

            <Canvas

                shadows

                dpr={[1, 2]}

                camera={{
                    position: [0, 0, 8.5],
                    fov: 35,
                    near: 0.1,
                    far: 1000
                }}

                gl={{

                    antialias: true,
                    alpha: true,
                    stencil: false,
                    depth: true,
                    powerPreference: "high-performance"

                }}

                onCreated={({ gl, scene }) => {

                    gl.outputColorSpace = THREE.SRGBColorSpace;

                    gl.toneMapping = THREE.ACESFilmicToneMapping;

                    gl.toneMappingExposure = 1.15;

                    gl.setPixelRatio(

                        Math.min(window.devicePixelRatio, 2)

                    );

                    gl.setClearColor(0x000000, 0);

                    scene.background = null;

                }}

            >

                <EarthScene />

            </Canvas>

        </div>

    );

}