# Roadmap técnico · GitHub antes de UX-11

| Fase | Dificultad | Estado | Entregable |
| --- | ---: | --- | --- |
| UX-10.3 | 4/10 | Cerrada técnicamente; revisión humana pendiente | HTML candidato v1.0.12 |
| GH-01.1 | 3/10 | Completada | Repositorio público, políticas y estructura |
| GH-01.2 | 5/10 | **Completada** | CSS/JS/JSON/PNG versionados, compilación reproducible y 11 pruebas |
| GH-01.3 | 4/10 | **Completada** | QA en GitHub Actions, matriz Python y recuperación aislada |
| GH-01.4 | 4/10 (provisional) | **Siguiente** | Control de publicación GitHub + Vercel |
| UX-11 | A recalcular | Pendiente | Cruces Oferta-Demanda para priorizar oportunidades |

## Cierre GH-01.2

Se descompuso UX-10.3 v1.0.12 sin modificar sus 1.131 registros. La construcción local generó un archivo idéntico byte a byte: SHA-256 `82f57a273302275b2458f854fbb7a583f674b578f0fbd5ef063b09bf7515e7c7`, 1.848.239 bytes. Se aprobaron 11 pruebas Python y la revisión sintáctica de JS con Node. Se incorporó [manifiesto](build-manifest.json) y [documentación](REPRODUCIBILITY.md). La autorización para publicar en GitHub es explícita por parte del usuario; **no** se modificó Vercel.

## Cierre GH-01.3

- [Workflow QA](../.github/workflows/quality.yml) configurado sobre `main`, PR y ejecución manual. Usa `contents: read`, acciones compatibles con Node 24 y matriz Python 3.11/3.12.
- Los 11 tests del build se ejecutan por cada versión, junto con `node --check`, hash de 1.131 registros y dos pruebas de protección en una copia temporal: dataset modificado detectado y `git revert` restaurando `README.md` sin cambios en la rama original.
- La [primera ejecución real en GitHub Actions](https://github.com/seba-godoy/sdc-cursos-asincronicos/actions/runs/44314062129) aprobó **ambos jobs**. Se actualizaron las acciones de checkout/setup-python a Node 24 tras detectar advertencias de obsolescencia; consultar la ejecución más reciente para la validación final.
- [Acta GH-01.3](GH-01.3_AUDIT.md) y [runbook](RECOVERY.md). **No se ha probado un rollback real de Vercel** ni una auditoría completa de accesibilidad.
- **Pendiente de configuración:** marcar checks como obligatorios mediante protección de ramas/ruleset si se decide exigirlos. El listado público de rulesets estaba vacío al auditar; la API de protección de ramas devolvió 403 a la conexión.

## GH-01.4 · Dificultad provisional 4/10

**Qué hará:** revisar el estado real de Vercel y su integración con GitHub; diseñar un mecanismo verificable de despliegue controlado, entornos de preview y aprobación manual para producción, sin publicar automáticamente v1.0.12.

**Por qué importa:** los checks de GH-01.3 protegen la compilación, pero todavía falta evitar que un push correcto se convierta en un despliegue no autorizado. UX-11 necesita separar cambios en código, revisión técnica y publicación a DIMI.

**Límites:** mantener microtareas ≤5/10. Si el control de permisos, preview y aprobación supera 5/10, subdividir GH-01.4 antes de ejecutar.

## Condiciones de despliegue

- GitHub público: control de versiones del material autorizado.
- Drive y Notion: respaldo documental y actas.
- Vercel: sin actualización ni conexión a GitHub en GH-01.2.
- Ninguna subida a producción sin aprobación explícita del usuario.
