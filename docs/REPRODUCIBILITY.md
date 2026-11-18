# Compilación reproducible · UX-10.3 v1.0.12

El HTML de 1.848.239 bytes se separó sin reformatear en plantilla, CSS, JavaScript, tres JSON y tres logos PNG. El ensamblador inserta los bytes originales y convierte cada logo a su URI base64, recreando exactamente la versión v1.0.12.

## Componentes

- src/index.template.html: esqueleto con ocho marcadores.
- src/styles/dashboard.css y src/scripts/dashboard.js: CSS y JS originales.
- data/dataset.json: 1.131 registros originales (392 Oferta, 709 Búsquedas, 24 Demanda, 6 Decisión).
- data/ox-analysis-data.json y data/ux10-demand-brief.json: análisis original.
- assets/logos/*.png: tres imágenes originales.
- scripts/build.py: constructor sin dependencias externas.
- tests/test_build.py: controles de estructura, datos e integridad.
- docs/build-manifest.json: huellas y tamaños canónicos.

## Ejecutar desde la raíz

Requisitos: Python 3.10 o superior y su biblioteca estándar.

    python scripts/build.py --check
    python scripts/build.py
    python -m unittest discover -s tests -v

Salida: dist/dashboard-v1.0.12.html (excluida de Git por defecto). Debe tener 1.848.239 bytes y SHA-256 82f57a273302275b2458f854fbb7a583f674b578f0fbd5ef063b09bf7515e7c7.

### Cambios futuros

Para modificar la app, edita los componentes fuente; nunca alteres el HTML dentro de dist/. El manifiesto bloquea v1.0.12: una edición legítima requiere revisión y nuevo baseline versionado. Los JSON no se reserializan en la compilación. GitHub público y despliegue a Vercel son acciones diferentes; la producción requiere aprobación explícita.

El hash exacto no sustituye pruebas funcionales en navegador, de accesibilidad o de enlaces externos. Esas verificaciones corresponden a GH-01.3.
