import * as THREE from "three";

import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";

import vertexShader from "./shaders/logo.vert";
import fragmentShader from "./shaders/logo.frag";

const LogoMaterial = shaderMaterial(

    {

        logoMap: null,
        color: new THREE.Color("#37d8ff"),
        intensity: 1.0

    },

    vertexShader,
    fragmentShader

);

extend({

    LogoMaterial

});

export default LogoMaterial;