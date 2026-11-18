# Roadmap técnico · GitHub antes de UX-11

| Fase | Dificultad | Estado | Entregable |
| --- | ---: | --- | --- |
| UX-10.3 | 4/10 | Cerrada técnicamente; revisión humana pendiente | HTML candidato v1.0.12 |
| GH-01.1 | 3/10 | Completada | Repositorio público, políticas y estructura |
| GH-01.2 | 5/10 | **Completada** | CSS/JS/JSON/PNG versionados, compilación reproducible y 11 pruebas |
| GH-01.3 | 4/10 | **Completada** | QA en GitHub Actions, matriz Python y recuperación aislada |
| GH-01.4 | 4/10 | **Completada técnicamente**, QA visual pendiente | Preview v1.0.12 y gates de producción manual |
| UX-11.1 | 4/10 (estimación) | **Siguiente** | Matriz auditable de cruces Oferta-Demanda y contraevidencia |
| UX-11.2+ | Por definir | Pendiente | Análisis y visualización progresivos del cruce |

## Cierre GH-01.2

Se descompuso UX-10.3 v1.0.12 sin modificar sus 1.131 registros. La construcción local generó un archivo idéntico byte a byte: SHA-256 `82f57a273302275b2458f854fbb7a583f674b578f0fbd5ef063b09bf7515e7c7`, 1.848.239 bytes. Se aprobaron 11 pruebas Python y la revisión sintáctica de JS con Node. Se incorporó [manifiesto](build-manifest.json) y [documentación](REPRODUCIBILITY.md). La autorización para publicar en GitHub es explícita por parte del usuario; **no** se modificó Vercel.

## Cierre GH-01.3

- [Workflow QA](../.github/workflows/quality.yml) configurado sobre `main`, PR y ejecución manual. Usa `contents: read`, acciones compatibles con Node 24 y matriz Python 3.11/3.12.
- Los 11 tests del build se ejecutan por cada versión, junto con `node --check`, hash de 1.131 registros y dos pruebas de protección en una copia temporal: dataset modificado detectado y `git revert` restaurando `README.md` sin cambios en la rama original.
- La [primera ejecución real en GitHub Actions](https://github.com/seba-godoy/sdc-cursos-asincronicos/actions/runs/44314062129) aprobó **ambos jobs**. Se actualizaron las acciones de checkout/setup-python a Node 24 tras detectar advertencias de obsolescencia; consultar la ejecución más reciente para la validación final.
- [Acta GH-01.3](GH-01.3_AUDIT.md) y [runbook](RECOVERY.md). **No se ha probado un rollback real de Vercel** ni una auditoría completa de accesibilidad.
- **Pendiente de configuración:** marcar checks como obligatorios mediante protección de ramas/ruleset si se decide exigirlos. El listado público de rulesets estaba vacío al auditar; la API de protección de ramas devolvió 403 a la conexión.

## Cierre técnico GH-01.4

- Auditoría directa de Vercel: proyecto `cursos-asincronicos-sdc` en equipo Hobby y sin conexión Git, dominio público aún asociado al despliegue previo `dpl_3chwuB14CquyTuj8scX7p99MRF2f`.
- Archivo [`vercel.json`](../vercel.json) incorporado con `git.deploymentEnabled: false`. El proyecto tampoco está conectado al repositorio.
- Preview v1.0.12 creado manualmente en Vercel: [ver preview](https://cursos-asincronicos-ebdy56h15-sebastian-godoy-s-projects.vercel.app), ID `dpl_EaJPxhARx6HSCiPnbkoqzMjrFDq8`, READY, sin aliases, sin promoción a producción.
- Script [`package_preview.py`](../scripts/package_preview.py) y QA extendida para producir artefacto verificado y descargable en GitHub Actions, sin credenciales ni deploy.
- Solicitud de Vercel `autoAssignCustomDomains:false` aceptada; el valor no está disponible en la lectura posterior: **requiere confirmación manual en Settings**. El alias público continuó intacto.
- [Runbook de publicación](RELEASE_RUNBOOK.md) y [acta GH-01.4](GH-01.4_AUDIT.md).
- <b>La fase no autoriza ni ejecuta despliegue a producción</b>. La revisión visual del preview tampoco está cerrada.

## Próxima UX-11.1 · Dificultad estimada 4/10

**Qué hará:** cruzar las 392 fichas de Oferta y las 24 de Demanda mediante temas/segmentos comparables, revisar cómo utilizar las 709 búsquedas como indicador independiente, clasificar evidencia explícita, inferida y no comparable, y elaborar una matriz de trazabilidad/contraevidencia antes de tocar el HTML.

**Por qué importa:** terminamos la infraestructura básica; volvemos al objetivo principal: identificar cursos con oportunidades defendibles y evitar interpretar búsquedas o visualizaciones como demanda pagadora. Los resultados podrán implementarse con QA y preview previo a cualquier publicación.

**Dependencia:** el preview actual sigue en revisión visual. Mantener microtareas ≤5/10.

## Condiciones de despliegue

- GitHub público: control de versiones del material autorizado.
- Drive y Notion: respaldo documental y actas.
- Vercel: no conectado a Git; preview v1.0.12 creado en GH-01.4, sin cambios de dominio público.
- Ninguna subida a producción sin aprobación explícita del usuario.
