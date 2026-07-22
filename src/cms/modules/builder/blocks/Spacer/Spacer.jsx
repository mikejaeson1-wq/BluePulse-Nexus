import "./Spacer.css";

function clampHeight(
    value,
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
            0
        ),
        400
    );
}

export default function Spacer({
    data = {},
    mode = "website"
}) {
    const desktopHeight =
        clampHeight(
            data.desktopHeight,
            80
        );

    const tabletHeight =
        clampHeight(
            data.tabletHeight,
            60
        );

    const mobileHeight =
        clampHeight(
            data.mobileHeight,
            40
        );

    return (
        <div
            className={
                mode ===
                    "editor"
                    ? "bp-spacer bp-spacer--editor"
                    : "bp-spacer"
            }
            style={{
                "--bp-spacer-desktop":
                    `${desktopHeight}px`,

                "--bp-spacer-tablet":
                    `${tabletHeight}px`,

                "--bp-spacer-mobile":
                    `${mobileHeight}px`
            }}
            aria-hidden="true"
        >
            {
                mode ===
                    "editor" && (
                    <span className="bp-spacer__guide">
                        <i
                            className="bi bi-arrows-expand-vertical"
                            aria-hidden="true"
                        />

                        Abstand: {
                            desktopHeight
                        } px
                    </span>
                )
            }
        </div>
    );
}