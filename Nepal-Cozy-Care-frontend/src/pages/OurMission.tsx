import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import { Link } from "react-router-dom";
import {
  applyOurMissionTemplate,
  ourMissionTemplate,
} from "../features/content/ourMissionTemplate";
import type { OurMissionTemplatePayload } from "../features/content/types";
import "../styles/our-mission.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";
const TEMPLATE_CACHE_KEY = "our_mission_template_v1";
const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT ?? "5000");

export default function OurMission() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setTemplateRevision] = useState(0);

  useEffect(() => {
    let isMounted = true;
    let hasCachedTemplate = false;

    const readCachedTemplate = (): OurMissionTemplatePayload | null => {
      try {
        const cached = localStorage.getItem(TEMPLATE_CACHE_KEY);
        if (!cached) return null;
        return JSON.parse(cached) as OurMissionTemplatePayload;
      } catch {
        return null;
      }
    };

    const cachedTemplate = readCachedTemplate();
    if (cachedTemplate) {
      applyOurMissionTemplate(cachedTemplate);
      hasCachedTemplate = true;
      setTemplateRevision((current) => current + 1);
      setLoading(false);
    }

    const loadTemplate = async () => {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS);

      try {
        const response = await fetch(`${API}/api/content-templates/our_mission`, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Could not load mission page content.");
        }

        const payload = await response.json().catch(() => ({}));
        const template = (payload?.data?.payload ?? null) as OurMissionTemplatePayload | null;
        applyOurMissionTemplate(template);
        localStorage.setItem(TEMPLATE_CACHE_KEY, JSON.stringify(template ?? {}));

        if (isMounted) {
          setTemplateRevision((current) => current + 1);
          setError(null);
          setLoading(false);
        }
      } catch (templateError) {
        if (isMounted) {
          if (!hasCachedTemplate) {
            setError(
              templateError instanceof DOMException && templateError.name === "AbortError"
                ? "Mission template request timed out. Check backend server."
                : templateError instanceof Error
                  ? templateError.message
                  : "Could not load mission page content."
            );
            setLoading(false);
          }
        }
      } finally {
        window.clearTimeout(timeoutId);
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
        <div className="mission-page">
          <section className="mission-hero">
            <div className="mission-hero-copy">
              <p className="mission-eyebrow">Loading...</p>
              <h1>Loading mission content</h1>
            </div>
          </section>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="mission-page">
          <section className="mission-story-section">
            <div className="mission-story-card">
              <p className="mission-section-kicker">Mission Page</p>
              <h2>Template unavailable</h2>
              <p>{error}</p>
            </div>
          </section>
        </div>
      </Layout>
    );
  }

  const hero = ourMissionTemplate.hero;
  const story = ourMissionTemplate.story;
  const pillarsSection = ourMissionTemplate.pillars_section;
  const supportSection = ourMissionTemplate.support_section;
  const vision = ourMissionTemplate.vision;
  const impact = ourMissionTemplate.impact;

  return (
    <Layout>
      <div className="mission-page">
        <section className="mission-hero">
          <div className="mission-hero-copy">
            <p className="mission-eyebrow">{hero.eyebrow}</p>
            <h1>{hero.title}</h1>
            <p className="mission-lead">{hero.lead}</p>
            <div className="mission-hero-actions">
              <Link to={hero.primary_cta.path} className="mission-btn mission-btn-primary">
                {hero.primary_cta.label}
              </Link>
              <Link to={hero.secondary_cta.path} className="mission-btn mission-btn-secondary">
                {hero.secondary_cta.label}
              </Link>
            </div>

            <div className="mission-highlight-grid">
              {hero.highlights.map((item) => (
                <article className="mission-highlight-card" key={item.label}>
                  <span className="mission-highlight-label">{item.label}</span>
                  <strong className="mission-highlight-value">{item.value}</strong>
                </article>
              ))}
            </div>
          </div>

          <div className="mission-hero-visual">
            <div className="mission-image-frame">
              <img
                src={hero.image}
                alt={hero.image_alt}
                className="mission-hero-image"
              />
              <div className="mission-floating-note mission-floating-note-top">
                {hero.floating_note_top}
              </div>
              <div className="mission-floating-note mission-floating-note-bottom">
                {hero.floating_note_bottom}
              </div>
            </div>
          </div>
        </section>

        <section className="mission-story-section">
          <div className="mission-story-card">
            <p className="mission-section-kicker">{story.kicker}</p>
            <h2>{story.title}</h2>
            <p>{story.description}</p>
            <ul className="mission-story-list">
              {story.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>

          <aside className="mission-quote-card">
            <p className="mission-quote-mark">"</p>
            <p className="mission-quote-text">{story.quote_text}</p>
            <span className="mission-quote-caption">{story.quote_caption}</span>
          </aside>
        </section>

        <section className="mission-pillar-section">
          <div className="mission-section-heading">
            <p className="mission-section-kicker">{pillarsSection.kicker}</p>
            <h2>{pillarsSection.title}</h2>
          </div>

          <div className="mission-pillars-grid">
            {pillarsSection.pillars.map((pillar) => (
              <article className="mission-pillar-card" key={pillar.title}>
                <span className="mission-pillar-eyebrow">{pillar.eyebrow}</span>
                <h3>{pillar.title}</h3>
                <p>{pillar.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mission-support-section">
          <div className="mission-section-heading">
            <p className="mission-section-kicker">{supportSection.kicker}</p>
            <h2>{supportSection.title}</h2>
          </div>

          <div className="mission-support-grid">
            {supportSection.steps.map((step) => (
              <article className="mission-support-card" key={step.step}>
                <span className="mission-support-step">{step.step}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mission-vision-section">
          <div className="mission-vision-card">
            <p className="mission-section-kicker">{vision.kicker}</p>
            <h2>{vision.title}</h2>
            <p>{vision.description}</p>
          </div>

          <div className="mission-impact-card">
            <p className="mission-section-kicker">{impact.kicker}</p>
            <h2>{impact.title}</h2>
            <ul>
              {impact.goals.map((goal) => (
                <li key={goal}>{goal}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </Layout>
  );
}
