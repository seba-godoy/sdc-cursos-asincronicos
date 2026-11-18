# GH-01.4 · Política operativa de preview y publicación controlada

## Proyecto y restricciones

- **GitHub (fuente autorizada):** https://github.com/seba-godoy/sdc-cursos-asincronicos, repositorio público.
- **Vercel, equipo:** `sebastian-godoy-s-projects` (plan Hobby).
- **Vercel, proyecto:** `cursos-asincronicos-sdc`, ID `prj_HJYAMW4Iha9QgNT2rSBEkZ7u0f7g`.
- **Dominio público:** https://cursos-asincronicos-sdc.vercel.app
- **Producción actual auditada:** `dpl_3chwuB14CquyTuj8scX7p99MRF2f` (READY, con alias público, contenido históricamente documentado como v1.0.9).
- **Preview del candidato v1.0.12:** `dpl_EaJPxhARx6HSCiPnbkoqzMjrFDq8`, [URL de preview](https://cursos-asincronicos-ebdy56h15-sebastian-godoy-s-projects.vercel.app) (READY, target no producción, sin aliases).
- **Baseline v1.0.12:** 1.848.239 bytes; SHA-256 `82f57a273302275b2458f854fbb7a583f674b578f0fbd5ef063b09bf7515e7c7`.
- **Estado de autorización:** se autoriza GitHub público y ensayos de preview; **no** se ha autorizado promover a producción.

## Barreras activadas en GH-01.4

1. El proyecto de Vercel **no está vinculado** al repositorio GitHub; se verificó mediante la lectura de proyectos Git conectados.
2. El repositorio contiene [`vercel.json`](../vercel.json) con `git.deploymentEnabled: false`, que solicita a Vercel no crear despliegues automáticos si en el futuro se conecta Git.
3. El workflow [quality.yml](../.github/workflows/quality.yml) hace QA y genera un **artefacto descargable** de HTML autónomo. No incorpora tokens de Vercel ni acciones de desplegar/promover.
4. Se envió a Vercel la actualización de configuración `autoAssignCustomDomains: false` sin error, pero la respuesta y la lectura posterior no exponen ese campo. **No considerar verificado este bloqueo hasta comprobarlo en Settings > Environments > Production > Auto-assign Custom Production Domains.**
5. El dominio público se comprobó nuevamente después del despliegue preview y del cambio de configuración: sigue en el deployment anterior. No se reasignaron aliases.

## Cómo preparar una versión para revisión

Clonar o actualizar el repositorio y verificar QA:

```sh
python scripts/build.py --check
python -m unittest discover -s tests -v
python -m scripts.package_preview --check
python -m scripts.package_preview
```

Los archivos locales aparecen en `dist/preview-candidate/index.html` y `dist/preview-candidate/candidate-manifest.json`, excluidos de Git. La compilación verifica componentes, HTML y SHA-256. No existe ninguna instrucción de despliegue en ese script.

También se puede usar la sección **Actions > QA - Build, datos y recuperación > Run workflow**: la ejecución prepara el candidato en forma de artefacto, además del QA, sin tocar Vercel. El artefacto es efímero y no sustituye GitHub ni Drive como respaldo.

**Primer preview de referencia:** GH-01.4 desplegó a preview el HTML original de Drive v1.0.12 (la misma huella SHA que genera GitHub en GH-01.2). El despliegue existe y está READY. La inspección externa del sitio en navegador no pudo completarse desde el entorno de ejecución; **se exige revisión humana de la URL antes de cualquier promoción.**

## Checklist de aprobación (obligatorio)

- [ ] QA de GitHub Actions en verde para el commit exacto.
- [ ] Hash SHA-256 del HTML aprobado, tamaño y versión anotados.
- [ ] URL única de preview y deployment ID correctos.
- [ ] Revisar visualmente Inicio, Oferta, Demanda, Decisión, Metodología, menú móvil y filtros, en escritorio y móvil.
- [ ] Verificar accesibilidad básica y enlaces relevantes, además de diferencias frente a producción.
- [ ] Confirmar que el proyecto/entorno/dominio destino son los correctos y que existe un rollback candidato.
- [ ] **Aprobación expresa del usuario** indicando versión y despliegue; registrar en Notion/Drive quién y cuándo autorizó.
- [ ] Confirmar manualmente en Vercel que el modo de asignación automática está desactivado antes de cualquier despliegue de producción.
- [ ] Solo después de aprobar, crear un despliegue de producción staged sin dominio asignado, auditarlo y efectuar la promoción manual a producción.

No utilizar `vercel --prod`, `request_promote`, `assign_alias`, `request_rollback` ni vincular Git a producción por el solo hecho de pasar el QA. Esas son acciones separadas que cambian tráfico y requieren permiso explícito.

## Ante incidentes

**Código:** trabajar sobre una rama, hacer `git revert` y pasar QA; no reescribir `main` con `--force`.

**Producción:** identificar el deployment que estaba sirviendo el dominio, validar el destino de restauración y solicitar autorización explícita para ejecutar el rollback de Vercel. Un revert en GitHub **no mueve el tráfico web**. Guardar IDs, SHA, fecha, causa y resultado de la reversión en la bitácora.

**Credenciales:** si alguna se publica por error, revocarla o rotarla. Un revert no borra secretos del historial.

## Verificaciones y límites de la fase

- Vercel certificó READY para el preview y ausencia de aliases; no se completó el test visual externo ni se hizo certificación WCAG.
- La API de proyectos de Vercel no devuelve el valor de `autoAssignCustomDomains` en la respuesta de lectura; aunque la actualización fue aceptada, su efectividad sigue pendiente de confirmación en el panel.
- GitHub tiene checks automáticos operativos, pero no está confirmada una regla que impida fusionar si estos fallan.
- La candidata permanece v1.0.12; ningún cambio se promovió a producción en GH-01.4.

## Referencias de Vercel

- https://vercel.com/docs/project-configuration/git-configuration
- https://vercel.com/docs/deployments/environments
- https://vercel.com/docs/deployments/promoting-a-deployment
- https://vercel.com/docs/deployment-protection
