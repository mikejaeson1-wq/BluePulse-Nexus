const REQUIRED_LEGAL_PAGES =
    Object.freeze([
        "impressum",
        "datenschutz"
    ]);

const DEFAULT_PUBLIC_SECTIONS =
    Object.freeze([
        "hero",
        "mission",
        "projects",
        "participation",
        "impact",
        "donations",
        "contact"
    ]);

const EMAIL_PATTERN =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PLACEHOLDER_PATTERNS =
    Object.freeze([
        {
            label:
                "BITTE ... EINTRAGEN",

            pattern:
                /BITTE[\s\S]{0,80}EINTRAGEN/i
        },
        {
            label:
                "CHANGE_ME",

            pattern:
                /CHANGE_ME/i
        },
        {
            label:
                "TODO",

            pattern:
                /\bTODO\b/i
        },
        {
            label:
                "Beispieldomain",

            pattern:
                /(?:example\.(?:com|org|de)|beispiel\.(?:com|org|de))/i
        }
    ]);

function normalizeText(
    value
) {
    return String(
        value ?? ""
    ).trim();
}

function isPlainObject(
    value
) {
    return Boolean(
        value &&
        typeof value ===
            "object" &&
        !Array.isArray(
            value
        )
    );
}

function isHttpLink(
    value
) {
    const href =
        normalizeText(
            value
        );

    if (
        (
            href.startsWith("/") &&
            !href.startsWith("//")
        ) ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
    ) {
        return true;
    }

    try {
        const url =
            new URL(href);

        return [
            "http:",
            "https:"
        ].includes(
            url.protocol
        );
    } catch {
        return false;
    }
}

function getPageSeo(
    page
) {
    const pageSettings =
        isPlainObject(
            page?.theme
                ?.pageSettings
        )
            ? page.theme
                .pageSettings
            : {};

    return isPlainObject(
        pageSettings.seo
    )
        ? pageSettings.seo
        : {};
}

function findPlaceholder(
    value
) {
    const serializedValue =
        JSON.stringify(
            value ?? null
        );

    return PLACEHOLDER_PATTERNS.find(
        ({
            pattern
        }) =>
            pattern.test(
                serializedValue
            )
    )?.label ?? "";
}

function createCollector() {
    const checks = [];

    function add(
        level,
        code,
        message,
        hint = ""
    ) {
        checks.push({
            level,
            code,
            message,
            hint
        });
    }

    return {
        checks,

        ok(
            code,
            message
        ) {
            add(
                "ok",
                code,
                message
            );
        },

        warning(
            code,
            message,
            hint = ""
        ) {
            add(
                "warning",
                code,
                message,
                hint
            );
        },

        blocker(
            code,
            message,
            hint = ""
        ) {
            add(
                "blocker",
                code,
                message,
                hint
            );
        }
    };
}

function getEnabledSectionIds(
    homeLayout
) {
    const items =
        Array.isArray(
            homeLayout?.items
        )
            ? homeLayout.items
            : [];

    if (items.length === 0) {
        return [
            ...DEFAULT_PUBLIC_SECTIONS
        ];
    }

    return items
        .filter(
            (item) =>
                item?.enabled !==
                false
        )
        .map(
            (item) =>
                normalizeText(
                    item?.id
                )
        )
        .filter(Boolean);
}

function checkMigrations(
    collector,
    migrations
) {
    const migrationList =
        Array.isArray(
            migrations
        )
            ? migrations
            : [];

    if (
        migrationList.length ===
        0
    ) {
        collector.blocker(
            "database.migrations.none",
            "Der Migrationsstand konnte nicht ermittelt werden.",
            "Datenbankverbindung und apps/api/migrations pruefen."
        );

        return;
    }

    const incomplete =
        migrationList.filter(
            (migration) =>
                migration.status !==
                "applied"
        );

    if (
        incomplete.length >
        0
    ) {
        collector.blocker(
            "database.migrations.incomplete",
            `Nicht freigegebene Migrationen: ${incomplete
                .map(
                    (migration) =>
                        `${migration.version} (${migration.status})`
                )
                .join(", ")}.`,
            "Migrationen ausfuehren und veraenderte SQL-Dateien klaeren."
        );

        return;
    }

    collector.ok(
        "database.migrations",
        `Alle ${migrationList.length} Datenbankmigrationen sind unveraendert angewendet.`
    );
}

