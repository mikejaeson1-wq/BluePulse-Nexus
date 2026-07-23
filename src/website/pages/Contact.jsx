import "./Contact.css";

import {
    useEffect,
    useMemo,
    useState
} from "react";

import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

import {
    submitContactMessage
} from "@shared/contact/contactService";

const INITIAL_FORM = {
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

function getCharacterCountLabel(
    value,
    maximum
) {
    return `${String(
        value ??
        ""
    ).length} / ${maximum}`;
}

export default function Contact() {
    const [
        form,
        setForm
    ] =
        useState(
            INITIAL_FORM
        );

    const [
        submitting,
        setSubmitting
    ] =
        useState(false);

    const [
        error,
        setError
    ] =
        useState("");

    const [
        success,
        setSuccess
    ] =
        useState(null);

    const sourcePath =
        useMemo(
            () =>
                globalThis.location
                    ?.pathname ??
                "/kontakt",
            []
        );

    useEffect(() => {
        const previousTitle =
            globalThis.document
                ?.title;

        if (
            globalThis.document
        ) {
            globalThis.document.title =
                "Kontakt | BluePulse Tierschutz";
        }

        return () => {
            if (
                globalThis.document &&
                previousTitle
            ) {
                globalThis.document.title =
                    previousTitle;
            }
        };
    }, []);

    function updateField(
        field,
        value
    ) {
        setForm(
            (
                currentForm
            ) => ({
                ...currentForm,

                [field]:
                    value
            })
        );

        if (error) {
            setError(
                ""
            );
        }
    }

    async function handleSubmit(
        event
    ) {
        event.preventDefault();

        if (
            submitting
        ) {
            return;
        }

        setSubmitting(
            true
        );

        setError(
            ""
        );

        setSuccess(
            null
        );

        try {
            const response =
                await submitContactMessage({
                    ...form,

                    sourcePath
                });

            setSuccess(
                response
            );

            setForm(
                INITIAL_FORM
            );
        } catch (
            submitError
        ) {
            setError(
                submitError?.message ??
                "Deine Nachricht konnte nicht übermittelt werden."
            );
        } finally {
            setSubmitting(
                false
            );
        }
    }

    return (
        <>
            <Navbar />

            <main className="contact-page">
                <section className="contact-page__hero">
                    <div className="contact-page__hero-glow contact-page__hero-glow--one" />
                    <div className="contact-page__hero-glow contact-page__hero-glow--two" />

                    <div className="contact-page__container">
                        <span className="contact-page__eyebrow">
                            BluePulse Tierschutz
                        </span>

                        <h1>
                            Gemeinsam bewegen wir mehr
                        </h1>

                        <p>
                            Du hast eine Frage, möchtest uns unterstützen oder mit BluePulse zusammenarbeiten? Schreib uns direkt über das Kontaktformular.
                        </p>
                    </div>
                </section>

                <section className="contact-page__content">
                    <div className="contact-page__container contact-page__layout">
                        <aside className="contact-page__information">
                            <div className="contact-page__information-card contact-page__information-card--primary">
                                <span className="contact-page__information-icon">
                                    <i
                                        className="bi bi-envelope-heart"
                                        aria-hidden="true"
                                    />
                                </span>

                                <div>
                                    <h2>
                                        So erreichst du uns
                                    </h2>

                                    <p>
                                        Wir sind ein ehrenamtlich geführter Tierschutzverein. Deshalb kann eine persönliche Antwort gelegentlich etwas Zeit benötigen.
                                    </p>

                                    <a href="mailto:bluepulsekontakt@gmail.com">
                                        bluepulsekontakt@gmail.com
                                    </a>
                                </div>
                            </div>

                            <div className="contact-page__topic-list">
                                <article>
                                    <i
                                        className="bi bi-people"
                                        aria-hidden="true"
                                    />

                                    <div>
                                        <h3>
                                            Mitgliedschaft und Ehrenamt
                                        </h3>

                                        <p>
                                            Fragen zum Verein, zur Mitarbeit oder zu unserem Social-Media-Team.
                                        </p>
                                    </div>
                                </article>

                                <article>
                                    <i
                                        className="bi bi-diagram-3"
                                        aria-hidden="true"
                                    />

                                    <div>
                                        <h3>
                                            Kooperationen
                                        </h3>

                                        <p>
                                            Austausch mit Tierheimen, Auffangstationen, Initiativen und Organisationen.
                                        </p>
                                    </div>
                                </article>

                                <article>
                                    <i
                                        className="bi bi-megaphone"
                                        aria-hidden="true"
                                    />

                                    <div>
                                        <h3>
                                            Aktionen und Kampagnen
                                        </h3>

                                        <p>
                                            Hinweise zu Veranstaltungen, Demonstrationen, Cleanups und Tierschutzthemen.
                                        </p>
                                    </div>
                                </article>
                            </div>

                            <div className="contact-page__privacy-note">
                                <i
                                    className="bi bi-shield-check"
                                    aria-hidden="true"
                                />

                                <p>
                                    Deine Nachricht wird ausschließlich zur Bearbeitung deiner Anfrage gespeichert. Weitere Informationen findest du in unserer <a href="/datenschutz">Datenschutzerklärung</a>.
                                </p>
                            </div>
                        </aside>

                        <section className="contact-page__form-card">
                            <header className="contact-page__form-header">
                                <span>
                                    <i
                                        className="bi bi-send"
                                        aria-hidden="true"
                                    />
                                </span>

                                <div>
                                    <h2>
                                        Nachricht senden
                                    </h2>

                                    <p>
                                        Pflichtfelder sind mit einem Sternchen gekennzeichnet.
                                    </p>
                                </div>
                            </header>

                            {
                                success ? (
                                    <div
                                        className="contact-page__success"
                                        role="status"
                                    >
                                        <span>
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
                                                    success.message
                                                }
                                            </p>

                                            {
                                                success.reference && (
                                                    <small>
                                                        Referenz: {
                                                            success.reference
                                                        }
                                                    </small>
                                                )
                                            }

                                            <button
                                                type="button"
                                                onClick={
                                                    () =>
                                                        setSuccess(
                                                            null
                                                        )
                                                }
                                            >
                                                Weitere Nachricht senden
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <form
                                        className="contact-page__form"
                                        onSubmit={
                                            handleSubmit
                                        }
                                    >
                                        {
                                            error && (
                                                <div
                                                    className="contact-page__error"
                                                    role="alert"
                                                >
                                                    <i
                                                        className="bi bi-exclamation-circle-fill"
                                                        aria-hidden="true"
                                                    />

                                                    <span>
                                                        {
                                                            error
                                                        }
                                                    </span>
                                                </div>
                                            )
                                        }

                                        <div className="contact-page__form-grid">
                                            <label className="contact-page__field">
                                                <span>
                                                    Name *
                                                </span>

                                                <input
                                                    type="text"
                                                    autoComplete="name"
                                                    minLength="2"
                                                    maxLength="120"
                                                    required
                                                    value={
                                                        form.name
                                                    }
                                                    onChange={
                                                        (event) =>
                                                            updateField(
                                                                "name",
                                                                event.target.value
                                                            )
                                                    }
                                                />
                                            </label>

                                            <label className="contact-page__field">
                                                <span>
                                                    E-Mail-Adresse *
                                                </span>

                                                <input
                                                    type="email"
                                                    autoComplete="email"
                                                    maxLength="254"
                                                    required
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
                                                />
                                            </label>
                                        </div>

                                        <label className="contact-page__field">
                                            <span>
                                                Betreff *
                                            </span>

                                            <input
                                                type="text"
                                                minLength="3"
                                                maxLength="180"
                                                required
                                                value={
                                                    form.subject
                                                }
                                                onChange={
                                                    (event) =>
                                                        updateField(
                                                            "subject",
                                                            event.target.value
                                                        )
                                                }
                                            />

                                            <small>
                                                {
                                                    getCharacterCountLabel(
                                                        form.subject,
                                                        180
                                                    )
                                                }
                                            </small>
                                        </label>

                                        <label className="contact-page__field">
                                            <span>
                                                Nachricht *
                                            </span>

                                            <textarea
                                                rows="8"
                                                minLength="20"
                                                maxLength="5000"
                                                required
                                                value={
                                                    form.message
                                                }
                                                onChange={
                                                    (event) =>
                                                        updateField(
                                                            "message",
                                                            event.target.value
                                                        )
                                                }
                                            />

                                            <small>
                                                Mindestens 20 Zeichen · {
                                                    getCharacterCountLabel(
                                                        form.message,
                                                        5000
                                                    )
                                                }
                                            </small>
                                        </label>

                                        <label
                                            className="contact-page__honeypot"
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
                                                    (event) =>
                                                        updateField(
                                                            "company",
                                                            event.target.value
                                                        )
                                                }
                                            />
                                        </label>

                                        <label className="contact-page__consent">
                                            <input
                                                type="checkbox"
                                                required
                                                checked={
                                                    form.privacyAccepted
                                                }
                                                onChange={
                                                    (event) =>
                                                        updateField(
                                                            "privacyAccepted",
                                                            event.target.checked
                                                        )
                                                }
                                            />

                                            <span>
                                                Ich habe die <a href="/datenschutz">Datenschutzerklärung</a> gelesen und stimme der Verarbeitung meiner Angaben zur Bearbeitung der Anfrage zu. *
                                            </span>
                                        </label>

                                        <button
                                            type="submit"
                                            className="contact-page__submit"
                                            disabled={
                                                submitting
                                            }
                                        >
                                            <i
                                                className={
                                                    submitting
                                                        ? "bi bi-arrow-repeat"
                                                        : "bi bi-send-fill"
                                                }
                                                aria-hidden="true"
                                            />

                                            {
                                                submitting
                                                    ? "Nachricht wird gesendet …"
                                                    : "Nachricht senden"
                                            }
                                        </button>
                                    </form>
                                )
                            }
                        </section>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}
