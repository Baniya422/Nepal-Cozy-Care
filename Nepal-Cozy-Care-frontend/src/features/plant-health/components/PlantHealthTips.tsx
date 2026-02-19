import { healthyPlantHabits } from "../data";

export default function PlantHealthTips() {
  return (
    <section className="plant-health-tips">
      <div className="plant-health-container">
        <h2 className="plant-health-tips-title">Best Habits For Healthier Plants</h2>
        <div className="plant-health-tips-grid">
          {healthyPlantHabits.map((habit) => {
            const HabitIcon = habit.icon;

            return (
              <div key={habit.title} className="plant-health-tip-card">
                <div className="plant-health-tip-icon">
                  <HabitIcon size={24} />
                </div>
                <h3>{habit.title}</h3>
                <p>{habit.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
