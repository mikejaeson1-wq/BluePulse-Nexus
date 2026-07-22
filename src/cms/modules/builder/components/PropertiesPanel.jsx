import "./PropertiesPanel.css";
import "./PropertiesPanelEnhancements.css";

import {
    useEffect,
    useRef,
    useState
} from "react";

import {
    BLOCK_WIDTH_OPTIONS,
    getBlockSettings
} from "@shared/pages/blockSettings";

import {
    getBlock
} from "../registry/blockRegistry";

import BlockAdvancedSettings from "./BlockAdvancedSettings";
import BlockDesignSettings from "./BlockDesignSettings";

const INSPECTOR_TABS = [
    {
        id: "content",
        label: "Inhalt",
        icon: "bi-pencil-square",
        description: "Texte, Medien und blockeigene Inhalte"
    },
    {
        id: "design",
        label: "Design",
        icon: "bi-palette",
        description: "Breite, Abstände und visuelle Darstellung"
    },
    {
        id: "advanced",
        label: "Erweitert",
        icon: "bi-sliders",
        description: "Sichtbarkeit, Anker und technische Optionen"
    }
];

function normalizeIcon(
    icon
) {
    const normalizedIcon =
        String(
            icon ??
            ""
        ).trim();

    return normalizedIcon.startsWith(
        "bi-"
    )
        ? normalizedIcon
        : "bi-box";
}

function getWidthLabel(
    width
) {
    return (
        BLOCK_WIDTH_OPTIONS.find(
            (option) =>
                option.value ===
                width
        )?.label ??
        "Volle Breite"
    );
}

function getHiddenDeviceCount(
    advanced = {}
) {
    return [
        advanced.hideDesktop,
        advanced.hideTablet,
        advanced.hideMobile
    ].filter(
        Boolean
    ).length;
}

function EmptyInspector() {
    return (
        <section className="builder-block-inspector builder-block-inspector--empty">
            <div className="builder-block-inspector__empty">
                <span className="builder-block-inspector__empty-icon">
                    <i
                        className="bi bi-cursor"
                        aria-hidden="true"
                    />
                </span>

                <span className="builder-block-inspector__eyebrow">
                    Block-Inspector
                </span>

                <h3>
                    Kein Block ausgewählt
                </h3>

                <p>
                    Wähle einen Block auf der Leinwand oder in der
                    Seitenstruktur aus, um seine Inhalte und Einstellungen
                    zu bearbeiten.
                </p>

                <div className="builder-block-inspector__empty-hint">
                    <i
                        className="bi bi-keyboard"
                        aria-hidden="true"
                    />

                    <span>
                        Mit den Pfeiltasten kannst du zwischen den Blöcken
                        wechseln.
                    </span>
                </div>
            </div>
        </section>
    );
}

function MissingDefinition({
    block
}) {
    return (
        <section className="builder-block-inspector builder-block-inspector--error">
            <div className="builder-block-inspector__message">
                <span className="builder-block-inspector__message-icon">
                    <i
                        className="bi bi-exclamation-triangle"
                        aria-hidden="true"
                    />
                </span>

                <div>
                    <span className="builder-block-inspector__eyebrow">
                        Unbekannter Block
                    </span>

                    <h3>
                        Block nicht registriert
                    </h3>

                    <p>
                        Der Blocktyp „{
                            block?.type ??
                            "unbekannt"
                        }“ besitzt keine gültige Definition.
                    </p>
                </div>
            </div>
        </section>
    );
}

function MissingProperties({
    definition
}) {
    return (
        <div className="builder-block-inspector__notice">
            <span className="builder-block-inspector__notice-icon">
                <i
                    className="bi bi-info-circle"
                    aria-hidden="true"
                />
            </span>

            <div>
                <strong>
                    Keine Inhaltseinstellungen
                </strong>

                <p>
                    Der Block „{
                        definition.name
                    }“ besitzt derzeit keine eigenen Inhaltsfelder.
                </p>
            </div>
        </div>
    );
}

