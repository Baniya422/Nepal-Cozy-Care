import { resolvePageImage } from "../../features/page-content/templates";
export default function Banner({ images }: { images: { image: string; alt: string }[] }) {
  return (
    <section className="contact-banner">
      {}
      <div className="contact-banner-images">
        {images.map((item, index) => (
          <div className="contact-banner-image-wrapper" key={`${item.image}-${index}`}>
            <img src={resolvePageImage(item.image)} alt={item.alt} className="contact-banner-image" />
          </div>
        ))}
      </div>
    </section>
  );
}
