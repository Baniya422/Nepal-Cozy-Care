import { useParams } from 'react-router-dom';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Product Detail</h1>
      <p className="text-gray-600">Product ID: {id}</p>
      {/* Add your product detail content here */}
    </div>
  );
}
