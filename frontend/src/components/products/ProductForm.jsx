import React, { useState, useEffect } from 'react';
import InputField from '../forms/InputField';
import SelectField from '../forms/SelectField';
import FileUpload from '../forms/FileUpload';
import FormSection from '../forms/FormSection';
import Button from '../common/Button';
import { useForm } from '../../hooks/useForm';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';
import { PRODUCT_COLORS } from '../../constants/api';

const ProductForm = ({ product, onSubmit, isEditing = false }) => {
  const [materialList] = useState([
    { _id: 'cotton-combed-30s', name: 'Cotton Combed 30s' },
    { _id: 'cotton-combed-20s', name: 'Cotton Combed 20s' },
    { _id: 'cotton-pima', name: 'Cotton Pima' },
    { _id: 'cotton-jersey', name: 'Cotton Jersey' },
    { _id: 'polyester', name: 'Polyester' },
    { _id: 'rayon', name: 'Rayon' }
  ]);

  const [colorList] = useState([
    { _id: 'hitam', name: 'Hitam', code: '#000000' },
    { _id: 'putih', name: 'Putih', code: '#FFFFFF' },
    { _id: 'navy', name: 'Navy', code: '#000080' },
    { _id: 'merah', name: 'Merah', code: '#FF0000' },
    { _id: 'biru', name: 'Biru', code: '#0000FF' },
    { _id: 'hijau', name: 'Hijau', code: '#008000' }
  ]);

  const [sizes, setSizes] = useState(product?.sizes || []);
  const [materials, setMaterials] = useState(product?.materials || []);
  const [colors, setColors] = useState(product?.colors || []);
  const [images, setImages] = useState(product?.images || []);
  
  const { showNotification } = useNotification();
  const api = useApi();
  
  const sizeOptions = [
    { value: 'S', label: 'S' },
    { value: 'M', label: 'M' },
    { value: 'L', label: 'L' },
    { value: 'XL', label: 'XL' },
    { value: '2XL', label: '2XL' },
    { value: '3XL', label: '3XL' },
    { value: '4XL', label: '4XL' },
    { value: '5XL', label: '5XL' },
  ];
  
  const [sizePrices, setSizePrices] = useState({});
  const [materialPrices, setMaterialPrices] = useState({});
  
  // State untuk input baru
  const [newSize, setNewSize] = useState({ size: '', additionalPrice: 0 });
  const [newMaterial, setNewMaterial] = useState({ name: '', additionalPrice: 0 });
  const [newColor, setNewColor] = useState({ name: '', code: '#000000' });

  const [categories, setCategories] = useState([]);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/products/categories');
        setCategories(response.data.categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        showNotification('Gagal memuat daftar kategori', 'error');
      }
    };
    fetchCategories();
  }, []);

  const handleAddSize = () => {
    if (!newSize.size) {
      showNotification('Ukuran harus diisi', 'error');
      return;
    }
    // Convert size to uppercase and validate format
    const formattedSize = newSize.size.toUpperCase();
    if (!["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"].includes(formattedSize)) {
      showNotification('Ukuran tidak valid. Gunakan: S, M, L, XL, 2XL, 3XL, 4XL, 5XL', 'error');
      return;
    }
    setSizes(prev => [...prev, { ...newSize, size: formattedSize, available: true }]);
    setNewSize({ size: '', additionalPrice: 0 });
  };

  const handleAddMaterial = () => {
    if (!newMaterial.name) {
      showNotification('Nama bahan harus diisi', 'error');
      return;
    }
    setMaterials(prev => [...prev, { ...newMaterial, available: true }]);
    setNewMaterial({ name: '', additionalPrice: 0 });
  };

  const handleAddColor = () => {
    if (!newColor.name) {
      showNotification('Nama warna harus diisi', 'error');
      return;
    }
    setColors(prev => [...prev, { ...newColor, available: true }]);
    setNewColor({ name: '', code: '#000000' });
  };

  const handleRemoveSize = (index) => {
    setSizes(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveMaterial = (index) => {
    setMaterials(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveColor = (index) => {
    setColors(prev => prev.filter((_, i) => i !== index));
  };

  const handleSizePriceChange = (size, value) => {
    setSizePrices(prev => ({
      ...prev,
      [size]: Number(value) || 0
    }));
  };

  const handleMaterialPriceChange = (material, value) => {
    setMaterialPrices(prev => ({
      ...prev,
      [material]: Number(value) || 0
    }));
  };

  const { formData, handleChange, handleSubmit, setFormData, errors, setErrors, isSubmitting } = useForm(
    {
      name: product?.name || '',
      description: product?.description || '',
      basePrice: product?.basePrice || '',
      dozenPrice: product?.dozenPrice || '',
      category: product?.category || 'kaos',
      customizationFee: product?.customizationFee || 0,
      productionTime: product?.productionTime || 7,
      discount: product?.discount || 0,
      featured: product?.featured || false,
      availability: product?.availability || true,
    },
    validateForm,
    async (data) => {
      try {
        console.log('Form data before transformation:', data);
        
        // Transform data to match backend model structure
        const productData = {
          ...data,
          basePrice: Number(data.basePrice),
          dozenPrice: Number(data.dozenPrice),
          customizationFee: Number(data.customizationFee || 0),
          productionTime: Number(data.productionTime || 7),
          discount: Number(data.discount || 0),
          featured: Boolean(data.featured),
          availability: Boolean(data.availability),
          sizes: sizes.map(size => ({
            ...size,
            additionalPrice: Number(size.additionalPrice || 0)
          })),
          materials: materials.map(material => ({
            ...material,
            additionalPrice: Number(material.additionalPrice || 0)
          })),
          colors: colors.map(color => ({
            ...color,
            code: color.code || '#000000'
          })),
          images: images.map(image => {
            if (image instanceof File) {
              return image;
            } else if (image.url) {
              return { url: image.url, public_id: image.public_id };
            }
            return image;
          })
        };

        console.log('Transformed product data:', productData);
        await onSubmit(productData);
      } catch (error) {
        console.error('Form submission error:', error);
        setErrors({ submit: error.message });
      }
    }
  );
  
  const handleImageUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    setImages(prev => [...prev, ...uploadedFiles]);
  };
  
  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleMaterialChange = (e) => {
    const { checked, value } = e.target;
    let updatedMaterials = [...formData.materials];
    
    if (checked) {
      updatedMaterials.push(value);
    } else {
      updatedMaterials = updatedMaterials.filter(id => id !== value);
    }
    
    setFormData(prev => ({
      ...prev,
      materials: updatedMaterials
    }));
  };
  
  const handleSizeChange = (e) => {
    const { checked, value } = e.target;
    let updatedSizes = [...formData.sizes];
    
    if (checked) {
      updatedSizes.push(value);
    } else {
      updatedSizes = updatedSizes.filter(size => size !== value);
    }
    
    setFormData(prev => ({
      ...prev,
      sizes: updatedSizes
    }));
  };
  
  const handleColorChange = (e) => {
    const { checked, value } = e.target;
    let updatedColors = [...formData.colors];
    
    if (checked) {
      updatedColors.push(value);
    } else {
      updatedColors = updatedColors.filter(id => id !== value);
    }
    
    setFormData(prev => ({
      ...prev,
      colors: updatedColors
    }));
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      showNotification('Nama kategori tidak boleh kosong', 'error');
      return;
    }
    setCategories(prev => [...prev, { _id: newCategory.toLowerCase().replace(/\s+/g, '-'), name: newCategory }]);
    setFormData(prev => ({ ...prev, category: newCategory }));
    setNewCategory('');
    setShowNewCategoryInput(false);
  };

  function validateForm(data) {
    const errors = {};
    
    if (!data.name) errors.name = 'Nama produk wajib diisi';
    if (!data.description) errors.description = 'Deskripsi produk wajib diisi';
    if (!data.basePrice) errors.basePrice = 'Harga satuan wajib diisi';
    if (!data.dozenPrice) errors.dozenPrice = 'Harga per lusin wajib diisi';
    if (sizes.length === 0) errors.sizes = 'Pilih minimal satu ukuran';
    if (materials.length === 0) errors.materials = 'Pilih minimal satu bahan';
    if (colors.length === 0) errors.colors = 'Pilih minimal satu warna';
    
    return errors;
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <FormSection title="Informasi Produk">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Nama Produk"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
          />
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Kategori
            </label>
            {!showNewCategoryInput ? (
              <div className="flex space-x-2">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewCategoryInput(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  + Baru
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Masukkan kategori baru"
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                >
                  Tambah
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCategoryInput(false);
                    setNewCategory('');
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                  Batal
                </button>
              </div>
            )}
            {errors.category && (
              <p className="text-red-500 text-xs mt-1">{errors.category}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Harga Satuan (Rp)"
              name="basePrice"
              type="number"
              value={formData.basePrice}
              onChange={handleChange}
              error={errors.basePrice}
              required
            />
            
            <InputField
              label="Harga Per Lusin (Rp)"
              name="dozenPrice"
              type="number"
              value={formData.dozenPrice}
              onChange={handleChange}
              error={errors.dozenPrice}
              required
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Deskripsi
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            error={errors.description}
            required
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">{errors.description}</p>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField
            label="Biaya Kustomisasi (Rp)"
            name="customizationFee"
            type="number"
            value={formData.customizationFee}
            onChange={handleChange}
          />
          
          <InputField
            label="Waktu Produksi (hari)"
            name="productionTime"
            type="number"
            value={formData.productionTime}
            onChange={handleChange}
          />
          
          <InputField
            label="Diskon (%)"
            name="discount"
            type="number"
            value={formData.discount}
            onChange={handleChange}
          />
        </div>

        <div className="mt-4 flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm">Produk Unggulan</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="availability"
              checked={formData.availability}
              onChange={handleChange}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm">Tersedia</span>
          </label>
        </div>
      </FormSection>
      
      <FormSection title="Ukuran">
        <div className="space-y-4">
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ukuran
              </label>
              <input
                type="text"
                value={newSize.size}
                onChange={(e) => setNewSize(prev => ({ ...prev, size: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Contoh: S, M, L, XL"
              />
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tambahan Harga
              </label>
              <input
                type="number"
                value={newSize.additionalPrice}
                onChange={(e) => setNewSize(prev => ({ ...prev, additionalPrice: Number(e.target.value) || 0 }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                min="0"
              />
            </div>
            <button
              type="button"
              onClick={handleAddSize}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Tambah
            </button>
          </div>

          {sizes.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Ukuran yang dipilih:</h4>
              <div className="space-y-2">
                {sizes.map((size, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                    <div className="flex items-center space-x-4">
                      <span className="font-medium">{size.size}</span>
                      <span className="text-sm text-gray-600">
                        Tambahan: Rp {size.additionalPrice.toLocaleString()}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSize(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </FormSection>

      <FormSection title="Bahan">
        <div className="space-y-4">
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Bahan
              </label>
              <input
                type="text"
                value={newMaterial.name}
                onChange={(e) => setNewMaterial(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Contoh: Cotton Combed 30s"
              />
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tambahan Harga
              </label>
              <input
                type="number"
                value={newMaterial.additionalPrice}
                onChange={(e) => setNewMaterial(prev => ({ ...prev, additionalPrice: Number(e.target.value) || 0 }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                min="0"
              />
            </div>
            <button
              type="button"
              onClick={handleAddMaterial}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Tambah
            </button>
          </div>

          {materials.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Bahan yang dipilih:</h4>
              <div className="space-y-2">
                {materials.map((material, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                    <div className="flex items-center space-x-4">
                      <span className="font-medium">{material.name}</span>
                      <span className="text-sm text-gray-600">
                        Tambahan: Rp {material.additionalPrice.toLocaleString()}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMaterial(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </FormSection>

      <FormSection title="Warna">
        <div className="space-y-4">
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Warna
              </label>
              <input
                type="text"
                value={newColor.name}
                onChange={(e) => setNewColor(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Contoh: Hitam, Putih, Navy"
              />
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kode Warna
              </label>
              <input
                type="color"
                value={newColor.code}
                onChange={(e) => setNewColor(prev => ({ ...prev, code: e.target.value }))}
                className="w-full h-10 border border-gray-300 rounded-md"
              />
            </div>
            <button
              type="button"
              onClick={handleAddColor}
              className="bg-[#620000] text-white px-4 py-2 rounded-md hover:bg-[#8B0000]"
            >
              Tambah
            </button>
          </div>

          {colors.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Warna yang dipilih:</h4>
              <div className="space-y-2">
                {colors.map((color, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-6 h-6 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.code }}
                      />
                      <span className="font-medium">{color.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </FormSection>
      
      <FormSection title="Gambar Produk">
        <FileUpload 
          multiple={true}
          accept="image/*"
          onChange={handleImageUpload}
          label="Upload Gambar Produk"
        />
        
        {images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <img 
                  src={image.url || URL.createObjectURL(image)} 
                  alt={`Product ${index + 1}`} 
                  className="w-full h-32 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </FormSection>
      
      <div className="flex justify-end mt-6 gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.history.back()}
          disabled={isSubmitting}
        >
          Batal
        </Button>
        <Button 
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          {isSubmitting ? 'Memproses...' : (isEditing ? 'Simpan Perubahan' : 'Tambah Produk')}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;