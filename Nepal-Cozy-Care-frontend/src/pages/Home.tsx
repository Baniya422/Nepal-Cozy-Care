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
import "../components/home/home.css";

export default function Home() {
  return (
    <Layout>
      <Hero />
      <Features />
      <SmartCareTools />
      <SeasonalCarePreview />
      <PopularItems />
      <ShopPlants />
      <BestSellers />
      <OurGarden />
      <OurGoal />
      <AboutUs />
    </Layout>
  );
}
