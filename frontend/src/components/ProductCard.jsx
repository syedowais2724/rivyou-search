import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Tag, Activity } from 'lucide-react';

const ProductCard = ({ product, index }) => {
  const { id, product_name, category, tags, relevance_score, rank_reason } = product;

  // Determine scoring tier & styles
  let tierLabel = 'Partial Match';
  let badgeClasses = 'bg-tier3-bg text-tier3-text border-tier3-text/10';
  
  if (relevance_score >= 0.85) {
    tierLabel = 'Best Match';
    badgeClasses = 'bg-[#D1FAE5] text-[#065F46] border-emerald-200';
  } else if (relevance_score >= 0.50) {
    tierLabel = 'Tag Match';
    badgeClasses = 'bg-[#FEF3C7] text-[#92400E] border-amber-200';
  } else {
    tierLabel = 'Partial Match';
    badgeClasses = 'bg-[#EDE9FE] text-[#5B21B6] border-purple-200';
  }

  // Animation delay calculation for staggered fade-in
  const delay = `${index * 50}ms`;

  return (
    <Link
      to={`/products/${id}`}
      style={{ animationDelay: delay }}
      className="group block bg-white border border-[#EEF2FF] rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden fade-in-item"
    >
      {/* Decorative top border active on hover */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity"></div>

      <div className="flex flex-col justify-between h-full space-y-4">
        
        {/* Category & Tier Badge row */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-textmuted uppercase tracking-widest">{category}</span>
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${badgeClasses} uppercase tracking-wide`}>
            {tierLabel}
          </span>
        </div>

        {/* Product Name */}
        <div className="flex justify-between items-start gap-4">
          <h3 className="font-heading text-lg font-bold text-[#1A1040] leading-snug group-hover:text-primary transition-colors">
            {product_name}
          </h3>
          <span className="shrink-0 w-8 h-8 rounded-full bg-surface text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 py-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-[#EEF2FF] text-[#5B4FE8] border border-blue-50/50"
            >
              <Tag className="w-2.5 h-2.5" />
              {tag}
            </span>
          ))}
        </div>

        {/* Score & Progress bar */}
        <div className="space-y-2 border-t border-[#F0F4FF] pt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-textmuted flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-primary" /> Relevance Score
            </span>
            <span className="font-bold text-[#1A1040]">{(relevance_score * 100).toFixed(0)}%</span>
          </div>
          {/* Progress Bar Container */}
          <div className="w-full bg-[#EEF2FF] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#5B4FE8] h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${relevance_score * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Rank Reason info */}
        <div className="flex items-center justify-between text-[11px] text-textmuted">
          <span>Match logic: <span className="font-semibold text-[#1A1040]">{rank_reason}</span></span>
        </div>

      </div>
    </Link>
  );
};

export default ProductCard;
