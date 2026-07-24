import "./NotFound.css";

import {
    useMemo
} from "react";

import {
    Link,
    useLocation
} from "react-router-dom";

import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import EarthCanvas from "../components/Earth/EarthCanvas";

import SeoBoundary from "@shared/seo/SeoBoundary";

import {
    createNotFoundSeoPage
} from "@shared/seo/siteSeo";

export default function NotFound() {
    const location =
        useLocation();

    const seoPage =
        useMemo(
            () =>
                createNotFoundSeoPage(
                    location.pathname
                ),
            [
                location.pathname
            ]
        );

    return (
        <SeoBoundary
            page={
                seoPage
            }
            structuredData={[]}
            structuredDataScope="not-found"
        >
            <EarthCanvas />

            <Navbar />

            <main className="not-found">
                <section className="not-found__card">
                    <span className="not-found__code">
                        404
                    </span>

                    <span className="not-found__eyebrow">
                        Seite nicht gefunden
                    </span>

                    <h1>
                        Hier ist offenbar etwas vom Kurs abgekommen.
                    </h1>

                    <p>
                        Die angeforderte Adresse existiert nicht, wurde verschoben oder ist nicht mehr öffentlich erreichbar.
                    </p>

                    <div className="not-found__path">
                        <i
                            className="bi bi-link-45deg"
                            aria-hidden="true"
                        />

                        <span>
                            {
                                location.pathname
                            }
                        </span>
                    </div>

                    <div className="not-found__actions">
                        <Link
                            className="not-found__button not-found__button--primary"
                            to="/"
                        >
                            <i
                                className="bi bi-house-heart"
                                aria-hidden="true"
                            />

                            Zur Startseite
                        </Link>

                        <Link
                            className="not-found__button not-found__button--secondary"
                            to="/#kontakt"
                        >
                            <i
                                className="bi bi-envelope-heart"
                                aria-hidden="true"
                            />

                            Kontakt aufnehmen
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </SeoBoundary>
    );
}