function checkContent(
    collector,
    snapshot
) {
    const content =
        isPlainObject(
            snapshot.content
        )
            ? snapshot.content
            : {};

    const layout =
        isPlainObject(
            snapshot.homeLayout
        )
            ? snapshot.homeLayout
            : {};

    if (
        !Array.isArray(
            layout.items
        ) ||
        layout.items.length ===
            0
    ) {
        collector.blocker(
            "content.layout",
            "Das Startseiten-Layout ist noch nicht explizit im CMS gespeichert.",
            "Im CMS unter Startseiten-Layout einmal pruefen und speichern."
        );
    } else {
        collector.ok(
            "content.layout",
            "Das Startseiten-Layout ist gespeichert."
        );
    }

    const enabledSections =
        getEnabledSectionIds(
            layout
        );

    const missingSections =
        enabledSections.filter(
            (sectionId) =>
                !isPlainObject(
                    content[
                        sectionId
                    ]
                ) ||
                Object.keys(
                    content[
                        sectionId
                    ]
                ).length ===
                    0
        );

    if (
        missingSections.length >
        0
    ) {
        collector.blocker(
            "content.sections",
            `Aktive Bereiche ohne gespeicherten CMS-Inhalt: ${missingSections.join(", ")}.`,
            "Diese Bereiche im CMS kontrollieren und speichern oder im Layout deaktivieren."
        );
    } else {
        collector.ok(
            "content.sections",
            `Alle ${enabledSections.length} aktiven Startseitenbereiche besitzen gespeicherte Inhalte.`
        );
    }

    const placeholder =
        findPlaceholder({
            content,
            layout
        });

    if (placeholder) {
        collector.blocker(
            "content.placeholder",
            `Startseiten-Inhalte enthalten noch den Platzhalter "${placeholder}".`,
            "Im CMS nach dem genannten Text suchen und durch den echten Inhalt ersetzen."
        );
    } else {
        collector.ok(
            "content.placeholder",
            "In den Startseiten-Inhalten wurden keine bekannten Platzhalter gefunden."
        );
    }

    const impactValues =
        content.impact
            ?.items;

    if (
        enabledSections.includes(
            "impact"
        ) &&
        Array.isArray(
            impactValues
        ) &&
        impactValues.some(
            (item) =>
                Number(
                    item?.value
                ) === 0
        )
    ) {
        collector.warning(
            "content.impact.zero",
            "Mindestens eine sichtbare Wirkungszahl steht auf 0.",
            "Zahlen aktualisieren oder den Wirkungsbereich bis dahin deaktivieren."
        );
    }

    const donationMethods =
        content.donations
            ?.methods;

    const deadDonationButtons =
        Array.isArray(
            donationMethods
        )
            ? donationMethods.filter(
                (method) =>
                    normalizeText(
                        method?.buttonLabel
                    ) &&
                    !isHttpLink(
                        method?.href
                    )
            )
            : [];

    if (
        enabledSections.includes(
            "donations"
        ) &&
        deadDonationButtons.length >
            0
    ) {
        collector.blocker(
            "content.donations.links",
            `Sichtbare Spendenbuttons ohne Ziel: ${deadDonationButtons
                .map(
                    (method) =>
                        normalizeText(
                            method?.title
                        ) ||
                        normalizeText(
                            method?.id
                        ) ||
                        "Unbenannt"
                )
                .join(", ")}.`,
            "Im CMS einen gueltigen Link eintragen, den Buttontext leeren oder den Bereich deaktivieren."
        );
    } else if (
        enabledSections.includes(
            "donations"
        )
    ) {
        collector.ok(
            "content.donations.links",
            "Alle sichtbaren Spendenbuttons besitzen ein gueltiges Ziel."
        );
    }

    const contactEmail =
        normalizeText(
            content.contact
                ?.email
        );

    if (
        enabledSections.includes(
            "contact"
        ) &&
        !EMAIL_PATTERN.test(
            contactEmail
        )
    ) {
        collector.blocker(
            "content.contact.email",
            "Im Kontaktbereich fehlt eine gueltige E-Mail-Adresse.",
            "CMS > Website-Inhalte > Kontakt pruefen."
        );
    } else if (
        enabledSections.includes(
            "contact"
        )
    ) {
        collector.ok(
            "content.contact.email",
            `Kontaktadresse ist gesetzt: ${contactEmail}.`
        );
    }

    const contactPrivacyText =
        normalizeText(
            content.contact
                ?.privacyText
        );

    if (
        enabledSections.includes(
            "contact"
        ) &&
        /e-mail-programm|nicht\s+(?:auf\s+dieser\s+website\s+)?gespeichert/i.test(
            contactPrivacyText
        )
    ) {
        collector.blocker(
            "content.contact.privacy",
            "Der Kontaktbereich behauptet noch, dass das E-Mail-Programm geoeffnet oder die Anfrage nicht gespeichert wird.",
            "CMS > Website-Inhalte > Kontakt: Datenschutzhinweis an das gespeicherte Kontaktformular anpassen."
        );
    } else if (
        enabledSections.includes(
            "contact"
        ) &&
        !contactPrivacyText
    ) {
        collector.warning(
            "content.contact.privacy",
            "Im Kontaktbereich fehlt ein kurzer Datenschutzhinweis.",
            "Auf die Speicherung zur Bearbeitung und die Datenschutzerklaerung hinweisen."
        );
    } else if (
        enabledSections.includes(
            "contact"
        )
    ) {
        collector.ok(
            "content.contact.privacy",
            "Der Kontaktbereich enthaelt keinen veralteten Mailto-Datenschutzhinweis."
        );
    }
}

