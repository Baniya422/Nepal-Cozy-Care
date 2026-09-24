import { Link } from "react-router-dom";
import { Sun, Droplets, Thermometer, Sprout } from "lucide-react";
interface Plant {
  survival_guide?: string; care_instructions?: string; description?: string;
  soil?: string; rooms?: string[] | string; water?: string; light?: string; temperature?: string; humidity?: string; fertilizer?: string; name: string;
}
export default function InfoSections({ plant }: { plant: Plant }) {
  const care = [[Sun, "Light", plant.light], [Droplets, "Water", plant.water], [Thermometer, "Temperature", plant.temperature], [Sprout, "Plant food", plant.fertilizer], [Sprout, "Soil / Potting mix", plant.soil]] as const;
  return <section className="pd-details" id="plant-details">
    <div className="pd-details-heading"><span className="pd-eyebrow">GET TO KNOW YOUR GREEN</span><h2>A happy plant starts here.</h2><p>A little understanding goes a long way. Find the right spot and care routine for your {plant.name}.</p><Link to="/care-tips">Explore our care guides <span aria-hidden="true">↗</span></Link></div>
    <div className="pd-accordions">
      <details open><summary>About this plant</summary><p>{plant.description || "More information about this plant is coming soon. Contact us if you need help choosing."}</p></details>
      <details open><summary>Your care essentials</summary><div className="pd-care-grid">{care.map(([Icon, label, value]) => <div key={label}><Icon size={20}/><span>{label}<strong>{value || "Ask us for guidance"}</strong></span></div>)}</div>{plant.humidity && <p>Humidity: {plant.humidity}</p>}{plant.rooms && <p>Suitable rooms: {Array.isArray(plant.rooms) ? plant.rooms.join(", ") : plant.rooms}</p>}{plant.care_instructions && <p>{plant.care_instructions}</p>}</details>
      {plant.survival_guide && <details><summary>Settling into a new home</summary><p>{plant.survival_guide}</p></details>}
      <details><summary>Before you order</summary><p>Plants are living things, so their size, leaf count and shape can vary. Check the listed size and description for what is included.</p><p>Need delivery or order help? <Link to="/contact">Talk to Cozy Care</Link>.</p></details>
    </div>
  </section>;
}
