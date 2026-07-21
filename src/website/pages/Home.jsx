import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

import HomeSections from "../components/HomeSections/HomeSections";

import EarthCanvas from "../components/Earth/EarthCanvas";

export default function Home() {
    return (
        <>
            <EarthCanvas />

            <Navbar />

            <main>
                <HomeSections />
            </main>

            <Footer />
        </>
    );
}