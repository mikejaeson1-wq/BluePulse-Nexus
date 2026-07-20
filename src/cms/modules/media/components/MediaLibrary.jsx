import { useMemo, useState } from "react";

import Button from "@shared/ui/Button/Button";
import Input from "@shared/ui/Input/Input";

import MediaGrid from "./MediaGrid";
import MediaSidebar from "./MediaSidebar";

import useMedia from "../hooks/useMedia";

import "./MediaLibrary.css";

export default function MediaLibrary({

    onSelect

}){

    const { images } = useMedia();

    const [search,setSearch]=useState("");

    const [folder,setFolder]=useState("Alle Medien");

    const filtered=useMemo(()=>{

        return images.filter(file=>{

            if(

                folder==="Favoriten"

                &&

                !file.favorite

            ){

                return false;

            }

            if(

                folder!=="Alle Medien"

                &&

                folder!=="Favoriten"

                &&

                ["Bilder","Videos","Dokumente","Audio"].includes(folder)===false

                &&

                file.folder!==folder

            ){

                return false;

            }

            const text=(

                file.name+

                file.folder+

                file.tags.join(" ")

            ).toLowerCase();

            return text.includes(

                search.toLowerCase()

            );

        });

    },[images,folder,search]);

    return(

        <div className="bp-media-layout">

            <MediaSidebar

                selected={folder}

                onSelect={setFolder}

            />

            <div className="bp-media-content">

                <div className="bp-media-toolbar">

                    <Input

                        value={search}

                        onChange={setSearch}

                        placeholder="🔍 Medien durchsuchen..."

                    />

                    <Button>

                        Upload

                    </Button>

                </div>

                <MediaGrid

                    files={filtered}

                    onSelect={onSelect}

                />

            </div>

        </div>

    );

}