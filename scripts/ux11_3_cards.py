#!/usr/bin/env python3
"""UX-11.3: fichas comparativas de seis conceptos a partir de fuentes canónicas.

No recalcula puntajes, no valida voluntad de pago, no despliega HTML.
Los campos editoriales en ux11_3_hypotheses.json son HIPÓTESIS y pruebas
PROPUESTAS, no observaciones de campo ejecutadas.
"""
from __future__ import annotations

import csv
import json
from collections import Counter
from pathlib import Path
from scripts.ux11_2_review import evaluate as compare_offers

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "dist" / "ux11_3"
C_FIELDS = [
    "concepto_id", "nombre", "posicion_decision", "puntaje_historico_no_recalculado",
    "confianza_historica", "senales_demanda", "corroboracion_directa",
    "corroboracion_indice_oficial", "corroboracion_parcial", "referencias_oferta_historicas",
    "ofertas_cribadas_ux112_primarias", "sustitutos_parciales_ux112_primarios",
    "ofertas_clave_seleccionadas", "oferta_propia_id", "resultado_practico",
    "diferenciacion_hipotetica", "contraevidencia_declarada", "riesgo_adicional",
    "prueba_falsadora_propuesta", "umbral_o_evidencia_para_avanzar", "pago_por_curso_verificado"
]
F_FIELDS = [
    "concepto_id", "nombre", "hipotesis_diferenciacion", "prueba_falsadora_propuesta",
    "evidencia_minima_para_avanzar", "estado_de_ejecucion"
]


def as_records(group: dict) -> list[dict]:
    keys=group["headers"]
    return [dict(zip(keys, row)) for row in group["rows"]]


