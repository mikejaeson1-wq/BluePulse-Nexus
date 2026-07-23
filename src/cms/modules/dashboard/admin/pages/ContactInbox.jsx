import "./ContactInbox.css";

import {
    useEffect,
    useMemo,
    useState
} from "react";

import AdminPage from "../components/AdminPage";

import {
    CONTACT_PAGE_SIZE,
    CONTACT_STATUS_OPTIONS,
    deleteContactMessage,
    getContactMessage,
    getContactOverview,
    getContactStatusDefinition,
    listContactMessages,
    updateContactMessage
} from "@shared/contact/contactService";

const EMPTY_OVERVIEW = {
    total: 0,
    new: 0,
    unread: 0,
    inProgress: 0,
    answered: 0,
    closed: 0,
    spam: 0,
    today: 0
};

function formatDate(
    value
) {
    if (!value) {
        return "—";
    }

    const date =
        new Date(
            value
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "—";
    }

    return date.toLocaleString(
        "de-DE",
        {
            dateStyle:
                "medium",

            timeStyle:
                "short"
        }
    );
}

function createReplyHref(
    message
) {
    if (
        !message?.email
    ) {
        return "#";
    }

    const subject =
        message.subject
            ? `Re: ${message.subject}`
            : "Re: Deine Anfrage an BluePulse";

    return `mailto:${message.email}?subject=${encodeURIComponent(
        subject
    )}`;
}

function OverviewCard({
    icon,
    label,
    value,
    tone = "default",
    active = false,
    onClick
}) {
    return (
        <button
            type="button"
            className={
                [
                    "contact-inbox__overview-card",
                    `contact-inbox__overview-card--${tone}`,
                    active
                        ? "contact-inbox__overview-card--active"
                        : ""
                ]
                    .filter(Boolean)
                    .join(" ")
            }
            onClick={onClick}
        >
            <span>
                <i
                    className={`bi ${icon}`}
                    aria-hidden="true"
                />
            </span>

            <div>
                <strong>
                    {value}
                </strong>

                <small>
                    {label}
                </small>
            </div>
        </button>
    );
}

