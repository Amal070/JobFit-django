import fitz
import json
from groq import Groq
from django.conf import settings


def extract_text_from_pdf(pdf_path: str) -> str:
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    return text.strip()


def _extract_json_from_response(response_text: str) -> dict:
    cleaned = response_text.strip()
    try:
        return json.loads(cleaned)
    except Exception:
        pass

    # Handle markdown code blocks
    if "```" in cleaned:
        parts = cleaned.split("```")
        for i in range(1, len(parts), 2):
            block = parts[i].strip()
            if block.startswith("json"):
                block = block[4:].strip()
            try:
                return json.loads(block)
            except Exception:
                continue

    # Fallback: extract substring between first '{' and last '}'
    first_brace = cleaned.find("{")
    last_brace = cleaned.rfind("}")
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        return json.loads(cleaned[first_brace:last_brace + 1])

    raise ValueError("Could not parse JSON response from AI model")


def analyze_resume_with_ai(pdf_path: str, job_title: str, job_description: str, company_name: str) -> dict:
    resume_text = extract_text_from_pdf(pdf_path)

    if not resume_text:
        raise ValueError("Could not extract readable text from PDF. Please make sure the PDF has selectable text and is not an image-only scan.")

    if not settings.GROQ_API_KEY or not settings.GROQ_API_KEY.strip():
        raise ValueError("GROQ_API_KEY is not configured. Please add your Groq API key to backend/.env and restart the server.")

    client = Groq(api_key=settings.GROQ_API_KEY.strip())

    prompt = f"""
You are an expert resume reviewer and ATS specialist.

Analyze the following resume against the job description and return ONLY a JSON object with this exact structure, no extra text, no markdown, no code blocks:

{{
  "overallScore": <0-100>,
  "ATS": {{
    "score": <0-100>,
    "tips": [
      {{"type": "good" or "improve", "tip": "<tip text>"}}
    ]
  }},
  "toneAndStyle": {{
    "score": <0-100>,
    "tips": [
      {{"type": "good" or "improve", "tip": "<tip text>", "explanation": "<explanation>"}}
    ]
  }},
  "content": {{
    "score": <0-100>,
    "tips": [
      {{"type": "good" or "improve", "tip": "<tip text>", "explanation": "<explanation>"}}
    ]
  }},
  "structure": {{
    "score": <0-100>,
    "tips": [
      {{"type": "good" or "improve", "tip": "<tip text>", "explanation": "<explanation>"}}
    ]
  }},
  "skills": {{
    "score": <0-100>,
    "tips": [
      {{"type": "good" or "improve", "tip": "<tip text>", "explanation": "<explanation>"}}
    ]
  }}
}}

Job Title: {job_title}
Company: {company_name}
Job Description:
{job_description}

Resume:
{resume_text}
"""

    preferred_model = getattr(settings, "GROQ_MODEL", "").strip()
    candidate_models = []
    if preferred_model:
        candidate_models.append(preferred_model)

    default_models = [
        "openai/gpt-oss-120b",
        "qwen/qwen3.8-27b",
        "openai/gpt-oss-20b",
        "llama-3.3-70b-versatile",
        "llama3-70b-8192",
    ]
    for model in default_models:
        if model not in candidate_models:
            candidate_models.append(model)

    last_error = None
    response_text = ""
    for model_name in candidate_models:
        try:
            response = client.chat.completions.create(
                model=model_name,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
            )
            response_text = response.choices[0].message.content.strip()
            if response_text:
                break
        except Exception as e:
            last_error = e
            err_str = str(e)
            if "model_not_found" in err_str or "does not exist" in err_str or "404" in err_str:
                continue
            raise e

    if not response_text:
        if last_error:
            raise last_error
        raise ValueError("Failed to obtain response from AI service.")

    return _extract_json_from_response(response_text)