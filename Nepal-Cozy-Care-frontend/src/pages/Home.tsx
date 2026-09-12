import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import Hero from "../components/home/Hero";
import Features from "../components/home/Features";
import SmartCareTools from "../components/home/SmartCareTools";
import SeasonalCarePreview from "../components/home/SeasonalCarePreview";
import PopularItems from "../components/home/PopularItems";
import ShopPlants from "../components/home/ShopPlants";
import BestSellers from "../components/home/BestSellers";
import OurGarden from "../components/home/OurGarden";
import OurGoal from "../components/home/OurGoal";
import AboutUs from "../components/home/AboutUs";
import {
  defaultHomepageContent,
  type HomepageContent,
} from "../features/homepage/content";
import "../components/home/home.css";
const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";
export default function Home() {
  const [content, setContent] = useState<HomepageContent>(defaultHomepageContent);
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`${API}/api/homepage/content`);
        const data = await response.json().catch(() => ({}));
        if (response.ok && data.data?.payload) {
          setContent(data.data.payload as HomepageContent);
        }
      } catch (error) {
        console.error("Could not load homepage content:", error);
      }
    };
    void fetchContent();
  }, []);
  return (
    <Layout>
      <Hero content={content.hero} />
      <Features items={content.features} />
      <SmartCareTools content={content.smart_tools} />
      <SeasonalCarePreview content={content.seasonal} />
      <PopularItems content={content.product_sections.popular} />
      <ShopPlants content={content.product_sections.shop} />
      <BestSellers content={content.product_sections.best_sellers} />
      <OurGarden content={content.garden} />
      <OurGoal content={content.mission} />
      <AboutUs content={content.about} />
    </Layout>
  );
}
