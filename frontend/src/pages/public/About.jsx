import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

const About = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#620000] to-[#880000] opacity-90"></div>
        <div 
          className="absolute inset-0 opacity-20"
          style={{ 
            backgroundImage: 'url("/assets/images/MaxHero.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(8px)'
          }}
        ></div>
        <div className="relative z-10 max-w-7xl mx-auto py-32 px-6 sm:py-40 sm:px-10 lg:px-16">
          <div data-aos="fade-up" className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-4">
            Tentang Kami
          </h1>
            <div className="h-1 w-20 bg-white mx-auto mb-6"></div>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-100 leading-relaxed">
              Menyediakan solusi konveksi berkualitas tinggi untuk kebutuhan personal dan bisnis Anda sejak 2010
          </p>
          </div>
        </div>
      </div>
      
      {/* Our Story */}
      <div className="py-24 px-6 sm:px-10 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="lg:grid lg:grid-cols-2 lg:gap-20 items-center">
            <div data-aos="fade-right">
              <div className="mb-10 inline-block">
                <h2 className="text-4xl font-bold text-gray-900 mb-2">Cerita Kami</h2>
                <div className="h-1 w-20 bg-[#620000]"></div>
              </div>
              <div className="prose prose-lg text-gray-600 space-y-6">
                <p className="text-lg leading-relaxed">
                  Didirikan pada tahun 2010, perusahaan konveksi kami telah menjadi salah satu penyedia solusi konveksi terkemuka di Indonesia. Kami memulai bisnis ini dengan visi sederhana: menyediakan produk konveksi berkualitas tinggi dengan harga yang terjangkau.
                </p>
                <p className="text-lg leading-relaxed">
                  Seiring berjalannya waktu, kami terus berinovasi dan meningkatkan layanan kami untuk memenuhi kebutuhan pelanggan yang terus berkembang. Dari bisnis kecil hingga menjadi perusahaan yang dipercaya oleh berbagai klien dari berbagai industri.
                </p>
                <p className="text-lg leading-relaxed">
                  Kami bangga dengan perjalanan kami dan berkomitmen untuk terus memberikan layanan terbaik kepada pelanggan kami. Kepuasan pelanggan adalah prioritas utama kami, dan kami selalu berusaha untuk melampaui harapan mereka.
                </p>
              </div>
              
              <div className="mt-10 flex items-center space-x-6">
                <div className="flex flex-col">
                  <span className="text-4xl font-bold text-[#620000]">300+</span>
                  <span className="text-gray-600">Klien Puas</span>
                </div>
                <div className="h-12 w-px bg-gray-300"></div>
                <div className="flex flex-col">
                  <span className="text-4xl font-bold text-[#620000]">13+</span>
                  <span className="text-gray-600">Tahun Pengalaman</span>
                </div>
                <div className="h-12 w-px bg-gray-300"></div>
                <div className="flex flex-col">
                  <span className="text-4xl font-bold text-[#620000]">5K+</span>
                  <span className="text-gray-600">Produk Terjual</span>
                </div>
              </div>
            </div>
            
            <div className="mt-16 lg:mt-0" data-aos="fade-left">
              <div className="relative">
                <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-[#620000]/10 rounded-lg"></div>
                <div className="absolute -top-6 -left-6 w-64 h-64 border-2 border-[#620000] rounded-lg"></div>
                <div className="relative rounded-lg overflow-hidden shadow-2xl">
                <video
                  src="/assets/video/produksi2.mp4"
                  alt="Our production process"
                  className="w-full h-auto object-cover"
                  loop
                  autoPlay
                  muted
                />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Our Values */}
      <div className="py-24 px-6 sm:px-10 lg:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div data-aos="fade-up" className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nilai-nilai Kami</h2>
            <div className="h-1 w-20 bg-[#620000] mx-auto"></div>
            <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
              Prinsip-prinsip yang memandu kami dalam memberikan layanan terbaik
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div 
              data-aos="fade-up" 
              data-aos-delay="100" 
              className="bg-white p-8 rounded-lg shadow-md border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-[#620000]/30 group"
            >
              <div className="w-16 h-16 rounded-full bg-[#620000]/10 flex items-center justify-center text-[#620000] mb-6 group-hover:bg-[#620000] group-hover:text-white transition-all duration-300 transform group-hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Kualitas</h3>
              <p className="text-gray-600 leading-relaxed">
                Kami berkomitmen untuk memberikan produk berkualitas tinggi dengan standar kualitas yang ketat. Setiap produk melewati proses quality control yang teliti.
              </p>
              <div className="mt-6 w-10 h-1 bg-[#620000] transform transition-all duration-300 group-hover:w-20"></div>
            </div>
            
            <div 
              data-aos="fade-up" 
              data-aos-delay="200" 
              className="bg-white p-8 rounded-lg shadow-md border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-[#620000]/30 group"
            >
              <div className="w-16 h-16 rounded-full bg-[#620000]/10 flex items-center justify-center text-[#620000] mb-6 group-hover:bg-[#620000] group-hover:text-white transition-all duration-300 transform group-hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Kepercayaan</h3>
              <p className="text-gray-600 leading-relaxed">
                Kami membangun hubungan jangka panjang dengan pelanggan kami berdasarkan kepercayaan dan integritas. Transparansi adalah inti dari operasi kami.
              </p>
              <div className="mt-6 w-10 h-1 bg-[#620000] transform transition-all duration-300 group-hover:w-20"></div>
            </div>
            
            <div 
              data-aos="fade-up" 
              data-aos-delay="300" 
              className="bg-white p-8 rounded-lg shadow-md border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-[#620000]/30 group"
            >
              <div className="w-16 h-16 rounded-full bg-[#620000]/10 flex items-center justify-center text-[#620000] mb-6 group-hover:bg-[#620000] group-hover:text-white transition-all duration-300 transform group-hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Inovasi</h3>
              <p className="text-gray-600 leading-relaxed">
                Kami terus berinovasi untuk meningkatkan produk dan layanan kami. Kami mengadopsi teknologi dan metode baru untuk memastikan efisiensi dan kualitas.
              </p>
              <div className="mt-6 w-10 h-1 bg-[#620000] transform transition-all duration-300 group-hover:w-20"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Team */}
      <div className="py-24 px-6 sm:px-10 lg:px-16 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-40 bg-[#620000]/5 transform -skew-y-6"></div>
        <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-[#620000]/10 blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full bg-[#620000]/10 blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div data-aos="fade-up" className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-[#620000]/10 text-[#620000] text-sm font-medium rounded-full mb-4">
              PROFESIONAL KAMI
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Tim Hebat Kami</h2>
            <div className="h-1 w-20 bg-[#620000] mx-auto mb-6"></div>
            <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
              Bertemu dengan para profesional berpengalaman yang berdedikasi mewujudkan visi Anda menjadi kenyataan
            </p>
          </div>
          
          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-px bg-gray-200 -translate-y-1/2 z-0"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-8 relative z-10">
              <div data-aos="fade-up" data-aos-delay="100" className="text-center group">
                <div className="relative w-40 h-40 rounded-full bg-gray-200 mx-auto mb-6 overflow-hidden shadow-md border-4 border-white group-hover:border-[#620000] transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-xl">
                  <div className="absolute inset-0 bg-[#620000]/0 group-hover:bg-[#620000]/10 transition-all duration-300"></div>
                  <div className="w-full h-full bg-[#620000]/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-[#620000]/60 group-hover:text-[#620000] transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-[#620000] transition-all duration-300">Syarief Nugroho</h3>
                <p className="text-[#620000] font-medium relative inline-block">
                  Direktur
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#620000] group-hover:w-full transition-all duration-500"></span>
                </p>
              </div>
              
              <div data-aos="fade-up" data-aos-delay="150" className="text-center group">
                <div className="relative w-40 h-40 rounded-full bg-gray-200 mx-auto mb-6 overflow-hidden shadow-md border-4 border-white group-hover:border-[#620000] transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-xl">
                  <div className="absolute inset-0 bg-[#620000]/0 group-hover:bg-[#620000]/10 transition-all duration-300"></div>
                  <div className="w-full h-full bg-[#620000]/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-[#620000]/60 group-hover:text-[#620000] transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-[#620000] transition-all duration-300">Ayanih</h3>
                <p className="text-[#620000] font-medium relative inline-block">
                  Manager Operasional
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#620000] group-hover:w-full transition-all duration-500"></span>
                </p>
              </div>
              
              <div data-aos="fade-up" data-aos-delay="200" className="text-center group">
                <div className="relative w-40 h-40 rounded-full bg-gray-200 mx-auto mb-6 overflow-hidden shadow-md border-4 border-white group-hover:border-[#620000] transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-xl">
                  <div className="absolute inset-0 bg-[#620000]/0 group-hover:bg-[#620000]/10 transition-all duration-300"></div>
                  <div className="w-full h-full bg-[#620000]/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-[#620000]/60 group-hover:text-[#620000] transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-[#620000] transition-all duration-300">Naya</h3>
                <p className="text-[#620000] font-medium relative inline-block">
                  Admin Operasional
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#620000] group-hover:w-full transition-all duration-500"></span>
                </p>
              </div>
              
              <div data-aos="fade-up" data-aos-delay="250" className="text-center group">
                <div className="relative w-40 h-40 rounded-full bg-gray-200 mx-auto mb-6 overflow-hidden shadow-md border-4 border-white group-hover:border-[#620000] transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-xl">
                  <div className="absolute inset-0 bg-[#620000]/0 group-hover:bg-[#620000]/10 transition-all duration-300"></div>
                  <div className="w-full h-full bg-[#620000]/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-[#620000]/60 group-hover:text-[#620000] transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-[#620000] transition-all duration-300">Azmi</h3>
                <p className="text-[#620000] font-medium relative inline-block">
                  Cutting
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#620000] group-hover:w-full transition-all duration-500"></span>
                </p>
              </div>
              
              <div data-aos="fade-up" data-aos-delay="300" className="text-center group">
                <div className="relative w-40 h-40 rounded-full bg-gray-200 mx-auto mb-6 overflow-hidden shadow-md border-4 border-white group-hover:border-[#620000] transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-xl">
                  <div className="absolute inset-0 bg-[#620000]/0 group-hover:bg-[#620000]/10 transition-all duration-300"></div>
                  <div className="w-full h-full bg-[#620000]/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-[#620000]/60 group-hover:text-[#620000] transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-[#620000] transition-all duration-300">Operator</h3>
                <p className="text-[#620000] font-medium relative inline-block">
                  Operator
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#620000] group-hover:w-full transition-all duration-500"></span>
                </p>
              </div>
              
              <div data-aos="fade-up" data-aos-delay="350" className="text-center group">
                <div className="relative w-40 h-40 rounded-full bg-gray-200 mx-auto mb-6 overflow-hidden shadow-md border-4 border-white group-hover:border-[#620000] transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-xl">
                  <div className="absolute inset-0 bg-[#620000]/0 group-hover:bg-[#620000]/10 transition-all duration-300"></div>
                  <div className="w-full h-full bg-[#620000]/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-[#620000]/60 group-hover:text-[#620000] transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-[#620000] transition-all duration-300">Wial</h3>
                <p className="text-[#620000] font-medium relative inline-block">
                  Quality Control
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#620000] group-hover:w-full transition-all duration-500"></span>
                </p>
              </div>
              
              <div data-aos="fade-up" data-aos-delay="400" className="text-center group">
                <div className="relative w-40 h-40 rounded-full bg-gray-200 mx-auto mb-6 overflow-hidden shadow-md border-4 border-white group-hover:border-[#620000] transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-xl">
                  <div className="absolute inset-0 bg-[#620000]/0 group-hover:bg-[#620000]/10 transition-all duration-300"></div>
                  <div className="w-full h-full bg-[#620000]/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-[#620000]/60 group-hover:text-[#620000] transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-[#620000] transition-all duration-300">Juharsyah</h3>
                <p className="text-[#620000] font-medium relative inline-block">
                  Finishing
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#620000] group-hover:w-full transition-all duration-500"></span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Gallery */}
      <div className="py-24 px-6 sm:px-10 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div data-aos="fade-up" className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-[#620000]/10 text-[#620000] text-sm font-medium rounded-full mb-4">
              GALERI KAMI
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Lihat Hasil Karya Kami</h2>
            <div className="h-1 w-20 bg-[#620000] mx-auto mb-6"></div>
            <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
              Beberapa contoh produk berkualitas yang telah kami buat untuk klien kami
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Gallery Item 1 */}
            <div 
              data-aos="fade-up" 
              data-aos-delay="100" 
              className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-w-4 aspect-h-3 w-full h-80">
                <img 
                  src="/assets/images/kemeja.png" 
                  alt="Produk konveksi 1" 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-all duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                <h3 className="text-xl font-semibold text-white mb-2">Kemeja Premium</h3>
                <p className="text-white/80">Kemeja custom dengan material premium</p>
              </div>
            </div>
            
            {/* Gallery Item 2 */}
            <div 
              data-aos="fade-up" 
              data-aos-delay="200" 
              className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-w-4 aspect-h-3 w-full h-80">
                <img 
                  src="/assets/images/kaos.png" 
                  alt="Produk konveksi 2" 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-all duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                <h3 className="text-xl font-semibold text-white mb-2">T-shirt</h3>
                <p className="text-white/80">Kaos berkualitas tinggi untuk berbagai kebutuhan acara dan komunitas</p>
              </div>
            </div>
            
            {/* Gallery Item 3 */}
            <div 
              data-aos="fade-up" 
              data-aos-delay="300" 
              className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-w-4 aspect-h-3 w-full h-80">
                <img 
                  src="/assets/images/kemejapdh.png" 
                  alt="Produk konveksi 3" 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-all duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                <h3 className="text-xl font-semibold text-white mb-2">Seragam Perusahaan</h3>
                <p className="text-white/80">Solusi seragam perusahaan dengan desain custom sesuai kebutuhan</p>
              </div>
            </div>
            
            {/* Gallery Item 4 */}
            <div 
              data-aos="fade-up" 
              data-aos-delay="400" 
              className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-w-4 aspect-h-3 w-full h-80">
                <img 
                  src="/assets/images/varsity.png" 
                  alt="Produk konveksi 4" 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-all duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                <h3 className="text-xl font-semibold text-white mb-2">Varsity Jacket</h3>
                <p className="text-white/80">Jaket Varsityberkualitas dengan berbagai pilihan bahan dan desain</p>
              </div>
            </div>
            
            {/* Gallery Item 5 */}
            <div 
              data-aos="fade-up" 
              data-aos-delay="500" 
              className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-w-4 aspect-h-3 w-full h-80">
                <img 
                  src="/assets/images/turtleneck.png" 
                  alt="Produk konveksi 5" 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-all duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                <h3 className="text-xl font-semibold text-white mb-2">Turtle Neck</h3>
                <p className="text-white/80">Turtle Neck premium dengan bordir atau sablon berkualitas</p>
              </div>
            </div>
            
            {/* Gallery Item 6 */}
            <div 
              data-aos="fade-up" 
              data-aos-delay="600" 
              className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-w-4 aspect-h-3 w-full h-80">
                <img 
                  src="/assets/images/Cargo.png" 
                  alt="Produk konveksi 6" 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-all duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                <h3 className="text-xl font-semibold text-white mb-2">Cargo Pants</h3>
                <p className="text-white/80">Cargo Pants Premium untuk kebutuhan sehari-hari</p>
              </div>
            </div>
            
            {/* Gallery Item 7 */}
            <div 
              data-aos="fade-up" 
              data-aos-delay="700" 
              className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-w-4 aspect-h-3 w-full h-80">
                <img 
                  src="/assets/images/outer.png" 
                  alt="Produk konveksi 7" 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-all duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                <h3 className="text-xl font-semibold text-white mb-2">Outer Premium</h3>
                <p className="text-white/80">Outer dengan desain modern dan nyaman untuk gaya kasual</p>
              </div>
            </div>
            
            {/* Gallery Item 8 */}
            <div 
              data-aos="fade-up" 
              data-aos-delay="800" 
              className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-w-4 aspect-h-3 w-full h-80">
                <img 
                  src="/assets/images/dress2.png" 
                  alt="Produk konveksi 8" 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-all duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                <h3 className="text-xl font-semibold text-white mb-2">Dress Premium</h3>
                <p className="text-white/80">Dress dengan desain elegan dan bahan berkualitas tinggi</p>
              </div>
            </div>
            
            {/* Gallery Item 9 */}
            <div 
              data-aos="fade-up" 
              data-aos-delay="900" 
              className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-w-4 aspect-h-3 w-full h-80">
                <img 
                  src="/assets/images/rompi1.jpg" 
                  alt="Produk konveksi 9" 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-all duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                <h3 className="text-xl font-semibold text-white mb-2">Rompi Premium</h3>
                <p className="text-white/80">Rompi dengan kualitas premium untuk tampilan profesional</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center" data-aos="fade-up" data-aos-delay="1000">
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-md border-2 border-[#620000] bg-[#620000] py-3 px-6 text-base font-medium text-white shadow-sm hover:bg-[#620000]/90 transition-all duration-300"
            >
              Lihat Semua Produk
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
      
      {/* CTA */}
      <div className="relative py-20 px-6 sm:px-10 lg:px-16 overflow-hidden">
        <div className="absolute inset-0 bg-[#620000]"></div>
        <div className="absolute inset-0 bg-grid-white/10 bg-grid-white/5"></div>
        <div className="max-w-3xl mx-auto relative z-10 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Siap Bekerja Sama?</h2>
          <p className="text-xl text-white/90 mb-10 max-w-xl mx-auto">
            Hubungi kami sekarang untuk mendapatkan penawaran terbaik
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/6288214606269"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md border-2 border-white bg-transparent py-3 px-6 text-base font-medium text-white shadow-sm hover:bg-white hover:text-[#620000] transition-all duration-300"
            >
              Hubungi Kami
              <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            </a>
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-md border-2 border-white bg-white py-3 px-6 text-base font-medium text-[#620000] shadow-sm hover:bg-transparent hover:text-white transition-all duration-300"
            >
              Lihat Produk
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;