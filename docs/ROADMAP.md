# Roadmap técnico · GitHub antes de UX-11

| Fase | Dificultad | Estado | Entregable |
| --- | ---: | --- | --- |
| UX-10.3 | 4/10 | **Aprobada y publicada 23-11-2026** | HTML v1.0.12 en producción |
| GH-01.1 | 3/10 | Completada | Repositorio público, políticas y estructura |
| GH-01.2 | 5/10 | **Completada** | CSS/JS/JSON/PNG versionados, compilación reproducible y 11 pruebas |
| GH-01.3 | 4/10 | **Completada** | QA en GitHub Actions, matriz Python y recuperación aislada |
| GH-01.4 | 4/10 | **Completada**; publicación aprobada después | Preview, gates y release registrado |
| UX-11.1 | 4/10 | **Completada 23-11-2026, QA aprobada** | 9.408 pares posibles; 164 coreferencias, 392 ofertas cribadas, contraevidencia |
| UX-11.2 | 3+5+4+4/10 · microfases | **Completada y auditada 23-11-2026** | 188 O revisadas, 14 fuentes públicas contrastadas, matriz y contraevidencia |
| UX-11.3 | 3+4+4+4/10 en microfases | **Completada y auditada 23-11-2026** | Seis fichas O/D, falsadores no ejecutados y QA Python 3.11/3.12 |
| UX-11.4 | 5/10 estimada | **Siguiente** | Rediseñar sección Conclusiones Cruzadas sin confundir hipótesis con hechos |
| UX-11.5 | 4/10 estimada | Pendiente | QA transversal, preview y revisión antes de publicar |

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

## Publicación autorizada · 23/11/2026

