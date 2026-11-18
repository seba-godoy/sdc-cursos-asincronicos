#!/usr/bin/env python3
"""Compilador verificable del HTML autónomo UX-10.3, sin dependencias."""
from __future__ import annotations
import argparse, base64, hashlib, json
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / 'docs/build-manifest.json'
TOKENS = {
 b'{{SDC_CSS}}':'src/styles/dashboard.css',
 b'{{SDC_DATASET}}':'data/dataset.json',
 b'{{SDC_OX}}':'data/ox-analysis-data.json',
 b'{{SDC_DEMAND}}':'data/ux10-demand-brief.json',
 b'{{SDC_APP_JS}}':'src/scripts/dashboard.js',
}
PNG_TOKENS = {
 b'{{SDC_LOGO_SIDEBAR}}':'assets/logos/logo-sidebar.png',
 b'{{SDC_LOGO_TOPBAR}}':'assets/logos/logo-topbar.png',
 b'{{SDC_LOGO_PORTADA}}':'assets/logos/logo-portada.png',
}
sha256=lambda b:hashlib.sha256(b).hexdigest()
def assemble(verify=True):
 spec=json.loads(MANIFEST.read_text(encoding='utf8'))
 parts=spec['components']
 template=(ROOT/'src/index.template.html').read_bytes()
 for path,expected in parts.items():
  actual=(ROOT/path).read_bytes()
  if verify and (sha256(actual)!=expected['sha256'] or len(actual)!=expected['bytes']):
   raise ValueError(f'Componente inválido: {path}')
 output=template
 for token,path in TOKENS.items():
  if output.count(token)!=1: raise ValueError(f'Marcador ausente o duplicado: {token!r}')
  output=output.replace(token,(ROOT/path).read_bytes())
 for token,path in PNG_TOKENS.items():
  if output.count(token)!=1: raise ValueError(f'Marcador ausente o duplicado: {token!r}')
  output=output.replace(token,b'data:image/png;base64,'+base64.b64encode((ROOT/path).read_bytes()))
 if b'{{SDC_' in output: raise ValueError('Marcadores no resueltos')
 if verify and (sha256(output)!=spec['output_sha256'] or len(output)!=spec['source']['bytes']):
  raise ValueError('El HTML ya no coincide byte a byte con UX-10.3')
 return output

def main():
 parser=argparse.ArgumentParser(description='Ensamblar HTML autónomo v1.0.12 con verificación SHA-256')
 parser.add_argument('--check',action='store_true',help='Solo comparar hashes y tamaño; no escribir')
 parser.add_argument('--output',type=Path,default=ROOT/'dist/dashboard-v1.0.12.html')
 args=parser.parse_args();raw=assemble()
 if not args.check:
  args.output.parent.mkdir(parents=True,exist_ok=True);args.output.write_bytes(raw)
 print(json.dumps({'valid':True,'bytes':len(raw),'sha256':sha256(raw),'output':None if args.check else str(args.output)}))
if __name__=='__main__':main()
