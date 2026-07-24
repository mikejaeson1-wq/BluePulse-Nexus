import "./Properties.css";

function createSection() {
    return {
        id:
            globalThis.crypto
                ?.randomUUID?.() ??
            `legal-section-${Date.now()}`,

        title:
            "Neue Überschrift",

        paragraphs: [
            "Neuer Textabschnitt"
        ],

        items:
            [],

        note:
            ""
    };
}

function paragraphsToText(
    paragraphs
) {
    return (
        Array.isArray(
            paragraphs
        )
            ? paragraphs
            : []
    ).join(
        "\n\n"
    );
}

function textToParagraphs(
    value
) {
    return String(
        value ??
        ""
    )
        .replace(
            /\r\n?/g,
            "\n"
        )
        .split(
            /\n{2,}/
        )
        .map(
            (
                paragraph
            ) =>
                paragraph.trim()
        )
        .filter(
            Boolean
        );
}

function itemsToText(
    items
) {
    return (
        Array.isArray(
            items
        )
            ? items
            : []
    ).join(
        "\n"
    );
}

function textToItems(
    value
) {
    return String(
        value ??
        ""
    )
        .replace(
            /\r\n?/g,
            "\n"
        )
        .split(
            "\n"
        )
        .map(
            (
                item
            ) =>
                item
                    .replace(
                        /^\s*[-•]\s*/,
                        ""
                    )
                    .trim()
        )
        .filter(
            Boolean
        );
}

