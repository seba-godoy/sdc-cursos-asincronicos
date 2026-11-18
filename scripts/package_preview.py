#!/usr/bin/env python3
"""Prepara un candidato HTML versionado. NO despliega a Vercel.

Uso desde la raíz:
  python -m scripts.package_preview --check
  python -m scripts.package_preview
"""
from __future__ import annotations
import argparse
import json
import subprocess
from pathlib import Path
from scripts.build import ROOT, assemble, sha256

DEST = ROOT / "dist" / "preview-candidate"

def git_head() -> str | None:
    cmd = subprocess.run(["git", "rev-parse", "HEAD"], cwd=ROOT,
                         text=True, capture_output=True, check=False)
    return cmd.stdout.strip() if cmd.returncode == 0 else None

def make_candidate(check: bool = False, dest: Path = DEST) -> dict:
    spec = json.loads((ROOT / "docs/build-manifest.json").read_text(encoding="utf8"))
    html = assemble(verify=True)
    if sha256(html) != spec["output_sha256"] or len(html) != spec["source"]["bytes"]:
        raise ValueError("El candidato no coincide con el baseline autorizado")
    state = {
        "version": spec["version"],
        "html_file": "index.html",
        "html_sha256": sha256(html),
        "bytes": len(html),
        "source_commit": git_head(),
        "source_manifest": "docs/build-manifest.json",
        "intended_target": "preview",
        "production_approved": False,
        "production_deployed": False,
        "promotion_requires_explicit_authorization": True,
        "vercel_project": "cursos-asincronicos-sdc",
    }
    if not check:
        dest.mkdir(parents=True, exist_ok=True)
        (dest / "index.html").write_bytes(html)
        (dest / "candidate-manifest.json").write_text(
            json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf8"
        )
        if (dest / "index.html").read_bytes() != html:
            raise RuntimeError("El archivo empaquetado difiere del HTML validado")
    return state

def main() -> None:
    parser = argparse.ArgumentParser(description="Empaquetar HTML de preview sin desplegar")
    parser.add_argument("--check", action="store_true",
                        help="Validar sin crear archivos")
    args = parser.parse_args()
    state = make_candidate(check=args.check)
    print(json.dumps({"valid": True, "written": not args.check, **state}, ensure_ascii=False))

if __name__ == "__main__":
    main()
