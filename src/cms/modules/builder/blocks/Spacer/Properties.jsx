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

function HeightField({
    label,
    field,
    value,
    onChange
}) {
    return (
        <div className="mb-4">
            <div className="d-flex align-items-center justify-content-between gap-3 mb-2">
                <label className="form-label mb-0">
                    {label}
                </label>

                <span className="badge text-bg-secondary">
                    {
                        value
                    } px
                </span>
            </div>

            <input
                type="range"
                className="form-range"
                min="0"
                max="400"
                step="5"
                value={
                    value
                }
                onChange={
                    (event) =>
                        onChange(
                            field,
                            Number(
                                event.target.value
                            )
                        )
                }
            />

            <input
                type="number"
                className="form-control mt-2"
                min="0"
                max="400"
                value={
                    value
                }
                onChange={
                    (event) =>
                        onChange(
                            field,
                            Number(
                                event.target.value
                            )
                        )
                }
            />
        </div>
    );
}

export default function SpacerProperties({
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
                Responsiver Abstand
            </h3>

            <p className="text-secondary small mb-4">
                Der Abstand passt sich automatisch an die Bildschirmgröße an.
            </p>

            <HeightField
                label="Desktop"
                field="desktopHeight"
                value={
                    numberValue(
                        data.desktopHeight,
                        80
                    )
                }
                onChange={
                    update
                }
            />

            <HeightField
                label="Tablet"
                field="tabletHeight"
                value={
                    numberValue(
                        data.tabletHeight,
                        60
                    )
                }
                onChange={
                    update
                }
            />

            <HeightField
                label="Smartphone"
                field="mobileHeight"
                value={
                    numberValue(
                        data.mobileHeight,
                        40
                    )
                }
                onChange={
                    update
                }
            />

            <div className="alert alert-info small">
                Die gestrichelte Hilfslinie ist nur im Builder sichtbar. Auf der veröffentlichten Website bleibt ausschließlich der Freiraum bestehen.
            </div>
        </div>
    );
}