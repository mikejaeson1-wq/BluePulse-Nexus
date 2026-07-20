import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminPage from "../components/AdminPage";

import Modal from "@shared/ui/Modal";
import Button from "@shared/ui/Button";

import PageForm from "@cms/modules/pages/components/PageForm";

import {
    getPages,
    deletePage
} from "@cms/modules/pages/services/pageService";

export default function Pages() {

    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const [pages, setPages] = useState([]);

    function loadPages() {

        setPages(getPages());

    }

    useEffect(() => {

        loadPages();

    }, []);

    function handleSave() {

        loadPages();
        setOpen(false);

    }

    function handleDelete(id) {

        if (!confirm("Seite wirklich löschen?")) {

            return;

        }

        deletePage(id);

        loadPages();

    }

    return (

        <>

            <AdminPage

                title="Seiten"

                description="Verwalte alle Seiten deiner Website."

                action={

                    <Button

                        onClick={() => setOpen(true)}

                    >

                        + Neue Seite

                    </Button>

                }

            >

                {

                    pages.length === 0 && (

                        <p>

                            Noch keine Seiten vorhanden.

                        </p>

                    )

                }

                {

                    pages.length > 0 && (

                        <table className="table table-dark table-hover align-middle">

                            <thead>

                                <tr>

                                    <th>Titel</th>
                                    <th>Slug</th>
                                    <th>Template</th>
                                    <th>Status</th>
                                    <th style={{ width: "220px" }}>Aktionen</th>

                                </tr>

                            </thead>

                            <tbody>

                                {

                                    pages.map(page => (

                                        <tr key={page.id}>

                                            <td>{page.title}</td>

                                            <td>{page.slug}</td>

                                            <td>{page.template}</td>

                                            <td>{page.status}</td>

                                            <td>

                                                <div className="d-flex gap-2">

                                                    <Button

                                                        onClick={() =>
                                                            navigate(`/admin/pages/${page.id}`)
                                                        }

                                                    >

                                                        Bearbeiten

                                                    </Button>

                                                    <Button

                                                        onClick={() =>
                                                            handleDelete(page.id)
                                                        }

                                                    >

                                                        Löschen

                                                    </Button>

                                                </div>

                                            </td>

                                        </tr>

                                    ))

                                }

                            </tbody>

                        </table>

                    )

                }

            </AdminPage>

            <Modal

                open={open}

                title="Neue Seite"

                onClose={() => setOpen(false)}

            >

                <PageForm

                    onSave={handleSave}

                />

            </Modal>

        </>

    );

}