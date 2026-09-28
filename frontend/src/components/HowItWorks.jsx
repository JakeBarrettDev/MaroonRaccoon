"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function HowItWorks() {
    // STATE: Which card index are we showing? (0, 1, 2, or 3)
    const [activeIndex, setActiveIndex] = useState(0);
    
    // STATE: Did the user manually interact? (stops auto-play)
    const [isPaused, setIsPaused] = useState(false);

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

    useEffect(() => {
        if (isPaused) return;

        const timer = setInterval(() => {
            setActiveIndex((current) => {
                return current === steps.length - 1 ? 0 : current + 1;
            });
        }, 4000);

        return () => clearInterval(timer);
    }, [isPaused, steps.length]);

    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);


    const handleTouchStart = (e) => {
        setTouchStart(e.touches[0].clientX);
    };

    const handleTouchMove = (e) => {
        setTouchEnd(e.touches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (touchStart - touchEnd > 75) {
            setActiveIndex((current) => 
                current === steps.length - 1 ? 0 : current + 1
            );
            setIsPaused(true); // User took control, pause auto-play
        }

        // Swipe right (previous card)
        if (touchStart - touchEnd < -75) {
            setActiveIndex((current) => 
                current === 0 ? steps.length - 1 : current - 1
            );
            setIsPaused(true);
        }
    };

    return (
        <div style={{maxWidth: "1000px", margin: "0 auto", textAlign: "center" }}>
            <div className="section-head">
                <span className="eyebrow">The process</span>
                <h2>How it works</h2>
                <p>Clear steps. No confusion. Just great websites.</p>
                <div className="tail-divider" aria-hidden="true" />
            </div>

            {/* CAROUSEL CONTAINER */}
            <div 
                className="carousel-container"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {steps.map((step, index) => (
                    <div
                        key={step.title}
                        className={`carousel-card ${index === activeIndex ? 'active' : ''}`}
                    >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, marginBottom: "1rem", fontSize: "1.4rem", fontFamily: "var(--font-heading)" }}>
                            <span className="step-number">{index + 1}</span> {step.title}
                        </div>

                        <div className="browser-frame">
                            <div className="browser-bar" aria-hidden="true">
                                <span /><span /><span />
                            </div>
                            <Image
                                src={step.img}
                                alt={step.alt}
                                width={600}
                                height={400}
                                className="hitw-img"
                                priority={index === 0}
                            />
                        </div>

                        <div style={{ color: "var(--text-muted)", lineHeight: "1.6", fontSize: "1.1rem", marginTop: "1rem" }}>
                            {step.text}
                        </div>
                    </div>
                ))}
            </div>

            {/* NAVIGATION DOTS */}
            <div className="carousel-dots">
                {steps.map((_, index) => (
                    <button
                        key={index}
                        className={`carousel-dot ${index === activeIndex ? 'active' : ''}`}
                        onClick={() => {
                            setActiveIndex(index);
                            setIsPaused(true); // User clicked, pause auto-play
                        }}
                        aria-label={`Go to step ${index + 1}`}
                    />
                ))}
            </div>

            <div style={{ marginTop: "2rem"}}>
                <Link href="/contact" style={{ textDecoration: "underline" }}>
                    Ready to get started? Contact me →
                </Link>
            </div>
        </div>
    );
}