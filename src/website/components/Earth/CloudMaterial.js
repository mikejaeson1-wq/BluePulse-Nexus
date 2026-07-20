import * as THREE from "three";

import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";

import vertexShader from "./shaders/cloud.vert";
import fragmentShader from "./shaders/cloud.frag";

const CloudMaterial = shaderMaterial(

    {

        cloudMap: null,

        sunDirection: new THREE.Vector3(-1,0.25,-0.8).normalize()

    },

    vertexShader,

    fragmentShader

);

extend({

    CloudMaterial

});

export default CloudMaterial;