import { getBlocks } from "../registry/blockRegistry";

export default function Sidebar({

    onAdd

}) {

    const blocks = getBlocks();

    const categories = [...new Set(

        blocks.map(block => block.category ?? "Allgemein")

    )];

    return (

        <aside className="bp-builder-sidebar">

            <h2>Blöcke</h2>

            {

                categories.map(category => (

                    <div

                        key={category}

                        className="bp-sidebar-category"

                    >

                        <h3>{category}</h3>

                        {

                            blocks

                                .filter(

                                    block =>

                                        (block.category ?? "Allgemein") === category

                                )

                                .map(block => (

                                    <button

                                        key={block.type}

                                        className="bp-sidebar-block"

                                        onClick={() => onAdd(block)}

                                    >

                                        <span>

                                            {block.icon ?? "📦"}

                                        </span>

                                        <span>

                                            {block.name}

                                        </span>

                                    </button>

                                ))

                        }

                    </div>

                ))

            }

        </aside>

    );

}