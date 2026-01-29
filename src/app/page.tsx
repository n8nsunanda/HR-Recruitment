"use client";

import { useState, useRef } from "react";
import Image from "next/image";

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

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
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-slate-800">
            HR Recruitment & Consultant Services
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Candidate Registration
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-10">
        {/* Consultant Information Card – top */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-primary-50/50">
            <h2 className="text-lg font-semibold text-slate-800">
              Recruitment & Interview Support – Consultant Services
            </h2>
          </div>
          <div className="p-6 space-y-4 text-slate-700 text-sm">
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
          </div>
        </section>

        {/* Pay Registration Fee – top */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-semibold text-slate-800">
              Pay Registration Fee
            </h2>
          </div>
          <div className="p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-shrink-0 w-48 h-48 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden">
              <Image
                src="/phone-pe-img.png"
                alt="PhonePe QR Code"
                width={180}
                height={180}
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="text-center sm:text-left space-y-2">
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

      <footer className="border-t border-slate-200 mt-12 py-6 text-center text-sm text-slate-500">
        HR Recruitment & Consultant Services
      </footer>
    </div>
  );
}
