export const ACCESSIBILITY_SEVERITY =
    Object.freeze({
        ERROR:
            "error",

        WARNING:
            "warning",

        NOTICE:
            "notice"
    });

const FORM_CONTROL_SELECTOR = [
    "input:not([type='hidden']):not([type='button']):not([type='submit']):not([type='reset']):not([type='image'])",
    "select",
    "textarea"
].join(",");

function normalizeText(
    value
) {
    return String(
        value ??
        ""
    )
        .replace(
            /\s+/g,
            " "
        )
        .trim();
}

function escapeSelector(
    value
) {
    if (
        globalThis.CSS
            ?.escape
    ) {
        return globalThis.CSS.escape(
            value
        );
    }

    return String(
        value
    ).replace(
        /[^a-zA-Z0-9_-]/g,
        "\\$&"
    );
}

function getElementIndex(
    element
) {
    const siblings =
        Array.from(
            element.parentElement
                ?.children ??
            []
        ).filter(
            (
                sibling
            ) =>
                sibling.tagName ===
                element.tagName
        );

    return siblings.indexOf(
        element
    ) + 1;
}

export function getElementSelector(
    element
) {
    if (
        !element ||
        element.nodeType !==
            1
    ) {
        return "";
    }

    if (element.id) {
        return `#${escapeSelector(
            element.id
        )}`;
    }

    const parts = [];
    let currentElement =
        element;

    while (
        currentElement &&
        currentElement.nodeType ===
            1 &&
        parts.length <
            4
    ) {
        let part =
            currentElement
                .tagName
                .toLowerCase();

        const classNames =
            Array.from(
                currentElement.classList ??
                []
            )
                .filter(
                    Boolean
                )
                .slice(
                    0,
                    2
                );

        if (
            classNames.length >
            0
        ) {
            part += classNames
                .map(
                    (
                        className
                    ) =>
                        `.${escapeSelector(
                            className
                        )}`
                )
                .join("");
        } else if (
            currentElement.parentElement
        ) {
            const index =
                getElementIndex(
                    currentElement
                );

            if (index > 0) {
                part +=
                    `:nth-of-type(${index})`;
            }
        }

        parts.unshift(
            part
        );

        currentElement =
            currentElement.parentElement;
    }

    return parts.join(
        " > "
    );
}

function getReferencedText(
    element,
    attributeName
) {
    const document =
        element.ownerDocument;

    return String(
        element.getAttribute(
            attributeName
        ) ??
        ""
    )
        .split(
            /\s+/
        )
        .map(
            (
                identifier
            ) =>
                normalizeText(
                    document
                        .getElementById(
                            identifier
                        )
                        ?.textContent
                )
        )
        .filter(
            Boolean
        )
        .join(
            " "
        );
}

export function getAccessibleName(
    element
) {
    if (!element) {
        return "";
    }

    const ariaLabel =
        normalizeText(
            element.getAttribute(
                "aria-label"
            )
        );

    if (ariaLabel) {
        return ariaLabel;
    }

    const labelledBy =
        getReferencedText(
            element,
            "aria-labelledby"
        );

    if (labelledBy) {
        return labelledBy;
    }

    if (
        element.tagName ===
        "IMG"
    ) {
        const alternativeText =
            normalizeText(
                element.getAttribute(
                    "alt"
                )
            );

        if (alternativeText) {
            return alternativeText;
        }
    }

    const textContent =
        normalizeText(
            element.textContent
        );

    if (textContent) {
        return textContent;
    }

    const title =
        normalizeText(
            element.getAttribute(
                "title"
            )
        );

    return title;
}

function controlHasLabel(
    control
) {
    if (
        control.labels
            ?.length >
        0
    ) {
        return true;
    }

    if (
        getAccessibleName(
            control
        )
    ) {
        return true;
    }

    return false;
}

function createIssue({
    rule,
    severity,
    title,
    message,
    element,
    selector,
    recommendation
}) {
    return {
        id:
            `${rule}-${Math.random()
                .toString(36)
                .slice(2)}`,

        rule,
        severity,
        title,
        message,

        selector:
            selector ??
            getElementSelector(
                element
            ),

        recommendation
    };
}

