import { DEFAULT_AUTHOR_IMAGE, type BlogApi } from "../../features/blogs/blogData";
import { handleImageError, resolveImageUrl } from "../../utils/imageUrl";
import { useEffect, useState } from "react";

export const emptyBlogDetails = {
  author_role: "", author_bio: "", author_image: "", read_time: "",
  tags: "", tips: "", takeaways: "", meta_title: "", meta_description: "",
};
export type BlogDetailsForm = typeof emptyBlogDetails;
export function detailsFromBlog(blog: BlogApi): BlogDetailsForm {
  return {
    author_role: blog.author_role || "", author_bio: blog.author_bio || "",
    author_image: blog.author_image || "", read_time: blog.read_time || "",
    tags: (blog.tags || []).join("\n"), tips: (blog.tips || []).join("\n"),
    takeaways: (blog.takeaways || []).join("\n"),
    meta_title: blog.meta_title || "", meta_description: blog.meta_description || "",
  };
}
export const lines = (text: string) => text.split("\n").map((line) => line.trim()).filter(Boolean);

export default function BlogDetailsFields({ value, onChange, author, file, onFileChange }: {
  value: BlogDetailsForm; onChange: (value: BlogDetailsForm) => void;
  author: string; file: File | null; onFileChange: (file: File | null) => void;
}) {
  const [filePreview, setFilePreview] = useState<string | null>(null);
  useEffect(() => {
    if (!file) { setFilePreview(null); return; }
    const url = URL.createObjectURL(file);
    setFilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const update = (key: keyof BlogDetailsForm, text: string) => onChange({ ...value, [key]: text });
  return <div className="blog-details-fields">
    <section>
      <h3>Writer profile</h3>
      <p>The profile photo, role, and biography appear on the public article.</p>
      <label htmlFor="writer-role">Writer role / title</label>
      <input id="writer-role" maxLength={150} value={value.author_role} onChange={(e) => update("author_role", e.target.value)} placeholder="e.g., Horticulturist" />
      <label htmlFor="writer-bio">Writer biography</label>
      <textarea id="writer-bio" rows={4} maxLength={2000} value={value.author_bio} onChange={(e) => update("author_bio", e.target.value)} />
      <label htmlFor="writer-image">Profile photo URL or saved path</label>
      <input id="writer-image" value={value.author_image} onChange={(e) => { update("author_image", e.target.value); onFileChange(null); }} placeholder="https://… or blogs/…" />
      <label htmlFor="writer-upload">Upload writer photo</label>
      <input id="writer-upload" type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={(e) => onFileChange(e.target.files?.[0] || null)} />
      <small>JPG, PNG, GIF or WebP; up to 5 MB. {file ? `Selected: ${file.name}` : ""}</small>
      {(file || value.author_image) && <button type="button" onClick={() => { update("author_image", ""); onFileChange(null); }}>Remove profile photo</button>}
      <div className="blog-writer-preview">
        <img key={filePreview || value.author_image} src={filePreview || resolveImageUrl(value.author_image, DEFAULT_AUTHOR_IMAGE)} alt={`${author || "Writer"} profile preview`} onError={(e) => handleImageError(e, DEFAULT_AUTHOR_IMAGE)} />
        <div><strong>{author || "Writer name"}</strong><p>{value.author_role}</p><small>{value.author_bio}</small>{file && <small>New photo will replace this image when saved.</small>}</div>
      </div>
    </section>
    <section>
      <h3>Article details</h3>
      <label htmlFor="blog-read-time">Reading time</label>
      <input id="blog-read-time" maxLength={50} value={value.read_time} onChange={(e) => update("read_time", e.target.value)} placeholder="e.g., 7 min read (leave blank to calculate)" />
      {([['tags', 'Tags'], ['tips', "Grower's tips"], ['takeaways', 'Key takeaways']] as const).map(([key, label]) => <div key={key}>
        <label htmlFor={`blog-${key}`}>{label} — one per line</label>
        <textarea id={`blog-${key}`} rows={key === "tags" ? 3 : 5} value={value[key]} onChange={(e) => update(key, e.target.value)} />
      </div>)}
      <small>Leave optional sections empty to hide them on the article. Views and publication date are recorded automatically.</small>
    </section>
    <section>
      <h3>Search listing</h3>
      <label htmlFor="blog-meta-title">SEO title</label>
      <input id="blog-meta-title" maxLength={255} value={value.meta_title} onChange={(e) => update("meta_title", e.target.value)} placeholder="Defaults to the article title" />
      <label htmlFor="blog-meta-description">SEO description</label>
      <textarea id="blog-meta-description" rows={3} maxLength={500} value={value.meta_description} onChange={(e) => update("meta_description", e.target.value)} placeholder="Defaults to the article excerpt" />
    </section>
  </div>;
}
