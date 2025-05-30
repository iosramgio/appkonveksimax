import React, { useState, useEffect } from 'react';
import InputField from '../forms/InputField';
import SelectField from '../forms/SelectField';
import FormSection from '../forms/FormSection';
import Button from '../common/Button';
import FileUpload from '../forms/FileUpload';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';
import { formatCurrency } from '../../utils/formatter';
import { calculatePriceBreakdown, calculateDeposit } from '../../utils/pricingCalculator';
import { useNavigate } from 'react-router-dom';
import CustomerSearchModal from '../modals/CustomerSearchModal';

const OrderForm = ({ onSubmit, isEditing = false, initialData = null, isOfflineOrder = false }) => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetailsLoading, setProductDetailsLoading] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [colors, setColors] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [dpAmount, setDpAmount] = useState(0);
  const [dpPercentage, setDpPercentage] = useState(30);
  const [loading, setLoading] = useState(false);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [cashReceived, setCashReceived] = useState(0);
  const [changeAmount, setChangeAmount] = useState(0);
  const [receiptNumber, setReceiptNumber] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [newItemProductId, setNewItemProductId] = useState('');
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    paymentMethod: 'Tunai',
    paymentStatus: 'Lunas',
    deliveryMethod: 'Ambil Sendiri',
    deliveryAddress: '',
    deliveryCity: '',
    deliveryProvince: '',
    deliveryDistrict: '',
    deliveryPostalCode: '',
    notes: ''
  });

  const [customDesign, setCustomDesign] = useState(null);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [sizeBreakdown, setSizeBreakdown] = useState([]);
  const [sizeBreakdownError, setSizeBreakdownError] = useState('');
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const api = useApi();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // Load initial data if editing
  useEffect(() => {
    if (isEditing && initialData) {
      const mappedItems = initialData.items.map(item => {
        const productRef = products.find(p => p._id === (item.product?._id || item.productId));
        return {
          productId: item.product?._id || item.productId,
          productName: item.productDetails?.name || item.product?.name || 'Unknown Product',
          productImage: item.productDetails?.images?.[0]?.url || item.product?.images?.[0]?.url || null,
          productDescription: item.productDetails?.description || item.product?.description || '',
          quantity: item.quantity,
          size: item.sizeBreakdown?.[0]?.size || item.size,
          color: item.color?.name || item.color,
          colorDetails: item.color,
          material: item.material?.name || item.material,
          materialDetails: item.material,
          sku: item.sku,
          basePrice: item.product?.basePrice || item.unitPrice,
          dozenPrice: item.product?.dozenPrice || 0,
          discount: item.product?.discount || 0,
          customizationFee: item.product?.customizationFee || 0,
          sizeBreakdown: Array.isArray(item.sizeBreakdown) && item.sizeBreakdown.length > 0 ? item.sizeBreakdown : [{ size: item.size, quantity: item.quantity, additionalPrice: 0 }],
          materialAdditionalPrice: item.material?.additionalPrice || 0,
          customDesign: item.customDesign ? {
            isCustom: !!item.customDesign.isCustom,
            designUrl: item.customDesign.designUrl || '',
            customizationFee: typeof item.customDesign.customizationFee === 'number' ? item.customDesign.customizationFee : (item.customDesign.isCustom ? item.customizationFee : 0),
            notes: item.customDesign.notes || ''
          } : null,
          priceDetails: item.priceDetails,
          totalPrice: item.priceDetails?.total || item.totalPrice,
          notesPerItem: item.notes
        };
      });
      setOrderItems(mappedItems);
      
      calculateTotalAmount(mappedItems);
      setFormData({
        customerName: initialData.customer?.name || '',
        customerPhone: initialData.customer?.phone || '',
        paymentMethod: initialData.paymentMethod || 'Tunai',
        paymentStatus: initialData.paymentStatus || 'Lunas',
        deliveryMethod: initialData.deliveryMethod || 'Ambil Sendiri',
        deliveryAddress: initialData.deliveryAddress || '',
        deliveryCity: initialData.deliveryCity || '',
        deliveryProvince: initialData.deliveryProvince || '',
        deliveryDistrict: initialData.deliveryDistrict || '',
        deliveryPostalCode: initialData.deliveryPostalCode || '',
        notes: initialData.notes || ''
      });
    }
  }, [isEditing, initialData, products]);

  // Load reference data
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        const [productsRes, materialsRes, colorsRes] = await Promise.all([
          api.get('/products'),
          api.get('/materials'),
          api.get('/colors')
        ]);
        
        // Handle products response structure
        const productsData = productsRes.data.products || [];
        setProducts(productsData);
        
        // Handle materials and colors
        setMaterials(materialsRes.data || []);
        setColors(colorsRes.data || []);
      } catch (error) {
        console.error('Error loading reference data:', error);
        showNotification('Gagal memuat data referensi', 'error');
      }
    };
    
    fetchReferenceData();
  }, []);

  // Calculate change amount
  useEffect(() => {
    if (cashReceived > 0) {
      const change = cashReceived - (formData.paymentStatus === 'DP' ? dpAmount : totalAmount);
      setChangeAmount(change >= 0 ? change : 0);
    }
  }, [cashReceived, totalAmount, dpAmount, formData.paymentStatus]);

  // Generate receipt number
  useEffect(() => {
    const timestamp = new Date().getTime();
    setReceiptNumber(`INV-${timestamp}`);
  }, []);

  // Calculate Total Amount and DP Amount when orderItems or dpPercentage change
  useEffect(() => {
    const totalFromItems = orderItems.reduce((sum, item) => sum + (item.priceDetails?.total || 0), 0);
    setTotalAmount(totalFromItems);

    if (orderItems.length > 0) {
      const calculatedDp = Math.round((totalFromItems * dpPercentage) / 100);
      setDpAmount(calculatedDp);
    } else {
      setTotalAmount(0);
      setDpAmount(0);
    }
  }, [orderItems, dpPercentage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    // Pastikan nama dan telepon pelanggan diisi dengan benar
    if (!selectedCustomer) {
      if (!formData.customerName.trim()) {
        errors.customerName = 'Nama pelanggan wajib diisi';
      }
      if (!formData.customerPhone.trim()) {
        errors.customerPhone = 'Nomor telepon pelanggan wajib diisi';
      }
      if (!formData.customerName.trim() || !formData.customerPhone.trim()) {
      errors.customer = 'Informasi pelanggan wajib diisi';
    }
    }

    if (!formData.paymentMethod) errors.paymentMethod = 'Pilih metode pembayaran';
    if (!formData.paymentStatus) errors.paymentStatus = 'Pilih status pembayaran';
    if (!formData.deliveryMethod) errors.deliveryMethod = 'Pilih metode pengiriman';
    
    if (formData.deliveryMethod === 'Dikirim') {
      if (!formData.deliveryAddress) {
      errors.deliveryAddress = 'Alamat pengiriman wajib diisi';
    }
      if (!formData.deliveryCity) {
        errors.deliveryCity = 'Kota/Kabupaten wajib diisi';
      }
      if (!formData.deliveryProvince) {
        errors.deliveryProvince = 'Provinsi wajib diisi';
      }
      if (!formData.deliveryDistrict) {
        errors.deliveryDistrict = 'Kecamatan wajib diisi';
      }
      if (!formData.deliveryPostalCode) {
        errors.deliveryPostalCode = 'Kode pos wajib diisi';
      }
    }
    
    if (orderItems.length === 0) {
      errors.items = 'Tambahkan minimal satu item';
    }
    if (formData.paymentMethod === 'Tunai' && cashReceived < (formData.paymentStatus === 'DP' ? dpAmount : totalAmount)) {
      errors.cashReceived = 'Jumlah uang yang diterima kurang';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      showNotification('Mohon lengkapi semua field yang wajib diisi', 'error');
      return;
    }

    try {
      setLoading(true);

      // Prepare items for backend submission
      const itemsForBackend = orderItems.map(item => {
        // Ensure product ID is present
        if (!item.productId) {
          console.error('Item missing productId:', item);
          throw new Error('Setiap item harus memiliki ID produk.'); // Or handle more gracefully
        }
        // Ensure color and material names are strings
        const colorName = typeof item.color === 'object' ? item.color?.name : item.color;
        const materialName = typeof item.material === 'object' ? item.material?.name : item.material;

        return {
          product: item.productId,
          // Backend (createManualOrder) expects color and material names, not full objects for these top-level fields.
          // It will find the color/material objects from the product's available options.
          color: colorName,
          material: materialName,
          quantity: parseInt(item.quantity, 10) || 1,
          sizeBreakdown: item.sizeBreakdown.map(sb => ({
            size: sb.size,
            quantity: parseInt(sb.quantity, 10) || 0,
            // additionalPrice is not typically sent; backend calculates/verifies price based on product data
          })).filter(sb => sb.quantity > 0), // Only send breakdowns with quantity
          
          customDesign: item.customDesign ? {
            isCustom: !!item.customDesign.isCustom,
            designUrl: item.customDesign.designUrl || '',
            customizationFee: typeof item.customDesign.customizationFee === 'number' ? item.customDesign.customizationFee : (item.customDesign.isCustom ? item.customizationFee : 0),
            notes: item.customDesign.notes || ''
          } : null,
          notes: item.notesPerItem || '', // Notes specific to this order item
          // Fields like unitPrice, dozenPrice, productDetails (name, images etc.) are populated by backend or not needed by createManualOrder directly
          priceDetails: calculateItemPrice(item, products.find(p => p._id === item.productId)) 
        };
      });

      if (itemsForBackend.some(item => !item.product || !item.color || !item.material || item.sizeBreakdown.length === 0)) {
        showNotification('Detail item pesanan tidak lengkap. Pastikan produk, warna, bahan, dan rincian ukuran terisi.', 'error');
        setLoading(false);
        return;
      }

      // Log data customer untuk debugging
      console.log("Data customer yang akan dikirim:", selectedCustomer 
        ? { _id: selectedCustomer._id } 
        : { name: formData.customerName.trim(), phone: formData.customerPhone.trim(), email: `${formData.customerPhone.trim()}@offline.customer` });

      const orderDataForBackend = {
        customer: selectedCustomer 
          ? { _id: selectedCustomer._id } 
          : { 
              name: formData.customerName.trim(), 
              phone: formData.customerPhone.trim(), 
              email: `${formData.customerPhone.trim()}@offline.customer` 
            },
        items: itemsForBackend,
        shippingAddress: formData.deliveryMethod === 'Dikirim' 
          ? {
              street: formData.deliveryAddress,
              city: formData.deliveryCity,
              province: formData.deliveryProvince,
              district: formData.deliveryDistrict,
              postalCode: formData.deliveryPostalCode
            }
          : {
              street: 'Jl. H. Muhari No.116',
              city: 'Depok',
              province: 'Jawa Barat',
              district: 'Serua, Kec. Bojongsari',
              postalCode: '16517'
        },
        paymentDetails: {
          method: formData.paymentMethod, 
          status: formData.paymentStatus, 
          // Backend's createManualOrder and Order model pre-save hook will handle subtotal, total, DP amount etc.
          // For cash payments, these frontend values can be sent for record-keeping if schema supports them.
          cashReceived: formData.paymentMethod === 'Tunai' ? cashReceived : undefined,
          changeAmount: formData.paymentMethod === 'Tunai' ? changeAmount : undefined,
          receiptNumber: formData.paymentMethod === 'Tunai' ? receiptNumber : undefined,
          // Explicitly set payment status for manual orders
          isPaid: formData.paymentStatus === 'Lunas',
          downPayment: {
            required: true,
            percentage: dpPercentage,
            amount: dpAmount,
            status: formData.paymentStatus === 'Lunas' ? 'paid' : (formData.paymentStatus === 'DP' ? 'paid' : 'pending'),
            paidAt: formData.paymentStatus === 'Lunas' || formData.paymentStatus === 'DP' ? new Date().toISOString() : undefined
          },
          remainingPayment: {
            amount: totalAmount - dpAmount,
            status: formData.paymentStatus === 'Lunas' ? 'paid' : 'pending',
            paidAt: formData.paymentStatus === 'Lunas' ? new Date().toISOString() : undefined
          }
        },
        notes: formData.notes,
        isOfflineOrder: true, 
      };

      console.log('Submitting order data to backend:', orderDataForBackend);
      await onSubmit(orderDataForBackend);
    } catch (error) {
      console.error('Error submitting order:', error);
      showNotification('Gagal membuat pesanan. Silakan coba lagi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setFormData(prev => ({
      ...prev,
      customerName: customer.name,
      customerPhone: customer.phone,
      deliveryAddress: customer.address?.street || '',
      deliveryCity: customer.address?.city || '',
      deliveryProvince: customer.address?.province || '',
      deliveryDistrict: customer.address?.district || '',
      deliveryPostalCode: customer.address?.postalCode || '',
    }));
    setShowCustomerSearch(false);
  };

  const handleProductChange = async (e) => {
    const productId = e.target.value;
    if (!productId) {
      setSelectedProduct(null);
      return;
    }
    
    setProductDetailsLoading(true);
    try {
      const response = await api.get(`/products/${productId}`);
      const productData = response.data.product || response.data;
      if (productData) {
        setSelectedProduct(productData);
      } else {
        setSelectedProduct(null);
        showNotification('Gagal memuat detail produk.', 'error');
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      showNotification('Error memuat detail produk.', 'error');
      setSelectedProduct(null);
    } finally {
      setProductDetailsLoading(false);
    }
  };

  const handleAddItem = () => {
    const product = products.find(p => p._id === newItemProductId);
    
    if (!product) {
      showNotification('Pilih produk terlebih dahulu', 'warning');
      return;
    }

    const defaultSizeObj = product.sizes.length > 0 ? product.sizes[0] : null;
    const defaultMaterialObj = product.materials.length > 0 ? product.materials[0] : null;
    const defaultColorObj = product.colors.length > 0 ? product.colors[0] : null;
    
    if (!defaultSizeObj || !defaultMaterialObj || !defaultColorObj) {
      showNotification('Produk tidak memiliki ukuran, material, atau warna yang valid', 'error');
      return;
    }
    
    const newItem = {
      productId: product._id,
      product: product._id,
      productName: product.name,
      productSKU: product.sku,
      quantity: 1,
      sizeBreakdown: [
        {
          size: defaultSizeObj.size,
          quantity: 1,
          additionalPrice: defaultSizeObj.additionalPrice || 0
        }
      ],
      color: defaultColorObj.name,
      colorCode: defaultColorObj.code,
      material: defaultMaterialObj.name,
      notes: '',
      customDesign: null,
      unitPrice: product.basePrice,
      dozenPrice: product.dozenPrice || 0,
      discount: product.discount || 0
    };
    
    // Gunakan format priceDetails yang konsisten dengan ProductDetail.jsx
    const priceDetails = calculatePriceBreakdown({
      sizeBreakdown: newItem.sizeBreakdown,
      product: {
        basePrice: product.basePrice,
        dozenPrice: product.dozenPrice,
        discount: product.discount || 0,
        customizationFee: product.customizationFee || 0
      },
      material: {
        name: defaultMaterialObj.name,
        additionalPrice: defaultMaterialObj.additionalPrice || 0
      },
      customDesign: newItem.customDesign && newItem.customDesign.isCustom ? {
        isCustom: true,
        customizationFee: product.customizationFee || 0
      } : null
    });
    
    newItem.priceDetails = priceDetails; // Store complete and consistent price details format
    newItem.totalPrice = priceDetails.total || 0;
    
    const updatedItems = [...orderItems, newItem];
    setOrderItems(updatedItems);
    calculateTotalAmount(updatedItems);
    setNewItemProductId(''); // Reset selected product ID setelah item ditambahkan
    setSelectedProduct(null); // Reset selected product setelah item ditambahkan
  };

  const handleRemoveItem = (index) => {
    const updatedItems = [...orderItems];
    updatedItems.splice(index, 1);
    setOrderItems(updatedItems);
    calculateTotalAmount(updatedItems);
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...orderItems];
    const item = updatedItems[index];
    const product = products.find(p => p._id === item.productId);
    
    if (!product) return;
    
    if (field === 'quantity') {
      const newQuantity = parseInt(value, 10) || 1;
      
      // Update item quantity
      updatedItems[index] = {
        ...item,
        quantity: newQuantity
      };

      // Distribute the new quantity among existing size breakdown
      const currentTotal = item.sizeBreakdown.reduce((sum, size) => sum + (parseInt(size.quantity) || 0), 0);
      if (currentTotal > 0) {
        const ratio = newQuantity / currentTotal;
        const newBreakdown = item.sizeBreakdown.map(size => ({
          ...size,
          quantity: Math.floor(size.quantity * ratio)
        }));

        // Distribute remaining quantity to first size
        const distributedTotal = newBreakdown.reduce((sum, size) => sum + size.quantity, 0);
        if (distributedTotal < newQuantity) {
          newBreakdown[0].quantity += newQuantity - distributedTotal;
        }

        updatedItems[index].sizeBreakdown = newBreakdown;
      } else {
        // If no sizes have quantity, set it all to the first size
        updatedItems[index].sizeBreakdown = [{
          ...item.sizeBreakdown[0],
          quantity: newQuantity
        }];
      }
    } else if (field === 'material') {
      const materialObj = product.materials.find(m => m.name === value);
      updatedItems[index] = {
        ...item,
        material: value,
        materialAdditionalPrice: materialObj?.additionalPrice || 0
      };
    } else if (field === 'customDesign') {
      updatedItems[index] = {
        ...item,
        customDesign: value
      };
    } else {
      updatedItems[index] = {
        ...item,
        [field]: value
      };
    }

    // Recalculate price
    const priceDetails = calculateItemPrice(updatedItems[index], product);
    updatedItems[index].priceDetails = priceDetails;
    updatedItems[index].totalPrice = priceDetails.total;
    
    setOrderItems(updatedItems);
    calculateTotalAmount(updatedItems);
  };

  const calculateItemPrice = (item, productData) => {
    if (!productData || !item) return { 
      total: 0, 
      subtotal: 0, 
      sizeDetails: [], 
      totalQuantity: 0,
      totalDozens: 0,
      customDesignFee: 0,
      discountAmount: 0,
      discountPercentage: 0,
      priceComponents: {}
    };

    const materialObj = productData.materials.find(m => m.name === item.material);
    
    // Gunakan fungsi yang sama dengan yang digunakan di ProductDetail.jsx
    return calculatePriceBreakdown({ 
      product: {
        basePrice: productData.basePrice,
        dozenPrice: productData.dozenPrice,
        discount: productData.discount || 0,
        customizationFee: productData.customizationFee || 0,
      },
      sizeBreakdown: item.sizeBreakdown, // Array of objects dengan size, quantity, additionalPrice
      material: materialObj ? { 
        name: materialObj.name, 
        additionalPrice: materialObj.additionalPrice || 0 
      } : null,
      customDesign: item.customDesign && item.customDesign.isCustom ? {
        isCustom: true,
        customizationFee: productData.customizationFee || 0
      } : null
    });
  };

  const calculateTotalAmount = (items) => {
    const totalFromItems = items.reduce((sum, item) => sum + (item.priceDetails?.total || 0), 0);
    setTotalAmount(totalFromItems);
    
    // Update DP amount
    const calculatedDp = Math.round((totalFromItems * dpPercentage) / 100);
    setDpAmount(calculatedDp);
  };

  const paymentMethodOptions = [
    { value: 'Tunai', label: 'Tunai' },
    { value: 'Transfer Bank', label: 'Transfer Bank' },
    { value: 'QRIS', label: 'QRIS' }
  ];

  const paymentStatusOptions = [
    { value: 'Lunas', label: 'Lunas' },
    { value: 'DP', label: 'Down Payment (DP)' }
  ];

  const deliveryMethodOptions = [
    { value: 'Ambil Sendiri', label: 'Ambil Sendiri' },
    { value: 'Dikirim', label: 'Dikirim' }
  ];

  const handleFileSelect = (e) => {
    if (!e.target?.files || e.target.files.length === 0) {
      setSelectedFile(null);
      return;
    }

    const file = e.target.files[0];
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      showNotification('Format file tidak didukung. Gunakan JPG, PNG, GIF, atau PDF', 'error');
      setSelectedFile(null);
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showNotification('Ukuran file terlalu besar. Maksimal 5MB', 'error');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      showNotification('Pilih file terlebih dahulu', 'error');
      return;
    }

    const product = products.find(p => p._id === orderItems[selectedItemIndex].productId);
    
    if (!product) {
      showNotification('Produk tidak ditemukan', 'error');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', 'design');
      
      const response = await api.post('/products/upload-design', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data?.url) {
        const updatedItems = [...orderItems];
        updatedItems[selectedItemIndex] = {
          ...updatedItems[selectedItemIndex],
          customDesign: {
            isCustom: true,
            designUrl: response.data.url,
            designFee: product.customizationFee || 0,
            notes: ''
          }
        };

        // Recalculate price with custom design
        const priceDetails = calculateItemPrice(updatedItems[selectedItemIndex], product);
        updatedItems[selectedItemIndex].priceDetails = priceDetails;
        updatedItems[selectedItemIndex].totalPrice = priceDetails.total;
        
        setOrderItems(updatedItems);
        calculateTotalAmount(updatedItems);
        setShowFileUpload(false);
        setSelectedFile(null);
        showNotification('File desain berhasil diunggah', 'success');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      showNotification('Gagal mengunggah file. Silakan coba lagi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const validateSizeBreakdown = (breakdown, totalQty) => {
    if (breakdown.length === 0) {
      setSizeBreakdownError('');
      return true;
    }

    const total = breakdown.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
    if (total > totalQty) {
      setSizeBreakdownError(`Total rincian ukuran (${total}) melebihi jumlah pesanan (${totalQty})`);
      return false;
    } else if (total < totalQty) {
      setSizeBreakdownError(`Total rincian ukuran (${total}) kurang dari jumlah pesanan (${totalQty})`);
      return false;
    } else {
      setSizeBreakdownError('');
      return true;
    }
  };

  const handleSizeBreakdownChange = (index, field, value, itemIndex) => {
    const updatedItems = [...orderItems];
    const item = updatedItems[itemIndex];
    const product = products.find(p => p._id === item.productId);
    
    if (!product) return;

    const newBreakdown = [...item.sizeBreakdown];
    
    if (field === 'size') {
      const sizeObj = product.sizes.find(s => s.size === value);
      newBreakdown[index] = {
        ...newBreakdown[index],
        size: value,
        additionalPrice: sizeObj?.additionalPrice || 0
      };
    } else if (field === 'quantity') {
      const newQuantity = parseInt(value) || 0;
      newBreakdown[index] = {
        ...newBreakdown[index],
        quantity: newQuantity
      };

      // Calculate total from other sizes
      const totalFromOthers = newBreakdown.reduce((sum, size, idx) => {
        if (idx === index) return sum;
        return sum + (parseInt(size.quantity) || 0);
      }, 0);

      // Check if new total would exceed item quantity
      const newTotal = totalFromOthers + newQuantity;
      if (newTotal > item.quantity) {
        // Adjust the new quantity to not exceed total
        newBreakdown[index].quantity = item.quantity - totalFromOthers;
        showNotification('Total jumlah tidak boleh melebihi jumlah pesanan', 'warning');
      }
    }

    // Update the item with new breakdown
    updatedItems[itemIndex] = {
      ...item,
      sizeBreakdown: newBreakdown
    };

    // Recalculate price
    const priceDetails = calculateItemPrice(updatedItems[itemIndex], product);
    updatedItems[itemIndex].priceDetails = priceDetails;
    updatedItems[itemIndex].totalPrice = priceDetails.total;
    
    setOrderItems(updatedItems);
    calculateTotalAmount(updatedItems);
    validateSizeBreakdown(newBreakdown, item.quantity);
  };

  const addSizeBreakdown = (itemIndex) => {
    const updatedItems = [...orderItems];
    const item = updatedItems[itemIndex];
    const product = products.find(p => p._id === item.productId);
    
    if (!product) return;

    // Find sizes that haven't been used yet
    const availableSizes = product.sizes.filter(
      sizeObj => !item.sizeBreakdown.some(breakdown => breakdown.size === sizeObj.size)
    );

    if (availableSizes.length > 0) {
      const newBreakdown = [
        ...item.sizeBreakdown,
        {
          size: availableSizes[0].size,
          quantity: 0,
          additionalPrice: availableSizes[0].additionalPrice || 0
        }
      ];

      updatedItems[itemIndex] = {
        ...item,
        sizeBreakdown: newBreakdown
      };

      setOrderItems(updatedItems);
    }
  };

  const removeSizeBreakdown = (breakdownIndex, itemIndex) => {
    const updatedItems = [...orderItems];
    const item = updatedItems[itemIndex];
    const product = products.find(p => p._id === item.productId);
    
    if (!product) return;

    const newBreakdown = item.sizeBreakdown.filter((_, index) => index !== breakdownIndex);
    
    if (newBreakdown.length > 0) {
      updatedItems[itemIndex] = {
        ...item,
        sizeBreakdown: newBreakdown
      };

      // Recalculate price
      const priceDetails = calculateItemPrice(updatedItems[itemIndex], product);
      updatedItems[itemIndex].priceDetails = priceDetails;
      updatedItems[itemIndex].totalPrice = priceDetails.total;
      
      setOrderItems(updatedItems);
      calculateTotalAmount(updatedItems);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit}>
        <FormSection 
          title="Informasi Pelanggan" 
          subtitle="Masukkan data pelanggan atau cari pelanggan yang sudah terdaftar"
        >
          <div className="bg-gray-50 p-4 rounded-md mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Button
              type="button"
              label="Cari Pelanggan Terdaftar"
              variant="secondary"
              onClick={() => setShowCustomerSearch(true)}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              }
              className="w-full sm:w-auto"
            />
            {selectedCustomer ? (
              <div className="bg-green-50 border border-green-200 p-3 rounded-md w-full sm:flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-green-800">{selectedCustomer.name}</div>
                    <div className="text-sm text-green-600">{selectedCustomer.phone}</div>
                    {selectedCustomer.address?.street && (
                      <div className="text-xs text-green-600 mt-1">{selectedCustomer.address.street}</div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    label="Ganti"
                    onClick={() => setShowCustomerSearch(true)}
                  />
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-600 italic flex-1">
                Atau isi data pelanggan baru di bawah ini
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Nama Pelanggan"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              error={formErrors.customer}
              required
              placeholder="Masukkan nama pelanggan"
              disabled={!!selectedCustomer}
            />
            <InputField
              label="No. Telepon"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleChange}
              error={formErrors.customer}
              required
              placeholder="Contoh: 081234567890"
              disabled={!!selectedCustomer}
            />
          </div>
        </FormSection>

        <FormSection title="Item Pesanan">
          <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-3">
              <SelectField
                label="Produk"
                name="productId"
                value={newItemProductId}
                onChange={(e) => {
                  setNewItemProductId(e.target.value);
                  handleProductChange(e);
                }}
                options={[
                  { value: '', label: '-- Pilih Produk --' },
                  ...products.map(product => ({
                    value: product._id,
                    label: product.name
                  }))
                ]}
              />
            </div>
            <Button
              type="button"
              label="Tambah"
              onClick={handleAddItem}
              disabled={!newItemProductId}
            />
          </div>

          {formErrors.items && (
            <p className="text-red-500 text-xs mt-1 mb-3">{formErrors.items}</p>
          )}

          {orderItems.length > 0 && (
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rincian Ukuran</th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warna</th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bahan</th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                    <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Desain</th>
                    <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                    <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orderItems.map((item, itemIndex) => {
                    const product = products.find(p => p._id === item.productId);
                    const priceDetails = item.priceDetails;
                    
                    return (
                      <tr key={itemIndex}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <div className="flex items-center">
                            {item.productImage ? (
                              <img 
                                src={item.productImage} 
                                alt={item.productName} 
                                className="h-14 w-14 rounded object-cover mr-3 flex-shrink-0"
                                onError={(e) => { 
                                  // Inline SVG as data URI for fallback
                                  e.target.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%22100%22 height%3D%22100%22 viewBox%3D%220 0 100 100%22%3E%3Crect width%3D%22100%22 height%3D%22100%22 fill%3D%22%23f1f5f9%22%2F%3E%3Cpath d%3D%22M30 40 L70 40 L70 60 L30 60 Z%22 fill%3D%22%23cbd5e1%22%2F%3E%3Ctext x%3D%2250%22 y%3D%2250%22 font-family%3D%22Arial%22 font-size%3D%2212%22 text-anchor%3D%22middle%22 dominant-baseline%3D%22middle%22 fill%3D%22%2364748b%22%3ENo Image%3C%2Ftext%3E%3C%2Fsvg%3E';
                                }} 
                              />
                            ) : (
                              <div className="h-14 w-14 rounded bg-gray-100 mr-3 flex-shrink-0 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                            <div className="flex-grow min-w-0">
                              <div className="font-medium text-gray-900 truncate" title={item.productName}>{item.productName || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4">
                          <div className="space-y-2">
                            {item.sizeBreakdown.map((breakdown, breakdownIndex) => (
                              <div key={breakdownIndex} className="flex items-center gap-2">
                                <select
                                  value={breakdown.size}
                                  onChange={(e) => handleSizeBreakdownChange(breakdownIndex, 'size', e.target.value, itemIndex)}
                                  className="w-24 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                  {product?.sizes
                                    .filter(s => s.available)
                                    .map((sizeObj) => (
                                      <option
                                        key={sizeObj.size}
                                        value={sizeObj.size}
                                        disabled={item.sizeBreakdown.some((b, i) => i !== breakdownIndex && b.size === sizeObj.size)}
                                      >
                                        {sizeObj.size} {sizeObj.additionalPrice > 0 ? `(+${formatCurrency(sizeObj.additionalPrice)})` : ''}
                                      </option>
                                    ))}
                                </select>
                                
                                <input
                                  type="number"
                                  value={breakdown.quantity}
                                  onChange={(e) => handleSizeBreakdownChange(breakdownIndex, 'quantity', e.target.value, itemIndex)}
                                  min="0"
                                  className="w-16 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                
                                {item.sizeBreakdown.length > 1 && (
                                  <button
                                    onClick={() => removeSizeBreakdown(breakdownIndex, itemIndex)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            ))}
                            
                            {product && item.sizeBreakdown.length < product.sizes.length && (
                              <button
                                onClick={() => addSizeBreakdown(itemIndex)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                + Tambah Ukuran
                              </button>
                            )}
                            
                            {sizeBreakdownError && (
                              <p className="text-sm text-red-600">{sizeBreakdownError}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm">
                          <select
                            value={item.color}
                            onChange={(e) => handleItemChange(itemIndex, 'color', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {product?.colors
                              .filter(c => c.available)
                              .map((color) => (
                                <option key={color.name} value={color.name}>
                                  {color.name}
                                </option>
                              ))}
                          </select>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm">
                          <select
                            value={item.material}
                            onChange={(e) => handleItemChange(itemIndex, 'material', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {product?.materials
                              .filter(m => m.available)
                              .map((material) => (
                                <option key={material.name} value={material.name}>
                                  {material.name} {material.additionalPrice > 0 ? `(+${formatCurrency(material.additionalPrice)})` : ''}
                                </option>
                              ))}
                          </select>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(itemIndex, 'quantity', parseInt(e.target.value, 10) || 1)}
                            className="w-16 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                          <div className="flex flex-col items-center space-y-2">
                            <label className="inline-flex items-center">
                              <input
                                type="checkbox"
                                checked={item.customDesign?.isCustom || false}
                                onChange={(e) => {
                                  const isCustom = e.target.checked;
                                  if (isCustom) {
                                    setSelectedItemIndex(itemIndex);
                                    setShowFileUpload(true);
                                  } else {
                                    handleItemChange(itemIndex, 'customDesign', null);
                                  }
                                }}
                                className="form-checkbox h-4 w-4 text-blue-600"
                              />
                              <span className="ml-2">Kustom</span>
                            </label>
                            {item.customDesign?.isCustom && (
                              <div className="flex flex-col items-center gap-1">
                                <a 
                                  href={item.customDesign.designUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-xs"
                                >
                                  Lihat Desain
                                </a>
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedItemIndex(itemIndex);
                                    setShowFileUpload(true);
                                  }}
                                  label="Ganti"
                                />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-right">
                          {priceDetails ? (
                            <div>
                              <div>
                                {item.quantity} pcs
                                {Math.floor(item.quantity / 12) > 0 ? (
                                  <span className="text-xs text-gray-500 ml-1">
                                    ({Math.floor(item.quantity / 12)} lusin {item.quantity % 12 > 0 ? `+ ${item.quantity % 12} pcs` : ''})
                                  </span>
                                ) : null}
                              </div>
                              <div className="text-green-600 mt-1">
                                {item.quantity % 12 === 0 && priceDetails.totalDozens > 0 ? 
                                  formatCurrency(product.dozenPrice / 12) :
                                  formatCurrency(priceDetails.subtotal / item.quantity)
                                }
                                <span className="text-xs text-gray-500 ml-1">per pcs</span>
                              </div>
                              
                              {/* Tampilkan breakdown ukuran jika ada lebih dari 1 ukuran */}
                              {item.sizeBreakdown.length > 1 && (
                                <div className="mt-1 text-xs text-gray-500">
                                  {item.sizeBreakdown.map((size, idx) => (
                                    <div key={idx}>
                                      {size.size}: {size.quantity} pcs
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>
                              {item.quantity} pcs × {formatCurrency(product.basePrice)} (Harga Satuan)
                            </div>
                          )}
                          {item.customDesign?.isCustom && (
                            <div className="text-xs text-blue-600">
                              +{formatCurrency(product.customizationFee)} × {item.quantity} (Kustom)
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-right font-medium">
                          {formatCurrency(item.totalPrice)}
                          {priceDetails?.discountAmount > 0 && (
                            <div className="text-xs text-red-500">
                              -{formatCurrency(priceDetails.discountAmount)} ({product.discount}%)
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(itemIndex)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-right text-sm font-medium">
                      Total Pesanan
                    </td>
                    <td colSpan="2" className="px-3 py-4">
                      <div className="text-right space-y-1">
                        {orderItems.map((item, index) => {
                          const product = products.find(p => p._id === item.productId);
                          const priceDetails = item.priceDetails;
                          if (!priceDetails) return null;
                          
                          const dozenCount = Math.floor(item.quantity / 12);
                          const unitCount = item.quantity % 12;
                          
                          return (
                            <div key={index} className="text-sm">
                              <div className="font-medium">{item.productName}</div>
                              <div className="mt-2">
                                <div className="font-medium">Detail Harga</div>
                                <div>Ringkasan Pesanan:</div>
                                <div>Total Kuantitas: {item.quantity} pcs</div>
                                
                                {priceDetails.totalDozens > 0 && (
                                  <div>
                                    Harga Lusin: {dozenCount} lusin ({dozenCount * 12} pcs)
                                  </div>
                                )}
                              </div>

                              <div className="mt-2">
                                <div className="overflow-x-auto">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                      <tr className="bg-gray-50">
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ukuran & Material</th>
                                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Kuantitas</th>
                                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Satuan</th>
                                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                      {item.sizeBreakdown.map((sb, sbIndex) => {
                                        const sizeDetail = priceDetails.sizeDetails?.find(detail => detail.size === sb.size);
                                        return (
                                          <tr key={sbIndex} className="hover:bg-gray-50">
                                            <td className="px-3 py-2">
                                              <div>{sb.size} {sb.additionalPrice > 0 ? `(+${formatCurrency(sb.additionalPrice)})` : ''}</div>
                                              {sbIndex === 0 && (
                                                <div className="text-xs text-gray-500">
                                                  Material: {item.material}
                                                </div>
                                              )}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                              {sb.quantity} pcs
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                              {formatCurrency(sizeDetail?.pricePerUnit || 0)}
                                              {sbIndex === 0 && (
                                                <div className="text-xs text-gray-500">per pcs</div>
                                              )}
                                            </td>
                                            <td className="px-3 py-2 text-right font-medium">
                                              {formatCurrency(sizeDetail?.subtotal || 0)}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    
                                      {/* Subtotal row */}
                                      <tr className="bg-gray-50">
                                        <td colSpan="3" className="px-3 py-2 text-left text-sm font-medium">Subtotal:</td>
                                        <td className="px-3 py-2 text-right font-medium">
                                          {formatCurrency(priceDetails.subtotal)}
                                        </td>
                                      </tr>
                                    
                                      {/* Discount row if applicable */}
                                      {priceDetails.discountAmount > 0 && (
                                        <tr className="bg-green-50/30">
                                          <td colSpan="3" className="px-3 py-2 text-left text-sm font-medium">Diskon ({product.discount}%):</td>
                                          <td className="px-3 py-2 text-right font-medium text-green-600">
                                            -{formatCurrency(priceDetails.discountAmount)}
                                          </td>
                                        </tr>
                                      )}
                                    
                                      {/* Total row */}
                                      <tr className="bg-gray-100 font-bold">
                                        <td colSpan="3" className="px-3 py-2 text-left text-sm">Total:</td>
                                        <td className="px-3 py-2 text-right text-blue-600">
                                          {formatCurrency(priceDetails.total)}
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div className="text-lg font-bold border-t border-gray-200 pt-2">
                          Total: {formatCurrency(totalAmount)}
                        </div>
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </FormSection>

        <FormSection 
          title="Pembayaran dan Pengiriman" 
          subtitle="Tentukan metode pembayaran dan pengiriman pesanan"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
            <SelectField
              label="Metode Pembayaran"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              options={paymentMethodOptions}
              error={formErrors.paymentMethod}
                required
              />
              {formData.paymentMethod === 'Tunai' && (
                <div className="mt-3 space-y-3">
                  <InputField
                    label="Jumlah Diterima"
                    name="cashReceived"
                    type="number"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                    error={formErrors.cashReceived}
                    required
                    prefix="Rp"
                    helper={`Minimum: ${formatCurrency(formData.paymentStatus === 'DP' ? dpAmount : totalAmount)}`}
                  />
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Kembalian:</span>
                      <span className="font-medium">{formatCurrency(changeAmount)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div>
            <SelectField
              label="Status Pembayaran"
              name="paymentStatus"
              value={formData.paymentStatus}
              onChange={handleChange}
              options={paymentStatusOptions}
              error={formErrors.paymentStatus}
                required
              />
              {formData.paymentStatus === 'DP' && (
                <div className="mt-3 bg-blue-50 p-3 rounded-md">
                  <div className="text-sm font-medium text-blue-800 mb-1">Informasi DP</div>
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700">Persentase DP:</span>
                    <span className="font-medium text-blue-900">{dpPercentage}%</span>
          </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-sm text-blue-700">Nominal DP:</span>
                    <span className="font-medium text-blue-900">{formatCurrency(dpAmount)}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-sm text-blue-700">Sisa Pembayaran:</span>
                    <span className="font-medium text-blue-900">{formatCurrency(totalAmount - dpAmount)}</span>
                  </div>
                  <div className="flex items-center mt-2">
                    <input
                      type="range"
                      min="30"
                      max="90"
                      step="5"
                      value={dpPercentage}
                      onChange={(e) => setDpPercentage(parseInt(e.target.value))}
                      className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
            </div>
          )}
            </div>
          </div>
          
          {/* Delivery Method - Updated to match checkout page */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Metode Pengiriman*
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  formData.deliveryMethod === 'Ambil Sendiri'
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  setFormData(prev => ({ ...prev, deliveryMethod: 'Ambil Sendiri' }));
                }}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="Ambil Sendiri"
                    checked={formData.deliveryMethod === 'Ambil Sendiri'}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label className="ml-3 block text-sm font-medium text-gray-700">
                    Ambil di Toko
                  </label>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Pelanggan akan mengambil pesanan langsung di toko
                </p>
                {formData.deliveryMethod === 'Ambil Sendiri' && (
                  <div className="mt-2 text-sm text-gray-600 bg-white p-3 rounded-md border border-gray-100">
                    <p className="font-medium mb-1">Alamat Toko:</p>
                    <p>Jl. H. Muhari No.116</p>
                    <p>Serua, Kec. Bojongsari</p>
                    <p>Kota Depok, Jawa Barat</p>
                    <p>Kode Pos: 16517</p>
                  </div>
                )}
              </div>
              
              <div
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  formData.deliveryMethod === 'Dikirim'
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  setFormData(prev => ({ ...prev, deliveryMethod: 'Dikirim' }));
                }}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
              name="deliveryMethod"
                    value="Dikirim"
                    checked={formData.deliveryMethod === 'Dikirim'}
              onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label className="ml-3 block text-sm font-medium text-gray-700">
                    Antar ke Alamat
                  </label>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Pesanan akan dikirim ke alamat yang ditentukan
                </p>
              </div>
            </div>
            
            {formData.deliveryMethod === 'Dikirim' && (
              <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <InputField
                  label="Alamat Lengkap"
                name="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={handleChange}
                  multiline
                  rows={2}
                error={formErrors.deliveryAddress}
                required
                  placeholder="Masukkan alamat lengkap pengiriman"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Kota/Kabupaten"
                    name="deliveryCity"
                    value={formData.deliveryCity || ''}
                    onChange={handleChange}
                    error={formErrors.deliveryCity}
                    required
                    placeholder="Masukkan kota/kabupaten"
                  />
                  
                  <InputField
                    label="Provinsi"
                    name="deliveryProvince"
                    value={formData.deliveryProvince || ''}
                    onChange={handleChange}
                    error={formErrors.deliveryProvince}
                    required
                    placeholder="Masukkan provinsi"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Kecamatan"
                    name="deliveryDistrict"
                    value={formData.deliveryDistrict || ''}
                    onChange={handleChange}
                    error={formErrors.deliveryDistrict}
                    required
                    placeholder="Masukkan kecamatan"
                  />
                  
                  <InputField
                    label="Kode Pos"
                    name="deliveryPostalCode"
                    value={formData.deliveryPostalCode || ''}
                    onChange={handleChange}
                    error={formErrors.deliveryPostalCode}
                    required
                    placeholder="Masukkan kode pos"
                  />
                </div>
              </div>
            )}
          </div>
        </FormSection>

        <FormSection title="Catatan Tambahan">
          <InputField
            label="Catatan"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            multiline
            rows={3}
          />
        </FormSection>

        <div className="flex justify-between mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(-1)}
            label="Batal"
          />
          <Button
            type="submit"
            loading={loading}
            label="Simpan Pesanan"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            }
          />
        </div>
      </form>

      {showCustomerSearch && (
        <CustomerSearchModal
          isOpen={showCustomerSearch}
          onClose={() => setShowCustomerSearch(false)}
          onSelect={handleCustomerSelect}
        />
      )}

      {showFileUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Upload Desain Kustom</h3>
              <button
                onClick={() => {
                  setShowFileUpload(false);
                  setSelectedFile(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <FileUpload
                onChange={handleFileSelect}
                accept=".jpg,.jpeg,.png,.gif,.pdf"
                maxSize={5 * 1024 * 1024}
                multiple={false}
                label="Upload File Desain"
                helperText="Format yang didukung: JPG, PNG, GIF, PDF. Maksimal 5MB."
                disabled={loading}
              />
            </div>

            {selectedFile && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm font-medium text-green-800 mb-1">File terpilih:</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">{selectedFile.name}</span>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            <div className="text-sm text-gray-600 mb-4">
              <p className="font-medium mb-1">Ketentuan file desain:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Format file: JPG, PNG, GIF, atau PDF</li>
                <li>Ukuran maksimal: 5MB</li>
                <li>Resolusi minimal: 300 DPI untuk hasil terbaik</li>
                <li>Pastikan desain sudah sesuai dengan ukuran produk</li>
              </ul>
            </div>

            {orderItems[selectedItemIndex]?.customDesign?.designUrl && (
              <div className="mb-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm font-medium text-blue-800 mb-1">File desain saat ini:</p>
                <div className="flex items-center justify-between">
                  <a
                    href={orderItems[selectedItemIndex].customDesign.designUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    Lihat desain
                  </a>
                  <span className="text-sm text-blue-600">
                    +{formatCurrency(orderItems[selectedItemIndex]?.customDesign?.designFee || 0)} / pcs
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                label="Batal"
                variant="secondary"
                onClick={() => {
                  setShowFileUpload(false);
                  setSelectedFile(null);
                }}
                disabled={loading}
              />
              <Button
                type="button"
                label="Upload"
                onClick={handleFileUpload}
                loading={loading}
                disabled={!selectedFile || loading}
                variant="primary"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderForm;