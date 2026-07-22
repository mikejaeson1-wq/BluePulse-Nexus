import "./Stats.css";

const ALIGNMENTS =
    new Set([
        "left",
        "center",
        "right"
    ]);

const VARIANTS =
    new Set([
        "cards",
        "minimal",
        "band"
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
        return 4;
    }

    return Math.min(
        Math.max(
            columns,
            1
        ),
        4
    );
}

export default function Stats({
    data = {}
}) {
    const alignment =
        normalizeOption(
            data.alignment,
            ALIGNMENTS,
            "center"
        );

    const variant =
        normalizeOption(
            data.variant,
            VARIANTS,
            "cards"
        );

    const columns =
        normalizeColumns(
            data.columns
        );

    const stats =
        Array.isArray(
            data.stats
        )
            ? data.stats
            : [];

    return (
        <section
            className={
                `bp-stats bp-stats--${alignment} bp-stats--${variant}`
            }
            style={{
                "--bp-stats-columns":
                    columns,

                "--bp-stats-background":
                    normalizeColor(
                        data.backgroundColor,
                        "#08111f"
                    ),

                "--bp-stats-item-background":
                    normalizeColor(
                        data.itemBackgroundColor,
                        "#111c2f"
                    ),

                "--bp-stats-accent":
                    normalizeColor(
                        data.accentColor,
                        "#38bdf8"
                    ),

                "--bp-stats-text":
                    normalizeColor(
                        data.textColor,
                        "#f8fafc"
                    )
            }}
        >
            <div className="bp-stats__container">
                {
                    (
                        data.eyebrow ||
                        data.title ||
                        data.intro
                    ) && (
                        <header className="bp-stats__header">
                            {
                                data.eyebrow && (
                                    <span className="bp-stats__eyebrow">
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
                    stats.length >
                    0 ? (
                        <div className="bp-stats__grid">
                            {
                                stats.map(
                                    (
                                        stat,
                                        index
                                    ) => (
                                        <article
                                            key={
                                                stat.id ??
                                                `stat-${index}`
                                            }
                                            className="bp-stats__item"
                                        >
                                            {
                                                stat.icon && (
                                                    <span className="bp-stats__icon">
                                                        <i
                                                            className={
                                                                `bi ${stat.icon}`
                                                            }
                                                            aria-hidden="true"
                                                        />
                                                    </span>
                                                )
                                            }

                                            <div className="bp-stats__number">
                                                <strong>
                                                    {
                                                        stat.value
                                                    }
                                                </strong>

                                                {
                                                    stat.suffix && (
                                                        <span>
                                                            {
                                                                stat.suffix
                                                            }
                                                        </span>
                                                    )
                                                }
                                            </div>

                                            {
                                                stat.label && (
                                                    <h3>
                                                        {
                                                            stat.label
                                                        }
                                                    </h3>
                                                )
                                            }

                                            {
                                                stat.description && (
                                                    <p>
                                                        {
                                                            stat.description
                                                        }
                                                    </p>
                                                )
                                            }
                                        </article>
                                    )
                                )
                            }
                        </div>
                    ) : (
                        <div className="bp-stats__empty">
                            Noch keine Kennzahlen angelegt.
                        </div>
                    )
                }
            </div>
        </section>
    );
}