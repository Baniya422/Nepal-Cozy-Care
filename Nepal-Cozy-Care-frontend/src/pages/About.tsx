import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import Hero from "../components/about/Hero";
import Stats from "../components/about/Stats";
import Story from "../components/about/Story";
import Mission from "../components/about/Mission";
import Values from "../components/about/Values";
import WhyChooseUs from "../components/about/WhyChooseUs";
import Team from "../components/about/Team";
import CTA from "../components/about/CTA";
import {
  aboutPageTemplate,
  applyAboutPageTemplate,
} from "../features/content/aboutTemplate";
import type { AboutPageTemplatePayload } from "../features/content/types";
import "../styles/about.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function About() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setTemplateRevision] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadTemplate = async () => {
      try {
        const response = await fetch(`${API}/api/content-templates/about_page`, {
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Could not load about page content.");
        }

        const payload = await response.json().catch(() => ({}));
        const template = (payload?.data?.payload ?? null) as AboutPageTemplatePayload | null;
        applyAboutPageTemplate(template);

        if (isMounted) {
          setTemplateRevision((current) => current + 1);
          setError(null);
        }
      } catch (templateError) {
        if (isMounted) {
          setError(
            templateError instanceof Error
              ? templateError.message
              : "Could not load about page content."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadTemplate();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="about-page">
          <section className="about-hero">
            <div className="about-hero-overlay"></div>
            <div className="about-hero-content">
              <h1 className="about-hero-title">Loading About Content...</h1>
            </div>
          </section>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="about-page">
          <section className="about-hero">
            <div className="about-hero-overlay"></div>
            <div className="about-hero-content">
              <h1 className="about-hero-title">Template unavailable</h1>
              <p className="about-hero-subtitle">{error}</p>
            </div>
          </section>
        </div>
      </Layout>
    );
  }

  if (!aboutPageTemplate.hero.title) {
    return (
      <Layout>
        <div className="about-page">
          <section className="about-hero">
            <div className="about-hero-overlay"></div>
            <div className="about-hero-content">
              <h1 className="about-hero-title">No content available</h1>
            </div>
          </section>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="about-page">
        <Hero />
        <Stats />
        <Story />
        <Mission />
        <Values />
        <WhyChooseUs />
        <Team />
        <CTA />
      </div>
    </Layout>
  );
}

