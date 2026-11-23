#!/usr/bin/env python3
"""UX-11.2: evaluación documental de sustitutos, sin modificar datos canónicos.

Clasifica la cola de 154 O detectadas en UX-11.1 y vuelve a incluir las 34
referencias históricas de C. No afirma equivalencia plena, compra, matricula
ni vigencia de los 188 URLs. Sólo 14 fichas fueron contrastadas en web.
"""
from __future__ import annotations
import csv
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "dist" / "ux11_2"
NEAR = set("""O009 O014 O020 O026 O030 O031 O032 O033 O036 O044 O050 O055
O056 O058 O128 O130 O149 O157 O168 O180 O181 O186 O187 O199
O201 O208 O211 O212 O224 O227 O238 O243 O246 O250 O251 O252
O254 O256 O264 O267 O340 O356 O384 O166 O012 O005 O028 O373
O374 O388 O389 O390 O352 O004 O314 O391 O392 O381 O382 O367
O379 O376 O375 O025 O003 O386 O007 O006 O017 O019 O051 O057
O387 O359 O022 O357 O385""".split())
EXCLUDE = set("""O034 O035 O039 O065 O067 O068 O069 O073 O077 O079 O081 O097
O098 O124 O125 O129 O134 O141 O148 O150 O153 O155 O156 O163
O171 O174 O175 O178 O184 O195 O228 O229 O232 O233 O237 O239
O241 O259 O265 O266 O271 O293 O296 O297 O298 O309 O311 O312
O330 O333 O335 O339 O344 O354 O355 O358 O360 O362 O370 O371
O378 O383 O122 O137 O127""".split())
PRIMARY = dict(O037="C001",O039="C001",O121="C006",O123="C001",
               O124="C001",O128="C002",O238="C002",O254="C006",
               O339="C001",O358="C001")
OBJECTIVES = {
"C001": "caja semanal por convenio y fondos restringidos de una OSC",
"C002": "cierre mensual de indicadores de programa social con acción correctiva",
"C003": "revisión autónoma del borrador de postulación a fondos chilenos",
"C004": "segmentación de donantes y siguiente contacto sin CRM pagado",
"C005": "inducción y seguimiento de una cohorte de voluntarios en una OSC",
"C006": "registro colaborativo semanal de tareas, respaldos y permisos de convenio",
}
WEB_CHECKS = {
"O005": ("https://www.espacioterritorial.cl/iniciativas/objetivos-smart-y-kpi-en-organizaciones-sociales-2026/",
         "Microtaller gratuito asincrónico de KPI y tablero para dirigentes; página indica inscripciones cerradas."),
"O357": ("https://teleduc.uc.cl/products/implementacion-de-un-sistema-de-control-de-gestion",
         "Nanocurso autogestionado de indicadores y control; no equivale a cierre mensual OSFL."),
"O352": ("https://www.santanderopenacademy.com/es/courses/marketing-automation.html/index.html",
         "Curso gratuito 7 h de segmentación y marketing; no especifica seguimiento de donantes de OSC."),
"O314": ("https://capacitacion.sercotec.cl/portal/capacitacion/gestion-financiera/",
         "Curso de gestión financiera empresarial, no caja restringida por convenio."),
"O389": ("https://incubatuong.cl/webinar-fondos-concursables-para-ong/",
         "Cinco sesiones grabadas gratuitas sobre bases y criterios de fondos para ONG."),
"O390": ("https://incubatuong.cl/checklist-fondo-comunidad-activa/",
         "Checklist gratuita basada en reglas 2026 para convocatoria 2027; reglas futuras no confirmadas."),
"O388": ("https://incubatuong.cl/fondo-comunidad-activa-2027/",
         "Servicio presencial remoto con 7 sesiones en vivo y 2 devoluciones escritas, no microcurso autónomo."),
"O004": ("https://quieroservoluntario.cl/taller-gestion-voluntariado/",
         "Taller de cuatro sesiones en vivo, tareas de inducción y seguimiento, grabaciones disponibles."),
"O373": ("https://simondecirene.cl/otec/",
         "OTEC propio lista curso asincrónico de monitoreo y evaluación, ejercicios exactos no comprobados."),
"O375": ("https://simondecirene.cl/cursos/adm-contabilidad-osfl-v3-2026/",
         "Administración y contabilidad OSFL propia con tutorías Zoom, no caja semanal restringida."),
"O376": ("https://simondecirene.cl/cursos/tramites-contables-para-osfl-v1/",
         "Trámites Contables OSFL propio con Zoom/aula, no registro colaborativo de convenios."),
"O250": ("https://platzi.com/cursos/seguimiento-proyectos/",
         "Curso asincrónico de seguimiento/cierre de proyectos; no confirma respaldo y permisos OSFL."),
"O356": ("https://teleduc.uc.cl/products/presupuesto-organizacional-para-una-adecuada-gestion-financiera",
         "Nanocurso de presupuesto organizacional; no verifica caja semanal restringida."),
"O026": ("https://www.udemy.com/course/gestion-de-proyectos-de-desarrollo-social/",
         "Gestión de proyectos sociales dirigida también a ONG; no enseña flujo específico de respaldos.")
}
FIELDS = [
"oferta_id","concepto_primario","otros_conceptos","referencia_previa_C",
"coincidencia_lexica","categoria_documental","nombre","proveedor",
"tarea_catalogada","publico_catalogado","sector_OSFL_explicito","modalidad_catalogada",
"formato_descriptivo","precio_catalogado","moneda","unidad_cobro","url_catalogada",
"fundamento","verificacion_externa","url_verificacion","observacion_web"
]
def rows(group: dict) -> list[dict]:
    return [dict(zip(group["headers"],r)) for r in group["rows"]]

