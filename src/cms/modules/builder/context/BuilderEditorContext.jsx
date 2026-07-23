import {
    createContext,
    useContext
} from "react";

const EMPTY_EDITOR_CONTEXT = {
    enabled: false,

    selectedId: null,

    onSelectBlock:
        () => {},

    onRequestDeleteBlock:
        () => {},

    onDuplicateBlock:
        () => {},

    onMoveBlockUp:
        () => {},

    onMoveBlockDown:
        () => {},

    onAddBlockToColumn:
        () => {}
};

const BuilderEditorContext =
    createContext(
        EMPTY_EDITOR_CONTEXT
    );

export function BuilderEditorProvider({
    value,
    children
}) {
    return (
        <BuilderEditorContext.Provider
            value={{
                ...EMPTY_EDITOR_CONTEXT,
                ...value,
                enabled: true
            }}
        >
            {
                children
            }
        </BuilderEditorContext.Provider>
    );
}

export function useBuilderEditor() {
    return useContext(
        BuilderEditorContext
    );
}