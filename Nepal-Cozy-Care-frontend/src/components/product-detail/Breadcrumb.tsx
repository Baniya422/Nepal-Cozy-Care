import { Link } from "react-router-dom";
export default function Breadcrumb({ productName }: { productName: string }) {
  return <nav className="breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><span aria-hidden="true">/</span><Link to="/plants">Plants</Link><span aria-hidden="true">/</span><span aria-current="page">{productName}</span></nav>;
}
