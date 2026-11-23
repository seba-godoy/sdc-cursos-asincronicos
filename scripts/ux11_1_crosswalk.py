#!/usr/bin/env python3
"""UX-11.1: cruces documentales Oferta x Demanda. No puntúa ni publica.

El universo son todas las 392 x 24 combinaciones. Sólo se consideran enlaces
temáticos CURADOS los pares O/D referidos por el mismo concepto C canónico.
El resto queda SIN_ENLACE_CURADO, nunca "sin demanda" ni "sin competidor".
"""
from __future__ import annotations
import argparse
import csv
import json
import re
import unicodedata
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/dataset.json"
BRIEF = ROOT / "data/ux10-demand-brief.json"
OUT = ROOT / "dist/ux11_1"

TOPIC_TERMS = {
    "C001": ("H1C-01", ["flujo de caja", "caja", "presupuesto", "contabilidad", "finanzas"]),
    "C002": ("H1C-02", ["indicadores", "kpi", "tablero", "monitoreo", "evaluacion", "power bi"]),
    "C003": ("H1C-03", ["postulacion", "fondos concursables", "formulacion de proyectos", "propuestas", "grant"]),
    "C004": ("H1C-04", ["donantes", "fundraising", "recaudacion", "crm", "captacion"]),
    "C005": ("H1C-05", ["voluntariado", "voluntarios", "voluntario"]),
    "C006": ("H1C-06", ["registro", "tareas", "seguimiento", "airtable", "gestion de proyectos", "gantt", "bitacora"]),
}
DEPENDS = {
    "D002": "D003: ediciones distintas con organizadores parcialmente compartidos",
    "D003": "D002: ediciones distintas con organizadores parcialmente compartidos",
    "D009": "D010: ediciones distintas con organizadores compartidos",
    "D010": "D009: ediciones distintas con organizadores compartidos",
    "D012": "D014: una fuente y un proyecto, dos observaciones",
    "D014": "D012: una fuente y un proyecto, dos observaciones",
    "D018": "D019: mismo comprador institucional en años distintos",
    "D019": "D018: mismo comprador institucional en años distintos",
}
HISTORICAL = {"D011", "D021", "D023"}
SIGNAL_GROUPS = {
    "FORMACION": {"D001", "D002", "D003", "D004", "D006", "D007", "D009", "D010", "D013", "D015", "D016"},
    "POSTULACION": {"D005", "D008"},
    "OPERACION": {"D011", "D012", "D014", "D022", "D023", "D024"},
    "CONTRATACION_INSTITUCIONAL": {"D017", "D018", "D019", "D020", "D021"},
}
FULL_FIELDS = ["oferta_id", "demanda_id", "concepto_id", "clasificacion", "interpretacion"]
CURATED_FIELDS = [
    "concepto_id", "concepto_nombre", "oferta_id", "demanda_id", "tipo_cruce",
    "fuente_enlace", "tarea_oferta", "curso_o_recurso", "proveedor_oferta",
    "publico_oferta", "formato_oferta", "precio_oferta", "unidad_cobro_oferta", "url_oferta",
    "tarea_demanda", "clase_senal", "auditoria_demanda", "poblacion_demanda",
    "dato_demanda", "valor_demanda", "unidad_demanda", "fuente_demanda", "url_demanda",
    "dependencia_observaciones", "advertencia_fecha", "contraevidencia_concepto",
    "comprador_pagador_validado", "comparabilidad_precio", "comparabilidad_segmento",
]
SCREEN_FIELDS = ["oferta_id", "curso_o_recurso", "tema_sugerido_por_texto",
                 "enlace_conceptual_preexistente", "estado_revision"]


def records(group: dict) -> list[dict]:
    hs = group["headers"]
    return [dict(zip(hs, row)) for row in group["rows"]]


def ids(pattern: str, text: object) -> list[str]:
    return list(dict.fromkeys(re.findall(pattern, str(text or ""))))


def normalize(text: object) -> str:
    s = unicodedata.normalize("NFKD", str(text or "").lower())
    return "".join(c for c in s if not unicodedata.combining(c))


