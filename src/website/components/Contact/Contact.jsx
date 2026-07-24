import "./Contact.css";

import {
    useRef,
    useState
} from "react";

import Button from "../ui/Button/Button";

import useReveal from "../../hooks/useReveal";

import useSiteContentSection from "@shared/hooks/useSiteContentSection";

import {
    submitContactMessage
} from "@shared/contact/contactService";

const EMPTY_FORM = {
    name:
        "",

    email:
        "",

    subject:
        "",

    message:
        "",

    privacyAccepted:
        false,

    company:
        ""
};

const DEFAULT_FORM_DESCRIPTION =
    "Fülle das Formular aus. Deine Nachricht wird sicher übermittelt und direkt in unserem BluePulse-Kontaktpostfach gespeichert.";

const DEFAULT_SUBMIT_LABEL =
    "Nachricht senden";

function isExternalLink(
    href
) {
    return /^https?:\/\//i.test(
        href ??
        ""
    );
}

function getSourcePath() {
    const location =
        globalThis.location;

    if (!location) {
        return "/#kontakt";
    }

    return [
        location.pathname,
        location.search,
        location.hash
    ].join("");
}

function getFormDescription(
    value
) {
    const normalizedValue =
        String(
            value ??
            ""
        ).trim();

    if (
        !normalizedValue ||
        /e-mail-programm|vorbereitete nachricht/i.test(
            normalizedValue
        )
    ) {
        return DEFAULT_FORM_DESCRIPTION;
    }

    return normalizedValue;
}

function getSubmitLabel(
    value
) {
    const normalizedValue =
        String(
            value ??
            ""
        ).trim();

    if (
        !normalizedValue ||
        /e-mail vorbereiten|mail vorbereiten/i.test(
            normalizedValue
        )
    ) {
        return DEFAULT_SUBMIT_LABEL;
    }

    return normalizedValue;
}

function getCharacterCount(
    value,
    maximum
) {
    return `${String(
        value ??
        ""
    ).length} / ${maximum}`;
}