function InspectorStatus({
    position,
    total,
    widthLabel,
    hiddenDeviceCount,
    canSelectPrevious,
    canSelectNext,
    onSelectPrevious,
    onSelectNext
}) {
    return (
        <div className="builder-block-inspector__status-bar">
            <div className="builder-block-inspector__status-facts">
                <span
                    className="builder-block-inspector__status-chip"
                    title="Position auf der Seite"
                >
                    <i
                        className="bi bi-layers"
                        aria-hidden="true"
                    />

                    {
                        position
                    } / {
                        total
                    }
                </span>

                <span
                    className="builder-block-inspector__status-chip"
                    title="Aktuelle Blockbreite"
                >
                    <i
                        className="bi bi-arrows-angle-expand"
                        aria-hidden="true"
                    />

                    {
                        widthLabel
                    }
                </span>

                <span
                    className={
                        hiddenDeviceCount >
                        0
                            ? "builder-block-inspector__status-chip builder-block-inspector__status-chip--warning"
                            : "builder-block-inspector__status-chip builder-block-inspector__status-chip--visible"
                    }
                    title="Gerätesichtbarkeit"
                >
                    <i
                        className={
                            hiddenDeviceCount >
                            0
                                ? "bi bi-eye-slash"
                                : "bi bi-eye"
                        }
                        aria-hidden="true"
                    />

                    {
                        hiddenDeviceCount >
                        0
                            ? `${hiddenDeviceCount}× verborgen`
                            : "Überall sichtbar"
                    }
                </span>
            </div>

            <div
                className="builder-block-inspector__status-navigation"
                role="group"
                aria-label="Zwischen Blöcken wechseln"
            >
                <button
                    type="button"
                    disabled={
                        !canSelectPrevious
                    }
                    aria-label="Vorherigen Block auswählen"
                    title="Vorheriger Block"
                    onClick={
                        onSelectPrevious
                    }
                >
                    <i
                        className="bi bi-chevron-up"
                        aria-hidden="true"
                    />
                </button>

                <button
                    type="button"
                    disabled={
                        !canSelectNext
                    }
                    aria-label="Nächsten Block auswählen"
                    title="Nächster Block"
                    onClick={
                        onSelectNext
                    }
                >
                    <i
                        className="bi bi-chevron-down"
                        aria-hidden="true"
                    />
                </button>
            </div>
        </div>
    );
}