function auditDocumentLanguage(
    document,
    issues
) {
    const language =
        normalizeText(
            document
                .documentElement
                ?.getAttribute(
                    "lang"
                )
        );

    if (!language) {
        issues.push(
            createIssue({
                rule:
                    "document-language",

                severity:
                    ACCESSIBILITY_SEVERITY.ERROR,

                title:
                    "Dokumentsprache fehlt",

                message:
                    "Das html-Element besitzt kein lang-Attribut.",

                selector:
                    "html",

                recommendation:
                    "Für deutsche Inhalte lang=\"de\" am html-Element setzen."
            })
        );
    }
}

function auditDocumentTitle(
    document,
    issues
) {
    if (
        !normalizeText(
            document.title
        )
    ) {
        issues.push(
            createIssue({
                rule:
                    "document-title",

                severity:
                    ACCESSIBILITY_SEVERITY.ERROR,

                title:
                    "Seitentitel fehlt",

                message:
                    "Das Dokument besitzt keinen verständlichen Seitentitel.",

                selector:
                    "head > title",

                recommendation:
                    "Einen eindeutigen Titel für die aktuelle Seite setzen."
            })
        );
    }
}

function auditMainLandmark(
    document,
    issues
) {
    const mainElements =
        Array.from(
            document.querySelectorAll(
                "main"
            )
        );

    if (
        mainElements.length ===
        0
    ) {
        issues.push(
            createIssue({
                rule:
                    "main-landmark",

                severity:
                    ACCESSIBILITY_SEVERITY.ERROR,

                title:
                    "Hauptinhalt fehlt",

                message:
                    "Die Seite besitzt kein main-Element.",

                selector:
                    "body",

                recommendation:
                    "Den zentralen Seiteninhalt in genau einem main-Element ausgeben."
            })
        );

        return;
    }

    if (
        mainElements.length >
        1
    ) {
        issues.push(
            createIssue({
                rule:
                    "main-landmark",

                severity:
                    ACCESSIBILITY_SEVERITY.WARNING,

                title:
                    "Mehrere Hauptinhalte",

                message:
                    `Die Seite enthält ${mainElements.length} main-Elemente.`,

                element:
                    mainElements[1],

                recommendation:
                    "Pro Seite möglichst genau ein main-Element verwenden."
            })
        );
    }
}

function auditHeadings(
    document,
    issues
) {
    const headings =
        Array.from(
            document.querySelectorAll(
                "h1,h2,h3,h4,h5,h6"
            )
        );

    const primaryHeadings =
        headings.filter(
            (
                heading
            ) =>
                heading.tagName ===
                "H1"
        );

    if (
        primaryHeadings.length ===
        0
    ) {
        issues.push(
            createIssue({
                rule:
                    "primary-heading",

                severity:
                    ACCESSIBILITY_SEVERITY.ERROR,

                title:
                    "Hauptüberschrift fehlt",

                message:
                    "Die Seite enthält keine h1-Überschrift.",

                selector:
                    "main",

                recommendation:
                    "Eine verständliche h1-Überschrift für den Seiteninhalt ergänzen."
            })
        );
    } else if (
        primaryHeadings.length >
        1
    ) {
        issues.push(
            createIssue({
                rule:
                    "primary-heading",

                severity:
                    ACCESSIBILITY_SEVERITY.WARNING,

                title:
                    "Mehrere Hauptüberschriften",

                message:
                    `Die Seite enthält ${primaryHeadings.length} h1-Überschriften.`,

                element:
                    primaryHeadings[1],

                recommendation:
                    "Die zentrale Seitenüberschrift als einzige h1 verwenden und weitere Überschriften hierarchisch abstufen."
            })
        );
    }

    let previousLevel =
        0;

    headings.forEach(
        (
            heading
        ) => {
            const level =
                Number(
                    heading.tagName.slice(
                        1
                    )
                );

            if (
                previousLevel >
                    0 &&
                level >
                    previousLevel +
                        1
            ) {
                issues.push(
                    createIssue({
                        rule:
                            "heading-order",

                        severity:
                            ACCESSIBILITY_SEVERITY.WARNING,

                        title:
                            "Überschriftenebene übersprungen",

                        message:
                            `Auf h${previousLevel} folgt direkt h${level}: „${normalizeText(
                                heading.textContent
                            ) || "ohne Text"}“.`,

                        element:
                            heading,

                        recommendation:
                            "Überschriftenebenen ohne Sprünge in einer nachvollziehbaren Hierarchie verwenden."
                    })
                );
            }

            previousLevel =
                level;
        }
    );
}

