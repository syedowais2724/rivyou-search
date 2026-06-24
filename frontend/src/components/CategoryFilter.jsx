import React from 'react';

const CategoryFilter = ({ activeCategory, onCategoryChange }) => {
  const categories = [
    { label: 'All Discovery', value: '' },
    { label: 'Smartphones', value: 'Smartphones' },
    { label: 'Chargers', value: 'Chargers' },
    { label: 'Back Covers', value: 'Back Covers' }
  ];

  return (
    <div className="flex flex-wrap justify-center gap-3 my-6">
      {categories.map((cat) => {
        const isActive = activeCategory === cat.value;
        return (
          <button
            key={cat.label}
            onClick={() => onCategoryChange(cat.value)}
            className={`px-5 py-2 rounded-full text-sm font-semibold tracking-wide border transition-all ${
              isActive
                ? 'bg-[#FF6B35] text-white border-[#FF6B35] shadow-lg shadow-accent/25 scale-[1.03]'
                : 'bg-white text-textprimary border-[#EEF2FF] hover:border-primary/30 hover:bg-surface'
            }`}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