export default function PropertiesPanel({
    block,
    blocks = [],
    selectedId = null,
    onSelect,
    onChange
}) {
    const tabListRef =
        useRef(null);

    const [
        activeTab,
        setActiveTab
    ] =
        useState(
            "content"
        );

    const normalizedBlocks =
        Array.isArray(
            blocks
        )
            ? blocks
            : [];

    const definition =
        block
            ? getBlock(
                block.type
            )
            : null;

    const selectedBlockId =
        selectedId ??
        block?.id ??
        null;

    const selectedIndex =
        normalizedBlocks.findIndex(
            (currentBlock) =>
                currentBlock.id ===
                selectedBlockId
        );

    const settings =
        block
            ? getBlockSettings(
                block
            )
            : null;

    useEffect(() => {
        setActiveTab(
            "content"
        );
    }, [
        block?.id
    ]);

    if (!block) {
        return (
            <EmptyInspector />
        );
    }

    if (!definition) {
        return (
            <MissingDefinition
                block={
                    block
                }
            />
        );
    }

    const PropertiesComponent =
        definition.properties;

    const blockIcon =
        normalizeIcon(
            definition.icon
        );

    const activeTabDefinition =
        INSPECTOR_TABS.find(
            (tab) =>
                tab.id ===
                activeTab
        ) ??
        INSPECTOR_TABS[0];

    const position =
        selectedIndex >=
        0
            ? selectedIndex +
                1
            : 1;

    const total =
        Math.max(
            normalizedBlocks.length,
            1
        );

    const canSelectPrevious =
        selectedIndex >
        0;

    const canSelectNext =
        selectedIndex >=
            0 &&
        selectedIndex <
            normalizedBlocks.length -
            1;

    const widthLabel =
        getWidthLabel(
            settings?.design
                ?.width
        );

    const hiddenDeviceCount =
        getHiddenDeviceCount(
            settings?.advanced
        );

    function activateTab(
        tabId
    ) {
        const tabExists =
            INSPECTOR_TABS.some(
                (tab) =>
                    tab.id ===
                    tabId
            );

        if (!tabExists) {
            return;
        }

        setActiveTab(
            tabId
        );
    }

    function selectPreviousBlock() {
        if (
            !canSelectPrevious
        ) {
            return;
        }

        onSelect?.(
            normalizedBlocks[
                selectedIndex -
                1
            ].id
        );
    }

    function selectNextBlock() {
        if (
            !canSelectNext
        ) {
            return;
        }

        onSelect?.(
            normalizedBlocks[
                selectedIndex +
                1
            ].id
        );
    }

    function handleTabKeyDown(
        event
    ) {
        const currentIndex =
            INSPECTOR_TABS.findIndex(
                (tab) =>
                    tab.id ===
                    activeTab
            );

        let nextIndex =
            currentIndex;

        if (
            event.key ===
            "ArrowRight"
        ) {
            nextIndex =
                (
                    currentIndex +
                    1
                ) %
                INSPECTOR_TABS.length;
        } else if (
            event.key ===
            "ArrowLeft"
        ) {
            nextIndex =
                (
                    currentIndex -
                    1 +
                    INSPECTOR_TABS.length
                ) %
                INSPECTOR_TABS.length;
        } else if (
            event.key ===
            "Home"
        ) {
            nextIndex =
                0;
        } else if (
            event.key ===
            "End"
        ) {
            nextIndex =
                INSPECTOR_TABS.length -
                1;
        } else {
            return;
        }

        event.preventDefault();

        const nextTab =
            INSPECTOR_TABS[
                nextIndex
            ];

        setActiveTab(
            nextTab.id
        );

        globalThis
            .requestAnimationFrame?.(
                () => {
                    tabListRef
                        .current
                        ?.querySelector(
                            `[data-inspector-tab="${nextTab.id}"]`
                        )
                        ?.focus();
                }
            );
    }

    return (
        <section className="builder-block-inspector">
            <div className="builder-block-inspector__sticky">
                <header className="builder-block-inspector__summary">
                    <span className="builder-block-inspector__summary-icon">
                        <i
                            className={
                                `bi ${blockIcon}`
                            }
                            aria-hidden="true"
                        />
                    </span>

                    <div className="builder-block-inspector__summary-content">
                        <span className="builder-block-inspector__eyebrow">
                            Ausgewählter Block
                        </span>

                        <h3>
                            {
                                definition.name
                            }
                        </h3>

                        <p>
                            {
                                definition.description
                            }
                        </p>
                    </div>

                    <span className="builder-block-inspector__version">
                        v{
                            definition.version ??
                            1
                        }
                    </span>
                </header>

                <div className="builder-block-inspector__metadata">
                    <span>
                        <i
                            className="bi bi-tag"
                            aria-hidden="true"
                        />

                        {
                            definition.type
                        }
                    </span>

                    <span>
                        <i
                            className="bi bi-folder2"
                            aria-hidden="true"
                        />

                        {
                            definition.category ??
                            "Allgemein"
                        }
                    </span>

                    <span>
                        <i
                            className="bi bi-check-circle-fill"
                            aria-hidden="true"
                        />

                        Aktiv
                    </span>
                </div>

                <InspectorStatus
                    position={
                        position
                    }
                    total={
                        total
                    }
                    widthLabel={
                        widthLabel
                    }
                    hiddenDeviceCount={
                        hiddenDeviceCount
                    }
                    canSelectPrevious={
                        canSelectPrevious
                    }
                    canSelectNext={
                        canSelectNext
                    }
                    onSelectPrevious={
                        selectPreviousBlock
                    }
                    onSelectNext={
                        selectNextBlock
                    }
                />

                <div
                    ref={
                        tabListRef
                    }
                    className="builder-block-inspector__tabs"
                    role="tablist"
                    aria-label="Bereiche des Block-Inspectors"
                    onKeyDown={
                        handleTabKeyDown
                    }
                >
                    {
                        INSPECTOR_TABS.map(
                            (tab) => {
                                const selected =
                                    activeTab ===
                                    tab.id;

                                return (
                                    <button
                                        key={
                                            tab.id
                                        }
                                        type="button"
                                        id={
                                            `builder-inspector-tab-${tab.id}`
                                        }
                                        className={
                                            selected
                                                ? "builder-block-inspector__tab builder-block-inspector__tab--active"
                                                : "builder-block-inspector__tab"
                                        }
                                        role="tab"
                                        tabIndex={
                                            selected
                                                ? 0
                                                : -1
                                        }
                                        aria-selected={
                                            selected
                                        }
                                        aria-controls={
                                            `builder-inspector-panel-${tab.id}`
                                        }
                                        data-inspector-tab={
                                            tab.id
                                        }
                                        title={
                                            tab.description
                                        }
                                        onClick={
                                            () =>
                                                activateTab(
                                                    tab.id
                                                )
                                        }
                                    >
                                        <i
                                            className={
                                                `bi ${tab.icon}`
                                            }
                                            aria-hidden="true"
                                        />

                                        <span>
                                            {
                                                tab.label
                                            }
                                        </span>
                                    </button>
                                );
                            }
                        )
                    }
                </div>

                <div
                    className="builder-block-inspector__tab-description"
                    aria-live="polite"
                >
                    <i
                        className={
                            `bi ${activeTabDefinition.icon}`
                        }
                        aria-hidden="true"
                    />

                    <span>
                        {
                            activeTabDefinition.description
                        }
                    </span>
                </div>
            </div>

            <div
                id={
                    `builder-inspector-panel-${activeTab}`
                }
                className="builder-block-inspector__panel"
                role="tabpanel"
                tabIndex={
                    0
                }
                aria-labelledby={
                    `builder-inspector-tab-${activeTab}`
                }
            >
                {
                    activeTab ===
                        "content" &&
                    (
                        PropertiesComponent ? (
                            <div className="builder-block-inspector__properties">
                                <PropertiesComponent
                                    block={
                                        block
                                    }
                                    onChange={
                                        onChange
                                    }
                                />
                            </div>
                        ) : (
                            <MissingProperties
                                definition={
                                    definition
                                }
                            />
                        )
                    )
                }

                {
                    activeTab ===
                        "design" && (
                        <BlockDesignSettings
                            block={
                                block
                            }
                            onChange={
                                onChange
                            }
                        />
                    )
                }

                {
                    activeTab ===
                        "advanced" && (
                        <BlockAdvancedSettings
                            block={
                                block
                            }
                            onChange={
                                onChange
                            }
                        />
                    )
                }
            </div>
        </section>
    );
}