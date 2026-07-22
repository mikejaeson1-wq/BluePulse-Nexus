import {
    useEffect,
    useMemo,
    useState
} from "react";

import AdminPage from "../components/AdminPage";

import Button from "@shared/ui/Button";

import {
    getHomeLayoutRepository
} from "@shared/data/repositories";

const homeLayoutRepository =
    getHomeLayoutRepository();

const EMPTY_LAYOUT = {
    items: []
};

function cloneValue(value) {
    if (
        typeof globalThis.structuredClone ===
        "function"
    ) {
        return globalThis.structuredClone(
            value
        );
    }

    return JSON.parse(
        JSON.stringify(value)
    );
}

function serializeValue(value) {
    return JSON.stringify(value);
}

function LoadingState() {
    return (
        <div
            className="d-flex align-items-center justify-content-center gap-3 py-5"
            role="status"
            aria-live="polite"
        >
            <span
                className="spinner-border text-info"
                aria-hidden="true"
            />

            <span>
                Startseiten-Layout wird aus Nexus geladen …
            </span>
        </div>
    );
}

export default function HomeLayout() {
    const [
        layout,
        setLayout
    ] =
        useState(
            EMPTY_LAYOUT
        );

    const [
        savedLayout,
        setSavedLayout
    ] =
        useState(
            EMPTY_LAYOUT
        );

    const [
        loading,
        setLoading
    ] =
        useState(true);

    const [
        saving,
        setSaving
    ] =
        useState(false);

    const [
        resetting,
        setResetting
    ] =
        useState(false);

    const [
        error,
        setError
    ] =
        useState("");

    const [
        message,
        setMessage
    ] =
        useState("");

    const busy =
        saving ||
        resetting;

    const hasUnsavedChanges =
        useMemo(
            () =>
                !loading &&
                serializeValue(
                    layout
                ) !==
                    serializeValue(
                        savedLayout
                    ),
            [
                layout,
                savedLayout,
                loading
            ]
        );

    const orderedItems =
        useMemo(
            () =>
                [
                    ...(
                        layout.items ??
                        []
                    )
                ].sort(
                    (
                        firstItem,
                        secondItem
                    ) =>
                        firstItem.order -
                        secondItem.order
                ),
            [
                layout.items
            ]
        );

    useEffect(() => {
        let active =
            true;

        const controller =
            new AbortController();

        async function loadLayout() {
            setLoading(true);
            setError("");
            setMessage("");

            try {
                const loadedLayout =
                    await homeLayoutRepository.get({
                        signal:
                            controller.signal
                    });

                if (
                    !active ||
                    controller.signal.aborted
                ) {
                    return;
                }

                const nextLayout =
                    loadedLayout &&
                    Array.isArray(
                        loadedLayout.items
                    )
                        ? cloneValue(
                            loadedLayout
                        )
                        : cloneValue(
                            EMPTY_LAYOUT
                        );

                setLayout(
                    nextLayout
                );

                setSavedLayout(
                    cloneValue(
                        nextLayout
                    )
                );
            } catch (
                loadError
            ) {
                if (
                    loadError?.name ===
                        "AbortError" ||
                    controller.signal.aborted
                ) {
                    return;
                }

                if (active) {
                    setLayout(
                        cloneValue(
                            EMPTY_LAYOUT
                        )
                    );

                    setSavedLayout(
                        cloneValue(
                            EMPTY_LAYOUT
                        )
                    );

                    setError(
                        loadError.message ??
                        "Das Startseiten-Layout konnte nicht geladen werden."
                    );
                }
            } finally {
                if (
                    active &&
                    !controller.signal.aborted
                ) {
                    setLoading(false);
                }
            }
        }

        loadLayout();

        return () => {
            active =
                false;

            controller.abort();
        };
    }, []);

    useEffect(() => {
        function handleBeforeUnload(
            event
        ) {
            if (
                !hasUnsavedChanges
            ) {
                return;
            }

            event.preventDefault();
            event.returnValue =
                "";
        }

        globalThis.window.addEventListener(
            "beforeunload",
            handleBeforeUnload
        );

        return () => {
            globalThis.window.removeEventListener(
                "beforeunload",
                handleBeforeUnload
            );
        };
    }, [
        hasUnsavedChanges
    ]);

    function clearFeedback() {
        setMessage("");
        setError("");
    }

    function toggleItem(
        itemId,
        enabled
    ) {
        setLayout(
            (
                currentLayout
            ) => ({
                ...currentLayout,

                items:
                    (
                        currentLayout.items ??
                        []
                    ).map(
                        (item) => {
                            if (
                                item.id !==
                                itemId
                            ) {
                                return item;
                            }

                            if (
                                item.required
                            ) {
                                return {
                                    ...item,
                                    enabled: true
                                };
                            }

                            return {
                                ...item,
                                enabled
                            };
                        }
                    )
            })
        );

        clearFeedback();
    }

    function moveItem(
        itemId,
        direction
    ) {
        setLayout(
            (
                currentLayout
            ) => {
                const items = [
                    ...(
                        currentLayout.items ??
                        []
                    )
                ].sort(
                    (
                        firstItem,
                        secondItem
                    ) =>
                        firstItem.order -
                        secondItem.order
                );

                const currentIndex =
                    items.findIndex(
                        (item) =>
                            item.id ===
                            itemId
                    );

                const nextIndex =
                    currentIndex +
                    direction;

                if (
                    currentIndex ===
                        -1 ||
                    nextIndex <
                        0 ||
                    nextIndex >=
                        items.length
                ) {
                    return currentLayout;
                }

                [
                    items[
                        currentIndex
                    ],
                    items[
                        nextIndex
                    ]
                ] = [
                    items[
                        nextIndex
                    ],
                    items[
                        currentIndex
                    ]
                ];

                return {
                    ...currentLayout,

                    items:
                        items.map(
                            (
                                item,
                                index
                            ) => ({
                                ...item,

                                order:
                                    (
                                        index +
                                        1
                                    ) *
                                    10
                            })
                        )
                };
            }
        );

        clearFeedback();
    }

    async function saveLayout(
        event
    ) {
        event.preventDefault();

        if (
            busy ||
            !hasUnsavedChanges
        ) {
            return;
        }

        setSaving(true);
        setError("");
        setMessage("");

        try {
            const saved =
                await homeLayoutRepository.update(
                    layout
                );

            const nextLayout =
                cloneValue(
                    saved
                );

            setLayout(
                nextLayout
            );

            setSavedLayout(
                cloneValue(
                    nextLayout
                )
            );

            setMessage(
                homeLayoutRepository.mode ===
                    "api"
                    ? "Startseiten-Layout wurde in PostgreSQL gespeichert."
                    : "Startseiten-Layout wurde gespeichert."
            );
        } catch (
            saveError
        ) {
            setError(
                saveError.message ??
                "Das Startseiten-Layout konnte nicht gespeichert werden."
            );
        } finally {
            setSaving(false);
        }
    }

    async function restoreDefaults() {
        if (busy) {
            return;
        }

        if (
            !globalThis.confirm(
                "Startseiten-Layout auf die Standardwerte zurücksetzen?"
            )
        ) {
            return;
        }

        setResetting(true);
        setError("");
        setMessage("");

        try {
            const defaults =
                await homeLayoutRepository.reset();

            const nextLayout =
                cloneValue(
                    defaults
                );

            setLayout(
                nextLayout
            );

            setSavedLayout(
                cloneValue(
                    nextLayout
                )
            );

            setMessage(
                homeLayoutRepository.mode ===
                    "api"
                    ? "Standardreihenfolge wurde in PostgreSQL wiederhergestellt."
                    : "Standardreihenfolge wurde wiederhergestellt."
            );
        } catch (
            resetError
        ) {
            setError(
                resetError.message ??
                "Die Standardreihenfolge konnte nicht wiederhergestellt werden."
            );
        } finally {
            setResetting(false);
        }
    }

    function openHomepage() {
        globalThis.window.open(
            "/",
            "_blank",
            "noopener,noreferrer"
        );
    }

    function openSection(
        item
    ) {
        globalThis.window.open(
            item.route,
            "_blank",
            "noopener,noreferrer"
        );
    }

    return (
        <AdminPage
            title="Startseiten-Layout"
            description={
                homeLayoutRepository.mode ===
                    "api"
                    ? "Bereiche aktivieren, sortieren und direkt in PostgreSQL speichern."
                    : "Bereiche der Startseite aktivieren und sortieren."
            }
            action={
                <Button
                    variant="secondary"
                    onClick={
                        openHomepage
                    }
                >
                    Startseite ansehen
                </Button>
            }
        >
            {
                error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )
            }

            {
                message && (
                    <div className="alert alert-success">
                        {message}
                    </div>
                )
            }

            {
                hasUnsavedChanges && (
                    <div className="alert alert-warning">
                        Es gibt ungespeicherte Änderungen.
                    </div>
                )
            }

            <div className="alert alert-info">
                Die Reihenfolge der Navigation wird weiterhin getrennt unter
                „Einstellungen“ verwaltet. Ein ausgeblendeter Bereich kann dort
                noch als Menüpunkt aktiviert sein.
            </div>

            {
                loading ? (
                    <LoadingState />
                ) : orderedItems.length ===
                    0 ? (
                    <div className="alert alert-danger">
                        Es wurden keine Startseitenbereiche geladen.
                    </div>
                ) : (
                    <form
                        onSubmit={
                            saveLayout
                        }
                    >
                        <fieldset
                            disabled={
                                busy
                            }
                            className="border-0 p-0 m-0"
                        >
                            <div className="table-responsive">
                                <table className="table table-dark table-hover align-middle">
                                    <thead>
                                        <tr>
                                            <th>
                                                Position
                                            </th>

                                            <th>
                                                Aktiv
                                            </th>

                                            <th>
                                                Bereich
                                            </th>

                                            <th>
                                                Komponente
                                            </th>

                                            <th>
                                                Status
                                            </th>

                                            <th>
                                                Reihenfolge
                                            </th>

                                            <th>
                                                Vorschau
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {
                                            orderedItems.map(
                                                (
                                                    item,
                                                    index
                                                ) => (
                                                    <tr
                                                        key={
                                                            item.id
                                                        }
                                                    >
                                                        <td>
                                                            <strong>
                                                                {
                                                                    index +
                                                                    1
                                                                }
                                                            </strong>
                                                        </td>

                                                        <td>
                                                            <input
                                                                id={
                                                                    `layout-${item.id}`
                                                                }
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                checked={
                                                                    Boolean(
                                                                        item.enabled
                                                                    )
                                                                }
                                                                disabled={
                                                                    busy ||
                                                                    item.required
                                                                }
                                                                onChange={
                                                                    (
                                                                        event
                                                                    ) =>
                                                                        toggleItem(
                                                                            item.id,
                                                                            event
                                                                                .target
                                                                                .checked
                                                                        )
                                                                }
                                                            />
                                                        </td>

                                                        <td>
                                                            <label
                                                                htmlFor={
                                                                    `layout-${item.id}`
                                                                }
                                                                className="mb-0"
                                                            >
                                                                <strong>
                                                                    {
                                                                        item.label
                                                                    }
                                                                </strong>
                                                            </label>
                                                        </td>

                                                        <td>
                                                            <code>
                                                                {
                                                                    item.component
                                                                }
                                                            </code>
                                                        </td>

                                                        <td>
                                                            {
                                                                item.required ? (
                                                                    <span className="badge text-bg-primary">
                                                                        Pflichtbereich
                                                                    </span>
                                                                ) : item.enabled ? (
                                                                    <span className="badge text-bg-success">
                                                                        Sichtbar
                                                                    </span>
                                                                ) : (
                                                                    <span className="badge text-bg-secondary">
                                                                        Ausgeblendet
                                                                    </span>
                                                                )
                                                            }
                                                        </td>

                                                        <td>
                                                            <div className="d-flex gap-2">
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="secondary"
                                                                    disabled={
                                                                        busy ||
                                                                        index ===
                                                                            0
                                                                    }
                                                                    onClick={
                                                                        () =>
                                                                            moveItem(
                                                                                item.id,
                                                                                -1
                                                                            )
                                                                    }
                                                                >
                                                                    ↑
                                                                </Button>

                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="secondary"
                                                                    disabled={
                                                                        busy ||
                                                                        index ===
                                                                            orderedItems.length -
                                                                            1
                                                                    }
                                                                    onClick={
                                                                        () =>
                                                                            moveItem(
                                                                                item.id,
                                                                                1
                                                                            )
                                                                    }
                                                                >
                                                                    ↓
                                                                </Button>
                                                            </div>
                                                        </td>

                                                        <td>
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="secondary"
                                                                disabled={
                                                                    busy ||
                                                                    !item.enabled
                                                                }
                                                                onClick={
                                                                    () =>
                                                                        openSection(
                                                                            item
                                                                        )
                                                                }
                                                            >
                                                                Ansehen
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                )
                                            )
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </fieldset>

                        <div className="d-flex flex-wrap gap-2 mt-4">
                            <Button
                                type="submit"
                                disabled={
                                    busy ||
                                    !hasUnsavedChanges
                                }
                            >
                                {
                                    saving ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm"
                                                aria-hidden="true"
                                            />

                                            Wird gespeichert …
                                        </>
                                    ) : (
                                        <>
                                            <i
                                                className="bi bi-database-check"
                                                aria-hidden="true"
                                            />

                                            Layout speichern
                                        </>
                                    )
                                }
                            </Button>

                            <Button
                                type="button"
                                variant="secondary"
                                disabled={
                                    busy
                                }
                                onClick={
                                    restoreDefaults
                                }
                            >
                                {
                                    resetting ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm"
                                                aria-hidden="true"
                                            />

                                            Wird zurückgesetzt …
                                        </>
                                    ) : (
                                        "Standardreihenfolge"
                                    )
                                }
                            </Button>
                        </div>
                    </form>
                )
            }
        </AdminPage>
    );
}