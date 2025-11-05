"""Evaluation utilities for the tech -> FAISS recommender pipeline.

Produces: precision@k, recall@k, F1@k, RMSE, MAE, confusion matrix (top-1), and plots.

Usage:
  python backend/src/evaluate_pipeline.py --test-csv backend/Dataset/test_cases.csv --tech-col tech --true-col true_ids --k 5

Test CSV should contain one row per case with a tech input string and a ground-truth job id or list.
true_ids may be a single integer, a JSON array string ("[1,2]") or comma/semicolon separated ids.
"""
from __future__ import annotations
import argparse
import json
from pathlib import Path
from typing import List, Dict, Any

import pandas as pd
import numpy as np
from sklearn.metrics import mean_squared_error, mean_absolute_error, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

try:
    from src.pipeline_tech_match import pipeline_match_from_tech
except Exception:
    pipeline_match_from_tech = None  # type: ignore


def _parse_true_ids(val) -> List[int]:
    if pd.isna(val):
        return []
    if isinstance(val, (list, tuple)):
        return [int(x) for x in val]
    s = str(val).strip()
    if not s:
        return []
    # try JSON
    try:
        parsed = json.loads(s)
        if isinstance(parsed, list):
            return [int(x) for x in parsed]
    except Exception:
        pass
    # split by common separators
    sep = "," if "," in s else ";" if ";" in s else " "
    parts = [p.strip() for p in s.split(sep) if p.strip()]
    ids = []
    for p in parts:
        try:
            ids.append(int(p))
        except Exception:
            pass
    return ids


def evaluate_cases(predictions: List[Dict[str, Any]], truths: List[List[int]], k: int) -> Dict[str, Any]:
    n = len(predictions)
    precisions = []  # Precision@K for each query
    recalls = []     # Recall@K for each query
    f1s = []        # F1@K for each query
    aps = []        # AP@K for each query

    y_true_all = []
    y_score_all = []

    top1_pred = []
    top1_true = []

    for pred, true_ids in zip(predictions, truths):
        matches = pred.get("matches", [])[:k]
        pred_ids = [m.get("id") for m in matches]
        scores = [m.get("score", 0.0) for m in matches]

        # For each rank position, is it relevant (1) or not (0)
        rels = [1 if (pid in true_ids) else 0 for pid in pred_ids]
        n_true = len(true_ids)  # Total relevant items

        # Calculate TP@K (number of relevant items in top K)
        tp = sum(rels)

        # Precision@K = TP@K / K
        prec = tp / k if k > 0 else 0.0
        
        # Recall@K = TP@K / Total Relevant Items
        rec = tp / n_true if n_true > 0 else 0.0
        
        # F1@K = 2 * (Precision@K * Recall@K) / (Precision@K + Recall@K)
        f1 = (2 * prec * rec / (prec + rec)) if (prec + rec) > 0 else 0.0

        # Calculate AP@K (Average Precision at K)
        # For each relevant item found, calculate precision up to that rank
        cum_tp = 0  # Cumulative true positives
        precisions_at_rel = []  # Precisions at ranks where relevant items found
        
        for i, rel in enumerate(rels, 1):
            if rel == 1:
                cum_tp += 1
                prec_at_i = cum_tp / i
                precisions_at_rel.append(prec_at_i)
        
        # AP@K is sum of precisions at relevant ranks divided by total relevant items
        ap = sum(precisions_at_rel) / n_true if n_true > 0 else 0.0

        # Store metrics for this query
        precisions.append(prec)
        recalls.append(rec)
        f1s.append(f1)
        aps.append(ap)

        # For confusion matrix
        top1_pred.append(pred_ids[0] if pred_ids else None)
        top1_true.append(true_ids[0] if true_ids else None)

        # For RMSE/MAE
        y_true_all.extend(rels)
        y_score_all.extend(scores)

    metrics: Dict[str, Any] = {
        "n_cases": n,
        # Mean metrics across all queries
        "precision_at_k_mean": float(np.mean(precisions)) if precisions else 0.0,
        "recall_at_k_mean": float(np.mean(recalls)) if recalls else 0.0,
        "f1_at_k_mean": float(np.mean(f1s)) if f1s else 0.0,
        "map_at_k": float(np.mean(aps)) if aps else 0.0,  # Mean Average Precision@K
        # Standard deviations
        "precision_at_k_std": float(np.std(precisions)) if precisions else 0.0,
        "recall_at_k_std": float(np.std(recalls)) if recalls else 0.0,
        "f1_at_k_std": float(np.std(f1s)) if f1s else 0.0,
        "ap_at_k_std": float(np.std(aps)) if aps else 0.0,
    }

    if y_true_all:
        # Some sklearn versions don't accept the `squared` kwarg; compute RMSE as sqrt(MSE)
        mse = mean_squared_error(y_true_all, y_score_all)
        metrics["rmse_all_candidates"] = float(np.sqrt(mse))
        metrics["mae_all_candidates"] = float(mean_absolute_error(y_true_all, y_score_all))
    else:
        metrics["rmse_all_candidates"] = None
        metrics["mae_all_candidates"] = None

    # confusion matrix for top-1 (only works if labels are small in number otherwise it's large)
    try:
        valid_pairs = [(t, p) for t, p in zip(top1_true, top1_pred) if t is not None and p is not None]
        if valid_pairs:
            y_t = [t for t, _ in valid_pairs]
            y_p = [p for _, p in valid_pairs]
            cm = confusion_matrix(y_t, y_p)
            metrics["confusion_matrix"] = cm.tolist()
        else:
            metrics["confusion_matrix"] = None
    except Exception:
        metrics["confusion_matrix"] = None

    metrics["per_case_precision"] = precisions
    metrics["per_case_recall"] = recalls
    metrics["per_case_f1"] = f1s

    return metrics


