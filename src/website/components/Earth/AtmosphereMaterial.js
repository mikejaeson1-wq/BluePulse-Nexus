import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";

import * as THREE from "three";

import vertexShader from "./shaders/atmosphere.vert";
import fragmentShader from "./shaders/atmosphere.frag";

const AtmosphereMaterial = shaderMaterial(

    {

        sunDirection: new THREE.Vector3(

            -0.95,

            0.35,

            -0.55

        ).normalize()

    },

    vertexShader,

    fragmentShader

);

extend({

    AtmosphereMaterial

});

export default AtmosphereMaterial;