export default function ContactInbox() {
    const [
        overview,
        setOverview
    ] = useState(
        EMPTY_OVERVIEW
    );

    const [
        messages,
        setMessages
    ] = useState([]);

    const [
        total,
        setTotal
    ] = useState(0);

    const [
        offset,
        setOffset
    ] = useState(0);

    const [
        statusFilter,
        setStatusFilter
    ] = useState("");

    const [
        readFilter,
        setReadFilter
    ] = useState("");

    const [
        searchInput,
        setSearchInput
    ] = useState("");

    const [
        search,
        setSearch
    ] = useState("");

    const [
        selectedId,
        setSelectedId
    ] = useState(null);

    const [
        selectedMessage,
        setSelectedMessage
    ] = useState(null);

    const [
        internalNote,
        setInternalNote
    ] = useState("");

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        detailLoading,
        setDetailLoading
    ] = useState(false);

    const [
        saving,
        setSaving
    ] = useState(false);

    const [
        deleting,
        setDeleting
    ] = useState(false);

    const [
        error,
        setError
    ] = useState("");

    const [
        notice,
        setNotice
    ] = useState("");

    const pageNumber =
        Math.floor(
            offset /
            CONTACT_PAGE_SIZE
        ) + 1;

    const pageCount =
        Math.max(
            Math.ceil(
                total /
                CONTACT_PAGE_SIZE
            ),
            1
        );

    const hasPreviousPage =
        offset > 0;

    const hasNextPage =
        offset +
            CONTACT_PAGE_SIZE <
        total;

    const selectedStatus =
        useMemo(
            () =>
                getContactStatusDefinition(
                    selectedMessage?.status
                ),
            [
                selectedMessage?.status
            ]
        );

    async function loadOverview() {
        const nextOverview =
            await getContactOverview();

        setOverview(
            nextOverview
        );
    }

    async function loadMessages() {
        setLoading(true);
        setError("");

        try {
            const result =
                await listContactMessages({
                    limit:
                        CONTACT_PAGE_SIZE,

                    offset,
                    status:
                        statusFilter,
                    read:
                        readFilter,
                    search
                });

            setMessages(
                result.items
            );

            setTotal(
                result.total
            );

            if (
                selectedId &&
                !result.items.some(
                    (item) =>
                        item.id ===
                        selectedId
                )
            ) {
                setSelectedId(null);
                setSelectedMessage(null);
            }
        } catch (
            loadError
        ) {
            setError(
                loadError?.message ??
                "Die Kontaktanfragen konnten nicht geladen werden."
            );
        } finally {
            setLoading(false);
        }
    }

    async function refreshAll() {
        try {
            await Promise.all([
                loadOverview(),
                loadMessages()
            ]);
        } catch (
            refreshError
        ) {
            setError(
                refreshError?.message ??
                "Das Kontaktpostfach konnte nicht aktualisiert werden."
            );
        }
    }

    useEffect(() => {
        refreshAll();
    }, [
        offset,
        readFilter,
        search,
        statusFilter
    ]);

    async function selectMessage(
        messageId
    ) {
        setSelectedId(messageId);
        setDetailLoading(true);
        setError("");
        setNotice("");

        try {
            let detail =
                await getContactMessage(
                    messageId
                );

            if (!detail.isRead) {
                detail =
                    await updateContactMessage(
                        messageId,
                        {
                            isRead:
                                true
                        }
                    );

                await loadOverview();
            }

            setSelectedMessage(
                detail
            );

            setInternalNote(
                detail.internalNote ??
                ""
            );

            setMessages(
                (
                    currentMessages
                ) =>
                    currentMessages.map(
                        (item) =>
                            item.id ===
                            messageId
                                ? {
                                    ...item,
                                    ...detail
                                }
                                : item
                    )
            );
        } catch (
            detailError
        ) {
            setError(
                detailError?.message ??
                "Die Kontaktanfrage konnte nicht geöffnet werden."
            );
        } finally {
            setDetailLoading(false);
        }
    }

    async function applyPatch(
        patch,
        successMessage
    ) {
        if (
            !selectedMessage ||
            saving
        ) {
            return;
        }

        setSaving(true);
        setError("");
        setNotice("");

        try {
            const updated =
                await updateContactMessage(
                    selectedMessage.id,
                    patch
                );

            setSelectedMessage(
                updated
            );

            setInternalNote(
                updated.internalNote ??
                ""
            );

            setMessages(
                (
                    currentMessages
                ) =>
                    currentMessages.map(
                        (item) =>
                            item.id ===
                            updated.id
                                ? {
                                    ...item,
                                    ...updated
                                }
                                : item
                    )
            );

            setNotice(
                successMessage
            );

            await loadOverview();
        } catch (
            updateError
        ) {
            setError(
                updateError?.message ??
                "Die Kontaktanfrage konnte nicht aktualisiert werden."
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (
            !selectedMessage ||
            deleting
        ) {
            return;
        }

        if (
            !globalThis.confirm(
                `Kontaktanfrage „${selectedMessage.subject}“ wirklich endgültig löschen?`
            )
        ) {
            return;
        }

        setDeleting(true);
        setError("");

        try {
            await deleteContactMessage(
                selectedMessage.id
            );

            setSelectedId(null);
            setSelectedMessage(null);
            setInternalNote("");
            setNotice(
                "Die Kontaktanfrage wurde gelöscht."
            );

            await refreshAll();
        } catch (
            deleteError
        ) {
            setError(
                deleteError?.message ??
                "Die Kontaktanfrage konnte nicht gelöscht werden."
            );
        } finally {
            setDeleting(false);
        }
    }

    function handleSearchSubmit(
        event
    ) {
        event.preventDefault();
        setOffset(0);
        setSearch(
            searchInput.trim()
        );
    }

    function clearFilters() {
        setStatusFilter("");
        setReadFilter("");
        setSearchInput("");
        setSearch("");
        setOffset(0);
    }

    return (
        <AdminPage
            title="Kontaktanfragen"
            description="Nachrichten der BluePulse-Website lesen und bearbeiten."
            action={
                <a
                    className="contact-inbox__website-link"
                    href="/kontakt"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <i
                        className="bi bi-box-arrow-up-right"
                        aria-hidden="true"
                    />

                    Kontaktformular öffnen
                </a>
            }
        >
            <div className="contact-inbox">
                <section
                    className="contact-inbox__overview"
                    aria-label="Übersicht Kontaktanfragen"
                >
                    <OverviewCard
                        icon="bi-inbox"
                        label="Gesamt"
                        value={overview.total}
                        active={
                            !statusFilter &&
                            !readFilter
                        }
                        onClick={clearFilters}
                    />

                    <OverviewCard
                        icon="bi-envelope-exclamation"
                        label="Ungelesen"
                        value={overview.unread}
                        tone="warning"
                        active={
                            readFilter ===
                            "unread"
                        }
                        onClick={
                            () => {
                                setReadFilter(
                                    "unread"
                                );
                                setStatusFilter("");
                                setOffset(0);
                            }
                        }
                    />

                    <OverviewCard
                        icon="bi-stars"
                        label="Neu"
                        value={overview.new}
                        tone="info"
                        active={
                            statusFilter ===
                            "new"
                        }
                        onClick={
                            () => {
                                setStatusFilter(
                                    "new"
                                );
                                setReadFilter("");
                                setOffset(0);
                            }
                        }
                    />

                    <OverviewCard
                        icon="bi-hourglass-split"
                        label="In Bearbeitung"
                        value={overview.inProgress}
                        tone="progress"
                        active={
                            statusFilter ===
                            "in_progress"
                        }
                        onClick={
                            () => {
                                setStatusFilter(
                                    "in_progress"
                                );
                                setReadFilter("");
                                setOffset(0);
                            }
                        }
                    />

                    <OverviewCard
                        icon="bi-reply-fill"
                        label="Beantwortet"
                        value={overview.answered}
                        tone="success"
                        active={
                            statusFilter ===
                            "answered"
                        }
                        onClick={
                            () => {
                                setStatusFilter(
                                    "answered"
                                );
                                setReadFilter("");
                                setOffset(0);
                            }
                        }
                    />

                    <OverviewCard
                        icon="bi-calendar-check"
                        label="Heute"
                        value={overview.today}
                        tone="today"
                        onClick={clearFilters}
                    />
                </section>

                {
                    error && (
                        <div
                            className="contact-inbox__alert contact-inbox__alert--error"
                            role="alert"
                        >
                            <i
                                className="bi bi-exclamation-circle-fill"
                                aria-hidden="true"
                            />

                            {error}
                        </div>
                    )
                }

                {
                    notice && (
                        <div
                            className="contact-inbox__alert contact-inbox__alert--success"
                            role="status"
                        >
                            <i
                                className="bi bi-check-circle-fill"
                                aria-hidden="true"
                            />

                            {notice}
                        </div>
                    )
                }

                <section className="contact-inbox__workspace">
                    <div className="contact-inbox__list-panel">
                        <form
                            className="contact-inbox__filters"
                            onSubmit={handleSearchSubmit}
                        >
                            <div className="contact-inbox__search">
                                <i
                                    className="bi bi-search"
                                    aria-hidden="true"
                                />

                                <input
                                    type="search"
                                    placeholder="Name, E-Mail, Betreff oder Nachricht"
                                    value={searchInput}
                                    onChange={
                                        (event) =>
                                            setSearchInput(
                                                event.target.value
                                            )
                                    }
                                />

                                <button type="submit">
                                    Suchen
                                </button>
                            </div>

                            <div className="contact-inbox__filter-row">
                                <label>
                                    <span>
                                        Status
                                    </span>

                                    <select
                                        value={statusFilter}
                                        onChange={
                                            (event) => {
                                                setStatusFilter(
                                                    event.target.value
                                                );
                                                setOffset(0);
                                            }
                                        }
                                    >
                                        <option value="">
                                            Alle Status
                                        </option>

                                        {
                                            CONTACT_STATUS_OPTIONS.map(
                                                (option) => (
                                                    <option
                                                        key={option.value}
                                                        value={option.value}
                                                    >
                                                        {option.label}
                                                    </option>
                                                )
                                            )
                                        }
                                    </select>
                                </label>

                                <label>
                                    <span>
                                        Lesestatus
                                    </span>

                                    <select
                                        value={readFilter}
                                        onChange={
                                            (event) => {
                                                setReadFilter(
                                                    event.target.value
                                                );
                                                setOffset(0);
                                            }
                                        }
                                    >
                                        <option value="">
                                            Alle Nachrichten
                                        </option>

                                        <option value="unread">
                                            Nur ungelesen
                                        </option>

                                        <option value="read">
                                            Nur gelesen
                                        </option>
                                    </select>
                                </label>

                                <button
                                    type="button"
                                    className="contact-inbox__clear"
                                    onClick={clearFilters}
                                >
                                    <i
                                        className="bi bi-x-circle"
                                        aria-hidden="true"
                                    />

                                    Zurücksetzen
                                </button>
                            </div>
                        </form>

                        <header className="contact-inbox__list-header">
                            <div>
                                <strong>
                                    {total} Nachrichten
                                </strong>

                                <small>
                                    Seite {pageNumber} von {pageCount}
                                </small>
                            </div>

                            <button
                                type="button"
                                onClick={refreshAll}
                                disabled={loading}
                                title="Neu laden"
                            >
                                <i
                                    className="bi bi-arrow-clockwise"
                                    aria-hidden="true"
                                />
                            </button>
                        </header>

                        <div className="contact-inbox__message-list">
                            {
                                loading ? (
                                    <div className="contact-inbox__empty">
                                        <span className="spinner-border text-info" />

                                        <p>
                                            Kontaktanfragen werden geladen …
                                        </p>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="contact-inbox__empty">
                                        <i
                                            className="bi bi-inbox"
                                            aria-hidden="true"
                                        />

                                        <h3>
                                            Keine Kontaktanfragen gefunden
                                        </h3>

                                        <p>
                                            Passe die Suche oder die Filter an.
                                        </p>
                                    </div>
                                ) : (
                                    messages.map(
                                        (
                                            contactMessage
                                        ) => {
                                            const status =
                                                getContactStatusDefinition(
                                                    contactMessage.status
                                                );

                                            return (
                                                <button
                                                    key={contactMessage.id}
                                                    type="button"
                                                    className={
                                                        [
                                                            "contact-inbox__message",
                                                            !contactMessage.isRead
                                                                ? "contact-inbox__message--unread"
                                                                : "",
                                                            selectedId === contactMessage.id
                                                                ? "contact-inbox__message--selected"
                                                                : ""
                                                        ]
                                                            .filter(Boolean)
                                                            .join(" ")
                                                    }
                                                    onClick={
                                                        () =>
                                                            selectMessage(
                                                                contactMessage.id
                                                            )
                                                    }
                                                >
                                                    <span className="contact-inbox__message-avatar">
                                                        {
                                                            contactMessage.name
                                                                ?.trim()
                                                                .charAt(0)
                                                                .toUpperCase() ??
                                                            "?"
                                                        }
                                                    </span>

                                                    <span className="contact-inbox__message-content">
                                                        <span className="contact-inbox__message-topline">
                                                            <strong>
                                                                {contactMessage.name}
                                                            </strong>

                                                            <small>
                                                                {
                                                                    formatDate(
                                                                        contactMessage.createdAt
                                                                    )
                                                                }
                                                            </small>
                                                        </span>

                                                        <span className="contact-inbox__message-subject">
                                                            {contactMessage.subject}
                                                        </span>

                                                        <span className="contact-inbox__message-preview">
                                                            {contactMessage.message}
                                                        </span>

                                                        <span
                                                            className={`contact-inbox__status contact-inbox__status--${status.tone}`}
                                                        >
                                                            <i
                                                                className={`bi ${status.icon}`}
                                                                aria-hidden="true"
                                                            />

                                                            {status.label}
                                                        </span>
                                                    </span>

                                                    {
                                                        !contactMessage.isRead && (
                                                            <span
                                                                className="contact-inbox__unread-dot"
                                                                title="Ungelesen"
                                                            />
                                                        )
                                                    }
                                                </button>
                                            );
                                        }
                                    )
                                )
                            }
                        </div>

                        <footer className="contact-inbox__pagination">
                            <button
                                type="button"
                                disabled={
                                    !hasPreviousPage ||
                                    loading
                                }
                                onClick={
                                    () =>
                                        setOffset(
                                            Math.max(
                                                offset -
                                                    CONTACT_PAGE_SIZE,
                                                0
                                            )
                                        )
                                }
                            >
                                <i
                                    className="bi bi-chevron-left"
                                    aria-hidden="true"
                                />

                                Zurück
                            </button>

                            <span>
                                {pageNumber} / {pageCount}
                            </span>

                            <button
                                type="button"
                                disabled={
                                    !hasNextPage ||
                                    loading
                                }
                                onClick={
                                    () =>
                                        setOffset(
                                            offset +
                                                CONTACT_PAGE_SIZE
                                        )
                                }
                            >
                                Weiter

                                <i
                                    className="bi bi-chevron-right"
                                    aria-hidden="true"
                                />
                            </button>
                        </footer>
                    </div>

                    <div className="contact-inbox__detail-panel">
                        {
                            detailLoading ? (
                                <div className="contact-inbox__empty contact-inbox__empty--detail">
                                    <span className="spinner-border text-info" />

                                    <p>
                                        Nachricht wird geöffnet …
                                    </p>
                                </div>
                            ) : !selectedMessage ? (
                                <div className="contact-inbox__empty contact-inbox__empty--detail">
                                    <i
                                        className="bi bi-envelope-open"
                                        aria-hidden="true"
                                    />

                                    <h3>
                                        Nachricht auswählen
                                    </h3>

                                    <p>
                                        Wähle links eine Kontaktanfrage aus, um sie vollständig zu lesen und zu bearbeiten.
                                    </p>
                                </div>
                            ) : (
                                <article className="contact-inbox__detail">
                                    <header className="contact-inbox__detail-header">
                                        <div>
                                            <span className="contact-inbox__detail-reference">
                                                BP-{selectedMessage.id}
                                            </span>

                                            <h2>
                                                {selectedMessage.subject}
                                            </h2>

                                            <p>
                                                Eingegangen am {
                                                    formatDate(
                                                        selectedMessage.createdAt
                                                    )
                                                }
                                            </p>
                                        </div>

                                        <span
                                            className={`contact-inbox__status contact-inbox__status--${selectedStatus.tone}`}
                                        >
                                            <i
                                                className={`bi ${selectedStatus.icon}`}
                                                aria-hidden="true"
                                            />

                                            {selectedStatus.label}
                                        </span>
                                    </header>

                                    <section className="contact-inbox__sender">
                                        <span className="contact-inbox__sender-avatar">
                                            {
                                                selectedMessage.name
                                                    ?.trim()
                                                    .charAt(0)
                                                    .toUpperCase() ??
                                                "?"
                                            }
                                        </span>

                                        <div>
                                            <strong>
                                                {selectedMessage.name}
                                            </strong>

                                            <a
                                                href={`mailto:${selectedMessage.email}`}
                                            >
                                                {selectedMessage.email}
                                            </a>
                                        </div>

                                        <a
                                            className="contact-inbox__reply"
                                            href={
                                                createReplyHref(
                                                    selectedMessage
                                                )
                                            }
                                        >
                                            <i
                                                className="bi bi-reply-fill"
                                                aria-hidden="true"
                                            />

                                            Antworten
                                        </a>
                                    </section>

                                    <section className="contact-inbox__message-body">
                                        {
                                            selectedMessage.message
                                                .split("\n")
                                                .map(
                                                    (
                                                        paragraph,
                                                        index
                                                    ) => (
                                                        <p
                                                            key={`${selectedMessage.id}-${index}`}
                                                        >
                                                            {
                                                                paragraph ||
                                                                "\u00a0"
                                                            }
                                                        </p>
                                                    )
                                                )
                                        }
                                    </section>

                                    <section className="contact-inbox__metadata">
                                        <div>
                                            <span>
                                                Quelle
                                            </span>

                                            <strong>
                                                {
                                                    selectedMessage.sourcePath ||
                                                    "Nicht angegeben"
                                                }
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Datenschutz bestätigt
                                            </span>

                                            <strong>
                                                {
                                                    formatDate(
                                                        selectedMessage.privacyAcceptedAt
                                                    )
                                                }
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Zuletzt bearbeitet
                                            </span>

                                            <strong>
                                                {
                                                    selectedMessage.lastUpdatedByName ||
                                                    "Noch nicht bearbeitet"
                                                }
                                            </strong>
                                        </div>
                                    </section>

                                    <section className="contact-inbox__editor">
                                        <div className="contact-inbox__editor-grid">
                                            <label>
                                                <span>
                                                    Bearbeitungsstatus
                                                </span>

                                                <select
                                                    value={selectedMessage.status}
                                                    disabled={saving}
                                                    onChange={
                                                        (event) =>
                                                            applyPatch(
                                                                {
                                                                    status:
                                                                        event.target.value
                                                                },
                                                                "Der Bearbeitungsstatus wurde aktualisiert."
                                                            )
                                                    }
                                                >
                                                    {
                                                        CONTACT_STATUS_OPTIONS.map(
                                                            (option) => (
                                                                <option
                                                                    key={option.value}
                                                                    value={option.value}
                                                                >
                                                                    {option.label}
                                                                </option>
                                                            )
                                                        )
                                                    }
                                                </select>
                                            </label>

                                            <div className="contact-inbox__read-control">
                                                <span>
                                                    Lesestatus
                                                </span>

                                                <button
                                                    type="button"
                                                    disabled={saving}
                                                    onClick={
                                                        () =>
                                                            applyPatch(
                                                                {
                                                                    isRead:
                                                                        !selectedMessage.isRead
                                                                },
                                                                selectedMessage.isRead
                                                                    ? "Die Nachricht wurde als ungelesen markiert."
                                                                    : "Die Nachricht wurde als gelesen markiert."
                                                            )
                                                    }
                                                >
                                                    <i
                                                        className={
                                                            selectedMessage.isRead
                                                                ? "bi bi-envelope"
                                                                : "bi bi-envelope-open"
                                                        }
                                                        aria-hidden="true"
                                                    />

                                                    {
                                                        selectedMessage.isRead
                                                            ? "Als ungelesen markieren"
                                                            : "Als gelesen markieren"
                                                    }
                                                </button>
                                            </div>
                                        </div>

                                        <label className="contact-inbox__note">
                                            <span>
                                                Interne Notiz
                                            </span>

                                            <textarea
                                                rows="6"
                                                maxLength="10000"
                                                placeholder="Nur für das BluePulse-Team sichtbar …"
                                                value={internalNote}
                                                onChange={
                                                    (event) =>
                                                        setInternalNote(
                                                            event.target.value
                                                        )
                                                }
                                            />

                                            <small>
                                                {internalNote.length} / 10000 Zeichen
                                            </small>
                                        </label>

                                        <div className="contact-inbox__editor-actions">
                                            <button
                                                type="button"
                                                className="contact-inbox__save-note"
                                                disabled={
                                                    saving ||
                                                    internalNote ===
                                                    (
                                                        selectedMessage.internalNote ??
                                                        ""
                                                    )
                                                }
                                                onClick={
                                                    () =>
                                                        applyPatch(
                                                            {
                                                                internalNote
                                                            },
                                                            "Die interne Notiz wurde gespeichert."
                                                        )
                                                }
                                            >
                                                <i
                                                    className={
                                                        saving
                                                            ? "bi bi-arrow-repeat"
                                                            : "bi bi-floppy"
                                                    }
                                                    aria-hidden="true"
                                                />

                                                {
                                                    saving
                                                        ? "Speichert …"
                                                        : "Notiz speichern"
                                                }
                                            </button>

                                            <button
                                                type="button"
                                                className="contact-inbox__delete"
                                                disabled={deleting}
                                                onClick={handleDelete}
                                            >
                                                <i
                                                    className="bi bi-trash3"
                                                    aria-hidden="true"
                                                />

                                                {
                                                    deleting
                                                        ? "Wird gelöscht …"
                                                        : "Anfrage löschen"
                                                }
                                            </button>
                                        </div>
                                    </section>
                                </article>
                            )
                        }
                    </div>
                </section>
            </div>
        </AdminPage>
    );
}