export default function Contact() {
    const sectionRef =
        useRef();

    const content =
        useSiteContentSection(
            "contact"
        );

    const [
        form,
        setForm
    ] =
        useState(
            EMPTY_FORM
        );

    const [
        submitting,
        setSubmitting
    ] =
        useState(false);

    const [
        feedback,
        setFeedback
    ] =
        useState(null);

    const [
        success,
        setSuccess
    ] =
        useState(null);

    useReveal(
        sectionRef,
        {
            y:
                80,

            duration:
                1
        }
    );

    if (!content) {
        return null;
    }

    const formDescription =
        getFormDescription(
            content.formDescription
        );

    const submitLabel =
        getSubmitLabel(
            content.submitLabel
        );

    function updateForm(
        event
    ) {
        const {
            name,
            type,
            value,
            checked
        } =
            event.target;

        setForm(
            (
                currentForm
            ) => ({
                ...currentForm,

                [name]:
                    type ===
                    "checkbox"
                        ? checked
                        : value
            })
        );

        setFeedback(
            null
        );
    }

    async function handleSubmit(
        event
    ) {
        event.preventDefault();

        if (submitting) {
            return;
        }

        setSubmitting(
            true
        );

        setFeedback(
            null
        );

        try {
            const response =
                await submitContactMessage({
                    name:
                        form.name,

                    email:
                        form.email,

                    subject:
                        form.subject,

                    message:
                        form.message,

                    privacyAccepted:
                        form.privacyAccepted,

                    company:
                        form.company,

                    sourcePath:
                        getSourcePath()
                });

            setSuccess(
                response
            );

            setForm(
                EMPTY_FORM
            );
        } catch (
            submitError
        ) {
            setFeedback({
                type:
                    "error",

                text:
                    submitError?.message ??
                    "Deine Nachricht konnte nicht übermittelt werden. Bitte versuche es später erneut."
            });
        } finally {
            setSubmitting(
                false
            );
        }
    }

    function resetForm() {
        setSuccess(
            null
        );

        setFeedback(
            null
        );

        setForm(
            EMPTY_FORM
        );
    }

    return (
        <section
            id="kontakt"
            ref={
                sectionRef
            }
            className="contact"
        >
            <div className="contact__glow" />

            <div className="contact__header">
                <span>
                    {
                        content.eyebrow
                    }
                </span>

                <h2>
                    {
                        content.title
                    }
                </h2>

                <p>
                    {
                        content.description
                    }
                </p>
            </div>

            <div className="contact__layout">
                <div className="contact__information">
                    {
                        (
                            content.channels ??
                            []
                        ).map(
                            (
                                channel
                            ) => {
                                const external =
                                    isExternalLink(
                                        channel.href
                                    );

                                const channelContent = (
                                    <>
                                        <i
                                            className={
                                                `bi ${channel.icon} contact__channelIcon`
                                            }
                                            aria-hidden="true"
                                        />

                                        <div>
                                            <h3>
                                                {
                                                    channel.title
                                                }
                                            </h3>

                                            <p>
                                                {
                                                    channel.value
                                                }
                                            </p>
                                        </div>
                                    </>
                                );

                                if (
                                    channel.href
                                ) {
                                    return (
                                        <a
                                            key={
                                                channel.id
                                            }
                                            className="contact__channel"
                                            href={
                                                channel.href
                                            }
                                            target={
                                                external
                                                    ? "_blank"
                                                    : "_self"
                                            }
                                            rel={
                                                external
                                                    ? "noopener noreferrer"
                                                    : undefined
                                            }
                                        >
                                            {
                                                channelContent
                                            }
                                        </a>
                                    );
                                }

                                return (
                                    <div
                                        key={
                                            channel.id
                                        }
                                        className="contact__channel"
                                    >
                                        {
                                            channelContent
                                        }
                                    </div>
                                );
                            }
                        )
                    }
                </div>

                <div className="contact__form">
                    <div className="contact__formHeader">
                        <div className="contact__formHeaderIcon">
                            <i
                                className="bi bi-send"
                                aria-hidden="true"
                            />
                        </div>

                        <div>
                            <h3>
                                {
                                    content.formTitle
                                }
                            </h3>

                            <p>
                                {
                                    formDescription
                                }
                            </p>
                        </div>
                    </div>

                    {
                        success ? (
                            <div
                                className="contact__success"
                                role="status"
                                aria-live="polite"
                            >
                                <span className="contact__successIcon">
                                    <i
                                        className="bi bi-check-circle-fill"
                                        aria-hidden="true"
                                    />
                                </span>

                                <div>
                                    <h3>
                                        Nachricht angekommen
                                    </h3>

                                    <p>
                                        {
                                            success.message ??
                                            "Vielen Dank. Deine Nachricht wurde erfolgreich übermittelt."
                                        }
                                    </p>

                                    {
                                        success.reference && (
                                            <strong>
                                                Referenz: {
                                                    success.reference
                                                }
                                            </strong>
                                        )
                                    }

                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={
                                            resetForm
                                        }
                                    >
                                        Weitere Nachricht senden
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <form
                                className="contact__formFields"
                                onSubmit={
                                    handleSubmit
                                }
                            >
                                {
                                    feedback && (
                                        <div
                                            className={
                                                feedback.type ===
                                                "error"
                                                    ? "contact__feedback contact__feedback--error"
                                                    : "contact__feedback contact__feedback--success"
                                            }
                                            role="alert"
                                            aria-live="polite"
                                        >
                                            <i
                                                className={
                                                    feedback.type ===
                                                    "error"
                                                        ? "bi bi-exclamation-circle-fill"
                                                        : "bi bi-check-circle-fill"
                                                }
                                                aria-hidden="true"
                                            />

                                            <span>
                                                {
                                                    feedback.text
                                                }
                                            </span>
                                        </div>
                                    )
                                }

                                <div className="contact__formGrid">
                                    <div className="contact__field">
                                        <label htmlFor="contact-name">
                                            Name *
                                        </label>

                                        <input
                                            id="contact-name"
                                            name="name"
                                            type="text"
                                            autoComplete="name"
                                            minLength="2"
                                            maxLength="120"
                                            required
                                            value={
                                                form.name
                                            }
                                            onChange={
                                                updateForm
                                            }
                                        />
                                    </div>

                                    <div className="contact__field">
                                        <label htmlFor="contact-email">
                                            E-Mail *
                                        </label>

                                        <input
                                            id="contact-email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            maxLength="254"
                                            required
                                            value={
                                                form.email
                                            }
                                            onChange={
                                                updateForm
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="contact__field">
                                    <label htmlFor="contact-subject">
                                        Betreff *
                                    </label>

                                    <input
                                        id="contact-subject"
                                        name="subject"
                                        type="text"
                                        minLength="3"
                                        maxLength="180"
                                        required
                                        value={
                                            form.subject
                                        }
                                        onChange={
                                            updateForm
                                        }
                                    />

                                    <small className="contact__counter">
                                        {
                                            getCharacterCount(
                                                form.subject,
                                                180
                                            )
                                        }
                                    </small>
                                </div>

                                <div className="contact__field">
                                    <label htmlFor="contact-message">
                                        Nachricht *
                                    </label>

                                    <textarea
                                        id="contact-message"
                                        name="message"
                                        rows="7"
                                        minLength="20"
                                        maxLength="5000"
                                        required
                                        value={
                                            form.message
                                        }
                                        onChange={
                                            updateForm
                                        }
                                    />

                                    <small className="contact__counter">
                                        Mindestens 20 Zeichen · {
                                            getCharacterCount(
                                                form.message,
                                                5000
                                            )
                                        }
                                    </small>
                                </div>

                                <label
                                    className="contact__honeypot"
                                    aria-hidden="true"
                                >
                                    Firma

                                    <input
                                        type="text"
                                        name="company"
                                        tabIndex={-1}
                                        autoComplete="off"
                                        value={
                                            form.company
                                        }
                                        onChange={
                                            updateForm
                                        }
                                    />
                                </label>

                                <label className="contact__consent">
                                    <input
                                        type="checkbox"
                                        name="privacyAccepted"
                                        required
                                        checked={
                                            form.privacyAccepted
                                        }
                                        onChange={
                                            updateForm
                                        }
                                    />

                                    <span>
                                        Ich habe die <a href="/datenschutz">Datenschutzerklärung</a> gelesen und stimme der Verarbeitung meiner Angaben zur Bearbeitung der Anfrage zu. *
                                    </span>
                                </label>

                                <Button
                                    type="submit"
                                    disabled={
                                        submitting
                                    }
                                >
                                    <i
                                        className={
                                            submitting
                                                ? "bi bi-arrow-repeat contact__loadingIcon"
                                                : "bi bi-send-fill"
                                        }
                                        aria-hidden="true"
                                    />

                                    {
                                        submitting
                                            ? "Nachricht wird gesendet …"
                                            : submitLabel
                                    }
                                </Button>

                                {
                                    content.privacyText && (
                                        <small className="contact__privacy">
                                            <i
                                                className="bi bi-shield-check"
                                                aria-hidden="true"
                                            />

                                            {
                                                content.privacyText
                                            }
                                        </small>
                                    )
                                }
                            </form>
                        )
                    }
                </div>
            </div>
        </section>
    );
}