function auditDuplicateIds(
    document,
    issues
) {
    const identifiers =
        new Map();

    Array.from(
        document.querySelectorAll(
            "[id]"
        )
    ).forEach(
        (
            element
        ) => {
            const identifier =
                normalizeText(
                    element.id
                );

            if (!identifier) {
                return;
            }

            const elements =
                identifiers.get(
                    identifier
                ) ??
                [];

            elements.push(
                element
            );

            identifiers.set(
                identifier,
                elements
            );
        }
    );

    identifiers.forEach(
        (
            elements,
            identifier
        ) => {
            if (
                elements.length <
                2
            ) {
                return;
            }

            issues.push(
                createIssue({
                    rule:
                        "duplicate-id",

                    severity:
                        ACCESSIBILITY_SEVERITY.ERROR,

                    title:
                        "Doppelte ID",

                    message:
                        `Die ID „${identifier}“ wird ${elements.length}-mal verwendet.`,

                    element:
                        elements[1],

                    recommendation:
                        "Jede ID innerhalb eines Dokuments nur einmal vergeben."
                })
            );
        }
    );
}

function auditImages(
    document,
    issues
) {
    Array.from(
        document.querySelectorAll(
            "img:not([alt])"
        )
    ).forEach(
        (
            image
        ) => {
            issues.push(
                createIssue({
                    rule:
                        "image-alternative",

                    severity:
                        ACCESSIBILITY_SEVERITY.ERROR,

                    title:
                        "Alternativtext fehlt",

                    message:
                        "Ein Bild besitzt kein alt-Attribut.",

                    element:
                        image,

                    recommendation:
                        "Inhaltliche Bilder mit einem passenden Alternativtext versehen; rein dekorative Bilder erhalten alt=\"\"."
                })
            );
        }
    );
}

function auditFormControls(
    document,
    issues
) {
    Array.from(
        document.querySelectorAll(
            FORM_CONTROL_SELECTOR
        )
    ).forEach(
        (
            control
        ) => {
            if (
                controlHasLabel(
                    control
                )
            ) {
                return;
            }

            issues.push(
                createIssue({
                    rule:
                        "form-label",

                    severity:
                        ACCESSIBILITY_SEVERITY.ERROR,

                    title:
                        "Formularbeschriftung fehlt",

                    message:
                        `Das Feld ${getElementSelector(
                            control
                        )} besitzt keine zugängliche Beschriftung.`,

                    element:
                        control,

                    recommendation:
                        "Ein sichtbares label, aria-label oder aria-labelledby ergänzen."
                })
            );
        }
    );
}

function auditInteractiveNames(
    document,
    issues
) {
    Array.from(
        document.querySelectorAll(
            "button,[role='button']"
        )
    ).forEach(
        (
            element
        ) => {
            if (
                getAccessibleName(
                    element
                )
            ) {
                return;
            }

            issues.push(
                createIssue({
                    rule:
                        "button-name",

                    severity:
                        ACCESSIBILITY_SEVERITY.ERROR,

                    title:
                        "Button ohne Namen",

                    message:
                        "Ein Button besitzt keinen für Hilfstechnologien erkennbaren Namen.",

                    element,

                    recommendation:
                        "Sichtbaren Text oder ein eindeutiges aria-label ergänzen."
                })
            );
        }
    );

    Array.from(
        document.querySelectorAll(
            "a[href]"
        )
    ).forEach(
        (
            link
        ) => {
            if (
                getAccessibleName(
                    link
                )
            ) {
                return;
            }

            issues.push(
                createIssue({
                    rule:
                        "link-name",

                    severity:
                        ACCESSIBILITY_SEVERITY.ERROR,

                    title:
                        "Link ohne Namen",

                    message:
                        "Ein Link besitzt keinen für Hilfstechnologien erkennbaren Namen.",

                    element:
                        link,

                    recommendation:
                        "Verständlichen Linktext oder ein eindeutiges aria-label ergänzen."
                })
            );
        }
    );
}

