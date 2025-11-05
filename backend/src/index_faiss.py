"""Build a FAISS index from the `tech_stack` column and store Title metadata.

This script:
- reads a CSV (default: backend/Dataset/job_dataset_merged_preprocessed.csv)
- encodes `tech_stack` text using the sentence-transformers model
  `all-MiniLM-L6-v2` (aka "all-MiniLM-L6-v2")
- stores vectors in a FAISS index (IndexFlatIP + IndexIDMap after normalizing)
- stores metadata (Title) in a JSON file with mapping id -> title

Usage (PowerShell example):
  C:/PF/Projects/Rs_mini_project/myenv/Scripts/python.exe backend/index_faiss.py

Requirements (add to backend/requirements.txt):
  sentence-transformers
  faiss-cpu

"""

from __future__ import annotations
import argparse
import json
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer
import faiss


def build_faiss_index(
    input_csv: str | Path = 'Dataset/job_dataset_consolidated.csv',
    index_path: str | Path = 'Vector_db/faiss_index.faiss',
    metadata_path: str | Path = 'Vector_db/faiss_metadata.json',
    model_name: str = 'sentence-transformers/all-MiniLM-L6-v2',
    batch_size: int = 64,
) -> tuple[str, str]:
    """Build and save a FAISS index and metadata file.

    Returns (index_path, metadata_path).
    Metadata file is a JSON mapping from integer id (as string) to Title value.
    """
    input_csv = Path(input_csv)
    index_path = Path(index_path)
    metadata_path = Path(metadata_path)

    if not input_csv.exists():
        raise FileNotFoundError(f"Input CSV not found: {input_csv}")

    df = pd.read_csv(input_csv)

    if 'tech_stack' not in df.columns:
        raise KeyError("Column 'tech_stack' not found in input CSV")
    if 'Title' not in df.columns:
        raise KeyError("Column 'Title' not found in input CSV")

    texts = df['tech_stack'].fillna('').astype(str).tolist()
    titles = df['Title'].fillna('').astype(str).tolist()

    # Load model from Hugging Face Hub (all-MiniLM-L6-v2) on CPU
    # SentenceTransformer accepts both 'all-MiniLM-L6-v2' and 'sentence-transformers/all-MiniLM-L6-v2'
    model = SentenceTransformer(model_name, device='cpu')

    # Encode in batches to avoid high memory usage
    embeddings_list = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        emb = model.encode(batch, show_progress_bar=True, convert_to_numpy=True)
        embeddings_list.append(emb)

    embeddings = np.vstack(embeddings_list).astype('float32')

    # Normalize embeddings for cosine similarity (use inner product with normalized vectors)
    faiss.normalize_L2(embeddings)

    d = embeddings.shape[1]
    index_flat = faiss.IndexFlatIP(d)  # inner product on normalized vectors => cosine similarity
    index = faiss.IndexIDMap(index_flat)

    ids = np.arange(len(embeddings)).astype('int64')
    index.add_with_ids(embeddings, ids)

    # Ensure parent directories exist
    index_path.parent.mkdir(parents=True, exist_ok=True)
    metadata_path.parent.mkdir(parents=True, exist_ok=True)

    faiss.write_index(index, str(index_path))

    # Save metadata mapping id -> Title
    metadata = {str(int(i)): t for i, t in zip(ids, titles)}
    with open(metadata_path, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)

    return str(index_path), str(metadata_path)


def _parse_args(argv: Optional[list[str]] = None):
    p = argparse.ArgumentParser(description='Build FAISS index from tech_stack column')
    p.add_argument('--input', '-i', default='Dataset/job_dataset_consolidated.csv')
    p.add_argument('--index', '-x', default='Vector_db/faiss_index.faiss')
    p.add_argument('--metadata', '-m', default='Vector_db/faiss_metadata.json')
    p.add_argument('--model', default='sentence-transformers/all-MiniLM-L6-v2')
    p.add_argument('--batch-size', '-b', default=64, type=int)
    return p.parse_args(argv)


def main(argv: Optional[list[str]] = None):
    args = _parse_args(argv)
    idx_path, meta_path = build_faiss_index(
        input_csv=args.input,
        index_path=args.index,
        metadata_path=args.metadata,
        model_name=args.model,
        batch_size=args.batch_size,
    )
    print('Wrote index to:', idx_path)
    print('Wrote metadata to:', meta_path)


if __name__ == '__main__':
    main()
