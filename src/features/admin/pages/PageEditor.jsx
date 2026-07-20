import { useNavigate, useParams } from "react-router-dom";

import AdminPage from "../components/AdminPage";

import Builder from "../../builder/components/Builder";

import Button from "../../ui/components/Button";

export default function PageEditor() {

    const navigate = useNavigate();

    const { id } = useParams();

    return (

        <AdminPage

            title="BluePulse Builder"

            description={`Seiten-ID: ${id}`}

            action={

                <div className="d-flex gap-2">

                    <Button

                        onClick={() => navigate("/admin/pages")}

                    >

                        ← Zurück

                    </Button>

                    <Button>

                        💾 Speichern

                    </Button>

                </div>

            }

        >

            <Builder/>

        </AdminPage>

    );

}