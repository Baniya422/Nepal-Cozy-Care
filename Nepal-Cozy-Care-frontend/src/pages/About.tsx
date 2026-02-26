import Layout from "../components/layout/Layout";
import Hero from "../components/about/Hero";
import Stats from "../components/about/Stats";
import Story from "../components/about/Story";
import Mission from "../components/about/Mission";
import Values from "../components/about/Values";
import WhyChooseUs from "../components/about/WhyChooseUs";
import Team from "../components/about/Team";
import CTA from "../components/about/CTA";
import "../styles/about.css";

export default function About() {
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
