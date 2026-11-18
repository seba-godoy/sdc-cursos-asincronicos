#!/usr/bin/env python3
"""Prueba aislada de fallos detectables y recuperación por git revert.

No modifica main, no utiliza red, no hace push ni despliega.
"""
from __future__ import annotations

import hashlib
import json
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def command(*args: str, cwd: Path, check: bool = True) -> subprocess.CompletedProcess[str]:
    result = subprocess.run(args, cwd=cwd, text=True, capture_output=True, check=False)
    if check and result.returncode:
        raise RuntimeError(f"Fallo ({result.returncode}) {' '.join(args)}: {result.stderr}")
    return result


def git(cwd: Path, *args: str) -> str:
    return command('git', *args, cwd=cwd).stdout.strip()


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def main() -> None:
    original_head = git(ROOT, 'rev-parse', 'HEAD')
    with tempfile.TemporaryDirectory(prefix='sdc-gh013-') as directory:
        scratch = Path(directory) / 'recovery'
        # La copia se crea desde el repositorio local, no desde GitHub.
        command('git', 'clone', '--quiet', '--no-hardlinks', '--', str(ROOT), str(scratch), cwd=ROOT)
        assert git(scratch, 'rev-parse', 'HEAD') == original_head, 'Clon desalineado'

        data = scratch / 'data/dataset.json'
        data.write_bytes(data.read_bytes() + b'\n')
        failure = command(sys.executable, 'scripts/build.py', '--check', cwd=scratch, check=False)
        assert failure.returncode != 0, 'El build aceptó un dataset modificado'
        assert 'Componente inválido: data/dataset.json' in (failure.stderr + failure.stdout), 'Motivo inesperado del fallo'
        git(scratch, 'restore', '--', 'data/dataset.json')
        command(sys.executable, 'scripts/build.py', '--check', cwd=scratch)

        readme = scratch / 'README.md'
        original_readme = readme.read_bytes()
        readme.write_bytes(original_readme + b'\nQA_RECOVERY_SIMULATION_ONLY\n')
        git(scratch, 'add', '--', 'README.md')
        git(scratch, '-c', 'user.name=SDC QA', '-c', 'user.email=qa@example.invalid',
            'commit', '--quiet', '-m', 'test: accidental local change')
        accident = git(scratch, 'rev-parse', 'HEAD')
        assert accident != original_head, 'No se generó commit de prueba'

        git(scratch, '-c', 'user.name=SDC QA', '-c', 'user.email=qa@example.invalid',
            'revert', '--no-edit', 'HEAD')
        assert sha256(readme.read_bytes()) == sha256(original_readme), 'El revert no recuperó README'
        assert git(scratch, 'status', '--porcelain') == '', 'Copia temporal sucia después del revert'
        command(sys.executable, 'scripts/build.py', '--check', cwd=scratch)
        assert git(ROOT, 'rev-parse', 'HEAD') == original_head, 'Se alteró el HEAD original'
        assert git(ROOT, 'status', '--porcelain') == '', 'El repositorio fuente fue modificado'

    print(json.dumps({
        'status': 'passed',
        'baseline_head': original_head,
        'corrupted_data_rejected': True,
        'local_revert_restored_readme': True,
        'build_after_recovery': 'passed',
        'source_head_unchanged': True,
        'remote_operations': 0,
    }, ensure_ascii=False))


if __name__ == '__main__':
    main()
