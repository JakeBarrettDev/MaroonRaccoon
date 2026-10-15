"use client";

import { useState } from "react";
import { useForm, ValidationError } from "@formspree/react";
import { site } from "@/lib/site";

const projectTypes = [
  "Small business website",
  "Landing page",
  "Fixes + refresh",
  "Web app",
  "Something else",
];

const budgets = ["Under $1,000", "$1,000–$2,500", "$2,500+", "Not sure yet"];

const nextSteps = [
  "I reply with a few questions, usually within a day.",
  "We have a quick call about your goals.",
  "You get a fixed price and timeline before any work starts.",
];

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    projectType: "",
    budget: "",
    message: ""
  });

  // Formspree hook (replace with your form hashid)
  const [state, handleSubmit] = useForm("xgvggoza");

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Handle the _replyto field specially
    const fieldName = name === "_replyto" ? "email" : name;

    setFormData((prev) => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // If successful, show a nice confirmation state
  if (state.succeeded) {
    return (
      <main style={{ padding: "6rem 2rem", maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
        <span className="eyebrow">Message sent</span>
        <h1>
          Thanks — talk <span className="accent">soon.</span>
        </h1>
        <p style={{ fontSize: "1.15rem", color: "var(--text-muted)" }}>
          Your message is in my inbox and I&apos;ll get back to you shortly.
        </p>
      </main>
    );
  }

  return (
    <main className="contact-page">
      <div className="contact-main">
      <span className="eyebrow">Contact</span>
      <h1>
        Let&apos;s build <span className="accent">something.</span>
      </h1>
      <p style={{ fontSize: "1.15rem", marginBottom: "2.5rem", color: "var(--text-muted)" }}>
        Tell me about your project — you say the word, and I&apos;ll get to coding.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
      >
        {/* Optional: Honeypot anti-spam field */}
        <input
          type="text"
          name="_gotcha"
          tabIndex="-1"
          autoComplete="off"
          style={{ display: "none" }}
        />
        {/* Optional: override email subject in what Formspree sends you */}
        <input type="hidden" name="_subject" value={`Maroon Raccoon: ${formData.subject || "New message"}`} />

        <div className="form-field">
          <label htmlFor="name">Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            placeholder="Your name"
            value={formData.name}
            onChange={handleChange}
          />
          <ValidationError prefix="Name" field="name" errors={state.errors} />
        </div>

        <div className="form-field">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="_replyto"
            required
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
          />
          <ValidationError prefix="Email" field="_replyto" errors={state.errors} />
        </div>

        <div className="form-field">
          <label htmlFor="subject">Subject</label>
          <input
            type="text"
            id="subject"
            name="subject"
            placeholder="What's this about?"
            value={formData.subject}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="projectType">Project type</label>
            <select id="projectType" name="projectType" value={formData.projectType} onChange={handleChange}>
              <option value="">Choose one…</option>
              {projectTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="budget">Budget</label>
            <select id="budget" name="budget" value={formData.budget} onChange={handleChange}>
              <option value="">Choose one…</option>
              {budgets.map((budget) => (
                <option key={budget}>{budget}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="message">Message *</label>
          <textarea
            id="message"
            name="message"
            required
            rows="6"
            placeholder="Tell me about your project, timeline, and goals…"
            value={formData.message}
            onChange={handleChange}
          />
          <ValidationError prefix="Message" field="message" errors={state.errors} />
        </div>

        <button
          type="submit"
          disabled={state.submitting}
          className="cta-button"
          style={{
            cursor: state.submitting ? "not-allowed" : "pointer",
            opacity: state.submitting ? 0.7 : 1,
            alignSelf: "flex-start"
          }}
        >
          {state.submitting ? "Sending..." : "Send Message"}
        </button>

        {/* General (non-field-specific) errors */}
        <ValidationError errors={state.errors} />
      </form>
      </div>

      <aside className="contact-aside card">
        <h2>What happens next</h2>
        <ol className="contact-steps">
          {nextSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>

        <h2>Rather email?</h2>
        <p>
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </p>
        <p className="contact-links">
          <a href={site.founder.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href={site.founder.github} target="_blank" rel="noopener noreferrer">GitHub</a>
        </p>
      </aside>
    </main>
  );
}
