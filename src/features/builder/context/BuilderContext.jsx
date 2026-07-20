import {

    createContext,
    useContext

} from "react";

const BuilderContext = createContext(null);

export function BuilderProvider({

    value,

    children

}){

    return(

        <BuilderContext.Provider value={value}>

            {children}

        </BuilderContext.Provider>

    );

}

export function useBuilderContext(){

    const context = useContext(BuilderContext);

    if(!context){

        throw new Error(

            "useBuilderContext muss innerhalb eines BuilderProvider verwendet werden."

        );

    }

    return context;

}