function auditFrames(
    document,
    issues
) {
    Array.from(
        document.querySelectorAll(
            "iframe"
        )
    ).forEach(
        (
            frame
        ) => {
            if (
                normalizeText(
                    frame.getAttribute(
                        "title"
                    )
                )
            ) {
                return;
            }

            issues.push(
                createIssue({
                    rule:
                        "frame-title",

                    severity:
                        ACCESSIBILITY_SEVERITY.ERROR,

                    title:
                        "Frame-Titel fehlt",

                    message:
                        "Ein iframe besitzt kein title-Attribut.",

                    element:
                        frame,

                    recommendation:
                        "Den Zweck des eingebetteten Inhalts im title-Attribut beschreiben."
                })
            );
        }
    );
}

function auditTabIndex(
    document,
    issues
) {
    Array.from(
        document.querySelectorAll(
            "[tabindex]"
        )
    ).forEach(
        (
            element
        ) => {
            const tabIndex =
                Number(
                    element.getAttribute(
                        "tabindex"
                    )
                );

            if (
                !Number.isFinite(
                    tabIndex
                ) ||
                tabIndex <=
                    0
            ) {
                return;
            }

            issues.push(
                createIssue({
                    rule:
                        "positive-tabindex",

                    severity:
                        ACCESSIBILITY_SEVERITY.WARNING,

                    title:
                        "Positive Tab-Reihenfolge",

                    message:
                        `Das Element verwendet tabindex="${tabIndex}".`,

                    element,

                    recommendation:
                        "Die natürliche DOM-Reihenfolge verwenden und positive tabindex-Werte entfernen."
                })
            );
        }
    );
}

function auditSkipLink(
    document,
    issues
) {
    const mainContent =
        document.querySelector(
            "main#main-content"
        );

    const skipLink =
        document.querySelector(
            "a[href='#main-content']"
        );

    if (
        mainContent &&
        !skipLink
    ) {
        issues.push(
            createIssue({
                rule:
                    "skip-link",

                severity:
                    ACCESSIBILITY_SEVERITY.NOTICE,

                title:
                    "Sprunglink nicht gefunden",

                message:
                    "Für den Hauptinhalt wurde kein direkter Tastatur-Sprunglink gefunden.",

                selector:
                    "body",

                recommendation:
                    "Einen früh im Dokument stehenden Link auf #main-content anbieten."
            })
        );
    }
}

export function auditAccessibilityDocument(
    document
) {
    if (
        !document ||
        typeof document
            .querySelectorAll !==
            "function"
    ) {
        throw new TypeError(
            "Für die Barrierefreiheitsprüfung wird ein gültiges Dokument benötigt."
        );
    }

    const issues = [];

    auditDocumentLanguage(
        document,
        issues
    );

    auditDocumentTitle(
        document,
        issues
    );

    auditMainLandmark(
        document,
        issues
    );

    auditHeadings(
        document,
        issues
    );

    auditDuplicateIds(
        document,
        issues
    );

    auditImages(
        document,
        issues
    );

    auditFormControls(
        document,
        issues
    );

    auditInteractiveNames(
        document,
        issues
    );

    auditFrames(
        document,
        issues
    );

    auditTabIndex(
        document,
        issues
    );

    auditSkipLink(
        document,
        issues
    );

    const errors =
        issues.filter(
            (
                issue
            ) =>
                issue.severity ===
                ACCESSIBILITY_SEVERITY.ERROR
        ).length;

    const warnings =
        issues.filter(
            (
                issue
            ) =>
                issue.severity ===
                ACCESSIBILITY_SEVERITY.WARNING
        ).length;

    const notices =
        issues.filter(
            (
                issue
            ) =>
                issue.severity ===
                ACCESSIBILITY_SEVERITY.NOTICE
        ).length;

    return {
        url:
            document.location
                ?.href ??
            "",

        title:
            normalizeText(
                document.title
            ),

        checkedAt:
            new Date()
                .toISOString(),

        summary: {
            total:
                issues.length,

            errors,
            warnings,
            notices,

            passed:
                errors ===
                0
        },

        issues
    };
}