function checkNavigation(
    collector,
    navigation
) {
    const items =
        Array.isArray(
            navigation?.items
        )
            ? navigation.items
            : [];

    if (items.length === 0) {
        collector.blocker(
            "navigation.empty",
            "Die Navigation ist noch nicht explizit im CMS gespeichert.",
            "Im CMS unter Navigation pruefen und speichern."
        );
    } else {
        const invalidItems =
            items.filter(
                (item) =>
                    item?.enabled !==
                        false &&
                    (
                        !normalizeText(
                            item?.label
                        ) ||
                        !isHttpLink(
                            item?.href
                        )
                    )
            );

        if (
            invalidItems.length >
            0
        ) {
            collector.blocker(
                "navigation.links",
                `Aktive Navigationseintraege ohne Beschriftung oder Ziel: ${invalidItems
                    .map(
                        (item) =>
                            normalizeText(
                                item?.id
                            ) ||
                            "Unbenannt"
                    )
                    .join(", ")}.`,
                "CMS > Navigation pruefen."
            );
        } else {
            collector.ok(
                "navigation.links",
                "Alle aktiven Navigationseintraege sind verwendbar."
            );
        }
    }

    const cta =
        navigation?.cta;

    if (
        cta?.enabled &&
        (
            !normalizeText(
                cta.label
            ) ||
            !isHttpLink(
                cta.href
            )
        )
    ) {
        collector.blocker(
            "navigation.cta",
            "Der aktive Navigationsbutton besitzt keine Beschriftung oder kein gueltiges Ziel.",
            "CMS > Navigation > Aktionsbutton pruefen."
        );
    }
}

