# Cursos asincrónicos | Simón de Cirene

Repositorio **público** del trabajo de investigación sobre oferta, señales de demanda y oportunidades de cursos asincrónicos para el tercer sector en Chile. La publicación del material en GitHub fue autorizada por el responsable del proyecto. Es un prototipo de investigación en desarrollo y no representa por sí solo una comunicación institucional oficial.

## Estado

- **GitHub, fase GH-01.3:** código y datos versionados, QA automatizada en GitHub Actions y recuperación de versiones ensayada.
- **Candidato v1.0.12:** reconstruible byte a byte, con SHA-256 `82f57a273302275b2458f854fbb7a583f674b578f0fbd5ef063b09bf7515e7c7`.
- **Vercel:** última publicación documentada v1.0.9; este repositorio no activa despliegues automáticos.
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
- **Límite:** disponer de checks automáticos no implica por sí mismo que GitHub impida fusionar si fallan. La imposición de checks obligatorios mediante protección de `main` aún no está confirmada.

## Transparencia y seguridad

El repositorio público puede leerse y clonarse sin dar permisos individuales, pero no ofrece automáticamente una licencia de redistribución sobre activos de terceros. No subir claves, tokens o documentos sensibles. Ver la [política de publicación](docs/PUBLICATION_POLICY.md).

**Importante:** los pushes a GitHub **no deben** desplegar automáticamente en Vercel. Cualquier publicación en producción requiere autorización explícita y se abordará en GH-01.4.
