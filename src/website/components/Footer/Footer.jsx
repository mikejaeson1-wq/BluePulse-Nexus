import "./Footer.css";

import useFooterSettings from "@shared/hooks/useFooterSettings";
import useSiteNavigation from "@shared/hooks/useSiteNavigation";

function isExternalLink(href) {
    return /^https?:\/\//i.test(
        href ?? ""
    );
}

function getLinkAttributes(href) {
    const external =
        isExternalLink(href);

    return {
        target:
            external
                ? "_blank"
                : "_self",

        rel:
            external
                ? "noopener noreferrer"
                : undefined
    };
}

export default function Footer() {
    const settings =
        useFooterSettings();

    const navigation =
        useSiteNavigation();

    const visibleNavigation =
        navigation.items.filter(
            (item) => item.enabled
        );

    const visibleSocialLinks =
        settings.socialLinks.filter(
            (link) =>
                link.enabled &&
                link.href
        );

    const visibleLegalLinks =
        settings.legalLinks.filter(
            (link) =>
                link.enabled &&
                link.href
        );

    const cta =
        navigation.cta;

    const currentYear =
        new Date().getFullYear();

    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    return (
        <footer
            id="footer"
            className="footer"
        >
            <div className="footer__glow" />

            <div className="footer__container">
                <div className="footer__grid">
                    <div className="footer__brand">
                        <a
                            className="footer__logo"
                            href="/"
                            aria-label="BluePulse Startseite"
                        >
                            <span>
                                {
                                    settings
                                        .brandPrimary
                                }
                            </span>

                            {
                                settings
                                    .brandSecondary
                            }
                        </a>

                        {
                            settings.slogan && (
                                <strong className="footer__slogan">
                                    {
                                        settings.slogan
                                    }
                                </strong>
                            )
                        }

                        {
                            settings.description && (
                                <p>
                                    {
                                        settings
                                            .description
                                    }
                                </p>
                            )
                        }

                        {
                            visibleSocialLinks.length >
                            0 && (
                                <div className="footer__socials">
                                    {
                                        visibleSocialLinks.map(
                                            (link) => {
                                                const attributes =
                                                    getLinkAttributes(
                                                        link.href
                                                    );

                                                return (
                                                    <a
                                                        key={link.id}
                                                        href={link.href}
                                                        target={
                                                            attributes.target
                                                        }
                                                        rel={
                                                            attributes.rel
                                                        }
                                                        aria-label={
                                                            link.label
                                                        }
                                                        title={
                                                            link.label
                                                        }
                                                    >
                                                        <i
                                                            className={
                                                                `bi ${link.icon}`
                                                            }
                                                            aria-hidden="true"
                                                        />
                                                    </a>
                                                );
                                            }
                                        )
                                    }
                                </div>
                            )
                        }
                    </div>

                    {
                        settings.showNavigation &&
                        visibleNavigation.length >
                        0 && (
                            <div className="footer__column">
                                <h2>
                                    Navigation
                                </h2>

                                <nav
                                    className="footer__navigation"
                                    aria-label="Footer-Navigation"
                                >
                                    {
                                        visibleNavigation.map(
                                            (item) => {
                                                const attributes =
                                                    getLinkAttributes(
                                                        item.href
                                                    );

                                                return (
                                                    <a
                                                        key={item.id}
                                                        href={item.href}
                                                        target={
                                                            attributes.target
                                                        }
                                                        rel={
                                                            attributes.rel
                                                        }
                                                    >
                                                        {
                                                            item.label
                                                        }
                                                    </a>
                                                );
                                            }
                                        )
                                    }
                                </nav>
                            </div>
                        )
                    }

                    {
                        settings.showContact && (
                            <div className="footer__column">
                                <h2>
                                    Kontakt
                                </h2>

                                <div className="footer__contact">
                                    {
                                        settings.email && (
                                            <a
                                                href={
                                                    `mailto:${settings.email}`
                                                }
                                            >
                                                <i
                                                    className="bi bi-envelope"
                                                    aria-hidden="true"
                                                />

                                                <span>
                                                    {
                                                        settings.email
                                                    }
                                                </span>
                                            </a>
                                        )
                                    }

                                    {
                                        settings.location && (
                                            <div>
                                                <i
                                                    className="bi bi-geo-alt"
                                                    aria-hidden="true"
                                                />

                                                <span>
                                                    {
                                                        settings
                                                            .location
                                                    }
                                                </span>
                                            </div>
                                        )
                                    }
                                </div>

                                {
                                    settings
                                        .showDonationButton &&
                                    cta.enabled &&
                                    cta.href && (
                                        <a
                                            className="footer__donation"
                                            href={cta.href}
                                            target={
                                                cta.target
                                            }
                                            rel={
                                                cta.target ===
                                                "_blank"
                                                    ? "noopener noreferrer"
                                                    : undefined
                                            }
                                        >
                                            <i
                                                className="bi bi-heart-fill"
                                                aria-hidden="true"
                                            />

                                            {cta.label}
                                        </a>
                                    )
                                }
                            </div>
                        )
                    }
                </div>

                <div className="footer__bottom">
                    <div>
                        <span>
                            © {currentYear}{" "}
                            {
                                settings
                                    .copyrightText
                            }
                        </span>

                        {
                            visibleLegalLinks.length >
                            0 && (
                                <nav
                                    className="footer__legal"
                                    aria-label="Rechtliche Informationen"
                                >
                                    {
                                        visibleLegalLinks.map(
                                            (link) => {
                                                const attributes =
                                                    getLinkAttributes(
                                                        link.href
                                                    );

                                                return (
                                                    <a
                                                        key={link.id}
                                                        href={link.href}
                                                        target={
                                                            attributes.target
                                                        }
                                                        rel={
                                                            attributes.rel
                                                        }
                                                    >
                                                        {
                                                            link.label
                                                        }
                                                    </a>
                                                );
                                            }
                                        )
                                    }
                                </nav>
                            )
                        }
                    </div>

                    <button
                        type="button"
                        className="footer__topButton"
                        onClick={scrollToTop}
                        aria-label="Nach oben scrollen"
                        title="Nach oben"
                    >
                        <i
                            className="bi bi-arrow-up"
                            aria-hidden="true"
                        />
                    </button>
                </div>
            </div>
        </footer>
    );
}