function createItemId(
    prefix
) {
    if (
        globalThis.crypto
            ?.randomUUID
    ) {
        return `${prefix}-${globalThis.crypto.randomUUID()}`;
    }

    return `${prefix}-${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}`;
}

function moveItem(
    items,
    index,
    direction
) {
    const nextIndex =
        index +
        direction;

    if (
        nextIndex <
            0 ||
        nextIndex >=
            items.length
    ) {
        return items;
    }

    const nextItems = [
        ...items
    ];

    [
        nextItems[index],
        nextItems[nextIndex]
    ] = [
        nextItems[nextIndex],
        nextItems[index]
    ];

    return nextItems;
}

export default function CardGridProperties({
    block,
    onChange
}) {
    const data =
        block.data ??
        {};

    const cards =
        Array.isArray(
            data.cards
        )
            ? data.cards
            : [];

    function update(
        field,
        value
    ) {
        onChange({
            ...block,

            data: {
                ...data,
                [field]:
                    value
            }
        });
    }

    function updateCards(
        nextCards
    ) {
        update(
            "cards",
            nextCards
        );
    }

    function updateCard(
        cardId,
        field,
        value
    ) {
        updateCards(
            cards.map(
                (card) =>
                    card.id ===
                    cardId
                        ? {
                            ...card,
                            [field]:
                                value
                        }
                        : card
            )
        );
    }

    function addCard() {
        const newCard = {
            id:
                createItemId(
                    "card"
                ),

            icon:
                "bi-heart",

            imageSrc:
                "",

            imageAlt:
                "",

            title:
                "Neue Karte",

            text:
                "Beschreibe hier den Inhalt dieser Karte.",

            linkText:
                "Mehr erfahren",

            linkHref:
                "",

            openInNewTab:
                false
        };

        updateCards([
            ...cards,
            newCard
        ]);
    }

    function removeCard(
        card
    ) {
        if (
            !globalThis.confirm(
                `Karte „${card.title || "Ohne Titel"}“ entfernen?`
            )
        ) {
            return;
        }

        updateCards(
            cards.filter(
                (currentCard) =>
                    currentCard.id !==
                    card.id
            )
        );
    }

    function moveCard(
        index,
        direction
    ) {
        updateCards(
            moveItem(
                cards,
                index,
                direction
            )
        );
    }

    return (
        <div>
            <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
                <h3 className="mb-0">
                    Kartenraster
                </h3>

                <span className="badge text-bg-info">
                    {
                        cards.length
                    } Karten
                </span>
            </div>

            <div className="mb-3">
                <label className="form-label">
                    Kleine Überschrift
                </label>

                <input
                    className="form-control"
                    value={
                        data.eyebrow ??
                        ""
                    }
                    onChange={
                        (event) =>
                            update(
                                "eyebrow",
                                event.target.value
                            )
                    }
                />
            </div>

            <div className="mb-3">
                <label className="form-label">
                    Überschrift
                </label>

                <input
                    className="form-control"
                    value={
                        data.title ??
                        ""
                    }
                    onChange={
                        (event) =>
                            update(
                                "title",
                                event.target.value
                            )
                    }
                />
            </div>

            <div className="mb-3">
                <label className="form-label">
                    Einleitung
                </label>

                <textarea
                    className="form-control"
                    rows="4"
                    value={
                        data.intro ??
                        ""
                    }
                    onChange={
                        (event) =>
                            update(
                                "intro",
                                event.target.value
                            )
                    }
                />
            </div>

            <div className="row">
                <div className="col-6 mb-3">
                    <label className="form-label">
                        Spalten
                    </label>

                    <select
                        className="form-select"
                        value={
                            Number(
                                data.columns
                            ) || 3
                        }
                        onChange={
                            (event) =>
                                update(
                                    "columns",
                                    Number(
                                        event.target.value
                                    )
                                )
                        }
                    >
                        <option value="1">
                            Eine
                        </option>

                        <option value="2">
                            Zwei
                        </option>

                        <option value="3">
                            Drei
                        </option>

                        <option value="4">
                            Vier
                        </option>
                    </select>
                </div>

                <div className="col-6 mb-3">
                    <label className="form-label">
                        Ausrichtung
                    </label>

                    <select
                        className="form-select"
                        value={
                            data.alignment ??
                            "left"
                        }
                        onChange={
                            (event) =>
                                update(
                                    "alignment",
                                    event.target.value
                                )
                        }
                    >
                        <option value="left">
                            Links
                        </option>

                        <option value="center">
                            Zentriert
                        </option>

                        <option value="right">
                            Rechts
                        </option>
                    </select>
                </div>
            </div>

            <div className="mb-3">
                <label className="form-label">
                    Kartenstil
                </label>

                <select
                    className="form-select"
                    value={
                        data.variant ??
                        "elevated"
                    }
                    onChange={
                        (event) =>
                            update(
                                "variant",
                                event.target.value
                            )
                    }
                >
                    <option value="elevated">
                        Schwebende Karten
                    </option>

                    <option value="bordered">
                        Umrandete Karten
                    </option>

                    <option value="minimal">
                        Minimal
                    </option>
                </select>
            </div>

            <div className="form-check mb-3">
                <input
                    id={
                        `card-grid-images-${block.id}`
                    }
                    type="checkbox"
                    className="form-check-input"
                    checked={
                        data.showImages !==
                        false
                    }
                    onChange={
                        (event) =>
                            update(
                                "showImages",
                                event.target.checked
                            )
                    }
                />

                <label
                    className="form-check-label"
                    htmlFor={
                        `card-grid-images-${block.id}`
                    }
                >
                    Kartenbilder anzeigen
                </label>
            </div>

            <div className="form-check mb-4">
                <input
                    id={
                        `card-grid-icons-${block.id}`
                    }
                    type="checkbox"
                    className="form-check-input"
                    checked={
                        data.showIcons !==
                        false
                    }
                    onChange={
                        (event) =>
                            update(
                                "showIcons",
                                event.target.checked
                            )
                    }
                />

                <label
                    className="form-check-label"
                    htmlFor={
                        `card-grid-icons-${block.id}`
                    }
                >
                    Symbole anzeigen, wenn kein Bild vorhanden ist
                </label>
            </div>

            <h4 className="h6 mb-3">
                Farben
            </h4>

            <div className="row">
                <div className="col-6 mb-3">
                    <label className="form-label">
                        Bereich
                    </label>

                    <input
                        type="color"
                        className="form-control form-control-color w-100"
                        value={
                            data.backgroundColor ??
                            "#0b1220"
                        }
                        onChange={
                            (event) =>
                                update(
                                    "backgroundColor",
                                    event.target.value
                                )
                        }
                    />
                </div>

                <div className="col-6 mb-3">
                    <label className="form-label">
                        Karten
                    </label>

                    <input
                        type="color"
                        className="form-control form-control-color w-100"
                        value={
                            data.cardBackgroundColor ??
                            "#111c2f"
                        }
                        onChange={
                            (event) =>
                                update(
                                    "cardBackgroundColor",
                                    event.target.value
                                )
                        }
                    />
                </div>

                <div className="col-6 mb-3">
                    <label className="form-label">
                        Akzent
                    </label>

                    <input
                        type="color"
                        className="form-control form-control-color w-100"
                        value={
                            data.accentColor ??
                            "#38bdf8"
                        }
                        onChange={
                            (event) =>
                                update(
                                    "accentColor",
                                    event.target.value
                                )
                        }
                    />
                </div>

                <div className="col-6 mb-3">
                    <label className="form-label">
                        Text
                    </label>

                    <input
                        type="color"
                        className="form-control form-control-color w-100"
                        value={
                            data.textColor ??
                            "#f8fafc"
                        }
                        onChange={
                            (event) =>
                                update(
                                    "textColor",
                                    event.target.value
                                )
                        }
                    />
                </div>
            </div>

            <hr className="border-secondary my-4" />

            <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
                <h4 className="h6 mb-0">
                    Karten
                </h4>

                <button
                    type="button"
                    className="btn btn-info btn-sm"
                    onClick={
                        addCard
                    }
                >
                    <i
                        className="bi bi-plus-lg me-1"
                        aria-hidden="true"
                    />

                    Karte
                </button>
            </div>

            {
                cards.length ===
                    0 ? (
                    <div className="alert alert-secondary small">
                        Noch keine Karten vorhanden.
                    </div>
                ) : (
                    <div className="d-grid gap-3">
                        {
                            cards.map(
                                (
                                    card,
                                    index
                                ) => (
                                    <section
                                        key={
                                            card.id
                                        }
                                        className="border border-secondary rounded-3 p-3"
                                    >
                                        <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
                                            <strong className="small">
                                                Karte {
                                                    index +
                                                    1
                                                }
                                            </strong>

                                            <div className="d-flex gap-1">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary btn-sm"
                                                    disabled={
                                                        index ===
                                                        0
                                                    }
                                                    title="Nach oben"
                                                    onClick={
                                                        () =>
                                                            moveCard(
                                                                index,
                                                                -1
                                                            )
                                                    }
                                                >
                                                    <i
                                                        className="bi bi-arrow-up"
                                                        aria-hidden="true"
                                                    />
                                                </button>

                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary btn-sm"
                                                    disabled={
                                                        index ===
                                                        cards.length -
                                                        1
                                                    }
                                                    title="Nach unten"
                                                    onClick={
                                                        () =>
                                                            moveCard(
                                                                index,
                                                                1
                                                            )
                                                    }
                                                >
                                                    <i
                                                        className="bi bi-arrow-down"
                                                        aria-hidden="true"
                                                    />
                                                </button>

                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger btn-sm"
                                                    title="Karte entfernen"
                                                    onClick={
                                                        () =>
                                                            removeCard(
                                                                card
                                                            )
                                                    }
                                                >
                                                    <i
                                                        className="bi bi-trash3"
                                                        aria-hidden="true"
                                                    />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">
                                                Titel
                                            </label>

                                            <input
                                                className="form-control"
                                                value={
                                                    card.title ??
                                                    ""
                                                }
                                                onChange={
                                                    (event) =>
                                                        updateCard(
                                                            card.id,
                                                            "title",
                                                            event.target.value
                                                        )
                                                }
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">
                                                Beschreibung
                                            </label>

                                            <textarea
                                                className="form-control"
                                                rows="4"
                                                value={
                                                    card.text ??
                                                    ""
                                                }
                                                onChange={
                                                    (event) =>
                                                        updateCard(
                                                            card.id,
                                                            "text",
                                                            event.target.value
                                                        )
                                                }
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">
                                                Bootstrap-Symbol
                                            </label>

                                            <input
                                                className="form-control"
                                                value={
                                                    card.icon ??
                                                    ""
                                                }
                                                placeholder="bi-heart-pulse"
                                                onChange={
                                                    (event) =>
                                                        updateCard(
                                                            card.id,
                                                            "icon",
                                                            event.target.value
                                                        )
                                                }
                                            />

                                            <div className="form-text">
                                                Beispiel: bi-heart, bi-tree oder bi-water
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">
                                                Bildadresse
                                            </label>

                                            <input
                                                className="form-control"
                                                value={
                                                    card.imageSrc ??
                                                    ""
                                                }
                                                placeholder="https://… oder /api/media/…"
                                                onChange={
                                                    (event) =>
                                                        updateCard(
                                                            card.id,
                                                            "imageSrc",
                                                            event.target.value
                                                        )
                                                }
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">
                                                Bildbeschreibung
                                            </label>

                                            <input
                                                className="form-control"
                                                value={
                                                    card.imageAlt ??
                                                    ""
                                                }
                                                onChange={
                                                    (event) =>
                                                        updateCard(
                                                            card.id,
                                                            "imageAlt",
                                                            event.target.value
                                                        )
                                                }
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">
                                                Linktext
                                            </label>

                                            <input
                                                className="form-control"
                                                value={
                                                    card.linkText ??
                                                    ""
                                                }
                                                onChange={
                                                    (event) =>
                                                        updateCard(
                                                            card.id,
                                                            "linkText",
                                                            event.target.value
                                                        )
                                                }
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">
                                                Linkziel
                                            </label>

                                            <input
                                                className="form-control"
                                                value={
                                                    card.linkHref ??
                                                    ""
                                                }
                                                placeholder="/seite oder https://…"
                                                onChange={
                                                    (event) =>
                                                        updateCard(
                                                            card.id,
                                                            "linkHref",
                                                            event.target.value
                                                        )
                                                }
                                            />
                                        </div>

                                        <div className="form-check">
                                            <input
                                                id={
                                                    `card-new-window-${card.id}`
                                                }
                                                type="checkbox"
                                                className="form-check-input"
                                                checked={
                                                    Boolean(
                                                        card.openInNewTab
                                                    )
                                                }
                                                onChange={
                                                    (event) =>
                                                        updateCard(
                                                            card.id,
                                                            "openInNewTab",
                                                            event.target.checked
                                                        )
                                                }
                                            />

                                            <label
                                                className="form-check-label"
                                                htmlFor={
                                                    `card-new-window-${card.id}`
                                                }
                                            >
                                                Link in neuem Fenster öffnen
                                            </label>
                                        </div>
                                    </section>
                                )
                            )
                        }
                    </div>
                )
            }
        </div>
    );
}