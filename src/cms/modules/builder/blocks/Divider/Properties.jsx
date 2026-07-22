function numberValue(
    value,
    fallback
) {
    const number =
        Number(value);

    return Number.isFinite(
        number
    )
        ? number
        : fallback;
}

export default function DividerProperties({
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
                Trenner
            </h3>

            <div className="mb-3">
                <label className="form-label">
                    Linienart
                </label>

                <select
                    className="form-select"
                    value={
                        data.style ??
                        "solid"
                    }
                    onChange={
                        (event) =>
                            update(
                                "style",
                                event.target.value
                            )
                    }
                >
                    <option value="solid">
                        Durchgezogen
                    </option>

                    <option value="dashed">
                        Gestrichelt
                    </option>

                    <option value="dotted">
                        Gepunktet
                    </option>

                    <option value="gradient">
                        Verlauf
                    </option>
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label">
                    Farbe
                </label>

                <input
                    type="color"
                    className="form-control form-control-color w-100"
                    value={
                        data.color ??
                        "#334155"
                    }
                    onChange={
                        (event) =>
                            update(
                                "color",
                                event.target.value
                            )
                    }
                />
            </div>

            <div className="mb-3">
                <label className="form-label">
                    Stärke: {
                        numberValue(
                            data.thickness,
                            1
                        )
                    } px
                </label>

                <input
                    type="range"
                    className="form-range"
                    min="1"
                    max="12"
                    step="1"
                    value={
                        numberValue(
                            data.thickness,
                            1
                        )
                    }
                    onChange={
                        (event) =>
                            update(
                                "thickness",
                                Number(
                                    event.target.value
                                )
                            )
                    }
                />
            </div>

            <div className="mb-3">
                <label className="form-label">
                    Breite: {
                        numberValue(
                            data.width,
                            100
                        )
                    } %
                </label>

                <input
                    type="range"
                    className="form-range"
                    min="10"
                    max="100"
                    step="5"
                    value={
                        numberValue(
                            data.width,
                            100
                        )
                    }
                    onChange={
                        (event) =>
                            update(
                                "width",
                                Number(
                                    event.target.value
                                )
                            )
                    }
                />
            </div>

            <div className="row">
                <div className="col-6 mb-3">
                    <label className="form-label">
                        Abstand oben
                    </label>

                    <input
                        type="number"
                        className="form-control"
                        min="0"
                        max="200"
                        value={
                            numberValue(
                                data.spacingTop,
                                36
                            )
                        }
                        onChange={
                            (event) =>
                                update(
                                    "spacingTop",
                                    Number(
                                        event.target.value
                                    )
                                )
                        }
                    />
                </div>

                <div className="col-6 mb-3">
                    <label className="form-label">
                        Abstand unten
                    </label>

                    <input
                        type="number"
                        className="form-control"
                        min="0"
                        max="200"
                        value={
                            numberValue(
                                data.spacingBottom,
                                36
                            )
                        }
                        onChange={
                            (event) =>
                                update(
                                    "spacingBottom",
                                    Number(
                                        event.target.value
                                    )
                                )
                        }
                    />
                </div>
            </div>

            <div className="form-check mb-3">
                <input
                    id={
                        `divider-label-${block.id}`
                    }
                    type="checkbox"
                    className="form-check-input"
                    checked={
                        Boolean(
                            data.showLabel
                        )
                    }
                    onChange={
                        (event) =>
                            update(
                                "showLabel",
                                event.target.checked
                            )
                    }
                />

                <label
                    className="form-check-label"
                    htmlFor={
                        `divider-label-${block.id}`
                    }
                >
                    Beschriftung anzeigen
                </label>
            </div>

            <div className="mb-3">
                <label className="form-label">
                    Beschriftung
                </label>

                <input
                    className="form-control"
                    value={
                        data.label ??
                        ""
                    }
                    disabled={
                        !data.showLabel
                    }
                    onChange={
                        (event) =>
                            update(
                                "label",
                                event.target.value
                            )
                    }
                />
            </div>
        </div>
    );
}