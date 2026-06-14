'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  ChevronDown, ChevronUp, Plus, Trash2, Sparkles, Download, Eye, FileText,
  User, Briefcase, GraduationCap, Star, Award, Globe, Wrench, MessageSquare,
  Target, BarChart3, AlertCircle, CheckCircle, Info, Loader2, X, RefreshCw,
  ChevronRight, Zap, BookOpen, Users, Copy, Check,
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface PersonalInfo {
  full_name: string; professional_title: string; email: string; phone: string;
  city: string; emirate: string; linkedin: string; portfolio: string;
  nationality: string; dob: string; gender: string; visa_status: string;
  driving_license: boolean; driving_license_uae: boolean;
  current_salary: string; expected_salary: string; notice_period: string;
  marital_status: string; photo_url: string;
}

interface ExperienceBullet { id: string; content: string; ai_enhanced: boolean; original?: string; }
interface Experience {
  id: string; job_title: string; company: string; industry: string;
  company_size: string; city: string; country: string;
  employment_type: string; start_date: string; end_date: string;
  is_current: boolean; bullets: ExperienceBullet[];
}

interface Education {
  id: string; degree_type: string; field: string; institution: string;
  country: string; start_year: string; end_year: string; in_progress: boolean;
  grade: string; thesis: string;
}

interface Skill { id: string; name: string; category: 'technical' | 'soft' | 'language'; proficiency: string; }

interface Certification {
  id: string; name: string; issuer: string; date_obtained: string;
  expiry_date: string; credential_id: string; verify_url: string; status: string;
}

interface Project {
  id: string; name: string; description: string; role: string; technologies: string[];
  team_size: string; duration: string; url: string; outcome: string;
}

interface CVData {
  personal: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  certifications: Certification[];
  projects: Project[];
  template: string;
  target_role: string;
  target_industry: string;
}

type Section = 'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'certifications' | 'projects' | 'export';
type AiPanel = 'hidden' | 'analyse' | 'chat';

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function uid() { return Math.random().toString(36).slice(2); }

function defaultCV(): CVData {
  return {
    personal: {
      full_name: '', professional_title: '', email: '', phone: '',
      city: '', emirate: 'Dubai', linkedin: '', portfolio: '',
      nationality: '', dob: '', gender: '', visa_status: '',
      driving_license: false, driving_license_uae: false,
      current_salary: '', expected_salary: '', notice_period: '1 month',
      marital_status: '', photo_url: '',
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    projects: [],
    template: 'clean_pro',
    target_role: '',
    target_industry: '',
  };
}

async function aiCall(action: string, data: Record<string, unknown>) {
  const res = await fetch('/api/cv/ai', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action, data }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'AI call failed');
  return json.data;
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function SectionCard({ title, icon, children, open, onToggle, badge }: {
  title: string; icon: React.ReactNode; children: React.ReactNode;
  open: boolean; onToggle: () => void; badge?: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-3">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-[#1A3C6E]">{icon}</span>
          <span className="font-semibold text-sm text-gray-800">{title}</span>
          {badge && <span className="bg-[#FF6B35] text-white text-[10px] px-2 py-0.5 rounded-full">{badge}</span>}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="px-4 pb-4 border-t border-gray-100">{children}</div>}
    </div>
  );
}

