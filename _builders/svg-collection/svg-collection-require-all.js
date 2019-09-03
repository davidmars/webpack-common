/**
 *
 * Ce fichier appelé depuis webpack importe tous les fichiers svg
 *
 */
function requireAll(r) {
    r.keys().forEach(r);
}
requireAll(
    require.context('../../src', true, /svg-collection-(.*)\/(.*)\.svg$/)
);



