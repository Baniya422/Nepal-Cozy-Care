import { Link } from "react-router-dom";
import { Store, ArrowLeft } from "lucide-react";
import Layout from "../layout/Layout";
import SEO from "./SEO";

export default function MarketplaceDisabledNotice() {
  return (
    <Layout>
      <SEO title="Marketplace Currently Unavailable" noindex={true} />
      <div style={{ maxWidth: "600px", margin: "4rem auto", padding: "2rem", textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            padding: "1.25rem",
            borderRadius: "50%",
            backgroundColor: "#ecfdf5",
            color: "#059669",
            marginBottom: "1.5rem",
          }}
        >
          <Store size={40} />
        </div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#111827", marginBottom: "0.75rem" }}>
          Partner Marketplace Coming Soon
        </h1>
        <p style={{ color: "#4b5563", lineHeight: 1.6, marginBottom: "2rem" }}>
          Nepal Cozy Care is currently operating directly with our curated in-house plant catalog and nursery suppliers.
          Partner seller registrations and vendor shop pages are temporarily offline for our launch phase.
        </p>
        <Link
          to="/plants"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            backgroundColor: "#059669",
            color: "#ffffff",
            padding: "0.75rem 1.5rem",
            borderRadius: "0.5rem",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={16} /> Explore Cozy Care Plants
        </Link>
      </div>
    </Layout>
  );
}
