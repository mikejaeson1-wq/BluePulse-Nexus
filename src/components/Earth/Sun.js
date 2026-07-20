import * as THREE from "three";

export const SUN_POSITION = new THREE.Vector3(
    14,
    1.5,
    1
);

export const SUN_DIRECTION =
    SUN_POSITION.clone().normalize();