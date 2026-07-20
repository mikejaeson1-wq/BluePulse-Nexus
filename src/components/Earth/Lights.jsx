import { SUN_POSITION } from "./Sun";

export default function Lights() {

    return (
        <>

            <directionalLight
                position={SUN_POSITION}
                intensity={2.8}
                color="#ffffff"
            />

            <hemisphereLight
                args={[
                    "#87bfff",
                    "#020202",
                    0.05
                ]}
            />

            <ambientLight
                intensity={0.005}
            />

        </>
    );

}