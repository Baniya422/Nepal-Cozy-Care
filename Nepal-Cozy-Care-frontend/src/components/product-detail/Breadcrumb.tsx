import { Link } from "react-router-dom";
import { productCategory } from "../../utils/productSeo";
export default function Breadcrumb({ productName, category }: { productName: string; category?: string }) {
  const collection = productCategory(category);
  return <nav className="breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><span aria-hidden="true">/</span><Link to={collection.path}>{collection.name}</Link><span aria-hidden="true">/</span><span aria-current="page">{productName}</span></nav>;
}
