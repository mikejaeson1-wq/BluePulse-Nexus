import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import AdminPage from "@cms/modules/dashboard/admin/components/AdminPage";

import Button from "@shared/ui/Button";

import MediaField from "@cms/modules/pages/components/MediaField";

import {
    getWebsiteStructureItem
} from "@shared/constants/siteStructure";

import {
    getSiteContentSchema
} from "@shared/content/siteContentSchemas";

import {
    extendSiteContentSchema
} from "@shared/content/siteContentSchemaExtensions";

import {
    getSiteContentRepository
} from "@shared/data/repositories";

const siteContentRepository =
    getSiteContentRepository();

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

function Field({
    field,
    value,
    onChange,
    inputId,
    disabled = false
}) {
    const width =
        field.width ?? 12;

    function handleChange(event) {
        if (
            field.type ===
            "number"
        ) {
            const nextValue =
                event.target.value === ""
                    ? 0
                    : Number(
                        event.target.value
                    );

            onChange(nextValue);

            return;
        }

        onChange(
            event.target.value
        );
    }

    return (
        <div
            className={
                `col-md-${width} mb-3`
            }
        >
            <label
                className="form-label"
                htmlFor={
                    field.type ===
                    "media"
                        ? undefined
                        : inputId
                }
            >
                {field.label}
            </label>

            {
                field.type ===
                    "media" && (
                    <MediaField
                        value={
                            value ?? ""
                        }
                        onChange={
                            onChange
                        }
                        disabled={
                            disabled
                        }
                    />
                )
            }

            {
                field.type ===
                    "textarea" && (
                    <textarea
                        id={
                            inputId
                        }
                        className="form-control"
                        rows={
                            field.rows ??
                            4
                        }
                        value={
                            value ?? ""
                        }
                        placeholder={
                            field.placeholder ??
                            ""
                        }
                        disabled={
                            disabled
                        }
                        onChange={
                            handleChange
                        }
                    />
                )
            }

            {
                field.type !==
                    "media" &&
                field.type !==
                    "textarea" && (
                    <input
                        id={
                            inputId
                        }
                        type={
                            field.type ===
                            "number"
                                ? "number"
                                : "text"
                        }
                        className="form-control"
                        value={
                            value ?? ""
                        }
                        placeholder={
                            field.placeholder ??
                            ""
                        }
                        disabled={
                            disabled
                        }
                        onChange={
                            handleChange
                        }
                    />
                )
            }
        </div>
    );
}

function FieldGroup({
    fields,
    values,
    onChange,
    inputPrefix,
    disabled = false
}) {
    return (
        <div className="row">
            {
                fields.map(
                    (field) => (
                        <Field
                            key={
                                field.key
                            }
                            field={
                                field
                            }
                            value={
                                values[
                                    field.key
                                ]
                            }
                            inputId={
                                `${inputPrefix}-${field.key}`
                            }
                            disabled={
                                disabled
                            }
                            onChange={
                                (value) =>
                                    onChange(
                                        field.key,
                                        value
                                    )
                            }
                        />
                    )
                )
            }
        </div>
    );
}

