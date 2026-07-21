import {
    useMemo,
    useState
} from "react";

import AdminPage from "../components/AdminPage";

import Button from "@shared/ui/Button";

import {
    getPages
} from "@cms/modules/pages/services/pageService";

import {
    getSiteNavigation,
    resetSiteNavigation,
    updateSiteNavigation
} from "@shared/navigation/SiteNavigationService";

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

function createId(prefix = "nav") {
    if (globalThis.crypto?.randomUUID) {
        return `${prefix}-${globalThis.crypto.randomUUID()}`;
    }

    return `${prefix}-${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}`;
}

function getChildren(
    items,
    parentId
) {
    return items
        .filter(
            (item) =>
                item.parentId === parentId
        )
        .sort(
            (
                firstItem,
                secondItem
            ) =>
                firstItem.order -
                secondItem.order
        );
}

function flattenNavigation(
    items,
    parentId = null,
    depth = 0,
    visited = new Set()
) {
    const result = [];

    const children =
        getChildren(
            items,
            parentId
        );

    children.forEach((item) => {
        if (visited.has(item.id)) {
            return;
        }

        const nextVisited =
            new Set(visited);

        nextVisited.add(item.id);

        result.push({
            item,
            depth
        });

        result.push(
            ...flattenNavigation(
                items,
                item.id,
                depth + 1,
                nextVisited
            )
        );
    });

    return result;
}

function getDescendantIds(
    items,
    itemId
) {
    const descendants =
        new Set();

    function collect(parentId) {
        items
            .filter(
                (item) =>
                    item.parentId ===
                    parentId
            )
            .forEach((child) => {
                if (
                    descendants.has(
                        child.id
                    )
                ) {
                    return;
                }

                descendants.add(
                    child.id
                );

                collect(child.id);
            });
    }

    collect(itemId);

    return descendants;
}

function getPageHref(page) {
    const slug =
        String(
            page.slug ?? ""
        )
            .trim()
            .replace(/^\/+/, "");

    return slug
        ? `/${slug}`
        : "/";
}

