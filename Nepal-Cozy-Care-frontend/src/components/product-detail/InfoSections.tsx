import { isPlantProduct } from "../../utils/productSeo";
import { Link } from "react-router-dom";
import { Sun, Droplets, Thermometer, Sprout } from "lucide-react";
interface Plant {
  category?: string; survival_guide?: string; care_instructions?: string; description?: string;
  soil?: string; rooms?: string[] | string; water?: string; light?: string; temperature?: string; humidity?: string; fertilizer?: string; name: string;
}
export default function InfoSections({ plant }: { plant: Plant }) {
  const isPlant = isPlantProduct(plant.category);
  const care = [[Sun, "Light", plant.light], [Droplets, "Water", plant.water], [Thermometer, "Temperature", plant.temperature], [Sprout, "Plant food", plant.fertilizer], [Sprout, "Soil / Potting mix", plant.soil]] as const;
  return <section className="pd-details" id="plant-details">
    <div className="pd-details-heading"><span className="pd-eyebrow">PRODUCT DETAILS</span><h2>{plant.name}: details{isPlant ? " & care" : ""}</h2><p>Check the product information before you order.</p><Link to="/care-tips">Explore our care guides <span aria-hidden="true">↗</span></Link></div>
    <div className="pd-accordions">
      <details open><summary><h3>About {plant.name}</h3></summary><p>{plant.description || "More information about this plant is coming soon. Contact us if you need help choosing."}</p></details>
      {isPlant && <details open><summary><h3>Light, watering & care</h3></summary><div className="pd-care-grid">{care.map(([Icon, label, value]) => <div key={label}><Icon size={20}/><span>{label}<strong>{value || "Ask us for guidance"}</strong></span></div>)}</div>{plant.humidity && <p>Humidity: {plant.humidity}</p>}{plant.rooms && <p>Suitable rooms: {Array.isArray(plant.rooms) ? plant.rooms.join(", ") : plant.rooms}</p>}{plant.care_instructions && <p>{plant.care_instructions}</p>}</details>}
      {plant.survival_guide && <details><summary><h3>After delivery</h3></summary><p>{plant.survival_guide}</p></details>}
      <details><summary><h3>Before you order</h3></summary><p>{isPlant ? "Plant size, leaf count and shape may vary. Check the listed size and description for what is included." : "Check the listed size and description for what is included."}</p><p>Need delivery or order help? <Link to="/contact">Talk to Cozy Care</Link>.</p></details>
    </div>
  </section>;
}
