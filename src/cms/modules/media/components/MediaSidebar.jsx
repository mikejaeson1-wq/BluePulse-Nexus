import "./MediaSidebar.css";

const folders = [

    "Alle Medien",
    "Favoriten",
    "Bilder",
    "Videos",
    "Dokumente",
    "Audio",
    "",
    "Logos",
    "Hero",
    "Social Media",
    "Kampagnen",
    "Tiere"

];

export default function MediaSidebar({

    selected,

    onSelect

}) {

    return (

        <aside className="bp-media-sidebar">

            {

                folders.map((folder,index)=>{

                    if(folder===""){

                        return <hr key={index}/>;

                    }

                    return(

                        <button

                            key={folder}

                            className={

                                selected===folder

                                ? "active"

                                : ""

                            }

                            onClick={()=>onSelect(folder)}

                        >

                            {folder}

                        </button>

                    );

                })

            }

        </aside>

    );

}