export default function LegalDocumentProperties({
    block,
    onChange
}) {
    const data =
        block.data ??
        {};

    const sections =
        Array.isArray(
            data.sections
        )
            ? data.sections
            : [];

    function updateData(
        patch
    ) {
        onChange({
            ...block,

            data: {
                ...data,

                ...patch
            }
        });
    }

    function updateSection(
        sectionIndex,
        patch
    ) {
        updateData({
            sections:
                sections.map(
                    (
                        section,
                        index
                    ) =>
                        index ===
                        sectionIndex
                            ? {
                                ...section,

                                ...patch
                            }
                            : section
                )
        });
    }

    function moveSection(
        sectionIndex,
        direction
    ) {
        const targetIndex =
            sectionIndex +
            direction;

        if (
            targetIndex <
                0 ||
            targetIndex >=
                sections.length
        ) {
            return;
        }

        const nextSections = [
            ...sections
        ];

        const [
            movedSection
        ] =
            nextSections.splice(
                sectionIndex,
                1
            );

        nextSections.splice(
            targetIndex,
            0,
            movedSection
        );

        updateData({
            sections:
                nextSections
        });
    }

    function removeSection(
        sectionIndex
    ) {
        updateData({
            sections:
                sections.filter(
                    (
                        section,
                        index
                    ) =>
                        index !==
                        sectionIndex
                )
        });
    }

    function addSection() {
        updateData({
            sections: [
                ...sections,
                createSection()
            ]
        });
    }

    return (
        <div className="legal-properties">
            <header className="legal-properties__header">
                <span>
                    Rechtstext
                </span>

                <h3>
                    Dokument bearbeiten
                </h3>

                <p>
                    Textabsätze werden durch eine Leerzeile getrennt. Listenpunkte stehen jeweils in einer eigenen Zeile.
                </p>
            </header>

            <label className="legal-properties__field">
                <span>
                    Dokumenttitel
                </span>

                <input
                    className="form-control"
                    value={
                        data.title ??
                        ""
                    }
                    onChange={
                        (
                            event
                        ) =>
                            updateData({
                                title:
                                    event.target.value
                            })
                    }
                />
            </label>

            <label className="legal-properties__field">
                <span>
                    Einleitung
                </span>

                <textarea
                    className="form-control"
                    rows="4"
                    value={
                        data.intro ??
                        ""
                    }
                    onChange={
                        (
                            event
                        ) =>
                            updateData({
                                intro:
                                    event.target.value
                            })
                    }
                />
            </label>

            <label className="legal-properties__field">
                <span>
                    Entwurfswarnung
                </span>

                <textarea
                    className="form-control"
                    rows="3"
                    value={
                        data.draftWarning ??
                        ""
                    }
                    onChange={
                        (
                            event
                        ) =>
                            updateData({
                                draftWarning:
                                    event.target.value
                            })
                    }
                />
            </label>

            <label className="legal-properties__field">
                <span>
                    Stand
                </span>

                <input
                    className="form-control"
                    value={
                        data.lastUpdated ??
                        ""
                    }
                    onChange={
                        (
                            event
                        ) =>
                            updateData({
                                lastUpdated:
                                    event.target.value
                            })
                    }
                />
            </label>

            <div className="legal-properties__sections">
                {
                    sections.map(
                        (
                            section,
                            sectionIndex
                        ) => (
                            <article
                                key={
                                    section.id ??
                                    sectionIndex
                                }
                                className="legal-properties__section"
                            >
                                <header>
                                    <strong>
                                        Abschnitt {
                                            sectionIndex +
                                            1
                                        }
                                    </strong>

                                    <div>
                                        <button
                                            type="button"
                                            disabled={
                                                sectionIndex ===
                                                0
                                            }
                                            onClick={
                                                () =>
                                                    moveSection(
                                                        sectionIndex,
                                                        -1
                                                    )
                                            }
                                            title="Nach oben"
                                        >
                                            <i
                                                className="bi bi-arrow-up"
                                                aria-hidden="true"
                                            />
                                        </button>

                                        <button
                                            type="button"
                                            disabled={
                                                sectionIndex ===
                                                sections.length -
                                                    1
                                            }
                                            onClick={
                                                () =>
                                                    moveSection(
                                                        sectionIndex,
                                                        1
                                                    )
                                            }
                                            title="Nach unten"
                                        >
                                            <i
                                                className="bi bi-arrow-down"
                                                aria-hidden="true"
                                            />
                                        </button>

                                        <button
                                            type="button"
                                            className="legal-properties__delete"
                                            onClick={
                                                () =>
                                                    removeSection(
                                                        sectionIndex
                                                    )
                                            }
                                            title="Abschnitt löschen"
                                        >
                                            <i
                                                className="bi bi-trash3"
                                                aria-hidden="true"
                                            />
                                        </button>
                                    </div>
                                </header>

                                <label>
                                    <span>
                                        Überschrift
                                    </span>

                                    <input
                                        className="form-control"
                                        value={
                                            section.title ??
                                            ""
                                        }
                                        onChange={
                                            (
                                                event
                                            ) =>
                                                updateSection(
                                                    sectionIndex,
                                                    {
                                                        title:
                                                            event.target.value
                                                    }
                                                )
                                        }
                                    />
                                </label>

                                <label>
                                    <span>
                                        Textabsätze
                                    </span>

                                    <textarea
                                        className="form-control"
                                        rows="9"
                                        value={
                                            paragraphsToText(
                                                section.paragraphs
                                            )
                                        }
                                        onChange={
                                            (
                                                event
                                            ) =>
                                                updateSection(
                                                    sectionIndex,
                                                    {
                                                        paragraphs:
                                                            textToParagraphs(
                                                                event.target.value
                                                            )
                                                    }
                                                )
                                        }
                                    />
                                </label>

                                <label>
                                    <span>
                                        Listenpunkte
                                    </span>

                                    <textarea
                                        className="form-control"
                                        rows="5"
                                        placeholder="Ein Listenpunkt pro Zeile"
                                        value={
                                            itemsToText(
                                                section.items
                                            )
                                        }
                                        onChange={
                                            (
                                                event
                                            ) =>
                                                updateSection(
                                                    sectionIndex,
                                                    {
                                                        items:
                                                            textToItems(
                                                                event.target.value
                                                            )
                                                    }
                                                )
                                        }
                                    />
                                </label>

                                <label>
                                    <span>
                                        Hinweisbox
                                    </span>

                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        value={
                                            section.note ??
                                            ""
                                        }
                                        onChange={
                                            (
                                                event
                                            ) =>
                                                updateSection(
                                                    sectionIndex,
                                                    {
                                                        note:
                                                            event.target.value
                                                    }
                                                )
                                        }
                                    />
                                </label>
                            </article>
                        )
                    )
                }
            </div>

            <button
                type="button"
                className="legal-properties__add"
                onClick={
                    addSection
                }
            >
                <i
                    className="bi bi-plus-circle"
                    aria-hidden="true"
                />

                Abschnitt hinzufügen
            </button>
        </div>
    );
}
