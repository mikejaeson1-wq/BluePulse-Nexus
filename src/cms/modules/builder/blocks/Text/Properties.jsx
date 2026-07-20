export default function TextProperties({

    block,

    onChange

}){

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

                <label>

                    Überschrift

                </label>

                <input

                    className="form-control"

                    value={block.data.title}

                    onChange={(e)=>update("title",e.target.value)}

                />

            </div>

            <div className="mb-3">

                <label>

                    Text

                </label>

                <textarea

                    rows="8"

                    className="form-control"

                    value={block.data.text}

                    onChange={(e)=>update("text",e.target.value)}

                />

            </div>

        </>

    );

}