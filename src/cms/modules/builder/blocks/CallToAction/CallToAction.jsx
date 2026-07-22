import "./CallToAction.css";

const ALIGNMENTS =
    new Set([
        "left",
        "center",
        "right"
    ]);

const BUTTON_VARIANTS =
    new Set([
        "primary",
        "outline"
    ]);

function normalizeAlignment(
    value
) {
    return ALIGNMENTS.has(
        value
    )
        ? value
        : "center";
}

function normalizeButtonVariant(
    value
) {
    return BUTTON_VARIANTS.has(
        value
    )
        ? value
        : "primary";
}

function normalizeColor(
    value,
    fallback
) {
    const normalized =
        String(
            value ??
            ""
        ).trim();

    return normalized ||
        fallback;
}

export default function CallToAction({
    data = {},
    mode = "website"
}) {
    const alignment =
        normalizeAlignment(
            data.alignment
        );

    const buttonVariant =
        normalizeButtonVariant(
            data.buttonVariant
        );

    const buttonHref =
        String(
            data.buttonHref ??
            ""
        ).trim() ||
        "#";

    const openInNewTab =
        Boolean(
            data.openInNewTab
        );

    function handleButtonClick(
        event
    ) {
        if (
            mode ===
            "editor"
        ) {
            event.preventDefault();
        }
    }

    return (
        <section
            className={
                `bp-cta bp-cta--${alignment}`
            }
            style={{
                "--bp-cta-background":
                    normalizeColor(
                        data.backgroundColor,
                        "#102a43"
                    ),

                "--bp-cta-accent":
                    normalizeColor(
                        data.accentColor,
                        "#38bdf8"
                    ),

                "--bp-cta-text":
                    normalizeColor(
                        data.textColor,
                        "#f8fafc"
                    )
            }}
        >
            <div className="bp-cta__glow" />

            <div className="bp-cta__content">
                {
                    data.eyebrow && (
                        <span className="bp-cta__eyebrow">
                            {
                                data.eyebrow
                            }
                        </span>
                    )
                }

                {
                    data.title && (
                        <h2>
                            {
                                data.title
                            }
                        </h2>
                    )
                }

                {
                    data.text && (
                        <p>
                            {
                                data.text
                            }
                        </p>
                    )
                }

                {
                    data.showButton !==
                        false &&
                    data.buttonText && (
                        <a
                            className={
                                `bp-cta__button bp-cta__button--${buttonVariant}`
                            }
                            href={
                                buttonHref
                            }
                            target={
                                openInNewTab
                                    ? "_blank"
                                    : undefined
                            }
                            rel={
                                openInNewTab
                                    ? "noopener noreferrer"
                                    : undefined
                            }
                            onClick={
                                handleButtonClick
                            }
                        >
                            <span>
                                {
                                    data.buttonText
                                }
                            </span>

                            <i
                                className="bi bi-arrow-right"
                                aria-hidden="true"
                            />
                        </a>
                    )
                }
            </div>
        </section>
    );
}