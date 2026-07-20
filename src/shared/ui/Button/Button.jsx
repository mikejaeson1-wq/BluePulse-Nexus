import "./Button.css";

export default function Button({

    children,

    variant = "primary",

    size = "md",

    type = "button",

    disabled = false,

    className = "",

    ...props

}){

    return(

        <button

            type={type}

            disabled={disabled}

            className={

                `bp-btn bp-btn-${variant} bp-btn-${size} ${className}`

            }

            {...props}

        >

            {children}

        </button>

    );

}