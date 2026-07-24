/**
 * Kompatibilitaetsmodul fuer den historischen CMS-Importpfad.
 *
 * Die aktive Implementierung liegt zentral im Shared-Bereich, damit Website,
 * CMS und API dieselben Regeln fuer die Seitennavigation verwenden.
 */
export {
    getNavigationParentOptions,
    loadPageNavigationContext,
    removePageNavigation,
    synchronizePageNavigation
} from "@shared/navigation/pageNavigationSync";
