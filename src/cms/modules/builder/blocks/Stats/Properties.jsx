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

export default function StatsProperties({
    block,
    onChange
}) {
    const data =
        block.data ??
        {};

    const stats =
        Array.isArray(
            data.stats
        )
            ? data.stats
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

    function updateStats(
        nextStats
    ) {
        update(
            "stats",
            nextStats
        );
    }

    function updateStat(
        statId,
        field,
        value
    ) {
        updateStats(
            stats.map(
                (stat) =>
                    stat.id ===
                    statId
                        ? {
                            ...stat,
                            [field]:
                                value
                        }
                        : stat
            )
        );
    }

    function addStat() {
        updateStats([
            ...stats,

            {
                id:
                    createItemId(
                        "stat"
                    ),

                icon:
                    "bi-heart-pulse",

                value:
                    "0",

                suffix:
                    "",

                label:
                    "Neue Kennzahl",

                description:
                    "Kurze Erläuterung der Kennzahl."
            }
        ]);
    }

    function removeStat(
        stat
    ) {
        if (
            !globalThis.confirm(
                `Kennzahl „${stat.label || stat.value || "Ohne Bezeichnung"}“ entfernen?`
            )
        ) {
            return;
        }

        updateStats(
            stats.filter(
                (currentStat) =>
                    currentStat.id !==
                    stat.id
            )
        );
    }

    function moveStat(
        index,
        direction
    ) {
        updateStats(
            moveItem(
                stats,
                index,
                direction
            )
        );
    }

    return (
        <div>
            <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
                <h3 className="mb-0">
                    Faktenzahlen
                </h3>

                <span className="badge text-bg-info">
                    {
                        stats.length
                    } Werte
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
                            ) || 4
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
                            "center"
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
                    Darstellung
                </label>

                <select
                    className="form-select"
                    value={
                        data.variant ??
                        "cards"
                    }
                    onChange={
                        (event) =>
                            update(
                                "variant",
                                event.target.value
                            )
                    }
                >
                    <option value="cards">
                        Karten
                    </option>

                    <option value="minimal">
                        Minimal
                    </option>

                    <option value="band">
                        Akzentband
                    </option>
                </select>
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
                            "#08111f"
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
                        Kennzahlen
                    </label>

                    <input
                        type="color"
                        className="form-control form-control-color w-100"
                        value={
                            data.itemBackgroundColor ??
                            "#111c2f"
                        }
                        onChange={
                            (event) =>
                                update(
                                    "itemBackgroundColor",
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
                    Kennzahlen
                </h4>

                <button
                    type="button"
                    className="btn btn-info btn-sm"
                    onClick={
                        addStat
                    }
                >
                    <i
                        className="bi bi-plus-lg me-1"
                        aria-hidden="true"
                    />

                    Kennzahl
                </button>
            </div>

            {
                stats.length ===
                    0 ? (
                    <div className="alert alert-secondary small">
                        Noch keine Kennzahlen vorhanden.
                    </div>
                ) : (
                    <div className="d-grid gap-3">
                        {
                            stats.map(
                                (
                                    stat,
                                    index
                                ) => (
                                    <section
                                        key={
                                            stat.id
                                        }
                                        className="border border-secondary rounded-3 p-3"
                                    >
                                        <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
                                            <strong className="small">
                                                Kennzahl {
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
                                                            moveStat(
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
                                                        stats.length -
                                                        1
                                                    }
                                                    title="Nach unten"
                                                    onClick={
                                                        () =>
                                                            moveStat(
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
                                                    title="Kennzahl entfernen"
                                                    onClick={
                                                        () =>
                                                            removeStat(
                                                                stat
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
                                                Wert
                                            </label>

                                            <input
                                                className="form-control"
                                                value={
                                                    stat.value ??
                                                    ""
                                                }
                                                placeholder="250"
                                                onChange={
                                                    (event) =>
                                                        updateStat(
                                                            stat.id,
                                                            "value",
                                                            event.target.value
                                                        )
                                                }
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">
                                                Zusatz
                                            </label>

                                            <input
                                                className="form-control"
                                                value={
                                                    stat.suffix ??
                                                    ""
                                                }
                                                placeholder="%, +, Tiere oder Mitglieder"
                                                onChange={
                                                    (event) =>
                                                        updateStat(
                                                            stat.id,
                                                            "suffix",
                                                            event.target.value
                                                        )
                                                }
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">
                                                Bezeichnung
                                            </label>

                                            <input
                                                className="form-control"
                                                value={
                                                    stat.label ??
                                                    ""
                                                }
                                                onChange={
                                                    (event) =>
                                                        updateStat(
                                                            stat.id,
                                                            "label",
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
                                                rows="3"
                                                value={
                                                    stat.description ??
                                                    ""
                                                }
                                                onChange={
                                                    (event) =>
                                                        updateStat(
                                                            stat.id,
                                                            "description",
                                                            event.target.value
                                                        )
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label className="form-label">
                                                Bootstrap-Symbol
                                            </label>

                                            <input
                                                className="form-control"
                                                value={
                                                    stat.icon ??
                                                    ""
                                                }
                                                placeholder="bi-heart-pulse"
                                                onChange={
                                                    (event) =>
                                                        updateStat(
                                                            stat.id,
                                                            "icon",
                                                            event.target.value
                                                        )
                                                }
                                            />
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