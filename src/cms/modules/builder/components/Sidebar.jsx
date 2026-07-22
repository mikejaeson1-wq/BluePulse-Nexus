import "./Sidebar.css";

import {
    useMemo,
    useState
} from "react";

import {
    getBlockCategories,
    getBlocks
} from "../registry/blockRegistry";

const ALL_CATEGORIES =
    "Alle";

function matchesSearch(
    block,
    searchTerm
) {
    const normalizedSearch =
        searchTerm
            .trim()
            .toLowerCase();

    if (!normalizedSearch) {
        return true;
    }

    const searchableValues = [
        block.name,
        block.description,
        block.category,
        block.type,
        ...(
            block.keywords ??
            []
        )
    ];

    return searchableValues
        .filter(
            Boolean
        )
        .some(
            (value) =>
                String(value)
                    .toLowerCase()
                    .includes(
                        normalizedSearch
                    )
        );
}

function BlockIcon({
    icon
}) {
    if (
        String(
            icon ??
            ""
        ).startsWith(
            "bi-"
        )
    ) {
        return (
            <i
                className={
                    `bi ${icon}`
                }
                aria-hidden="true"
            />
        );
    }

    return (
        <span aria-hidden="true">
            {
                icon ||
                "📦"
            }
        </span>
    );
}

export default function Sidebar({
    onAdd
}) {
    const [
        searchTerm,
        setSearchTerm
    ] =
        useState("");

    const [
        selectedCategory,
        setSelectedCategory
    ] =
        useState(
            ALL_CATEGORIES
        );

    const blocks =
        useMemo(
            () =>
                getBlocks(),
            []
        );

    const categories =
        useMemo(
            () => [
                ALL_CATEGORIES,
                ...getBlockCategories()
            ],
            []
        );

    const visibleBlocks =
        useMemo(
            () =>
                blocks.filter(
                    (block) => {
                        const categoryMatches =
                            selectedCategory ===
                                ALL_CATEGORIES ||
                            block.category ===
                                selectedCategory;

                        return (
                            categoryMatches &&
                            matchesSearch(
                                block,
                                searchTerm
                            )
                        );
                    }
                ),
            [
                blocks,
                searchTerm,
                selectedCategory
            ]
        );

    const groupedBlocks =
        useMemo(
            () => {
                const groups =
                    new Map();

                visibleBlocks.forEach(
                    (block) => {
                        const category =
                            block.category ??
                            "Allgemein";

                        if (
                            !groups.has(
                                category
                            )
                        ) {
                            groups.set(
                                category,
                                []
                            );
                        }

                        groups.get(
                            category
                        ).push(
                            block
                        );
                    }
                );

                return [
                    ...groups.entries()
                ];
            },
            [
                visibleBlocks
            ]
        );

    function clearSearch() {
        setSearchTerm("");
    }

    return (
        <aside className="builder-catalog">
            <header className="builder-catalog__header">
                <div>
                    <span className="builder-catalog__eyebrow">
                        Builder 2.0
                    </span>

                    <h2>
                        Blöcke
                    </h2>
                </div>

                <span
                    className="builder-catalog__count"
                    title="Registrierte Blöcke"
                >
                    {
                        blocks.length
                    }
                </span>
            </header>

            <label className="builder-catalog__search">
                <i
                    className="bi bi-search"
                    aria-hidden="true"
                />

                <input
                    type="search"
                    value={
                        searchTerm
                    }
                    onChange={
                        (event) =>
                            setSearchTerm(
                                event.target.value
                            )
                    }
                    placeholder="Block suchen …"
                    aria-label="Builder-Blöcke durchsuchen"
                />

                {
                    searchTerm && (
                        <button
                            type="button"
                            onClick={
                                clearSearch
                            }
                            aria-label="Suche leeren"
                            title="Suche leeren"
                        >
                            <i
                                className="bi bi-x-lg"
                                aria-hidden="true"
                            />
                        </button>
                    )
                }
            </label>

            <div
                className="builder-catalog__categories"
                aria-label="Blockkategorien"
            >
                {
                    categories.map(
                        (category) => (
                            <button
                                key={
                                    category
                                }
                                type="button"
                                className={
                                    selectedCategory ===
                                    category
                                        ? "builder-catalog__category builder-catalog__category--active"
                                        : "builder-catalog__category"
                                }
                                onClick={
                                    () =>
                                        setSelectedCategory(
                                            category
                                        )
                                }
                            >
                                {
                                    category
                                }
                            </button>
                        )
                    )
                }
            </div>

            <div className="builder-catalog__content">
                {
                    groupedBlocks.length ===
                        0 ? (
                        <div className="builder-catalog__empty">
                            <i
                                className="bi bi-search"
                                aria-hidden="true"
                            />

                            <strong>
                                Kein Block gefunden
                            </strong>

                            <span>
                                Passe den Suchbegriff oder die Kategorie an.
                            </span>
                        </div>
                    ) : (
                        groupedBlocks.map(
                            ([
                                category,
                                categoryBlocks
                            ]) => (
                                <section
                                    key={
                                        category
                                    }
                                    className="builder-catalog__group"
                                >
                                    <div className="builder-catalog__group-heading">
                                        <h3>
                                            {
                                                category
                                            }
                                        </h3>

                                        <span>
                                            {
                                                categoryBlocks.length
                                            }
                                        </span>
                                    </div>

                                    <div className="builder-catalog__blocks">
                                        {
                                            categoryBlocks.map(
                                                (block) => (
                                                    <button
                                                        key={
                                                            block.type
                                                        }
                                                        type="button"
                                                        className="builder-catalog__block"
                                                        onClick={
                                                            () =>
                                                                onAdd(
                                                                    block
                                                                )
                                                        }
                                                        title={
                                                            `${block.name} hinzufügen`
                                                        }
                                                    >
                                                        <span className="builder-catalog__block-icon">
                                                            <BlockIcon
                                                                icon={
                                                                    block.icon
                                                                }
                                                            />
                                                        </span>

                                                        <span className="builder-catalog__block-content">
                                                            <strong>
                                                                {
                                                                    block.name
                                                                }
                                                            </strong>

                                                            <small>
                                                                {
                                                                    block.description
                                                                }
                                                            </small>
                                                        </span>

                                                        <i
                                                            className="bi bi-plus-lg builder-catalog__add-icon"
                                                            aria-hidden="true"
                                                        />
                                                    </button>
                                                )
                                            )
                                        }
                                    </div>
                                </section>
                            )
                        )
                    )
                }
            </div>
        </aside>
    );
}