export default function CallToActionProperties({
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
                Call-to-Action
            </h3>

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
                    Hauptüberschrift
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
                    Beschreibung
                </label>

                <textarea
                    className="form-control"
                    rows="4"
                    value={
                        data.text ??
                        ""
                    }
                    onChange={
                        (event) =>
                            update(
                                "text",
                                event.target.value
                            )
                    }
                />
            </div>

            <div className="form-check mb-3">
                <input
                    id={
                        `cta-show-button-${block.id}`
                    }
                    type="checkbox"
                    className="form-check-input"
                    checked={
                        data.showButton !==
                        false
                    }
                    onChange={
                        (event) =>
                            update(
                                "showButton",
                                event.target.checked
                            )
                    }
                />

                <label
                    className="form-check-label"
                    htmlFor={
                        `cta-show-button-${block.id}`
                    }
                >
                    Button anzeigen
                </label>
            </div>

            <div className="mb-3">
                <label className="form-label">
                    Buttontext
                </label>

                <input
                    className="form-control"
                    value={
                        data.buttonText ??
                        ""
                    }
                    disabled={
                        data.showButton ===
                        false
                    }
                    onChange={
                        (event) =>
                            update(
                                "buttonText",
                                event.target.value
                            )
                    }
                />
            </div>

            <div className="mb-3">
                <label className="form-label">
                    Buttonziel
                </label>

                <input
                    className="form-control"
                    value={
                        data.buttonHref ??
                        ""
                    }
                    disabled={
                        data.showButton ===
                        false
                    }
                    placeholder="/mitmachen oder https://…"
                    onChange={
                        (event) =>
                            update(
                                "buttonHref",
                                event.target.value
                            )
                    }
                />
            </div>

            <div className="mb-3">
                <label className="form-label">
                    Buttonstil
                </label>

                <select
                    className="form-select"
                    value={
                        data.buttonVariant ??
                        "primary"
                    }
                    disabled={
                        data.showButton ===
                        false
                    }
                    onChange={
                        (event) =>
                            update(
                                "buttonVariant",
                                event.target.value
                            )
                    }
                >
                    <option value="primary">
                        Gefüllt
                    </option>

                    <option value="outline">
                        Umrandet
                    </option>
                </select>
            </div>

            <div className="form-check mb-3">
                <input
                    id={
                        `cta-new-window-${block.id}`
                    }
                    type="checkbox"
                    className="form-check-input"
                    checked={
                        Boolean(
                            data.openInNewTab
                        )
                    }
                    disabled={
                        data.showButton ===
                        false
                    }
                    onChange={
                        (event) =>
                            update(
                                "openInNewTab",
                                event.target.checked
                            )
                    }
                />

                <label
                    className="form-check-label"
                    htmlFor={
                        `cta-new-window-${block.id}`
                    }
                >
                    In neuem Fenster öffnen
                </label>
            </div>

            <div className="mb-3">
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
                            "#102a43"
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