def evaluate() -> tuple[list[dict],dict]:
    base=json.loads((ROOT/"data/dataset.json").read_text(encoding="utf8"))
    oferta=rows(base["Oferta"]); conceptos=rows(base["Decisión"])
    assert (len(oferta),len(rows(base["Demanda"])),len(rows(base["Búsquedas"])),len(conceptos))==(392,24,709,6)
    refs={}
    for c in conceptos:
        for oid in re.findall(r"O\d{3}",c["IDs de alternativas y precios"]):
            refs.setdefault(oid,[]).append(c["ID de concepto"])
    assert len(refs)==34 and sum(map(len,refs.values()))==38
    with (ROOT/"data/analysis/ux11_1_oferta_392_pantalla.csv").open(encoding="utf8",newline="") as f:
        old=list(csv.DictReader(f))
    assert len(old)==392
    by_id={x["oferta_id"]:x for x in old}
    assert len(by_id)==392
    output=[]
    for o in oferta:
        oid=o["ID de oferta"]
        prior=refs.get(oid,[])
        lexical=[s.strip() for s in by_id[oid]["tema_sugerido_por_texto"].split(",") if s.strip()]
        if not prior and not lexical: continue
        cid=PRIMARY.get(oid) or (prior or lexical)[0]
        assert cid in OBJECTIVES
        status=("DESCARTAR_DESAJUSTE" if oid in EXCLUDE else
                "SUSTITUTO_PARCIAL_POTENCIAL" if oid in NEAR else
                "ADYACENTE_NO_EQUIVALENTE")
        task=o["Tarea"] or ""
        goal=OBJECTIVES[cid]
        why=(f"La tarea «{task}» no equivale al resultado específico «{goal}»; "
             "desajuste de tarea o público."
             if status=="DESCARTAR_DESAJUSTE" else
             f"«{task}» puede cubrir parte de «{goal}», pero no se acreditó equivalencia "
             "funcional, público y modalidad."
             if status=="SUSTITUTO_PARCIAL_POTENCIAL" else
             f"Comparte herramienta o habilidad («{task}»), pero no demuestra el resultado «{goal}».")
        audience=str(o["Público declarado"] or "")
        osfl=bool(re.search(r"fundaci[oó]n|corporaci[oó]n|ong|organizaciones sociales|"
                  r"organizaciones sin fines de lucro|osfl|dirigentes sociales|"
                  r"organizaciones comunitarias|proyectos sociales|ben[eé]ficas",audience,re.I))
        fmt=str(o["Formato"] or "")
        mode=("MIXTO_O_AMBIGUO" if "asincr" in fmt.lower() and
              re.search(r"\bsincr|\ben vivo\b|\bzoom\b|presencial",fmt,re.I) else
              "SINCRONICO_O_PRESENCIAL" if re.search(r"\bsincr|\ben vivo\b|\bzoom\b|presencial",fmt,re.I) else
              "ASINCRONICO_DECLARADO" if re.search("asincr|autogestionad|a ritmo propio",fmt,re.I) else
              "RECURSO_NO_CURSO" if re.search("gu[ií]a|pdf|art[ií]culo|checklist",fmt+" "+o["Producto o recurso"],re.I) else
              "FORMATO_INSUFICIENTE")
        ext=WEB_CHECKS.get(oid)
        output.append(dict(
            oferta_id=oid,concepto_primario=cid,
            otros_conceptos=";".join(sorted((set(prior)|set(lexical))-{cid})),
            referencia_previa_C="SI" if prior else "NO",
            coincidencia_lexica="SI" if lexical else "NO",
            categoria_documental=status,nombre=o["Producto o recurso"],
            proveedor=o["Proveedor"],tarea_catalogada=task,
            publico_catalogado=o["Público declarado"],
            sector_OSFL_explicito="SI" if osfl else "NO",
            modalidad_catalogada=mode,formato_descriptivo=fmt,
            precio_catalogado=o["Precio publicado"],moneda=o["Moneda"],
            unidad_cobro=o["Unidad de cobro"],url_catalogada=o["URL principal"],
            fundamento=why,verificacion_externa="WEB_CONTRASTADA_FICHA" if ext else "SOLO_BASE",
            url_verificacion=ext[0] if ext else "",
            observacion_web=ext[1] if ext else "",
        ))
    assert len(output)==188 and len({x["oferta_id"] for x in output})==188
    assert sum(x["referencia_previa_C"]=="NO" for x in output)==154
    assert sum(x["referencia_previa_C"]=="SI" for x in output)==34
    assert sum(x["coincidencia_lexica"]=="SI" for x in output)==184
    assert sum(x["verificacion_externa"]=="WEB_CONTRASTADA_FICHA" for x in output)==14
    assert set(WEB_CHECKS) <= {x["oferta_id"] for x in output}
    stats={"fase":"UX-11.2","fecha_corte":"2026-11-23",
           "baseline":"v1.0.12","universo_oferta":392,"review_documental":188,
           "adicionales_del_cribado":154,"referencias_previas":34,
           "resto_no_revisado":204,"web_contrastadas":14,
           "veredictos_documentales":dict(Counter(x["categoria_documental"] for x in output)),
           "conceptos":{cid:{
               "ofertas_primarias":sum(x["concepto_primario"]==cid for x in output),
               "adicionales":sum(x["concepto_primario"]==cid and x["referencia_previa_C"]=="NO" for x in output),
               "sustitutos_parciales_potenciales":sum(x["concepto_primario"]==cid and x["categoria_documental"]=="SUSTITUTO_PARCIAL_POTENCIAL" for x in output)}
               for cid in OBJECTIVES},
           "interpretacion":"Sólo auditoría de metadatos y 14 fichas externas. Ningún supuesto de ventas, equivalencia total, intención de compra, ni vacío de mercado validado. Clasificaciones provisionales.",
           "pendiente":"Revisión profunda del contenido y vigencia de otras ofertas, especialmente las 204 fuera de cola; no inferir inexistencia de sustitutos."}
    return output,stats

def export(output:Path=OUT)->dict:
    data,summary=evaluate()
    output.mkdir(parents=True,exist_ok=True)
    with (output/"catalogo_188.csv").open("w",encoding="utf8",newline="") as f:
        w=csv.DictWriter(f,fieldnames=FIELDS,lineterminator="\n")
        w.writeheader();w.writerows(data)
    with (output/"casos_14.csv").open("w",encoding="utf8",newline="") as f:
        w=csv.DictWriter(f,fieldnames=FIELDS,lineterminator="\n")
        w.writeheader();w.writerows([r for r in data if r["verificacion_externa"]=="WEB_CONTRASTADA_FICHA"])
    (output/"resumen.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    return summary

if __name__=="__main__":
    print(json.dumps(export(),ensure_ascii=False,indent=2))
