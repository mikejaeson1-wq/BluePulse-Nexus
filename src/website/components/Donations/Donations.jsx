import "./Donations.css";

import {
    useRef
} from "react";

import Button from "../ui/Button/Button";
import MediaImage from "../ui/MediaImage/MediaImage";

import useReveal from "../../hooks/useReveal";

import useSiteContentSection from "@shared/hooks/useSiteContentSection";

function isExternalLink(href) {
    return /^https?:\/\//i.test(
        href ?? ""
    );
}

function getProgress(
    currentAmount,
    targetAmount
) {
    const current =
        Math.max(
            0,
            Number(
                currentAmount
            ) || 0
        );

    const target =
        Math.max(
            0,
            Number(
                targetAmount
            ) || 0
        );

    if (target <= 0) {
        return 0;
    }

    return Math.min(
        100,
        Math.round(
            (
                current /
                target
            ) * 100
        )
    );
}

function formatAmount(
    amount,
    currency
) {
    const numericAmount =
        Number(amount) || 0;

    return `${numericAmount.toLocaleString(
        "de-DE"
    )} ${currency ?? ""}`.trim();
}

export default function Donations() {
    const sectionRef =
        useRef();

    const content =
        useSiteContentSection(
            "donations"
        );

    useReveal(
        sectionRef,
        {
            y: 80,
            duration: 1
        }
    );

    if (!content) {
        return null;
    }

    const progress =
        getProgress(
            content.currentAmount,
            content.targetAmount
        );

    const showGoal =
        Number(
            content.targetAmount
        ) > 0;

    return (
        <section
            id="spenden"
            ref={sectionRef}
            className="donations"
        >
            <div className="donations__glow donations__glow--left" />
            <div className="donations__glow donations__glow--right" />

            <div className="donations__header">
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

            {
                showGoal && (
                    <div className="donations__goal">
                        <div className="donations__goalContent">
                            <div>
                                <span className="donations__goalLabel">
                                    Aktueller Stand
                                </span>

                                <h3>
                                    {
                                        content.goalTitle
                                    }
                                </h3>

                                <p>
                                    {
                                        content.goalDescription
                                    }
                                </p>
                            </div>

                            <div className="donations__goalNumbers">
                                <strong>
                                    {
                                        formatAmount(
                                            content.currentAmount,
                                            content.currency
                                        )
                                    }
                                </strong>

                                <span>
                                    von{" "}
                                    {
                                        formatAmount(
                                            content.targetAmount,
                                            content.currency
                                        )
                                    }
                                </span>
                            </div>
                        </div>

                        <div
                            className="donations__progress"
                            role="progressbar"
                            aria-valuenow={
                                progress
                            }
                            aria-valuemin="0"
                            aria-valuemax="100"
                            aria-label="Spendenfortschritt"
                        >
                            <div
                                className="donations__progressValue"
                                style={{
                                    width:
                                        `${progress}%`
                                }}
                            />
                        </div>

                        <div className="donations__progressFooter">
                            <span>
                                {progress}% erreicht
                            </span>

                            <span>
                                Jeder Beitrag hilft
                            </span>
                        </div>
                    </div>
                )
            }

            <div className="donations__grid">
                {
                    content.methods.map(
                        (method) => {
                            const external =
                                isExternalLink(
                                    method.href
                                );

                            return (
                                <article
                                    key={
                                        method.id
                                    }
                                    className="donations__card"
                                >
                                    <MediaImage
                                        reference={
                                            method.image
                                        }
                                        alt={
                                            method.title
                                        }
                                    />

                                    <div className="donations__cardHeader">
                                        <i
                                            className={
                                                `bi ${method.icon} donations__icon`
                                            }
                                            aria-hidden="true"
                                        />

                                        {
                                            method.badge && (
                                                <span className="donations__badge">
                                                    {
                                                        method.badge
                                                    }
                                                </span>
                                            )
                                        }
                                    </div>

                                    <h3>
                                        {
                                            method.title
                                        }
                                    </h3>

                                    <p>
                                        {
                                            method.text
                                        }
                                    </p>

                                    {
                                        method.buttonLabel &&
                                        method.href && (
                                            <Button
                                                href={
                                                    method.href
                                                }
                                                target={
                                                    external
                                                        ? "_blank"
                                                        : "_self"
                                                }
                                            >
                                                {
                                                    method.buttonLabel
                                                }

                                                <i
                                                    className="bi bi-arrow-up-right"
                                                    aria-hidden="true"
                                                />
                                            </Button>
                                        )
                                    }
                                </article>
                            );
                        }
                    )
                }
            </div>

            {
                (
                    content.transparencyTitle ||
                    content.transparencyText
                ) && (
                    <div className="donations__transparency">
                        <i
                            className="bi bi-shield-check"
                            aria-hidden="true"
                        />

                        <div>
                            <h3>
                                {
                                    content.transparencyTitle
                                }
                            </h3>

                            <p>
                                {
                                    content.transparencyText
                                }
                            </p>
                        </div>
                    </div>
                )
            }
        </section>
    );
}