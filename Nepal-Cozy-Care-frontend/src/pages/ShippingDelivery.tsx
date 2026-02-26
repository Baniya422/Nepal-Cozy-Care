import Layout from "../components/layout/Layout";
import Hero from "../components/shipping/Hero";
import AboutServices from "../components/shipping/AboutServices";
import OurServices from "../components/shipping/OurServices";
import WhyChooseUs from "../components/shipping/WhyChooseUs";
import Testimonials from "../components/shipping/Testimonials";
import "../styles/shipping.css";

export default function ShippingDelivery() {
  return (
    <Layout>
      <Hero />
      <AboutServices />
      <OurServices />
      <WhyChooseUs />
      <Testimonials />
    </Layout>
  );
}
