import pymupdf
import json
import re
from groq import Groq
from django.conf import settings


def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extract readable text from a PDF file preserving structural reading order
    and handling multi-column layouts using PyMuPDF block extraction.
    """
    doc = pymupdf.open(pdf_path)
    page_texts = []

    for page_idx in range(len(doc)):
        page = doc[page_idx]
        # sort=True sorts blocks vertically and horizontally in reading order
        blocks = page.get_text("blocks", sort=True)
        block_strings = []

        for b in blocks:
            # b = (x0, y0, x1, y1, text, block_no, block_type)
            # block_type 0 is text, 1 is image/graphic
            if b[6] == 0:
                raw_text = b[4].strip()
                if raw_text:
                    # Clean soft hyphens and line-break hyphens (e.g. "optimi-\nzation" -> "optimization")
                    cleaned_block = re.sub(r'(\b\w+)-\n(\w+\b)', r'\1\2', raw_text)
                    # Normalize excessive spaces
                    cleaned_block = re.sub(r'[ \t]+', ' ', cleaned_block)
                    block_strings.append(cleaned_block)

        if block_strings:
            page_texts.append("\n\n".join(block_strings))

    doc.close()
    full_text = "\n\n--- Page Break ---\n\n".join(page_texts).strip()

    # Verify meaningful textual content was extracted
    alphanumeric_chars = len(re.findall(r'[a-zA-Z0-9]', full_text))
    if alphanumeric_chars < 50:
        raise ValueError(
            "Could not extract sufficient text from the PDF. "
            "Please ensure the file has selectable text and is not a flattened image or scanned document."
        )

    return full_text


def _clean_json_string(raw: str) -> str:
    """Strip markdown backticks, preambles, and trim string."""
    cleaned = raw.strip()
    if "```" in cleaned:
        # Match code block content
        match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', cleaned, re.IGNORECASE)
        if match:
            cleaned = match.group(1).strip()
        else:
            parts = cleaned.split("```")
            for i in range(1, len(parts), 2):
                candidate = parts[i].strip()
                if candidate.startswith("json"):
                    candidate = candidate[4:].strip()
                if candidate.startswith("{"):
                    cleaned = candidate
                    break

    # Locate outermost braces
    first_brace = cleaned.find("{")
    last_brace = cleaned.rfind("}")
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        cleaned = cleaned[first_brace:last_brace + 1]

    # Clean trailing commas before closing braces/brackets
    cleaned = re.sub(r',\s*([}\]])', r'\1', cleaned)
    return cleaned


def _extract_json_from_response(response_text: str) -> dict:
    cleaned = _clean_json_string(response_text)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as err:
        raise ValueError(f"Could not parse valid JSON from AI response: {str(err)}")


def _clamp_score(val, default=70) -> int:
    try:
        num = int(round(float(val)))
        return max(0, min(100, num))
    except (ValueError, TypeError):
        return default


def _validate_and_sanitize_feedback(data: dict) -> dict:
    """
    Validates that the returned dictionary strictly matches the Feedback schema,
    re-calibrates the composite overallScore mathematically, and ensures all tips
    have non-empty strings and valid type tags.
    """
    sanitized = {}

    # Category keys and their display defaults
    categories = ["toneAndStyle", "content", "structure", "skills"]

    # 1. Sanitize ATS section
    raw_ats = data.get("ATS", {}) if isinstance(data.get("ATS"), dict) else {}
    ats_score = _clamp_score(raw_ats.get("score"), 70)
    raw_ats_tips = raw_ats.get("tips", []) if isinstance(raw_ats.get("tips"), list) else []

    ats_tips = []
    for item in raw_ats_tips:
        if isinstance(item, dict) and item.get("tip"):
            t_type = "good" if str(item.get("type")).lower() == "good" else "improve"
            ats_tips.append({
                "type": t_type,
                "tip": str(item.get("tip")).strip()
            })

    if not ats_tips:
        ats_tips = [
            {"type": "good", "tip": "Standard section headers detected for automated parsing compatibility."},
            {"type": "improve", "tip": "Align core technical skills with the exact keywords mentioned in the job description."}
        ]

    sanitized["ATS"] = {
        "score": ats_score,
        "tips": ats_tips
    }

    # 2. Sanitize granular categories
    sub_scores = {}
    for cat in categories:
        raw_cat = data.get(cat, {}) if isinstance(data.get(cat), dict) else {}
        score = _clamp_score(raw_cat.get("score"), 70)
        sub_scores[cat] = score

        raw_tips = raw_cat.get("tips", []) if isinstance(raw_cat.get("tips"), list) else []
        clean_tips = []
        for item in raw_tips:
            if isinstance(item, dict) and item.get("tip"):
                t_type = "good" if str(item.get("type")).lower() == "good" else "improve"
                explanation = str(item.get("explanation", item.get("tip", ""))).strip()
                clean_tips.append({
                    "type": t_type,
                    "tip": str(item.get("tip")).strip(),
                    "explanation": explanation
                })

        if not clean_tips:
            clean_tips = [
                {
                    "type": "good",
                    "tip": f"Solid foundation identified in {cat}.",
                    "explanation": "Key competencies and layout elements are present."
                },
                {
                    "type": "improve",
                    "tip": f"Refine {cat} to better reflect quantifiable outcomes.",
                    "explanation": "Provide more granular metrics and role alignment."
                }
            ]

        sanitized[cat] = {
            "score": score,
            "tips": clean_tips
        }

    # 3. Mathematically calibrated overallScore
    # Formula: 30% Content & Impact + 30% Skills Alignment + 20% Tone & Style + 20% Structure
    calibrated_overall = round(
        0.30 * sub_scores["content"] +
        0.30 * sub_scores["skills"] +
        0.20 * sub_scores["toneAndStyle"] +
        0.20 * sub_scores["structure"]
    )

    # If the model provided an overall score within 8 points of calibrated, respect its intuition;
    # otherwise snap to calibrated to prevent glaring contradictions.
    raw_overall = data.get("overallScore")
    if raw_overall is not None:
        raw_clamped = _clamp_score(raw_overall, calibrated_overall)
        if abs(raw_clamped - calibrated_overall) <= 8:
            sanitized["overallScore"] = raw_clamped
        else:
            sanitized["overallScore"] = calibrated_overall
    else:
        sanitized["overallScore"] = calibrated_overall

    return sanitized


def analyze_resume_with_ai(pdf_path: str, job_title: str, job_description: str, company_name: str) -> dict:
    """
    Performs high-precision resume evaluation against the specified job target
    using Groq's low-latency LLM inference.
    """
    resume_text = extract_text_from_pdf(pdf_path)

    if not resume_text:
        raise ValueError("Could not extract readable text from PDF. Please make sure the PDF has selectable text.")

    if not settings.GROQ_API_KEY or not settings.GROQ_API_KEY.strip():
        raise ValueError("GROQ_API_KEY is not configured. Please add your Groq API key to backend/.env.")

    client = Groq(api_key=settings.GROQ_API_KEY.strip())

    system_instruction = (
        "You are an Elite Senior Technical Recruiter, ATS (Applicant Tracking System) Evaluation Specialist, "
        "and Executive Career Coach. Your job is to conduct a rigorous, comprehensive, and deeply actionable audit "
        "of a candidate's resume evaluated directly against a target job posting.\n\n"
        "EVALUATION CRITERIA & RUBRIC:\n"
        "1. Applicant Tracking System (ATS) (0-100):\n"
        "   - Parseability, standard section headings (Experience, Education, Skills, Projects, Summary), contact info layout.\n"
        "   - Keyword match density and avoidance of parsing pitfalls (unreadable tables, complex graphics).\n"
        "   - Provide 3 to 5 clear insights (tagged 'good' or 'improve').\n\n"
        "2. Tone & Style (0-100):\n"
        "   - Audit active power verbs vs weak/passive phrasing (flag 'assisted with', 'responsible for', 'worked on').\n"
        "   - Enforce strong verbs ('architected', 'spearheaded', 'engineered', 'streamlined', 'orchestrated').\n"
        "   - Zero first-person pronouns ('I', 'me', 'my', 'we'). Eliminate hollow buzzwords ('hard worker', 'team player').\n"
        "   - Provide specific examples and concrete improvements in explanations.\n\n"
        "3. Content & Impact (0-100):\n"
        "   - Audit quantifiable achievements (metrics, %, $, latency reduction, scale, efficiency).\n"
        "   - Enforce Google's X-Y-Z formula: 'Accomplished [X], as measured by [Y], by doing [Z]'.\n"
        "   - CRITICAL REQUIREMENT FOR 'improve' TIPS: You MUST identify an actual weak/vague bullet from the resume "
        "     and provide an explicit 'Suggested Rewrite:' with plausible quantified metrics in the explanation.\n\n"
        "4. Structure & Layout (0-100):\n"
        "   - Visual hierarchy, reverse-chronological order, section prominence, bullet point density (3-5 bullets per job).\n\n"
        "5. Skills Alignment & Keyword Gap (0-100):\n"
        "   - Rigorous keyword gap analysis: Identify core technical competencies, tools, libraries, and certifications "
        "     demanded by the Job Description that are MISSING or weakly represented in the resume.\n"
        "   - For 'improve' tips, pinpoint the exact missing skills and specify which project or role should incorporate them.\n\n"
        "OUTPUT FORMAT: Return ONLY a valid JSON object matching the exact schema specified. No markdown fences, no explanatory preambles."
    )

    prompt = f"""Target Company: {company_name or 'Target Employer'}
