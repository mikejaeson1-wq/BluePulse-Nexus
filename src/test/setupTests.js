import {
    afterEach,
    vi
} from "vitest";

import {
    cleanup
} from "@testing-library/react";

afterEach(() => {
    cleanup();

    globalThis.document
        .body
        .replaceChildren();

    globalThis.document.title =
        "";
});

Object.defineProperty(
    globalThis.window,
    "matchMedia",
    {
        configurable:
            true,

        writable:
            true,

        value:
            (
                query
            ) => ({
                matches:
                    false,

                media:
                    query,

                onchange:
                    null,

                addListener:
                    vi.fn(),

                removeListener:
                    vi.fn(),

                addEventListener:
                    vi.fn(),

                removeEventListener:
                    vi.fn(),

                dispatchEvent:
                    vi.fn()
            })
    }
);

Object.defineProperty(
    globalThis.HTMLElement
        .prototype,
    "scrollIntoView",
    {
        configurable:
            true,

        value:
            vi.fn()
    }
);

Object.defineProperty(
    globalThis.window,
    "requestAnimationFrame",
    {
        configurable:
            true,

        value:
            (
                callback
            ) =>
                globalThis.setTimeout(
                    callback,
                    0
                )
    }
);

Object.defineProperty(
    globalThis.window,
    "cancelAnimationFrame",
    {
        configurable:
            true,

        value:
            (
                identifier
            ) =>
                globalThis.clearTimeout(
                    identifier
                )
    }
);
