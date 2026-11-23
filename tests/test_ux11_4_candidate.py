"""UX-11.4: baseline intacto, nueva UI reproducible y límites analíticos."""
from __future__ import annotations
import json
import re
import tempfile
import unittest
from pathlib import Path

from scripts.build import ROOT, assemble, sha256
from scripts.build_ux11_4 import BASELINE_SHA, build, export


class TestUX114(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.baseline=assemble(verify=True)
        cls.candidate,cls.meta=build()
        cls.html=cls.candidate.decode("utf8")

    def test_baseline_remains_original(self):
        self.assertEqual(len(self.baseline),1848239)
        self.assertEqual(sha256(self.baseline),BASELINE_SHA)
        self.assertNotIn(b'ux114-cards',self.baseline)

    def test_new_build_is_distinct_and_deterministic(self):
        other,meta=build()
        self.assertEqual(other,self.candidate)
        self.assertEqual(meta,self.meta)
        self.assertNotEqual(sha256(self.baseline),meta["candidate_sha256"])
        self.assertEqual(len(self.candidate),meta["candidate_bytes"])

    def test_unmodified_canonical_blocks(self):
        for name in ("dataset","ox-analysis-data","ux10-demand-brief"):
            regex=rb'<script\b[^>]*\bid="'+name.encode()+rb'"[^>]*>(.*?)</script>'
            old=re.search(regex,self.baseline,re.S)
            new=re.search(regex,self.candidate,re.S)
            self.assertIsNotNone(old,name)
            self.assertIsNotNone(new,name)
            self.assertEqual(old.group(1),new.group(1),name)
        self.assertEqual(self.candidate.count(b'data:image/png;base64,'),3)

    def test_six_cards_embedded(self):
        self.assertEqual(self.html.count('id="ux114-cards"'),1)
        data=re.search(r'<script type="application/json" id="ux114-cards">(.*?)</script>',self.html,re.S)
        self.assertIsNotNone(data)
        cards=json.loads(data.group(1))
        self.assertEqual([x["concepto_id"] for x in cards],["C001","C002","C003","C004","C005","C006"])
        self.assertEqual(sum(len(x["senales"]) for x in cards),24)
        self.assertEqual(sum(len(x["referencias_O_historicas"]) for x in cards),38)
        self.assertTrue(all(x["compra_del_microcurso_verificada"] is False for x in cards))
        self.assertTrue(all(x["brecha_de_mercado_verificada"] is False for x in cards))

    def test_ui_is_only_replaced_once(self):
        self.assertEqual(self.html.count('function renderConcepts(){'),1)
        self.assertNotIn('function renderConclusions()',self.html)
        self.assertIn('data-ux4-select',self.html)
        self.assertIn('aria-pressed=',self.html)
        self.assertIn('data-open=',self.html)
        self.assertIn('ux4-detail-heading',self.html)
        self.assertIn('ux4-priorities',self.html)
        self.assertIn('NO EJECUTADA',self.html)
        self.assertIn('NO miden',self.html)
        self.assertIn('ux4-evidence-list',self.html)
        self.assertIn('ux4-offers-list',self.html)

    def test_renderer_accepts_serialized_card_array(self):
        js=(ROOT/"src/ux11_4/render_concepts.js").read_text(encoding="utf8")
        self.assertIn("Array.isArray(ux4Data)?ux4Data:ux4Data.cards",js)
        self.assertIn('const ux4Map=new Map(ux4Cards.map',js)

    def test_no_external_asset_dependency(self):
        self.assertNotRegex(self.html,r'<script[^>]+src=["\']https?://')
        self.assertNotRegex(self.html,r'<link[^>]+rel=["\']stylesheet["\'][^>]+href=["\']https?://')
        self.assertTrue(self.html.startswith("<!DOCTYPE html>"))
        self.assertTrue(self.html.endswith("</html>"))

    def test_no_promotion(self):
        self.assertFalse(self.meta["production_approved"])
        self.assertFalse(self.meta["production_deployed"])
        self.assertTrue(self.meta["no_automatic_vercel_deployment"])
        self.assertEqual(self.meta["intended_target"],"preview")
        self.assertEqual(self.meta["commercial_validations_completed"],0)
        self.assertEqual(self.meta["falsifier_tests_completed"],0)
        self.assertEqual(self.meta["rankings_recalculated"],0)

    def test_export_manifest(self):
        with tempfile.TemporaryDirectory() as root:
            path=Path(root)
            self.assertEqual(export(path),self.meta)
            self.assertEqual((path/"index.html").read_bytes(),self.candidate)
            manifest=json.loads((path/"candidate-manifest.json").read_text(encoding="utf8"))
            self.assertEqual(manifest,self.meta)
            self.assertEqual(sha256((path/"index.html").read_bytes()),manifest["candidate_sha256"])

    def test_expected_screen_responsive_and_focus(self):
        css=(ROOT/"src/ux11_4/conclusions.css").read_text(encoding="utf8")
        js=(ROOT/"src/ux11_4/render_concepts.js").read_text(encoding="utf8")
        self.assertIn('@media(max-width:700px)',css)
        self.assertIn('@media(max-width:430px)',css)
        self.assertIn('focus({preventScroll:true})',js)
        self.assertIn('el.setAttribute',js)
        self.assertIn("ux4Detail(ux4Map.get(id))",js)

if __name__=="__main__":
    unittest.main()
