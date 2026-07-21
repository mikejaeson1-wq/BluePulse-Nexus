import "./Contact.css";

import {
    useRef,
    useState
} from "react";

import Button from "../ui/Button/Button";

import useReveal from "../../hooks/useReveal";

import useSiteContentSection from "@shared/hooks/useSiteContentSection";

const EMPTY_FORM = {
    name: "",
    email: "",
    subject: "",
    message: ""
};

function isExternalLink(href) {
    return /^https?:\/\//i.test(
        href ?? ""
    );
}

export default function Contact() {
    const sectionRef = useRef();

    const content =
        useSiteContentSection("contact");

    const [form, setForm] = useState(
        EMPTY_FORM
    );

    const [feedback, setFeedback] =
        useState(null);

    useReveal(sectionRef, {
        y: 80,
        duration: 1
    });

    if (!content) {
        return null;
    }

    function updateForm(event) {
        const {
            name,
            value
        } = event.target;

        setForm((currentForm) => ({
            ...currentForm,
            [name]: value
        }));

        setFeedback(null);
    }

    function handleSubmit(event) {
        event.preventDefault();

        const recipient =
            content.email?.trim();

        if (!recipient) {
            setFeedback({
                type: "error",
                text:
                    "Für das Kontaktformular wurde noch keine Empfänger-E-Mail hinterlegt."
            });

            return;
        }

        const subject =
            form.subject.trim() ||
            `Kontaktanfrage von ${form.name.trim()}`;

        const body = [
            `Name: ${form.name.trim()}`,
            `E-Mail: ${form.email.trim()}`,
            "",
            form.message.trim()
        ].join("\n");

        const mailtoUrl = [
            `mailto:${recipient}`,
            `?subject=${encodeURIComponent(subject)}`,
            `&body=${encodeURIComponent(body)}`
        ].join("");

        setFeedback({
            type: "success",
            text:
                "Dein E-Mail-Programm wird geöffnet."
        });

        window.location.href = mailtoUrl;
    }

    return (
        <section
            id="kontakt"
            ref={sectionRef}
            className="contact"
        >
            <div className="contact__glow" />

            <div className="contact__header">
                <span>
                    {content.eyebrow}
                </span>

                <h2>
                    {content.title}
                </h2>

                <p>
                    {content.description}
                </p>
            </div>

            <div className="contact__layout">
                <div className="contact__information">
                    {
                        content.channels.map(
                            (channel) => {
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
                                                {channel.title}
                                            </h3>

                                            <p>
                                                {channel.value}
                                            </p>
                                        </div>
                                    </>
                                );

                                if (channel.href) {
                                    return (
                                        <a
                                            key={channel.id}
                                            className="contact__channel"
                                            href={channel.href}
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
                                            {channelContent}
                                        </a>
                                    );
                                }

                                return (
                                    <div
                                        key={channel.id}
                                        className="contact__channel"
                                    >
                                        {channelContent}
                                    </div>
                                );
                            }
                        )
                    }
                </div>

                <form
                    className="contact__form"
                    onSubmit={handleSubmit}
                >
                    <div className="contact__formHeader">
                        <h3>
                            {content.formTitle}
                        </h3>

                        <p>
                            {
                                content.formDescription
                            }
                        </p>
                    </div>

                    {
                        feedback && (
                            <div
                                className={
                                    feedback.type ===
                                    "error"
                                        ? "contact__feedback contact__feedback--error"
                                        : "contact__feedback contact__feedback--success"
                                }
                                role="status"
                                aria-live="polite"
                            >
                                {feedback.text}
                            </div>
                        )
                    }

                    <div className="contact__formGrid">
                        <div className="contact__field">
                            <label htmlFor="contact-name">
                                Name
                            </label>

                            <input
                                id="contact-name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                value={form.name}
                                onChange={updateForm}
                            />
                        </div>

                        <div className="contact__field">
                            <label htmlFor="contact-email">
                                E-Mail
                            </label>

                            <input
                                id="contact-email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={form.email}
                                onChange={updateForm}
                            />
                        </div>
                    </div>

                    <div className="contact__field">
                        <label htmlFor="contact-subject">
                            Betreff
                        </label>

                        <input
                            id="contact-subject"
                            name="subject"
                            type="text"
                            value={form.subject}
                            onChange={updateForm}
                        />
                    </div>

                    <div className="contact__field">
                        <label htmlFor="contact-message">
                            Nachricht
                        </label>

                        <textarea
                            id="contact-message"
                            name="message"
                            rows="7"
                            required
                            value={form.message}
                            onChange={updateForm}
                        />
                    </div>

                    <Button type="submit">
                        {content.submitLabel}

                        <i
                            className="bi bi-send"
                            aria-hidden="true"
                        />
                    </Button>

                    {
                        content.privacyText && (
                            <small className="contact__privacy">
                                <i
                                    className="bi bi-shield-check"
                                    aria-hidden="true"
                                />

                                {content.privacyText}
                            </small>
                        )
                    }
                </form>
            </div>
        </section>
    );
}