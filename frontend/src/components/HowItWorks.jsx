import Image from "next/image";
import Link from "next/link";

const steps = [
    {
        title: "Quick Call",
        text: "We talk through your goals, your audience, and what you need the site to do.",
        img: "/how-it-works/step1.png",
        alt: "Packet planning a project"
    },
    {
        title: "Quote & Timeline",
        text: "You get a clear package/price and a realistic timeline- no surprises.",
        img: "/how-it-works/step2.png",
        alt: "Packet sending a quote"
    },
    {
        title: "Design & Feedback",
        text: "I build the first version fast, then we refine it with your feedback.",
        img: "/how-it-works/step3.png",
        alt: "Packet reviewing design"
    },
    {
        title: "Launch & Handoff",
        text: "I deploy your new website, ensure it works on mobile, and show you what's next.",
        img: "/how-it-works/step4.png",
        alt: "Packet launching the project"
    }
];

export default function HowItWorks() {
    return (
        <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
            <div className="section-head">
                <span className="eyebrow">The process</span>
                <h2>How it works</h2>
                <p>Clear steps. No confusion. Just great websites.</p>
                <div className="tail-divider" aria-hidden="true" />
            </div>

            {/* All four steps at once, so nobody has to wait on a carousel */}
            <ol className="steps-grid">
                {steps.map((step, index) => (
                    <li key={step.title} className="step-card">
                        <div className="browser-frame">
                            <div className="browser-bar" aria-hidden="true">
                                <span /><span /><span />
                            </div>
                            <Image
                                src={step.img}
                                alt={step.alt}
                                width={600}
                                height={400}
                                sizes="(max-width: 768px) 90vw, 280px"
                                className="hitw-img"
                            />
                        </div>

                        <h3 className="step-title">
                            <span className="step-number">{index + 1}</span> {step.title}
                        </h3>
                        <p className="step-text">{step.text}</p>
                    </li>
                ))}
            </ol>

            <div style={{ marginTop: "2rem" }}>
                <Link href="/contact" className="cta-button">
                    Get a quote
                </Link>
            </div>
        </div>
    );
}
