import "./UserDialog.css";

import {
    useEffect,
    useState
} from "react";

import Button from "@shared/ui/Button";

import {
    USER_ROLE_OPTIONS,
    USER_ROLES
} from "../services/userService";

const EMPTY_FORM = {
    username: "",
    email: "",
    displayName: "",
    role:
        USER_ROLES.EDITOR,
    active: true,
    password: "",
    confirmPassword: ""
};

function generatePassword() {
    const randomPart =
        globalThis.crypto
            ?.randomUUID?.()
            ?.replaceAll(
                "-",
                ""
            ) ??
        `${Date.now()}${Math.random()}`;

    return `BP-${randomPart.slice(
        0,
        24
    )}!Aa1`;
}

function getDialogTitle(
    mode
) {
    if (
        mode ===
        "create"
    ) {
        return "Benutzer anlegen";
    }

    if (
        mode ===
        "password"
    ) {
        return "Passwort zurücksetzen";
    }

    return "Benutzer bearbeiten";
}

function getDialogDescription(
    mode,
    user
) {
    if (
        mode ===
        "create"
    ) {
        return "Neues Nexus-Benutzerkonto mit einer passenden Rolle erstellen.";
    }

    if (
        mode ===
        "password"
    ) {
        return `Ein neues Passwort für ${user?.displayName ?? user?.username ?? "diesen Benutzer"} vergeben. Alle bestehenden Sitzungen werden beendet.`;
    }

    return "Kontodaten, Rolle und Aktivstatus bearbeiten.";
}

