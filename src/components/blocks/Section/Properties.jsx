export default function SectionProperties({

    block,

    onChange

}) {

    function update(field,value){

        onChange({

            ...block,

            data:{

                ...block.data,

                [field]:value

            }

        });

    }

    return(

        <>

            <div className="mb-3">

                <label>Titel</label>

                <input

                    className="form-control"

                    value={block.data.title}

                    onChange={(e)=>update("title",e.target.value)}

                />

            </div>

            <div className="mb-3">

                <label>Hintergrund</label>

                <input

                    type="color"

                    className="form-control form-control-color"

                    value={block.data.background}

                    onChange={(e)=>update("background",e.target.value)}

                />

            </div>

            <div className="mb-3">

                <label>Max Width</label>

                <input

                    className="form-control"

                    value={block.data.maxWidth}

                    onChange={(e)=>update("maxWidth",e.target.value)}

                />

            </div>

            <div className="mb-3">

                <label>Padding oben</label>

                <input

                    className="form-control"

                    value={block.data.paddingTop}

                    onChange={(e)=>update("paddingTop",e.target.value)}

                />

            </div>

            <div className="mb-3">

                <label>Padding unten</label>

                <input

                    className="form-control"

                    value={block.data.paddingBottom}

                    onChange={(e)=>update("paddingBottom",e.target.value)}

                />

            </div>

        </>

    );

}