export default function Settings() {
    const [
        navigation,
        setNavigation
    ] = useState(
        () => getSiteNavigation()
    );

    const [
        message,
        setMessage
    ] = useState("");

    const publishedPages =
        useMemo(
            () =>
                getPages()
                    .filter(
                        (page) =>
                            page.status ===
                            "published"
                    )
                    .sort(
                        (
                            firstPage,
                            secondPage
                        ) =>
                            firstPage.title.localeCompare(
                                secondPage.title,
                                "de"
                            )
                    ),
            []
        );

    const flattenedItems =
        useMemo(
            () =>
                flattenNavigation(
                    navigation.items
                ),
            [navigation.items]
        );

    const availablePublishedPages =
        useMemo(
            () =>
                publishedPages.filter(
                    (page) =>
                        !navigation.items.some(
                            (item) =>
                                item.source ===
                                    "page" &&
                                item.sourceId ===
                                    page.id
                        )
                ),
            [
                navigation.items,
                publishedPages
            ]
        );

    function updateNavigationItem(
        itemId,
        field,
        value
    ) {
        setNavigation(
            (currentNavigation) => ({
                ...currentNavigation,

                items:
                    currentNavigation.items.map(
                        (item) =>
                            item.id === itemId
                                ? {
                                    ...item,
                                    [field]: value
                                }
                                : item
                    )
            })
        );

        setMessage("");
    }

    function updateCta(
        field,
        value
    ) {
        setNavigation(
            (currentNavigation) => ({
                ...currentNavigation,

                cta: {
                    ...currentNavigation.cta,
                    [field]: value
                }
            })
        );

        setMessage("");
    }

    function addCustomLink() {
        const rootItems =
            navigation.items.filter(
                (item) =>
                    !item.parentId
            );

        const highestOrder =
            Math.max(
                0,
                ...rootItems.map(
                    (item) =>
                        Number(item.order) ||
                        0
                )
            );

        const newItem = {
            id: createId("custom"),
            label: "Neuer Link",
            href: "",
            enabled: false,
            target: "_self",
            order:
                highestOrder + 10,
            parentId: null,
            source: "custom",
            sourceId: null,
            removable: true
        };

        setNavigation(
            (currentNavigation) => ({
                ...currentNavigation,

                items: [
                    ...currentNavigation.items,
                    newItem
                ]
            })
        );

        setMessage("");
    }

    function addPublishedPage(page) {
        const rootItems =
            navigation.items.filter(
                (item) =>
                    !item.parentId
            );

        const highestOrder =
            Math.max(
                0,
                ...rootItems.map(
                    (item) =>
                        Number(item.order) ||
                        0
                )
            );

        const newItem = {
            id: createId("page"),
            label:
                page.title ||
                "Neue Seite",
            href:
                getPageHref(page),
            enabled: true,
            target: "_self",
            order:
                highestOrder + 10,
            parentId: null,
            source: "page",
            sourceId: page.id,
            removable: true
        };

        setNavigation(
            (currentNavigation) => ({
                ...currentNavigation,

                items: [
                    ...currentNavigation.items,
                    newItem
                ]
            })
        );

        setMessage("");
    }

    function removeItem(itemId) {
        const item =
            navigation.items.find(
                (navigationItem) =>
                    navigationItem.id ===
                    itemId
            );

        if (
            !item ||
            !item.removable
        ) {
            return;
        }

        if (
            !globalThis.confirm(
                `„${item.label}“ aus der Navigation entfernen?`
            )
        ) {
            return;
        }

        setNavigation(
            (currentNavigation) => ({
                ...currentNavigation,

                items:
                    currentNavigation.items
                        .filter(
                            (
                                navigationItem
                            ) =>
                                navigationItem.id !==
                                itemId
                        )
                        .map(
                            (
                                navigationItem
                            ) =>
                                navigationItem.parentId ===
                                itemId
                                    ? {
                                        ...navigationItem,
                                        parentId:
                                            item.parentId ??
                                            null
                                    }
                                    : navigationItem
                        )
            })
        );

        setMessage("");
    }

    function moveItem(
        itemId,
        direction
    ) {
        setNavigation(
            (currentNavigation) => {
                const currentItem =
                    currentNavigation.items.find(
                        (item) =>
                            item.id ===
                            itemId
                    );

                if (!currentItem) {
                    return currentNavigation;
                }

                const siblingItems =
                    currentNavigation.items
                        .filter(
                            (item) =>
                                item.parentId ===
                                currentItem.parentId
                        )
                        .sort(
                            (
                                firstItem,
                                secondItem
                            ) =>
                                firstItem.order -
                                secondItem.order
                        );

                const currentIndex =
                    siblingItems.findIndex(
                        (item) =>
                            item.id === itemId
                    );

                const nextIndex =
                    currentIndex +
                    direction;

                if (
                    currentIndex === -1 ||
                    nextIndex < 0 ||
                    nextIndex >=
                        siblingItems.length
                ) {
                    return currentNavigation;
                }

                [
                    siblingItems[currentIndex],
                    siblingItems[nextIndex]
                ] = [
                    siblingItems[nextIndex],
                    siblingItems[currentIndex]
                ];

                const nextOrders =
                    new Map(
                        siblingItems.map(
                            (
                                item,
                                index
                            ) => [
                                item.id,
                                (index + 1) *
                                    10
                            ]
                        )
                    );

                return {
                    ...currentNavigation,

                    items:
                        currentNavigation.items.map(
                            (item) =>
                                nextOrders.has(
                                    item.id
                                )
                                    ? {
                                        ...item,
                                        order:
                                            nextOrders.get(
                                                item.id
                                            )
                                    }
                                    : item
                        )
                };
            }
        );

        setMessage("");
    }

    function getAvailableParents(
        itemId
    ) {
        const descendants =
            getDescendantIds(
                navigation.items,
                itemId
            );

        return navigation.items
            .filter(
                (item) =>
                    item.id !== itemId &&
                    !descendants.has(
                        item.id
                    )
            )
            .sort(
                (
                    firstItem,
                    secondItem
                ) =>
                    firstItem.label.localeCompare(
                        secondItem.label,
                        "de"
                    )
            );
    }

    function saveSettings(event) {
        event.preventDefault();

        const savedNavigation =
            updateSiteNavigation(
                navigation
            );

        setNavigation(
            cloneValue(
                savedNavigation
            )
        );

        setMessage(
            "Navigation wurde gespeichert."
        );
    }

    function restoreDefaults() {
        if (
            !globalThis.confirm(
                "Navigation auf die Standardwerte zurücksetzen?"
            )
        ) {
            return;
        }

        const defaultNavigation =
            resetSiteNavigation();

        setNavigation(
            cloneValue(
                defaultNavigation
            )
        );

        setMessage(
            "Standardnavigation wurde wiederhergestellt."
        );
    }

    return (
        <AdminPage
            title="Einstellungen"
            description="Navigation, Dropdown-Menüs und Aktionsbutton konfigurieren."
        >
            {
                message && (
                    <div className="alert alert-success">
                        {message}
                    </div>
                )
            }

            <form onSubmit={saveSettings}>
                <section className="mb-5">
                    <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                        <div>
                            <h2>
                                Hauptnavigation
                            </h2>

                            <p className="text-secondary mb-0">
                                Weise Seiten einem übergeordneten Menüpunkt zu,
                                um Dropdown-Menüs zu erstellen.
                            </p>
                        </div>

                        <Button
                            type="button"
                            onClick={addCustomLink}
                        >
                            + Eigener Link
                        </Button>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-dark table-hover align-middle">
                            <thead>
                                <tr>
                                    <th>Aktiv</th>
                                    <th>Bezeichnung</th>
                                    <th>Ziel</th>
                                    <th>Übergeordnet</th>
                                    <th>Fenster</th>
                                    <th>Reihenfolge</th>
                                    <th>Aktionen</th>
                                </tr>
                            </thead>

                            <tbody>
                                {
                                    flattenedItems.map(
                                        ({
                                            item,
                                            depth
                                        }) => {
                                            const siblings =
                                                navigation.items
                                                    .filter(
                                                        (
                                                            sibling
                                                        ) =>
                                                            sibling.parentId ===
                                                            item.parentId
                                                    )
                                                    .sort(
                                                        (
                                                            firstSibling,
                                                            secondSibling
                                                        ) =>
                                                            firstSibling.order -
                                                            secondSibling.order
                                                    );

                                            const siblingIndex =
                                                siblings.findIndex(
                                                    (
                                                        sibling
                                                    ) =>
                                                        sibling.id ===
                                                        item.id
                                                );

                                            return (
                                                <tr key={item.id}>
                                                    <td>
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            checked={
                                                                item.enabled
                                                            }
                                                            onChange={
                                                                (
                                                                    event
                                                                ) =>
                                                                    updateNavigationItem(
                                                                        item.id,
                                                                        "enabled",
                                                                        event
                                                                            .target
                                                                            .checked
                                                                    )
                                                            }
                                                        />
                                                    </td>

                                                    <td>
                                                        <div
                                                            style={{
                                                                paddingLeft:
                                                                    `${depth * 24}px`
                                                            }}
                                                        >
                                                            {
                                                                depth >
                                                                    0 && (
                                                                    <span className="text-secondary me-2">
                                                                        ↳
                                                                    </span>
                                                                )
                                                            }

                                                            <input
                                                                className="form-control d-inline-block"
                                                                style={{
                                                                    width:
                                                                        "calc(100% - 30px)"
                                                                }}
                                                                value={
                                                                    item.label
                                                                }
                                                                onChange={
                                                                    (
                                                                        event
                                                                    ) =>
                                                                        updateNavigationItem(
                                                                            item.id,
                                                                            "label",
                                                                            event
                                                                                .target
                                                                                .value
                                                                        )
                                                                }
                                                            />
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <input
                                                            className="form-control"
                                                            value={
                                                                item.href
                                                            }
                                                            placeholder="/seite oder https://…"
                                                            onChange={
                                                                (
                                                                    event
                                                                ) =>
                                                                    updateNavigationItem(
                                                                        item.id,
                                                                        "href",
                                                                        event
                                                                            .target
                                                                            .value
                                                                    )
                                                            }
                                                        />
                                                    </td>

                                                    <td>
                                                        <select
                                                            className="form-select"
                                                            value={
                                                                item.parentId ??
                                                                ""
                                                            }
                                                            onChange={
                                                                (
                                                                    event
                                                                ) =>
                                                                    updateNavigationItem(
                                                                        item.id,
                                                                        "parentId",
                                                                        event
                                                                            .target
                                                                            .value ||
                                                                            null
                                                                    )
                                                            }
                                                        >
                                                            <option value="">
                                                                Hauptebene
                                                            </option>

                                                            {
                                                                getAvailableParents(
                                                                    item.id
                                                                ).map(
                                                                    (
                                                                        parent
                                                                    ) => (
                                                                        <option
                                                                            key={
                                                                                parent.id
                                                                            }
                                                                            value={
                                                                                parent.id
                                                                            }
                                                                        >
                                                                            {
                                                                                parent.label
                                                                            }
                                                                        </option>
                                                                    )
                                                                )
                                                            }
                                                        </select>
                                                    </td>

                                                    <td>
                                                        <select
                                                            className="form-select"
                                                            value={
                                                                item.target
                                                            }
                                                            onChange={
                                                                (
                                                                    event
                                                                ) =>
                                                                    updateNavigationItem(
                                                                        item.id,
                                                                        "target",
                                                                        event
                                                                            .target
                                                                            .value
                                                                    )
                                                            }
                                                        >
                                                            <option value="_self">
                                                                Gleiches Fenster
                                                            </option>

                                                            <option value="_blank">
                                                                Neues Fenster
                                                            </option>
                                                        </select>
                                                    </td>

                                                    <td>
                                                        <div className="d-flex gap-2">
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="secondary"
                                                                disabled={
                                                                    siblingIndex ===
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
                                                                    siblingIndex ===
                                                                    siblings.length -
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
                                                        {
                                                            item.removable ? (
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="secondary"
                                                                    onClick={() =>
                                                                        removeItem(
                                                                            item.id
                                                                        )
                                                                    }
                                                                >
                                                                    Entfernen
                                                                </Button>
                                                            ) : (
                                                                <span className="badge text-bg-secondary">
                                                                    Website
                                                                </span>
                                                            )
                                                        }
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )
                                }
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="mb-5">
                    <div className="mb-3">
                        <h2>
                            Veröffentlichte Seiten
                        </h2>

                        <p className="text-secondary mb-0">
                            Veröffentlichte Builder-Seiten können direkt zur
                            Navigation hinzugefügt werden.
                        </p>
                    </div>

                    {
                        publishedPages.length === 0 && (
                            <div className="alert alert-secondary">
                                Es existieren noch keine veröffentlichten
                                Builder-Seiten.
                            </div>
                        )
                    }

                    {
                        publishedPages.length > 0 && (
                            <div className="table-responsive">
                                <table className="table table-dark table-hover align-middle">
                                    <thead>
                                        <tr>
                                            <th>Seite</th>
                                            <th>Adresse</th>
                                            <th>Status</th>
                                            <th>Aktion</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {
                                            publishedPages.map(
                                                (page) => {
                                                    const alreadyAdded =
                                                        navigation.items.some(
                                                            (
                                                                item
                                                            ) =>
                                                                item.source ===
                                                                    "page" &&
                                                                item.sourceId ===
                                                                    page.id
                                                        );

                                                    return (
                                                        <tr key={page.id}>
                                                            <td>
                                                                {page.title}
                                                            </td>

                                                            <td>
                                                                <code>
                                                                    {
                                                                        getPageHref(
                                                                            page
                                                                        )
                                                                    }
                                                                </code>
                                                            </td>

                                                            <td>
                                                                <span className="badge text-bg-success">
                                                                    Veröffentlicht
                                                                </span>
                                                            </td>

                                                            <td>
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    disabled={
                                                                        alreadyAdded
                                                                    }
                                                                    onClick={() =>
                                                                        addPublishedPage(
                                                                            page
                                                                        )
                                                                    }
                                                                >
                                                                    {
                                                                        alreadyAdded
                                                                            ? "Bereits hinzugefügt"
                                                                            : "Zur Navigation"
                                                                    }
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    );
                                                }
                                            )
                                        }
                                    </tbody>
                                </table>
                            </div>
                        )
                    }
                </section>

                <section className="mb-5">
                    <div className="mb-3">
                        <h2>
                            Aktionsbutton
                        </h2>

                        <p className="text-secondary mb-0">
                            Der hervorgehobene Button rechts in der Navigation.
                        </p>
                    </div>

                    <div className="card bg-dark border-secondary">
                        <div className="card-body">
                            <div className="form-check mb-3">
                                <input
                                    id="navigation-cta-enabled"
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={
                                        navigation.cta.enabled
                                    }
                                    onChange={(event) =>
                                        updateCta(
                                            "enabled",
                                            event.target.checked
                                        )
                                    }
                                />

                                <label
                                    className="form-check-label"
                                    htmlFor="navigation-cta-enabled"
                                >
                                    Aktionsbutton anzeigen
                                </label>
                            </div>

                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">
                                        Bezeichnung
                                    </label>

                                    <input
                                        className="form-control"
                                        value={
                                            navigation.cta.label
                                        }
                                        onChange={(event) =>
                                            updateCta(
                                                "label",
                                                event.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div className="col-md-5 mb-3">
                                    <label className="form-label">
                                        Ziel
                                    </label>

                                    <input
                                        className="form-control"
                                        value={
                                            navigation.cta.href
                                        }
                                        onChange={(event) =>
                                            updateCta(
                                                "href",
                                                event.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div className="col-md-3 mb-3">
                                    <label className="form-label">
                                        Öffnen
                                    </label>

                                    <select
                                        className="form-select"
                                        value={
                                            navigation.cta.target
                                        }
                                        onChange={(event) =>
                                            updateCta(
                                                "target",
                                                event.target.value
                                            )
                                        }
                                    >
                                        <option value="_self">
                                            Gleiches Fenster
                                        </option>

                                        <option value="_blank">
                                            Neues Fenster
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="d-flex flex-wrap gap-2">
                    <Button type="submit">
                        Navigation speichern
                    </Button>

                    <Button
                        type="button"
                        variant="secondary"
                        onClick={restoreDefaults}
                    >
                        Standardwerte
                    </Button>
                </div>
            </form>
        </AdminPage>
    );
}