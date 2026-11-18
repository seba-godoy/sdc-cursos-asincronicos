# Política de publicación · Repositorio público

**Vigente desde GH-01.1.** Este repositorio es público deliberadamente. La accesibilidad pública del código no equivale a autorización para difundir cualquier documento de investigación, dato, imagen o archivo de terceros.

## Tres niveles de contenido

| Clasificación | Ejemplos | Regla |
| --- | --- | --- |
| Público revisado | Documentación general, código sin credenciales, esquemas sin datos sensibles | Publicar después de revisión |
| Candidato sujeto a revisión | HTML autónomo, bases consolidadas, informes, imágenes y logos, capturas, matrices con enlaces | No publicar hasta revisar contenido, permisos, vínculos y derechos |
| Excluido | Claves, tokens, contraseñas, archivos `.env`, información personal no autorizada, documentos internos confidenciales, exportaciones completas sin revisión | Nunca subir |

## Control previo obligatorio

1. Identificar origen, autoría y condiciones de uso del material.
2. Verificar ausencia de secretos, identificadores personales y datos de acceso restringido.
3. Revisar URL embebidas, metadatos, rutas locales, imágenes, tipografías y licencias.
4. Confirmar que las cifras y fuentes puedan divulgarse de manera responsable y estén adecuadamente atribuidas.
5. Registrar versión, SHA-256, inventario, resultado de QA y aprobación para publicar.
6. Separar **subir a GitHub** de **desplegar a Vercel**: producción solo con autorización explícita.

## Restricciones operativas

- No incorporar automáticamente respaldos completos de Drive o Notion.
- No insertar URL privadas o con acceso por enlace sin revisar quién puede leerlas.
- No subir logos, fuentes u otros recursos institucionales hasta aclarar sus permisos de distribución, aunque ya aparezcan en el dashboard.
- No añadir licencia abierta hasta que se decida qué derechos puede otorgar realmente el titular.
- No configurar Vercel para publicar en producción con cada push.
- Las reglas `.gitignore` son una primera barrera, no sustituyen una revisión antes del commit; archivos ya rastreados no quedan protegidos por añadirlos después al ignore.

## Ante una filtración

Detener la publicación, revocar o rotar credenciales afectadas si corresponde, evaluar copias e historial y seguir el procedimiento de eliminación de datos sensibles documentado por GitHub. Borrar un archivo en un commit nuevo no elimina su historial.

## Documentos externos de referencia

- [GitHub: eliminar información sensible](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [GitHub: licencias de repositorios](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository)
- [GitHub: secret scanning](https://docs.github.com/en/code-security/how-tos/secure-your-secrets/detect-secret-leaks/enable-secret-scanning)
