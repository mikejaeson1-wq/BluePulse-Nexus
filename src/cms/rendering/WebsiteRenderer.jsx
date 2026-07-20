import ThemeContext from "../theme/ThemeContext";

import defaultTheme from "../theme/defaultTheme";

import BlockRenderer from "./BlockRenderer";

export default function WebsiteRenderer({

    page,

    mode="website"

}){

    return(

        <ThemeContext.Provider

            value={page.theme || defaultTheme}

        >

            {

                page.blocks.map(block=>(

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