La v1.0.12 fue aprobada visualmente por el responsable del proyecto y publicada en [cursos-asincronicos-sdc.vercel.app](https://cursos-asincronicos-sdc.vercel.app). Se promocionó el deployment de producción `dpl_CK2Nq9ibBFQbE5NUiGmFHmCjcBeV`, confirmado por el alias del dominio. La producción anterior `dpl_3chwuB14CquyTuj8scX7p99MRF2f` sigue READY como referencia de recuperación.

- [Acta técnica de publicación](releases/2026-11-23-v1.0.12.md).
- [Acta Notion y aprobación](https://app.notion.com/p/421091be032781109517f3699049d1d5).
- [Acta documental en Drive](https://docs.google.com/document/d/1H2M1WUz4dUX6genscW0U3Lc4AtvCTJumNsw2huyrDaM/edit).
- [Pull Request con registro de versión, fusionado](https://github.com/seba-godoy/sdc-cursos-asincronicos/pull/1) y QA post-merge aprobado.
- Se mantiene `git.deploymentEnabled:false`. La publicación no conectó Git-Vercel ni cambió datasets.

## Cierre analítico UX-11.1 · 23/11/2026

- Baseline original v1.0.12 intacto. Se cruzaron 392 ofertas × 24 señales = **9.408** combinaciones auditables (par O/D, no demanda medida).
- Se preservaron 24 referencias a D y 38 referencias a O de las seis fichas C (34 ofertas distintas). Estas referencias producen **164 coreferencias temáticas**, **no** 164 oportunidades ni equivalencias.
- Las **9.244** combinaciones restantes carecen de enlace temático en C y quedan sin evaluar; su falta de enlace **no** demuestra ausencia de competidores.
- Cribado de títulos y tareas: 184 ofertas marcadas como pistas léxicas (154 sin enlace C). Requieren revisión manual de falsos positivos, modalidad y público.
- Todos los 164 pares conservan fuente, segmento, modalidad, tipo de señal, corroboración, contraevidencia y alertas de dependencia/casos históricos.
- Estados D: 15 DIRECTO, 3 INDICE_OFICIAL, 6 PARCIAL; tipos: 11 FORMACION, 2 POSTULACION, 6 OPERACION, 5 CONTRATACION_INSTITUCIONAL.
- [Informe, metodología y limitaciones](UX-11.1_REPORT.md) · [CSV de pares curados](../data/analysis/ux11_1_curados_164.csv) · [resumen](../data/analysis/ux11_1_resumen.json) · [generador reproducible](../scripts/ux11_1_crosswalk.py) · [pruebas](../tests/test_ux11_1_crosswalk.py).
- Sólo análisis y archivos separados de `data/dataset.json`. Ningún puntaje ni ranking fue recalculado; el HTML y Vercel se mantienen en v1.0.12 hasta aprobación expresa.
- [PR #3](https://github.com/seba-godoy/sdc-cursos-asincronicos/pull/3) fusionado; [QA post-merge](https://github.com/seba-godoy/sdc-cursos-asincronicos/actions/runs/45216581697) **SUCCESS** en Python 3.11/3.12. Fase cerrada, sin cambios en Vercel.

## Próxima UX-11.2 · Dificultad reestimada 4/10

**Qué hará:** revisar las candidatas encontradas por palabras clave, sobre todo las 154 sin anclaje C, discriminar sustitutos gratuitos y cursos comerciales, revisar público, modalidad y resultado de aprendizaje; publicar una matriz de comparabilidad validada con contraevidencia por concepto.

**Por qué importa:** la coreferencia documental por sí sola no demuestra sustitución ni brechas competitivas; antes de decidir producir uno de seis cursos hace falta validar qué alternativas resuelven realmente la misma tarea. Si la carga de validación supera 5/10, subdividir UX-11.2 en grupos antes de ejecutarla.

## UX-11.2 · Evaluación documental de sustitutos · 23/11/2026

- Se subdividió en UX-11.2a (3/10, auditoría), UX-11.2b (5/10, contraste de fichas), UX-11.2c (4/10, clasificaciones reproducibles) y UX-11.2d (4/10, QA y persistencia).
- Revisión de 154 candidatas léxicas adicionales y las 34 O históricas de C, **188 ofertas únicas** de un universo de 392. **204 no fueron evaluadas en este filtro**.
- Clasificación preliminar del contenido de sus fichas: **77 sustitutos parciales potenciales, 46 adyacentes y 65 desajustados**. No corresponden a competidores reales confirmados ni crean un ranking comercial.
- **14 fichas públicas** contrastadas; las otras 174 dependen de datos canónicos archivados sin relectura web individual.
- Contraevidencias relevantes: alternativas gratuitas de KPI y fondos, oferta OTEC asincrónica propia, cursos de gestión genéricos y herramientas sin flujo específico OSFL. [Informe y enlaces](UX-11.2_REPORT.md).
- [Generador reproducible](../scripts/ux11_2_review.py), [QA](../tests/test_ux11_2_review.py), exportación de CSV a artefacto GitHub Actions con copia en Drive a persistir durante cierre.
- No se modifica el ranking C, los datos originales ni el HTML. Vercel se mantiene en v1.0.12.
- **Estado: completada.** [PR #5](https://github.com/seba-godoy/sdc-cursos-asincronicos/pull/5) fusionado y [QA post-merge #16](https://github.com/seba-godoy/sdc-cursos-asincronicos/actions/runs/45220565282) SUCCESS con Python 3.11/3.12 (28 pruebas en cada entorno). [ZIP verificado de las 188 fichas y 14 contrastes en Drive](https://drive.google.com/file/d/1yFhUgzVzbfYcDGRyneiS8PIdKSzVsYWC/view).

## UX-11.3 · Seis fichas comparativas y falsadores · 23/11/2026

- Microfases de dificultad controlada: UX-11.3a (3/10, auditoría y modelo), UX-11.3b (4/10, hipótesis y contraevidencia), UX-11.3c (4/10, generador/QA) y UX-11.3d (4/10, persistencia).
- [Informe de seis conceptos y criterios de decisión](UX-11.3_REPORT.md). [Políticas editoriales/hipótesis](../data/analysis/ux11_3_hypotheses.json), [generador reproducible](../scripts/ux11_3_cards.py) y [pruebas](../tests/test_ux11_3_cards.py).
- Conserva los puntajes de referencia C003 **3,55/5** y C002 **3,45/5** como *prioridades condicionadas*, no oportunidades demostradas. Otros cuatro conceptos con estado de reserva, exploración o postergación según documentación existente.
- Vincula las 24 señales D y las ofertas O seleccionadas, sin sumar unidades incompatibles, sin nueva prueba comercial, sin repetir fundaciones de estudios dependientes ni declarar vacíos de mercado.
- Diseña seis **pruebas falsadoras NO EJECUTADAS**; en C003 se conserva el criterio previo **6 de 8 usuarios** como posible piloto futuro. La evidencia propia de O373/374 y los recursos gratuitos son condiciones clave antes de producir cursos.
- **Cierre verificado:** [PR #7 fusionado](https://github.com/seba-godoy/sdc-cursos-asincronicos/pull/7), commit `f6ecea01b1944acfadbb8301fffa1af8d61ef487`. [GitHub Actions #20](https://github.com/seba-godoy/sdc-cursos-asincronicos/actions/runs/45223748041) **SUCCESS**, 35 tests en Python 3.11 y 35 en Python 3.12. [ZIP de seis fichas y falsadores en Drive](https://drive.google.com/file/d/1gn4oa1FhqGb6DpekAA00SFhc9AYAzG8B/view), auditado con ZIP íntegro, 6 fichas, 6 pruebas no ejecutadas, 24 D y 38 referencias O. [Acta de cierre en Notion](https://app.notion.com/p/421091be03278164ae6ee14c259b5db0). Ningún cambio a datos, ranking, HTML ni Vercel.

## Próxima UX-11.4 · Dificultad provisional 5/10

**Qué hará:** implementar en la pestaña **Conclusiones Cruzadas** un recorrido simple: necesidad → evidencia favorable → sustitutos (incluida oferta propia) → diferencia hipotética → prueba pendiente → decisión condicionada. Incorporar vínculos O/D verificables, evitar equiparar cantidades de postulaciones o compras públicas a estudiantes/compradores de cursos, y mantener datos canónicos intactos.

**Por qué importa:** ya existe base analítica de UX-11.1/11.2/11.3; ahora hay que presentarla a Juanra y DIMI de forma intuitiva y auditable. Si el trabajo real supera 5/10, subdividir UX-11.4 antes de desarrollar.

## Condiciones de despliegue

- GitHub público: control de versiones del material autorizado.
- Drive y Notion: respaldo documental y actas.
- Vercel: no conectado a Git; producción v1.0.12 aprobada y publicada el 23-11-2026 (deployment `dpl_CK2Nq9ibBFQbE5NUiGmFHmCjcBeV`).
- Ninguna subida a producción sin aprobación explícita del usuario.
