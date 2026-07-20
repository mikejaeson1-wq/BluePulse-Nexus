import Space from "./Space";
import Lights from "./Lights";
import Planet from "./Planet";
import Effects from "./Effects";
//import CameraController from "./CameraController";

export default function EarthScene() {

    return (
        <>

            {/* <CameraController /> */}

            <Space />

            <Lights />

            <Planet />

            <Effects />
        </>
    );

}