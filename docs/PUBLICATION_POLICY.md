# Política de publicación del repositorio público

Este repositorio es público por decisión expresa de su responsable. En GH-01.2 el usuario autorizó asumir derechos de uso para incorporar el trabajo elaborado al repositorio GitHub, incluyendo el código, los datos de investigación y logos incrustados en el HTML candidato.

Esto **no** equivale a declarar que todo el contenido es de dominio público ni a otorgar una licencia de reutilización a terceros.

## Permitido bajo la autorización actual

- Versionar los componentes originales del dashboard UX-10.3 v1.0.12, incluyendo los tres JSON canónicos y los tres logos incrustados.
- Documentar su procedencia, uso analítico, limitaciones y hashes.
- Compartir el historial técnico y la documentación general con el equipo de Simón de Cirene y con lectores externos.

## Nunca publicar sin control específico

- Tokens, secretos, contraseñas, archivos .env, claves privadas y credenciales.
- Información personal o contractual que no deba difundirse.
- Exportaciones masivas de cuentas, correo, bases privadas y documentos de acceso restringido no cubiertos por la autorización.
- URLs con tokens incrustados, archivos con rutas internas sensibles o entornos de producción.

## Checklist antes de cada commit

1. Comprobar que todos los cambios coinciden con el alcance autorizado.
2. Comprobar secretos obvios y revisar identificadores y enlaces internos.
3. Verificar integridad SHA-256 y conteos del manifiesto.
4. Ejecutar pruebas Python y de integración según corresponda.
5. Confirmar que el commit **no** despliega en Vercel sin aprobación del usuario.
6. Documentar fase, cambios, pruebas y eventual revisión humana.

Una regla .gitignore no garantiza que un archivo nunca se publique y no elimina secretos ya incluidos en el historial. GitHub ofrece detección de secretos y protección contra su introducción; aun así, debe revisarse antes de subir información. La ausencia de una licencia expresa deja reservados los derechos aplicables.

## Fuentes técnicas

- https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository
- https://docs.github.com/en/code-security/concepts/secret-security/push-protection
- https://docs.github.com/en/repositories/creating-and-managing-repositories/repository-limits