def plot_and_save(precisions: List[float], recalls: List[float], confusion: Any, out_dir: Path):
    out_dir.mkdir(parents=True, exist_ok=True)
    plt.figure(figsize=(8, 4))
    sns.histplot(precisions, bins=20)
    plt.title("Precision@K distribution")
    plt.xlabel("Precision@K")
    plt.savefig(out_dir / "precision_dist.png")
    plt.close()

    plt.figure(figsize=(8, 4))
    sns.histplot(recalls, bins=20)
    plt.title("Recall@K distribution")
    plt.xlabel("Recall@K")
    plt.savefig(out_dir / "recall_dist.png")
    plt.close()

    if confusion is not None:
        plt.figure(figsize=(8, 6))
        sns.heatmap(np.array(confusion), annot=True, fmt="d", cmap="Blues")
        plt.title("Top-1 Confusion Matrix")
        plt.savefig(out_dir / "confusion_top1.png")
        plt.close()


def main():
    # Fixed parameters
    k = 5
    ks = [k]
    max_k = k
    
    # Setup paths
    base_dir = Path(__file__).resolve().parent.parent
    csv_path = base_dir / "Dataset" / "test_cases_preprocessed.csv"  # Using preprocessed file
    tech_col = "tech_stack"
    out_dir = base_dir / "eval_outputs"
    
    # Ensure output directory exists
    out_dir.mkdir(parents=True, exist_ok=True)

    if not csv_path.exists():
        raise FileNotFoundError(f"Test CSV not found: {csv_path}")

    df = pd.read_csv(csv_path)
    if tech_col not in df.columns:
        raise KeyError(f"Tech column '{tech_col}' not found in {csv_path}. Available columns: {list(df.columns)}")

    techs = df[tech_col].astype(str).tolist()

    # Determine ground-truth ids
    truths: List[List[int]] = []
    if "Title" in df.columns:
        # Try to derive numeric ids from FAISS metadata by matching Title -> id
        # locate metadata (try same candidates as pipeline)
        meta_path = Path(__file__).resolve().parent.parent / "Vector_db" / "faiss_metadata.json"
        if not meta_path.exists():
            # try other likely locations
            candidates = [
                Path(__file__).resolve().parent.parent / "Vector_db" / "faiss_metadata.json",
                Path(__file__).resolve().parent / "faiss_metadata.json",
                Path.cwd() / "backend" / "Vector_db" / "faiss_metadata.json",
                Path.cwd() / "backend" / "faiss_metadata.json",
                Path.cwd() / "Vector_db" / "faiss_metadata.json",
            ]
            found = False
            for c in candidates:
                if c.exists():
                    meta_path = c
                    found = True
                    break
            if not found:
                meta_path = None

        title_to_id: Dict[str, int] = {}
        if meta_path and meta_path.exists():
            meta = json.loads(meta_path.read_text(encoding="utf-8"))
            # meta is id -> title; invert for lookup
            for k, v in meta.items():
                if v is None:
                    continue
                title_to_id[str(v).strip()] = int(k)

        for t in df["Title"].astype(str).tolist():
            tid = title_to_id.get(t.strip())
            truths.append([tid] if tid is not None else [])
    else:
        truths = [[] for _ in techs]

    # Attempt a batched evaluation: load model + index once and search all queries in one batch
    predictions: List[Dict[str, Any]] = []
    use_fast_path = True
    try:
        from sentence_transformers import SentenceTransformer
        import faiss
        # import token helper from pipeline for consistent tokenization
        try:
            from src.pipeline_tech_match import tokens_from_text
        except Exception:
            from pipeline_tech_match import tokens_from_text  # type: ignore
    except Exception:
        SentenceTransformer = None  # type: ignore
        faiss = None  # type: ignore
        tokens_from_text = None  # type: ignore
        use_fast_path = False

    if use_fast_path and pipeline_match_from_tech is not None:
        # Use pipeline directly instead of fast path
        for tech in techs:
            # Call pipeline directly with raw tech stack
            result = pipeline_match_from_tech(tech, top_k=max_k)
            predictions.append(result)
        use_fast_path = False  # Skip the rest of fast path processing
    elif use_fast_path and SentenceTransformer is not None and faiss is not None:
        # Fallback to direct embedding if pipeline is not available
        model_name = "all-MiniLM-L6-v2"
        model = SentenceTransformer(model_name)
        
        # Pass raw tech stack strings directly to pipeline
        skills_texts = techs
        emb = model.encode(skills_texts, convert_to_numpy=True)
        vecs = np.asarray(emb, dtype=np.float32)
        try:
            faiss.normalize_L2(vecs)
        except Exception:
            pass

        # locate FAISS index and metadata
        idx_path = Path(__file__).resolve().parent.parent / "Vector_db" / "faiss_index.faiss"
        meta_path = Path(__file__).resolve().parent.parent / "Vector_db" / "faiss_metadata.json"
        if not idx_path.exists():
            candidates = [
                Path(__file__).resolve().parent.parent / "Vector_db" / "faiss_index.faiss",
                Path(__file__).resolve().parent / "faiss_index.faiss",
                Path.cwd() / "backend" / "Vector_db" / "faiss_index.faiss",
                Path.cwd() / "backend" / "faiss_index.faiss",
                Path.cwd() / "Vector_db" / "faiss_index.faiss",
            ]
            for c in candidates:
                if c.exists():
                    idx_path = c
                    break
        if not meta_path.exists():
            candidates = [
                Path(__file__).resolve().parent.parent / "Vector_db" / "faiss_metadata.json",
                Path(__file__).resolve().parent / "faiss_metadata.json",
                Path.cwd() / "backend" / "Vector_db" / "faiss_metadata.json",
                Path.cwd() / "backend" / "faiss_metadata.json",
                Path.cwd() / "Vector_db" / "faiss_metadata.json",
            ]
            for c in candidates:
                if c.exists():
                    meta_path = c
                    break

        if not idx_path.exists() or not meta_path.exists():
            # fallback to per-query pipeline if index/metadata not found
            use_fast_path = False

    if use_fast_path:
        index = faiss.read_index(str(idx_path))
        meta = json.loads(meta_path.read_text(encoding="utf-8"))
        # batch search using max_k (we will slice down for smaller Ks)
        D, I = index.search(vecs, max_k)
        for row_scores, row_ids, skills_text in zip(D.tolist(), I.tolist(), skills_texts):
            matches = []
            for score, iid in zip(row_scores, row_ids):
                if iid < 0:
                    continue
                key = str(iid)
                title = meta.get(key)
                matches.append({"id": int(iid), "title": title, "score": float(score)})
            predictions.append({"skills_text": skills_text, "matches": matches})
    else:
        # Fallback: call pipeline_match_from_tech per-case (slower)
        if pipeline_match_from_tech is None:
            raise RuntimeError("pipeline_match_from_tech not importable and batch path unavailable. Ensure deps are installed.")
        for tech in techs:
            out = pipeline_match_from_tech(tech, top_k=max_k)
            predictions.append(out)

    # Create output directory
    out_dir.mkdir(parents=True, exist_ok=True)
    
    # Save predictions for inspection
    (out_dir / "predictions.json").write_text(json.dumps(predictions, ensure_ascii=False, indent=2), encoding="utf-8")

    # Print detailed results for first result as example
    if predictions:
        idx = 0
        single_pred = predictions[idx]
        single_truth = truths[idx] if idx < len(truths) else []

        # Determine rank of first ground-truth id (if present)
        found_rank = None
        found_any = False
        found_top1 = False
        pred_ids = [m.get("id") for m in single_pred.get("matches", [])]
        for pos, pid in enumerate(pred_ids, start=1):
            if pid in single_truth:
                found_any = True
                found_rank = pos
                break
        if pred_ids:
            found_top1 = (pred_ids[0] in single_truth) if single_truth else False

        single_out = {
            "row_index": idx,
            "tech": df.iloc[idx].get(tech_col) if tech_col in df.columns else None,
            "title": df.iloc[idx].get("Title") if "Title" in df.columns else None,
            "ground_truth_ids": single_truth,
            "found_any": found_any,
            "found_rank": found_rank,
            "found_top1": found_top1,
            "matches": single_pred.get("matches", []),
        }

        # Save example prediction
        single_path = out_dir / f"example_case.json"
        single_path.write_text(json.dumps(single_out, ensure_ascii=False, indent=2), encoding="utf-8")

    # Evaluate for each requested K (Precision@K, Recall@K, F1@K)
    metrics_per_k: Dict[int, Dict[str, Any]] = {}
    out_dir.mkdir(parents=True, exist_ok=True)

    for k in ks:
        m = evaluate_cases(predictions, truths, k)
        metrics_per_k[int(k)] = m
        # save per-K distribution plots in subfolder k{K}
        plot_and_save(m.get("per_case_precision", []), m.get("per_case_recall", []), m.get("confusion_matrix") if k == 1 else None, out_dir / f"k{k}")

    # write combined summary
    summary = {"ks": ks, "metrics": metrics_per_k}
    (out_dir / "metrics_summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    
    # Print readable summary
    print("\n=== Evaluation Results ===")
    print(f"Number of test cases: {len(predictions)}")
    
    for k in ks:
        metrics = metrics_per_k[k]
        print(f"\nResults for K={k}:")
        print("Aggregated Metrics:")
        print(f"  Average Precision: {metrics['precision_at_k_mean']:.3f}  (std: {metrics['precision_at_k_std']:.3f})")
        print(f"  Average Recall: {metrics['recall_at_k_mean']:.3f}  (std: {metrics['recall_at_k_std']:.3f})")
        print(f"  Average F1 Score: {metrics['f1_at_k_mean']:.3f}  (std: {metrics['f1_at_k_std']:.3f})")
        print(f"  Mean Average Precision: {metrics['map_at_k']:.3f}  (std: {metrics['ap_at_k_std']:.3f})")
        
    print("\nPer-Case Results:")
    for i, (pred, truth) in enumerate(zip(predictions, truths)):
        title = df.iloc[i]["Title"]
        matches = pred.get("matches", [])[:3]  # Only show top 3 for each case
        print(f"\nCase {i+1}: {title}")
        print("Ground Truth IDs:", truth)
        print("Top 3 Recommendations:")
        for j, match in enumerate(matches, 1):
            score = match.get("score", 0.0)
            matched_title = match.get("title", "Unknown")
            is_correct = "✓" if match.get("id") in truth else " "
            print(f"  {j}. {matched_title} (score: {score:.3f}) {is_correct}")


if __name__ == "__main__":
    main()
