import "./BlockNavigator.css";

import {
    useMemo,
    useState
} from "react";

import {
    getBlock
} from "../registry/blockRegistry";

function normalizeText(value) {
    return String(
        value ??
        ""
    ).trim();
}

function truncateText(
    value,
    maximumLength = 46
) {
    const text =
        normalizeText(
            value
        );

    return text.length <=
        maximumLength
        ? text
        : `${text.slice(
            0,
            maximumLength - 1
        )}…`;
}

function getBlockDescription(
    block
) {
    const data =
        block?.data ??
        {};

    const candidates = [
        data.title,
        data.heading,
        data.headline,
        data.label,
        data.quote,
        data.text,
        data.description,
        data.alt,
        data.caption
    ];

    const description =
        candidates.find(
            (value) =>
                normalizeText(
                    value
                )
        );

    return truncateText(
        description ||
        "Keine zusätzliche Bezeichnung"
    );
}

function getBlockInformation(
    block
) {
    const definition =
        getBlock(
            block?.type
        );

    const rawIcon =
        normalizeText(
            definition?.icon
        );

    return {
        name:
            definition?.name ??
            block?.type ??
            "Unbekannter Block",

        type:
            definition?.type ??
            block?.type ??
            "block",

        icon:
            rawIcon.startsWith(
                "bi-"
            )
                ? rawIcon
                : "bi-box",

        description:
            getBlockDescription(
                block
            )
    };
}

function BlockNavigatorItem({
    entry,
    selected,
    onSelect
}) {
    const information =
        useMemo(
            () =>
                getBlockInformation(
                    entry.block
                ),
            [
                entry.block
            ]
        );

    const indentation =
        entry.depth *
        14;

    return (
        <button
            type="button"
            className={
                selected
                    ? "builder-block-navigator__item builder-block-navigator__item--selected"
                    : "builder-block-navigator__item"
            }
            style={{
                marginLeft:
                    `${indentation}px`,

                width:
                    `calc(100% - ${indentation}px)`
            }}
            aria-current={
                selected
                    ? "true"
                    : undefined
            }
            title={
                `${information.name} auswählen`
            }
            onClick={
                () =>
                    onSelect?.(
                        entry.block.id
                    )
            }
        >
            <span className="builder-block-navigator__position">
                {
                    entry.index +
                    1
                }
            </span>

            <span className="builder-block-navigator__icon">
                <i
                    className={
                        `bi ${information.icon}`
                    }
                    aria-hidden="true"
                />
            </span>

            <span className="builder-block-navigator__content">
                <span className="builder-block-navigator__name">
                    {
                        entry.depth >
                        0 && (
                            <i
                                className="bi bi-arrow-return-right"
                                aria-hidden="true"
                            />
                        )
                    }

                    {
                        information.name
                    }
                </span>

                <span className="builder-block-navigator__description">
                    {
                        information.description
                    }
                </span>

                <span className="builder-block-navigator__metadata">
                    {
                        entry.depth >
                        0
                            ? `${entry.columnLabel} · `
                            : ""
                    }

                    {
                        information.type
                    } · Block {
                        entry.index +
                        1
                    } von {
                        entry.total
                    }
                </span>
            </span>

            <span className="builder-block-navigator__selection">
                <i
                    className={
                        selected
                            ? "bi bi-check-circle-fill"
                            : "bi bi-chevron-right"
                    }
                    aria-hidden="true"
                />
            </span>
        </button>
    );
}

