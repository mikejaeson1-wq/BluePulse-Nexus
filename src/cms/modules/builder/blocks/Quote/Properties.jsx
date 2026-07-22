export default function QuoteProperties({
    block,
    onChange
}) {
    const data =
        block.data ??
        {};

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

    return (
        <div>
            <h3 className="mb-3">
                Zitat
            </h3>

            <div className="mb-3">
                <label className="form-label">
                    Zitattext
                </label>

                <textarea
                    className="form-control"
                    rows="6"
                    value={
                        data.quote ??
                        ""
                    }
                    onChange={
                        (event) =>
                            update(
                                "quote",
                                event.target.value
                            )
                    }
                />
            </div>

            <div className="mb-3">
                <label className="form-label">
                    Name
                </label>

                <input
                    className="form-control"
                    value={
                        data.author ??
                        ""
                    }
                    onChange={
                        (event) =>
                            update(
                                "author",
                                event.target.value
                            )
                    }
                />
            </div>

            <div className="mb-3">
                <label className="form-label">
                    Funktion oder Zusatz
                </label>

                <input
                    className="form-control"
                    value={
                        data.role ??
                        ""
                    }
                    onChange={
                        (event) =>
                            update(
                                "role",
                                event.target.value
                            )
                    }
                />
            </div>

            <div className="mb-3">
                <label className="form-label">
                    Quellenlink
                </label>

                <input
                    className="form-control"
                    value={
                        data.sourceUrl ??
                        ""
                    }
                    placeholder="https://…"
                    onChange={
                        (event) =>
                            update(
                                "sourceUrl",
                                event.target.value
                            )
                    }
                />
            </div>

            <div className="mb-3">
                <label className="form-label">
                    Darstellung
                </label>

                <select
                    className="form-select"
                    value={
                        data.variant ??
                        "card"
                    }
                    onChange={
                        (event) =>
                            update(
                                "variant",
                                event.target.value
                            )
                    }
                >
                    <option value="card">
                        Karte
                    </option>

                    <option value="minimal">
                        Minimal
                    </option>

                    <option value="accent">
                        Akzentfläche
                    </option>
                </select>
            </div>

            <div className="mb-3">
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

            <div className="row">
                <div className="col-6 mb-3">
                    <label className="form-label">
                        Hintergrund
                    </label>

                    <input
                        type="color"
                        className="form-control form-control-color w-100"
                        value={
                            data.backgroundColor ??
                            "#111c2f"
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
                        Akzentfarbe
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
                        Textfarbe
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
        </div>
    );
}