function checkFooter(
    collector,
    footer
) {
    if (
        !isPlainObject(
            footer
        ) ||
        Object.keys(
            footer
        ).length ===
            0
    ) {
        collector.blocker(
            "footer.empty",
            "Der Footer ist noch nicht explizit im CMS gespeichert.",
            "Im CMS unter Footer pruefen und speichern."
        );

        return;
    }

    if (
        !EMAIL_PATTERN.test(
            normalizeText(
                footer.email
            )
        )
    ) {
        collector.blocker(
            "footer.email",
            "Im Footer fehlt eine gueltige E-Mail-Adresse.",
            "CMS > Footer > Kontakt pruefen."
        );
    } else {
        collector.ok(
            "footer.email",
            `Footer-Kontaktadresse ist gesetzt: ${normalizeText(
                footer.email
            )}.`
        );
    }

    const legalLinks =
        Array.isArray(
            footer.legalLinks
        )
            ? footer.legalLinks
            : [];

    const missingLegalLinks =
        REQUIRED_LEGAL_PAGES.filter(
            (slug) =>
                !legalLinks.some(
                    (link) =>
                        link?.id ===
                            slug &&
                        link.enabled ===
                            true &&
                        normalizeText(
                            link.href
                        ) ===
                            `/${slug}`
                )
        );

    if (
        missingLegalLinks.length >
        0
    ) {
        collector.blocker(
            "footer.legal",
            `Pflichtlinks im Footer fehlen oder sind deaktiviert: ${missingLegalLinks.join(", ")}.`,
            "CMS > Footer > Rechtliches aktivieren und auf /impressum sowie /datenschutz verlinken."
        );
    } else {
        collector.ok(
            "footer.legal",
            "Impressum und Datenschutz sind im Footer korrekt aktiviert."
        );
    }

    const invalidSocialLinks =
        (
            Array.isArray(
                footer.socialLinks
            )
                ? footer.socialLinks
                : []
        ).filter(
            (link) =>
                link?.enabled &&
                (
                    !normalizeText(
                        link.label
                    ) ||
                    !isHttpLink(
                        link.href
                    )
                )
        );

    if (
        invalidSocialLinks.length >
        0
    ) {
        collector.blocker(
            "footer.social",
            "Mindestens ein aktivierter Social-Link hat kein gueltiges Ziel.",
            "CMS > Footer > Social Media pruefen."
        );
    }
}

function checkPages(
    collector,
    pages
) {
    const publishedPages =
        (
            Array.isArray(
                pages
            )
                ? pages
                : []
        ).filter(
            (page) =>
                page.status ===
                "published"
        );

    const legalPages = {};

    for (
        const slug
        of REQUIRED_LEGAL_PAGES
    ) {
        legalPages[slug] =
            publishedPages.find(
                (page) =>
                    normalizeText(
                        page.slug
                    ) ===
                    slug
            );

        if (!legalPages[slug]) {
            collector.blocker(
                `pages.legal.${slug}`,
                `Die Seite /${slug} ist nicht veroeffentlicht.`,
                "Im CMS unter Rechtliches vervollstaendigen, erzeugen und veroeffentlichen."
            );
        }
    }

    if (
        REQUIRED_LEGAL_PAGES.every(
            (slug) =>
                legalPages[slug]
        )
    ) {
        collector.ok(
            "pages.legal.published",
            "Impressum und Datenschutz sind veroeffentlicht."
        );
    }

    const emptyPages =
        publishedPages.filter(
            (page) =>
                !Array.isArray(
                    page.blocks
                ) ||
                page.blocks.length ===
                    0
        );

    if (
        emptyPages.length >
        0
    ) {
        collector.blocker(
            "pages.empty",
            `Veroeffentlichte Seiten ohne Inhalt: ${emptyPages
                .map(
                    (page) =>
                        `/${normalizeText(
                            page.slug
                        )}`
                )
                .join(", ")}.`,
            "Seiten im Builder fuellen oder bis dahin als Entwurf speichern."
        );
    } else if (
        publishedPages.length >
        0
    ) {
        collector.ok(
            "pages.content",
            `Alle ${publishedPages.length} veroeffentlichten Seiten besitzen Inhaltsbloecke.`
        );
    }

    const pagesWithoutDescription =
        publishedPages.filter(
            (page) =>
                !normalizeText(
                    getPageSeo(
                        page
                    ).description
                )
        );

    if (
        pagesWithoutDescription.length >
        0
    ) {
        collector.blocker(
            "pages.seo.description",
            `SEO-Beschreibung fehlt bei: ${pagesWithoutDescription
                .map(
                    (page) =>
                        `/${normalizeText(
                            page.slug
                        )}`
                )
                .join(", ")}.`,
            "CMS > Seite > Einstellungen > SEO ergaenzen."
        );
    } else if (
        publishedPages.length >
        0
    ) {
        collector.ok(
            "pages.seo.description",
            "Alle veroeffentlichten Seiten besitzen eine SEO-Beschreibung."
        );
    }

    const imprintText =
        JSON.stringify(
            legalPages.impressum ??
            {}
        );

    const missingRepresentatives =
        [
            "Holger Fischer",
            "Doreen Hoffmann"
        ].filter(
            (name) =>
                !imprintText.includes(
                    name
                )
        );

    if (
        legalPages.impressum &&
        missingRepresentatives.length >
        0
    ) {
        collector.blocker(
            "pages.legal.representatives",
            `Im Impressum fehlen aktuelle Vertretungsangaben: ${missingRepresentatives.join(", ")}.`,
            "Rechtliches-Setup aktualisieren und Impressum neu erzeugen."
        );
    } else if (
        legalPages.impressum
    ) {
        collector.ok(
            "pages.legal.representatives",
            "Im Impressum stehen Holger Fischer und Doreen Hoffmann."
        );
    }

    const placeholder =
        findPlaceholder(
            publishedPages
        );

    if (placeholder) {
        collector.blocker(
            "pages.placeholder",
            `Veroeffentlichte Seiten enthalten noch den Platzhalter "${placeholder}".`,
            "Betroffene Seite im CMS korrigieren und erneut veroeffentlichen."
        );
    } else if (
        publishedPages.length >
        0
    ) {
        collector.ok(
            "pages.placeholder",
            "Veroeffentlichte Seiten enthalten keine bekannten Platzhalter."
        );
    }

}

