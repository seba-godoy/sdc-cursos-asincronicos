# GH-01.3 · QA automatizada y recuperación segura

## Qué se valida automáticamente

`.github/workflows/quality.yml` se ejecuta ante pushes a `main`, pull requests con destino a `main` y ejecuciones manuales. Repite la validación en Python 3.11 y 3.12. Comprueba hashes y tamaño, regenera el HTML, ejecuta las 11 pruebas existentes, revisa la sintaxis JavaScript y practica controles de recuperación. No configura secretos, no instala dependencias externas del proyecto, no publica en Vercel ni escribe en el repositorio remoto. Los permisos del token se limitan a `contents: read`.

### Prueba de protección contra corrupción

`scripts/qa_guardrails.py` clona el repositorio **localmente** en un directorio temporal, añade un byte al dataset canónico y exige que el constructor falle con una discrepancia de hash. Luego restaura el dataset desde Git y confirma que el build vuelve a pasar.

### Prueba de recuperación de un commit

En la misma copia local temporal modifica `README.md`, crea un commit accidental de prueba y ejecuta `git revert` para deshacerlo con un nuevo commit. Verifica que el README se restaura exactamente, que el árbol está limpio, que el build funciona y que `main` no se modificó.

**Importante:** se trata de una simulación, no de una restauración real de producción ni de una prueba de reversión en Vercel.

## Procedimiento ante un cambio erróneo en GitHub

1. Detener nuevas integraciones o publicaciones mientras se diagnostica.
2. Identificar el commit estable en GitHub y revisar el diff, logs y los checks de Actions.
3. Trabajar preferentemente en una rama de corrección. Para un commit accidental aislado, usar `git revert <SHA_DAÑINO>` para generar un nuevo commit reversible, sin `git push --force`.
4. Abrir PR hacia `main`; revisar que el QA pase, las cifras se mantengan y el HTML se reconstruya correctamente.
5. Autorizar la fusión después de revisar efectos. **El despliegue a Vercel es otra acción**, separada y pendiente de aprobación del responsable.
6. Si el problema implica credenciales, revocarlas/rotarlas; un revert no elimina secretos expuestos del historial.

## Ejecución local

```sh
python scripts/build.py --check
python -m unittest discover -s tests -v
node --check src/scripts/dashboard.js
python scripts/qa_guardrails.py
```

## Limitaciones

- Estos checks prueban integridad y un flujo de recuperación simulado. No equivalen a una auditoría WCAG ni a la prueba completa de navegación en navegador.
- GH-01.3 no establece todavía reglas de protección obligatorias para `main`, si la configuración del repositorio no se confirma mediante la API o el panel de GitHub.
- Si una prueba falla, **no** ignorar o modificar el manifiesto sin revisar el cambio de datos y aprobar un nuevo baseline.