function Field({ label, children, note }: { label: string; children: React.ReactNode; note?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      {children}
      {note && <p className="text-[10px] text-gray-400 mt-0.5">{note}</p>}
    </div>
  );
}

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]/20 focus:border-[#1A3C6E]';
const selCls = inputCls + ' bg-white';

function AiButton({ onClick, loading, label = 'AI Enhance' }: { onClick: () => void; loading?: boolean; label?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#1A3C6E] to-[#2a5298] text-white text-xs px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
      {label}
    </button>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-emerald-100 text-emerald-700' : score >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';
  const label = score >= 80 ? 'Great' : score >= 60 ? 'Good' : 'Needs Work';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${color}`}>
      {score}/100 · {label}
    </span>
  );
}

/* ─── TEMPLATES ──────────────────────────────────────────────────────────── */

const TEMPLATES = [
  { id: 'clean_pro', name: 'Clean Pro', category: 'ATS-Safe', ats: 100, desc: 'Single column, 100% ATS parseable', accent: '#1A3C6E' },
  { id: 'classic', name: 'Classic', category: 'ATS-Safe', ats: 100, desc: 'Traditional, universal format', accent: '#2c2c2c' },
  { id: 'executive_pro', name: 'Executive Pro', category: 'Professional', ats: 95, desc: 'Subtle accent, dual column', accent: '#1A3C6E' },
  { id: 'modern_navy', name: 'Modern Navy', category: 'Professional', ats: 92, desc: 'Contemporary design, strong header', accent: '#0a2d5e' },
  { id: 'uae_bilingual', name: 'UAE Bilingual', category: 'UAE', ats: 90, desc: 'Arabic/English dual layout', accent: '#006847' },
  { id: 'creative', name: 'Creative Edge', category: 'Creative', ats: 60, desc: 'Strong visual design — portfolio roles', accent: '#FF6B35' },
];

/* ─── CV Preview ─────────────────────────────────────────────────────────── */

function CVPreview({ cv }: { cv: CVData }) {
  const tpl = TEMPLATES.find(t => t.id === cv.template) || TEMPLATES[0];
  const accent = tpl.accent;

  const p = cv.personal;

  return (
    <div className="bg-white text-gray-900 font-sans text-[10px] leading-tight" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      {/* Header */}
      <div style={{ background: accent, color: 'white', padding: '16px 20px' }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{p.full_name || 'Your Name'}</h1>
        <p style={{ fontSize: 11, margin: '3px 0 0', opacity: 0.85 }}>{p.professional_title || 'Professional Title'}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6, fontSize: 9, opacity: 0.8 }}>
          {p.email && <span>✉ {p.email}</span>}
          {p.phone && <span>✆ {p.phone}</span>}
          {p.city && <span>📍 {p.city}{p.emirate ? `, ${p.emirate}` : ''}</span>}
          {p.linkedin && <span>in {p.linkedin}</span>}
        </div>
      </div>

      <div style={{ padding: '12px 20px' }}>
        {/* Summary */}
        {cv.summary && (
          <section style={{ marginBottom: 10 }}>
            <h2 style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: accent, borderBottom: `1.5px solid ${accent}`, paddingBottom: 3, marginBottom: 6 }}>
              Professional Summary
            </h2>
            <p style={{ fontSize: 9, color: '#444', lineHeight: 1.5 }}>{cv.summary}</p>
          </section>
        )}

        {/* Experience */}
        {cv.experience.length > 0 && (
          <section style={{ marginBottom: 10 }}>
            <h2 style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: accent, borderBottom: `1.5px solid ${accent}`, paddingBottom: 3, marginBottom: 6 }}>
              Work Experience
            </h2>
            {cv.experience.map(exp => (
              <div key={exp.id} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <strong style={{ fontSize: 10 }}>{exp.job_title || 'Job Title'}</strong>
                    <span style={{ color: accent, fontSize: 9 }}> · {exp.company || 'Company'}</span>
                  </div>
                  <span style={{ fontSize: 8, color: '#888' }}>
                    {exp.start_date} – {exp.is_current ? 'Present' : exp.end_date}
                  </span>
                </div>
                {exp.city && <p style={{ fontSize: 8, color: '#666', margin: '1px 0' }}>{exp.city}, {exp.country}</p>}
                {exp.bullets.length > 0 && (
                  <ul style={{ margin: '4px 0 0 12px', padding: 0 }}>
                    {exp.bullets.map(b => (
                      <li key={b.id} style={{ fontSize: 8.5, color: '#444', marginBottom: 2, lineHeight: 1.4 }}>{b.content}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Education */}
        {cv.education.length > 0 && (
          <section style={{ marginBottom: 10 }}>
            <h2 style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: accent, borderBottom: `1.5px solid ${accent}`, paddingBottom: 3, marginBottom: 6 }}>
              Education
            </h2>
            {cv.education.map(edu => (
              <div key={edu.id} style={{ marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <strong style={{ fontSize: 10 }}>{edu.degree_type} {edu.field && `in ${edu.field}`}</strong>
                    <div style={{ fontSize: 9, color: '#666' }}>{edu.institution}{edu.country ? `, ${edu.country}` : ''}</div>
                  </div>
                  <span style={{ fontSize: 8, color: '#888' }}>{edu.start_year} – {edu.in_progress ? 'In Progress' : edu.end_year}</span>
                </div>
                {edu.grade && <p style={{ fontSize: 8, color: '#555' }}>Grade: {edu.grade}</p>}
              </div>
            ))}
          </section>
        )}

        {/* Skills */}
        {cv.skills.length > 0 && (
          <section style={{ marginBottom: 10 }}>
            <h2 style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: accent, borderBottom: `1.5px solid ${accent}`, paddingBottom: 3, marginBottom: 6 }}>
              Skills
            </h2>
            <div>
              {['technical', 'soft', 'language'].map(cat => {
                const catSkills = cv.skills.filter(s => s.category === cat);
                if (!catSkills.length) return null;
                const label = cat === 'technical' ? 'Technical' : cat === 'soft' ? 'Professional' : 'Languages';
                return (
                  <div key={cat} style={{ marginBottom: 3 }}>
                    <strong style={{ fontSize: 8, color: '#555' }}>{label}: </strong>
                    <span style={{ fontSize: 8, color: '#444' }}>{catSkills.map(s => s.name + (s.proficiency ? ` (${s.proficiency})` : '')).join(' · ')}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Certifications */}
        {cv.certifications.length > 0 && (
          <section style={{ marginBottom: 10 }}>
            <h2 style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: accent, borderBottom: `1.5px solid ${accent}`, paddingBottom: 3, marginBottom: 6 }}>
              Certifications
            </h2>
            {cv.certifications.map(cert => (
              <div key={cert.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <div>
                  <strong style={{ fontSize: 9 }}>{cert.name}</strong>
                  <span style={{ fontSize: 8, color: '#666' }}> · {cert.issuer}</span>
                </div>
                <span style={{ fontSize: 8, color: '#888' }}>{cert.date_obtained}</span>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

/* ─── Score Panel ────────────────────────────────────────────────────────── */

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value >= 80 ? 'bg-emerald-500' : value >= 60 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

/* ─── MAIN BUILDER COMPONENT ─────────────────────────────────────────────── */

export default function CvBuilderPage() {
  const [cv, setCv] = useState<CVData>(defaultCV);
  const [activeSection, setActiveSection] = useState<Section>('personal');
  const [aiPanel, setAiPanel] = useState<AiPanel>('hidden');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [summaryVariants, setSummaryVariants] = useState<{ v1: string; v2: string; v3: string } | null>(null);
  const [atsScore, setAtsScore] = useState<Record<string, unknown> | null>(null);
  const [jobDesc, setJobDesc] = useState('');
  const [jobMatchResult, setJobMatchResult] = useState<Record<string, unknown> | null>(null);
  const [weakLang, setWeakLang] = useState<Record<string, unknown> | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [interviewPrep, setInterviewPrep] = useState<Record<string, unknown> | null>(null);
  const [bulletLoading, setBulletLoading] = useState<string | null>(null);
  const [skillSuggestions, setSkillSuggestions] = useState<Record<string, unknown> | null>(null);
  const [saved, setSaved] = useState(false);
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'ats'|'match'|'weak'|'interview'|'cover'>('ats');
  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const chatBottom = useRef<HTMLDivElement>(null);

  /* Auto-save to localStorage */
  useEffect(() => {
    const stored = localStorage.getItem('cv_builder_data');
    if (stored) {
      try { setCv(JSON.parse(stored)); } catch {}
    }
  }, []);

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      localStorage.setItem('cv_builder_data', JSON.stringify(cv));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1500);
  }, [cv]);

  useEffect(() => {
    chatBottom.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  /* CV completeness score (local calc) */
  const completeness = useCallback(() => {
    let score = 0;
    const p = cv.personal;
    if (p.full_name) score += 10;
    if (p.email) score += 5;
    if (p.phone) score += 5;
    if (p.professional_title) score += 5;
    if (cv.summary.length > 50) score += 10;
    if (cv.experience.length > 0) score += 20;
    if (cv.experience.some(e => e.bullets.length > 2)) score += 10;
    if (cv.education.length > 0) score += 10;
    if (cv.skills.length >= 5) score += 10;
    if (cv.certifications.length > 0) score += 5;
    if (p.linkedin) score += 5;
    if (p.visa_status) score += 5;
    return Math.min(100, score);
  }, [cv]);

  /* ─── Updaters ────────── */
  function upPersonal(k: keyof PersonalInfo, v: string | boolean) {
    setCv(prev => ({ ...prev, personal: { ...prev.personal, [k]: v } }));
  }
  function upSummary(v: string) { setCv(prev => ({ ...prev, summary: v })); }
  function upField<T extends { id: string }>(key: keyof CVData, id: string, field: keyof T, value: unknown) {
    setCv(prev => ({
      ...prev,
      [key]: (prev[key] as unknown as T[]).map((item: T) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  }

  /* ─── Experience ──── */
  function addExp() {
    const newExp: Experience = {
      id: uid(), job_title: '', company: '', industry: '', company_size: '',
      city: '', country: 'UAE', employment_type: 'Full-time',
      start_date: '', end_date: '', is_current: false, bullets: [],
    };
    setCv(prev => ({ ...prev, experience: [...prev.experience, newExp] }));
  }
  function removeExp(id: string) { setCv(prev => ({ ...prev, experience: prev.experience.filter(e => e.id !== id) })); }
  function addBullet(expId: string) {
    setCv(prev => ({
      ...prev,
      experience: prev.experience.map(e =>
        e.id === expId ? { ...e, bullets: [...e.bullets, { id: uid(), content: '', ai_enhanced: false }] } : e
      ),
    }));
  }
  function updateBullet(expId: string, bId: string, content: string) {
    setCv(prev => ({
      ...prev,
      experience: prev.experience.map(e =>
        e.id === expId ? { ...e, bullets: e.bullets.map(b => b.id === bId ? { ...b, content } : b) } : e
      ),
    }));
  }
  function removeBullet(expId: string, bId: string) {
    setCv(prev => ({
      ...prev,
      experience: prev.experience.map(e =>
        e.id === expId ? { ...e, bullets: e.bullets.filter(b => b.id !== bId) } : e
      ),
    }));
  }

  async function enhanceBullet(expId: string, bullet: ExperienceBullet, exp: Experience) {
    if (!bullet.content.trim()) return;
    setBulletLoading(bullet.id);
    try {
      const result = await aiCall('enhance_bullet', { bullet: bullet.content, jobTitle: exp.job_title, industry: exp.industry, mode: 'quick' }) as { enhanced?: string };
      if (result.enhanced) {
        setCv(prev => ({
          ...prev,
          experience: prev.experience.map(e =>
            e.id === expId ? {
              ...e,
              bullets: e.bullets.map(b =>
                b.id === bullet.id ? { ...b, content: result.enhanced!, ai_enhanced: true, original: b.content } : b
              ),
            } : e
          ),
        }));
      }
    } catch (err) {
      console.error(err);
    }
    setBulletLoading(null);
  }

  /* ─── Education ──── */
  function addEdu() {
    const edu: Education = { id: uid(), degree_type: "Bachelor's", field: '', institution: '', country: '', start_year: '', end_year: '', in_progress: false, grade: '', thesis: '' };
    setCv(prev => ({ ...prev, education: [...prev.education, edu] }));
  }
  function removeEdu(id: string) { setCv(prev => ({ ...prev, education: prev.education.filter(e => e.id !== id) })); }

  /* ─── Skills ──── */
  const [skillInput, setSkillInput] = useState('');
  const [skillCat, setSkillCat] = useState<'technical' | 'soft' | 'language'>('technical');
  function addSkill() {
    const name = skillInput.trim();
    if (!name) return;
    setCv(prev => ({ ...prev, skills: [...prev.skills, { id: uid(), name, category: skillCat, proficiency: '' }] }));
    setSkillInput('');
  }
  function removeSkill(id: string) { setCv(prev => ({ ...prev, skills: prev.skills.filter(s => s.id !== id) })); }

  /* ─── Certifications ──── */
  function addCert() {
    const cert: Certification = { id: uid(), name: '', issuer: '', date_obtained: '', expiry_date: '', credential_id: '', verify_url: '', status: 'Valid' };
    setCv(prev => ({ ...prev, certifications: [...prev.certifications, cert] }));
  }
  function removeCert(id: string) { setCv(prev => ({ ...prev, certifications: prev.certifications.filter(c => c.id !== id) })); }

  /* ─── Projects ──── */
  function addProject() {
    const proj: Project = { id: uid(), name: '', description: '', role: '', technologies: [], team_size: '', duration: '', url: '', outcome: '' };
    setCv(prev => ({ ...prev, projects: [...prev.projects, proj] }));
  }
  function removeProject(id: string) { setCv(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) })); }

  /* ─── AI Actions ──── */
  async function generateSummary() {
    setAiLoading(true);
    try {
      const result = await aiCall('generate_summary', {
        experience: cv.experience, education: cv.education, skills: cv.skills,
        targetRole: cv.target_role, targetIndustry: cv.target_industry,
      }) as { v1: string; v2: string; v3: string };
      setSummaryVariants(result);
    } catch (err) { console.error(err); }
    setAiLoading(false);
  }

  async function runAtsScore() {
    setAiLoading(true);
    try {
      const result = await aiCall('ats_score', { cvData: cv });
      setAtsScore(result as Record<string, unknown>);
    } catch (err) { console.error(err); }
    setAiLoading(false);
  }

  async function runJobMatch() {
    if (!jobDesc.trim()) return;
    setAiLoading(true);
    try {
      const result = await aiCall('job_match', { cvData: cv, jobDescription: jobDesc });
      setJobMatchResult(result as Record<string, unknown>);
    } catch (err) { console.error(err); }
    setAiLoading(false);
  }

  async function runWeakLang() {
    const text = [cv.summary, ...cv.experience.flatMap(e => e.bullets.map(b => b.content))].join('\n');
    setAiLoading(true);
    try {
      const result = await aiCall('weak_language', { cvText: text });
      setWeakLang(result as Record<string, unknown>);
    } catch (err) { console.error(err); }
    setAiLoading(false);
  }

  async function runCoverLetter() {
    setAiLoading(true);
    try {
      const result = await aiCall('cover_letter', { cvData: cv, jobData: { description: jobDesc }, tone: 'Professional' }) as { cover_letter?: string };
      setCoverLetter(result.cover_letter || '');
    } catch (err) { console.error(err); }
    setAiLoading(false);
  }

  async function runInterviewPrep() {
    setAiLoading(true);
    try {
      const result = await aiCall('interview_prep', { cvData: cv, jobData: { description: jobDesc } });
      setInterviewPrep(result as Record<string, unknown>);
    } catch (err) { console.error(err); }
    setAiLoading(false);
  }

  async function runSkillSuggestions() {
    const latestExp = cv.experience[0];
    if (!latestExp) return;
    setAiLoading(true);
    try {
      const result = await aiCall('suggest_skills', { jobTitle: latestExp.job_title, industry: latestExp.industry, existingSkills: cv.skills.map(s => s.name) });
      setSkillSuggestions(result as Record<string, unknown>);
    } catch (err) { console.error(err); }
    setAiLoading(false);
  }

  async function sendChat() {
    const msg = chatInput.trim();
    if (!msg) return;
    const newHistory = [...chatHistory, { role: 'user', content: msg }];
    setChatHistory(newHistory);
    setChatInput('');
    setAiLoading(true);
    try {
      const result = await aiCall('chat', { cvData: cv, message: msg, history: chatHistory }) as { reply?: string };
      setChatHistory(prev => [...prev, { role: 'assistant', content: result.reply || '' }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'Sorry, AI chat is unavailable. Please add ANTHROPIC_API_KEY to your environment.' }]);
      console.error(err);
    }
    setAiLoading(false);
  }

  /* ─── Export ──── */
  function printCV() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const content = document.getElementById('cv-preview-content');
    if (!content) return;
    printWindow.document.write(`
      <html><head><title>${cv.personal.full_name || 'CV'}</title>
      <style>body{margin:0;font-family:Arial,sans-serif;}</style></head>
      <body>${content.innerHTML}</body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  }

  /* ─── Completeness ──── */
  const comp = completeness();

  /* ─── Render ──────────────────────────────────────────────────────────── */

  const SECTION_ORDER: { id: Section; label: string; icon: React.ReactNode }[] = [
    { id: 'personal', label: 'Personal Info', icon: <User className="w-4 h-4" /> },
    { id: 'summary', label: 'Professional Summary', icon: <FileText className="w-4 h-4" /> },
    { id: 'experience', label: 'Work Experience', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'education', label: 'Education', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'skills', label: 'Skills & Languages', icon: <Star className="w-4 h-4" /> },
    { id: 'certifications', label: 'Certifications', icon: <Award className="w-4 h-4" /> },
    { id: 'projects', label: 'Projects & Portfolio', icon: <Wrench className="w-4 h-4" /> },
    { id: 'export', label: 'AI Analysis & Export', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 flex items-center justify-between px-4 h-12 flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/cv-builder" className="text-[#1A3C6E] hover:underline text-xs font-medium">← CV Builder</Link>
          <span className="text-gray-300">|</span>
          <span className="text-xs text-gray-500">
            {saved ? <span className="text-emerald-600 flex items-center gap-1"><Check className="w-3 h-3" /> Saved</span> : 'Auto-saving…'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Completeness */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-gray-500">Completeness</span>
            <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#FF6B35] rounded-full transition-all" style={{ width: `${comp}%` }} />
            </div>
            <span className="text-xs font-semibold text-gray-700">{comp}%</span>
          </div>
          <button
            onClick={() => setAiPanel(p => p === 'chat' ? 'hidden' : 'chat')}
            className="flex items-center gap-1.5 text-xs border border-[#1A3C6E] text-[#1A3C6E] px-2.5 py-1.5 rounded-lg hover:bg-[#1A3C6E]/5"
          >
            <MessageSquare className="w-3.5 h-3.5" /> AI Council Chat
          </button>
          <button
            onClick={() => setPreviewOpen(p => !p)}
            className="md:hidden flex items-center gap-1.5 text-xs bg-[#1A3C6E] text-white px-2.5 py-1.5 rounded-lg"
          >
            <Eye className="w-3.5 h-3.5" /> Preview
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT: Section Nav ── */}
        <div className="w-10 bg-[#1A3C6E] flex flex-col items-center py-3 gap-1 flex-shrink-0">
          {SECTION_ORDER.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              title={s.label}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${activeSection === s.id ? 'bg-white text-[#1A3C6E]' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
            >
              {s.icon}
            </button>
          ))}
        </div>

        {/* ── CENTRE: Form Panel ── */}
        <div className="flex-1 min-w-0 overflow-y-auto p-4">
          <div className="max-w-xl mx-auto">
            <h2 className="text-base font-bold text-[#1A3C6E] mb-3 flex items-center gap-2">
              {SECTION_ORDER.find(s => s.id === activeSection)?.icon}
              {SECTION_ORDER.find(s => s.id === activeSection)?.label}
            </h2>

            {/* ── PERSONAL INFO ── */}
            {activeSection === 'personal' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800">
                  <strong>🇦🇪 UAE CV Tip:</strong> Unlike Western CVs, UAE employers typically expect photo, nationality, visa status, date of birth, and salary expectations directly on the CV.
                </div>

                <SectionCard title="Core Information" icon={<User className="w-4 h-4" />} open={true} onToggle={() => {}}>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="col-span-2">
                      <Field label="Full Name *" note="Spell exactly as on your passport / Emirates ID">
                        <input className={inputCls} value={cv.personal.full_name} onChange={e => upPersonal('full_name', e.target.value)} placeholder="e.g. Ahmed Al-Mansouri" />
                      </Field>
                    </div>
                    <div className="col-span-2">
                      <Field label="Professional Title / Headline *" note='e.g. "Senior Financial Analyst | 9 Years | CFA | Dubai"'>
                        <input className={inputCls} value={cv.personal.professional_title} onChange={e => upPersonal('professional_title', e.target.value)} placeholder="Your headline" />
                      </Field>
                    </div>
                    <Field label="Email *">
                      <input className={inputCls} type="email" value={cv.personal.email} onChange={e => upPersonal('email', e.target.value)} placeholder="your@email.com" />
                    </Field>
                    <Field label="Phone *" note="Format: +971 50 XXX XXXX">
                      <input className={inputCls} value={cv.personal.phone} onChange={e => upPersonal('phone', e.target.value)} placeholder="+971 50 123 4567" />
                    </Field>
                    <Field label="City">
                      <input className={inputCls} value={cv.personal.city} onChange={e => upPersonal('city', e.target.value)} placeholder="e.g. Dubai" />
                    </Field>
                    <Field label="Emirate / Location">
                      <select className={selCls} value={cv.personal.emirate} onChange={e => upPersonal('emirate', e.target.value)}>
                        {['Dubai','Abu Dhabi','Sharjah','Ajman','Ras Al Khaimah','Fujairah','Umm Al Quwain','Abu Dhabi (ADGM)','Dubai (DIFC)','Ras Al Khaimah (RAK)','Fujairah','Umm Al Quwain','Dubai (DIFC)','Abu Dhabi (ADGM)'].map(c => <option key={c}>{c}</option>)}
                      </select>
                    </Field>
                    <Field label="LinkedIn URL">
                      <input className={inputCls} value={cv.personal.linkedin} onChange={e => upPersonal('linkedin', e.target.value)} placeholder="linkedin.com/in/yourname" />
                    </Field>
                    <Field label="Portfolio / Website">
                      <input className={inputCls} value={cv.personal.portfolio} onChange={e => upPersonal('portfolio', e.target.value)} placeholder="yourwebsite.com" />
                    </Field>
                  </div>
                </SectionCard>

                <SectionCard title="UAE-Specific Fields" icon={<Globe className="w-4 h-4" />} open={true} onToggle={() => {}}>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <Field label="Nationality">
                      <input className={inputCls} value={cv.personal.nationality} onChange={e => upPersonal('nationality', e.target.value)} placeholder="e.g. Egyptian, Indian, British" />
                    </Field>
                    <Field label="Date of Birth">
                      <input className={inputCls} type="date" value={cv.personal.dob} onChange={e => upPersonal('dob', e.target.value)} />
                    </Field>
                    <Field label="Visa Status *" note="Critical for UAE employers">
                      <select className={selCls} value={cv.personal.visa_status} onChange={e => upPersonal('visa_status', e.target.value)}>
                        <option value="">Select…</option>
                        {['Employment Visa','Residence Visa (Spouse)','Residence Visa (Parent)','Visit Visa','Cancelled Visa','Golden Visa','UAE Citizen','UAE Citizen'].map(v => <option key={v}>{v}</option>)}
                      </select>
                    </Field>
                    <Field label="Marital Status">
                      <select className={selCls} value={cv.personal.marital_status} onChange={e => upPersonal('marital_status', e.target.value)}>
                        <option value="">Prefer not to say</option>
                        {['Single','Married','Divorced','Widowed'].map(v => <option key={v}>{v}</option>)}
                      </select>
                    </Field>
                    <Field label="Notice Period">
                      <select className={selCls} value={cv.personal.notice_period} onChange={e => upPersonal('notice_period', e.target.value)}>
                        {['Immediate','1 week','2 weeks','1 month','2 months','3 months'].map(v => <option key={v}>{v}</option>)}
                      </select>
                    </Field>
                    <Field label="Gender">
                      <select className={selCls} value={cv.personal.gender} onChange={e => upPersonal('gender', e.target.value)}>
                        <option value="">Prefer not to say</option>
                        {['Male','Female'].map(v => <option key={v}>{v}</option>)}
                      </select>
                    </Field>
                    <Field label="Current Salary (AED/month)">
                      <input className={inputCls} value={cv.personal.current_salary} onChange={e => upPersonal('current_salary', e.target.value)} placeholder="e.g. 18,000" />
                    </Field>
                    <Field label="Expected Salary (AED/month)">
                      <input className={inputCls} value={cv.personal.expected_salary} onChange={e => upPersonal('expected_salary', e.target.value)} placeholder="e.g. 25,000" />
                    </Field>
                  </div>
                  <div className="flex gap-4 mt-3">
                    <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                      <input type="checkbox" checked={cv.personal.driving_license} onChange={e => upPersonal('driving_license', e.target.checked)} className="rounded" />
                      Driving License (Home Country)
                    </label>
                    <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                      <input type="checkbox" checked={cv.personal.driving_license_uae} onChange={e => upPersonal('driving_license_uae', e.target.checked)} className="rounded" />
                      UAE Driving License
                    </label>
                  </div>
                </SectionCard>

                {cv.personal.visa_status === 'Visit Visa' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                    <strong>💡 Visit Visa Intelligence:</strong> You are immediately available (no NOC needed) — a strong advantage. However, some large corporates prefer Employment/Resident visa candidates. Consider adding in your cover letter: <em>&quot;Available immediately as I am actively seeking employment in UAE.&quot;</em>
                  </div>
                )}

                <div className="flex justify-end mt-2">
                  <button onClick={() => setActiveSection('summary')} className="flex items-center gap-1.5 bg-[#1A3C6E] text-white text-xs px-4 py-2 rounded-lg hover:opacity-90">
                    Next: Summary <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ── SUMMARY ── */}
            {activeSection === 'summary' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Target Role (helps AI)">
                    <input className={inputCls} value={cv.target_role} onChange={e => setCv(prev => ({ ...prev, target_role: e.target.value }))} placeholder="e.g. Senior Financial Analyst" />
                  </Field>
                  <Field label="Target Industry">
                    <select className={selCls} value={cv.target_industry} onChange={e => setCv(prev => ({ ...prev, target_industry: e.target.value }))}>
                      <option value="">Select…</option>
                      {['Banking & Finance','Oil & Gas','Healthcare','Construction','Real Estate','Technology','Hospitality & Tourism','Retail','Government','Education','Marketing & PR','HR & Recruitment','Legal','Engineering','Logistics & Supply Chain'].map(v => <option key={v}>{v}</option>)}
                    </select>
                  </Field>
                </div>

                <Field label={`Professional Summary (${cv.summary.length} chars — aim for 900–1,500)`}>
                  <textarea
                    className={inputCls + ' resize-none h-40'}
                    value={cv.summary}
                    onChange={e => upSummary(e.target.value)}
                    placeholder="Seasoned financial analyst with 9 years of experience across UAE banking and investment sectors..."
                  />
                </Field>

                <div className="flex items-center gap-2 flex-wrap">
                  <AiButton onClick={generateSummary} loading={aiLoading} label="✨ Generate 3 AI Variants" />
                  <span className="text-xs text-gray-400">AI analyses your full CV to write a region-specific summary</span>
                </div>

                {summaryVariants && (
                  <div className="space-y-3">
                    {(['v1','v2','v3'] as const).map((key, i) => (
                      <div key={key} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-gray-600">
                            {i === 0 ? 'Version 1 — Conservative (Banking, Government, Healthcare)' : i === 1 ? 'Version 2 — Balanced (Most Industries)' : 'Version 3 — Bold (Sales, Tech, Marketing)'}
                          </span>
                          <button
                            onClick={() => { upSummary(summaryVariants[key]); setSummaryVariants(null); }}
                            className="text-xs bg-[#FF6B35] text-white px-3 py-1 rounded-lg hover:opacity-90"
                          >
                            Use This
                          </button>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">{summaryVariants[key]}</p>
                      </div>
                    ))}
                  </div>
                )}

                {cv.summary.length > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Quick Summary Check</p>
                    <div className="space-y-1">
                      {[
                        { label: 'Length', ok: cv.summary.length >= 800 && cv.summary.length <= 1600, warn: cv.summary.length > 0 },
                        { label: 'No "I" pronoun', ok: !/\bI\b|\bme\b|\bmy\b/i.test(cv.summary) },
                        { label: 'No clichés (team player, hard worker)', ok: !/team player|hard worker|passionate about|seeking opportunity/i.test(cv.summary) },
                        { label: 'Has numbers/metrics', ok: /\d/.test(cv.summary) },
                      ].map(item => (
                        <div key={item.label} className="flex items-center gap-2 text-xs">
                          {item.ok ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
                          <span className={item.ok ? 'text-gray-600' : 'text-amber-700'}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between mt-2">
                  <button onClick={() => setActiveSection('personal')} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">← Back</button>
                  <button onClick={() => setActiveSection('experience')} className="flex items-center gap-1.5 bg-[#1A3C6E] text-white text-xs px-4 py-2 rounded-lg hover:opacity-90">
                    Next: Experience <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ── EXPERIENCE ── */}
            {activeSection === 'experience' && (
              <div className="space-y-4">
                {cv.experience.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Briefcase className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No work experience added yet</p>
                    <p className="text-xs mt-1">Click the button below to add your most recent role first</p>
                  </div>
                )}

                {cv.experience.map((exp, idx) => (
                  <div key={exp.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 border-b border-gray-100 px-4 py-2.5 flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-600">
                        {exp.job_title || `Experience #${idx + 1}`}
                        {exp.company ? ` — ${exp.company}` : ''}
                      </span>
                      <button onClick={() => removeExp(exp.id)} className="text-red-400 hover:text-red-600">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-3">
                      <Field label="Job Title *">
                        <input className={inputCls} value={exp.job_title} onChange={e => upField<Experience>('experience', exp.id, 'job_title', e.target.value)} placeholder="e.g. Senior Financial Analyst" />
                      </Field>
                      <Field label="Company Name *">
                        <input className={inputCls} value={exp.company} onChange={e => upField<Experience>('experience', exp.id, 'company', e.target.value)} placeholder="e.g. Emirates NBD" />
                      </Field>
                      <Field label="Industry">
                        <select className={selCls} value={exp.industry} onChange={e => upField<Experience>('experience', exp.id, 'industry', e.target.value)}>
                          <option value="">Select…</option>
                          {['Banking & Finance','Oil & Gas','Healthcare','Construction','Real Estate','Technology','Hospitality','Retail','Government','Education','Marketing','HR','Legal','Engineering','Logistics'].map(v => <option key={v}>{v}</option>)}
                        </select>
                      </Field>
                      <Field label="Employment Type">
                        <select className={selCls} value={exp.employment_type} onChange={e => upField<Experience>('experience', exp.id, 'employment_type', e.target.value)}>
                          {['Full-time','Part-time','Contract','Freelance','Internship','Apprenticeship'].map(v => <option key={v}>{v}</option>)}
                        </select>
                      </Field>
                      <Field label="City">
                        <input className={inputCls} value={exp.city} onChange={e => upField<Experience>('experience', exp.id, 'city', e.target.value)} placeholder="e.g. Dubai" />
                      </Field>
                      <Field label="Country">
                        <input className={inputCls} value={exp.country} onChange={e => upField<Experience>('experience', exp.id, 'country', e.target.value)} placeholder="e.g. UAE" />
                      </Field>
                      <Field label="Start Date (Month YYYY)">
                        <input className={inputCls} value={exp.start_date} onChange={e => upField<Experience>('experience', exp.id, 'start_date', e.target.value)} placeholder="Jan 2022" />
                      </Field>
                      <Field label={exp.is_current ? 'End Date' : 'End Date (Month YYYY)'}>
                        <input className={inputCls} value={exp.end_date} disabled={exp.is_current} onChange={e => upField<Experience>('experience', exp.id, 'end_date', e.target.value)} placeholder="Dec 2024" />
                      </Field>
                      <div className="col-span-2">
                        <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                          <input type="checkbox" checked={exp.is_current} onChange={e => upField<Experience>('experience', exp.id, 'is_current', e.target.checked)} className="rounded" />
                          I currently work here
                        </label>
                      </div>
                    </div>

                    {/* Bullets */}
                    <div className="px-4 pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-600">Achievements & Responsibilities</span>
                        <div className="flex gap-2">
                          <span className="text-[10px] text-gray-400">Aim for 4–6 bullets</span>
                          <button onClick={() => addBullet(exp.id)} className="text-[#1A3C6E] hover:opacity-70">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {exp.bullets.length === 0 && (
                        <p className="text-xs text-gray-400 italic mb-2">Add bullet points describing your key achievements. Use the AI Enhance button to transform each one.</p>
                      )}

                      {exp.bullets.map(bullet => (
                        <div key={bullet.id} className="flex gap-2 mb-2">
                          <div className="mt-1.5 text-gray-400">•</div>
                          <textarea
                            className={inputCls + ' resize-none flex-1 min-h-[56px] text-xs'}
                            value={bullet.content}
                            onChange={e => updateBullet(exp.id, bullet.id, e.target.value)}
                            placeholder="Describe an achievement or responsibility. Start with a strong verb: Led, Grew, Reduced, Launched..."
                          />
                          <div className="flex flex-col gap-1">
                            <AiButton
                              onClick={() => enhanceBullet(exp.id, bullet, exp)}
                              loading={bulletLoading === bullet.id}
                              label=""
                            />
                            <button onClick={() => removeBullet(exp.id, bullet.id)} className="text-red-400 hover:text-red-600 p-1">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {exp.bullets.length > 0 && (
                        <div className="mt-1 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                          <strong>CAR check:</strong> Does each bullet have a Challenge, Action, and Result? Click ✨ to have AI enhance any weak bullet.
                        </div>
                      )}

                      <button
                        onClick={() => addBullet(exp.id)}
                        className="mt-2 w-full border border-dashed border-gray-200 rounded-lg py-2 text-xs text-gray-400 hover:border-[#1A3C6E] hover:text-[#1A3C6E] transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3 h-3" /> Add bullet
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addExp}
                  className="w-full border-2 border-dashed border-[#1A3C6E]/30 rounded-xl py-4 text-sm text-[#1A3C6E] hover:border-[#1A3C6E] hover:bg-[#1A3C6E]/5 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Work Experience
                </button>

                <div className="flex justify-between mt-2">
                  <button onClick={() => setActiveSection('summary')} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">← Back</button>
                  <button onClick={() => setActiveSection('education')} className="flex items-center gap-1.5 bg-[#1A3C6E] text-white text-xs px-4 py-2 rounded-lg hover:opacity-90">
                    Next: Education <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ── EDUCATION ── */}
            {activeSection === 'education' && (
              <div className="space-y-4">
                {cv.education.map((edu, idx) => (
                  <div key={edu.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 border-b border-gray-100 px-4 py-2.5 flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-600">
                        {edu.degree_type || `Education #${idx + 1}`}{edu.institution ? ` — ${edu.institution}` : ''}
                      </span>
                      <button onClick={() => removeEdu(edu.id)} className="text-red-400 hover:text-red-600">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-3">
                      <Field label="Degree Type">
                        <select className={selCls} value={edu.degree_type} onChange={e => upField<Education>('education', edu.id, 'degree_type', e.target.value)}>
                          {["High School Diploma","Foundation","Associate","Bachelor's","Postgraduate Diploma","Master's","MBA","PhD","Professional Qualification","Vocational"].map(v => <option key={v}>{v}</option>)}
                        </select>
                      </Field>
                      <Field label="Field of Study / Major">
                        <input className={inputCls} value={edu.field} onChange={e => upField<Education>('education', edu.id, 'field', e.target.value)} placeholder="e.g. Finance, Computer Science" />
                      </Field>
                      <div className="col-span-2">
                        <Field label="Institution Name">
                          <input className={inputCls} value={edu.institution} onChange={e => upField<Education>('education', edu.id, 'institution', e.target.value)} placeholder="University/College name" />
                        </Field>
                      </div>
                      <Field label="Country">
                        <input className={inputCls} value={edu.country} onChange={e => upField<Education>('education', edu.id, 'country', e.target.value)} placeholder="e.g. UAE, India, UK" />
                      </Field>
                      <Field label="Grade / GPA / Class">
                        <input className={inputCls} value={edu.grade} onChange={e => upField<Education>('education', edu.id, 'grade', e.target.value)} placeholder="e.g. First Class, 3.8 GPA" />
                      </Field>
                      <Field label="Start Year">
                        <input className={inputCls} value={edu.start_year} onChange={e => upField<Education>('education', edu.id, 'start_year', e.target.value)} placeholder="2016" />
                      </Field>
                      <Field label={edu.in_progress ? 'Expected Year' : 'Graduation Year'}>
                        <input className={inputCls} value={edu.end_year} onChange={e => upField<Education>('education', edu.id, 'end_year', e.target.value)} placeholder="2020" />
                      </Field>
                      <div className="col-span-2">
                        <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                          <input type="checkbox" checked={edu.in_progress} onChange={e => upField<Education>('education', edu.id, 'in_progress', e.target.checked)} className="rounded" />
                          Currently in progress
                        </label>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addEdu}
                  className="w-full border-2 border-dashed border-[#1A3C6E]/30 rounded-xl py-4 text-sm text-[#1A3C6E] hover:border-[#1A3C6E] hover:bg-[#1A3C6E]/5 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Education
                </button>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                  <strong>🎓 UAE Note:</strong> If your degree is from a non-English-speaking country, consider adding the QS World Ranking in brackets. UAE employers may require degree attestation from MOFA.
                </div>

                <div className="flex justify-between mt-2">
                  <button onClick={() => setActiveSection('experience')} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">← Back</button>
                  <button onClick={() => setActiveSection('skills')} className="flex items-center gap-1.5 bg-[#1A3C6E] text-white text-xs px-4 py-2 rounded-lg hover:opacity-90">
                    Next: Skills <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ── SKILLS ── */}
            {activeSection === 'skills' && (
              <div className="space-y-4">
                {/* Add skill */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-700 mb-3">Add Skills</p>
                  <div className="flex gap-2">
                    <select className={selCls + ' w-32 flex-shrink-0'} value={skillCat} onChange={e => setSkillCat(e.target.value as 'technical'|'soft'|'language')}>
                      <option value="technical">Technical</option>
                      <option value="soft">Soft Skill</option>
                      <option value="language">Language</option>
                    </select>
                    <input
                      className={inputCls + ' flex-1'}
                      value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addSkill()}
                      placeholder={skillCat === 'language' ? 'e.g. Arabic — Business Proficient' : skillCat === 'technical' ? 'e.g. Financial Modeling, Python, SAP' : 'e.g. Team Leadership'}
                    />
                    <button onClick={addSkill} className="bg-[#1A3C6E] text-white px-3 rounded-lg hover:opacity-90">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Skills by category */}
                  {(['technical','soft','language'] as const).map(cat => {
                    const catSkills = cv.skills.filter(s => s.category === cat);
                    if (!catSkills.length) return null;
                    return (
                      <div key={cat} className="mt-3">
                        <p className="text-[10px] font-semibold text-gray-500 uppercase mb-2">{cat === 'technical' ? 'Technical / Hard Skills' : cat === 'soft' ? 'Soft / Professional Skills' : 'Languages'}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {catSkills.map(skill => {
                            const isCliché = /team player|hard worker|passionate about|seeking/i.test(skill.name);
                            return (
                              <span key={skill.id} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${isCliché ? 'bg-red-50 border-red-300 text-red-700' : 'bg-blue-50 border-blue-200 text-[#1A3C6E]'}`}>
                                {isCliché && <AlertCircle className="w-3 h-3" />}
                                {skill.name}
                                <button onClick={() => removeSkill(skill.id)} className="ml-1 hover:opacity-70">
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* AI Suggestions */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-700">AI Skill Suggestions</p>
                    <AiButton onClick={runSkillSuggestions} loading={aiLoading} label="Suggest Skills for My Role" />
                  </div>
                  {skillSuggestions && (
                    <div className="space-y-3">
                      {(['technical_skills', 'soft_skills', 'certifications'] as const).map(key => {
                        const arr = (skillSuggestions[key] as string[] | undefined) || [];
                        if (!arr.length) return null;
                        const label = key === 'technical_skills' ? 'Technical Skills' : key === 'soft_skills' ? 'Soft Skills' : 'Relevant Certifications';
                        return (
                          <div key={key}>
                            <p className="text-[10px] font-semibold text-gray-500 mb-1.5">{label}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {arr.map((s: string) => {
                                const exists = cv.skills.some(sk => sk.name.toLowerCase() === s.toLowerCase());
                                return (
                                  <button
                                    key={s}
                                    disabled={exists}
                                    onClick={() => {
                                      if (!exists) {
                                        const cat = key === 'soft_skills' ? 'soft' : 'technical';
                                        setCv(prev => ({ ...prev, skills: [...prev.skills, { id: uid(), name: s, category: cat, proficiency: '' }] }));
                                      }
                                    }}
                                    className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${exists ? 'bg-emerald-50 border-emerald-200 text-emerald-600 cursor-default' : 'bg-white border-gray-300 text-gray-700 hover:border-[#1A3C6E] hover:text-[#1A3C6E]'}`}
                                  >
                                    {exists ? '✓ ' : '+ '}{s}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                      {skillSuggestions['ats_insight'] != null && (
                        <p className="text-xs text-gray-500 italic">{String(skillSuggestions['ats_insight'] as string)}</p>
                      )}
                    </div>
                  )}
                  {!skillSuggestions && (
                    <p className="text-xs text-gray-400">Add your most recent experience first, then click to get AI-powered skill suggestions for your role in the UAE market.</p>
                  )}
                </div>

                <div className="flex justify-between mt-2">
                  <button onClick={() => setActiveSection('education')} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">← Back</button>
                  <button onClick={() => setActiveSection('certifications')} className="flex items-center gap-1.5 bg-[#1A3C6E] text-white text-xs px-4 py-2 rounded-lg hover:opacity-90">
                    Next: Certifications <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ── CERTIFICATIONS ── */}
            {activeSection === 'certifications' && (
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800">
                  <strong>🏆 UAE High-Value Certifications:</strong> Finance (CFA, ACCA, CIMA) · PM (PMP, PRINCE2) · HSE (NEBOSH, IOSH) · IT (AWS, CISSP) · Healthcare (DHA/DOH License) · HR (CIPD, SHRM)
                </div>

                {cv.certifications.map((cert, idx) => {
                  const isExpiring = cert.expiry_date && new Date(cert.expiry_date) < new Date(Date.now() + 180 * 86400000);
                  const isExpired = cert.expiry_date && new Date(cert.expiry_date) < new Date();
                  return (
                    <div key={cert.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 border-b border-gray-100 px-4 py-2.5 flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-600">{cert.name || `Certification #${idx + 1}`}</span>
                        <div className="flex items-center gap-2">
                          {isExpired && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full">⚠️ Expired</span>}
                          {isExpiring && !isExpired && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Expiring Soon</span>}
                          <button onClick={() => removeCert(cert.id)} className="text-red-400 hover:text-red-600">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4 grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <Field label="Certification Name">
                            <input className={inputCls} value={cert.name} onChange={e => upField<Certification>('certifications', cert.id, 'name', e.target.value)} placeholder="e.g. NEBOSH General Certificate" />
                          </Field>
                        </div>
                        <Field label="Issuing Organisation">
                          <input className={inputCls} value={cert.issuer} onChange={e => upField<Certification>('certifications', cert.id, 'issuer', e.target.value)} placeholder="e.g. NEBOSH, PMI, CFA Institute" />
                        </Field>
                        <Field label="Status">
                          <select className={selCls} value={cert.status} onChange={e => upField<Certification>('certifications', cert.id, 'status', e.target.value)}>
                            {['Valid','In Progress','Renewal in Progress','Expired'].map(v => <option key={v}>{v}</option>)}
                          </select>
                        </Field>
                        <Field label="Date Obtained (Month YYYY)">
                          <input className={inputCls} value={cert.date_obtained} onChange={e => upField<Certification>('certifications', cert.id, 'date_obtained', e.target.value)} placeholder="Jun 2023" />
                        </Field>
                        <Field label="Expiry Date" note="Critical for safety, healthcare, finance certs">
                          <input className={inputCls} type="date" value={cert.expiry_date} onChange={e => upField<Certification>('certifications', cert.id, 'expiry_date', e.target.value)} />
                        </Field>
                        <Field label="Credential ID">
                          <input className={inputCls} value={cert.credential_id} onChange={e => upField<Certification>('certifications', cert.id, 'credential_id', e.target.value)} placeholder="Optional" />
                        </Field>
                        <Field label="Verify URL">
                          <input className={inputCls} value={cert.verify_url} onChange={e => upField<Certification>('certifications', cert.id, 'verify_url', e.target.value)} placeholder="credly.com/… or coursera.org/…" />
                        </Field>
                      </div>
                    </div>
                  );
                })}

                <button
                  onClick={addCert}
                  className="w-full border-2 border-dashed border-[#1A3C6E]/30 rounded-xl py-4 text-sm text-[#1A3C6E] hover:border-[#1A3C6E] hover:bg-[#1A3C6E]/5 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Certification
                </button>

                <div className="flex justify-between mt-2">
                  <button onClick={() => setActiveSection('skills')} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">← Back</button>
                  <button onClick={() => setActiveSection('projects')} className="flex items-center gap-1.5 bg-[#1A3C6E] text-white text-xs px-4 py-2 rounded-lg hover:opacity-90">
                    Next: Projects <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ── PROJECTS ── */}
            {activeSection === 'projects' && (
              <div className="space-y-4">
                {cv.projects.map((proj, idx) => (
                  <div key={proj.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 border-b border-gray-100 px-4 py-2.5 flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-600">{proj.name || `Project #${idx + 1}`}</span>
                      <button onClick={() => removeProject(proj.id)} className="text-red-400 hover:text-red-600">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <Field label="Project Name">
                          <input className={inputCls} value={proj.name} onChange={e => upField<Project>('projects', proj.id, 'name', e.target.value)} placeholder="e.g. E-Commerce Platform Redesign" />
                        </Field>
                      </div>
                      <div className="col-span-2">
                        <Field label="Description & Impact">
                          <textarea className={inputCls + ' resize-none h-20 text-xs'} value={proj.description} onChange={e => upField<Project>('projects', proj.id, 'description', e.target.value)} placeholder="Describe the project, your role, technologies used, and the business outcome achieved..." />
                        </Field>
                      </div>
                      <Field label="Your Role">
                        <input className={inputCls} value={proj.role} onChange={e => upField<Project>('projects', proj.id, 'role', e.target.value)} placeholder="e.g. Lead Developer, Project Manager" />
                      </Field>
                      <Field label="Team Size">
                        <select className={selCls} value={proj.team_size} onChange={e => upField<Project>('projects', proj.id, 'team_size', e.target.value)}>
                          <option value="">Select…</option>
                          {['Solo','2-5','6-20','20+'].map(v => <option key={v}>{v}</option>)}
                        </select>
                      </Field>
                      <Field label="Duration">
                        <input className={inputCls} value={proj.duration} onChange={e => upField<Project>('projects', proj.id, 'duration', e.target.value)} placeholder="e.g. 6 months, Q1 2024" />
                      </Field>
                      <Field label="Project URL / GitHub / Behance">
                        <input className={inputCls} value={proj.url} onChange={e => upField<Project>('projects', proj.id, 'url', e.target.value)} placeholder="https://…" />
                      </Field>
                      <div className="col-span-2">
                        <Field label="Key Outcome (quantified)">
                          <input className={inputCls} value={proj.outcome} onChange={e => upField<Project>('projects', proj.id, 'outcome', e.target.value)} placeholder="e.g. Increased conversion rate by 34%, served 12,000+ users" />
                        </Field>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addProject}
                  className="w-full border-2 border-dashed border-[#1A3C6E]/30 rounded-xl py-4 text-sm text-[#1A3C6E] hover:border-[#1A3C6E] hover:bg-[#1A3C6E]/5 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Project / Portfolio Item
                </button>

                <div className="flex justify-between mt-2">
                  <button onClick={() => setActiveSection('certifications')} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">← Back</button>
                  <button onClick={() => setActiveSection('export')} className="flex items-center gap-1.5 bg-[#FF6B35] text-white text-xs px-4 py-2 rounded-lg hover:opacity-90">
                    Go to AI Analysis & Export <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ── EXPORT & AI ANALYSIS ── */}
            {activeSection === 'export' && (
              <div className="space-y-4">
                {/* Template Selector */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2"><Eye className="w-3.5 h-3.5" /> Choose Template</p>
                  <div className="grid grid-cols-2 gap-2">
                    {TEMPLATES.map(tpl => (
                      <button
                        key={tpl.id}
                        onClick={() => setCv(prev => ({ ...prev, template: tpl.id }))}
                        className={`border rounded-xl p-3 text-left transition-all ${cv.template === tpl.id ? 'border-[#1A3C6E] bg-[#1A3C6E]/5 ring-2 ring-[#1A3C6E]/20' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-gray-800">{tpl.name}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${tpl.ats >= 95 ? 'bg-emerald-100 text-emerald-700' : tpl.ats >= 80 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                            ATS {tpl.ats}%
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500">{tpl.desc}</p>
                        <span className="text-[9px] text-gray-400">{tpl.category}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Analysis Tabs */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex border-b border-gray-100 overflow-x-auto">
                    {([
                      { id: 'ats', label: 'ATS Score', icon: <Target className="w-3 h-3" /> },
                      { id: 'match', label: 'Job Match', icon: <Zap className="w-3 h-3" /> },
                      { id: 'weak', label: 'Language', icon: <BookOpen className="w-3 h-3" /> },
                      { id: 'interview', label: 'Interview', icon: <Users className="w-3 h-3" /> },
                      { id: 'cover', label: 'Cover Letter', icon: <FileText className="w-3 h-3" /> },
                    ] as const).map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveAnalysisTab(tab.id)}
                        className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${activeAnalysisTab === tab.id ? 'border-[#1A3C6E] text-[#1A3C6E] bg-[#1A3C6E]/3' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                      >
                        {tab.icon} {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="p-4">
                    {/* ATS Score */}
                    {activeAnalysisTab === 'ats' && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs text-gray-600">Simulate how ATS systems (Workday, Taleo, Greenhouse) parse and score your CV.</p>
                          <AiButton onClick={runAtsScore} loading={aiLoading} label="Run ATS Analysis" />
                        </div>
                        {atsScore && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                              <div className={`text-3xl font-bold ${Number(atsScore.score) >= 80 ? 'text-emerald-600' : Number(atsScore.score) >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                                {String(atsScore.score)}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-700">ATS Compatibility Score</p>
                                <p className="text-xs text-gray-500">{String(atsScore.grade || '')}</p>
                              </div>
                            </div>

                            {(atsScore.section_scores as Record<string,number> | undefined) && (
                              <div>
                                <p className="text-xs font-semibold text-gray-600 mb-2">Section Breakdown</p>
                                {Object.entries(atsScore.section_scores as Record<string,number>).map(([k,v]) => (
                                  <ScoreBar key={k} label={k.charAt(0).toUpperCase() + k.slice(1)} value={v} />
                                ))}
                              </div>
                            )}

                            {((atsScore.recommendations as {priority: string; text: string}[] | undefined) ?? []).length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-gray-600 mb-2">Recommendations</p>
                                {(atsScore.recommendations as {priority: string; text: string}[]).map((r, i) => (
                                  <div key={i} className={`flex items-start gap-2 p-2 rounded-lg mb-1.5 text-xs ${r.priority === 'critical' ? 'bg-red-50 text-red-700' : r.priority === 'important' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                    {r.text}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Job Match */}
                    {activeAnalysisTab === 'match' && (
                      <div>
                        <Field label="Paste Job Description">
                          <textarea
                            className={inputCls + ' resize-none h-28 text-xs'}
                            value={jobDesc}
                            onChange={e => setJobDesc(e.target.value)}
                            placeholder="Paste the full job description here — AI will analyse your CV against every requirement and keyword..."
                          />
                        </Field>
                        <div className="flex items-center gap-2 mt-2">
                          <AiButton onClick={runJobMatch} loading={aiLoading} label="Analyse Match" />
                          <AiButton onClick={runCoverLetter} loading={aiLoading} label="Generate Cover Letter" />
                        </div>

                        {jobMatchResult && (
                          <div className="mt-3 space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                              <div className={`text-3xl font-bold ${Number(jobMatchResult.match_score) >= 80 ? 'text-emerald-600' : Number(jobMatchResult.match_score) >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                                {String(jobMatchResult.match_score)}%
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-700">Job Match Score</p>
                                <p className="text-xs text-gray-500">{String(jobMatchResult.summary || '')}</p>
                              </div>
                            </div>

                            {((jobMatchResult.keywords_missing as {kw: string; suggestion: string}[] | undefined) ?? []).length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-gray-600 mb-2">Missing Keywords</p>
                                {(jobMatchResult.keywords_missing as {kw: string; jd_importance?: string; suggestion: string}[]).map((kw, i) => (
                                  <div key={i} className="flex items-start gap-2 p-2 bg-red-50 rounded-lg mb-1 text-xs text-red-700">
                                    <X className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    <div><strong>{kw.kw}</strong> — {kw.suggestion}</div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {((jobMatchResult.tailoring_recommendations as {action: string; detail: string}[] | undefined) ?? []).length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-gray-600 mb-2">Tailoring Recommendations</p>
                                {(jobMatchResult.tailoring_recommendations as {priority: number; action: string; detail: string}[]).map((r, i) => (
                                  <div key={i} className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg mb-1 text-xs text-amber-700">
                                    <span className="w-4 h-4 bg-amber-500 text-white rounded-full flex items-center justify-center text-[9px] flex-shrink-0">{i+1}</span>
                                    <div><strong>{r.action}</strong> — {r.detail}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Weak Language */}
                    {activeAnalysisTab === 'weak' && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs text-gray-600">Scan your CV for clichés, weak verbs, passive voice, and overused phrases.</p>
                          <AiButton onClick={runWeakLang} loading={aiLoading} label="Scan CV Language" />
                        </div>
                        {weakLang && (
                          <div className="space-y-3">
                            {((weakLang.cliches as {phrase: string; count: number; suggestion: string}[] | undefined) ?? []).length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-red-600 mb-2">⚠️ Clichés Detected</p>
                                {(weakLang.cliches as {phrase: string; count: number; suggestion: string}[]).map((c, i) => (
                                  <div key={i} className="p-2 bg-red-50 border border-red-100 rounded-lg mb-1.5 text-xs">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-red-700">&quot;{c.phrase}&quot;</span>
                                      <span className="text-red-500">{c.count}x</span>
                                    </div>
                                    <p className="text-gray-600 mt-0.5">→ {c.suggestion}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            {((weakLang.weak_verbs as {phrase: string; suggestion: string}[] | undefined) ?? []).length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-amber-600 mb-2">💪 Upgrade These Verbs</p>
                                {(weakLang.weak_verbs as {phrase: string; suggestion: string}[]).map((v, i) => (
                                  <div key={i} className="p-2 bg-amber-50 border border-amber-100 rounded-lg mb-1.5 text-xs">
                                    <span className="font-medium text-amber-700">&quot;{v.phrase}&quot;</span>
                                    <span className="text-gray-600"> → {v.suggestion}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {weakLang.overall_language_score !== undefined && (
                              <div className="p-3 bg-gray-50 rounded-xl">
                                <p className="text-xs font-semibold text-gray-700 mb-2">Language Quality Score</p>
                                <ScoreBar label="Overall Language Power" value={Number(weakLang.overall_language_score)} />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Interview Prep */}
                    {activeAnalysisTab === 'interview' && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs text-gray-600">Predict interview questions based on your CV and prepare knockout answers.</p>
                          <AiButton onClick={runInterviewPrep} loading={aiLoading} label="Generate Interview Prep" />
                        </div>
                        {interviewPrep && (
                          <div className="space-y-4">
                            {((interviewPrep.certain_questions as {question: string; reason: string; prep_tip: string}[] | undefined) ?? []).length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-red-600 mb-2">🎯 Certain To Be Asked</p>
                                {(interviewPrep.certain_questions as {question: string; reason: string; prep_tip: string}[]).map((q, i) => (
                                  <div key={i} className="p-3 bg-red-50 border border-red-100 rounded-xl mb-2">
                                    <p className="text-xs font-semibold text-gray-800 mb-1">&quot;{q.question}&quot;</p>
                                    <p className="text-[10px] text-red-600 mb-1">Why: {q.reason}</p>
                                    <p className="text-[10px] text-gray-600">💡 {q.prep_tip}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            {((interviewPrep.strength_questions as {question: string; cv_evidence: string}[] | undefined) ?? []).length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-emerald-600 mb-2">✅ You&apos;ll Excel At</p>
                                {(interviewPrep.strength_questions as {question: string; cv_evidence: string}[]).map((q, i) => (
                                  <div key={i} className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl mb-2">
                                    <p className="text-xs font-semibold text-gray-800 mb-1">&quot;{q.question}&quot;</p>
                                    <p className="text-[10px] text-emerald-700">Evidence: {q.cv_evidence}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            {((interviewPrep.red_flags as {flag: string; question: string; mitigation: string}[] | undefined) ?? []).length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-amber-600 mb-2">⚠️ Red Flags Interviewers May Probe</p>
                                {(interviewPrep.red_flags as {flag: string; question: string; mitigation: string}[]).map((rf, i) => (
                                  <div key={i} className="p-3 bg-amber-50 border border-amber-100 rounded-xl mb-2">
                                    <p className="text-xs font-semibold text-amber-800 mb-1">Flag: {rf.flag}</p>
                                    <p className="text-xs text-gray-700 mb-1">&quot;{rf.question}&quot;</p>
                                    <p className="text-[10px] text-gray-600">Mitigation: {rf.mitigation}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Cover Letter */}
                    {activeAnalysisTab === 'cover' && (
                      <div>
                        {!jobDesc && (
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 mb-3">
                            Add a job description in the &quot;Job Match&quot; tab first for a tailored cover letter. Or generate a general one below.
                          </div>
                        )}
                        <AiButton onClick={runCoverLetter} loading={aiLoading} label="Generate Cover Letter" />
                        {coverLetter && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-semibold text-gray-700">Generated Cover Letter</p>
                              <button
                                onClick={() => navigator.clipboard.writeText(coverLetter)}
                                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-2 py-1 rounded-lg"
                              >
                                <Copy className="w-3 h-3" /> Copy
                              </button>
                            </div>
                            <textarea
                              className={inputCls + ' resize-none h-64 text-xs'}
                              value={coverLetter}
                              onChange={e => setCoverLetter(e.target.value)}
                            />
                            <p className="text-[10px] text-gray-400 mt-1">{coverLetter.split(' ').length} words · Edit as needed</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Export Buttons */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2"><Download className="w-3.5 h-3.5" /> Export CV</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={printCV}
                      className="flex items-center justify-center gap-2 bg-[#1A3C6E] text-white rounded-xl py-3 text-xs font-semibold hover:opacity-90 transition-opacity"
                    >
                      <Download className="w-3.5 h-3.5" /> PDF (Designed)
                    </button>
                    <button
                      onClick={printCV}
                      className="flex items-center justify-center gap-2 bg-emerald-600 text-white rounded-xl py-3 text-xs font-semibold hover:opacity-90 transition-opacity"
                    >
                      <Download className="w-3.5 h-3.5" /> PDF (ATS-Safe)
                    </button>
                    <button
                      onClick={() => {
                        const text = [cv.personal.full_name, cv.personal.professional_title, cv.personal.email, cv.personal.phone, '', cv.summary, '', ...cv.experience.flatMap(e => [e.job_title + ' — ' + e.company, ...e.bullets.map(b => '• ' + b.content)])].join('\n');
                        const a = document.createElement('a');
                        a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(text);
                        a.download = (cv.personal.full_name || 'cv') + '.txt';
                        a.click();
                      }}
                      className="flex items-center justify-center gap-2 border border-gray-200 text-gray-700 rounded-xl py-3 text-xs font-semibold hover:bg-gray-50 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" /> Plain Text (.txt)
                    </button>
                    <button
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cv, null, 2));
                        a.download = (cv.personal.full_name || 'cv') + '.json';
                        a.click();
                      }}
                      className="flex items-center justify-center gap-2 border border-gray-200 text-gray-700 rounded-xl py-3 text-xs font-semibold hover:bg-gray-50 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> JSON (Raw Data)
                    </button>
                  </div>
                  <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-800">
                    <strong>📋 Export Tip:</strong> Use &quot;ATS-Safe PDF&quot; when uploading to Workday/Taleo portals. Use &quot;Designed PDF&quot; when emailing a recruiter directly.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Preview ── */}
        <div className={`${previewOpen ? 'fixed inset-0 z-50 bg-white' : 'hidden md:flex'} md:w-96 flex-col border-l border-gray-200 bg-white flex-shrink-0`}>
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50">
            <span className="text-xs font-semibold text-gray-600">Live Preview</span>
            <div className="flex items-center gap-2">
              <ScoreBadge score={comp} />
              {previewOpen && (
                <button onClick={() => setPreviewOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <div id="cv-preview-content" className="transform scale-[0.85] origin-top">
              <CVPreview cv={cv} />
            </div>
          </div>
        </div>

        {/* ── AI CHAT PANEL ── */}
        {aiPanel === 'chat' && (
          <div className="fixed right-0 bottom-0 w-80 bg-white border-l border-t border-gray-200 shadow-xl z-40 flex flex-col h-[480px] rounded-tl-2xl">
            <div className="flex items-center justify-between px-4 py-3 bg-[#1A3C6E] rounded-tl-2xl">
              <div className="flex items-center gap-2 text-white">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-semibold">AI Career Council</span>
              </div>
              <button onClick={() => setAiPanel('hidden')} className="text-white/70 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-3 py-2 bg-[#1A3C6E]/5 border-b border-gray-100">
              <p className="text-[10px] text-gray-500">Ask anything: gap explanations, career changes, salary negotiations, UAE market advice...</p>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatHistory.length === 0 && (
                <div className="text-center py-6">
                  <Sparkles className="w-8 h-8 text-[#1A3C6E]/30 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">20 career experts are ready to help. Ask me anything about your CV.</p>
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${msg.role === 'user' ? 'bg-[#1A3C6E] text-white' : 'bg-gray-100 text-gray-800'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {aiLoading && chatHistory[chatHistory.length-1]?.role === 'user' && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-xl px-3 py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  </div>
                </div>
              )}
              <div ref={chatBottom} />
            </div>
            <div className="p-3 border-t border-gray-100">
              <div className="flex gap-2">
                <input
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]/20"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChat()}
                  placeholder="How do I explain my 6-month gap?"
                />
                <button onClick={sendChat} disabled={!chatInput.trim() || aiLoading} className="bg-[#1A3C6E] text-white px-3 rounded-lg hover:opacity-90 disabled:opacity-50">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

