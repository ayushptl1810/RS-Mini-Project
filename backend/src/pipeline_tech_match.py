"""Pipeline: take tech-stack input -> normalize tokens -> format -> embed -> query FAISS -> output JSON

Usage:
  python backend/src/pipeline_tech_match.py --tech "Python, AWS, Docker"
  python backend/src/pipeline_tech_match.py --tech-file path\to\tech.txt

Defaults: looks for FAISS files at ../Vector_db/faiss_index.faiss and ../Vector_db/faiss_metadata.json
"""
from __future__ import annotations
import argparse
import json
from pathlib import Path
from typing import List, Dict, Any

try:
    from sentence_transformers import SentenceTransformer
except Exception:
    SentenceTransformer = None  # type: ignore

try:
    import faiss
except Exception:
    faiss = None  # type: ignore

import numpy as np
import re


def _token_clean(tok: str) -> str:
    t = tok.strip()
    t = re.sub(r"^[^A-Za-z0-9#+./-]+|[^A-Za-z0-9#+./-]+$", "", t)
    return t


def tokens_from_text(text: str) -> List[str]:
    if not text:
        return []
    parts = re.split(r"[,/;|\u2022]+", text)
    seen = set()
    out = []
    for p in parts:
        tok = _token_clean(p)
        if not tok:
            continue
        key = tok.lower()
        if key in seen:
            continue
        seen.add(key)
        out.append(tok)
    return out


def pipeline_match_from_tech(
    tech_text: str,
    index_path: str = "../Vector_db/faiss_index.faiss",
    metadata_path: str = "../Vector_db/faiss_metadata.json",
    model_name: str = "all-MiniLM-L6-v2",
    top_k: int = 5,
) -> Dict[str, Any]:
    if SentenceTransformer is None:
        raise ImportError("sentence-transformers is required. Install it into your environment (pip install sentence-transformers).")
    if faiss is None:
        raise ImportError("faiss (faiss-cpu) is required. Install it into your environment (pip install faiss-cpu).")

    # parse tokens and dedupe
    tokens = tokens_from_text(tech_text)
    unique_tokens = sorted(set(tokens), key=lambda s: s.lower())

    skills_text = "Skills required for this job: " + ", ".join(unique_tokens) if unique_tokens else ""

    model = SentenceTransformer(model_name)

    if not skills_text:
        return {"skills": unique_tokens, "skills_text": skills_text, "matches": []}

    emb = model.encode([skills_text], convert_to_numpy=True)
    vec = np.asarray(emb, dtype=np.float32)
    try:
        faiss.normalize_L2(vec)
    except Exception:
        pass

    idx_path = Path(index_path)
    meta_path = Path(metadata_path)

    # If given paths don't exist, try a few likely locations (backend/Vector_db, src-relative, cwd)
    if not idx_path.exists():
        base = Path(__file__).resolve().parent.parent  # backend/
        tried = [str(idx_path)]
        candidates = [
            base / "Vector_db" / idx_path.name,
            base / idx_path,
            Path(__file__).resolve().parent / idx_path,
            Path.cwd() / "backend" / "Vector_db" / idx_path.name,
            Path.cwd() / "backend" / idx_path,
            Path.cwd() / "Vector_db" / idx_path.name,
        ]
        found = False
        for c in candidates:
            tried.append(str(c))
            if c.exists():
                idx_path = c
                found = True
                break
        if not found:
            raise FileNotFoundError(f"FAISS index not found at {index_path}. Tried: {tried}")

    if not meta_path.exists():
        base = Path(__file__).resolve().parent.parent
        tried_m = [str(meta_path)]
        candidates_m = [
            base / "Vector_db" / meta_path.name,
            base / meta_path,
            Path(__file__).resolve().parent / meta_path,
            Path.cwd() / "backend" / "Vector_db" / meta_path.name,
            Path.cwd() / "backend" / meta_path,
            Path.cwd() / "Vector_db" / meta_path.name,
        ]
        found_m = False
        for c in candidates_m:
            tried_m.append(str(c))
            if c.exists():
                meta_path = c
                found_m = True
                break
        if not found_m:
            raise FileNotFoundError(f"FAISS metadata not found at {metadata_path}. Tried: {tried_m}")

    index = faiss.read_index(str(idx_path))
    D, I = index.search(vec, top_k)

    meta = json.loads(meta_path.read_text(encoding="utf-8"))
    matches = []
    for score, iid in zip(D[0].tolist(), I[0].tolist()):
        if iid < 0:
            continue
        key = str(iid)
        title = meta.get(key, None)
        matches.append({"id": iid, "title": title, "score": float(score)})

    return {"skills": unique_tokens, "skills_text": skills_text, "matches": matches}


def main(argv=None):
    p = argparse.ArgumentParser(description="Tech-stack -> embed -> FAISS matching pipeline")
    group = p.add_mutually_exclusive_group(required=True)
    group.add_argument("--tech", help="Tech stack string, e.g. 'Python, AWS, Docker'")
    group.add_argument("--tech-file", help="Path to text file containing tech stack string")
    p.add_argument("--index", help="Path to FAISS index file", default="../Vector_db/faiss_index.faiss")
    p.add_argument("--metadata", help="Path to FAISS metadata json", default="../Vector_db/faiss_metadata.json")
    p.add_argument("--model", help="SentenceTransformer model name", default="all-MiniLM-L6-v2")
    p.add_argument("--topk", type=int, help="Number of top matches to return", default=5)
    p.add_argument("--out", help="Path to save JSON output (if not provided prints to stdout)")
    args = p.parse_args(argv)

    if args.tech:
        tech_text = args.tech
    else:
        tech_text = Path(args.tech_file).read_text(encoding="utf-8")

    out = pipeline_match_from_tech(tech_text, index_path=args.index, metadata_path=args.metadata, model_name=args.model, top_k=args.topk)
    j = json.dumps(out, ensure_ascii=False, indent=2)
    if args.out:
        Path(args.out).write_text(j, encoding="utf-8")
    else:
        print(j)


if __name__ == "__main__":
    main()
