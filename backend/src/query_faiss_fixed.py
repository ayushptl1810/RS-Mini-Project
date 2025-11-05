"""Inspect and query the FAISS index and metadata created by `index_faiss.py`.

Usage examples (PowerShell):
  # List first 10 ids
  C:/PF/Projects/Rs_mini_project/myenv/Scripts/python.exe backend/query_faiss_fixed.py --list 10

  # Show vector info for id 5
  C:/PF/Projects/Rs_mini_project/myenv/Scripts/python.exe backend/query_faiss_fixed.py --show-id 5

  # Query by text (nearest neighbors)
  C:/PF/Projects/Rs_mini_project/myenv/Scripts/python.exe backend/query_faiss_fixed.py --query-text "python data science" --k 5

  # Query by existing id (find neighbors of vector with id 0)
  C:/PF/Projects/Rs_mini_project/myenv/Scripts/python.exe backend/query_faiss_fixed.py --query-id 0 --k 5

The script expects the FAISS index at `backend/faiss_index.faiss` and metadata at
`backend/faiss_metadata.json` by default. It uses the same embedding model
(`all-MiniLM-L6-v2`) to encode text queries.
"""

from __future__ import annotations
import argparse
import json
from pathlib import Path
from typing import Optional

import numpy as np
from sentence_transformers import SentenceTransformer
import faiss


DEFAULT_INDEX = Path('faiss_index.faiss')
DEFAULT_META = Path('faiss_metadata.json')
MODEL_NAME = 'sentence-transformers/all-MiniLM-L6-v2'


def load_index_and_meta(index_path: Path = DEFAULT_INDEX, meta_path: Path = DEFAULT_META):
    if not index_path.exists():
        raise FileNotFoundError(f'FAISS index not found: {index_path}')
    if not meta_path.exists():
        raise FileNotFoundError(f'Metadata file not found: {meta_path}')

    index = faiss.read_index(str(index_path))
    with open(meta_path, 'r', encoding='utf-8') as f:
        metadata = json.load(f)
    return index, metadata


def list_ids(index, metadata, n: int = 20):
    # Try to read all ids from metadata (keys are strings)
    ids = sorted(int(k) for k in metadata.keys())
    for i in ids[:n]:
        print('id={} -> Title: {}'.format(i, metadata.get(str(i), '')))


def show_vector(index, idx: int, top_dims: int = 8):
    # FAISS doesn't provide direct access to stored vectors for all index types.
    # For IndexIDMap over an IndexFlat, we can reconstruct by searching for exact id.
    # We'll try to use index.reconstruct if available.
    try:
        vec = index.reconstruct(int(idx))
        vec = np.array(vec).astype('float32')
        norm = np.linalg.norm(vec)
        print('id={} vector norm={:.4f} first {} dims: {}'.format(idx, norm, top_dims, vec[:top_dims].tolist()))
    except Exception as e:
        print('Could not reconstruct vector for id {}: {}'.format(idx, e))


def query_by_text(index, metadata, query: str, k: int = 5, model_name: str = MODEL_NAME):
    model = SentenceTransformer(model_name, device='cpu')
    q_emb = model.encode([query], convert_to_numpy=True).astype('float32')
    faiss.normalize_L2(q_emb)
    D, I = index.search(q_emb, k)
    D = D[0]
    I = I[0]
    print('Query: "{}" -> top {} results:'.format(query, k))
    for score, idx in zip(D, I):
        if idx == -1:
            continue
        title = metadata.get(str(int(idx)), '')
        print('  id={} score={:.4f} title={}'.format(int(idx), float(score), title))


def query_by_id(index, metadata, qid: int, k: int = 5):
    # Try to reconstruct vector for qid then search
    try:
        vec = index.reconstruct(int(qid)).astype('float32')
    except Exception as e:
        print('Could not reconstruct vector for id {}: {}'.format(qid, e))
        return
    vec = np.expand_dims(vec, axis=0)
    faiss.normalize_L2(vec)
    D, I = index.search(vec, k)
    D = D[0]
    I = I[0]
    print('Neighbors for id={} ->'.format(qid))
    for score, idx in zip(D, I):
        if idx == -1:
            continue
        title = metadata.get(str(int(idx)), '')
        print('  id={} score={:.4f} title={}'.format(int(idx), float(score), title))


def _parse_args(argv=None):
    p = argparse.ArgumentParser(description='Inspect/query FAISS index')
    p.add_argument('--index', '-x', default=str(DEFAULT_INDEX))
    p.add_argument('--meta', '-m', default=str(DEFAULT_META))
    p.add_argument('--list', '-l', nargs='?', const=20, type=int, help='List first N ids (default 20)')
    p.add_argument('--show-id', type=int, help='Show vector info for given id')
    p.add_argument('--query-text', type=str, help='Query by text')
    p.add_argument('--query-id', type=int, help='Query by existing id (find neighbors)')
    p.add_argument('--k', type=int, default=5, help='Number of neighbors to return')
    return p.parse_args(argv)


def main(argv=None):
    args = _parse_args(argv)
    index, metadata = load_index_and_meta(Path(args.index), Path(args.meta))

    if args.list is not None:
        list_ids(index, metadata, args.list)
        return

    if args.show_id is not None:
        show_vector(index, args.show_id)
        return

    if args.query_text:
        query_by_text(index, metadata, args.query_text, k=args.k)
        return

    if args.query_id is not None:
        query_by_id(index, metadata, args.query_id, k=args.k)
        return

    print('No action specified. Use --help for usage examples.')


if __name__ == '__main__':
    main()
