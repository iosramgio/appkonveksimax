import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/formatter';

const ProductCard = ({ product }) => {
  const { _id, name, basePrice, images, materials, sizes, description, category } = product;
  
  console.log('ProductCard received product:', { _id, name, images }); // Debug log
  
  // Use first image as thumbnail or a placeholder
  const thumbnailImage = images && images.length > 0 
    ? images[0].url 
    : '/assets/images/product-placeholder.jpg';
  
  // Get the lowest material price if there are different options
  const hasMaterialOptions = materials && materials.length > 0;
  const hasSizeOptions = sizes && sizes.length > 0;
  
  // Get short description if available
  const shortDescription = description 
    ? description.length > 70 
      ? description.substring(0, 70) + '...' 
      : description
    : '';
  
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-gray-100">
      <Link to={`/products/${_id}`} className="block relative overflow-hidden">
        <div className="h-64 overflow-hidden">
          <img 
            src={thumbnailImage} 
            alt={name} 
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
            <div className="w-full flex justify-between items-center">
              <span className="text-white font-medium">Lihat Detail</span>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Category badge */}
        {category && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium text-[#620000] shadow-sm">
            {category.name}
          </div>
        )}
        
        {/* If product is featured, show badge */}
        {product.featured && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-[#620000]/90 to-[#7A0000]/90 text-white text-xs font-medium py-1 px-2.5 rounded-full shadow-sm backdrop-blur-sm">
            Unggulan
          </div>
        )}
      </Link>
      
      <div className="p-5 flex flex-col flex-grow">
        <Link to={`/products/${_id}`}>
          <h3 className="font-medium text-lg mb-2 text-gray-900 group-hover:text-[#620000] transition-colors duration-300 line-clamp-1">{name}</h3>
        </Link>
        
        {shortDescription && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow font-light">{shortDescription}</p>
        )}
        
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="text-xl font-semibold text-[#620000]">
              {formatCurrency(basePrice)}
            </div>
            {hasMaterialOptions && (
              <div className="text-xs text-gray-500 mt-1 font-light flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                {materials.length} pilihan bahan
              </div>
            )}
          </div>
          
          {hasSizeOptions && (
            <div className="flex flex-wrap gap-1 justify-end">
              {sizes.slice(0, 3).map(sizeObj => (
                <span key={sizeObj.size} className="px-2 py-0.5 bg-[#620000]/10 text-xs rounded-full text-[#620000] font-medium">
                  {sizeObj.size}
                </span>
              ))}
              {sizes.length > 3 && (
                <span className="px-2 py-0.5 bg-[#620000]/10 text-xs rounded-full text-[#620000] font-medium">+{sizes.length - 3}</span>
              )}
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Link 
            to={`/products/${_id}`}
            className="flex-1 bg-[#620000] text-white text-center py-2.5 px-4 rounded-full hover:bg-[#7A0000] transition duration-300 text-sm font-medium flex items-center justify-center group overflow-hidden relative"
          >
            <span className="relative z-10 flex items-center">
              Lihat Detail
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-[#7A0000] w-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
          </Link>
          <button 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#620000]/10 hover:bg-[#620000]/20 transition duration-300 group"
            title="Simpan ke wishlist"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#620000] group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;