function CollectionEditor({
    collection,
    items,
    onItemChange,
    onAddItem,
    onRemoveItem,
    disabled = false
}) {
    const minimumItems =
        collection.minItems ??
        0;

    return (
        <section className="mt-4">
            <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
                <h3 className="mb-0">
                    {
                        collection.label
                    }
                </h3>

                <Button
                    type="button"
                    size="sm"
                    disabled={
                        disabled
                    }
                    onClick={
                        onAddItem
                    }
                >
                    {
                        collection.addLabel
                    }
                </Button>
            </div>

            {
                items.length ===
                    0 && (
                    <div className="alert alert-secondary">
                        Noch keine Einträge vorhanden.
                    </div>
                )
            }

            {
                items.map(
                    (
                        item,
                        index
                    ) => (
                        <article
                            key={
                                item.id ??
                                index
                            }
                            className="card bg-dark border-secondary mb-3"
                        >
                            <div className="card-body">
                                <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
                                    <strong>
                                        {
                                            collection.itemLabel
                                        }{" "}
                                        {
                                            index +
                                            1
                                        }
                                    </strong>

                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="secondary"
                                        disabled={
                                            disabled ||
                                            items.length <=
                                                minimumItems
                                        }
                                        onClick={
                                            () =>
                                                onRemoveItem(
                                                    index
                                                )
                                        }
                                    >
                                        Entfernen
                                    </Button>
                                </div>

                                <FieldGroup
                                    fields={
                                        collection.fields
                                    }
                                    values={
                                        item
                                    }
                                    inputPrefix={
                                        `${collection.key}-${index}`
                                    }
                                    disabled={
                                        disabled
                                    }
                                    onChange={
                                        (
                                            field,
                                            value
                                        ) =>
                                            onItemChange(
                                                index,
                                                field,
                                                value
                                            )
                                    }
                                />
                            </div>
                        </article>
                    )
                )
            }
        </section>
    );
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
                Website-Inhalte werden aus Nexus geladen …
            </span>
        </div>
    );
}

