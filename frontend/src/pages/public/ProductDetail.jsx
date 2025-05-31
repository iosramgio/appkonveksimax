import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '../../components/common/Button';
import DesignUploader from '../../components/products/DesignUploader';
import { formatCurrency } from '../../utils/formatter';
import { useCart } from '../../hooks/useCart';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';
import { useAuth } from '../../hooks/useAuth';
import { calculatePrice, calculatePriceBreakdown } from '../../utils/pricingCalculator';
import { getProductById, uploadDesign } from '../../api/products';
import axios from 'axios';

const PriceDetails = ({ priceDetails, customDesign }) => {
  // Penanganan jika data belum tersedia
  if (!priceDetails || !priceDetails.sizeDetails || priceDetails.sizeDetails.length === 0) {
    return (
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Detail Harga</h3>
        <p className="text-gray-500">Pilih ukuran, material, dan jumlah untuk melihat detail harga.</p>
      </div>
    );
  }

  // Hitung total quantity dan jumlah lusin
  const totalQuantity = priceDetails.totalQuantity || 0;
  const totalDozens = priceDetails.totalDozens || Math.floor(totalQuantity / 12);
  const totalDozenQty = priceDetails.totalDozenQty || (totalDozens * 12);
  const totalUnitQty = priceDetails.unitQuantity || (totalQuantity - totalDozenQty);

  // Kelompokkan detail berdasarkan jenis harga (lusin/satuan)
  const dozenItems = [];
  const unitItems = []; // Deklarasikan unitItems di luar kondisional
  
  // Ketika total quantity >= 12, semua item menggunakan harga lusin
  if (totalQuantity >= 12 && priceDetails.dozenPrice > 0) {
    priceDetails.sizeDetails.forEach(detail => {
      dozenItems.push({
        ...detail,
        isDozen: true
      });
    });
  } else {
    // Jika tidak, gunakan logika original
    priceDetails.sizeDetails.forEach(detail => {
      if (detail.priceType === 'dozen' || (detail.dozenQuantity && detail.dozenQuantity > 0)) {
        dozenItems.push({
          ...detail,
          isDozen: true
        });
      } else {
        unitItems.push({
          ...detail,
          isDozen: false
        });
      }
    });
  }

  // Urutkan berdasarkan ukuran
  const sortItems = items => {
    if (!items) return [];
    
    return items.sort((a, b) => {
      const sizeA = a.size.replace(/[^0-9]/g, '') || '0';
      const sizeB = b.size.replace(/[^0-9]/g, '') || '0';
      return parseInt(sizeA) - parseInt(sizeB);
    });
  };

  const sortedDozenItems = sortItems(dozenItems);
  // Hanya gunakan unitItems jika tidak semua item menggunakan harga lusin
  const sortedUnitItems = totalQuantity >= 12 && priceDetails.dozenPrice > 0 ? [] : sortItems(unitItems);

  // Format jumlah lusin
  const formatDozenDisplay = (quantity) => {
    const dozens = quantity / 12;
    if (dozens >= 1) {
      return `(${dozens} lusin)`;
    }
    return '';
  };

  return (
    <div className="mt-8 bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4">Detail Harga</h3>
      
      {/* Ringkasan Kuantitas */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-2">Ringkasan Pesanan:</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
            <p>Total Kuantitas: {totalQuantity} pcs</p>
            {totalDozens > 0 && (
              <p className="text-green-600">
                Harga Lusin: {totalDozens} lusin ({totalDozenQty} pcs)
              </p>
            )}
        </div>
        </div>
      </div>

      {/* Tabel Detail Harga */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Ukuran & Material</th>
              <th className="px-4 py-2 text-center">Kuantitas</th>
              <th className="px-4 py-2 text-right">Harga Satuan</th>
              <th className="px-4 py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {/* Tampilkan item dengan harga lusin */}
            {sortedDozenItems.map((detail, index) => (
              <tr key={`dozen-${detail.size}-${index}`} className="bg-green-50">
                <td className="px-4 py-3">
                  <div className="font-medium">{detail.size} (Harga Lusin)</div>
                  <div className="text-sm text-gray-600">Material: {detail.material}</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div>{detail.quantity} pcs</div>
                  <div className="text-xs text-gray-600">
                    {totalDozens > 0 && `${totalDozens} lusin + ${totalQuantity % 12} pcs`}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div>{formatCurrency(detail.pricePerUnit)}</div>
                  <div className="text-sm text-gray-600">per pcs</div>
                </td>
                <td className="px-4 py-3 text-right">
                  {formatCurrency(detail.subtotal)}
                </td>
              </tr>
            ))}

            {/* Tampilkan item dengan harga satuan jika ada */}
            {sortedUnitItems.length > 0 && sortedUnitItems.map((detail, index) => (
              <tr key={`unit-${detail.size}-${index}`}>
                <td className="px-4 py-3">
                  <div className="font-medium">{detail.size} (Harga Satuan)</div>
                  <div className="text-sm text-gray-600">Material: {detail.material}</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div>{detail.quantity} pcs</div>
                  <div className="text-xs text-gray-600">
                    {totalDozens > 0 && `${totalDozens} lusin + ${totalQuantity % 12} pcs`}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div>{formatCurrency(detail.pricePerUnit)}</div>
                  <div className="text-sm text-gray-600">per pcs</div>
                </td>
                <td className="px-4 py-3 text-right">
                  {formatCurrency(detail.subtotal)}
                </td>
              </tr>
            ))}

            {/* Custom Design Fee */}
            {customDesign && (
              <tr className={priceDetails.customDesignFee > 0 ? "bg-blue-50" : ""}>
                <td className="px-4 py-3" colSpan="2">
                  <div className="font-medium">Biaya Desain Custom</div>
                  {customDesign.notes && (
                    <div className="text-sm text-gray-600">
                      Catatan: {customDesign.notes}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {priceDetails.customDesignFee > 0 ? (
                    <>
                      <div>{formatCurrency(priceDetails.customDesignFee / totalQuantity)}</div>
                      <div className="text-sm text-gray-600">per pcs</div>
                    </>
                  ) : (
                    <div className="text-green-600">Gratis</div>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {priceDetails.customDesignFee > 0 ? 
                    formatCurrency(priceDetails.customDesignFee) : 
                    <span className="text-green-600">Rp 0</span>
                  }
                </td>
              </tr>
            )}

            {/* Subtotal */}
            <tr className="font-medium bg-gray-50">
              <td colSpan="3" className="px-4 py-3 text-right">Subtotal:</td>
              <td className="px-4 py-3 text-right">{formatCurrency(priceDetails.subtotal)}</td>
            </tr>

            {/* Diskon */}
            {priceDetails.discountPercentage > 0 && (
              <tr className="text-green-600">
                <td colSpan="3" className="px-4 py-3 text-right">
                  Diskon ({priceDetails.discountPercentage}%):
                </td>
                <td className="px-4 py-3 text-right">
                  -{formatCurrency(priceDetails.discountAmount)}
                </td>
              </tr>
            )}

            {/* Total */}
            <tr className="font-bold text-lg bg-gray-50">
              <td colSpan="3" className="px-4 py-3 text-right">Total:</td>
              <td className="px-4 py-3 text-right text-primary">
                {formatCurrency(priceDetails.total)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Catatan Harga */}
      <div className="mt-4 text-sm text-gray-600">
        <p>* Harga lusin diterapkan untuk setiap 12 pcs</p>
        {priceDetails.discountPercentage > 0 && (
          <p>* Diskon {priceDetails.discountPercentage}% diterapkan untuk total pembelian</p>
        )}
      </div>
    </div>
  );
};

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customDesign, setCustomDesign] = useState(null);
  const [showDesignUploader, setShowDesignUploader] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [notes, setNotes] = useState('');
  const [priceDetails, setPriceDetails] = useState({
    total: 0,
    breakdown: {
      totalDozenSubtotal: 0,
      totalUnitSubtotal: 0,
      discountPercentage: 0,
      priceComponents: {
    basePrice: 0,
    dozenPrice: 0,
    customizationFee: 0
      }
    },
    sizeDetails: []
  });
  const [sizeBreakdown, setSizeBreakdown] = useState([]);
  const [sizeBreakdownError, setSizeBreakdownError] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  
  const { addToCart } = useCart();
  const api = useApi();
  const { showNotification } = useNotification();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Tambahkan ref untuk mencegah pembaruan berulang
  const lastUpdateDataRef = useRef(null);
  
  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      // Fixed API call to use proper utility function instead of direct axios call
      const { success, data, error } = await getProductById(productId);
      
      if (!success) {
        console.error('Error fetching product details:', error);
        toast.error('Gagal mengambil detail produk');
        setLoading(false);
        return;
      }
      
      // Periksa format respons dan ambil data produk
      const productData = data.product || data;
      
      console.log('Received product data:', productData);
      console.log('Product images:', productData.images);
      
      setProduct(productData);
      
      // Set default selections
      if (productData.sizes && productData.sizes.length > 0) {
        setSelectedSize(productData.sizes[0].size);
      }
      if (productData.colors && productData.colors.length > 0) {
        setSelectedColor(productData.colors[0]._id);
      }
      if (productData.materials && productData.materials.length > 0) {
        setSelectedMaterial(productData.materials[0].name);
      }
      
      // Update price after fetching product
      setTimeout(() => {
        updatePrice();
      }, 100);
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast.error('Gagal mengambil detail produk');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProductDetail();
  }, [productId]);
  
  // Membuat versi yang dioptimasi dari updatePrice untuk mencegah pemanggilan berulang
  const updatePrice = useCallback(async () => {
    if (!product || !selectedSize || !selectedMaterial || !quantity) return;

    // Buat string gabungan parameter penting untuk membandingkan dengan pembaruan sebelumnya
    const updateKey = JSON.stringify({
      productId: product._id,
      selectedSize,
      selectedMaterial,
      quantity,
      customDesignId: customDesign?.url || '',
      sizeBreakdown: sizeBreakdown.map(item => ({
        size: item.size,
        quantity: item.quantity
      })),
      sizeBreakdownError
    });

    // Jika parameter sama persis dengan yang sebelumnya, hentikan operasi
    if (updateKey === lastUpdateDataRef.current) {
      return;
    }

    // Simpan parameter saat ini untuk perbandingan berikutnya
    lastUpdateDataRef.current = updateKey;

    try {
      // Get selected material object
      const selectedMaterialObj = product.materials.find(m => 
        m.name === selectedMaterial || m._id === selectedMaterial
      );

      if (!selectedMaterialObj) {
        console.error('Material tidak ditemukan:', selectedMaterial);
        return;
      }

      // Prepare size breakdown
      let sizeItems = [];
      
      if (sizeBreakdown && sizeBreakdown.length > 0 && !sizeBreakdownError) {
        sizeItems = sizeBreakdown.map(item => {
          const sizeObj = product.sizes.find(s => s.size === item.size);
          return {
            size: item.size,
            material: selectedMaterialObj.name,
            quantity: parseInt(item.quantity || 0),
            additionalPrice: sizeObj?.additionalPrice || 0
          };
        });
      } else {
        // If no size breakdown, use single size
        const sizeObj = product.sizes.find(s => s.size === selectedSize);
        sizeItems = [{
          size: selectedSize,
          material: selectedMaterialObj.name,
          quantity: quantity,
          additionalPrice: sizeObj?.additionalPrice || 0
        }];
      }

      // Calculate price using the utility function
      const priceDetails = calculatePriceBreakdown({
        sizeBreakdown: sizeItems,
        product: {
          basePrice: product.basePrice,
          dozenPrice: product.dozenPrice,
          discount: product.discount || 0,
          customizationFee: product.customizationFee || 0
        },
        material: {
          name: selectedMaterialObj.name,
          additionalPrice: selectedMaterialObj.additionalPrice || 0
        },
        customDesign: customDesign ? {
          isCustom: true,
          customizationFee: customDesign.customizationFee || product.customizationFee || 0
        } : null
      });

      setPriceDetails(priceDetails);
      setTotalPrice(priceDetails.total);
    } catch (error) {
      console.error('Error calculating price:', error);
      toast.error('Gagal menghitung harga');
    }
  }, [product, selectedSize, selectedMaterial, quantity, customDesign, sizeBreakdown, sizeBreakdownError]);
  
  // Modifikasi useEffect untuk updatePrice dengan debounce
  useEffect(() => {
    if (product) {
      // Gunakan timeout untuk memberikan 'debounce' dan mencegah panggilan berulang
      const timeoutId = setTimeout(() => {
        updatePrice();
      }, 300); // tunggu 300ms sebelum recalculate
      
      return () => clearTimeout(timeoutId); // cleanup function
    }
  }, [product, selectedColor, selectedMaterial, quantity, customDesign, sizeBreakdown, updatePrice]);
  
  useEffect(() => {
    if (product) {
      updatePrice();
    }
  }, [product, selectedColor, selectedMaterial, quantity, customDesign, sizeBreakdown]);
  
  // Tambahkan useEffect untuk mengupdate sizeBreakdown saat quantity berubah
  useEffect(() => {
    if (product && sizeBreakdown.length > 0) {
      // Hanya update jika total sizeBreakdown tidak sama dengan quantity
      const totalSizeQuantity = sizeBreakdown.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
      
      if (totalSizeQuantity !== quantity) {
        // Distribusikan jumlah quantity ke semua ukuran secara merata
        const sizeCount = sizeBreakdown.length;
        const baseQty = Math.floor(quantity / sizeCount);
        const remainder = quantity % sizeCount;
        
        const newBreakdown = sizeBreakdown.map((item, index) => ({
          ...item,
          quantity: index < remainder ? baseQty + 1 : baseQty
        }));
        
        setSizeBreakdown(newBreakdown);
        setSizeBreakdownError('');
      }
    } else if (product && product.sizes && product.sizes.length > 0 && sizeBreakdown.length === 0) {
      // Inisialisasi sizeBreakdown dengan ukuran pertama jika belum ada
      setSizeBreakdown([{
        size: product.sizes[0].size,
        quantity: quantity
      }]);
    }
  }, [quantity, product]);
  
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
      // Selalu validasi ulang rincian ukuran saat jumlah berubah
      validateSizeBreakdown(sizeBreakdown, value);
    }
  };
  
  const validateSizeBreakdown = (breakdown, totalQuantity) => {
    // Jika belum ada rincian ukuran, tidak perlu menampilkan error
    if (breakdown.length === 0) {
      setSizeBreakdownError('');
      return;
    }

    const total = breakdown.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
    if (total > totalQuantity) {
      setSizeBreakdownError(`Total rincian ukuran (${total}) melebihi jumlah pesanan (${totalQuantity})`);
    } else if (total < totalQuantity) {
      setSizeBreakdownError(`Total rincian ukuran (${total}) kurang dari jumlah pesanan (${totalQuantity})`);
    } else {
      setSizeBreakdownError('');
    }
  };

  const handleSizeBreakdownChange = (index, field, value) => {
    const newBreakdown = [...sizeBreakdown];
    newBreakdown[index] = {
      ...newBreakdown[index],
      [field]: value
    };
    setSizeBreakdown(newBreakdown);
    validateSizeBreakdown(newBreakdown, quantity);
  };

  const addSizeBreakdown = () => {
    if (sizeBreakdown.length < product.sizes.length) {
      // Cari ukuran yang belum dipilih
      const availableSizes = product.sizes.filter(
        sizeObj => !sizeBreakdown.some(item => item.size === sizeObj.size)
      );
      
      if (availableSizes.length > 0) {
        const newBreakdown = [...sizeBreakdown, { 
          size: availableSizes[0].size, 
          quantity: '' 
        }];
        setSizeBreakdown(newBreakdown);
        validateSizeBreakdown(newBreakdown, quantity);
      }
    }
  };

  const removeSizeBreakdown = (index) => {
    const newBreakdown = sizeBreakdown.filter((_, i) => i !== index);
    setSizeBreakdown(newBreakdown);
    validateSizeBreakdown(newBreakdown, quantity);
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
  };
  
  const handleColorChange = (colorId) => {
    setSelectedColor(colorId);
  };
  
  const handleMaterialChange = (materialId) => {
    // Cari nama material berdasarkan ID
    const selectedMaterialObj = product.materials.find(m => m._id === materialId);
    if (selectedMaterialObj) {
      setSelectedMaterial(selectedMaterialObj.name);
    }
  };
  
  const handleCustomDesignUpload = async (designData) => {
    try {
      // Periksa apakah user sudah login
      if (!isAuthenticated) {
        toast.error('Anda harus login terlebih dahulu untuk mengupload desain');
        navigate('/login', { state: { from: `/products/${productId}` } });
        return;
      }

      // Use the uploadDesign function from the products API
      const { success, data, error } = await uploadDesign(designData.file, {
        notes: designData.notes || ''
      }, (progress) => {
        console.log('Upload progress:', progress);
      });
      
      if (!success) {
        throw new Error(error || 'Failed to upload design');
      }
      
      if (data && data.url) {
        // Save the design data with cloudinary URL
        const customizationFee = product?.customizationFee || 0;
        
        setCustomDesign({
          ...designData,
          url: data.url,
          designUrl: data.url, // For backward compatibility
          isCustom: true,
          customizationFee: customizationFee
        });
      } else {
        throw new Error('Failed to get upload URL');
      }
      
      setShowDesignUploader(false);
    } catch (error) {
      console.error('Error uploading design:', error);
      toast.error('Gagal mengupload desain: ' + (error.message || 'Unknown error'));
    }
  };
  
  const validateCartItem = () => {
    const errors = [];

    // Validate authentication
    if (!isAuthenticated) {
      showNotification('error', 'Silakan login terlebih dahulu untuk menambahkan produk ke keranjang');
      navigate('/login', { state: { from: `/products/${productId}` } });
      return { isValid: false, errors, shouldRedirect: true };
    }

    // Validate product
    if (!product) {
      errors.push('Produk tidak ditemukan');
      return { isValid: false, errors };
    }

    // Validate quantity
    if (quantity <= 0) {
      errors.push('Jumlah produk harus lebih dari 0');
    }

    // Validate color selection
    if (!selectedColor) {
      errors.push('Pilih warna produk terlebih dahulu');
    }

    // Validate material selection
    if (!selectedMaterial) {
      errors.push('Pilih material produk terlebih dahulu');
    }

    // Validate size breakdown
    if (!sizeBreakdown || Object.keys(sizeBreakdown).length === 0) {
      errors.push('Pilih ukuran produk terlebih dahulu');
    } else if (sizeBreakdownError) {
      errors.push(sizeBreakdownError);
    }

    // Validate custom design if selected
    if (showDesignUploader && !customDesign) {
      errors.push('Upload desain kustom terlebih dahulu');
    }

    // Validate size breakdown quantities
    const invalidSize = sizeBreakdown.find(item => {
      const sizeQuantity = parseInt(item.quantity);
      return isNaN(sizeQuantity) || sizeQuantity < 1;
    });

    if (invalidSize) {
      errors.push(`Jumlah untuk ukuran ${invalidSize.size} tidak valid`);
    }

    // Validate total quantity matches size breakdown
    const totalSizeQuantity = sizeBreakdown.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
    if (totalSizeQuantity !== quantity) {
      errors.push('Total jumlah ukuran tidak sesuai dengan jumlah pesanan');
    }

    return { 
      isValid: errors.length === 0, 
      errors,
      shouldRedirect: false
    };
  };

  const handleAddToCart = () => {
    try {
      const validation = validateCartItem();
      if (!validation.isValid) {
        if (validation.shouldRedirect) return;
        validation.errors.forEach(error => toast.error(error));
        return;
      }

      // Find selected color and material objects
      const selectedColorObj = product.colors.find(c => c._id === selectedColor);
      const selectedMaterialObj = product.materials.find(m => m.name === selectedMaterial) || 
        product.materials.find(m => m._id === selectedMaterial);

      // Validate that we found both color and material
      if (!selectedColorObj) {
        toast.error('Warna yang dipilih tidak valid');
        return;
      }

      if (!selectedMaterialObj) {
        toast.error('Material yang dipilih tidak valid');
        return;
      }

      // Prepare size breakdown for cart
      const preparedSizeBreakdown = sizeBreakdown.map(item => {
        const sizeObj = product.sizes.find(s => s.size === item.size);
        return {
          size: item.size,
          quantity: parseInt(item.quantity),
          additionalPrice: sizeObj ? sizeObj.additionalPrice : 0
        };
      });

      // Prepare customDesign object without the File object
      let customDesignForCart = null;
      if (customDesign) {
        customDesignForCart = {
          url: customDesign.url || '',
          designUrl: customDesign.designUrl || customDesign.url || '',
          notes: customDesign.notes || '',
          customizationFee: product.customizationFee
        };
      }

      const cartItem = {
        productId: product._id,
        productName: product.name,
        productImage: product.images && product.images.length > 0 ? 
          (product.images[0].url || product.images[0]) : 
          'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%22100%22 height%3D%22100%22 viewBox%3D%220 0 100 100%22%3E%3Crect width%3D%22100%22 height%3D%22100%22 fill%3D%22%23f1f5f9%22%2F%3E%3Ctext x%3D%2250%22 y%3D%2250%22 font-family%3D%22Arial%22 font-size%3D%2212%22 text-anchor%3D%22middle%22 dominant-baseline%3D%22middle%22 fill%3D%22%2364748b%22%3ENo Image%3C%2Ftext%3E%3C%2Fsvg%3E',
        quantity,
        color: {
          id: selectedColorObj._id,
          name: selectedColorObj.name,
          code: selectedColorObj.code
        },
        material: {
          id: selectedMaterialObj._id,
          name: selectedMaterialObj.name,
          additionalPrice: selectedMaterialObj.additionalPrice || 0
        },
        sizeBreakdown: preparedSizeBreakdown,
        customDesign: customDesignForCart,
        notes: notes,
        basePrice: product.basePrice,
        dozenPrice: product.dozenPrice,
        discount: product.discount || 0
      };

      console.log('Adding to cart:', cartItem);
      addToCart(cartItem);
      toast.success('Produk berhasil ditambahkan ke keranjang');
      navigate('/customer/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Gagal menambahkan produk ke keranjang: ' + (error.message || 'Unknown error'));
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-lg text-gray-600">Produk tidak ditemukan</p>
        <Link
          to="/products"
          className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Kembali ke Produk
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[activeImageIndex].url || product.images[activeImageIndex]}
                alt={product.name}
                className="w-full h-96 object-contain"
                onError={(e) => {
                  console.error('Image failed to load:', product.images[activeImageIndex]);
                  e.target.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%22400%22 height%3D%22400%22 viewBox%3D%220 0 400 400%22%3E%3Crect width%3D%22400%22 height%3D%22400%22 fill%3D%22%23f1f5f9%22%2F%3E%3Ctext x%3D%22200%22 y%3D%22200%22 font-family%3D%22Arial%22 font-size%3D%2224%22 text-anchor%3D%22middle%22 dominant-baseline%3D%22middle%22 fill%3D%22%2364748b%22%3EImage Not Found%3C%2Ftext%3E%3C%2Fsvg%3E';
                }}
              />
            ) : (
              <div className="w-full h-96 bg-gray-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`bg-white rounded-lg overflow-hidden ${
                    activeImageIndex === index ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <img
                    src={image.url || image}
                    alt={`${product.name} preview ${index + 1}`}
                    className="w-full h-16 object-cover"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%22100%22 height%3D%22100%22 viewBox%3D%220 0 100 100%22%3E%3Crect width%3D%22100%22 height%3D%22100%22 fill%3D%22%23f1f5f9%22%2F%3E%3Ctext x%3D%2250%22 y%3D%2250%22 font-family%3D%22Arial%22 font-size%3D%2212%22 text-anchor%3D%22middle%22 dominant-baseline%3D%22middle%22 fill%3D%22%2364748b%22%3EThumbnail%3C%2Ftext%3E%3C%2Fsvg%3E';
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Price Details Section */}
          <PriceDetails priceDetails={priceDetails} customDesign={customDesign} />
        </div>
        
        <div>
          <h1 className="text-3xl font-semibold">{product.name}</h1>
          
          <div className="mt-6 space-y-6">
            <div>
              <h2 className="font-medium mb-2">Deskripsi</h2>
              <p className="text-gray-600">{product.description}</p>
            </div>
            
            <div>
              <h2 className="font-medium mb-2">Jumlah</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <button
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    className="px-3 py-1 border border-gray-300 rounded-l-md bg-gray-100"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={handleQuantityChange}
                    min="1"
                    className="w-16 px-3 py-1 border-t border-b border-gray-300 text-center"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 border border-gray-300 rounded-r-md bg-gray-100"
                  >
                    +
                  </button>
                  
                  <span className="ml-4 text-sm text-gray-600">
                    {quantity} unit {quantity >= 12 && `(${Math.floor(quantity / 12)} lusin${quantity % 12 > 0 ? ` + ${quantity % 12} unit` : ''})`}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-medium">Rincian Ukuran</h2>
                <button
                  onClick={addSizeBreakdown}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Sesuaikan Ukuran
                </button>
              </div>
              
              <div className="space-y-3">
                {sizeBreakdown.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <select
                      value={item.size}
                      onChange={(e) => handleSizeBreakdownChange(index, 'size', e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                    >
                      {product?.sizes?.map((sizeObj) => (
                        <option
                          key={sizeObj.size}
                          value={sizeObj.size}
                          disabled={sizeBreakdown.some((item, i) => i !== index && item.size === sizeObj.size)}
                        >
                          {sizeObj.size}
                        </option>
                      ))}
                    </select>
                    
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleSizeBreakdownChange(index, 'quantity', e.target.value)}
                      min="1"
                      placeholder="Jumlah"
                      className="w-24 border border-gray-300 rounded-md px-3 py-2"
                    />
                    
                    <button
                      onClick={() => removeSizeBreakdown(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
                
                {sizeBreakdownError && (
                  <p className="text-sm text-red-600">{sizeBreakdownError}</p>
                )}
              </div>
            </div>
            
            <div>
              <h2 className="font-medium mb-2">Warna</h2>
              <div className="flex flex-wrap gap-3">
                {product?.colors?.map((color) => (
                  <button
                    key={color._id}
                    onClick={() => handleColorChange(color._id)}
                    className={`w-8 h-8 rounded-full ${
                      selectedColor === color._id
                        ? 'ring-2 ring-offset-2 ring-[#620000]'
                        : ''
                    }`}
                    style={{ backgroundColor: color.code }}
                    title={color.name}
                  ></button>
                ))}
              </div>
            </div>
            
            <div>
              <h2 className="font-medium mb-2">Bahan</h2>
              <div className="flex flex-wrap gap-2">
                {product?.materials?.map((material) => (
                  <button
                    key={material._id}
                    onClick={() => handleMaterialChange(material._id)}
                    className={`px-3 py-1 border rounded-md ${
                      selectedMaterial === material.name
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                    }`}
                  >
                    {material.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h2 className="font-medium mb-2">Desain</h2>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="default-design"
                    name="design-option"
                    checked={!customDesign && !showDesignUploader}
                    onChange={() => {
                      setCustomDesign(null);
                      setShowDesignUploader(false);
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="default-design" className="ml-2 text-sm text-gray-700">
                    Gunakan desain default (polos)
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="custom-design"
                    name="design-option"
                    checked={customDesign || showDesignUploader}
                    onChange={() => setShowDesignUploader(true)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="custom-design" className="ml-2 text-sm text-gray-700">
                    Upload Desain Anda (Diskusikan dengan Admin Terlebih Dahulu)
                  </label>
                </div>
              </div>
              
              {showDesignUploader && (
                <div className="mt-4">
                  <DesignUploader
                    onUpload={handleCustomDesignUpload}
                    onCancel={() => {
                      setShowDesignUploader(false);
                      setCustomDesign(null);
                    }}
                    designFee={product.customizationFee}
                  />
                </div>
              )}
              
              {customDesign && !showDesignUploader && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">Desain Kustom</p>
                      <p className="text-sm text-gray-600">{customDesign.file.name}</p>
                    </div>
                    <button
                      onClick={() => setShowDesignUploader(true)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Ubah
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <h2 className="font-medium mb-2">Catatan Tambahan (Opsional)</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tambahkan catatan khusus untuk pesanan ini..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            
            <div>
              <Button
                label="Tambahkan ke Keranjang"
                onClick={handleAddToCart}
                fullWidth={true}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;