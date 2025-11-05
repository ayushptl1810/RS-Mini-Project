from __future__ import annotations
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, UploadFile, File, HTTPException
from models.schemas import ResumeParseOutput, TechRequest, JobRecommenderOutput

router = APIRouter()


@router.post("/resume_parser", response_model=ResumeParseOutput)
async def resume_parser(file: UploadFile = File(...)):
    """Accept an uploaded resume (PDF) and optional techstack string (CSV). Parse resume and extract tech tokens.

    Returns parsed text and extracted skills.
    """
    # import pipeline/extractor lazily so this module can be imported even if deps are missing
    try:
        from src.extract_tech import extract_from_pdf
    except Exception:
        extract_from_pdf = None  # type: ignore

    if extract_from_pdf is None:
        raise HTTPException(status_code=500, detail="Local parser not available. Ensure backend/src/Parse_resume.py and src/extract_tech.py are present.")

    temp_path = Path("./") / f"uploaded_resume_{file.filename}"
    content = await file.read()
    temp_path.write_bytes(content)

    try:
        skills = extract_from_pdf(str(temp_path))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing uploaded resume: {e}")

    try:
        temp_path.unlink()
    except Exception:
        pass

    return ResumeParseOutput(extracted_skills=skills)


@router.post("/job_recommender", response_model=JobRecommenderOutput)
async def job_recommender(req: TechRequest):
    """Given a tech stack list like ['python','aws','docker'] return top-K job matches from FAISS.
    """
    try:
        from src.pipeline_tech_match import pipeline_match_from_tech
    except Exception:
        pipeline_match_from_tech = None  # type: ignore

    if pipeline_match_from_tech is None:
        raise HTTPException(status_code=500, detail="Pipeline not available. Ensure backend/src/pipeline_tech_match.py is present.")

    try:
        tech_text = ", ".join([t.strip() for t in req.tech if t and t.strip()])
        out = pipeline_match_from_tech(tech_text)
        return JobRecommenderOutput(**out)
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error running pipeline: {e}")
