# Cursos asincrónicos | Simón de Cirene

Repositorio **público** del trabajo de investigación sobre oferta, señales de demanda y oportunidades de cursos asincrónicos para el tercer sector en Chile. La publicación del material en GitHub fue autorizada por el responsable del proyecto. Es un prototipo de investigación en desarrollo y no representa por sí solo una comunicación institucional oficial.

## Estado

- **GitHub, bloque GH-01 cerrado técnicamente:** fuentes versionadas, QA automatizada, preview controlado y runbook para publicar con aprobación.
- **Candidato v1.0.12:** reconstruible byte a byte, con SHA-256 `82f57a273302275b2458f854fbb7a583f674b578f0fbd5ef063b09bf7515e7c7`.
- **Vercel:** v1.0.12 aprobada y publicada el 23/11/2026 en [sitio público](https://cursos-asincronicos-sdc.vercel.app). No existe integración Git-Vercel automática; la candidata UX-11.4 permanece sin publicar.
- **Alcance de la base:** 392 Oferta, 709 Búsquedas, 24 Demanda y 6 Decisión, total 1.131 registros.

## Compilar

Solo necesitas Python 3.10 o superior y su biblioteca estándar:

```sh
python scripts/build.py --check
python scripts/build.py
python -m unittest discover -s tests -v
```

El resultado es `dist/dashboard-v1.0.12.html`, un **HTML autónomo** que puede abrirse sin conectividad para el funcionamiento básico. La carpeta `dist/` está excluida del control de versiones. El constructor verifica el tamaño y SHA-256 contra el manifiesto.

## Estructura del repositorio

| Ruta | Contenido |
| --- | --- |
| `src/index.template.html` | Estructura HTML con marcadores |
| `src/styles/dashboard.css` | Hoja de estilo original |
| `src/scripts/dashboard.js` | Lógica JavaScript original |
| `data/` | Tres bloques JSON originales y auditados |
| `assets/logos/` | Tres imágenes PNG originales |
| `scripts/build.py` | Generación reproducible del HTML |
| `tests/test_build.py` | Pruebas estructurales y de integridad |
| `docs/` | Manifiesto, política, actas y roadmap |

Más detalles en [Compilación reproducible](docs/REPRODUCIBILITY.md), [GH-01.2](docs/GH-01.2_AUDIT.md) y [Roadmap técnico](docs/ROADMAP.md).

## Criterios analíticos

El catálogo reúne oferta publicada, búsquedas, señales de actividad y conceptos propuestos. Una señal de participación, una contratación institucional o la presencia de cursos **no demuestra** por sí misma compradores, ventas ni disposición a pagar. Los datos mantienen sus unidades, limitaciones y fuentes originales.

## QA automatizada y recuperación

- [GitHub Actions · QA - Build, datos y recuperación](https://github.com/seba-godoy/sdc-cursos-asincronicos/actions/workflows/quality.yml): push a `main`, PR hacia `main` y ejecución manual.
- Matriz Python 3.11 y 3.12: integridad SHA-256, HTML autónomo, 11 pruebas, sintaxis JavaScript, detección de corrupción y simulación de `git revert` en copia temporal.
- [Guía de recuperación segura](docs/RECOVERY.md) y [acta GH-01.3](docs/GH-01.3_AUDIT.md).
- **Protección:** ruleset `DIMI - Main Branch Protection - Courses` activo: Pull Request obligatorio, checks `qa-python-3.11` y `qa-python-3.12`, sin bypass y sin forzar cambios en `main`.

## Preparación de preview y autorización de producción

El repositorio incluye [`vercel.json`](vercel.json) con `git.deploymentEnabled: false`. No existe integración Git-Vercel para este proyecto. Un push no despliega el sitio. El flujo QA prepara también un artefacto HTML descargable con sus hashes, **sin tokens de Vercel ni instrucciones de publicación**.

Para generar localmente el archivo de preview:

```sh
python -m scripts.package_preview --check
python -m scripts.package_preview
```

- [Dashboard público v1.0.12](https://cursos-asincronicos-sdc.vercel.app), aprobado y publicado. El preview de UX-11.4 se preparará en UX-11.5, sin sustituir producción.
- [Candidata UX-11.4 en Drive](https://drive.google.com/file/d/1TfDwGKV5ArkV3WO5_zPgJz-4cDSZl7g_/view), HTML autónomo con seis fichas interactivas, pendiente de revisión transversal y publicación.
- [Runbook para aprobación, publicación y rollback](docs/RELEASE_RUNBOOK.md).
- [Acta GH-01.4](docs/GH-01.4_AUDIT.md).
- **Limitación operativa:** Vercel aceptó la actualización para desactivar la asignación automática de dominios, pero el conector no permitió leer el valor persistido; debe comprobarse en el panel antes de un despliegue de producción.

## UX-11.4 · Conclusiones Cruzadas (candidata independiente)

La implementación de UX-11.4 está lista para revisión: seis fichas interactivas con sus **24 señales D**, alternativas O, oferta propia, diferenciación como hipótesis y pruebas falsadoras **NO EJECUTADAS**. Los puntajes de C003 (3,55/5) y C002 (3,45/5) son referencias anteriores, no recalculadas.

- [Informe y QA de UX-11.4](docs/UX-11.4_REPORT.md) · [PR #9 fusionado](https://github.com/seba-godoy/sdc-cursos-asincronicos/pull/9).
- [Compilador de candidata](scripts/build_ux11_4.py): ejecuta `python -m scripts.build_ux11_4` y genera `dist/ux11_4/index.html` sin alterar el baseline de v1.0.12.
- [ZIP HTML + manifiesto candidato](https://drive.google.com/file/d/1TfDwGKV5ArkV3WO5_zPgJz-4cDSZl7g_/view), SHA-256 `612dbebfb5497ffe79b86bcf2c3cabbebeef723a2003aaf13834afddfe4f4b37`, producción NO aprobada.
- [QA post-merge](https://github.com/seba-godoy/sdc-cursos-asincronicos/actions/runs/45244979232) aprobado en Python 3.11/3.12; smoke Chromium escritorio/tablet/móvil sin errores JS ni desbordamiento.
- **Siguiente UX-11.5:** QA transversal, preview Vercel aislado y revisión visual previa a cualquier publicación.

## Transparencia y seguridad

El repositorio público puede leerse y clonarse sin dar permisos individuales, pero no ofrece automáticamente una licencia de redistribución sobre activos de terceros. No subir claves, tokens o documentos sensibles. Ver la [política de publicación](docs/PUBLICATION_POLICY.md).

**Importante:** publicar una nueva versión en producción requiere aprobación expresa del responsable. GitHub Actions, el empaquetador y el preview **no** la publican automáticamente.