export default function WebsiteSectionEditor() {
    const navigate =
        useNavigate();

    const {
        sectionId
    } =
        useParams();

    const structureItem =
        useMemo(
            () =>
                getWebsiteStructureItem(
                    sectionId
                ),
            [
                sectionId
            ]
        );

    const contentKey =
        structureItem
            ?.contentKey ??
        null;

    const schema =
        useMemo(
            () => {
                if (!contentKey) {
                    return null;
                }

                const baseSchema =
                    getSiteContentSchema(
                        contentKey
                    );

                return extendSiteContentSchema(
                    contentKey,
                    baseSchema
                );
            },
            [
                contentKey
            ]
        );

    const [
        content,
        setContent
    ] =
        useState(null);

    const [
        savedContent,
        setSavedContent
    ] =
        useState(null);

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
                content !== null &&
                savedContent !==
                    null &&
                serializeValue(
                    content
                ) !==
                    serializeValue(
                        savedContent
                    ),
            [
                content,
                savedContent
            ]
        );

    useEffect(() => {
        let active =
            true;

        const controller =
            new AbortController();

        async function loadContent() {
            setMessage("");
            setError("");

            if (!contentKey) {
                if (active) {
                    setContent(null);
                    setSavedContent(
                        null
                    );
                    setLoading(
                        false
                    );
                }

                return;
            }

            setLoading(true);

            try {
                const loadedContent =
                    await siteContentRepository
                        .getSection(
                            contentKey,
                            {
                                signal:
                                    controller
                                        .signal
                            }
                        );

                if (
                    !active ||
                    controller.signal
                        .aborted
                ) {
                    return;
                }

                const nextContent =
                    loadedContent
                        ? cloneValue(
                            loadedContent
                        )
                        : null;

                setContent(
                    nextContent
                );

                setSavedContent(
                    nextContent
                        ? cloneValue(
                            nextContent
                        )
                        : null
                );
            } catch (
                loadError
            ) {
                if (
                    loadError?.name ===
                        "AbortError" ||
                    controller.signal
                        .aborted
                ) {
                    return;
                }

                if (active) {
                    setContent(
                        null
                    );

                    setSavedContent(
                        null
                    );

                    setError(
                        loadError.message ??
                        "Die Website-Inhalte konnten nicht geladen werden."
                    );
                }
            } finally {
                if (
                    active &&
                    !controller.signal
                        .aborted
                ) {
                    setLoading(
                        false
                    );
                }
            }
        }

        loadContent();

        return () => {
            active =
                false;

            controller.abort();
        };
    }, [
        contentKey
    ]);

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

        globalThis.window
            .addEventListener(
                "beforeunload",
                handleBeforeUnload
            );

        return () => {
            globalThis.window
                .removeEventListener(
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

    function changeField(
        field,
        value
    ) {
        setContent(
            (
                currentContent
            ) => ({
                ...currentContent,
                [field]:
                    value
            })
        );

        clearFeedback();
    }

    function changeCollectionItem(
        collectionKey,
        index,
        field,
        value
    ) {
        setContent(
            (
                currentContent
            ) => ({
                ...currentContent,

                [collectionKey]:
                    (
                        currentContent[
                            collectionKey
                        ] ?? []
                    ).map(
                        (
                            item,
                            itemIndex
                        ) =>
                            itemIndex ===
                            index
                                ? {
                                    ...item,
                                    [field]:
                                        value
                                }
                                : item
                    )
            })
        );

        clearFeedback();
    }

    function addCollectionItem(
        collection
    ) {
        const newItem =
            collection
                .createItem();

        setContent(
            (
                currentContent
            ) => ({
                ...currentContent,

                [collection.key]: [
                    ...(
                        currentContent[
                            collection
                                .key
                        ] ?? []
                    ),
                    newItem
                ]
            })
        );

        clearFeedback();
    }

    function removeCollectionItem(
        collection,
        index
    ) {
        const items =
            content[
                collection.key
            ] ?? [];

        if (
            items.length <=
            (
                collection.minItems ??
                0
            )
        ) {
            return;
        }

        setContent(
            (
                currentContent
            ) => ({
                ...currentContent,

                [collection.key]:
                    (
                        currentContent[
                            collection
                                .key
                        ] ?? []
                    ).filter(
                        (
                            _,
                            itemIndex
                        ) =>
                            itemIndex !==
                            index
                    )
            })
        );

        clearFeedback();
    }

    async function saveContent(
        event
    ) {
        event.preventDefault();

        if (
            !contentKey ||
            !content ||
            !hasUnsavedChanges ||
            busy
        ) {
            return;
        }

        setSaving(true);
        setMessage("");
        setError("");

        try {
            const saved =
                await siteContentRepository
                    .updateSection(
                        contentKey,
                        content
                    );

            const nextContent =
                cloneValue(
                    saved
                );

            setContent(
                nextContent
            );

            setSavedContent(
                cloneValue(
                    nextContent
                )
            );

            setMessage(
                "Änderungen wurden in PostgreSQL gespeichert."
            );
        } catch (
            saveError
        ) {
            setError(
                saveError.message ??
                "Die Änderungen konnten nicht gespeichert werden."
            );
        } finally {
            setSaving(false);
        }
    }

    async function resetContent() {
        if (
            !contentKey ||
            busy
        ) {
            return;
        }

        if (
            !globalThis.confirm(
                "Diesen Bereich in PostgreSQL auf die Standardwerte zurücksetzen?"
            )
        ) {
            return;
        }

        setResetting(true);
        setMessage("");
        setError("");

        try {
            const defaults =
                await siteContentRepository
                    .resetSection(
                        contentKey
                    );

            const nextContent =
                cloneValue(
                    defaults
                );

            setContent(
                nextContent
            );

            setSavedContent(
                cloneValue(
                    nextContent
                )
            );

            setMessage(
                "Standardwerte wurden in PostgreSQL wiederhergestellt."
            );
        } catch (
            resetError
        ) {
            setError(
                resetError.message ??
                "Die Standardwerte konnten nicht wiederhergestellt werden."
            );
        } finally {
            setResetting(false);
        }
    }

    function goBack() {
        if (
            hasUnsavedChanges &&
            !globalThis.confirm(
                "Ungespeicherte Änderungen verwerfen?"
            )
        ) {
            return;
        }

        navigate(
            "/admin/pages"
        );
    }

    function openWebsiteSection() {
        globalThis.window.open(
            structureItem.route,
            "_blank",
            "noopener,noreferrer"
        );
    }

    const isConfigured =
        Boolean(
            structureItem
                ?.editable &&
            contentKey &&
            schema
        );

    if (
        loading &&
        isConfigured
    ) {
        return (
            <AdminPage
                title={
                    structureItem
                        ? `${structureItem.title} bearbeiten`
                        : "Website-Bereich"
                }
                description="Website-Inhalte werden aus PostgreSQL geladen."
                action={
                    <Button
                        onClick={
                            goBack
                        }
                    >
                        ← Zurück
                    </Button>
                }
            >
                <LoadingState />
            </AdminPage>
        );
    }

    if (
        !isConfigured
    ) {
        return (
            <AdminPage
                title="Bereich nicht bearbeitbar"
                description="Für diesen Website-Bereich existiert noch kein Inhaltseditor."
                action={
                    <Button
                        onClick={
                            goBack
                        }
                    >
                        ← Zurück
                    </Button>
                }
            >
                <p>
                    Der Bereich kann derzeit noch nicht über Nexus bearbeitet werden.
                </p>
            </AdminPage>
        );
    }

    if (
        !content
    ) {
        return (
            <AdminPage
                title={
                    `${structureItem.title} bearbeiten`
                }
                description="Der Website-Inhalt konnte nicht geladen werden."
                action={
                    <Button
                        onClick={
                            goBack
                        }
                    >
                        ← Zurück
                    </Button>
                }
            >
                <div className="alert alert-danger">
                    {
                        error ||
                        "Für diesen Bereich wurden keine Inhalte gefunden."
                    }
                </div>
            </AdminPage>
        );
    }

    return (
        <AdminPage
            title={
                `${structureItem.title} bearbeiten`
            }
            description={
                `Website-Komponente: ${structureItem.component} · Datenquelle: PostgreSQL`
            }
            action={
                <div className="d-flex gap-2">
                    <Button
                        variant="secondary"
                        onClick={
                            openWebsiteSection
                        }
                    >
                        Ansehen
                    </Button>

                    <Button
                        onClick={
                            goBack
                        }
                    >
                        ← Zurück
                    </Button>
                </div>
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

            <form
                onSubmit={
                    saveContent
                }
            >
                <fieldset
                    disabled={
                        busy
                    }
                    className="border-0 p-0 m-0"
                >
                    <section>
                        <h2 className="mb-3">
                            {
                                schema.title
                            }
                        </h2>

                        <FieldGroup
                            fields={
                                schema.fields ??
                                []
                            }
                            values={
                                content
                            }
                            inputPrefix={
                                contentKey
                            }
                            disabled={
                                busy
                            }
                            onChange={
                                changeField
                            }
                        />
                    </section>

                    {
                        (
                            schema.collections ??
                            []
                        ).map(
                            (
                                collection
                            ) => (
                                <CollectionEditor
                                    key={
                                        collection.key
                                    }
                                    collection={
                                        collection
                                    }
                                    items={
                                        content[
                                            collection.key
                                        ] ?? []
                                    }
                                    disabled={
                                        busy
                                    }
                                    onAddItem={
                                        () =>
                                            addCollectionItem(
                                                collection
                                            )
                                    }
                                    onRemoveItem={
                                        (
                                            index
                                        ) =>
                                            removeCollectionItem(
                                                collection,
                                                index
                                            )
                                    }
                                    onItemChange={
                                        (
                                            index,
                                            field,
                                            value
                                        ) =>
                                            changeCollectionItem(
                                                collection.key,
                                                index,
                                                field,
                                                value
                                            )
                                    }
                                />
                            )
                        )
                    }
                </fieldset>

                <div className="d-flex flex-wrap gap-2 mt-4">
                    <Button
                        type="submit"
                        disabled={
                            !hasUnsavedChanges ||
                            busy
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

                                    Änderungen speichern
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
                            resetContent
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
                                "Standardwerte"
                            )
                        }
                    </Button>
                </div>
            </form>
        </AdminPage>
    );
}