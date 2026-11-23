#!/usr/bin/env python3
"""UX-11.4: HTML autónomo candidato, aislado de la v1.0.12 productiva.

No modifica src/scripts/dashboard.js, CSS original, JSON canónicos ni manifiesto
de v1.0.12. Parte de assemble(verify=True), por lo que falla si cambia el baseline.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

from scripts.build import ROOT, assemble, sha256
from scripts.ux11_3_cards import build_cards

OUT = ROOT / "dist" / "ux11_4"
JS_PATH = ROOT / "src" / "ux11_4" / "render_concepts.js"
CSS_PATH = ROOT / "src" / "ux11_4" / "conclusions.css"
BASELINE_SHA = "82f57a273302275b2458f854fbb7a583f674b578f0fbd5ef063b09bf7515e7c7"
START = "function renderConcepts(){"
END = "function offerPrice(x){"
DATA_MARKER = '<script id="dataset" type="application/json">'


def build() -> tuple[bytes, dict]:
    baseline = assemble(verify=True)
    if sha256(baseline) != BASELINE_SHA or len(baseline) != 1848239:
        raise RuntimeError("El baseline autorizado no conserva su hash y tamaño")
    base = baseline.decode("utf8")
    cards, summary = build_cards()
    assert len(cards) == 6 and summary["senales_d_referenciadas"] == 24
    renderer = JS_PATH.read_text(encoding="utf8").strip()
    css = CSS_PATH.read_text(encoding="utf8").strip()
    assert renderer.count("function renderConcepts(){") == 1
    assert base.count(START) == 1 and base.count(END) == 1
    assert base.count("</style>") == 1 and base.count(DATA_MARKER) == 1
    i = base.index(START)
    j = base.index(END, i)
    assert j > i > 0
    source = base[:i] + "/* UX-11.4 candidate renderer */\n" + renderer + "\n" + base[j:]
    # CSS only on candidate; no changes to the historical CSS input of UX-10.3.
    source = source.replace("</style>", "\n" + css + "\n</style>", 1)
    payload = json.dumps(cards, ensure_ascii=False, separators=(",", ":"))
    payload = payload.replace("<", "\\u003c").replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")
    injected = '<script type="application/json" id="ux114-cards">' + payload + '</script>\n'
    source = source.replace(DATA_MARKER, injected + DATA_MARKER, 1)
    raw = source.encode("utf8")
    if raw.count(b'function renderConcepts(){') != 1:
        raise ValueError("UI de conclusiones duplicada")
    if raw.count(b'id="ux114-cards"') != 1:
        raise ValueError("Datos de seis fichas no incluidos exactamente una vez")
    if raw.count(b'data:image/png;base64,') != 3:
        raise ValueError("Los logos integrados han cambiado")
    state = {
        "phase": "UX-11.4",
        "version": "ux11.4-candidate",
        "baseline": "v1.0.12",
        "baseline_sha256": BASELINE_SHA,
        "candidate_sha256": sha256(raw),
        "candidate_bytes": len(raw),
        "html_file": "index.html",
        "six_concept_cards": len(cards),
        "observations_D": summary["senales_d_referenciadas"],
        "original_O_refs": summary["total_referencias_o_historicas"],
        "unchanged_canonical_rows": {"Oferta":392,"Búsquedas":709,"Demanda":24,"Decisión":6},
        "commercial_validations_completed": 0,
        "falsifier_tests_completed": 0,
        "rankings_recalculated": 0,
        "intended_target": "preview",
        "production_approved": False,
        "production_deployed": False,
        "no_automatic_vercel_deployment": True,
        "candidate_source_paths": [
            "src/ux11_4/render_concepts.js",
            "src/ux11_4/conclusions.css",
            "scripts/build_ux11_4.py",
            "data/analysis/ux11_3_hypotheses.json",
        ],
    }
    return raw, state


def export(dest: Path = OUT, check: bool = False) -> dict:
    raw, meta = build()
    if not check:
        dest.mkdir(parents=True, exist_ok=True)
        (dest / "index.html").write_bytes(raw)
        (dest / "candidate-manifest.json").write_text(
            json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf8"
        )
        if sha256((dest / "index.html").read_bytes()) != meta["candidate_sha256"]:
            raise ValueError("El HTML empaquetado no coincide con el candidato")
    return meta


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="Solo validar sin escribir")
    parser.add_argument("--output-dir", type=Path, default=OUT)
    args = parser.parse_args()
    print(json.dumps(export(args.output_dir, args.check), ensure_ascii=False, indent=2))
