import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = 'claude-sonnet-4-6';

const COUNCIL_SYSTEM = `You are a council of 20 career professionals working together to help candidates build world-class CVs for the UAE/GCC job market:

1. Senior Recruiter — keyword visibility, 6-second scan test
2. ATS Algorithm Specialist — parsing logic, format compliance, scoring
3. HR Director — organisational fit, shortlisting criteria
4. Certified CV Writer (CPRW) — PARW/NRWA standards, achievement framing, quantification
5. Career Coach — narrative coherence, gap handling, personal brand
6. Hiring Manager — final yes/no psychology
7. Data Analyst — impact quantification, ROI storytelling
8. Behavioural Psychologist — first impressions, cognitive load, credibility signals
9. UX Designer — visual hierarchy, scanability
10. Copywriter — action verb selection, eliminating clichés, power language
11. Linguist/Editor — grammar, tense, voice, concision
12. UAE/GCC Industry Expert — Oil & Gas, Finance, Tech, Healthcare, Construction, Hospitality
13. MENA Cultural Consultant — photo norms, nationality, visa status, Gulf business etiquette
14. Personal Branding Consultant — value proposition, differentiation, executive presence
15. LinkedIn Optimisation Expert — cross-platform consistency, searchability
16. UAE Labour Law Specialist — what can/cannot legally appear on a CV in UAE
17. Typography & Print Design Expert — font, spacing, PDF rendering
18. Job Board SEO Specialist — keyword density, recruiter search terms
19. AI/ML Engineer — how ATS black-box scoring works
20. Interview Coach — reverse-engineering interview questions from CV content

Your outputs synthesise all relevant expert perspectives. Be direct, specific, and actionable. Focus on UAE/GCC context.`;

