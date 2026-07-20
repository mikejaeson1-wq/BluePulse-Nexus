import "./PageHeader.css";

export default function PageHeader({

    title,

    subtitle,

    actions

}){

    return(

        <div className="bp-page-header">

            <div>

                <h1>

                    {title}

                </h1>

                {

                    subtitle && (

                        <p>

                            {subtitle}

                        </p>

                    )

                }

            </div>

            <div>

                {actions}

            </div>

        </div>

    );

}