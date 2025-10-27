import React, { useState, useEffect } from 'react';
import useAppStore from '../../store/useAppStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Scan, X } from 'lucide-react';
import { useZxing } from 'react-zxing';

const ProductFormModal = ({ product, onClose }) => {
  const { addProduct, updateProduct, categories, currentUser, stores } = useAppStore();
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    wholesalePrice: 0,
    cost: 0,
    category: '',
    categoryId: '',
    subcategoryId: '',
    barcodes: '',
    unitOfMeasure: 'unidad',
    expirationDate: '',
    storeId: currentUser?.storeId || '',
  });
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price || 0,
        wholesalePrice: product.wholesalePrice || 0,
        cost: product.cost || 0,
        category: product.category || '',
        categoryId: product.categoryId || '',
        subcategoryId: product.subcategoryId || '',
        image: product.image || '',
        barcodes: product.barcodes ? product.barcodes.join(', ') : '',
        unitOfMeasure: product.unitOfMeasure || 'unidad',
        expirationDate: product.expirationDate || '',
        storeId: product.storeId || currentUser?.storeId || '',
      });
    } else {
      setFormData({
        name: '',
        price: 0,
        wholesalePrice: 0,
        cost: 0,
        category: '',
        categoryId: '',
        subcategoryId: '',
        image: '',
        barcodes: '',
        unitOfMeasure: 'unidad',
      });
    }
  }, [product]);

  const solicitarAccesoCamara = async () => {
    try {
      // Check if we're in a secure context (HTTPS required for camera on many browsers)
      if (!window.isSecureContext) {
        console.warn('Camera access requires a secure context (HTTPS)');
        alert('Para usar la cámara, la aplicación necesita una conexión segura (HTTPS).');
        return false;
      }
      
      // First check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn('navigator.mediaDevices is not supported in this browser');
        alert('Tu navegador no soporta acceso a la cámara. Intenta con otro navegador.');
        return false;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Usa la cámara trasera en móviles
        } 
      });
      
      // Detiene el stream inmediatamente después de solicitarlo
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (err) {
      console.error('Permiso de cámara denegado:', err);
      
      // Handle specific error cases
      if (err.name === 'NotAllowedError') {
        alert('Permiso de cámara denegado. Por favor, permite el acceso a la cámara en la configuración de tu navegador.');
      } else if (err.name === 'NotFoundError' || err.name === 'OverconstrainedError') {
        alert('No se encontró una cámara compatible. Verifica que tu dispositivo tenga cámara trasera.');
      } else if (err.name === 'NotReadableError') {
        alert('La cámara no está disponible. Puede estar en uso por otra aplicación.');
      } else {
        alert('Error al acceder a la cámara: ' + err.message);
      }
      
      return false;
    }
  };

  const toggleScanning = async () => {
    // Solicita permiso de cámara antes de iniciar el escaneo
    if (!isScanning) {
      const tienePermiso = await solicitarAccesoCamara();
      if (tienePermiso) {
        setIsScanning(true);
      } else {
        alert('Se requiere acceso a la cámara para escanear códigos de barras. Por favor, permite el acceso en la configuración de tu navegador.');
      }
    } else {
      setIsScanning(false);
    }
  };

  const { ref } = useZxing({
    onResult(result) {
      const scannedBarcode = result.getText();
      setFormData(prev => ({
        ...prev,
        barcodes: prev.barcodes ? `${prev.barcodes}, ${scannedBarcode}` : scannedBarcode,
      }));
      setIsScanning(false);
    },
    onError(error) {
      console.error('Error en escaneo de código de barras:', error);
      alert('Error al escanear el código de barras. Intente nuevamente.');
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    const selectedCategory = categories.find(cat => cat.id === categoryId);
    setFormData(prev => ({
      ...prev,
      categoryId: categoryId,
      subcategoryId: '', // Reset subcategory when category changes
    }));
  };

  const handleSubcategoryChange = (e) => {
    const subcategoryId = e.target.value;
    setFormData(prev => ({
      ...prev,
      subcategoryId: subcategoryId,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      barcodes: formData.barcodes.split(',').map(b => b.trim()).filter(b => b),
      price: parseFloat(formData.price),
      wholesalePrice: parseFloat(formData.wholesalePrice),
      cost: parseFloat(formData.cost),
    };

    if (product) {
      updateProduct(product.id, dataToSubmit);
    } else {
      addProduct(dataToSubmit);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre</label>
        <Input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Precio Unitario</label>
        <Input
          id="price"
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          step="0.01"
          prefix="$"
          required
        />
      </div>
      <div>
        <label htmlFor="wholesalePrice" className="block text-sm font-medium text-gray-700">Precio Mayoreo</label>
        <Input
          id="wholesalePrice"
          name="wholesalePrice"
          type="number"
          value={formData.wholesalePrice}
          onChange={handleChange}
          step="0.01"
          prefix="$"
        />
      </div>
      <div>
        <label htmlFor="cost" className="block text-sm font-medium text-gray-700">Costo</label>
        <Input
          id="cost"
          name="cost"
          type="number"
          value={formData.cost}
          onChange={handleChange}
          step="0.01"
          prefix="$"
        />
      </div>
      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">Categoría</label>
        <select
          id="categoryId"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleCategoryChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          required
        >
          <option value="">Selecciona una categoría</option>
          {categories.filter(cat => !cat.parentId).map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
      {formData.categoryId && categories.find(cat => cat.id === formData.categoryId)?.subcategories.length > 0 && (
        <div>
          <label htmlFor="subcategoryId" className="block text-sm font-medium text-gray-700">Subcategoría</label>
          <select
            id="subcategoryId"
            name="subcategoryId"
            value={formData.subcategoryId}
            onChange={handleSubcategoryChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Selecciona una subcategoría</option>
            {categories.find(cat => cat.id === formData.categoryId)?.subcategories.map(subCat => (
              <option key={subCat.id} value={subCat.id}>{subCat.name}</option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700">URL de Imagen</label>
        <Input
          id="image"
          name="image"
          type="text"
          value={formData.image}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="barcodes" className="block text-sm font-medium text-gray-700">Códigos de Barras (separados por coma)</label>
        <div className="flex items-center space-x-2">
          <Input
            id="barcodes"
            name="barcodes"
            type="text"
            value={formData.barcodes}
            onChange={handleChange}
            className="flex-grow"
          />
          <Button type="button" onClick={toggleScanning} className="p-2 bg-blue-200">
            <Scan size={20} />
          </Button>
        </div>
        {isScanning && (
          <div className="mt-2 flex flex-col items-center max-w-full overflow-hidden">
            <video ref={ref} className="w-full max-w-xs h-auto max-h-32 bg-gray-200 rounded-md"></video>
            <p className="text-center text-sm text-gray-500 mt-1">Escaneando código de barras...</p>
          </div>
        )}
      </div>
      <div>
        <label htmlFor="unitOfMeasure" className="block text-sm font-medium text-gray-700">Unidad de Medida</label>
        <select
          id="unitOfMeasure"
          name="unitOfMeasure"
          value={formData.unitOfMeasure}
          onChange={handleChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          required
        >
          <option value="unidad">Unidad</option>
          <option value="kg">Kilogramo (kg)</option>
          <option value="litro">Litro (L)</option>
          <option value="metro">Metro (m)</option>
          <option value="pieza">Pieza</option>
        </select>
      </div>
      <div>
        <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700">Fecha de Caducidad</label>
        <Input
          id="expirationDate"
          name="expirationDate"
          type="date"
          value={formData.expirationDate}
          onChange={handleChange}
        />
      </div>
      {(currentUser.role === 'admin' || currentUser.role === 'gerente') && (
        <div>
          <label htmlFor="storeId" className="block text-sm font-medium text-gray-700">Tienda</label>
          <select
            id="storeId"
            name="storeId"
            value={formData.storeId}
            onChange={handleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            required
          >
            <option value="">Selecciona una tienda</option>
            {stores.map(store => (
              <option key={store.id} value={store.id}>{store.name}</option>
            ))}
          </select>
        </div>
      )}
      {currentUser.role === 'cashier' && (
        <div>
          <label htmlFor="storeId" className="block text-sm font-medium text-gray-700">Tienda</label>
          <Input
            id="storeId"
            name="storeId"
            type="text"
            value={stores.find(store => store.id === formData.storeId)?.name || ''}
            readOnly
            disabled
            className="mt-1 block w-full"
          />
        </div>
      )}
      <Button type="submit" className="w-full bg-indigo-600 text-white hover:bg-indigo-700">
        {product ? "Guardar Cambios" : "Añadir Producto"}
      </Button>
    </form>
  );
};

export default ProductFormModal;
