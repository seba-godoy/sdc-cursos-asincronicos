"""UX-11.2: QA de cobertura, trazabilidad y límites de sustitución."""
import csv
import tempfile
import unittest
from pathlib import Path
from scripts.ux11_2_review import evaluate, export, NEAR, EXCLUDE, WEB_CHECKS, FIELDS

class TestUX112(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.rows,cls.summary=evaluate()
    def test_complete_screened_universe(self):
        self.assertEqual(len(self.rows),188)
        self.assertEqual(len({x["oferta_id"] for x in self.rows}),188)
        self.assertEqual(self.summary["resto_no_revisado"],204)
        self.assertEqual(sum(x["referencia_previa_C"]=="NO" for x in self.rows),154)
        self.assertEqual(sum(x["referencia_previa_C"]=="SI" for x in self.rows),34)
    def test_classification_total(self):
        self.assertEqual(sum(self.summary["veredictos_documentales"].values()),188)
        self.assertEqual(set(self.summary["veredictos_documentales"]),{
            "ADYACENTE_NO_EQUIVALENTE","SUSTITUTO_PARCIAL_POTENCIAL","DESCARTAR_DESAJUSTE"
        })
        self.assertFalse(NEAR & EXCLUDE)
        self.assertEqual(sum(x["coincidencia_lexica"]=="SI" for x in self.rows),184)
    def test_coding_validity(self):
        for row in self.rows:
            self.assertEqual(set(row),set(FIELDS))
            self.assertTrue(row["oferta_id"].startswith("O"))
            self.assertIn(row["concepto_primario"],{"C001","C002","C003","C004","C005","C006"})
            self.assertTrue(row["fundamento"])
            self.assertTrue(row["url_catalogada"].startswith(("http://","https://")))
            self.assertNotIn("DEMANDA_CONFIRMADA",row["categoria_documental"])
    def test_web_contrast_scope(self):
        rows=[r for r in self.rows if r["verificacion_externa"]=="WEB_CONTRASTADA_FICHA"]
        self.assertEqual(len(rows),14)
        self.assertEqual({r["oferta_id"] for r in rows},set(WEB_CHECKS))
        self.assertTrue(all(r["url_verificacion"].startswith("https://") for r in rows))
        self.assertTrue(all(r["observacion_web"] for r in rows))
        self.assertTrue(all(not r["url_verificacion"] for r in self.rows if r not in rows))
    def test_no_conversion_metrics(self):
        s=str(self.summary).lower()
        self.assertIn("ningún supuesto de ventas",s)
        self.assertEqual(self.summary["universo_oferta"],392)
        self.assertNotIn("compradores_unicos",self.summary)
    def test_export(self):
        with tempfile.TemporaryDirectory() as root:
            out=Path(root);summary=export(out)
            self.assertEqual(summary,self.summary)
            with (out/"catalogo_188.csv").open(encoding="utf8",newline="") as f:
                c=list(csv.DictReader(f))
            with (out/"casos_14.csv").open(encoding="utf8",newline="") as f:
                w=list(csv.DictReader(f))
            self.assertEqual(len(c),188)
            self.assertEqual(len(w),14)
            self.assertEqual([r["oferta_id"] for r in c],[r["oferta_id"] for r in self.rows])
            self.assertTrue((out/"resumen.json").exists())
    def test_mode_separation(self):
        o005=next(r for r in self.rows if r["oferta_id"]=="O005")
        self.assertNotEqual(o005["modalidad_catalogada"],"SINCRONICO_O_PRESENCIAL")
        o004=next(r for r in self.rows if r["oferta_id"]=="O004")
        self.assertNotEqual(o004["modalidad_catalogada"],"ASINCRONICO_DECLARADO")
if __name__=="__main__":
    unittest.main()
