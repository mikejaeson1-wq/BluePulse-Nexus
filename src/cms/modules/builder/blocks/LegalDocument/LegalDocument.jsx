import "./LegalDocument.css";

function normalizeSections(
    value
) {
    return Array.isArray(
        value
    )
        ? value
        : [];
}

export default function LegalDocument({
    data = {}
}) {
    const sections =
        normalizeSections(
            data.sections
        );

    return (
        <article
            className="bp-legal-document"
            data-document-type={
                data.documentType ??
                "legal"
            }
        >
            <header className="bp-legal-document__header">
                <span className="bp-legal-document__eyebrow">
                    BluePulse Tierschutz
                </span>

                <h1>
                    {
                        data.title ??
                        "Rechtliche Informationen"
                    }
                </h1>

                {
                    data.intro && (
                        <p className="bp-legal-document__intro">
                            {
                                data.intro
                            }
                        </p>
                    )
                }

                {
                    data.draftWarning && (
                        <div
                            className="bp-legal-document__warning"
                            role="alert"
                        >
                            <i
                                className="bi bi-exclamation-triangle-fill"
                                aria-hidden="true"
                            />

                            <span>
                                {
                                    data.draftWarning
                                }
                            </span>
                        </div>
                    )
                }
            </header>

            <div className="bp-legal-document__sections">
                {
                    sections.map(
                        (
                            section,
                            sectionIndex
                        ) => (
                            <section
                                key={
                                    section.id ??
                                    `${section.title}-${sectionIndex}`
                                }
                                className="bp-legal-document__section"
                            >
                                <h2>
                                    {
                                        section.title
                                    }
                                </h2>

                                {
                                    (
                                        Array.isArray(
                                            section.paragraphs
                                        )
                                            ? section.paragraphs
                                            : []
                                    ).map(
                                        (
                                            paragraph,
                                            paragraphIndex
                                        ) => (
                                            <p
                                                key={
                                                    `${section.id ?? sectionIndex}-paragraph-${paragraphIndex}`
                                                }
                                            >
                                                {
                                                    paragraph
                                                }
                                            </p>
                                        )
                                    )
                                }

                                {
                                    Array.isArray(
                                        section.items
                                    ) &&
                                    section.items.length >
                                    0 && (
                                        <ul>
                                            {
                                                section.items.map(
                                                    (
                                                        item,
                                                        itemIndex
                                                    ) => (
                                                        <li
                                                            key={
                                                                `${section.id ?? sectionIndex}-item-${itemIndex}`
                                                            }
                                                        >
                                                            {
                                                                item
                                                            }
                                                        </li>
                                                    )
                                                )
                                            }
                                        </ul>
                                    )
                                }

                                {
                                    section.note && (
                                        <aside className="bp-legal-document__note">
                                            <i
                                                className="bi bi-info-circle"
                                                aria-hidden="true"
                                            />

                                            <span>
                                                {
                                                    section.note
                                                }
                                            </span>
                                        </aside>
                                    )
                                }
                            </section>
                        )
                    )
                }
            </div>

            {
                data.lastUpdated && (
                    <footer className="bp-legal-document__footer">
                        Stand: {
                            data.lastUpdated
                        }
                    </footer>
                )
            }
        </article>
    );
}
