import "./Button.css";

export default function Button({

    children,

    onClick,

    type = "button"

}){

    return(

        <button

            className="bp-button"

            type={type}

            onClick={onClick}

        >

            {children}

        </button>

    );

}