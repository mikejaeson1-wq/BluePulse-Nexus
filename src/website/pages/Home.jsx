import Navbar from "../components/Navbar/Navbar";

import Hero from "../components/Hero/Hero";
import Mission from "../components/Mission/Mission";
import Impact from "../components/Impact/Impact";

import EarthCanvas from "../components/Earth/EarthCanvas";

export default function Home() {

    return (

        <>

            <EarthCanvas />

            <Navbar />

            <main>

                <Hero />

                <Mission />

                <Impact />

            </main>

        </>

    );

}