import {
    expect,
    test
} from "vitest";

import {
    render,
    screen,
    waitFor
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import {
    MemoryRouter
} from "react-router-dom";

import axe from "axe-core";

import AccessibilityRoot from "./AccessibilityRoot";

function renderAccessibilityRoot(
    initialEntry = "/"
) {
    return render(
        <MemoryRouter
            initialEntries={[
                initialEntry
            ]}
        >
            <AccessibilityRoot>
                <main>
                    <h1>
                        BluePulse Test
                    </h1>

                    <section id="kontakt">
                        <h2>
                            Kontakt
                        </h2>

                        <button type="button">
                            Nachricht senden
                        </button>
                    </section>
                </main>
            </AccessibilityRoot>
        </MemoryRouter>
    );
}

test(
    "der Sprunglink fokussiert den Hauptinhalt",
    async () => {
        document.title =
            "BluePulse Test";

        const user =
            userEvent.setup();

        renderAccessibilityRoot();

        const skipLink =
            screen.getByRole(
                "link",
                {
                    name:
                        "Zum Hauptinhalt"
                }
            );

        const mainContent =
            screen.getByRole(
                "main"
            );

        await user.click(
            skipLink
        );

        expect(
            mainContent.id
        ).toBe(
            "main-content"
        );

        expect(
            document.activeElement
        ).toBe(
            mainContent
        );
    }
);

test(
    "ein Hash-Ziel wird auch beim ersten Seitenaufruf fokussiert",
    async () => {
        document.title =
            "BluePulse Kontakt";

        renderAccessibilityRoot(
            "/#kontakt"
        );

        const contactSection =
            document.getElementById(
                "kontakt"
            );

        await waitFor(
            () => {
                expect(
                    document.activeElement
                ).toBe(
                    contactSection
                );
            }
        );
    }
);

test(
    "die globale Barrierefreiheitsschicht hat keine automatischen axe-Verstöße",
    async () => {
        document.documentElement.lang =
            "de";

        document.title =
            "BluePulse Test";

        const {
            container
        } =
            renderAccessibilityRoot();

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
