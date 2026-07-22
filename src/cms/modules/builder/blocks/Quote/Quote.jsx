import "./Quote.css";

const ALIGNMENTS =
    new Set([
        "left",
        "center",
        "right"
    ]);

const VARIANTS =
    new Set([
        "card",
        "minimal",
        "accent"
    ]);

function normalizeOption(
    value,
    allowedValues,
    fallback
) {
    return allowedValues.has(
        value
    )
        ? value
        : fallback;
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

export default function Quote({
    data = {},
    mode = "website"
}) {
    const alignment =
        normalizeOption(
            data.alignment,
            ALIGNMENTS,
            "left"
        );

    const variant =
        normalizeOption(
            data.variant,
            VARIANTS,
            "card"
        );

    const sourceUrl =
        String(
            data.sourceUrl ??
            ""
        ).trim();

    function handleSourceClick(
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
        <figure
            className={
                `bp-quote bp-quote--${alignment} bp-quote--${variant}`
            }
            style={{
                "--bp-quote-background":
                    normalizeColor(
                        data.backgroundColor,
                        "#111c2f"
                    ),

                "--bp-quote-accent":
                    normalizeColor(
                        data.accentColor,
                        "#38bdf8"
                    ),

                "--bp-quote-text":
                    normalizeColor(
                        data.textColor,
                        "#f8fafc"
                    )
            }}
        >
            <span
                className="bp-quote__mark"
                aria-hidden="true"
            >
                “
            </span>

            <blockquote>
                <p>
                    {
                        data.quote
                    }
                </p>
            </blockquote>

            {
                (
                    data.author ||
                    data.role
                ) && (
                    <figcaption>
                        {
                            data.author && (
                                <strong>
                                    {
                                        data.author
                                    }
                                </strong>
                            )
                        }

                        {
                            data.role && (
                                <span>
                                    {
                                        data.role
                                    }
                                </span>
                            )
                        }

                        {
                            sourceUrl && (
                                <a
                                    href={
                                        sourceUrl
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={
                                        handleSourceClick
                                    }
                                >
                                    Quelle öffnen

                                    <i
                                        className="bi bi-box-arrow-up-right"
                                        aria-hidden="true"
                                    />
                                </a>
                            )
                        }
                    </figcaption>
                )
            }
        </figure>
    );
}