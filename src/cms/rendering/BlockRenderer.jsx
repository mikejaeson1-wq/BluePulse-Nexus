import { getBlock } from "@cms/modules/builder/registry/blockRegistry";

export default function BlockRenderer({

    block,

    mode = "website"

}) {

    if (!block) {

        return null;

    }

    const definition = getBlock(block.type);

    if (!definition) {

        return (

            <div
                style={{
                    padding: "2rem",
                    border: "1px solid #ff4d4f",
                    borderRadius: "8px",
                    background: "#fff2f0"
                }}
            >

                <strong>Unbekannter Block:</strong> {block.type}

            </div>

        );

    }

    const Component = definition.component;

    return (

        <Component

            block={block}

            data={block.data}

            mode={mode}

        />

    );

}