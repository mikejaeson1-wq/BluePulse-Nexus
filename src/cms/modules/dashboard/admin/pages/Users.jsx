import "./Users.css";

import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import AdminPage from "../components/AdminPage";

import Button from "@shared/ui/Button";

import {
    useAuth
} from "@cms/modules/auth/context/AuthContext";

import UserDialog from "@cms/modules/users/components/UserDialog";

import {
    USER_ROLE_OPTIONS,
    USER_ROLES,
    createUser,
    getUserRoleLabel,
    listUsers,
    resetUserPassword,
    revokeUserSessions,
    updateUser
} from "@cms/modules/users/services/userService";

const EMPTY_DIALOG = {
    open: false,
    mode: "create",
    user: null
};

function getInitials(
    user
) {
    const source =
        user.displayName ??
        user.name ??
        user.username ??
        "?";

    return source
        .split(
            /\s+/
        )
        .filter(
            Boolean
        )
        .slice(
            0,
            2
        )
        .map(
            (part) =>
                part[0]
                    ?.toUpperCase()
        )
        .join("");
}

function formatDate(
    value
) {
    if (!value) {
        return "Noch nie";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "Unbekannt";
    }

    return new Intl.DateTimeFormat(
        "de-DE",
        {
            dateStyle:
                "medium",

            timeStyle:
                "short"
        }
    ).format(
        date
    );
}

function UserStat({
    icon,
    label,
    value,
    description
}) {
    return (
        <article className="users-stat">
            <span className="users-stat__icon">
                <i
                    className={
                        `bi ${icon}`
                    }
                    aria-hidden="true"
                />
            </span>

            <div>
                <strong>
                    {value}
                </strong>

                <span>
                    {label}
                </span>

                <small>
                    {description}
                </small>
            </div>
        </article>
    );
}

