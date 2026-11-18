# Investigación de cursos asincrónicos · Simón de Cirene

Repositorio público de trabajo para organizar el desarrollo técnico de un dashboard de investigación de oferta y señales de demanda de cursos asincrónicos vinculados al tercer sector en Chile.

> **Estado:** estructura técnica inicial. Los datos, el HTML candidato y las herramientas de compilación todavía no se han publicado en este repositorio.
>
> **Carácter del material:** proyecto de investigación y prototipado en desarrollo. Su presencia aquí no implica aprobación institucional ni constituye una publicación oficial de Fundación Simón de Cirene.

## Objetivo

Facilitar la lectura de la oferta formativa, las señales disponibles de demanda, la evidencia y las oportunidades potenciales, sin confundir indicadores de actividad con ventas o disposición a pagar.

## Estado de versiones

- **Sitio actualmente publicado (referencia):** [cursos-asincronicos-sdc.vercel.app](https://cursos-asincronicos-sdc.vercel.app), versión de referencia v1.0.9 según la última acta interna.
- **Candidato más reciente:** v1.0.12 (UX-10.3), respaldado fuera de GitHub y pendiente de revisión para su incorporación.
- **Repositorio:** GH-01.1, estructura inicial y control de exposición pública.

El sitio en Vercel y este repositorio son superficies distintas. Un commit aquí **no** debe activar automáticamente una publicación en producción.

## Estructura prevista

| Ruta | Uso previsto |
| --- | --- |
| `src/` | Código fuente del dashboard |
| `data/` | Datos revisados y autorizados para distribución |
| `scripts/` | Generación reproducible de artefactos |
| `tests/` | Pruebas de integridad y regresión |
| `docs/` | Documentación de trabajo, decisiones y controles |
| `dist/` | Artefactos generados localmente, excluidos de Git por defecto |

Los directorios que aún contienen solo archivos `.gitkeep` son reservas de estructura, no implementaciones terminadas.

## Seguridad, derechos y publicación

Antes de incorporar cualquier archivo, aplicar la [política de publicación](docs/PUBLICATION_POLICY.md) y dejar constancia de la revisión. No subir credenciales, información personal, materiales internos sin autorización, activos con derechos no aclarados, ni versiones candidatas no aprobadas.

Este repositorio **no incluye licencia de reutilización** por ahora. Que sea público permite consultarlo y utilizar las funciones de GitHub conforme a sus condiciones; no autoriza automáticamente reutilizar o redistribuir activos ajenos.

## Plan de trabajo

Consultar [roadmap](docs/ROADMAP.md) y [acta de GH-01.1](docs/GH-01.1_AUDIT.md).

**Responsabilidad de publicación:** los despliegues a producción requieren autorización explícita; no conectar GitHub a Vercel hasta completar el control de publicación previsto en GH-01.4.
