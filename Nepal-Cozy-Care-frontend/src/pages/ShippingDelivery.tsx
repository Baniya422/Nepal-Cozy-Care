import Layout from "../components/layout/Layout";
import Hero from "../components/shipping/Hero";
import AboutServices from "../components/shipping/AboutServices";
import OurServices from "../components/shipping/OurServices";
import WhyChooseUs from "../components/shipping/WhyChooseUs";
import Testimonials from "../components/shipping/Testimonials";
import "../styles/shipping.css";
import { defaultShippingContent, useContentTemplate } from "../features/page-content/templates";
export default function ShippingDelivery() {
  const content = useContentTemplate("shipping_page", defaultShippingContent);
  return (
    <Layout>
      <Hero content={content.hero} />
      <AboutServices content={content.about} />
      <OurServices content={content.delivery} />
      <WhyChooseUs content={content.benefits} />
      <Testimonials content={content.testimonials} />
    </Layout>
  );
}
