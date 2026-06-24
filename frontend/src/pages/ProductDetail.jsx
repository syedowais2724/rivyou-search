import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Tag, Calendar, ShieldAlert, Cpu, CheckCircle } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/api/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError("Product not found");
        } else {
          setError("Failed to load product details");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F4FF] flex items-center justify-center p-6 font-sans">
        <div className="bg-white border border-[#EEF2FF] rounded-3xl p-8 max-w-2xl w-full space-y-6 shadow-xl">
          <div className="w-24 h-4 bg-[#EEF2FF] shimmer rounded"></div>
          <div className="w-1/2 h-8 bg-[#EEF2FF] shimmer rounded"></div>
          <div className="w-full h-32 bg-[#EEF2FF] shimmer rounded"></div>
          <div className="flex gap-2">
            <div className="w-16 h-6 bg-[#EEF2FF] shimmer rounded-full"></div>
            <div className="w-20 h-6 bg-[#EEF2FF] shimmer rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#F0F4FF] flex items-center justify-center p-6 font-sans">
        <div className="bg-white border border-[#EEF2FF] rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="font-heading text-xl font-bold text-[#1A1040]">Error</h3>
          <p className="text-textmuted text-sm mt-2">{error || "Something went wrong"}</p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-white bg-[#5B4FE8] hover:bg-[#4639D2] px-5 py-2.5 rounded-xl shadow-md transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4FF] pb-16 font-sans">
      
      {/* Navbar placeholder */}
      <nav className="bg-white border-b border-[#EEF2FF] shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center">
          <Link to="/" className="flex items-center gap-2 text-xs font-bold text-primary hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Search Dashboard
          </Link>
        </div>
      </nav>

      {/* Main Details Panel */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        
        {/* Breadcrumbs */}
        <div className="text-xs text-textmuted mb-6 flex items-center gap-2">
          <Link to="/" className="hover:text-[#5B4FE8]">Discovery</Link>
          <span>/</span>
          <span className="capitalize">{product.category.toLowerCase()}</span>
          <span>/</span>
          <span className="font-semibold text-textprimary">{product.product_name}</span>
        </div>

        {/* Product Spec Card */}
        <div className="bg-white border border-[#EEF2FF] rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden">
          
          {/* Accent decoration */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-tr from-primary/5 to-accent/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
          
          <div className="space-y-6">
            
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs font-bold text-accent uppercase tracking-widest bg-orange-50 px-3.5 py-1.5 rounded-full border border-orange-100/50">
                {product.category}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-textmuted">
                <Calendar className="w-4 h-4" />
                <span>Added: {new Date(product.created_at).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>

            {/* Product Title */}
            <h1 className="font-heading text-3xl md:text-4xl font-extrabold text-[#1A1040] leading-tight">
              {product.product_name}
            </h1>

            {/* Tags Pills */}
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-[#EEF2FF] text-[#5B4FE8]"
                >
                  <Tag className="w-3.5 h-3.5" />
                  {tag}
                </span>
              ))}
            </div>

            {/* Specifications Description Section */}
            <div className="border-t border-[#F0F4FF] pt-6 space-y-4">
              <h2 className="font-heading text-lg font-bold text-[#1A1040] flex items-center gap-2">
                <Cpu className="w-5 h-5 text-primary" /> Product Specifications
              </h2>
              <p className="text-textprimary text-sm md:text-base leading-relaxed bg-[#F0F4FF]/40 p-6 rounded-2xl border border-blue-50/50">
                {product.product_description}
              </p>
            </div>

            {/* Purchase / Actions Mock */}
            <div className="border-t border-[#F0F4FF] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/50 z-10 relative">
              <div className="flex items-center gap-2 text-xs font-bold text-[#065F46] bg-[#D1FAE5] px-4 py-2 rounded-xl">
                <CheckCircle className="w-4 h-4" /> Verified Discovery Match
              </div>
              <button
                onClick={() => navigate('/')}
                className="w-full sm:w-auto bg-[#5B4FE8] hover:bg-[#4639D2] active:scale-[0.98] text-white py-3 px-6 rounded-xl font-semibold shadow-md transition-all text-xs"
              >
                Back to Discovery Board
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default ProductDetail;
