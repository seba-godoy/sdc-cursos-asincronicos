# Roadmap técnico · GitHub antes de UX-11

| Fase | Dificultad | Estado | Entregable |
| --- | ---: | --- | --- |
| UX-10.3 | 4/10 | Cerrada técnicamente; revisión humana pendiente | HTML candidato v1.0.12 |
| GH-01.1 | 3/10 | Completada | Repositorio público, políticas y estructura |
| GH-01.2 | 5/10 | **Completada** | CSS/JS/JSON/PNG versionados, compilación reproducible y 11 pruebas |
| GH-01.3 | 4/10 | **Siguiente** | Automatizar QA y probar recuperación de versiones |
| GH-01.4 | 4/10 | Pendiente | Control de publicación GitHub + Vercel |
| UX-11 | A recalcular | Pendiente | Cruces Oferta-Demanda para priorizar oportunidades |

## Cierre GH-01.2

Se descompuso UX-10.3 v1.0.12 sin modificar sus 1.131 registros. La construcción local generó un archivo idéntico byte a byte: SHA-256 `82f57a273302275b2458f854fbb7a583f674b578f0fbd5ef063b09bf7515e7c7`, 1.848.239 bytes. Se aprobaron 11 pruebas Python y la revisión sintáctica de JS con Node. Se incorporó [manifiesto](build-manifest.json) y [documentación](REPRODUCIBILITY.md). La autorización para publicar en GitHub es explícita por parte del usuario; **no** se modificó Vercel.

## GH-01.3 · Dificultad recalculada 4/10

**Qué hará:** crear un flujo de controles automáticos sobre commits/PR, integrar pruebas de construcción, consistencia de datos y de regresión apropiadas, y practicar la restauración de un commit anterior sin reescribir la rama principal.

**Por qué importa:** detecta errores antes de incorporar cambios y garantiza un procedimiento de recuperación, especialmente útil al comenzar UX-11. Las pruebas funcionales completas de UX-10.3 no se sustituyen por la equivalencia de hash; se formalizarán progresivamente.

La fase cabe en 4/10; si aparecen nuevos bloqueos, subdividir antes de superar 5/10.

## Condiciones de despliegue

- GitHub público: control de versiones del material autorizado.
- Drive y Notion: respaldo documental y actas.
- Vercel: sin actualización ni conexión a GitHub en GH-01.2.
- Ninguna subida a producción sin aprobación explícita del usuario.