function checkMedia(
    collector,
    media,
    orphanMediaFiles = []
) {
    const assets =
        Array.isArray(
            media
        )
            ? media
            : [];

    if (
        assets.length ===
        0
    ) {
        if (
            Array.isArray(
                orphanMediaFiles
            ) &&
            orphanMediaFiles.length >
                0
        ) {
            collector.warning(
                "media.orphans",
                `${orphanMediaFiles.length} Dateien im Medienvolume besitzen keinen Datenbankeintrag.`,
                "Nach Sichtpruefung ueber das CMS neu zuordnen, archivieren oder entfernen."
            );
        }

        collector.warning(
            "media.empty",
            "Die Mediathek enthaelt keine Dateien.",
            "Falls Bilder vorgesehen sind, vor der Abnahme hochladen."
        );

        return;
    }

    const missingFiles =
        assets.filter(
            (asset) =>
                asset.fileExists ===
                false
        );

    if (
        missingFiles.length >
        0
    ) {
        collector.blocker(
            "media.files",
            `Zu ${missingFiles.length} Datenbankeintraegen fehlt die Datei im Medienvolume.`,
            `Fehlende Medien-IDs: ${missingFiles
                .map(
                    (asset) =>
                        asset.id
                )
                .join(", ")}.`
        );
    } else {
        collector.ok(
            "media.files",
            `Alle ${assets.length} Medien-Datenbankeintraege besitzen eine Datei.`
        );
    }

    const imagesWithoutAltText =
        assets.filter(
            (asset) =>
                normalizeText(
                    asset.mimeType
                ).startsWith(
                    "image/"
                ) &&
                !normalizeText(
                    asset.altText
                )
        );

    if (
        imagesWithoutAltText.length >
        0
    ) {
        collector.blocker(
            "media.alt",
            `${imagesWithoutAltText.length} Bilder besitzen keinen Alternativtext.`,
            "CMS > Medien: fuer jedes inhaltliche Bild einen sinnvollen Alt-Text eintragen."
        );
    } else {
        collector.ok(
            "media.alt",
            "Alle Bilder besitzen einen Alternativtext."
        );
    }

    if (
        Array.isArray(
            orphanMediaFiles
        ) &&
        orphanMediaFiles.length >
            0
    ) {
        collector.warning(
            "media.orphans",
            `${orphanMediaFiles.length} Dateien im Medienvolume besitzen keinen Datenbankeintrag.`,
            `Nicht zugeordnete Dateien: ${orphanMediaFiles.join(", ")}. Nach Sichtpruefung archivieren oder entfernen.`
        );
    }
}

