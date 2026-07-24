import {
    describe,
    expect,
    test
} from "vitest";

import {
    auditAccessibilityDocument
} from "./accessibilityAudit";

function setValidDocument() {
    document.documentElement.lang =
        "de";

    document.title =
        "BluePulse Testseite";

    document.body.innerHTML = `
        <a href="#main-content">Zum Hauptinhalt</a>

        <main id="main-content">
            <h1>Testseite</h1>

            <section>
                <h2>Kontakt</h2>

                <form>
                    <label for="test-name">
                        Name
                    </label>

                    <input
                        id="test-name"
                        name="name"
                    />

                    <button type="submit">
                        Absenden
                    </button>
                </form>

                <img
                    src="/logo.png"
                    alt="BluePulse Logo"
                />
            </section>
        </main>
    `;
}

describe(
    "auditAccessibilityDocument",
    () => {
        test(
            "akzeptiert eine semantisch saubere Grundstruktur",
            () => {
                setValidDocument();

                const result =
                    auditAccessibilityDocument(
                        document
                    );

                expect(
                    result.summary.errors
                ).toBe(
                    0
                );

                expect(
                    result.summary.passed
                ).toBe(
                    true
                );

                expect(
                    result.issues
                ).toEqual(
                    []
                );
            }
        );

        test(
            "findet häufige Barrierefreiheitsprobleme",
            () => {
                document
                    .documentElement
                    .removeAttribute(
                        "lang"
                    );

                document.title =
                    "";

                document.body.innerHTML = `
                    <main id="duplicate">
                        <h1>Fehlerseite</h1>
                        <h3>Übersprungene Ebene</h3>

                        <div id="duplicate"></div>

                        <img src="/bild.png" />

                        <input type="text" />

                        <button type="button"></button>

                        <a href="/"></a>

                        <iframe src="/"></iframe>

                        <div tabindex="2">
                            Falsche Reihenfolge
                        </div>
                    </main>
                `;

                const result =
                    auditAccessibilityDocument(
                        document
                    );

                const rules =
                    new Set(
                        result.issues.map(
                            (
                                issue
                            ) =>
                                issue.rule
                        )
                    );

                expect(
                    result.summary.passed
                ).toBe(
                    false
                );

                [
                    "document-language",
                    "document-title",
                    "heading-order",
                    "duplicate-id",
                    "image-alternative",
                    "form-label",
                    "button-name",
                    "link-name",
                    "frame-title",
                    "positive-tabindex"
                ].forEach(
                    (
                        rule
                    ) => {
                        expect(
                            rules.has(
                                rule
                            )
                        ).toBe(
                            true
                        );
                    }
                );
            }
        );

        test(
            "weist auf einen fehlenden Sprunglink hin",
            () => {
                document.documentElement.lang =
                    "de";

                document.title =
                    "Ohne Sprunglink";

                document.body.innerHTML = `
                    <main id="main-content">
                        <h1>Inhalt</h1>
                    </main>
                `;

                const result =
                    auditAccessibilityDocument(
                        document
                    );

                expect(
                    result.issues.some(
                        (
                            issue
                        ) =>
                            issue.rule ===
                            "skip-link"
                    )
                ).toBe(
                    true
                );
            }
        );
    }
);
