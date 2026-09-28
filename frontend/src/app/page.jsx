"use client";
import HomeHero from "../components/HomeHero";
import AboutSection from "../components/AboutSection";
import RevealMotion from "../components/RevealMotion";
import HowItWorks from "../components/HowItWorks";
import Marquee from "../components/Marquee";
import PawTrail from "../components/PawTrail";


export default function HomePage() {
  return (
    <main className="home-main">
      <div className="page-container">
        <HomeHero />
      </div>
      <div className="marquee-wrap">
        <Marquee />
      </div>
      <div className="page-container">
        <RevealMotion>
        <section style={{ padding: "2rem" }} id="about">
          <AboutSection />
        </section>
        </RevealMotion>
        <PawTrail />
        <RevealMotion>
        <section style={{ padding: "2rem" }} id="how-it-works">
          <HowItWorks />
        </section>
        </RevealMotion>
      </div>
    </main>
  );
}
