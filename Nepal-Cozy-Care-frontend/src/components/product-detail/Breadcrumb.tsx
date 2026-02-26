import { useNavigate } from "react-router-dom";

interface BreadcrumbProps {
  productName: string;
}

export default function Breadcrumb({ productName }: BreadcrumbProps) {
  const navigate = useNavigate();

  return (
    <nav className="breadcrumb">
      <span onClick={() => navigate('/')}>Home</span>
      <span>/</span>
      <span onClick={() => navigate('/plants')}>Plants</span>
      <span>/</span>
      <span className="current">{productName}</span>
    </nav>
  );
}
