import {
    useMemo,
    useState
} from "react";

import AdminPage from "../components/AdminPage";

import Button from "@shared/ui/Button";

import {
    getHomeLayout,
    resetHomeLayout,
    updateHomeLayout
} from "@shared/layout/homeLayoutService";

function cloneValue(value) {
    if (
        typeof globalThis.structuredClone ===
        "function"
    ) {
        return globalThis.structuredClone(value);
    }

    return JSON.parse(
        JSON.stringify(value)
    );
}

function serializeValue(value) {
    return JSON.stringify(value);
}

export default function HomeLayout() {
    const initialLayout =
        useMemo(
            () => getHomeLayout(),
            []
        );

    const [
        layout,
        setLayout
    ] = useState(
        () =>
            cloneValue(
                initialLayout
            )
    );

    const [
        savedLayout,
        setSavedLayout
    ] = useState(
        () =>
            cloneValue(
                initialLayout
            )
    );

    const [
        message,
        setMessage
    ] = useState("");

    const hasUnsavedChanges =
        useMemo(
            () =>
                serializeValue(layout) !==
                serializeValue(
                    savedLayout
                ),
            [
                layout,
                savedLayout
            ]
        );

    function toggleItem(
        itemId,
        enabled
    ) {
        setLayout(
            (currentLayout) => ({
                ...currentLayout,

                items:
                    currentLayout.items.map(
                        (item) => {
                            if (
                                item.id !==
                                itemId
                            ) {
                                return item;
                            }

                            if (item.required) {
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

        setMessage("");
    }

    function moveItem(
        itemId,
        direction
    ) {
        setLayout(
            (currentLayout) => {
                const items = [
                    ...currentLayout.items
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
                    currentIndex === -1 ||
                    nextIndex < 0 ||
                    nextIndex >=
                        items.length
                ) {
                    return currentLayout;
                }

                [
                    items[currentIndex],
                    items[nextIndex]
                ] = [
                    items[nextIndex],
                    items[currentIndex]
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

        setMessage("");
    }

    function saveLayout(event) {
        event.preventDefault();

        const saved =
            updateHomeLayout(
                layout
            );

        setLayout(
            cloneValue(saved)
        );

        setSavedLayout(
            cloneValue(saved)
        );

        setMessage(
            "Startseiten-Layout wurde gespeichert."
        );
    }

    function restoreDefaults() {
        if (
            !globalThis.confirm(
                "Startseiten-Layout auf die Standardwerte zurücksetzen?"
            )
        ) {
            return;
        }

        const defaults =
            resetHomeLayout();

        setLayout(
            cloneValue(defaults)
        );

        setSavedLayout(
            cloneValue(defaults)
        );

        setMessage(
            "Standardreihenfolge wurde wiederhergestellt."
        );
    }

    function openHomepage() {
        globalThis.window.open(
            "/",
            "_blank",
            "noopener,noreferrer"
        );
    }

    function openSection(item) {
        globalThis.window.open(
            item.route,
            "_blank",
            "noopener,noreferrer"
        );
    }

    const orderedItems =
        [...layout.items].sort(
            (
                firstItem,
                secondItem
            ) =>
                firstItem.order -
                secondItem.order
        );

    return (
        <AdminPage
            title="Startseiten-Layout"
            description="Bereiche der Startseite aktivieren und in die gewünschte Reihenfolge bringen."
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

            <form onSubmit={saveLayout}>
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
                                                        item.enabled
                                                    }
                                                    disabled={
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
                                                            index ===
                                                            0
                                                        }
                                                        onClick={() =>
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
                                                            index ===
                                                            orderedItems.length -
                                                                1
                                                        }
                                                        onClick={() =>
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
                                                        !item.enabled
                                                    }
                                                    onClick={() =>
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

                <div className="d-flex flex-wrap gap-2 mt-4">
                    <Button
                        type="submit"
                        disabled={
                            !hasUnsavedChanges
                        }
                    >
                        Layout speichern
                    </Button>

                    <Button
                        type="button"
                        variant="secondary"
                        onClick={
                            restoreDefaults
                        }
                    >
                        Standardreihenfolge
                    </Button>
                </div>
            </form>
        </AdminPage>
    );
}