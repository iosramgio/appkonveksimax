import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const steps = [
  {
    icon: (
      <span className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-[#620000] text-white mb-2 sm:mb-3 shadow-lg relative overflow-hidden group-hover:scale-110 transition-transform duration-300">
        <span className="absolute inset-0 bg-gradient-to-r from-[#7A0000] to-[#620000] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        {/* Icon baju */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 10-8 0M4 7l8 4 8-4M4 7v10a2 2 0 002 2h12a2 2 0 002-2V7" /></svg>
      </span>
    ),
    label: 'Pilih Produk',
    description: 'Pilih produk yang sesuai dengan kebutuhan Anda'
  },
  {
    icon: (
      <span className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-[#620000] text-white mb-2 sm:mb-3 shadow-lg relative overflow-hidden group-hover:scale-110 transition-transform duration-300">
        <span className="absolute inset-0 bg-gradient-to-r from-[#7A0000] to-[#620000] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        {/* Icon penggaris */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16V8a2 2 0 012-2h12a2 2 0 012 2v8M4 16h16" /></svg>
      </span>
    ),
    label: 'Ukuran & Desain',
    description: 'Pilih ukuran, warna, dan desain'
  },
  {
    icon: (
      <span className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-[#620000] text-white mb-2 sm:mb-3 shadow-lg relative overflow-hidden group-hover:scale-110 transition-transform duration-300">
        <span className="absolute inset-0 bg-gradient-to-r from-[#7A0000] to-[#620000] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        {/* Icon chat */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8l-4 1 1-4A8.96 8.96 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
      </span>
    ),
    label: 'Konsultasi',
    description: 'Konsultasi dengan admin (opsional)'
  },
  {
    icon: (
      <span className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-[#620000] text-white mb-2 sm:mb-3 shadow-lg relative overflow-hidden group-hover:scale-110 transition-transform duration-300">
        <span className="absolute inset-0 bg-gradient-to-r from-[#7A0000] to-[#620000] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        {/* Icon kartu */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="2" y="7" width="20" height="10" rx="2" /><path d="M2 10h20" /></svg>
      </span>
    ),
    label: 'Checkout & DP',
    description: 'Lakukan pembayaran DP'
  },
  {
    icon: (
      <span className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-[#620000] text-white mb-2 sm:mb-3 shadow-lg relative overflow-hidden group-hover:scale-110 transition-transform duration-300">
        <span className="absolute inset-0 bg-gradient-to-r from-[#7A0000] to-[#620000] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        {/* Icon pabrik */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21V9l7-4v4h4V5l7 4v12" /></svg>
      </span>
    ),
    label: 'Proses Konveksi',
    description: 'Produk Anda diproduksi'
  },
  {
    icon: (
      <span className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-[#620000] text-white mb-2 sm:mb-3 shadow-lg relative overflow-hidden group-hover:scale-110 transition-transform duration-300">
        <span className="absolute inset-0 bg-gradient-to-r from-[#7A0000] to-[#620000] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        {/* Icon kirim */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10l1.553 1.553a2 2 0 002.828 0L12 7.414l4.619 4.619a2 2 0 002.828 0L21 10M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H5a2 2 0 00-2 2v5a2 2 0 002 2z" /></svg>
      </span>
    ),
    label: 'Pelunasan & Kirim',
    description: 'Bayar sisa dan produk dikirim'
  },
];

const CaraOrder = () => {
  useEffect(() => {
    AOS.init({ duration: 900, once: true, offset: 60 });
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex flex-col items-center">
        <div className="relative w-full flex flex-col items-center mt-6 sm:mt-8 pt-5 sm:pt-8">
          {/* Desktop and Tablet Steps */}
          <div className="hidden sm:flex sm:flex-row sm:justify-center sm:items-start sm:w-full sm:flex-wrap">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center px-1 sm:px-2 md:px-4 flex-1 z-10 mb-8 group hover:-translate-y-1 transition-transform duration-300 pt-4 mt-2"
                data-aos="fade-up"
                data-aos-delay={idx * 100}
              >
                {step.icon}
                <span className="text-center text-xs sm:text-sm font-medium text-gray-900 group-hover:text-[#620000] transition-colors duration-300">
                  {step.label}
                </span>
                <span className="text-center text-[10px] sm:text-xs text-gray-500 mt-1 max-w-[80px] sm:max-w-[100px] md:max-w-[120px] opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                  {step.description}
                </span>
                
                {/* Step number badge */}
                <div className="absolute top-1 right-0 -mt-1 -mr-2 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white border border-[#620000]/20 text-[#620000] text-[9px] sm:text-xs font-bold flex items-center justify-center">
                  {idx + 1}
                </div>
              </div>
            ))}
            
            {/* Connecting line for desktop/tablet */}
            <div className="absolute top-12 sm:top-14 md:top-16 left-0 right-0 h-0.5 bg-gray-100 hidden sm:block"></div>
            <div className="absolute top-12 sm:top-14 md:top-16 left-[10%] right-[10%] h-0.5 bg-[#620000]/10 hidden sm:block" style={{ zIndex: -1 }}></div>
          </div>
          
          {/* Mobile Steps - Vertical Layout */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:hidden w-full pt-3">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center group hover:-translate-y-1 transition-transform duration-300 relative pt-5 mt-2"
                data-aos="fade-up"
                data-aos-delay={idx * 70}
              >
                {step.icon}
                <span className="text-center text-xs font-medium text-gray-900 group-hover:text-[#620000] transition-colors duration-300">
                  {step.label}
                </span>
                <span className="text-center text-[10px] text-gray-500 mt-1 max-w-[100px] opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                  {step.description}
                </span>
                
                {/* Step number badge */}
                <div className="absolute top-2 right-0 -mt-1 -mr-2 w-4 h-4 rounded-full bg-white border border-[#620000]/20 text-[#620000] text-[9px] font-bold flex items-center justify-center">
                  {idx + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaraOrder; 