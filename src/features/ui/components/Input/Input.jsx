import "./Input.css";

export default function Input({

    value,

    onChange,

    placeholder=""

}){

    return(

        <input

            className="bp-input"

            value={value}

            placeholder={placeholder}

            onChange={(e)=>onChange(e.target.value)}

        />

    );

}