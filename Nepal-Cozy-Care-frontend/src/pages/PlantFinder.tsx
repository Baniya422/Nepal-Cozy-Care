import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import "../styles/plantfinder.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

type Plant = {
  id: number;
  name: string;
  price: number;
  image?: string;
  avg_rating?: number;
};

export function PlantFinder() {
  const navigate = useNavigate();
  const [room, setRoom] = useState("");
  const [light, setLight] = useState("");
  const [quantity, setQuantity] = useState("");
  const [experience, setExperience] = useState("");
  const [location, setLocation] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [recommendedPlants, setRecommendedPlants] = useState<Plant[]>([]);
  const [morePlants, setMorePlants] = useState<Plant[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Fetch recommended plants based on criteria
    try {
      const response = await fetch(`${API}/api/plants?per_page=6`);
      const data = await response.json();
      const plants = data.data.data || [];
      
      // Split into recommended (first 3) and more options (next 3)
      setRecommendedPlants(plants.slice(0, 3));
      setMorePlants(plants.slice(3, 6));
      setShowResults(true);
    } catch (error) {
      console.error("Error fetching plants:", error);
    }
  };

  const handleStartOver = () => {
    setRoom("");
    setLight("");
    setQuantity("");
    setExperience("");
    setLocation("");
    setShowResults(false);
    setRecommendedPlants([]);
    setMorePlants([]);
  };

  return (
    <Layout>
      <div className="plantfinder-page">
        {/* Quiz Section */}
        <section className="plantfinder-quiz">
          <div className="plantfinder-quiz-container">
            <div className="plantfinder-quiz-content">
              <p className="plantfinder-subtitle">I'm on the hunt for a green gift &gt;</p>
              <h1 className="plantfinder-title">Find your perfect match !</h1>
              
              <form onSubmit={handleSubmit} className="plantfinder-form">
                <div className="plantfinder-question">
                  <span>My chosen plant will live in: </span>
                  <select 
                    value={room} 
                    onChange={(e) => setRoom(e.target.value)}
                    required
                    className="plantfinder-select"
                  >
                    <option value="">_______</option>
                    <option value="bedroom">Bedroom</option>
                    <option value="living-room">Living Room</option>
                    <option value="kitchen">Kitchen</option>
                    <option value="bathroom">Bathroom</option>
                    <option value="office">Office</option>
                    <option value="balcony">Balcony</option>
                  </select>
                  <span>. In that room, there is </span>
                  <select 
                    value={light} 
                    onChange={(e) => setLight(e.target.value)}
                    required
                    className="plantfinder-select"
                  >
                    <option value="">_______</option>
                    <option value="bright-light">Bright Light</option>
                    <option value="medium-light">Medium Light</option>
                    <option value="low-light">Low Light</option>
                    <option value="indirect-light">Indirect Light</option>
                  </select>
                  <span>. I'm looking for </span>
                  <select 
                    value={quantity} 
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                    className="plantfinder-select"
                  >
                    <option value="">_______</option>
                    <option value="1">One</option>
                    <option value="2-3">2-3</option>
                    <option value="4-5">4-5</option>
                    <option value="more">More than 5</option>
                  </select>
                  <span> plants. My experience level: </span>
                  <select 
                    value={experience} 
                    onChange={(e) => setExperience(e.target.value)}
                    required
                    className="plantfinder-select"
                  >
                    <option value="">_______</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                  </select>
                  <span>. In my home </span>
                  <select 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    className="plantfinder-select"
                  >
                    <option value="">_______</option>
                    <option value="dry">it's usually dry</option>
                    <option value="humid">it's usually humid</option>
                    <option value="normal">it's normal humidity</option>
                  </select>
                  <span>.</span>
                </div>

                <button type="submit" className="plantfinder-submit-btn">
                  MEET YOUR MATCHES
                </button>
                
                {showResults && (
                  <button 
                    type="button" 
                    onClick={handleStartOver}
                    className="plantfinder-startover"
                  >
                    Start over
                  </button>
                )}
              </form>
            </div>
            <div className="plantfinder-quiz-image">
              {/* Placeholder for image */}
              <div className="plantfinder-placeholder-image"></div>
            </div>
          </div>
        </section>

        {/* Results Section */}
        {showResults && (
          <>
            {/* Winners Section */}
            <section className="plantfinder-results">
              <h2 className="plantfinder-results-title">And the winners are..</h2>
              <div className="plantfinder-grid">
                {recommendedPlants.map((plant) => (
                  <div 
                    key={plant.id} 
                    className="plantfinder-card"
                    onClick={() => navigate(`/plants/${plant.id}`)}
                  >
                    <img
                      src={plant.image ? `${API}/storage/${plant.image}` : "/images/placeholder-plant.jpg"}
                      alt={plant.name}
                      className="plantfinder-card-image"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* More Options Section */}
            <section className="plantfinder-more">
              <h2 className="plantfinder-more-title">But we have a lot more in store for you:</h2>
              <div className="plantfinder-grid">
                {morePlants.map((plant) => (
                  <div 
                    key={plant.id} 
                    className="plantfinder-card"
                    onClick={() => navigate(`/plants/${plant.id}`)}
                  >
                    <img
                      src={plant.image ? `${API}/storage/${plant.image}` : "/images/placeholder-plant.jpg"}
                      alt={plant.name}
                      className="plantfinder-card-image"
                    />
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </Layout>
  );
}
