type RecommendedPlant = {
  id: number;
  name: string;
  price: number;
  image?: string;
};

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

interface RecommendedProductsProps {
  recommendedPlants: RecommendedPlant[];
  addToCart: (plantId: number) => void;
}

export default function RecommendedProducts({ recommendedPlants, addToCart }: RecommendedProductsProps) {
  if (recommendedPlants.length === 0) return null;

  return (
    <section className="cart-recommended">
      <h2 className="cart-recommended-title">You Might Also Like These!</h2>
      <div className="cart-recommended-grid">
        {recommendedPlants.map((plant) => (
          <div key={plant.id} className="cart-recommended-card">
            <div className="cart-recommended-image-wrapper">
              <img
                src={
                  plant.image
                    ? `${API}/storage/${plant.image}`
                    : "/images/plant-placeholder.jpg"
                }
                alt={plant.name}
                className="cart-recommended-image"
              />
            </div>
            <h3 className="cart-recommended-name">{plant.name}</h3>
            <p className="cart-recommended-price">Rs {Number(plant.price).toFixed(2)}</p>
            <button
              className="cart-recommended-add-btn"
              onClick={() => addToCart(plant.id)}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