def build_cards() -> tuple[list[dict],dict]:
    full=json.loads((ROOT/"data/dataset.json").read_text(encoding="utf8"))
    design=json.loads((ROOT/"data/analysis/ux11_3_hypotheses.json").read_text(encoding="utf8"))
    prior=json.loads((ROOT/"data/analysis/ux11_1_conceptos.json").read_text(encoding="utf8"))
    demand_state=json.loads((ROOT/"data/ux10-demand-brief.json").read_text(encoding="utf8"))["statuses"]
    reviews, review_summary = compare_offers()
    offers={o["ID de oferta"]:o for o in as_records(full["Oferta"])}
    demands={d["ID de señal"]:d for d in as_records(full["Demanda"])}
    concepts={c["ID de concepto"]:c for c in as_records(full["Decisión"])}
    inherited={c["id"]:c for c in prior}
    reviews_by_id={c["oferta_id"]:c for c in reviews}
    editorial={c["id"]:c for c in design["cards"]}
    assert len(offers)==392 and len(demands)==24 and len(concepts)==6 and len(reviews)==188
    assert set(editorial)==set(concepts)==set(inherited)=={"C001","C002","C003","C004","C005","C006"}
    assert len(demand_state)==24
    result=[]
    for cid in sorted(concepts):
        c=concepts[cid]; prev=inherited[cid]; e=editorial[cid]
        assert e["decision_condicional"] in {
            "PRIORIDAD_CONDICIONAL_1","PRIORIDAD_CONDICIONAL_2","RESERVA","EXPLORATORIA","POSPONER"}
        assert e["compra_verificada"] is False, "No hay evidencia de compradores OSC de estos microcursos"
        assert len(set(e["ofertas_clave"]))==len(e["ofertas_clave"])
        assert set(e["ofertas_clave"])<=set(offers)
        assert set(e["solapamiento_propio"])<=set(e["ofertas_clave"])
        demand_ids=prev["demanda_ids"]; o_ids=prev["oferta_ids"]
        assert all(d in demands and d in demand_state for d in demand_ids)
        assert all(o in offers for o in o_ids)
        assert c["Puntaje o rango"]==prev["puntaje_previo_no_recalculado"]
        signals=[{
            "id":did,"fuente":demands[did]["Fuente"],
            "tipo_senal":demands[did]["Tipo de señal"],
            "corroboracion":demand_state[did],
            "hecho_observado":demands[did]["Dato observado"],
            "valor":demands[did]["Valor"],
            "unidad":demands[did]["Unidad"],
            "publico":demands[did]["Población o segmento"],
            "limitacion":demands[did]["Pertinencia y limitación"],
            "url":demands[did]["URL de la fuente"],
        } for did in demand_ids]
        selected=[{
            "id":oid,"nombre":offers[oid]["Producto o recurso"],
            "proveedor":offers[oid]["Proveedor"],
            "tarea":offers[oid]["Tarea"],
            "publico":offers[oid]["Público declarado"],
            "formato":offers[oid]["Formato"],
            "precio_historico":offers[oid]["Precio publicado"],
            "url":offers[oid]["URL principal"],
            "incluida_en_concepto_historico":oid in o_ids,
            "solapamiento_oferta_propia":oid in e["solapamiento_propio"],
            "clasificacion_documental_ux112":reviews_by_id.get(oid,{}).get("categoria_documental","NO_CLASIFICADA_UX112"),
            "contraste_web_ux112":reviews_by_id.get(oid,{}).get("verificacion_externa","NO_CONTRASTADA_WEB"),
        } for oid in e["ofertas_clave"]]
        count=Counter(demand_state[x] for x in demand_ids)
        reviewed=[x for x in reviews if x["concepto_primario"]==cid]
        result.append({
            "concepto_id":cid,"nombre":c["Concepto de curso"],
            "usuario_declarado_historico":c["Usuario"],
            "comprador_probable_historico":c["Comprador probable"],
            "posicion_decision":e["decision_condicional"],
            "motivo_decision":e["motivo_decision"],
            "puntaje_historico_no_recalculado":c["Puntaje o rango"],
            "confianza_historica":c["Confianza"],
            "respaldo_historico":c["Ventaja propuesta"],
            "contraevidencia_historica":c["Evidencia contraria"],
            "solapamiento_historico":c["Mejor sustituto"],
            "senal_ids":demand_ids,"senales":signals,
            "corroboracion":{k:count.get(k,0) for k in ("DIRECTO","INDICE_OFICIAL","PARCIAL")},
            "referencias_O_historicas":o_ids,
            "comparacion_ux112":{
                "ofertas_cribadas_concepto_primario":len(reviewed),
                "sustitutos_parciales_potenciales":sum(x["categoria_documental"]=="SUSTITUTO_PARCIAL_POTENCIAL" for x in reviewed),
                "adyacentes":sum(x["categoria_documental"]=="ADYACENTE_NO_EQUIVALENTE" for x in reviewed),
                "descartes_documentales":sum(x["categoria_documental"]=="DESCARTAR_DESAJUSTE" for x in reviewed),
                "nota":"Asignación de concepto primario por cribado, NO tamaño de mercado ni competidores directos."
            },
            "ofertas_clave":selected,
            "ofertas_propias_relacionadas":e["solapamiento_propio"],
            "publico_hipotetico":e["audiencia"],
            "entregable_hipotetico":e["resultado_practico"],
            "diferenciacion_hipotetica":e["propuesta_hipotesis"],
            "riesgo_diferenciacion":e["riesgo_diferenciacion"],
            "prueba_falsadora_propuesta_no_ejecutada":e["prueba_falsadora"],
            "condicion_para_avanzar_propuesta":e["evidencia_minima_para_avanzar"],
            "compra_del_microcurso_verificada":False,
            "brecha_de_mercado_verificada":False,
            "nota_validacion":"Hipótesis editorial y prueba futura. No contiene entrevistas, ensayo comercial ni demostración de pago."
        })
    assert sum(len(x["senales"]) for x in result)==24
    assert result[1]["concepto_id"]=="C002" and result[2]["concepto_id"]=="C003"
    assert result[2]["puntaje_historico_no_recalculado"].endswith("3,55")
    assert result[1]["puntaje_historico_no_recalculado"].endswith("3,45")
    summary={
        "fase":"UX-11.3","fecha":"2026-11-23",
        "conceptos":len(result),"diferenciaciones_hipoteticas":6,
        "pruebas_falsadoras_disenadas_no_ejecutadas":6,
        "senales_d_referenciadas":24,
        "total_referencias_o_historicas":sum(len(x["referencias_O_historicas"]) for x in result),
        "ofertas_ux112_clasificadas":review_summary["review_documental"],
        "ofertas_ux112_contrastadas_web":review_summary["web_contrastadas"],
        "puntuaciones_recalculadas":0,
        "validaciones_comerciales_ejecutadas":0,
        "prioridades_condicionadas":["C003","C002"],
        "restriccion":"No afirmar brecha, compra, precio actual, representatividad ni equivalencia total; validar oferta propia y alternativas gratuitas antes de producir."
    }
    return result,summary


