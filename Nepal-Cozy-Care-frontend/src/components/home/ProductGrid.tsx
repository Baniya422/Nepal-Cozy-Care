import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

type Plant = {
  id: number;
  name: string;
  price: number;
  image?: string;
  avg_rating?: number;
};

export default function ProductGrid() {
  const navigate = useNavigate();
  const [plants, setPlants] = useState<Plant[]>([]);

  useEffect(() => {
    fetch(`${API}/api/plants?per_page=8`)
      .then(res => res.json())
      .then(json => setPlants(json.data.data))
      .catch(() => setPlants([]));
  }, []);

  return (
    <section className="block">
      <h2 className="block-title">Product Trend</h2>

      <div className="grid">
        {plants.map(p => (
          <div className="card" key={p.id}>
            <img
              className="card-img"
              src={p.image ? `${API}/storage/${p.image}` : "/placeholder.png"}
              alt={p.name}
            />

            <div className="card-body">
              <strong>{p.name}</strong>
              <span>Rs {p.price}</span>
              <button className="btn" onClick={() => navigate(`/plants/${p.id}`)}>
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
