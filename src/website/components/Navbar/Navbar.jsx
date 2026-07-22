import "./Navbar.css";
import "./NavbarHighlighted.css";

import {
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import {
    useLocation
} from "react-router-dom";

import useSiteNavigation from "@shared/hooks/useSiteNavigation";

function getChildren(
    items,
    parentId
) {
    return items
        .filter(
            (item) =>
                item.parentId ===
                parentId
        )
        .sort(
            (
                firstItem,
                secondItem
            ) =>
                firstItem.order -
                secondItem.order
        );
}

function buildNavigationTree(
    items,
    parentId = null,
    visited = new Set()
) {
    return getChildren(
        items,
        parentId
    ).map(
        (item) => {
            if (
                visited.has(
                    item.id
                )
            ) {
                return {
                    ...item,

                    children: []
                };
            }

            const nextVisited =
                new Set(
                    visited
                );

            nextVisited.add(
                item.id
            );

            return {
                ...item,

                children:
                    buildNavigationTree(
                        items,
                        item.id,
                        nextVisited
                    )
            };
        }
    );
}

function isExternalLink(
    href
) {
    return /^https?:\/\//i
        .test(
            href ??
            ""
        );
}

function getRel(
    target,
    href
) {
    return (
        target ===
            "_blank" ||
        isExternalLink(
            href
        )
    )
        ? "noopener noreferrer"
        : undefined;
}

function normalizePath(
    value
) {
    const path =
        String(
            value ??
            ""
        )
            .trim()
            .split(
                "?"
            )[0]
            .split(
                "#"
            )[0];

    if (!path) {
        return "/";
    }

    const normalizedPath =
        path.startsWith(
            "/"
        )
            ? path
            : `/${path}`;

    if (
        normalizedPath.length >
            1 &&
        normalizedPath.endsWith(
            "/"
        )
    ) {
        return normalizedPath.slice(
            0,
            -1
        );
    }

    return normalizedPath;
}

function isCurrentPage(
    href,
    pathname
) {
    if (
        !href ||
        isExternalLink(
            href
        )
    ) {
        return false;
    }

    return normalizePath(
        href
    ) ===
        normalizePath(
            pathname
        );
}

function getLinkClassName({
    highlighted,
    active
}) {
    return [
        "navbar__link",

        highlighted
            ? "navbar__link--highlighted"
            : "",

        active
            ? "navbar__link--active"
            : ""
    ]
        .filter(
            Boolean
        )
        .join(
            " "
        );
}

function NavigationItem({
    item,
    depth,
    pathname,
    openMenus,
    toggleMenu,
    closeNavigation
}) {
    const hasChildren =
        item.children.length >
        0;

    const menuOpen =
        openMenus.has(
            item.id
        );

    const active =
        isCurrentPage(
            item.href,
            pathname
        );

    const highlighted =
        Boolean(
            item.highlighted
        );

    function handleMouseEnter() {
        if (
            globalThis.window
                .matchMedia(
                    "(min-width: 951px)"
                )
                .matches
        ) {
            toggleMenu(
                item.id,
                true
            );
        }
    }

    function handleMouseLeave() {
        if (
            globalThis.window
                .matchMedia(
                    "(min-width: 951px)"
                )
                .matches
        ) {
            toggleMenu(
                item.id,
                false
            );
        }
    }

    return (
        <li
            className={
                [
                    "navbar__item",

                    hasChildren
                        ? "navbar__item--hasChildren"
                        : "",

                    menuOpen
                        ? "navbar__item--open"
                        : "",

                    depth >
                        0
                        ? "navbar__item--nested"
                        : "",

                    highlighted
                        ? "navbar__item--highlighted"
                        : "",

                    active
                        ? "navbar__item--active"
                        : ""
                ]
                    .filter(
                        Boolean
                    )
                    .join(
                        " "
                    )
            }
            onMouseEnter={
                handleMouseEnter
            }
            onMouseLeave={
                handleMouseLeave
            }
        >
            <div className="navbar__linkRow">
                {
                    item.href ? (
                        <a
                            className={
                                getLinkClassName({
                                    highlighted,
                                    active
                                })
                            }
                            href={
                                item.href
                            }
                            target={
                                item.target
                            }
                            rel={
                                getRel(
                                    item.target,
                                    item.href
                                )
                            }
                            aria-current={
                                active
                                    ? "page"
                                    : undefined
                            }
                            onClick={
                                closeNavigation
                            }
                        >
                            {
                                highlighted && (
                                    <i
                                        className="bi bi-stars navbar__highlightIcon"
                                        aria-hidden="true"
                                    />
                                )
                            }

                            <span>
                                {
                                    item.label
                                }
                            </span>
                        </a>
                    ) : (
                        <button
                            type="button"
                            className={
                                `${getLinkClassName({
                                    highlighted,
                                    active
                                })} navbar__link--button`
                            }
                            onClick={
                                () =>
                                    toggleMenu(
                                        item.id
                                    )
                            }
                        >
                            {
                                highlighted && (
                                    <i
                                        className="bi bi-stars navbar__highlightIcon"
                                        aria-hidden="true"
                                    />
                                )
                            }

                            <span>
                                {
                                    item.label
                                }
                            </span>
                        </button>
                    )
                }

                {
                    hasChildren && (
                        <button
                            type="button"
                            className="navbar__submenuToggle"
                            aria-label={
                                `${item.label} Untermenü öffnen`
                            }
                            aria-expanded={
                                menuOpen
                            }
                            onClick={
                                (
                                    event
                                ) => {
                                    event.stopPropagation();

                                    toggleMenu(
                                        item.id
                                    );
                                }
                            }
                        >
                            <i
                                className="bi bi-chevron-down"
                                aria-hidden="true"
                            />
                        </button>
                    )
                }
            </div>

            {
                hasChildren && (
                    <ul
                        className="navbar__submenu"
                        aria-hidden={
                            !menuOpen
                        }
                    >
                        {
                            item.children.map(
                                (
                                    child
                                ) => (
                                    <NavigationItem
                                        key={
                                            child.id
                                        }
                                        item={
                                            child
                                        }
                                        depth={
                                            depth +
                                            1
                                        }
                                        pathname={
                                            pathname
                                        }
                                        openMenus={
                                            openMenus
                                        }
                                        toggleMenu={
                                            toggleMenu
                                        }
                                        closeNavigation={
                                            closeNavigation
                                        }
                                    />
                                )
                            )
                        }
                    </ul>
                )
            }
        </li>
    );
}

export default function Navbar() {
    const navigation =
        useSiteNavigation();

    const location =
        useLocation();

    const navbarRef =
        useRef(
            null
        );

    const [
        mobileOpen,
        setMobileOpen
    ] =
        useState(
            false
        );

    const [
        openMenus,
        setOpenMenus
    ] =
        useState(
            () =>
                new Set()
        );

    const visibleItems =
        useMemo(
            () =>
                (
                    navigation.items ??
                    []
                ).filter(
                    (item) =>
                        item.enabled
                ),
            [
                navigation.items
            ]
        );

    const navigationTree =
        useMemo(
            () =>
                buildNavigationTree(
                    visibleItems
                ),
            [
                visibleItems
            ]
        );

    const cta =
        navigation.cta ?? {
            enabled:
                false,

            label:
                "",

            href:
                "",

            target:
                "_self"
        };

    function toggleMenu(
        itemId,
        forcedState
    ) {
        setOpenMenus(
            (
                currentMenus
            ) => {
                const nextMenus =
                    new Set(
                        currentMenus
                    );

                const shouldOpen =
                    forcedState !==
                        undefined
                        ? forcedState
                        : !nextMenus.has(
                            itemId
                        );

                if (shouldOpen) {
                    nextMenus.add(
                        itemId
                    );
                } else {
                    nextMenus.delete(
                        itemId
                    );
                }

                return nextMenus;
            }
        );
    }

    function closeNavigation() {
        setMobileOpen(
            false
        );

        setOpenMenus(
            new Set()
        );
    }

    useEffect(() => {
        closeNavigation();
    }, [
        location.pathname,
        location.hash
    ]);

    useEffect(() => {
        function handleOutsideClick(
            event
        ) {
            if (
                navbarRef.current &&
                !navbarRef.current
                    .contains(
                        event.target
                    )
            ) {
                closeNavigation();
            }
        }

        function handleEscape(
            event
        ) {
            if (
                event.key ===
                "Escape"
            ) {
                closeNavigation();
            }
        }

        globalThis.document
            .addEventListener(
                "mousedown",
                handleOutsideClick
            );

        globalThis.document
            .addEventListener(
                "keydown",
                handleEscape
            );

        return () => {
            globalThis.document
                .removeEventListener(
                    "mousedown",
                    handleOutsideClick
                );

            globalThis.document
                .removeEventListener(
                    "keydown",
                    handleEscape
                );
        };
    }, []);

    return (
        <header
            ref={
                navbarRef
            }
            className={
                mobileOpen
                    ? "navbar navbar--open"
                    : "navbar"
            }
        >
            <a
                className="navbar__logo"
                href="/"
                aria-label="BluePulse Startseite"
                onClick={
                    closeNavigation
                }
            >
                <span className="logo-blue">
                    Blue
                </span>

                Pulse
            </a>

            <button
                type="button"
                className="navbar__mobileToggle"
                aria-label={
                    mobileOpen
                        ? "Navigation schließen"
                        : "Navigation öffnen"
                }
                aria-expanded={
                    mobileOpen
                }
                onClick={
                    () =>
                        setMobileOpen(
                            (
                                currentValue
                            ) =>
                                !currentValue
                        )
                }
            >
                <span />
                <span />
                <span />
            </button>

            <div className="navbar__navigationWrapper">
                <nav
                    className="navbar__navigation"
                    aria-label="Hauptnavigation"
                >
                    <ul className="navbar__list">
                        {
                            navigationTree.map(
                                (
                                    item
                                ) => (
                                    <NavigationItem
                                        key={
                                            item.id
                                        }
                                        item={
                                            item
                                        }
                                        depth={
                                            0
                                        }
                                        pathname={
                                            location.pathname
                                        }
                                        openMenus={
                                            openMenus
                                        }
                                        toggleMenu={
                                            toggleMenu
                                        }
                                        closeNavigation={
                                            closeNavigation
                                        }
                                    />
                                )
                            )
                        }
                    </ul>
                </nav>

                {
                    cta.enabled &&
                    cta.href && (
                        <a
                            className="navbar__button"
                            href={
                                cta.href
                            }
                            target={
                                cta.target
                            }
                            rel={
                                getRel(
                                    cta.target,
                                    cta.href
                                )
                            }
                            onClick={
                                closeNavigation
                            }
                        >
                            {
                                cta.label
                            }
                        </a>
                    )
                }
            </div>
        </header>
    );
}