import "./CardGrid.css";

const ALIGNMENTS =
    new Set([
        "left",
        "center",
        "right"
    ]);

const VARIANTS =
    new Set([
        "elevated",
        "bordered",
        "minimal"
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

function normalizeColumns(
    value
) {
    const columns =
        Number.parseInt(
            value,
            10
        );

    if (
        !Number.isInteger(
            columns
        )
    ) {
        return 3;
    }

    return Math.min(
        Math.max(
            columns,
            1
        ),
        4
    );
}

function normalizeCards(
    value
) {
    return Array.isArray(
        value
    )
        ? value
        : [];
}

function CardMedia({
    card,
    showImages,
    showIcons
}) {
    const imageSrc =
        String(
            card.imageSrc ??
            ""
        ).trim();

    const icon =
        String(
            card.icon ??
            ""
        ).trim();

    if (
        showImages &&
        imageSrc
    ) {
        return (
            <div className="bp-card-grid__image">
                <img
                    src={
                        imageSrc
                    }
                    alt={
                        card.imageAlt ??
                        ""
                    }
                    loading="lazy"
                />
            </div>
        );
    }

    if (
        showIcons &&
        icon
    ) {
        return (
            <span className="bp-card-grid__icon">
                <i
                    className={
                        `bi ${icon}`
                    }
                    aria-hidden="true"
                />
            </span>
        );
    }

    return null;
}

export default function CardGrid({
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
            "elevated"
        );

    const columns =
        normalizeColumns(
            data.columns
        );

    const cards =
        normalizeCards(
            data.cards
        );

    const showImages =
        data.showImages !==
        false;

    const showIcons =
        data.showIcons !==
        false;

    function handleLinkClick(
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
                `bp-card-grid bp-card-grid--${alignment} bp-card-grid--${variant}`
            }
            style={{
                "--bp-card-grid-columns":
                    columns,

                "--bp-card-grid-background":
                    normalizeColor(
                        data.backgroundColor,
                        "#0b1220"
                    ),

                "--bp-card-grid-card-background":
                    normalizeColor(
                        data.cardBackgroundColor,
                        "#111c2f"
                    ),

                "--bp-card-grid-accent":
                    normalizeColor(
                        data.accentColor,
                        "#38bdf8"
                    ),

                "--bp-card-grid-text":
                    normalizeColor(
                        data.textColor,
                        "#f8fafc"
                    )
            }}
        >
            <div className="bp-card-grid__container">
                {
                    (
                        data.eyebrow ||
                        data.title ||
                        data.intro
                    ) && (
                        <header className="bp-card-grid__header">
                            {
                                data.eyebrow && (
                                    <span className="bp-card-grid__eyebrow">
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
                                data.intro && (
                                    <p>
                                        {
                                            data.intro
                                        }
                                    </p>
                                )
                            }
                        </header>
                    )
                }

                {
                    cards.length >
                    0 ? (
                        <div className="bp-card-grid__grid">
                            {
                                cards.map(
                                    (
                                        card,
                                        index
                                    ) => {
                                        const linkHref =
                                            String(
                                                card.linkHref ??
                                                ""
                                            ).trim();

                                        const showLink =
                                            Boolean(
                                                card.linkText &&
                                                linkHref
                                            );

                                        return (
                                            <article
                                                key={
                                                    card.id ??
                                                    `card-${index}`
                                                }
                                                className="bp-card-grid__card"
                                            >
                                                <CardMedia
                                                    card={
                                                        card
                                                    }
                                                    showImages={
                                                        showImages
                                                    }
                                                    showIcons={
                                                        showIcons
                                                    }
                                                />

                                                <div className="bp-card-grid__card-content">
                                                    {
                                                        card.title && (
                                                            <h3>
                                                                {
                                                                    card.title
                                                                }
                                                            </h3>
                                                        )
                                                    }

                                                    {
                                                        card.text && (
                                                            <p>
                                                                {
                                                                    card.text
                                                                }
                                                            </p>
                                                        )
                                                    }

                                                    {
                                                        showLink && (
                                                            <a
                                                                href={
                                                                    linkHref
                                                                }
                                                                target={
                                                                    card.openInNewTab
                                                                        ? "_blank"
                                                                        : undefined
                                                                }
                                                                rel={
                                                                    card.openInNewTab
                                                                        ? "noopener noreferrer"
                                                                        : undefined
                                                                }
                                                                onClick={
                                                                    handleLinkClick
                                                                }
                                                            >
                                                                <span>
                                                                    {
                                                                        card.linkText
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
                                            </article>
                                        );
                                    }
                                )
                            }
                        </div>
                    ) : (
                        <div className="bp-card-grid__empty">
                            Noch keine Karten angelegt.
                        </div>
                    )
                }
            </div>
        </section>
    );
}