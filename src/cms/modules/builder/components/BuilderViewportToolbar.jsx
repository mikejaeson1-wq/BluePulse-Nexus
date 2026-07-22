import "./BuilderViewportToolbar.css";

export default function BuilderViewportToolbar({
    viewports,
    activeViewport,
    canvasMode,
    zoom,
    minimumZoom,
    maximumZoom,
    zoomStep,
    autoFit,
    isFullscreen,
    onViewportChange,
    onCanvasModeChange,
    onZoomChange,
    onResetZoom,
    onToggleAutoFit,
    onToggleFullscreen
}) {
    const currentViewport =
        viewports.find(
            (viewport) =>
                viewport.id ===
                activeViewport
        ) ??
        viewports[0];

    function decreaseZoom() {
        onZoomChange(
            Math.max(
                minimumZoom,
                zoom -
                zoomStep
            )
        );
    }

    function increaseZoom() {
        onZoomChange(
            Math.min(
                maximumZoom,
                zoom +
                zoomStep
            )
        );
    }

    return (
        <div className="builder-viewport-toolbar">
            <div className="builder-viewport-toolbar__group">
                <span className="builder-viewport-toolbar__label">
                    Modus
                </span>

                <div
                    className="builder-viewport-toolbar__modes"
                    role="group"
                    aria-label="Builder-Modus auswählen"
                >
                    <button
                        type="button"
                        className={
                            canvasMode ===
                            "edit"
                                ? "builder-viewport-toolbar__mode builder-viewport-toolbar__mode--active"
                                : "builder-viewport-toolbar__mode"
                        }
                        aria-pressed={
                            canvasMode ===
                            "edit"
                        }
                        title="Blöcke auswählen, bearbeiten und verschieben"
                        onClick={
                            () =>
                                onCanvasModeChange(
                                    "edit"
                                )
                        }
                    >
                        <i
                            className="bi bi-pencil-square"
                            aria-hidden="true"
                        />

                        <span>
                            Bearbeiten
                        </span>
                    </button>

                    <button
                        type="button"
                        className={
                            canvasMode ===
                            "preview"
                                ? "builder-viewport-toolbar__mode builder-viewport-toolbar__mode--active"
                                : "builder-viewport-toolbar__mode"
                        }
                        aria-pressed={
                            canvasMode ===
                            "preview"
                        }
                        title="Seite ohne Builder-Bedienelemente anzeigen"
                        onClick={
                            () =>
                                onCanvasModeChange(
                                    "preview"
                                )
                        }
                    >
                        <i
                            className="bi bi-eye"
                            aria-hidden="true"
                        />

                        <span>
                            Vorschau
                        </span>
                    </button>
                </div>
            </div>

            <div className="builder-viewport-toolbar__divider" />

            <div className="builder-viewport-toolbar__group">
                <span className="builder-viewport-toolbar__label">
                    Ansicht
                </span>

                <div
                    className="builder-viewport-toolbar__devices"
                    role="group"
                    aria-label="Geräteansicht auswählen"
                >
                    {
                        viewports.map(
                            (viewport) => (
                                <button
                                    key={
                                        viewport.id
                                    }
                                    type="button"
                                    className={
                                        activeViewport ===
                                        viewport.id
                                            ? "builder-viewport-toolbar__device builder-viewport-toolbar__device--active"
                                            : "builder-viewport-toolbar__device"
                                    }
                                    aria-pressed={
                                        activeViewport ===
                                        viewport.id
                                    }
                                    title={
                                        `${viewport.label} – ${viewport.width} × ${viewport.height} px`
                                    }
                                    onClick={
                                        () =>
                                            onViewportChange(
                                                viewport.id
                                            )
                                    }
                                >
                                    <i
                                        className={
                                            `bi ${viewport.icon}`
                                        }
                                        aria-hidden="true"
                                    />

                                    <span>
                                        {
                                            viewport.label
                                        }
                                    </span>
                                </button>
                            )
                        )
                    }
                </div>
            </div>

            <div className="builder-viewport-toolbar__information">
                <span>
                    <i
                        className="bi bi-arrows"
                        aria-hidden="true"
                    />

                    {
                        currentViewport.width
                    } × {
                        currentViewport.height
                    } px
                </span>

                <span>
                    <i
                        className="bi bi-aspect-ratio"
                        aria-hidden="true"
                    />

                    {
                        currentViewport.description
                    }
                </span>
            </div>

            <div className="builder-viewport-toolbar__group builder-viewport-toolbar__group--zoom">
                <span className="builder-viewport-toolbar__label">
                    Zoom
                </span>

                <button
                    type="button"
                    className={
                        autoFit
                            ? "builder-viewport-toolbar__fit builder-viewport-toolbar__fit--active"
                            : "builder-viewport-toolbar__fit"
                    }
                    aria-pressed={
                        autoFit
                    }
                    title={
                        autoFit
                            ? "Automatische Einpassung deaktivieren"
                            : "Leinwand automatisch an den verfügbaren Platz anpassen"
                    }
                    onClick={
                        onToggleAutoFit
                    }
                >
                    <i
                        className="bi bi-arrows-angle-contract"
                        aria-hidden="true"
                    />

                    <span>
                        Einpassen
                    </span>
                </button>

                <div className="builder-viewport-toolbar__zoom">
                    <button
                        type="button"
                        disabled={
                            zoom <=
                            minimumZoom
                        }
                        aria-label="Verkleinern"
                        title="Verkleinern"
                        onClick={
                            decreaseZoom
                        }
                    >
                        <i
                            className="bi bi-dash-lg"
                            aria-hidden="true"
                        />
                    </button>

                    <input
                        type="range"
                        min={
                            minimumZoom
                        }
                        max={
                            maximumZoom
                        }
                        step={
                            zoomStep
                        }
                        value={
                            zoom
                        }
                        aria-label="Zoomstufe"
                        onChange={
                            (event) =>
                                onZoomChange(
                                    Number(
                                        event.target.value
                                    )
                                )
                        }
                    />

                    <button
                        type="button"
                        disabled={
                            zoom >=
                            maximumZoom
                        }
                        aria-label="Vergrößern"
                        title="Vergrößern"
                        onClick={
                            increaseZoom
                        }
                    >
                        <i
                            className="bi bi-plus-lg"
                            aria-hidden="true"
                        />
                    </button>

                    <button
                        type="button"
                        className="builder-viewport-toolbar__zoom-value"
                        title="Empfohlene Zoomstufe wiederherstellen"
                        onClick={
                            onResetZoom
                        }
                    >
                        {
                            zoom
                        } %
                    </button>
                </div>
            </div>

            <button
                type="button"
                className={
                    isFullscreen
                        ? "builder-viewport-toolbar__fullscreen builder-viewport-toolbar__fullscreen--active"
                        : "builder-viewport-toolbar__fullscreen"
                }
                aria-pressed={
                    isFullscreen
                }
                title={
                    isFullscreen
                        ? "Vollbild schließen"
                        : "Leinwand im Vollbild öffnen"
                }
                onClick={
                    onToggleFullscreen
                }
            >
                <i
                    className={
                        isFullscreen
                            ? "bi bi-fullscreen-exit"
                            : "bi bi-fullscreen"
                    }
                    aria-hidden="true"
                />

                <span>
                    {
                        isFullscreen
                            ? "Schließen"
                            : "Vollbild"
                    }
                </span>
            </button>
        </div>
    );
}