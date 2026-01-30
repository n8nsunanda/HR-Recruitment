"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { AdSenseBlock } from "@/components/AdSense";

interface Recommendation {
  author: string;
  text: string;
  date: string;
}

/** Consultant Services content from sheet (ConsultantInfo tab). Keys: title, description, charges, notes, disclaimer */
interface ConsultantContent {
  title?: string;
  description?: string;
  charges?: string;
  notes?: string;
  disclaimer?: string;
}

/** Turn literal \n from sheet into real newlines for display */
function lineBreaks(s: string): string {
  return s.replace(/\\n/g, "\n");
}

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [linkedInProfileUrl, setLinkedInProfileUrl] = useState<string | null>(null);
  const [recSlideIndex, setRecSlideIndex] = useState(0);
  const [consultantContent, setConsultantContent] = useState<ConsultantContent | null>(null);

  useEffect(() => {
    fetch("/api/recommendations")
      .then((res) => res.json())
      .then((data) => {
        setRecommendations(Array.isArray(data.recommendations) ? data.recommendations : []);
        setLinkedInProfileUrl(data.linkedInProfileUrl ?? null);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/consultant-content")
      .then((res) => res.json())
      .then((data) => {
        const hasAny = [data.title, data.description, data.charges, data.notes, data.disclaimer].some(
          (v: string) => typeof v === "string" && v.trim().length > 0
        );
        setConsultantContent(hasAny ? data : null);
      })
      .catch(() => {});
  }, []);

  // Auto-advance recommendations slider every 5s
  useEffect(() => {
    if (recommendations.length <= 1) return;
    const t = setInterval(() => {
      setRecSlideIndex((i) => (i + 1) % recommendations.length);
    }, 5000);
    return () => clearInterval(t);
  }, [recommendations.length]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    const form = formRef.current;
    if (!form) return;
    const formData = new FormData(form);
    const fullName = (formData.get("fullName") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    const mobile = (formData.get("mobile") as string)?.trim();
    const file = formData.get("resume") as File | null;
    if (!fullName || !email || !mobile) {
      setMessage({ type: "error", text: "Please fill required fields: Name, Email, Mobile." });
      return;
    }
    if (!file?.size) {
      setMessage({ type: "error", text: "Please upload a resume (PDF or DOCX)." });
      return;
    }
    const ext = file.name.toLowerCase().slice(-4);
    if (ext !== ".pdf" && ext !== "docx") {
      setMessage({ type: "error", text: "Resume must be PDF or DOCX only." });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/submit-candidate", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Registration failed." });
        return;
      }
      setMessage({ type: "success", text: data.message ?? "Registration successful. We will get in touch soon." });
      form.reset();
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-primary-700/20 bg-gradient-to-r from-primary-600 to-primary-700 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-white">
            HR Recruitment & Consultant Services
          </h1>
          <p className="text-sm text-primary-100 mt-0.5">
            Candidate Registration
          </p>
        </div>
      </header>

      {/* LinkedIn Recommendations – full-width band (like header) */}
      {(recommendations.length > 0 || linkedInProfileUrl) && (
        <section className="w-full border-b border-slate-200 bg-gradient-to-r from-primary-600/15 via-primary-500/10 to-primary-600/15 shadow-sm">
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h2 className="text-lg md:text-xl font-semibold text-slate-800 flex items-center gap-2">
                <span className="text-primary-600">LinkedIn</span> Recommendations
              </h2>
              {linkedInProfileUrl && (
                <a
                  href={linkedInProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
                >
                  View on LinkedIn →
                </a>
              )}
            </div>
            {recommendations.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">
                View my LinkedIn profile for recommendations.
              </p>
            ) : (
              <>
                <div className="relative min-h-[120px] md:min-h-[140px] flex items-center justify-center w-full">
                  {recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className={`absolute inset-0 flex items-center justify-center px-2 transition-all duration-500 ease-in-out ${
                        i === recSlideIndex
                          ? "opacity-100 translate-x-0"
                          : i < recSlideIndex
                            ? "opacity-0 -translate-x-8"
                            : "opacity-0 translate-x-8"
                      }`}
                    >
                      <blockquote className="text-center max-w-3xl mx-auto w-full">
                        <p className="text-slate-700 text-base md:text-lg lg:text-xl leading-relaxed italic">
                          &ldquo;{rec.text}&rdquo;
                        </p>
                        <footer className="mt-4 text-slate-600 text-sm md:text-base font-medium">
                          — {rec.author}
                          {rec.date ? (
                            <span className="text-slate-400 font-normal"> · {rec.date}</span>
                          ) : null}
                        </footer>
                      </blockquote>
                    </div>
                  ))}
                </div>
                {recommendations.length > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-6">
                    <button
                      type="button"
                      onClick={() =>
                        setRecSlideIndex((i) =>
                          i === 0 ? recommendations.length - 1 : i - 1
                        )
                      }
                      className="rounded-full p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-100/50 transition-colors"
                      aria-label="Previous recommendation"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className="flex gap-1.5">
                      {recommendations.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setRecSlideIndex(i)}
                          className={`h-2 rounded-full transition-all ${
                            i === recSlideIndex
                              ? "w-6 bg-primary-600"
                              : "w-2 bg-slate-300 hover:bg-slate-400"
                          }`}
                          aria-label={`Go to recommendation ${i + 1}`}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setRecSlideIndex((i) => (i + 1) % recommendations.length)
                      }
                      className="rounded-full p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-100/50 transition-colors"
                      aria-label="Next recommendation"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">
        <aside className="hidden lg:block w-72 flex-shrink-0 order-2 lg:order-1">
          <div className="lg:sticky lg:top-24">
            <AdSenseBlock slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEFT} />
          </div>
        </aside>
        <main className="flex-1 min-w-0 max-w-4xl mx-auto lg:mx-0 space-y-10 order-1 lg:order-2">
        {/* Consultant Information Card – content from sheet (ConsultantInfo tab) or fallback */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-primary-50/50">
            <h2 className="text-lg font-semibold text-slate-800">
              {consultantContent?.title?.trim() || "Recruitment & Interview Support – Consultant Services"}
            </h2>
          </div>
          <div className="p-6 space-y-4 text-slate-700 text-sm">
            {consultantContent ? (
              <>
                {consultantContent.description?.trim() && (
                  <p className="whitespace-pre-line">{lineBreaks(consultantContent.description.trim())}</p>
                )}
                {consultantContent.charges?.trim() && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                    <h3 className="font-semibold text-slate-800">Charges</h3>
                    <div className="space-y-2 text-slate-600 whitespace-pre-line">
                      {lineBreaks(consultantContent.charges.trim())}
                    </div>
                  </div>
                )}
                {consultantContent.notes?.trim() && (
                  <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                    {lineBreaks(consultantContent.notes.trim())
                      .split(/\r?\n/)
                      .filter((line) => line.trim())
                      .map((line, i) => (
                        <li key={i}>{line.trim()}</li>
                      ))}
                  </ul>
                )}
                {consultantContent.disclaimer?.trim() && (
                  <p className="text-slate-600 italic border-l-2 border-primary-300 pl-3">
                    {lineBreaks(consultantContent.disclaimer.trim())}
                  </p>
                )}
              </>
            ) : (
              <>
                <p>
                  I am an independent recruitment consultant. I provide interview opportunities, job referrals, CV circulation, and LinkedIn job applications support based on candidate profile and experience.
                </p>
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                  <h3 className="font-semibold text-slate-800">Charges</h3>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-x-2">
                      <span className="font-medium text-slate-800">Registration Fee: ₹1000 (Non-Refundable)</span>
                    </div>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5 ml-2">
                      <li>₹500 → CV processing, LinkedIn job applications & lead sharing</li>
                      <li>₹500 → Interview scheduling & negotiation support</li>
                    </ul>
                    <div className="pt-1">
                      <span className="font-medium text-slate-800">After Selection:</span>
                      <span className="ml-1 text-slate-600">25% of first salary (after receiving the first salary)</span>
                    </div>
                  </div>
                </div>
                <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                  <li>Charges are negotiable</li>
                  <li>Please check LinkedIn recommendations</li>
                  <li>CV circulation depends on profile quality</li>
                  <li>Registration fee is non-refundable</li>
                  <li>I will apply from my side, but selection depends on candidate CV</li>
                </ul>
                <p className="text-slate-600 italic border-l-2 border-primary-300 pl-3">
                  This fee is for my professional work effort and services.
                </p>
              </>
            )}
          </div>
        </section>

        {/* Pay Registration Fee – top */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-semibold text-slate-800">
              Pay Registration Fee
            </h2>
          </div>
          <div className="p-6 flex flex-col items-center justify-center text-center">
            <div className="flex-shrink-0 w-56 min-h-[280px] rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden mx-auto p-2">
              <Image
                src="/phone-pe-img.png"
                alt="PhonePe QR Code"
                width={240}
                height={280}
                className="object-contain w-full h-full max-h-[280px]"
                unoptimized
              />
            </div>
            <div className="mt-4 space-y-2">
              <p className="font-medium text-slate-800">
                Scan the QR code to pay registration fees
              </p>
              <p className="text-sm text-slate-500">
                Payment confirmation may be requested by HR.
              </p>
            </div>
          </div>
        </section>

        {/* Candidate Registration Form */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-semibold text-slate-800">
              Candidate Registration
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Fill in your details and upload your resume (PDF or DOCX only).
            </p>
          </div>
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="p-6 space-y-5"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-slate-700 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="10-digit mobile"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-1">
                  City <span className="text-slate-400">(optional)</span>
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Your city"
                />
              </div>
              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-slate-700 mb-1">
                  Experience <span className="text-slate-400">(optional)</span>
                </label>
                <select
                  id="experience"
                  name="experience"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Select experience</option>
                  <option value="Fresher">Fresher</option>
                  <option value="0-1 years">0-1 years</option>
                  <option value="1-3 years">1-3 years</option>
                  <option value="3-5 years">3-5 years</option>
                  <option value="5-10 years">5-10 years</option>
                  <option value="10+ years">10+ years</option>
                </select>
              </div>
              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-slate-700 mb-1">
                  Skills <span className="text-slate-400">(optional, max 200 characters)</span>
                </label>
                <input
                  id="skills"
                  name="skills"
                  type="text"
                  maxLength={200}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="e.g. .NET Core, SQL, React"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="shortNote" className="block text-sm font-medium text-slate-700 mb-1">
                  Short note <span className="text-slate-400">(optional, about 30–40 words, max 300 characters)</span>
                </label>
                <textarea
                  id="shortNote"
                  name="shortNote"
                  rows={3}
                  maxLength={300}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="A brief note about your background or what you are looking for. Plain text only; no links or file paths."
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="resume" className="block text-sm font-medium text-slate-700 mb-1">
                  Resume (PDF / DOCX) <span className="text-red-500">*</span>
                </label>
                <input
                  id="resume"
                  name="resume"
                  type="file"
                  required
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 file:mr-3 file:rounded-md file:border-0 file:bg-primary-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
            {message && (
              <div
                className={`rounded-lg px-4 py-3 text-sm ${
                  message.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {message.text}
              </div>
            )}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting…" : "Submit Registration"}
              </button>
            </div>
          </form>
        </section>
        </main>
        <aside className="hidden lg:block w-72 flex-shrink-0 order-3">
          <div className="lg:sticky lg:top-24">
            <AdSenseBlock slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_RIGHT} />
          </div>
        </aside>
      </div>

      <div className="w-full border-t border-slate-200 pt-6 pb-2">
        <div className="max-w-4xl mx-auto px-4 flex justify-center">
          <AdSenseBlock slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM} />
        </div>
      </div>

      <footer className="border-t border-slate-200 mt-6 py-6 text-center text-sm text-slate-500">
        HR Recruitment & Consultant Services
      </footer>
    </div>
  );
}
