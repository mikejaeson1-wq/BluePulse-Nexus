import "./Divider.css";

const DIVIDER_STYLES =
    new Set([
        "solid",
        "dashed",
        "dotted",
        "gradient"
    ]);

function clampNumber(
    value,
    minimum,
    maximum,
    fallback
) {
    const number =
        Number(value);

    if (
        !Number.isFinite(
            number
        )
    ) {
        return fallback;
    }

    return Math.min(
        Math.max(
            number,
            minimum
        ),
        maximum
    );
}

export default function Divider({
    data = {}
}) {
    const dividerStyle =
        DIVIDER_STYLES.has(
            data.style
        )
            ? data.style
            : "solid";

    const color =
        String(
            data.color ??
            ""
        ).trim() ||
        "#334155";

    const thickness =
        clampNumber(
            data.thickness,
            1,
            12,
            1
        );

    const width =
        clampNumber(
            data.width,
            10,
            100,
            100
        );

    const spacingTop =
        clampNumber(
            data.spacingTop,
            0,
            200,
            36
        );

    const spacingBottom =
        clampNumber(
            data.spacingBottom,
            0,
            200,
            36
        );

    const showLabel =
        Boolean(
            data.showLabel &&
            data.label
        );

    return (
        <div
            className={
                `bp-divider bp-divider--${dividerStyle}`
            }
            style={{
                "--bp-divider-color":
                    color,

                "--bp-divider-thickness":
                    `${thickness}px`,

                "--bp-divider-width":
                    `${width}%`,

                "--bp-divider-spacing-top":
                    `${spacingTop}px`,

                "--bp-divider-spacing-bottom":
                    `${spacingBottom}px`
            }}
            role="separator"
            aria-label={
                showLabel
                    ? data.label
                    : undefined
            }
        >
            {
                showLabel ? (
                    <div className="bp-divider__labeled">
                        <span className="bp-divider__line" />

                        <span className="bp-divider__label">
                            {
                                data.label
                            }
                        </span>

                        <span className="bp-divider__line" />
                    </div>
                ) : (
                    <span className="bp-divider__line" />
                )
            }
        </div>
    );
}