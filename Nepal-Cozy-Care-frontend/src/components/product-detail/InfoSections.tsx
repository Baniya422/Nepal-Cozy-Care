interface Plant {
  survival_guide?: string;
  care_instructions?: string;
  description?: string;
  water?: string;
  light?: string;
  temperature?: string;
  humidity?: string;
  fertilizer?: string;
  name: string;
}

interface InfoSectionsProps {
  plant: Plant;
}

export default function InfoSections({ plant }: InfoSectionsProps) {
  return (
    <div className="info-sections">
      <div className="info-card">
        <h3>Survival guide</h3>
        <p>
          {plant.survival_guide || 
            `This plant thrives in bright, indirect light and prefers well-draining soil. 
            Water when the top inch of soil feels dry. Avoid overwatering as it can lead 
            to root rot. Ideal temperature range is 18-24°C. Fertilize monthly during 
            growing season with balanced liquid fertilizer.`}
        </p>
      </div>
      <div className="info-card">
        <h3>How to care</h3>
        <ul>
          <li>Water: {plant.water || 'When soil is dry'}</li>
          <li>Light: {plant.light || 'Bright indirect'}</li>
          <li>Temperature: {plant.temperature || '18-24°C'}</li>
          <li>Humidity: {plant.humidity || 'Moderate to high'}</li>
          <li>Fertilizer: {plant.fertilizer || 'Monthly in spring/summer'}</li>
        </ul>
        {plant.care_instructions && (
          <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
            {plant.care_instructions}
          </p>
        )}
      </div>
      <div className="info-card">
        <h3>About Product</h3>
        <p>
          {plant.description || 
            `This beautiful ${plant.name} is perfect for indoor spaces. 
            It purifies air and adds a touch of nature to your home or office. 
            Easy to care for and suitable for beginners.`}
        </p>
      </div>
    </div>
  );
}
