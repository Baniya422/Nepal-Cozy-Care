import { useNavigate } from "react-router-dom";

// Our greenhouse in Kathmandu
const GARDEN_IMAGE = "/images/about-plants.jpg";

export default function OurGarden() {
  const navigate = useNavigate();

  return (
    <section className="info-section info-section-blue">
      <div className="info-content">
        <div className="info-text">
          <h2 className="info-title">Visit Our Greenhouse</h2>
          <p className="info-description">
            Step into our lush greenhouse in Kathmandu where we nurture over 200 varieties 
            of plants. From rare succulents to flowering beauties, each plant gets 
            personalized care before finding its forever home with you.
          </p>
          <button className="info-btn" onClick={() => navigate("/care-tips")}>
            Plant Care Tips
          </button>
        </div>
        <div className="info-image">
          <img
            src={GARDEN_IMAGE}
            alt="Our greenhouse in Kathmandu"
            onError={(e) => {
              // Hide if image not found
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      </div>
    </section>
  );
}
