import "@cms/modules/builder/registry/registerBlocks";

import ThemeContext from "@website/theme/ThemeContext";
import defaultTheme from "@website/theme/defaultTheme";

import BlockRenderer from "./BlockRenderer";

export default function WebsiteRenderer({
    page,
    mode = "website"
}) {
    if (!page) {
        return null;
    }

    const blocks =
        Array.isArray(
            page.blocks
        )
            ? page.blocks
            : [];

    const renderedBlocks =
        blocks.map(
            (
                block
            ) => (
                <BlockRenderer
                    key={
                        block.id
                    }
                    block={
                        block
                    }
                    mode={
                        mode
                    }
                />
            )
        );

    if (
        mode ===
        "editor"
    ) {
        return (
            <ThemeContext.Provider
                value={
                    page.theme ??
                    defaultTheme
                }
            >
                {
                    renderedBlocks
                }
            </ThemeContext.Provider>
        );
    }

    return (
        <ThemeContext.Provider
            value={
                page.theme ??
                defaultTheme
            }
        >
            <main
                id="main-content"
                className="bp-rendered-page"
                tabIndex={-1}
                aria-label={
                    mode ===
                    "preview"
                        ? "Seitenvorschau"
                        : undefined
                }
            >
                {
                    renderedBlocks
                }
            </main>
        </ThemeContext.Provider>
    );
}
