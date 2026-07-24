import {
    useMemo
} from "react";

import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

import HomeSections from "../components/HomeSections/HomeSections";

import EarthCanvas from "../components/Earth/EarthCanvas";

import SeoBoundary from "@shared/seo/SeoBoundary";

import {
    HOME_SEO_PAGE
} from "@shared/seo/siteSeo";

import {
    createOrganizationStructuredData,
    createWebsiteStructuredData
} from "@shared/seo/structuredData";

export default function Home() {
    const structuredData =
        useMemo(
            () => [
                createOrganizationStructuredData(),
                createWebsiteStructuredData()
            ],
            []
        );

    return (
        <SeoBoundary
            page={
                HOME_SEO_PAGE
            }
            structuredData={
                structuredData
            }
            structuredDataScope="home"
        >
            <EarthCanvas />

            <Navbar />

            <main>
                <HomeSections />
            </main>

            <Footer />
        </SeoBoundary>
    );
}
