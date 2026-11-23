"""UX-11.3: QA de seis fichas, trazabilidad, puntajes intactos y no sobreafirmación."""
from __future__ import annotations

import csv
import json
import tempfile
import unittest
from pathlib import Path

from scripts.ux11_3_cards import ROOT, build_cards, export, C_FIELDS, F_FIELDS


class TestUX113(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.cards, cls.summary=build_cards()
        cls.by_id={x["concepto_id"]:x for x in cls.cards}
        cls.baseline=json.loads((ROOT/"data/dataset.json").read_text(encoding="utf8"))
        cls.source_concepts={r[0]:dict(zip(cls.baseline["Decisión"]["headers"],r))
                             for r in cls.baseline["Decisión"]["rows"]}

    def test_six_concepts(self):
        self.assertEqual(set(self.by_id),{f"C{i:03d}" for i in range(1,7)})
        self.assertEqual(len(self.cards),6)

    def test_source_traceability(self):
        demand_ids=[]
        for x in self.cards:
            source=self.source_concepts[x["concepto_id"]]
            self.assertEqual(x["puntaje_historico_no_recalculado"],source["Puntaje o rango"])
            self.assertEqual(x["confianza_historica"],source["Confianza"])
            self.assertEqual(x["contraevidencia_historica"],source["Evidencia contraria"])
            self.assertEqual(x["nombre"],source["Concepto de curso"])
            self.assertEqual(x["senal_ids"],[y["id"] for y in x["senales"]])
            demand_ids.extend(x["senal_ids"])
        self.assertEqual(len(demand_ids),24)
        self.assertEqual(len(set(demand_ids)),24)

    def test_no_commercial_overclaim(self):
        self.assertEqual(self.summary["validaciones_comerciales_ejecutadas"],0)
        self.assertEqual(self.summary["puntuaciones_recalculadas"],0)
        self.assertEqual(self.summary["pruebas_falsadoras_disenadas_no_ejecutadas"],6)
        for x in self.cards:
            self.assertIs(x["compra_del_microcurso_verificada"],False)
            self.assertIs(x["brecha_de_mercado_verificada"],False)
            self.assertIn("NO",x["nota_validacion"].upper())
            self.assertNotEqual(x["diferenciacion_hipotetica"],"")
            self.assertTrue(x["prueba_falsadora_propuesta_no_ejecutada"])
            self.assertTrue(x["condicion_para_avanzar_propuesta"])

    def test_priorities_not_recalculated(self):
        self.assertEqual(self.by_id["C003"]["posicion_decision"],"PRIORIDAD_CONDICIONAL_1")
        self.assertEqual(self.by_id["C002"]["posicion_decision"],"PRIORIDAD_CONDICIONAL_2")
        self.assertEqual(self.summary["prioridades_condicionadas"],["C003","C002"])
        self.assertTrue(self.by_id["C003"]["puntaje_historico_no_recalculado"].endswith("3,55"))
        self.assertTrue(self.by_id["C002"]["puntaje_historico_no_recalculado"].endswith("3,45"))

    def test_offers_cited(self):
        for x in self.cards:
            self.assertGreaterEqual(len(x["ofertas_clave"]),5)
            self.assertEqual(len(x["ofertas_clave"]),len(set(y["id"] for y in x["ofertas_clave"])))
            self.assertTrue(all(y["url"].startswith(("https://","http://")) for y in x["ofertas_clave"]))
            self.assertEqual(set(x["ofertas_propias_relacionadas"]),
                             {y["id"] for y in x["ofertas_clave"] if y["solapamiento_oferta_propia"]})
            for y in x["ofertas_clave"]:
                self.assertIn(y["clasificacion_documental_ux112"],{
                    "DESCARTAR_DESAJUSTE","SUSTITUTO_PARCIAL_POTENCIAL",
                    "ADYACENTE_NO_EQUIVALENTE","NO_CLASIFICADA_UX112"
                })

    def test_evidence_and_caveats(self):
        self.assertEqual(self.by_id["C001"]["corroboracion"]["PARCIAL"],3)
        self.assertEqual(self.by_id["C004"]["corroboracion"]["DIRECTO"],4)
        self.assertEqual(self.by_id["C002"]["corroboracion"]["INDICE_OFICIAL"],2)
        self.assertEqual(len(self.by_id["C005"]["senales"]),2)
        for x in self.cards:
            self.assertEqual(sum(x["corroboracion"].values()),len(x["senales"]))
            self.assertTrue(all(y["url"].startswith(("https://","http://")) for y in x["senales"]))
            self.assertTrue(all(y["limitacion"] for y in x["senales"]))

    def test_export_all(self):
        with tempfile.TemporaryDirectory() as dirname:
            dest=Path(dirname)
            self.assertEqual(export(dest),self.summary)
            with (dest/"matriz_6.csv").open(encoding="utf8",newline="") as f:
                matrix=list(csv.DictReader(f))
            with (dest/"pruebas_falsadoras_6.csv").open(encoding="utf8",newline="") as f:
                tests=list(csv.DictReader(f))
            self.assertEqual(len(matrix),6)
            self.assertEqual(len(tests),6)
            self.assertEqual(set(matrix[0]),set(C_FIELDS))
            self.assertEqual(set(tests[0]),set(F_FIELDS))
            self.assertTrue(all(t["estado_de_ejecucion"]=="NO_EJECUTADA" for t in tests))
            self.assertEqual(len(json.loads((dest/"fichas_6.json").read_text(encoding="utf8"))),6)
            self.assertEqual(json.loads((dest/"resumen.json").read_text(encoding="utf8")),self.summary)

if __name__=="__main__":
    unittest.main()