function checkOutdatedRepresentative(
    collector,
    snapshot
) {
    const publishedPages =
        (
            Array.isArray(
                snapshot?.pages
            )
                ? snapshot.pages
                : []
        ).filter(
            (page) =>
                page.status ===
                "published"
        );

    const publicSiteText =
        JSON.stringify({
            content:
                snapshot?.content,

            navigation:
                snapshot?.navigation,

            homeLayout:
                snapshot
                    ?.homeLayout,

            footer:
                snapshot?.footer,

            pages:
                publishedPages
        });

    if (
        /Jeannine\s+Kellermann/i.test(
            publicSiteText
        )
    ) {
        collector.blocker(
            "pages.legal.outdated-representative",
            "Der veraltete Name Jeannine Kellermann steht noch in oeffentlichen Inhalten.",
            "Den Namen aus Startseite, Footer oder betroffener Seite entfernen und neu veroeffentlichen."
        );
    } else {
        collector.ok(
            "pages.legal.outdated-representative",
            "Der veraltete Vertretungsname wurde in oeffentlichen Inhalten nicht gefunden."
        );
    }
}

export function evaluateLaunchReadiness(
    snapshot,
    {
        publicUrl = "",
        emailEnabled = false,
        requireHttps = true
    } = {}
) {
    const collector =
        createCollector();

    checkMigrations(
        collector,
        snapshot?.migrations
    );

    checkContent(
        collector,
        snapshot ?? {}
    );

    checkNavigation(
        collector,
        snapshot?.navigation
    );

    checkFooter(
        collector,
        snapshot?.footer
    );

    checkPages(
        collector,
        snapshot?.pages
    );

    checkOutdatedRepresentative(
        collector,
        snapshot
    );

    checkMedia(
        collector,
        snapshot?.media,
        snapshot
            ?.orphanMediaFiles
    );

    if (
        Number(
            snapshot
                ?.activeAdministratorCount
        ) < 1
    ) {
        collector.blocker(
            "users.administrator",
            "Es existiert kein aktives Administratorkonto.",
            "Mit docker:create-admin beziehungsweise production:create-admin ein Konto anlegen."
        );
    } else {
        collector.ok(
            "users.administrator",
            "Mindestens ein aktives Administratorkonto ist vorhanden."
        );
    }

    try {
        const parsedUrl =
            new URL(
                publicUrl
            );

        if (
            (
                requireHttps &&
                parsedUrl.protocol !==
                    "https:"
            ) ||
            (
                !requireHttps &&
                ![
                    "http:",
                    "https:"
                ].includes(
                    parsedUrl.protocol
                )
            )
        ) {
            throw new Error(
                "invalid-protocol"
            );
        }

        collector.ok(
            "runtime.public-url",
            requireHttps
                ? `Oeffentliche HTTPS-Adresse: ${parsedUrl.origin}.`
                : `Lokale Pruefadresse: ${parsedUrl.origin}.`
        );
    } catch {
        collector.blocker(
            "runtime.public-url",
            requireHttps
                ? "APP_PUBLIC_URL ist keine gueltige HTTPS-Adresse."
                : "APP_PUBLIC_URL ist keine gueltige HTTP- oder HTTPS-Adresse.",
            "Die aktive Docker-Umgebung pruefen."
        );
    }

    if (emailEnabled) {
        collector.ok(
            "runtime.email",
            "SMTP-Benachrichtigungen sind aktiviert."
        );
    } else {
        collector.warning(
            "runtime.email",
            "SMTP-Benachrichtigungen sind deaktiviert.",
            "Kontaktanfragen bleiben in der Datenbank sichtbar; fuer E-Mail-Hinweise MAIL_ENABLED=true konfigurieren."
        );
    }

    const blockers =
        collector.checks.filter(
            (check) =>
                check.level ===
                "blocker"
        );

    const warnings =
        collector.checks.filter(
            (check) =>
                check.level ===
                "warning"
        );

    return {
        ready:
            blockers.length ===
            0,

        checks:
            collector.checks,

        totals: {
            ok:
                collector.checks.length -
                blockers.length -
                warnings.length,

            warnings:
                warnings.length,

            blockers:
                blockers.length
        }
    };
}

export {
    findPlaceholder,
    isHttpLink
};
