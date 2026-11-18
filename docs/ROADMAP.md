# Roadmap técnico · GitHub y continuidad UX

| Fase | Dificultad prevista | Estado | Entregable |
| --- | ---: | --- | --- |
| UX-10.3 | 4/10 | Cerrada técnicamente, aprobación manual pendiente | HTML candidato v1.0.12 y QA |
| GH-01.1 | 3/10 | Completada al verificar la salida | Repositorio público inicial, política e inventario |
| GH-01.2 | 5/10 | Pendiente | Fuentes, datos autorizados, compilación reproducible y manifiesto |
| GH-01.3 | 4/10 | Pendiente | QA automatizada y recuperación de versiones |
| GH-01.4 | 4/10 | Pendiente | Control de publicación y eventual integración con Vercel |
| UX-11 | Por recalcular | Pendiente | Cruces analíticos entre Oferta y Demanda |

## Próxima fase · GH-01.2

**Qué hará:** revisar los activos fuente de la v1.0.12, clasificar cada uno para exposición pública, organizar los archivos autorizados bajo `src/`, `data/` y `scripts/`, y construir un procedimiento reproducible con manifiesto de SHA-256.

**Por qué importa:** actualmente el dashboard existe como HTML monolítico y respaldos separados. Una compilación controlada permitirá revisar cambios y detectar regresiones antes de UX-11, sin colocar material sensible en un repositorio público.

**Regla de ejecución:** ninguna microtarea sobre 5/10; si la revisión de datos o permisos aumenta el esfuerzo, dividir GH-01.2 antes de modificar el repositorio.

## Fronteras de publicación

- GitHub público: solo materiales expresamente revisados y autorizados.
- Vercel: no se modifica ni se vincula automáticamente en esta etapa.
- Drive y Notion: conservan el historial y la evidencia completa, sujetos a sus permisos.
