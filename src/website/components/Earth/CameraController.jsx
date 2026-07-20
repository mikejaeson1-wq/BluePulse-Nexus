import { useThree } from "@react-three/fiber";
import { useLayoutEffect } from "react";
import * as THREE from "three";

export default function CameraController() {

    const { camera } = useThree();

    useLayoutEffect(() => {

        camera.lookAt(
            new THREE.Vector3(2, 0, 0)
        );

        camera.updateProjectionMatrix();

    }, [camera]);

    return null;

}