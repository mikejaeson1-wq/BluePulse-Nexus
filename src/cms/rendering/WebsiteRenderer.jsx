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

    const blocks = Array.isArray(
        page.blocks
    )
        ? page.blocks
        : [];

    return (
        <ThemeContext.Provider
            value={
                page.theme ??
                defaultTheme
            }
        >
            {
                blocks.map(block => (
                    <BlockRenderer
                        key={block.id}
                        block={block}
                        mode={mode}
                    />
                ))
            }
        </ThemeContext.Provider>
    );
}