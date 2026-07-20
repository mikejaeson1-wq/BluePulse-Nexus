import {
    EffectComposer,
    Bloom
} from "@react-three/postprocessing";

export default function Effects() {

    return (

        <EffectComposer>

            <Bloom

                mipmapBlur

                intensity={0.22}

                luminanceThreshold={0.92}

                luminanceSmoothing={0.28}

            />

        </EffectComposer>

    );

}