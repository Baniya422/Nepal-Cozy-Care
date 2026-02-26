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
  const [experience, setExperience] = useState("");
  const [location, setLocation] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [recommendedPlants, setRecommendedPlants] = useState<Plant[]>([]);
  const [morePlants, setMorePlants] = useState<Plant[]>([]);

  // Helper function to normalize plant data
  const normalizePlants = (plants: any[]): Plant[] => {
    return plants.map((plant: any) => ({
      ...plant,
      price: typeof plant.price === "string" ? parseFloat(plant.price) : plant.price || 0,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Map filter values to API parameters
      const lightMap: Record<string, string> = {
        "bright-light": "Bright Light",
        "medium-light": "Medium Light",
        "low-light": "Low Light",
        "indirect-light": "Indirect Light",
      };

      const difficultyMap: Record<string, string> = {
        "beginner": "Easy",
        "intermediate": "Medium",
        "expert": "Hard",
      };

      const humidityMap: Record<string, string> = {
        "dry": "Dry",
        "humid": "Humid",
        "normal": "Normal",
      };

      // Map room values to match database format
      const roomMap: Record<string, string> = {
        "bedroom": "Bedroom",
        "living-room": "Living Room",
        "kitchen": "Kitchen",
        "bathroom": "Bathroom",
        "office": "Office",
        "balcony": "Balcony",
      };

      // Fetch all plants
      const allPlantsResponse = await fetch(`${API}/api/plants?per_page=100`);
      const allPlantsData = await allPlantsResponse.json();
      let allPlants = normalizePlants(allPlantsData.data?.plants || allPlantsData.data?.data || allPlantsData.data || []);

      // Filter plants based on all criteria (both API and client-side filters)
      let filteredPlants = allPlants.filter((plant: any) => {
        // Filter by light (API already filtered by this, but check anyway)
        if (light) {
          const lightValue = lightMap[light];
          if (plant.light !== lightValue) return false;
        }
        
        // Filter by difficulty (API already filtered by this, but check anyway)
        if (experience) {
          const diffValue = difficultyMap[experience];
          if (plant.difficulty !== diffValue) return false;
        }
        
        // Filter by humidity (API already filtered by this, but check anyway)
        if (location) {
          const humidityValue = humidityMap[location];
          if (plant.humidity !== humidityValue) return false;
        }

        // Client-side filter: room
        if (room) {
          const roomValue = roomMap[room];
          if (!plant.rooms || (Array.isArray(plant.rooms) && !plant.rooms.includes(roomValue)) || (typeof plant.rooms === 'string' && plant.rooms !== roomValue)) {
            return false;
          }
        }

        return true;
      });

      // Set recommended plants (top 3 from filtered)
      if (filteredPlants.length === 0) {
        setRecommendedPlants([]);
        // If no filtered results, show some from all plants
        setMorePlants(allPlants.slice(0, 6));
      } else {
        setRecommendedPlants(filteredPlants.slice(0, 3));
        // Show remaining plants that didn't match
        const filteredIds = new Set(filteredPlants.map((p: any) => p.id));
        const remainingPlants = allPlants.filter((p: any) => !filteredIds.has(p.id));
        setMorePlants(remainingPlants.slice(0, 6));
      }
      
      setShowResults(true);
    } catch (error) {
      console.error("Error fetching plants:", error);
      setRecommendedPlants([]);
      setMorePlants([]);
      setShowResults(true);
    }
  };

  const handleStartOver = () => {
    setRoom("");
    setLight("");
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
                  <span>. My experience level: </span>
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
              {recommendedPlants.length > 0 ? (
                <div className="plantfinder-grid">
                  {recommendedPlants.map((plant) => (
                    <div 
                      key={plant.id} 
                      className="plantfinder-card"
                      onClick={() => navigate(`/plants/${plant.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <img
                        src={plant.image ? `${API}/storage/${plant.image}` : "/images/placeholder-plant.jpg"}
                        alt={plant.name}
                        className="plantfinder-card-image"
                      />
                      <div className="plantfinder-card-info">
                        <h3>{plant.name}</h3>
                        <p>Rs {plant.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                  No plants match your criteria. Try adjusting your preferences.
                </p>
              )}
            </section>

            {/* More Options Section */}
            {morePlants.length > 0 && (
              <section className="plantfinder-more">
                <h2 className="plantfinder-more-title">But we have a lot more in store for you:</h2>
                <div className="plantfinder-grid">
                  {morePlants.map((plant) => (
                    <div 
                      key={plant.id} 
                      className="plantfinder-card"
                      onClick={() => navigate(`/plants/${plant.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <img
                        src={plant.image ? `${API}/storage/${plant.image}` : "/images/placeholder-plant.jpg"}
                        alt={plant.name}
                        className="plantfinder-card-image"
                      />
                      <div className="plantfinder-card-info">
                        <h3>{plant.name}</h3>
                        <p>Rs {plant.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