export default function BlockNavigator({
    blocks = [],
    entries = null,
    selectedId = null,
    onSelect,
    onClearSelection
}) {
    const [
        collapsed,
        setCollapsed
    ] =
        useState(false);

    const normalizedEntries =
        Array.isArray(
            entries
        )
            ? entries
            : (
                Array.isArray(
                    blocks
                )
                    ? blocks.map(
                        (
                            block,
                            index
                        ) => ({
                            block,
                            depth: 0,
                            index,
                            total:
                                blocks.length,
                            columnLabel: ""
                        })
                    )
                    : []
            );

    const selectedIndex =
        normalizedEntries.findIndex(
            (entry) =>
                entry.block.id ===
                selectedId
        );

    const selectedPosition =
        selectedIndex >=
        0
            ? selectedIndex + 1
            : null;

    return (
        <section
            className={
                collapsed
                    ? "builder-block-navigator builder-block-navigator--collapsed"
                    : "builder-block-navigator"
            }
        >
            <header className="builder-block-navigator__header">
                <div className="builder-block-navigator__heading">
                    <span className="builder-block-navigator__heading-icon">
                        <i
                            className="bi bi-layers"
                            aria-hidden="true"
                        />
                    </span>

                    <div>
                        <span className="builder-block-navigator__eyebrow">
                            Seitenstruktur
                        </span>

                        <h3>
                            Blöcke
                        </h3>
                    </div>
                </div>

                <div className="builder-block-navigator__header-actions">
                    <span
                        className="builder-block-navigator__count"
                        title="Anzahl aller Blöcke"
                    >
                        {
                            normalizedEntries.length
                        }
                    </span>

                    <button
                        type="button"
                        className="builder-block-navigator__collapse"
                        aria-expanded={
                            !collapsed
                        }
                        aria-label={
                            collapsed
                                ? "Block-Navigation öffnen"
                                : "Block-Navigation schließen"
                        }
                        onClick={
                            () =>
                                setCollapsed(
                                    (
                                        currentValue
                                    ) =>
                                        !currentValue
                                )
                        }
                    >
                        <i
                            className={
                                collapsed
                                    ? "bi bi-chevron-down"
                                    : "bi bi-chevron-up"
                            }
                            aria-hidden="true"
                        />
                    </button>
                </div>
            </header>

            {
                !collapsed && (
                    <>
                        <div className="builder-block-navigator__status">
                            {
                                selectedPosition ? (
                                    <>
                                        <span className="builder-block-navigator__status-indicator builder-block-navigator__status-indicator--selected">
                                            <i
                                                className="bi bi-check-circle-fill"
                                                aria-hidden="true"
                                            />
                                        </span>

                                        <span>
                                            Block {
                                                selectedPosition
                                            } von {
                                                normalizedEntries.length
                                            } ausgewählt
                                        </span>

                                        <button
                                            type="button"
                                            onClick={
                                                () =>
                                                    onClearSelection?.()
                                            }
                                        >
                                            Auswahl aufheben
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <span className="builder-block-navigator__status-indicator">
                                            <i
                                                className="bi bi-cursor"
                                                aria-hidden="true"
                                            />
                                        </span>

                                        <span>
                                            Wähle einen Block aus der Struktur oder Leinwand.
                                        </span>
                                    </>
                                )
                            }
                        </div>

                        {
                            normalizedEntries.length ===
                            0 ? (
                                <div className="builder-block-navigator__empty">
                                    <i
                                        className="bi bi-layers"
                                        aria-hidden="true"
                                    />

                                    <strong>
                                        Noch keine Blöcke
                                    </strong>

                                    <span>
                                        Füge links einen Block zur Seite hinzu.
                                    </span>
                                </div>
                            ) : (
                                <div
                                    className="builder-block-navigator__list"
                                    aria-label="Blöcke der aktuellen Seite"
                                >
                                    {
                                        normalizedEntries.map(
                                            (entry) => (
                                                <BlockNavigatorItem
                                                    key={
                                                        entry.block.id
                                                    }
                                                    entry={
                                                        entry
                                                    }
                                                    selected={
                                                        selectedId ===
                                                        entry.block.id
                                                    }
                                                    onSelect={
                                                        onSelect
                                                    }
                                                />
                                            )
                                        )
                                    }
                                </div>
                            )
                        }
                    </>
                )
            }
        </section>
    );
}