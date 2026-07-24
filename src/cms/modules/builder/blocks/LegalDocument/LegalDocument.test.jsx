import {
    expect,
    test
} from "vitest";

import {
    render,
    screen
} from "@testing-library/react";

import axe from "axe-core";

import LegalDocument from "./LegalDocument";

const LEGAL_DOCUMENT_DATA = {
    documentType:
        "privacy",

    title:
        "Datenschutzerklärung",

    intro:
        "Informationen zur Verarbeitung personenbezogener Daten.",

    draftWarning:
        "Entwurf – Angaben prüfen.",

    lastUpdated:
        "24. Juli 2026",

    sections: [
        {
            id:
                "responsible",

            title:
                "1. Verantwortliche Stelle",

            paragraphs: [
                "BluePulse Tierschutz n.e.V.",
                "Holger Fischer\nDoreen Hoffmann"
            ],

            items:
                [],

            note:
                ""
        },
        {
            id:
                "rights",

            title:
                "2. Rechte betroffener Personen",

            paragraphs: [
                "Betroffene Personen haben insbesondere folgende Rechte:"
            ],

            items: [
                "Auskunft",
                "Berichtigung",
                "Löschung"
            ],

            note:
                "Anfragen können per E-Mail gestellt werden."
        }
    ]
};

test(
    "das Rechtsdokument rendert eine nachvollziehbare Überschriftenstruktur",
    () => {
        render(
            <LegalDocument
                data={
                    LEGAL_DOCUMENT_DATA
                }
            />
        );

        expect(
            screen.getByRole(
                "heading",
                {
                    level:
                        1,

                    name:
                        "Datenschutzerklärung"
                }
            )
        ).toBeTruthy();

        expect(
            screen.getAllByRole(
                "heading",
                {
                    level:
                        2
                }
            )
        ).toHaveLength(
            2
        );

        expect(
            screen.getByRole(
                "alert"
            )
        ).toBeTruthy();

        expect(
            screen.getByRole(
                "list"
            )
        ).toBeTruthy();
    }
);

test(
    "das Rechtsdokument hat keine automatischen axe-Verstöße",
    async () => {
        document.documentElement.lang =
            "de";

        const {
            container
        } =
            render(
                <main>
                    <LegalDocument
                        data={
                            LEGAL_DOCUMENT_DATA
                        }
                    />
                </main>
            );

        const result =
            await axe.run(
                container,
                {
                    rules: {
                        "color-contrast": {
                            enabled:
                                false
                        },

                        region: {
                            enabled:
                                false
                        }
                    }
                }
            );

        expect(
            result.violations
        ).toEqual(
            []
        );
    }
);