async function callClaude(systemPrompt: string, userMessage: string, stream = false) {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const body = {
    model: MODEL,
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
    stream,
  };

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error: ${err}`);
  }

  return response;
}

export async function POST(req: NextRequest) {
  try {
    const { action, data } = await req.json();

    switch (action) {
      case 'generate_summary': {
        const { experience, education, skills, targetRole, targetIndustry, tone } = data;
        const prompt = `Generate a professional CV summary for this candidate. Produce 3 variants:
- Version 1: Conservative/Traditional (banking, government, healthcare)
- Version 2: Balanced/Professional (most industries)
- Version 3: Bold/Achievement-forward (sales, tech, marketing)

CV Data:
Experience: ${JSON.stringify(experience)}
Education: ${JSON.stringify(education)}
Skills: ${JSON.stringify(skills)}
Target Role: ${targetRole || 'Not specified'}
Target Industry: ${targetIndustry || 'Not specified'}
Preferred tone: ${tone || 'Professional'}

Rules:
- No personal pronouns (no I, me, my)
- Start with a strong descriptor
- Include 3-5 industry keywords naturally
- 200-280 words per variant
- Avoid: "team player", "hard worker", "passionate about", "seeking opportunity"
- Include UAE/regional context where relevant

Return JSON: {"v1": "...", "v2": "...", "v3": "..."}`;

        const res = await callClaude(COUNCIL_SYSTEM, prompt);
        const json = await res.json();
        const text = json.content[0].text;
        try {
          const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
          return NextResponse.json({ success: true, data: parsed });
        } catch {
          return NextResponse.json({ success: true, data: { v1: text, v2: text, v3: text } });
        }
      }

      case 'enhance_bullet': {
        const { bullet, jobTitle, industry, mode } = data;
        let prompt = '';

        if (mode === 'quick') {
          prompt = `Transform this CV bullet from a duty statement to a strong achievement statement.
Job Title: ${jobTitle}
Industry: ${industry}
Original: "${bullet}"

Rules:
- Start with a strong action verb (Led, Achieved, Drove, Grew, Launched, etc.)
- Include quantified impact where possible
- Keep to 1-2 lines (25-40 words ideal)
- UAE/GCC context
- No personal pronouns

Return JSON: {"enhanced": "...", "verb_upgrade": "original verb → new verb"}`;
        } else if (mode === 'metric') {
          prompt = `Analyse this CV bullet and identify what metrics would strengthen it.
Original: "${bullet}"
Job Title: ${jobTitle}

Return JSON: {"analysis": "...", "questions": ["question1", "question2", "question3"], "example_enhanced": "example if typical metrics filled in"}`;
        } else {
          prompt = `Completely rewrite this CV entry for maximum impact.
Job Title: ${jobTitle}
Industry: ${industry}
Original content: "${bullet}"

Generate 6-8 strong achievement-oriented bullets using CAR framework (Challenge-Action-Result).
Return JSON: {"bullets": ["bullet1", "bullet2", ...]}`;
        }

        const res = await callClaude(COUNCIL_SYSTEM, prompt);
        const json = await res.json();
        const text = json.content[0].text;
        try {
          const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
          return NextResponse.json({ success: true, data: parsed });
        } catch {
          return NextResponse.json({ success: true, data: { enhanced: text } });
        }
      }

      case 'ats_score': {
        const { cvData } = data;
        const prompt = `Perform a comprehensive ATS (Applicant Tracking System) analysis of this CV.

CV Data: ${JSON.stringify(cvData)}

Analyse for:
1. Section header recognition (are they standard names ATS systems recognise?)
2. Date format consistency
3. Keyword density and coverage
4. Format issues (tables, columns, headers/footers)
5. Missing critical sections
6. Spelling/grammar issues

Return JSON:
{
  "score": number (0-100),
  "grade": "Excellent|Good|Fair|Poor",
  "parsing": {"name": bool, "email": bool, "phone": bool, "experience_count": number, "education_count": number, "issues": ["..."]},
  "keywords": {"found": ["kw1", "kw2"], "missing": ["kw1", "kw2"], "density_ok": bool},
  "format": {"issues": ["issue1"], "warnings": ["warn1"]},
  "recommendations": [{"priority": "critical|important|tip", "text": "...", "action": "fix_label"}],
  "section_scores": {"parsing": number, "keywords": number, "format": number, "completeness": number}
}`;

        const res = await callClaude(COUNCIL_SYSTEM, prompt);
        const json = await res.json();
        const text = json.content[0].text;
        try {
          const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
          return NextResponse.json({ success: true, data: parsed });
        } catch {
          return NextResponse.json({ success: true, data: { score: 70, grade: 'Good', recommendations: [] } });
        }
      }

      case 'job_match': {
        const { cvData, jobDescription } = data;
        const prompt = `Perform a job match analysis comparing this candidate's CV to the job description.

CV: ${JSON.stringify(cvData)}
Job Description: ${jobDescription}

Return JSON:
{
  "match_score": number (0-100),
  "grade": "Excellent|Good|Moderate|Low",
  "summary": "1 sentence summary",
  "keywords_found": [{"kw": "...", "cv_count": number}],
  "keywords_missing": [{"kw": "...", "jd_importance": "required|preferred", "suggestion": "..."}],
  "experience_match": {"verdict": "✅|⚠️|❌", "notes": "..."},
  "education_match": {"verdict": "✅|⚠️|❌", "notes": "..."},
  "tailoring_recommendations": [{"priority": 1, "action": "...", "detail": "..."}],
  "score_if_tailored": number
}`;

        const res = await callClaude(COUNCIL_SYSTEM, prompt);
        const json = await res.json();
        const text = json.content[0].text;
        try {
          const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
          return NextResponse.json({ success: true, data: parsed });
        } catch {
          return NextResponse.json({ success: true, data: { match_score: 65, keywords_missing: [], tailoring_recommendations: [] } });
        }
      }

      case 'weak_language': {
        const { cvText } = data;
        const prompt = `Scan this CV text for weak language patterns.

CV Text: ${cvText}

Identify:
1. Overused/cliché phrases ("responsible for", "team player", "hard worker", "passionate about", "seeking opportunity", "detail-oriented")
2. Passive voice instances
3. Weak verbs ("worked on", "helped with", "was involved in")
4. Personal pronouns (I, me, my)

Return JSON:
{
  "cliches": [{"phrase": "...", "count": number, "suggestion": "..."}],
  "weak_verbs": [{"phrase": "...", "suggestion": "..."}],
  "passive_voice": [{"sentence": "...", "active_version": "..."}],
  "pronouns": {"count": number, "examples": ["..."]},
  "overall_language_score": number
}`;

        const res = await callClaude(COUNCIL_SYSTEM, prompt);
        const json = await res.json();
        const text = json.content[0].text;
        try {
          const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
          return NextResponse.json({ success: true, data: parsed });
        } catch {
          return NextResponse.json({ success: true, data: { cliches: [], weak_verbs: [], passive_voice: [], pronouns: { count: 0 } } });
        }
      }

      case 'cover_letter': {
        const { cvData, jobData, tone } = data;
        const prompt = `Write a tailored cover letter for this candidate applying for this job.

CV: ${JSON.stringify(cvData)}
Job: ${JSON.stringify(jobData)}
Tone: ${tone || 'Professional'}

Rules:
- Do NOT start with "I am writing to apply..."
- Show knowledge of the company and role
- Map 3 specific achievements from the CV to 3 JD requirements
- Address any concerns naturally (career change, gap)
- UAE-appropriate closing
- 3 paragraphs, 250-350 words
- Professional, engaging, not generic

Return JSON: {"cover_letter": "...", "word_count": number, "key_mappings": ["CV achievement → JD requirement"]}`;

        const res = await callClaude(COUNCIL_SYSTEM, prompt);
        const json = await res.json();
        const text = json.content[0].text;
        try {
          const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
          return NextResponse.json({ success: true, data: parsed });
        } catch {
          return NextResponse.json({ success: true, data: { cover_letter: text } });
        }
      }

      case 'interview_prep': {
        const { cvData, jobData } = data;
        const prompt = `Generate an interview prediction report based on this candidate's CV.

CV: ${JSON.stringify(cvData)}
Target Job: ${JSON.stringify(jobData || {})}

Identify:
1. Questions CERTAIN to be asked (based on gaps, job changes, transitions)
2. Strength-based questions (where candidate will excel)
3. Red flag questions (areas interviewers will probe)

Return JSON:
{
  "certain_questions": [{"question": "...", "reason": "...", "prep_tip": "..."}],
  "strength_questions": [{"question": "...", "cv_evidence": "..."}],
  "red_flags": [{"flag": "...", "question": "...", "mitigation": "..."}],
  "overall_interview_readiness": "Strong|Moderate|Needs Prep"
}`;

        const res = await callClaude(COUNCIL_SYSTEM, prompt);
        const json = await res.json();
        const text = json.content[0].text;
        try {
          const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
          return NextResponse.json({ success: true, data: parsed });
        } catch {
          return NextResponse.json({ success: true, data: { certain_questions: [], strength_questions: [], red_flags: [] } });
        }
      }

      case 'chat': {
        const { cvData, message, history } = data;
        const systemWithCtx = `${COUNCIL_SYSTEM}

Current candidate CV data:
${JSON.stringify(cvData, null, 2)}

You are in Chat Mode — the candidate can ask any career question. Synthesise perspectives from all 20 experts as relevant to their question. Be direct, specific, and actionable. Focus on UAE/GCC context.`;

        const messages = [
          ...(history || []),
          { role: 'user', content: message },
        ];

        if (!ANTHROPIC_API_KEY) {
          return NextResponse.json({ success: true, data: { reply: 'AI chat requires ANTHROPIC_API_KEY to be configured. Add it to your environment variables.' } });
        }

        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: MODEL,
            max_tokens: 1024,
            system: systemWithCtx,
            messages,
          }),
        });

        if (!res.ok) throw new Error('AI call failed');
        const json = await res.json();
        return NextResponse.json({ success: true, data: { reply: json.content[0].text } });
      }

      case 'suggest_skills': {
        const { jobTitle, industry, existingSkills } = data;
        const prompt = `Based on the job title "${jobTitle}" in "${industry}" industry for UAE/GCC market, suggest relevant skills the candidate may have forgotten.

Existing skills they already listed: ${JSON.stringify(existingSkills)}

Return JSON:
{
  "technical_skills": ["skill1", "skill2", ...],
  "soft_skills": ["skill1", "skill2", ...],
  "certifications": ["cert1", "cert2", ...],
  "ats_insight": "These skills appear in X% of JDs for this role in UAE"
}`;

        const res = await callClaude(COUNCIL_SYSTEM, prompt);
        const json = await res.json();
        const text = json.content[0].text;
        try {
          const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
          return NextResponse.json({ success: true, data: parsed });
        } catch {
          return NextResponse.json({ success: true, data: { technical_skills: [], soft_skills: [] } });
        }
      }

      default:
        return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
    }
  } catch (err) {
    console.error('CV AI error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
