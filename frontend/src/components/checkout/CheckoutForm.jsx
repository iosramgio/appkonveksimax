import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FormSection from '../forms/FormSection';
import InputField from '../forms/InputField';
import SelectField from '../forms/SelectField';
import Button from '../common/Button';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';
import { formatCurrency } from '../../utils/formatter';
import OrderSummary from './OrderSummary';
import { createSnapToken, confirmPayment, getMidtransConfig } from '../../api/payments';

const CheckoutForm = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const api = useApi();
  const { showNotification } = useNotification();
  
  const [loading, setLoading] = useState(false);
  const [paymentType, setPaymentType] = useState('full');
  const [dpPercentage, setDpPercentage] = useState(30);
  const [dpAmount, setDpAmount] = useState(0);
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    province: '',
    city: '',
    district: '',
    postalCode: '',
    notes: '',
  });
  
  const storeAddress = {
    street: 'Jl. H. Muhari No.116',
    district: 'Serua',
    subdistrict: 'Kec. Bojongsari',
    city: 'Kota Depok',
    province: 'Jawa Barat',
    postalCode: '16517'
  };

  useEffect(() => {
    // Calculate DP amount when cart total or percentage changes
    const calculatedDp = (total * dpPercentage) / 100;
    setDpAmount(calculatedDp);
  }, [total, dpPercentage]);

  // Load provinces
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        // Try to load from localStorage first
        const cachedProvinces = localStorage.getItem('provinces');
        if (cachedProvinces) {
          setProvinces(JSON.parse(cachedProvinces));
          return;
        }

        // If not in cache, fetch from public API
        const response = await fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json');
        const provincesData = await response.json();
        
        // Transform data to match our format
        const formattedProvinces = provincesData.map(province => ({
          id: province.id,
          name: province.name
        }));
        
        // Cache the provinces data
        localStorage.setItem('provinces', JSON.stringify(formattedProvinces));
        setProvinces(formattedProvinces);
      } catch (error) {
        console.error('Error loading provinces:', error);
        showNotification('Gagal memuat data provinsi. Silakan refresh halaman.', 'error');
      }
    };
    loadProvinces();
  }, [showNotification]);

  // Load cities when province is selected
  useEffect(() => {
    const loadCities = async () => {
      if (selectedProvince) {
        try {
          // Try to load from localStorage first
          const cacheKey = `cities-${selectedProvince}`;
          const cachedCities = localStorage.getItem(cacheKey);
          if (cachedCities) {
            setCities(JSON.parse(cachedCities));
            return;
          }

          // If not in cache, fetch from public API
          const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${selectedProvince}.json`);
          const citiesData = await response.json();
          
          // Transform data to match our format
          const formattedCities = citiesData.map(city => ({
            id: city.id,
            name: city.name
          }));
          
          // Cache the cities data
          localStorage.setItem(cacheKey, JSON.stringify(formattedCities));
          setCities(formattedCities);
        } catch (error) {
          console.error('Error loading cities:', error);
          showNotification('Gagal memuat data kota. Silakan coba lagi.', 'error');
        }
      }
    };
    loadCities();
  }, [selectedProvince, showNotification]);

  // Load districts when city is selected
  useEffect(() => {
    const loadDistricts = async () => {
      if (selectedCity) {
        try {
          // Try to load from localStorage first
          const cacheKey = `districts-${selectedCity}`;
          const cachedDistricts = localStorage.getItem(cacheKey);
          if (cachedDistricts) {
            setDistricts(JSON.parse(cachedDistricts));
            return;
          }

          // If not in cache, fetch from public API
          const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${selectedCity}.json`);
          const districtsData = await response.json();
          
          // Transform data to match our format
          const formattedDistricts = districtsData.map(district => ({
            id: district.id,
            name: district.name
          }));
          
          // Cache the districts data
          localStorage.setItem(cacheKey, JSON.stringify(formattedDistricts));
          setDistricts(formattedDistricts);
        } catch (error) {
          console.error('Error loading districts:', error);
          showNotification('Gagal memuat data kecamatan. Silakan coba lagi.', 'error');
        }
      }
    };
    loadDistricts();
  }, [selectedCity, showNotification]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProvinceChange = (e) => {
    const value = e.target.value;
    const selectedProvince = provinces.find(p => p.id === value);
    setSelectedProvince(value);
    setFormData(prev => ({
      ...prev,
      province: selectedProvince ? selectedProvince.name : '',
      city: '',
      district: '',
      postalCode: ''
    }));
  };

  const handleCityChange = (e) => {
    const value = e.target.value;
    const selectedCity = cities.find(c => c.id === value);
    setSelectedCity(value);
    setFormData(prev => ({
      ...prev,
      city: selectedCity ? selectedCity.name : '',
      district: '',
      postalCode: ''
    }));
  };

  const handleDistrictChange = (e) => {
    const value = e.target.value;
    setSelectedDistrict(value);
    setFormData(prev => ({
      ...prev,
      district: value
    }));
  };
  
  const handlePaymentTypeChange = (e) => {
    setPaymentType(e.target.value);
  };
  
  const handleDpPercentageChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 30 && value <= 90) {
      setDpPercentage(value);
    }
  };
  
  const handleDeliveryMethodChange = (e) => {
    setDeliveryMethod(e.target.value);
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name) errors.name = 'Nama wajib diisi';
    if (!formData.email) errors.email = 'Email wajib diisi';
    if (!formData.phone) errors.phone = 'Nomor telepon wajib diisi';
    if (deliveryMethod === 'delivery') {
      if (!formData.address) errors.address = 'Alamat wajib diisi';
      if (!formData.province) errors.province = 'Provinsi wajib dipilih';
      if (!formData.city) errors.city = 'Kota wajib dipilih';
      if (!formData.district) errors.district = 'Kecamatan wajib dipilih';
      if (!formData.postalCode) errors.postalCode = 'Kode pos wajib diisi';
    }
    
    if (Object.keys(errors).length > 0) {
      // Show validation errors
      for (const [field, message] of Object.entries(errors)) {
        showNotification(message, 'error');
      }
      return false;
    }
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Format order data for Snap token creation
      const orderData = {
        customer: user._id,
        items: items.map(item => {
          // Calculate total quantity across all sizes for this specific item
          const itemTotalQuantity = item.sizeBreakdown.reduce((sum, size) => sum + size.quantity, 0);
          
          // Ensure color and material are complete objects
          const materialForOrder = {
            id: item.material.id, // id dari material
            name: item.material.name,
            additionalPrice: item.material.additionalPrice || 0,
            // 'available' tidak perlu dikirim ke order item schema
          };

          const colorForOrder = {
            id: item.color.id, // id dari color
            name: item.color.name,
            code: item.color.code,
            // 'available' tidak perlu dikirim ke order item schema
          };
          
          return {
            product: item.productId, // ID produk
            productName: item.productName,
            productImage: item.productImage,
            sku: item.sku || `${item.productId}-${item.sizeBreakdown[0]?.size || 'std'}-${item.color?.name || 'std'}-${item.material?.name || 'std'}`.substring(0,50), // Pastikan SKU ada
            quantity: itemTotalQuantity, // Total kuantitas untuk item ini
            unitPrice: item.basePrice, // Harga dasar satuan produk
            dozenPrice: item.dozenPrice, // Harga lusin produk
            discount: item.discount || 0, // Diskon spesifik item (persentase)
            color: colorForOrder,
            material: materialForOrder,
            sizeBreakdown: item.sizeBreakdown.map(sb => ({
              size: sb.size,
              quantity: sb.quantity,
              additionalPrice: sb.additionalPrice || 0 
            })),
            customDesign: item.customDesign ? {
              isCustom: true,
              designUrl: item.customDesign.url || item.customDesign.designUrl || '',
              notes: item.customDesign.notes || '',
              customizationFee: item.customDesign.customizationFee || 0 // Biaya per unit
            } : null,
            notes: item.notes || '', // Catatan spesifik item dari keranjang
            
            // MODIFICATION: Cleanly map item.priceDetails from cart
            priceDetails: item.priceDetails ? {
              total: item.priceDetails.total,
              subtotal: item.priceDetails.subtotal,
              sizeDetails: item.priceDetails.sizeDetails,
              totalQuantity: item.priceDetails.totalQuantity,
              totalDozens: item.priceDetails.totalDozens,
              customDesignFee: item.priceDetails.customDesignFee,
              discountAmount: item.priceDetails.discountAmount,
              discountPercentage: item.priceDetails.discountPercentage,
              priceComponents: item.priceDetails.breakdown?.priceComponents || item.priceDetails.priceComponents || null
            } : null
          };
        }),
        status: "Pesanan Diterima",
        statusHistory: [
          {
            status: "Pesanan Diterima",
            changedBy: user._id,
            timestamp: new Date(),
            notes: "Order placed by customer"
          }
        ],
        shippingAddress: deliveryMethod === 'delivery' ? {
          street: formData.address,
          district: formData.district,
          city: formData.city,
          province: formData.province,
          postalCode: formData.postalCode
        } : {
          street: storeAddress.street,
          district: storeAddress.district,
          city: storeAddress.city,
          province: storeAddress.province,
          postalCode: storeAddress.postalCode
        },
        paymentDetails: {
          subtotal: total, // Ini adalah grand subtotal dari keranjang (sebelum diskon order)
          discount: 0, // Diskon level order (jika ada, belum diimplementasikan di sini)
          // customFees akan dihitung ulang di backend dan disimpan di paymentDetails.customFees
          // Jadi, customFees yang dikirim dari sini bisa diabaikan atau tidak perlu dikirim.
          total: total, // Ini adalah grand total dari keranjang
          downPayment: paymentType === 'dp' ? {
            required: true,
            percentage: dpPercentage,
            amount: dpAmount,
            status: 'pending'
          } : null,
          remainingPayment: paymentType === 'dp' ? {
            amount: total - dpAmount,
            status: 'pending'
          } : null,
          isPaid: false
        },
        deliveryMethod: deliveryMethod,
        isOfflineOrder: false,
        createdBy: user._id,
        notes: formData.notes
      };

      console.log('Cart items:', items);
      console.log('Processed order items:', orderData.items);
      
      // Create Snap payment
      const paymentResponse = await api.post('/payments/snap', {
        orderData,
        paymentType: paymentType === 'dp' ? 'downPayment' : 'fullPayment',
        amount: paymentType === 'dp' ? dpAmount : total,
        customerDetails: {
          firstName: formData.name,
          email: formData.email,
          phone: formData.phone,
          billingAddress: {
            firstName: formData.name,
            phone: formData.phone,
            address: deliveryMethod === 'delivery' ? formData.address : storeAddress.street,
            city: deliveryMethod === 'delivery' ? formData.city : storeAddress.city,
            postalCode: deliveryMethod === 'delivery' ? formData.postalCode : storeAddress.postalCode,
            countryCode: 'IDN'
          },
          shippingAddress: {
            firstName: formData.name,
            phone: formData.phone,
            address: deliveryMethod === 'delivery' ? formData.address : storeAddress.street,
            city: deliveryMethod === 'delivery' ? formData.city : storeAddress.city,
            postalCode: deliveryMethod === 'delivery' ? formData.postalCode : storeAddress.postalCode,
            countryCode: 'IDN'
          }
        }
      });

      console.log('Payment response:', paymentResponse.data);

      if (!paymentResponse.data.token) {
        throw new Error('No Snap token received from server');
      }

      // Remove existing script if any
      const existingScript = document.querySelector('script[src*="midtrans"]');
      if (existingScript) {
        existingScript.remove();
      }

      // Get Midtrans configuration from backend
      const configResponse = await getMidtransConfig();
      const { clientKey, snapUrl } = configResponse.data.config;

      // Load Midtrans Snap script
      const script = document.createElement('script');
      script.src = snapUrl;
      script.setAttribute('data-client-key', clientKey);
      
      script.onload = () => {
        console.log('Midtrans Snap script loaded');
        
        // Initialize Snap
        window.snap.pay(paymentResponse.data.token, {
          onSuccess: async function(result) {
            console.log('Payment success:', result);
            try {
              // Update order payment status
              await api.post('/payments/confirm', {
                orderId: paymentResponse.data.order._id,
                transactionId: result.transaction_id,
                paymentType: paymentType === 'dp' ? 'downPayment' : 'fullPayment',
                amount: paymentType === 'dp' ? dpAmount : total,
                status: 'success',
                paymentMethod: result.payment_type,
                transactionTime: result.transaction_time
              });
              
              showNotification('Pembayaran berhasil!', 'success');
              clearCart();
              navigate('/customer/orders');
            } catch (error) {
              console.error('Error updating payment status:', error);
              showNotification('Pembayaran berhasil, tapi gagal memperbarui status. Tim kami akan memverifikasi pembayaran Anda.', 'warning');
              navigate('/customer/orders');
            }
          },
          onPending: async function(result) {
            console.log('Payment pending:', result);
            try {
              // Update order status to pending
              await api.post('/payments/confirm', {
                orderId: paymentResponse.data.order._id,
                transactionId: result.transaction_id,
                paymentType: paymentType === 'dp' ? 'downPayment' : 'fullPayment',
                amount: paymentType === 'dp' ? dpAmount : total,
                status: 'pending',
                paymentMethod: result.payment_type,
                transactionTime: result.transaction_time
              });
              
              showNotification('Menunggu pembayaran...', 'info');
              navigate('/customer/orders');
            } catch (error) {
              console.error('Error updating payment status:', error);
              showNotification('Status pembayaran: Menunggu. Tim kami akan memverifikasi pembayaran Anda.', 'warning');
              navigate('/customer/orders');
            }
          },
          onError: function(result) {
            console.error('Payment error:', result);
            showNotification('Pembayaran gagal, silakan coba lagi', 'error');
            navigate('/customer/orders');
          },
          onClose: function() {
            console.log('Payment popup closed');
            showNotification('Pembayaran dibatalkan', 'warning');
            navigate('/customer/orders');
          }
        });
      };

      script.onerror = (error) => {
        console.error('Failed to load Midtrans Snap script:', error);
        showNotification('Gagal memuat halaman pembayaran', 'error');
      };
      
      document.body.appendChild(script);
      
    } catch (error) {
      console.error('Error creating payment:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Gagal membuat pembayaran';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Informasi Pemesanan
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Contact Information */}
                <FormSection title="Informasi Kontak">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Nama Lengkap"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Masukkan nama lengkap"
                    />
                    
                    <InputField
                      label="Email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="contoh@email.com"
                    />
                    
                    <InputField
                      label="Nomor Telepon (WhatsApp)"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                </FormSection>
                
                {/* Delivery Method */}
                <FormSection title="Metode Pengiriman">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div
                        className={`p-4 border rounded-lg cursor-pointer transition-all transform hover:scale-[1.02] ${
                          deliveryMethod === 'pickup'
                            ? 'border-blue-500 bg-blue-50 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleDeliveryMethodChange({ target: { value: 'pickup' } })}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="deliveryMethod"
                            value="pickup"
                            checked={deliveryMethod === 'pickup'}
                            onChange={handleDeliveryMethodChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <label className="ml-3 block text-sm font-medium text-gray-700">
                            Ambil di Toko
                          </label>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          Ambil pesanan Anda langsung di toko kami
                        </p>
                        {deliveryMethod === 'pickup' && (
                          <div className="mt-2 text-sm text-gray-600 bg-white p-3 rounded-md border border-gray-100">
                            <p className="font-medium mb-1">Alamat Toko:</p>
                            <p>{storeAddress.street}</p>
                            <p>{storeAddress.district}, {storeAddress.subdistrict}</p>
                            <p>{storeAddress.city}, {storeAddress.province}</p>
                            <p>Kode Pos: {storeAddress.postalCode}</p>
                          </div>
                        )}
                      </div>
                      
                      <div
                        className={`p-4 border rounded-lg cursor-pointer transition-all transform hover:scale-[1.02] ${
                          deliveryMethod === 'delivery'
                            ? 'border-blue-500 bg-blue-50 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleDeliveryMethodChange({ target: { value: 'delivery' } })}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="deliveryMethod"
                            value="delivery"
                            checked={deliveryMethod === 'delivery'}
                            onChange={handleDeliveryMethodChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <label className="ml-3 block text-sm font-medium text-gray-700">
                            Antar ke Alamat
                          </label>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          Pesanan akan dikirim ke alamat yang Anda berikan
                        </p>
                      </div>
                    </div>
                    
                    {deliveryMethod === 'delivery' && (
                      <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <InputField
                          label="Alamat Lengkap"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                          placeholder="Masukkan alamat lengkap"
                          multiline
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <SelectField
                            label="Provinsi"
                            name="province"
                            value={selectedProvince}
                            onChange={handleProvinceChange}
                            required
                            options={provinces.map(province => ({
                              value: province.id,
                              label: province.name
                            }))}
                            placeholder="Pilih provinsi"
                          />

                          <SelectField
                            label="Kota/Kabupaten"
                            name="city"
                            value={selectedCity}
                            onChange={handleCityChange}
                            required
                            options={cities.map(city => ({
                              value: city.id,
                              label: city.name
                            }))}
                            placeholder="Pilih kota/kabupaten"
                            disabled={!selectedProvince}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <SelectField
                            label="Kecamatan"
                            name="district"
                            value={selectedDistrict}
                            onChange={handleDistrictChange}
                            required
                            options={districts.map(district => ({
                              value: district.id,
                              label: district.name
                            }))}
                            placeholder="Pilih kecamatan"
                            disabled={!selectedCity}
                          />

                          <InputField
                            label="Kode Pos"
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleInputChange}
                            required
                            placeholder="Masukkan kode pos"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </FormSection>
                
                {/* Payment Type */}
                <FormSection title="Tipe Pembayaran">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div
                        className={`p-4 border rounded-lg cursor-pointer transition-all transform hover:scale-[1.02] ${
                          paymentType === 'full'
                            ? 'border-blue-500 bg-blue-50 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handlePaymentTypeChange({ target: { value: 'full' } })}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="paymentType"
                            value="full"
                            checked={paymentType === 'full'}
                            onChange={handlePaymentTypeChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <label className="ml-3 block text-sm font-medium text-gray-700">
                            Bayar Penuh
                          </label>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          Bayar total pesanan sekaligus
                        </p>
                      </div>
                      
                      <div
                        className={`p-4 border rounded-lg cursor-pointer transition-all transform hover:scale-[1.02] ${
                          paymentType === 'dp'
                            ? 'border-blue-500 bg-blue-50 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handlePaymentTypeChange({ target: { value: 'dp' } })}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="paymentType"
                            value="dp"
                            checked={paymentType === 'dp'}
                            onChange={handlePaymentTypeChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <label className="ml-3 block text-sm font-medium text-gray-700">
                            Uang Muka (DP)
                          </label>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          Bayar sebagian dari total pesanan
                        </p>
                      </div>
                    </div>
                    
                    {paymentType === 'dp' && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Persentase DP ({dpPercentage}%)
                        </label>
                        <input
                          type="range"
                          min="30"
                          max="90"
                          step="5"
                          value={dpPercentage}
                          onChange={handleDpPercentageChange}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="mt-2 text-sm flex items-center justify-between">
                          <span className="text-gray-600">Minimal 30%</span>
                          <span className="font-medium text-blue-600">Jumlah DP: {formatCurrency(dpAmount)}</span>
                          <span className="text-gray-600">Maksimal 90%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </FormSection>
                
                {/* Notes */}
                <FormSection title="Catatan Pengiriman">
                  <InputField
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Masukkan catatan Pengiriman (opsional)"
                    multiline
                  />
                </FormSection>
                
                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    label={loading ? 'Memproses...' : 'Lanjut ke Pembayaran'}
                    variant="primary"
                    fullWidth
                    disabled={loading}
                    className="py-3 text-lg font-medium transition-all"
                    icon={
                      loading ? (
                        <svg className="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      )
                    }
                  />
                </div>
              </form>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;