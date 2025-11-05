"""Preprocessing utilities for job_dataset_merged.csv

This script provides a function `process_file` and a CLI entrypoint to:
- read a CSV
- clean the `tech_stack` column by removing semicolons, collapsing whitespace
  and prefixing each value with "Skills required for this job: "
- write the result to a new CSV (or inplace)

Usage examples:
  python preprocess.py --input backend/Dataset/job_dataset_merged.csv
  python preprocess.py --input backend/Dataset/job_dataset_merged.csv --inplace

The script uses pandas. If pandas is not installed, install it with:
  pip install pandas
"""

from __future__ import annotations
import argparse
import re
from pathlib import Path
import sys
import pandas as pd


def clean_tech_stack(value: object) -> object:
    """Clean a single tech_stack value.

    Steps:
    - If value is NaN, return it unchanged.
    - Convert to string, replace semicolons with spaces.
    - Collapse multiple whitespace into single spaces and strip ends.
    - Prefix the resulting string with the required sentence.
    """
    if pd.isna(value):
        return value
    s = str(value)
    # replace all semicolons with commas
    s = s.replace(';', ',')
    # collapse multiple whitespace characters into one
    s = re.sub(r"\s+", ' ', s).strip()
    prefix = "Skills required for this job: "
    return prefix + s if s else prefix


def process_file(input_path: str | Path, output_path: str | Path | None = None, inplace: bool = False) -> str:
    """Read CSV at input_path, clean the `tech_stack` column, and write output.

    Returns the path written.
    Raises KeyError if `tech_stack` column is missing.
    """
    input_path = Path(input_path)
    if not input_path.exists():
        raise FileNotFoundError(f"Input file not found: {input_path}")

    df = pd.read_csv(input_path)

    if 'tech_stack' not in df.columns:
        raise KeyError("Column 'tech_stack' not found in input CSV")

    df['tech_stack'] = df['tech_stack'].apply(clean_tech_stack)

    if inplace:
        df.to_csv(input_path, index=False)
        return str(input_path)

    if output_path is None:
        output_path = input_path.with_name(input_path.stem + '_preprocessed' + input_path.suffix)

    df.to_csv(output_path, index=False)
    return str(output_path)


def _parse_args(argv=None):
    p = argparse.ArgumentParser(description="Preprocess job dataset 'tech_stack' column")
    p.add_argument('--input', '-i', required=True, help='Path to input CSV')
    p.add_argument('--output', '-o', required=False, help='Path to output CSV (default: input_preprocessed.csv)')
    p.add_argument('--inplace', action='store_true', help='Overwrite the input file')
    return p.parse_args(argv)


def main(argv=None):
    args = _parse_args(argv)
    try:
        out = process_file(args.input, args.output, args.inplace)
        print(f"Wrote: {out}")
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        raise


if __name__ == '__main__':
    main()