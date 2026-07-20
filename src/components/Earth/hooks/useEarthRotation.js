import { useFrame, useThree } from "@react-three/fiber";

export default function useEarthRotation(earthRef, cloudRef) {

    const { mouse } = useThree();

    useFrame((_, delta) => {

        if (earthRef.current) {

            earthRef.current.rotation.y += delta * 0.03;

            earthRef.current.rotation.x +=
                (mouse.y * 0.18 - earthRef.current.rotation.x) * 0.03;

            earthRef.current.rotation.z +=
                (-mouse.x * 0.12 - earthRef.current.rotation.z) * 0.03;

        }

        if (cloudRef.current && earthRef.current) {

            cloudRef.current.rotation.y += delta * 0.05;

            cloudRef.current.rotation.x = earthRef.current.rotation.x;
            cloudRef.current.rotation.z = earthRef.current.rotation.z;

        }

    });

}