const RESUME_PARSER_URL =
  "https://90hhxjhw-7860.inc1.devtunnels.ms/api/resume_parser";
const JOB_RECOMMENDER_URL =
  "https://90hhxjhw-7860.inc1.devtunnels.ms/api/job_recommender";
const LIST_TITLES_URL =
  "https://90hhxjhw-7860.inc1.devtunnels.ms/api/list_job_titles";
const TITLE_TECHSTACK_URL =
  "https://90hhxjhw-7860.inc1.devtunnels.ms/api/job_title_techstack";

export async function parseResumeWithExternal(file) {
  console.log("[RecommenderAPI] parseResume START", {
    url: RESUME_PARSER_URL,
    name: file?.name,
    size: file?.size,
    type: file?.type,
  });
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(RESUME_PARSER_URL, {
    method: "POST",
    body: form,
  });
  console.log("[RecommenderAPI] parseResume RESPONSE STATUS", res.status);
  if (!res.ok) {
    const txt = await res.text();
    console.error("[RecommenderAPI] parseResume ERROR", res.status, txt);
    throw new Error(`Resume parser error (${res.status}): ${txt}`);
  }
  const data = await res.json();
  console.log("[RecommenderAPI] parseResume DATA", data);
  return data;
}

export async function recommendJobsWithExternal(techArray) {
  console.log("[RecommenderAPI] recommendJobs START", {
    url: JOB_RECOMMENDER_URL,
    payload: { tech: techArray },
  });
  const res = await fetch(JOB_RECOMMENDER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tech: techArray }),
  });
  console.log("[RecommenderAPI] recommendJobs RESPONSE STATUS", res.status);
  if (!res.ok) {
    const txt = await res.text();
    console.error("[RecommenderAPI] recommendJobs ERROR", res.status, txt);
    throw new Error(`Job recommender error (${res.status}): ${txt}`);
  }
  const data = await res.json();
  console.log("[RecommenderAPI] recommendJobs DATA", data);
  return data;
}

export async function listJobTitlesExternal() {
  console.log("[RecommenderAPI] listJobTitles START", { url: LIST_TITLES_URL });
  const res = await fetch(LIST_TITLES_URL, { method: "GET" });
  console.log("[RecommenderAPI] listJobTitles RESPONSE STATUS", res.status);
  if (!res.ok) {
    const txt = await res.text();
    console.error("[RecommenderAPI] listJobTitles ERROR", res.status, txt);
    throw new Error(`list_job_titles error (${res.status}): ${txt}`);
  }
  const data = await res.json();
  console.log("[RecommenderAPI] listJobTitles DATA", data);
  return data;
}

export async function jobTitleTechStackExternal(title) {
  console.log("[RecommenderAPI] jobTitleTechStack START", {
    url: TITLE_TECHSTACK_URL,
    payload: { title },
  });
  const res = await fetch(TITLE_TECHSTACK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  console.log("[RecommenderAPI] jobTitleTechStack RESPONSE STATUS", res.status);
  if (!res.ok) {
    const txt = await res.text();
    console.error("[RecommenderAPI] jobTitleTechStack ERROR", res.status, txt);
    throw new Error(`job_title_techstack error (${res.status}): ${txt}`);
  }
  const data = await res.json();
  console.log("[RecommenderAPI] jobTitleTechStack DATA", data);
  return data;
}
