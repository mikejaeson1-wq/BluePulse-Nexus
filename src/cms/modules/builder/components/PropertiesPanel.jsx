import { getBlock } from "../registry/blockRegistry";

export default function PropertiesPanel({

    block,

    onChange

}) {

    if (!block) {

        return (

            <div className="bp-properties-empty">

                <h3>Eigenschaften</h3>

                <p>Wähle einen Block aus.</p>

            </div>

        );

    }

    const definition = getBlock(block.type);

    if (!definition) {

        return (

            <div className="bp-properties-empty">

                <h3>Eigenschaften</h3>

                <p>Block "{block.type}" ist nicht registriert.</p>

            </div>

        );

    }

    if (!definition.properties) {

        return (

            <div className="bp-properties-empty">

                <h3>Eigenschaften</h3>

                <p>Dieser Block besitzt keine Eigenschaften.</p>

            </div>

        );

    }

    const PropertiesComponent = definition.properties;

    return (

        <PropertiesComponent

            block={block}

            onChange={onChange}

        />

    );

}