export default function Users() {
    const {
        user:
            currentUser,

        refreshSession
    } =
        useAuth();

    const [
        users,
        setUsers
    ] =
        useState([]);

    const [
        loading,
        setLoading
    ] =
        useState(true);

    const [
        actionBusy,
        setActionBusy
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

    const [
        dialogError,
        setDialogError
    ] =
        useState("");

    const [
        dialog,
        setDialog
    ] =
        useState(
            EMPTY_DIALOG
        );

    const [
        searchTerm,
        setSearchTerm
    ] =
        useState("");

    const [
        roleFilter,
        setRoleFilter
    ] =
        useState("all");

    const [
        statusFilter,
        setStatusFilter
    ] =
        useState("all");

    const isAdministrator =
        currentUser?.role ===
        USER_ROLES.ADMINISTRATOR;

    const loadUsers =
        useCallback(
            async ({
                showLoading = true
            } = {}) => {
                if (
                    !isAdministrator
                ) {
                    setUsers([]);
                    setLoading(false);

                    return;
                }

                if (
                    showLoading
                ) {
                    setLoading(true);
                }

                setError("");

                try {
                    const loadedUsers =
                        await listUsers();

                    setUsers(
                        loadedUsers
                    );
                } catch (loadError) {
                    setError(
                        loadError.message ??
                        "Die Benutzer konnten nicht geladen werden."
                    );
                } finally {
                    setLoading(false);
                }
            },
            [
                isAdministrator
            ]
        );

    useEffect(() => {
        loadUsers();
    }, [
        loadUsers
    ]);

    const filteredUsers =
        useMemo(
            () => {
                const normalizedSearch =
                    searchTerm
                        .trim()
                        .toLowerCase();

                return users.filter(
                    (user) => {
                        const matchesSearch =
                            !normalizedSearch ||
                            [
                                user.displayName,
                                user.name,
                                user.username,
                                user.email,
                                user.roleLabel,
                                getUserRoleLabel(
                                    user.role
                                )
                            ]
                                .filter(
                                    Boolean
                                )
                                .some(
                                    (value) =>
                                        String(
                                            value
                                        )
                                            .toLowerCase()
                                            .includes(
                                                normalizedSearch
                                            )
                                );

                        const matchesRole =
                            roleFilter ===
                                "all" ||
                            user.role ===
                                roleFilter;

                        const matchesStatus =
                            statusFilter ===
                                "all" ||
                            (
                                statusFilter ===
                                    "active" &&
                                user.active
                            ) ||
                            (
                                statusFilter ===
                                    "inactive" &&
                                !user.active
                            );

                        return (
                            matchesSearch &&
                            matchesRole &&
                            matchesStatus
                        );
                    }
                );
            },
            [
                users,
                searchTerm,
                roleFilter,
                statusFilter
            ]
        );

    const statistics =
        useMemo(
            () => ({
                total:
                    users.length,

                active:
                    users.filter(
                        (user) =>
                            user.active
                    ).length,

                administrators:
                    users.filter(
                        (user) =>
                            user.role ===
                            USER_ROLES.ADMINISTRATOR
                    ).length,

                inactive:
                    users.filter(
                        (user) =>
                            !user.active
                    ).length
            }),
            [
                users
            ]
        );

    function openCreateDialog() {
        setDialogError("");

        setDialog({
            open: true,
            mode: "create",
            user: null
        });
    }

    function openEditDialog(
        user
    ) {
        setDialogError("");

        setDialog({
            open: true,
            mode: "edit",
            user
        });
    }

    function openPasswordDialog(
        user
    ) {
        setDialogError("");

        setDialog({
            open: true,
            mode: "password",
            user
        });
    }

    function closeDialog() {
        if (
            actionBusy
        ) {
            return;
        }

        setDialog(
            EMPTY_DIALOG
        );

        setDialogError("");
    }

    async function handleDialogSubmit(
        payload
    ) {
        if (
            actionBusy
        ) {
            return;
        }

        setActionBusy(true);
        setDialogError("");
        setError("");
        setMessage("");

        try {
            if (
                dialog.mode ===
                "create"
            ) {
                const createdUser =
                    await createUser(
                        payload
                    );

                setMessage(
                    `${createdUser?.displayName ?? createdUser?.username ?? "Der Benutzer"} wurde angelegt.`
                );
            }

            if (
                dialog.mode ===
                    "edit" &&
                dialog.user
            ) {
                const updatedUser =
                    await updateUser(
                        dialog.user.id,
                        payload
                    );

                setMessage(
                    `${updatedUser?.displayName ?? updatedUser?.username ?? "Der Benutzer"} wurde aktualisiert.`
                );

                if (
                    dialog.user.id ===
                    currentUser?.id
                ) {
                    await refreshSession({
                        showLoading:
                            false
                    });
                }
            }

            if (
                dialog.mode ===
                    "password" &&
                dialog.user
            ) {
                await resetUserPassword(
                    dialog.user.id,
                    payload.password
                );

                setMessage(
                    `Das Passwort für ${dialog.user.displayName ?? dialog.user.username} wurde zurückgesetzt. Alle bisherigen Sitzungen wurden beendet.`
                );
            }

            await loadUsers({
                showLoading:
                    false
            });

            setDialog(
                EMPTY_DIALOG
            );
        } catch (actionError) {
            setDialogError(
                actionError.message ??
                "Die Änderung konnte nicht gespeichert werden."
            );
        } finally {
            setActionBusy(false);
        }
    }

    async function handleRevokeSessions(
        user
    ) {
        if (
            user.id ===
            currentUser?.id
        ) {
            return;
        }

        const confirmed =
            globalThis.confirm(
                [
                    `Alle Sitzungen von ${user.displayName ?? user.username} beenden?`,
                    "",
                    "Der Benutzer muss sich anschließend erneut anmelden."
                ].join(
                    "\n"
                )
            );

        if (!confirmed) {
            return;
        }

        setActionBusy(true);
        setError("");
        setMessage("");

        try {
            const revokedSessions =
                await revokeUserSessions(
                    user.id
                );

            setMessage(
                revokedSessions ===
                    1
                    ? "Eine aktive Sitzung wurde beendet."
                    : `${revokedSessions} aktive Sitzungen wurden beendet.`
            );
        } catch (actionError) {
            setError(
                actionError.message ??
                "Die Sitzungen konnten nicht beendet werden."
            );
        } finally {
            setActionBusy(false);
        }
    }

    if (
        !isAdministrator
    ) {
        return (
            <AdminPage
                title="Benutzer"
                description="Benutzer und Rollen verwalten."
            >
                <section className="users-forbidden">
                    <span>
                        <i
                            className="bi bi-shield-lock"
                            aria-hidden="true"
                        />
                    </span>

                    <div>
                        <h2>
                            Administratorrechte erforderlich
                        </h2>

                        <p>
                            Deine Benutzerrolle besitzt keinen Zugriff auf die Nexus-Benutzerverwaltung.
                        </p>
                    </div>
                </section>
            </AdminPage>
        );
    }

    return (
        <>
            <AdminPage
                title="Benutzer"
                description="Nexus-Zugänge, Rollen und aktive Sitzungen verwalten."
                action={
                    <Button
                        onClick={
                            openCreateDialog
                        }
                    >
                        <i
                            className="bi bi-person-plus"
                            aria-hidden="true"
                        />

                        Benutzer anlegen
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

                <section className="users-stats">
                    <UserStat
                        icon="bi-people"
                        label="Benutzer insgesamt"
                        value={
                            statistics.total
                        }
                        description="Alle Nexus-Konten"
                    />

                    <UserStat
                        icon="bi-person-check"
                        label="Aktive Benutzer"
                        value={
                            statistics.active
                        }
                        description="Können sich anmelden"
                    />

                    <UserStat
                        icon="bi-shield-check"
                        label="Administratoren"
                        value={
                            statistics.administrators
                        }
                        description="Vollständiger Zugriff"
                    />

                    <UserStat
                        icon="bi-person-dash"
                        label="Deaktiviert"
                        value={
                            statistics.inactive
                        }
                        description="Anmeldung gesperrt"
                    />
                </section>

                <section className="users-toolbar">
                    <label className="users-search">
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
                            placeholder="Name, Benutzername oder E-Mail suchen …"
                        />
                    </label>

                    <div className="users-filters">
                        <label>
                            <span>
                                Rolle
                            </span>

                            <select
                                value={
                                    roleFilter
                                }
                                onChange={
                                    (event) =>
                                        setRoleFilter(
                                            event.target.value
                                        )
                                }
                            >
                                <option value="all">
                                    Alle Rollen
                                </option>

                                {
                                    USER_ROLE_OPTIONS.map(
                                        (roleOption) => (
                                            <option
                                                key={
                                                    roleOption.value
                                                }
                                                value={
                                                    roleOption.value
                                                }
                                            >
                                                {
                                                    roleOption.label
                                                }
                                            </option>
                                        )
                                    )
                                }
                            </select>
                        </label>

                        <label>
                            <span>
                                Status
                            </span>

                            <select
                                value={
                                    statusFilter
                                }
                                onChange={
                                    (event) =>
                                        setStatusFilter(
                                            event.target.value
                                        )
                                }
                            >
                                <option value="all">
                                    Alle Konten
                                </option>

                                <option value="active">
                                    Aktiv
                                </option>

                                <option value="inactive">
                                    Deaktiviert
                                </option>
                            </select>
                        </label>
                    </div>
                </section>

                {
                    loading ? (
                        <div className="users-loading">
                            <span
                                className="spinner-border text-info"
                                aria-hidden="true"
                            />

                            <span>
                                Benutzer werden geladen …
                            </span>
                        </div>
                    ) : filteredUsers.length ===
                        0 ? (
                        <section className="users-empty">
                            <i
                                className="bi bi-person-x"
                                aria-hidden="true"
                            />

                            <h2>
                                Keine Benutzer gefunden
                            </h2>

                            <p>
                                Passe die Suche oder die ausgewählten Filter an.
                            </p>
                        </section>
                    ) : (
                        <section className="users-list">
                            {
                                filteredUsers.map(
                                    (user) => {
                                        const isCurrentUser =
                                            user.id ===
                                            currentUser?.id;

                                        return (
                                            <article
                                                key={
                                                    user.id
                                                }
                                                className={
                                                    `users-card ${
                                                        !user.active
                                                            ? "is-inactive"
                                                            : ""
                                                    }`
                                                }
                                            >
                                                <div className="users-card__identity">
                                                    <span className="users-card__avatar">
                                                        {
                                                            getInitials(
                                                                user
                                                            )
                                                        }
                                                    </span>

                                                    <div>
                                                        <div className="users-card__name">
                                                            <strong>
                                                                {
                                                                    user.displayName ??
                                                                    user.name ??
                                                                    user.username
                                                                }
                                                            </strong>

                                                            {
                                                                isCurrentUser && (
                                                                    <span className="users-card__you">
                                                                        Du
                                                                    </span>
                                                                )
                                                            }
                                                        </div>

                                                        <span>
                                                            @
                                                            {
                                                                user.username
                                                            }
                                                        </span>

                                                        <a
                                                            href={
                                                                `mailto:${user.email}`
                                                            }
                                                        >
                                                            {
                                                                user.email
                                                            }
                                                        </a>
                                                    </div>
                                                </div>

                                                <div className="users-card__access">
                                                    <span
                                                        className={
                                                            `users-role users-role--${user.role}`
                                                        }
                                                    >
                                                        {
                                                            getUserRoleLabel(
                                                                user.role
                                                            )
                                                        }
                                                    </span>

                                                    <span
                                                        className={
                                                            `users-status ${
                                                                user.active
                                                                    ? "is-active"
                                                                    : "is-inactive"
                                                            }`
                                                        }
                                                    >
                                                        <i
                                                            className={
                                                                user.active
                                                                    ? "bi bi-check-circle-fill"
                                                                    : "bi bi-x-circle-fill"
                                                            }
                                                            aria-hidden="true"
                                                        />

                                                        {
                                                            user.active
                                                                ? "Aktiv"
                                                                : "Deaktiviert"
                                                        }
                                                    </span>
                                                </div>

                                                <div className="users-card__dates">
                                                    <span>
                                                        Letzte Anmeldung
                                                    </span>

                                                    <strong>
                                                        {
                                                            formatDate(
                                                                user.lastLoginAt
                                                            )
                                                        }
                                                    </strong>

                                                    <small>
                                                        Angelegt am {
                                                            formatDate(
                                                                user.createdAt
                                                            )
                                                        }
                                                    </small>
                                                </div>

                                                <div className="users-card__actions">
                                                    <button
                                                        type="button"
                                                        onClick={
                                                            () =>
                                                                openEditDialog(
                                                                    user
                                                                )
                                                        }
                                                        title="Benutzer bearbeiten"
                                                    >
                                                        <i
                                                            className="bi bi-pencil"
                                                            aria-hidden="true"
                                                        />

                                                        <span>
                                                            Bearbeiten
                                                        </span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={
                                                            isCurrentUser
                                                        }
                                                        onClick={
                                                            () =>
                                                                openPasswordDialog(
                                                                    user
                                                                )
                                                        }
                                                        title={
                                                            isCurrentUser
                                                                ? "Das eigene Passwort wird später über das Profil geändert"
                                                                : "Passwort zurücksetzen"
                                                        }
                                                    >
                                                        <i
                                                            className="bi bi-key"
                                                            aria-hidden="true"
                                                        />

                                                        <span>
                                                            Passwort
                                                        </span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={
                                                            isCurrentUser ||
                                                            actionBusy
                                                        }
                                                        onClick={
                                                            () =>
                                                                handleRevokeSessions(
                                                                    user
                                                                )
                                                        }
                                                        title={
                                                            isCurrentUser
                                                                ? "Die eigene Sitzung wird über Abmelden beendet"
                                                                : "Alle Sitzungen beenden"
                                                        }
                                                    >
                                                        <i
                                                            className="bi bi-box-arrow-right"
                                                            aria-hidden="true"
                                                        />

                                                        <span>
                                                            Abmelden
                                                        </span>
                                                    </button>
                                                </div>
                                            </article>
                                        );
                                    }
                                )
                            }
                        </section>
                    )
                }
            </AdminPage>

            <UserDialog
                open={
                    dialog.open
                }
                mode={
                    dialog.mode
                }
                user={
                    dialog.user
                }
                currentUserId={
                    currentUser?.id
                }
                busy={
                    actionBusy
                }
                serverError={
                    dialogError
                }
                onClose={
                    closeDialog
                }
                onSubmit={
                    handleDialogSubmit
                }
            />
        </>
    );
}