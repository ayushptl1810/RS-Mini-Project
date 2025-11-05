from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel


class ResumeParseOutput(BaseModel):
    extracted_skills: List[str]


class TechRequest(BaseModel):
    tech: List[str]


class JobMatchItem(BaseModel):
    id: int
    title: Optional[str] = None
    score: float


class JobRecommenderOutput(BaseModel):
    skills: List[str]
    skills_text: str
    matches: List[JobMatchItem]
