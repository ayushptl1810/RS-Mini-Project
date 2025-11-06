"""Extract tech stacks from resumes (placed in backend/src).

This script can parse a PDF using the hybrid parser (`Parse_resume.py`) located
in the same `src` folder or read a pre-parsed text file and extract tech stack.

Run as:
  python backend/src/extract_tech.py --pdf path/to/resume.pdf

"""

from __future__ import annotations
import argparse
import json
import re
from pathlib import Path
from typing import List


# Removed TECH_KEYWORDS whitelist per user request.
# We now use lightweight heuristics (and a small stopword filter) to accept tokens
# instead of relying on an explicit whitelist.
STOPWORDS = {'and', 'or', 'with', 'the', 'a', 'an', 'in', 'on', 'for', 'to', 'of', 'by', 'from', 'at'}

try:
    # prefer spaCy stop words (fast, comprehensive)
    from spacy.lang.en.stop_words import STOP_WORDS as _SPACY_STOPWORDS
    STOPWORDS = set(_SPACY_STOPWORDS)
except Exception:
    try:
        import nltk
        from nltk.corpus import stopwords as _nltk_stopwords
        try:
            # attempt to use already-installed stopwords
            STOPWORDS = set(_nltk_stopwords.words('english'))
        except LookupError:
            # download corpus on demand (will require network)
            nltk.download('stopwords')
            STOPWORDS = set(_nltk_stopwords.words('english'))
    except Exception:
        # minimal fallback
        STOPWORDS = {'and', 'or', 'with', 'the', 'a', 'an', 'in', 'on', 'for', 'to', 'of', 'by', 'from', 'at'}

def _token_clean(tok: str) -> str:
    t = tok.strip()
    t = re.sub(r"^[^A-Za-z0-9#+./-]+|[^A-Za-z0-9#+./-]+$", '', t)
    return t


def extract_skills_from_text(text: str) -> List[str]:
    if not text:
        return []

    lines = [l.strip() for l in text.splitlines()]

    # Detect both Tech Stack lines and Skills/Technical Skills headings
    heading_re = re.compile(r'^(skills|technical skills|tech\s*stack|techstack|technology\s*stack|technologies|tools|skillset|technical competencies)[:\s-]*$', re.I)
    inline_heading_re = re.compile(r'^(skills|technical skills|tech\s*stack|techstack|technology\s*stack|technologies|tools|skillset)[:\s-]+(.+)$', re.I)
    # explicit Tech Stack line detection (e.g. "Tech Stack: Python, AWS, Docker")
    techstack_line_re = re.compile(r'\btech\s*stack\b\s*[:：]\s*(.+)$', re.I)

    candidates = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if not line:
            i += 1
            continue

        # explicit inline headings like "Tech Stack: X, Y"
        m_inline = inline_heading_re.match(line)
        if m_inline:
            # If it's a tech stack inline heading the capture may already contain list
            candidates.append(m_inline.group(2).strip())
            i += 1
            continue

        # catch explicit 'Tech Stack: ...' anywhere in the line
        m_tech = techstack_line_re.search(line)
        if m_tech:
            candidates.append(m_tech.group(1).strip())
            i += 1
            continue

        if heading_re.match(line) or heading_re.match(line.lower()):
            j = i + 1
            buf = []
            while j < len(lines) and lines[j].strip():
                if re.match(r'^[A-Z][A-Za-z ]{1,40}$', lines[j]) and len(lines[j].split()) <= 4:
                    break
                buf.append(lines[j])
                j += 1
            if buf:
                candidates.append(' '.join(buf))
            i = j
            continue

        i += 1

    # We collect both explicit 'Tech Stack' lines and Skills/Technical Skills
    # sections. If both appear they'll both contribute candidate strings.

    seen = set()
    result = []
    split_re = re.compile(r'[,/;|\u2022]+')


    for cand in candidates:
        parts = split_re.split(cand)
        for p in parts:
            tok = _token_clean(p)
            if not tok:
                continue
            key = tok.lower()

            # ignore trivial stopwords
            if key in STOPWORDS:
                continue

            # Heuristics-only acceptance:
            # - must contain at least one letter
            # - and either contain punctuation/digit (e.g. C++, .NET), or be longer than 1 char
            accept = False
            if re.search(r'[A-Za-z]', tok):
                if re.search(r'[+.#-]', tok) or re.search(r'\d', tok) or len(tok) > 1:
                    accept = True

            if accept and key not in seen:
                seen.add(key)
                result.append(tok)

    return result


def extract_from_pdf(pdf_path: str) -> List[str]:
    # Import parser from same src folder
    try:
        import sys
        from pathlib import Path
        # Add the src directory to Python path
        src_dir = Path(__file__).resolve().parent
        if str(src_dir) not in sys.path:
            sys.path.insert(0, str(src_dir))
        from Parse_resume import parse_document_hybrid
    except Exception as e:
        raise RuntimeError(f"Could not import Parse_resume.parse_document_hybrid: {e}")

    res = parse_document_hybrid(pdf_path, save_parsed_text=False)
    text = res.get('content', '')
    skills = extract_skills_from_text(text)
    return skills


def main(argv=None):
    p = argparse.ArgumentParser(description='Extract tech stacks from resumes')
    p.add_argument('--pdf', help='Path to PDF resume to parse')
    p.add_argument('--text', help='Path to pre-parsed text file to read')
    p.add_argument('--only-techstack', action='store_true', help='Only extract tokens from lines that mention "Tech Stack"')
    p.add_argument('--out', help='Path to save JSON output')
    args = p.parse_args(argv)

    if not args.pdf and not args.text:
        print('Provide either --pdf or --text')
        return

    if args.pdf:
        skills = extract_from_pdf(args.pdf)
    else:
        txt = Path(args.text).read_text(encoding='utf-8')
        skills = extract_skills_from_text(txt)

    output = {'skills': skills}
    print(json.dumps(output, ensure_ascii=False, indent=2))
    if args.out:
        Path(args.out).write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding='utf-8')


if __name__ == '__main__':
    main()