def analyse() -> dict:
    source = json.loads(DATA.read_text(encoding="utf-8"))
    brief = json.loads(BRIEF.read_text(encoding="utf-8"))
    oferta = records(source["Oferta"])
    demanda = records(source["Demanda"])
    conceptos = records(source["Decisión"])
    busquedas = records(source["Búsquedas"])
    assert (len(oferta), len(demanda), len(conceptos), len(busquedas)) == (392, 24, 6, 709)
    oid = {o["ID de oferta"]: o for o in oferta}
    did = {d["ID de señal"]: d for d in demanda}
    assert len(oid) == 392 and len(did) == 24
    statuses = brief["statuses"]
    assert set(statuses) == set(did)
    assert set().union(*SIGNAL_GROUPS.values()) == set(did)
    assert sum(map(len, SIGNAL_GROUPS.values())) == 24
    signal_class = {id_: key for key, group in SIGNAL_GROUPS.items() for id_ in group}

    c_link: dict[str, dict] = {}
    demand_to_concept: dict[str, str] = {}
    for c in conceptos:
        cid = c["ID de concepto"]
        orefs = ids(r"O\d{3}", c["IDs de alternativas y precios"])
        drefs = ids(r"D\d{3}", c["IDs de evidencia de demanda"])
        assert orefs and drefs and set(orefs) <= set(oid) and set(drefs) <= set(did)
        assert all(d not in demand_to_concept for d in drefs)
        demand_to_concept.update({d: cid for d in drefs})
        c_link[cid] = {"concept": c, "offers": orefs, "demands": drefs}
    assert set(demand_to_concept) == set(did)
    assert sum(len(c["offers"]) for c in c_link.values()) == 38
    assert len(set(x for c in c_link.values() for x in c["offers"])) == 34

    full = []
    curated = []
    for o in oferta:
        o_id = o["ID de oferta"]
        for d in demanda:
            d_id = d["ID de señal"]
            cid = demand_to_concept[d_id]
            is_link = o_id in c_link[cid]["offers"]
            full.append({
                "oferta_id": o_id,
                "demanda_id": d_id,
                "concepto_id": cid,
                "clasificacion": "ENLACE_C_TEMATICO" if is_link else "SIN_ENLACE_CURADO",
                "interpretacion": "Par temático de referencias canónicas; equivalencia de público/resultado no verificada"
                                  if is_link else
                                  "No hay enlace en los seis conceptos; no demuestra ausencia de oferta ni de demanda",
            })
            if not is_link:
                continue
            c = c_link[cid]["concept"]
            curated.append({
                "concepto_id": cid, "concepto_nombre": c["Concepto de curso"],
                "oferta_id": o_id, "demanda_id": d_id,
                "tipo_cruce": "COREFERENCIA_TEMATICA_NO_VALIDADA",
                "fuente_enlace": "Decisión." + cid + " (v1.0.12)",
                "tarea_oferta": o["Tarea"], "curso_o_recurso": o["Producto o recurso"],
                "proveedor_oferta": o["Proveedor"], "publico_oferta": o["Público declarado"],
                "formato_oferta": o["Formato"], "precio_oferta": o["Precio publicado"],
                "unidad_cobro_oferta": o["Unidad de cobro"], "url_oferta": o["URL principal"],
                "tarea_demanda": d["Tarea o tema"], "clase_senal": signal_class[d_id],
                "auditoria_demanda": statuses[d_id], "poblacion_demanda": d["Población o segmento"],
                "dato_demanda": d["Dato observado"], "valor_demanda": d["Valor"],
                "unidad_demanda": d["Unidad"], "fuente_demanda": d["Fuente"],
                "url_demanda": d["URL de la fuente"],
                "dependencia_observaciones": DEPENDS.get(d_id, ""),
                "advertencia_fecha": "caso_historico_no_actual" if d_id in HISTORICAL else "",
                "contraevidencia_concepto": c["Evidencia contraria"],
                "comprador_pagador_validado": "NO_EN_DATOS",
                "comparabilidad_precio": "NO_COMPARABLE",
                "comparabilidad_segmento": "PENDIENTE_VALIDACION",
            })

    indexed = {o for link in c_link.values() for o in link["offers"]}
    screening = []
    for o in oferta:
        o_id = o["ID de oferta"]
        title_task = normalize(o["Producto o recurso"]) + " " + normalize(o["Tarea"])
        topic = []
        for cid, (code, phrases) in TOPIC_TERMS.items():
            if normalize(code) in title_task or any(w in title_task for w in phrases):
                topic.append(cid)
        screening.append({
            "oferta_id": o_id, "curso_o_recurso": o["Producto o recurso"],
            "tema_sugerido_por_texto": ", ".join(topic),
            "enlace_conceptual_preexistente": "SI" if o_id in indexed else "NO",
            "estado_revision": "REVISION_PENDIENTE" if o_id not in indexed else "REFERENCIA_C_CANONICA",
        })
    per_concept = []
    for cid, item in c_link.items():
        c = item["concept"]
        drefs = item["demands"]
        per_concept.append({
            "id": cid, "nombre": c["Concepto de curso"], "demanda_ids": drefs,
            "oferta_ids": item["offers"], "n_demanda": len(drefs),
            "n_oferta": len(item["offers"]),
            "n_pares_cotematicos": len(drefs) * len(item["offers"]),
            "señales_tipo": dict(sorted(Counter(signal_class[d] for d in drefs).items())),
            "corroboracion": dict(sorted(Counter(statuses[d] for d in drefs).items())),
            "respaldo_declarado": c["Ventaja propuesta"],
            "contraevidencia": c["Evidencia contraria"],
            "sustituto": c["Mejor sustituto"],
            "confianza_previa": c["Confianza"],
            "puntaje_previo_no_recalculado": c["Puntaje o rango"],
            "falsador_o_pendiente": c["Dato que cambiaría la decisión"],
        })
    assert len(full) == 9408 and len(curated) == 164 and len(screening) == 392
    assert Counter(x["clasificacion"] for x in full) == {
        "ENLACE_C_TEMATICO": 164, "SIN_ENLACE_CURADO": 9244
    }
    assert Counter(statuses.values()) == {"DIRECTO": 15, "INDICE_OFICIAL": 3, "PARCIAL": 6}
    overview = {
        "version": "UX-11.1", "baseline": "v1.0.12", "corte": "2026-11-23",
        "unidades": {"oferta": 392, "demanda": 24, "busquedas": 709, "conceptos": 6},
        "universo_oxd": len(full),
        "pares_cotematicos_por_referencias_c": len(curated),
        "pares_sin_enlace_curado": len(full) - len(curated),
        "referencias_oferta_en_c": 38, "ofertas_unicas_en_c": len(indexed),
        "ofertas_sin_referencia_c": len(oferta) - len(indexed),
        "referencias_demanda_en_c": 24,
        "corroboracion_demanda": dict(sorted(Counter(statuses.values()).items())),
        "clase_senal_demanda": dict(sorted(Counter(signal_class.values()).items())),
        "ofertas_candidatas_busqueda_lexica": sum(bool(x["tema_sugerido_por_texto"]) for x in screening),
        "ofertas_sin_coincidencia_lexica": sum(not x["tema_sugerido_por_texto"] for x in screening),
        "advertencia": (
            "Cada par es una coreferencia temática, NO una relación causal o equivalencia "
            "funcional; sin enlace no implica ausencia de oportunidad. "
            "No se agregan valores de demanda ni se infiere disposición a pagar."
        ),
    }
    return {"overview": overview, "full": full, "curated": curated, "screening": screening,
            "concepts": per_concept}


def write_csv(dest: Path, fields: list[str], rows: list[dict]) -> None:
    with dest.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fields, lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)


def export(output: Path = OUT) -> dict:
    result = analyse()
    output.mkdir(parents=True, exist_ok=True)
    write_csv(output / "universo_9408.csv", FULL_FIELDS, result["full"])
    write_csv(output / "curados_164.csv", CURATED_FIELDS, result["curated"])
    write_csv(output / "oferta_392_pantalla.csv", SCREEN_FIELDS, result["screening"])
    (output / "conceptos_6.json").write_text(json.dumps(
        result["concepts"], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (output / "resumen.json").write_text(json.dumps(
        result["overview"], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return result["overview"]


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=OUT,
                        help="Directorio fuera del árbol Git para los CSV/JSON calculados")
    args = parser.parse_args()
    print(json.dumps(export(args.output), ensure_ascii=False, indent=2))
