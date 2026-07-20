import { useEffect, useState } from "react";

import Button from "../../features/ui/components/Button";

import {
    createPage,
    generateSlug
} from "../services/pageService";

export default function PageForm({

    onSave

}){

    const [title,setTitle] = useState("");

    const [slug,setSlug] = useState("");

    const [template,setTemplate] = useState("default");

    useEffect(()=>{

        setSlug(

            generateSlug(title)

        );

    },[title]);

    function handleSubmit(e){

        e.preventDefault();

        if(!title.trim()){

            return;

        }

        createPage({

            title,

            template

        });

        setTitle("");

        setSlug("");

        setTemplate("default");

        onSave();

    }

    return(

        <form onSubmit={handleSubmit}>

            <div className="mb-3">

                <label className="form-label">

                    Titel

                </label>

                <input

                    className="form-control"

                    value={title}

                    onChange={(e)=>setTitle(e.target.value)}

                />

            </div>

            <div className="mb-3">

                <label className="form-label">

                    Slug

                </label>

                <input

                    className="form-control"

                    value={slug}

                    disabled

                />

            </div>

            <div className="mb-4">

                <label className="form-label">

                    Template

                </label>

                <select

                    className="form-select"

                    value={template}

                    onChange={(e)=>setTemplate(e.target.value)}

                >

                    <option value="default">

                        Standard

                    </option>

                    <option value="landing">

                        Landingpage

                    </option>

                </select>

            </div>

            <Button

                type="submit"

            >

                Seite erstellen

            </Button>

        </form>

    );

}