export default function UserDialog({
    open,
    mode,
    user,
    currentUserId,
    busy,
    serverError,
    onClose,
    onSubmit
}) {
    const [
        form,
        setForm
    ] =
        useState(
            EMPTY_FORM
        );

    const [
        validationError,
        setValidationError
    ] =
        useState("");

    const isCurrentUser =
        Boolean(
            user?.id &&
            user.id ===
                currentUserId
        );

    useEffect(() => {
        if (!open) {
            return;
        }

        setValidationError("");

        if (
            mode ===
                "edit" &&
            user
        ) {
            setForm({
                username:
                    user.username ??
                    "",

                email:
                    user.email ??
                    "",

                displayName:
                    user.displayName ??
                    user.name ??
                    "",

                role:
                    user.role ??
                    USER_ROLES.EDITOR,

                active:
                    Boolean(
                        user.active
                    ),

                password: "",
                confirmPassword: ""
            });

            return;
        }

        setForm(
            EMPTY_FORM
        );
    }, [
        open,
        mode,
        user
    ]);

    useEffect(() => {
        if (!open) {
            return undefined;
        }

        function handleKeyDown(
            event
        ) {
            if (
                event.key ===
                    "Escape" &&
                !busy
            ) {
                onClose();
            }
        }

        globalThis.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            globalThis.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [
        open,
        busy,
        onClose
    ]);

    if (!open) {
        return null;
    }

    function updateField(
        fieldName,
        value
    ) {
        setForm(
            (currentForm) => ({
                ...currentForm,
                [fieldName]:
                    value
            })
        );
    }

    function handleGeneratePassword() {
        const password =
            generatePassword();

        setForm(
            (currentForm) => ({
                ...currentForm,
                password,
                confirmPassword:
                    password
            })
        );
    }

    async function handleSubmit(
        event
    ) {
        event.preventDefault();

        setValidationError("");

        if (
            mode ===
                "create" ||
            mode ===
                "edit"
        ) {
            if (
                form.displayName
                    .trim()
                    .length <
                2
            ) {
                setValidationError(
                    "Der Anzeigename muss mindestens 2 Zeichen enthalten."
                );

                return;
            }

            if (
                form.username
                    .trim()
                    .length <
                3
            ) {
                setValidationError(
                    "Der Benutzername muss mindestens 3 Zeichen enthalten."
                );

                return;
            }

            if (
                !form.email
                    .trim()
                    .includes(
                        "@"
                    )
            ) {
                setValidationError(
                    "Bitte gib eine gültige E-Mail-Adresse ein."
                );

                return;
            }
        }

        if (
            mode ===
                "create" ||
            mode ===
                "password"
        ) {
            if (
                form.password
                    .length <
                12
            ) {
                setValidationError(
                    "Das Passwort muss mindestens 12 Zeichen enthalten."
                );

                return;
            }

            if (
                form.password !==
                form.confirmPassword
            ) {
                setValidationError(
                    "Die beiden Passwörter stimmen nicht überein."
                );

                return;
            }
        }

        if (
            mode ===
            "create"
        ) {
            await onSubmit({
                username:
                    form.username
                        .trim()
                        .toLowerCase(),

                email:
                    form.email
                        .trim()
                        .toLowerCase(),

                displayName:
                    form.displayName
                        .trim(),

                role:
                    form.role,

                password:
                    form.password
            });

            return;
        }

        if (
            mode ===
            "password"
        ) {
            await onSubmit({
                password:
                    form.password
            });

            return;
        }

        await onSubmit({
            username:
                form.username
                    .trim()
                    .toLowerCase(),

            email:
                form.email
                    .trim()
                    .toLowerCase(),

            displayName:
                form.displayName
                    .trim(),

            role:
                form.role,

            active:
                Boolean(
                    form.active
                )
        });
    }

    const displayedError =
        validationError ||
        serverError;

    return (
        <div
            className="user-dialog-backdrop"
            role="presentation"
            onMouseDown={
                (event) => {
                    if (
                        event.target ===
                            event.currentTarget &&
                        !busy
                    ) {
                        onClose();
                    }
                }
            }
        >
            <section
                className="user-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="user-dialog-title"
            >
                <header className="user-dialog__header">
                    <div className="user-dialog__heading">
                        <span className="user-dialog__icon">
                            <i
                                className={
                                    mode ===
                                    "password"
                                        ? "bi bi-key"
                                        : "bi bi-person-gear"
                                }
                                aria-hidden="true"
                            />
                        </span>

                        <div>
                            <h2 id="user-dialog-title">
                                {
                                    getDialogTitle(
                                        mode
                                    )
                                }
                            </h2>

                            <p>
                                {
                                    getDialogDescription(
                                        mode,
                                        user
                                    )
                                }
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="user-dialog__close"
                        onClick={
                            onClose
                        }
                        disabled={
                            busy
                        }
                        aria-label="Dialog schließen"
                    >
                        <i
                            className="bi bi-x-lg"
                            aria-hidden="true"
                        />
                    </button>
                </header>

                <form
                    className="user-dialog__form"
                    onSubmit={
                        handleSubmit
                    }
                >
                    {
                        mode !==
                            "password" && (
                            <>
                                <div className="user-dialog__grid">
                                    <label className="user-dialog__field user-dialog__field--wide">
                                        <span>
                                            Anzeigename
                                        </span>

                                        <input
                                            type="text"
                                            value={
                                                form.displayName
                                            }
                                            onChange={
                                                (event) =>
                                                    updateField(
                                                        "displayName",
                                                        event.target.value
                                                    )
                                            }
                                            autoComplete="name"
                                            maxLength="120"
                                            required
                                        />
                                    </label>

                                    <label className="user-dialog__field">
                                        <span>
                                            Benutzername
                                        </span>

                                        <input
                                            type="text"
                                            value={
                                                form.username
                                            }
                                            onChange={
                                                (event) =>
                                                    updateField(
                                                        "username",
                                                        event.target.value
                                                    )
                                            }
                                            autoComplete="username"
                                            minLength="3"
                                            maxLength="40"
                                            required
                                        />

                                        <small>
                                            Kleinbuchstaben, Zahlen, Punkt, Unterstrich oder Bindestrich.
                                        </small>
                                    </label>

                                    <label className="user-dialog__field">
                                        <span>
                                            E-Mail-Adresse
                                        </span>

                                        <input
                                            type="email"
                                            value={
                                                form.email
                                            }
                                            onChange={
                                                (event) =>
                                                    updateField(
                                                        "email",
                                                        event.target.value
                                                    )
                                            }
                                            autoComplete="email"
                                            maxLength="254"
                                            required
                                        />
                                    </label>
                                </div>

                                <fieldset className="user-dialog__roles">
                                    <legend>
                                        Benutzerrolle
                                    </legend>

                                    <div className="user-dialog__role-options">
                                        {
                                            USER_ROLE_OPTIONS.map(
                                                (roleOption) => (
                                                    <label
                                                        key={
                                                            roleOption.value
                                                        }
                                                        className={
                                                            `user-dialog__role ${
                                                                form.role ===
                                                                roleOption.value
                                                                    ? "is-selected"
                                                                    : ""
                                                            }`
                                                        }
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="role"
                                                            value={
                                                                roleOption.value
                                                            }
                                                            checked={
                                                                form.role ===
                                                                roleOption.value
                                                            }
                                                            disabled={
                                                                isCurrentUser
                                                            }
                                                            onChange={
                                                                () =>
                                                                    updateField(
                                                                        "role",
                                                                        roleOption.value
                                                                    )
                                                            }
                                                        />

                                                        <span className="user-dialog__role-check">
                                                            <i
                                                                className={
                                                                    form.role ===
                                                                    roleOption.value
                                                                        ? "bi bi-check-circle-fill"
                                                                        : "bi bi-circle"
                                                                }
                                                                aria-hidden="true"
                                                            />
                                                        </span>

                                                        <span>
                                                            <strong>
                                                                {
                                                                    roleOption.label
                                                                }
                                                            </strong>

                                                            <small>
                                                                {
                                                                    roleOption.description
                                                                }
                                                            </small>
                                                        </span>
                                                    </label>
                                                )
                                            )
                                        }
                                    </div>

                                    {
                                        isCurrentUser && (
                                            <p className="user-dialog__notice">
                                                <i
                                                    className="bi bi-shield-lock"
                                                    aria-hidden="true"
                                                />

                                                Die eigene Administratorrolle kann nicht geändert werden.
                                            </p>
                                        )
                                    }
                                </fieldset>

                                {
                                    mode ===
                                        "edit" && (
                                        <label className="user-dialog__switch">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    form.active
                                                }
                                                disabled={
                                                    isCurrentUser
                                                }
                                                onChange={
                                                    (event) =>
                                                        updateField(
                                                            "active",
                                                            event.target.checked
                                                        )
                                                }
                                            />

                                            <span className="user-dialog__switch-control" />

                                            <span>
                                                <strong>
                                                    Benutzerkonto aktiv
                                                </strong>

                                                <small>
                                                    Deaktivierte Benutzer können sich nicht mehr anmelden.
                                                </small>
                                            </span>
                                        </label>
                                    )
                                }
                            </>
                        )
                    }

                    {
                        (
                            mode ===
                                "create" ||
                            mode ===
                                "password"
                        ) && (
                            <section className="user-dialog__password">
                                <div className="user-dialog__password-header">
                                    <div>
                                        <h3>
                                            Neues Passwort
                                        </h3>

                                        <p>
                                            Mindestens 12 Zeichen. Eine lange Passphrase ist am sichersten.
                                        </p>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={
                                            handleGeneratePassword
                                        }
                                    >
                                        <i
                                            className="bi bi-stars"
                                            aria-hidden="true"
                                        />

                                        Sicher erzeugen
                                    </Button>
                                </div>

                                <div className="user-dialog__grid">
                                    <label className="user-dialog__field">
                                        <span>
                                            Passwort
                                        </span>

                                        <input
                                            type="text"
                                            value={
                                                form.password
                                            }
                                            onChange={
                                                (event) =>
                                                    updateField(
                                                        "password",
                                                        event.target.value
                                                    )
                                            }
                                            autoComplete="new-password"
                                            minLength="12"
                                            maxLength="256"
                                            required
                                        />
                                    </label>

                                    <label className="user-dialog__field">
                                        <span>
                                            Passwort bestätigen
                                        </span>

                                        <input
                                            type="text"
                                            value={
                                                form.confirmPassword
                                            }
                                            onChange={
                                                (event) =>
                                                    updateField(
                                                        "confirmPassword",
                                                        event.target.value
                                                    )
                                            }
                                            autoComplete="new-password"
                                            minLength="12"
                                            maxLength="256"
                                            required
                                        />
                                    </label>
                                </div>

                                {
                                    mode ===
                                        "password" && (
                                        <div className="user-dialog__warning">
                                            <i
                                                className="bi bi-exclamation-triangle"
                                                aria-hidden="true"
                                            />

                                            <span>
                                                Nach dem Zurücksetzen werden alle aktiven Sitzungen dieses Benutzers automatisch beendet.
                                            </span>
                                        </div>
                                    )
                                }
                            </section>
                        )
                    }

                    {
                        displayedError && (
                            <div className="user-dialog__error">
                                <i
                                    className="bi bi-exclamation-circle"
                                    aria-hidden="true"
                                />

                                <span>
                                    {
                                        displayedError
                                    }
                                </span>
                            </div>
                        )
                    }

                    <footer className="user-dialog__footer">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={
                                onClose
                            }
                            disabled={
                                busy
                            }
                        >
                            Abbrechen
                        </Button>

                        <Button
                            type="submit"
                            disabled={
                                busy
                            }
                        >
                            {
                                busy ? (
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
                                            className={
                                                mode ===
                                                "password"
                                                    ? "bi bi-key"
                                                    : "bi bi-check-lg"
                                            }
                                            aria-hidden="true"
                                        />

                                        {
                                            mode ===
                                            "create"
                                                ? "Benutzer anlegen"
                                                : mode ===
                                                "password"
                                                    ? "Passwort speichern"
                                                    : "Änderungen speichern"
                                        }
                                    </>
                                )
                            }
                        </Button>
                    </footer>
                </form>
            </section>
        </div>
    );
}