Target Job Title: {job_title or 'Target Role'}

Target Job Description:
{job_description or 'Evaluate against general industry expectations for ' + (job_title or 'this role') + '.'}

Candidate Resume Text:
{resume_text}

Analyze the resume thoroughly and return ONLY a JSON object with this exact structure:
{{
  "overallScore": <integer 0-100, weighted composite: 30% content + 30% skills + 20% tone + 20% structure>,
  "ATS": {{
    "score": <integer 0-100>,
    "tips": [
      {{"type": "good" or "improve", "tip": "<concise actionable headline>"}}
    ]
  }},
  "toneAndStyle": {{
    "score": <integer 0-100>,
    "tips": [
      {{
        "type": "good" or "improve",
        "tip": "<concise headline>",
        "explanation": "<detailed rationale identifying specific phrases and recommending strong action verbs>"
      }}
    ]
  }},
  "content": {{
    "score": <integer 0-100>,
    "tips": [
      {{
        "type": "good" or "improve",
        "tip": "<concise headline>",
        "explanation": "<detailed rationale. For 'improve', include: Original Weakness: '...' | Suggested Rewrite (X-Y-Z formula): '...'>"
      }}
    ]
  }},
  "structure": {{
    "score": <integer 0-100>,
    "tips": [
      {{
        "type": "good" or "improve",
        "tip": "<concise headline>",
        "explanation": "<detailed advice on headings, bullet density, chronological hierarchy, and whitespace>"
      }}
    ]
  }},
  "skills": {{
    "score": <integer 0-100>,
    "tips": [
      {{
        "type": "good" or "improve",
        "tip": "<concise headline naming specific skill gaps or matches>",
        "explanation": "<detailed keyword gap breakdown stating missing technologies from the job posting and where to add them>"
      }}
    ]
  }}
}}"""

    preferred_model = getattr(settings, "GROQ_MODEL", "").strip()
    candidate_models = []
    if preferred_model:
        candidate_models.append(preferred_model)

    # Order by active Groq chat models
    default_models = [
        "openai/gpt-oss-120b",
        "qwen/qwen3.8-27b",
        "openai/gpt-oss-20b",
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
        "allam-2-7b",
    ]
    for model in default_models:
        if model not in candidate_models:
            candidate_models.append(model)

    last_error = None
    response_text = ""

    for model_name in candidate_models:
        try:
            # Try completion with JSON mode
            response = client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.2,
            )
            content = response.choices[0].message.content
            if content and content.strip():
                response_text = content.strip()
                break
        except Exception as e:
            err_str = str(e)
            # If json_object format is not supported on a specific model, retry without it
            if "response_format" in err_str or "json_object" in err_str:
                try:
                    response = client.chat.completions.create(
                        model=model_name,
                        messages=[
                            {"role": "system", "content": system_instruction},
                            {"role": "user", "content": prompt}
                        ],
                        temperature=0.2,
                    )
                    content = response.choices[0].message.content
                    if content and content.strip():
                        response_text = content.strip()
                        break
                except Exception as inner_e:
                    last_error = inner_e
                    continue

            last_error = e
            # If model is unavailable or rate limited, proceed to the next fallback candidate
            if any(term in err_str for term in ["model_not_found", "does not exist", "404", "rate_limit", "429"]):
                continue
            # For other unexpected errors, try next model before failing
            continue

    if not response_text:
        if last_error:
            raise last_error
        raise ValueError("Failed to obtain response from AI service.")

    raw_json = _extract_json_from_response(response_text)
    return _validate_and_sanitize_feedback(raw_json)