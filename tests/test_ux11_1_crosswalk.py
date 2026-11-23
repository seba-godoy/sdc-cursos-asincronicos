"""Tests de cobertura, trazabilidad y no inferencia (UX-11.1)."""
import tempfile
import unittest
from pathlib import Path
from scripts.ux11_1_crosswalk import analyse, export

class TestUX111(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.result = analyse()

    def test_universe(self):
        self.assertEqual(len(self.result["full"]), 392 * 24)
        self.assertEqual(len(self.result["screening"]), 392)

    def test_refs(self):
        r = self.result
        self.assertEqual(len(r["curated"]), 164)
        self.assertEqual(r["overview"]["ofertas_unicas_en_c"], 34)
        self.assertEqual(r["overview"]["referencias_oferta_en_c"], 38)
        self.assertEqual(r["overview"]["referencias_demanda_en_c"], 24)

    def test_exhaustive_and_unique(self):
        p = [(x["oferta_id"], x["demanda_id"]) for x in self.result["full"]]
        self.assertEqual(len(p), len(set(p)))
        self.assertEqual(len(set(x[0] for x in p)), 392)
        self.assertEqual(len(set(x[1] for x in p)), 24)

    def test_no_commercial_inference(self):
        for row in self.result["curated"]:
            self.assertEqual(row["comprador_pagador_validado"], "NO_EN_DATOS")
            self.assertEqual(row["comparabilidad_precio"], "NO_COMPARABLE")
            self.assertEqual(row["comparabilidad_segmento"], "PENDIENTE_VALIDACION")
            self.assertEqual(row["tipo_cruce"], "COREFERENCIA_TEMATICA_NO_VALIDADA")

    def test_all_sources_linked(self):
        for row in self.result["curated"]:
            self.assertTrue(row["url_oferta"].startswith(("http://", "https://")))
            self.assertTrue(row["url_demanda"].startswith(("http://", "https://")))
            self.assertTrue(row["contraevidencia_concepto"])

    def test_sources_status_and_classes(self):
        o = self.result["overview"]
        self.assertEqual(o["corroboracion_demanda"], {
            "DIRECTO": 15, "INDICE_OFICIAL": 3, "PARCIAL": 6
        })
        self.assertEqual(o["clase_senal_demanda"], {
            "FORMACION": 11, "POSTULACION": 2, "OPERACION": 6,
            "CONTRATACION_INSTITUCIONAL": 5
        })

    def test_linked_vs_unlinked_not_absence(self):
        o = self.result["overview"]
        self.assertEqual(o["pares_sin_enlace_curado"], 9244)
        self.assertIn("no implica ausencia", o["advertencia"].lower())
        self.assertEqual(o["ofertas_sin_referencia_c"], 358)

    def test_lexical_screen_only(self):
        o = self.result["overview"]
        self.assertEqual(o["ofertas_candidatas_busqueda_lexica"], 184)
        self.assertEqual(o["ofertas_sin_coincidencia_lexica"], 208)
        self.assertTrue(all(x["estado_revision"] in {
            "REVISION_PENDIENTE", "REFERENCIA_C_CANONICA"
        } for x in self.result["screening"]))

    def test_distinct_dependency_note(self):
        mapped = [x for x in self.result["curated"] if x["demanda_id"] == "D012"]
        self.assertTrue(mapped and all("D014" in x["dependencia_observaciones"] for x in mapped))

    def test_export_reproducible(self):
        with tempfile.TemporaryDirectory() as t:
            dest = Path(t)
            output = export(dest)
            self.assertEqual(output["universo_oxd"], 9408)
            self.assertEqual(len((dest / "curados_164.csv").read_text(encoding="utf8").splitlines()), 165)
            self.assertTrue((dest / "resumen.json").is_file())
            self.assertTrue((dest / "oferta_392_pantalla.csv").is_file())
            self.assertTrue((dest / "conceptos_6.json").is_file())

if __name__ == "__main__":
    unittest.main()
