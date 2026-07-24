import assert from "node:assert/strict";

import test from "node:test";

import {
    evaluateLaunchReadiness,
    findPlaceholder,
    isHttpLink
} from "../src/launch/launchReadiness.js";

function createReadySnapshot() {
    const content = {
        hero: {
            title:
                "Every Life Matters"
        },

        mission: {
            title:
                "Unsere Mission"
        },

        projects: {
            title:
                "Projekte"
        },

        participation: {
            title:
                "Mitmachen"
        },

        impact: {
            items: [
                {
                    value: 9
                }
            ]
        },

        donations: {
            methods: [
                {
                    id:
                        "paypal",

                    title:
                        "PayPal",

                    buttonLabel:
                        "Spenden",

                    href:
                        "https://paypal.example.net/bluepulse"
                }
            ]
        },

        contact: {
            email:
                "kontakt@blue-pulse.de",

            privacyText:
                "Die Angaben werden zur Bearbeitung der Anfrage gespeichert."
        }
    };

    const legalPage =
        (
            slug,
            title,
            contentText
        ) => ({
            id:
                slug,

            title,
            slug,
            status:
                "published",

            blocks: [
                {
                    type:
                        "legal",

                    text:
                        contentText
                }
            ],

            theme: {
                pageSettings: {
                    seo: {
                        description:
                            `${title} von BluePulse`
                    }
                }
            }
        });

    return {
        migrations: [
            {
                version:
                    "001",

                status:
                    "applied"
            }
        ],

        content,

        homeLayout: {
            items:
                Object.keys(
                    content
                ).map(
                    (id) => ({
                        id,
                        enabled:
                            true
                    })
                )
        },

        navigation: {
            items: [
                {
                    id:
                        "start",

                    label:
                        "Start",

                    href:
                        "/#start",

                    enabled:
                        true
                }
            ],

            cta: {
                enabled:
                    true,

                label:
                    "Spenden",

                href:
                    "/#spenden"
            }
        },

        footer: {
            email:
                "kontakt@blue-pulse.de",

            legalLinks: [
                {
                    id:
                        "impressum",

                    href:
                        "/impressum",

                    enabled:
                        true
                },
                {
                    id:
                        "datenschutz",

                    href:
                        "/datenschutz",

                    enabled:
                        true
                }
            ],

            socialLinks: []
        },

        pages: [
            legalPage(
                "impressum",
                "Impressum",
                "Vertreten durch Holger Fischer und Doreen Hoffmann"
            ),

            legalPage(
                "datenschutz",
                "Datenschutz",
                "Datenschutzerklaerung"
            )
        ],

        media: [
            {
                id:
                    "hope",

                mimeType:
                    "image/webp",

                altText:
                    "Hope schaut in die Kamera",

                fileExists:
                    true
            }
        ],

        activeAdministratorCount:
            1
    };
}

test(
    "ein vollstaendiger CMS-Stand ist launchbereit",
    () => {
        const result =
            evaluateLaunchReadiness(
                createReadySnapshot(),
                {
                    publicUrl:
                        "https://neu.blue-pulse.de",

                    emailEnabled:
                        true
                }
            );

        assert.equal(
            result.ready,
            true
        );

        assert.equal(
            result.totals.blockers,
            0
        );
    }
);

test(
    "fehlende Medien, tote Spendenlinks und alte Vertretung sperren den Launch",
    () => {
        const snapshot =
            createReadySnapshot();

        snapshot.content
            .donations
            .methods[0]
            .href = "";

        snapshot.media[0]
            .fileExists =
                false;

        snapshot.pages[0]
            .blocks[0]
            .text =
                "Vertreten durch Jeannine Kellermann";

        const result =
            evaluateLaunchReadiness(
                snapshot,
                {
                    publicUrl:
                        "https://neu.blue-pulse.de"
                }
            );

        assert.equal(
            result.ready,
            false
        );

        const codes =
            new Set(
                result.checks
                    .filter(
                        (check) =>
                            check.level ===
                            "blocker"
                    )
                    .map(
                        (check) =>
                            check.code
                    )
            );

        assert.equal(
            codes.has(
                "content.donations.links"
            ),
            true
        );

        assert.equal(
            codes.has(
                "media.files"
            ),
            true
        );

        assert.equal(
            codes.has(
                "pages.legal.outdated-representative"
            ),
            true
        );
    }
);

test(
    "Links und bekannte Platzhalter werden erkannt",
    () => {
        assert.equal(
            isHttpLink(
                "/impressum"
            ),
            true
        );

        assert.equal(
            isHttpLink(
                "javascript:alert(1)"
            ),
            false
        );

        assert.equal(
            isHttpLink(
                "//unbekannt.example.net"
            ),
            false
        );

        assert.equal(
            findPlaceholder({
                address:
                    "BITTE LADUNGSFAEHIGE ANSCHRIFT EINTRAGEN"
            }),
            "BITTE ... EINTRAGEN"
        );
    }
);

test(
    "die lokale Docker-Pruefung darf eine HTTP-Adresse verwenden",
    () => {
        const result =
            evaluateLaunchReadiness(
                createReadySnapshot(),
                {
                    publicUrl:
                        "http://localhost:8080",

                    requireHttps:
                        false
                }
            );

        assert.equal(
            result.ready,
            true
        );
    }
);

test(
    "ein veralteter Mailto-Datenschutzhinweis sperrt den Launch",
    () => {
        const snapshot =
            createReadySnapshot();

        snapshot.content
            .contact
            .privacyText =
                "Deine Eingaben werden nicht auf dieser Website gespeichert.";

        const result =
            evaluateLaunchReadiness(
                snapshot,
                {
                    publicUrl:
                        "https://blue-pulse.de"
                }
            );

        assert.equal(
            result.ready,
            false
        );

        assert.equal(
            result.checks.some(
                (check) =>
                    check.code ===
                        "content.contact.privacy" &&
                    check.level ===
                        "blocker"
            ),
            true
        );
    }
);