def write_csv(path:Path, fields:list[str], data:list[dict]) -> None:
    with path.open("w",encoding="utf8",newline="") as f:
        w=csv.DictWriter(f,fieldnames=fields,lineterminator="\n")
        w.writeheader();w.writerows(data)


def export(output:Path=OUTPUT)->dict:
    cards,summary=build_cards()
    output.mkdir(parents=True,exist_ok=True)
    (output/"fichas_6.json").write_text(json.dumps(cards,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    (output/"resumen.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    matrix=[]
    falsifiers=[]
    for c in cards:
        matrix.append({
            "concepto_id":c["concepto_id"],"nombre":c["nombre"],
            "posicion_decision":c["posicion_decision"],
            "puntaje_historico_no_recalculado":c["puntaje_historico_no_recalculado"],
            "confianza_historica":c["confianza_historica"],
            "senales_demanda":";".join(c["senal_ids"]),
            "corroboracion_directa":c["corroboracion"]["DIRECTO"],
            "corroboracion_indice_oficial":c["corroboracion"]["INDICE_OFICIAL"],
            "corroboracion_parcial":c["corroboracion"]["PARCIAL"],
            "referencias_oferta_historicas":";".join(c["referencias_O_historicas"]),
            "ofertas_cribadas_ux112_primarias":c["comparacion_ux112"]["ofertas_cribadas_concepto_primario"],
            "sustitutos_parciales_ux112_primarios":c["comparacion_ux112"]["sustitutos_parciales_potenciales"],
            "ofertas_clave_seleccionadas":";".join(x["id"] for x in c["ofertas_clave"]),
            "oferta_propia_id":";".join(c["ofertas_propias_relacionadas"]),
            "resultado_practico":c["entregable_hipotetico"],
            "diferenciacion_hipotetica":c["diferenciacion_hipotetica"],
            "contraevidencia_declarada":c["contraevidencia_historica"],
            "riesgo_adicional":c["riesgo_diferenciacion"],
            "prueba_falsadora_propuesta":c["prueba_falsadora_propuesta_no_ejecutada"],
            "umbral_o_evidencia_para_avanzar":c["condicion_para_avanzar_propuesta"],
            "pago_por_curso_verificado":"NO",
        })
        falsifiers.append({
            "concepto_id":c["concepto_id"],"nombre":c["nombre"],
            "hipotesis_diferenciacion":c["diferenciacion_hipotetica"],
            "prueba_falsadora_propuesta":c["prueba_falsadora_propuesta_no_ejecutada"],
            "evidencia_minima_para_avanzar":c["condicion_para_avanzar_propuesta"],
            "estado_de_ejecucion":"NO_EJECUTADA"
        })
    write_csv(output/"matriz_6.csv",C_FIELDS,matrix)
    write_csv(output/"pruebas_falsadoras_6.csv",F_FIELDS,falsifiers)
    return summary


if __name__=="__main__":
    print(json.dumps(export(),ensure_ascii=False,indent=2))
