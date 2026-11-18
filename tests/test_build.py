"""Regresión de bytes, datos y estructura para el HTML 1.0.12."""
import hashlib,json,re,unittest
from scripts.build import ROOT,assemble,sha256,TOKENS,PNG_TOKENS
class ReproducibilityTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.manifest=json.loads((ROOT/'docs/build-manifest.json').read_text(encoding='utf8'))
  cls.binary=assemble();cls.html=cls.binary.decode('utf8')
 def test_exact_sha256(self):self.assertEqual(sha256(self.binary),'82f57a273302275b2458f854fbb7a583f674b578f0fbd5ef063b09bf7515e7c7')
 def test_size(self):self.assertEqual(len(self.binary),1848239)
 def test_repeated_build(self):self.assertEqual(self.binary,assemble())
 def test_json_hashes(self):
  for name,digest in self.manifest['json_blocks'].items():
   hit=re.search(r'<script\b[^>]*\bid="'+re.escape(name)+r'"[^>]*>(.*?)</script>',self.html,re.S)
   self.assertIsNotNone(hit,name)
   self.assertEqual(sha256(hit.group(1).encode('utf8')),digest)
 def test_canonical_rows(self):
  data=json.loads((ROOT/'data/dataset.json').read_text(encoding='utf8'))
  rows={name:len(block['rows']) for name,block in data.items()}
  self.assertEqual(rows,self.manifest['rows']);self.assertEqual(sum(rows.values()),1131)
 def test_unique_markers(self):
  template=(ROOT/'src/index.template.html').read_bytes()
  js=(ROOT/'src/scripts/dashboard.js').read_bytes()
  for marker in (*TOKENS,*PNG_TOKENS):self.assertEqual(template.count(marker)+js.count(marker),1,marker)
  self.assertNotIn(b'{{SDC_',self.binary)
 def test_embedded_pngs(self):self.assertEqual(self.html.count('data:image/png;base64,'),3)
 def test_no_external_runtime_assets(self):
  self.assertNotRegex(self.html,r'<script[^>]+src=["\']https?://')
  self.assertNotRegex(self.html,r'<link[^>]+rel=["\']stylesheet["\'][^>]+href=["\']https?://')
  self.assertNotRegex(self.html,r'@import\s+url\(https?://')
 def test_html_envelope(self):
  self.assertTrue(self.html.startswith('<!DOCTYPE html>'));self.assertTrue(self.html.endswith('</html>'))
 def test_manifest_components(self):
  for path,meta in self.manifest['components'].items():
   content=(ROOT/path).read_bytes();self.assertEqual(sha256(content),meta['sha256'],path);self.assertEqual(len(content),meta['bytes'],path)
 def test_no_obvious_secrets(self):
  for pattern in [r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',r'ghp_[A-Za-z0-9]{36}',r'github_pat_[A-Za-z0-9_]{20,}',r'AKIA[0-9A-Z]{16}',r'AIza[0-9A-Za-z_-]{35}']:
   self.assertNotRegex(self.html,pattern)
if __name__=='__main__':unittest.main()
