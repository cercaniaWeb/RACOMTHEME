import React, { useState, useEffect, useRef } from 'react';
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
    initialStock: 0, // Campo para cantidad inicial en inventario
    category: '', // This will be mapped to category_id when submitting
    categoryId: '',
    subcategoryId: '',
    barcodes: '', // This will be mapped to barcode when submitting
    unitOfMeasure: 'unidad', // This will be mapped to unit when submitting
    storeId: currentUser?.storeId || '',
    image: '',
    createdAt: '',
    updatedAt: '',
  });
  
  // Actualizar storeId cuando currentUser cambia
  React.useEffect(() => {
    if (currentUser?.storeId) {
      setFormData(prev => ({ ...prev, storeId: currentUser.storeId }));
    }
  }, [currentUser]);
  const [isScanning, setIsScanning] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  
  // Para manejar escáner físico de códigos de barras
  const barcodeInputRef = useRef(null);
  const barcodeScanBuffer = useRef('');
  const barcodeScanTimeout = useRef(null);
  const scanErrorTimeout = useRef(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price || 0,
        wholesalePrice: product.wholesalePrice || 0,
        cost: product.cost || 0,
        category: product.category || '', // For display purposes
        categoryId: product.category_id || product.categoryId || '', // Map from database field
        subcategoryId: product.subcategory_id || product.subcategoryId || '', // Map from database field
        image: product.image_url || product.image || '', // Map from database field
        barcodes: product.barcode ? product.barcode : (product.barcodes ? (Array.isArray(product.barcodes) ? product.barcodes.join(', ') : product.barcodes) : ''), // Map from database field
        unitOfMeasure: product.unit || product.unitOfMeasure || 'unidad', // Map from database field
        storeId: product.storeId || currentUser?.storeId || '',
        createdAt: product.created_at || product.createdAt || '',
        updatedAt: product.updated_at || product.updatedAt || '',
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
        storeId: currentUser?.storeId || '',
        createdAt: '',
        updatedAt: '',
      });
    }
  }, [product, currentUser?.storeId]);

  const toggleScanning = async () => {
    // Si estamos deteniendo el escaneo, desactivar la linterna
    if (isScanning) {
      setTorchEnabled(false);
    }
    // Solo cambiamos el estado de escaneo, react-zxing manejará el acceso a la cámara
    setIsScanning(!isScanning);
  };

  // Manejo del escáner físico de códigos de barras
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' && e.target.name === 'barcodes') {
        // Limpiar timeout anterior si existe
        if (barcodeScanTimeout.current) {
          clearTimeout(barcodeScanTimeout.current);
        }

        // Añadir carácter al buffer
        if (e.key.length === 1) {
          barcodeScanBuffer.current += e.key;
        } else if (e.key === 'Enter') {
          // Si se presiona Enter, se considera que es un escaneo completo
          if (barcodeScanBuffer.current.length > 0) {
            // Añadir el código de barras escaneado al campo existente
            setFormData(prev => ({
              ...prev,
              barcodes: prev.barcodes ? `${prev.barcodes}, ${barcodeScanBuffer.current}` : barcodeScanBuffer.current,
            }));
            
            // Limpiar buffer
            barcodeScanBuffer.current = '';
          }
        }
        
        // Reiniciar timeout para limpiar buffer después de un tiempo de inactividad
        barcodeScanTimeout.current = setTimeout(() => {
          barcodeScanBuffer.current = '';
        }, 100); // 100ms para considerar que es un escaneo completo
      }
    };

    if (barcodeInputRef.current) {
      barcodeInputRef.current.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (barcodeScanTimeout.current) {
        clearTimeout(barcodeScanTimeout.current);
      }
      if (scanErrorTimeout.current) {
        clearTimeout(scanErrorTimeout.current);
      }
      if (barcodeInputRef.current) {
        barcodeInputRef.current.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, []);

  const handleImageFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (jpg, png, gif, etc.)');
      return;
    }

    // Validate file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es demasiado grande. El tamaño máximo es 5MB.');
      return;
    }

    setImageUploading(true);
    
    try {
      // For now, we'll convert the image to a data URL for immediate preview
      // In a real implementation, you would upload to a service like Supabase Storage
      const reader = new FileReader();
      reader.onload = (event) => {
        // Set the image as a data URL for immediate preview
        setFormData(prev => ({
          ...prev,
          image: event.target.result
        }));
        setImageUploading(false);
      };
      reader.onerror = () => {
        alert('Error al leer la imagen');
        setImageUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al procesar la imagen: ' + error.message);
      setImageUploading(false);
    }
  };

  // Estado para controlar la linterna de la cámara
  const [torchEnabled, setTorchEnabled] = useState(false);
  // Estado para mostrar indicador de procesamiento
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Contador de intentos fallidos para evitar spam de errores
  const failedAttempts = useRef(0);
  const maxFailedAttempts = 5;
  
  const { ref } = useZxing({
    onResult(result) {
      // Evitar procesamiento múltiple del mismo código
      if (isProcessing) return;
      
      setIsProcessing(true);
      const scannedBarcode = result.getText();
      
      // Validar que el código no esté vacío
      if (!scannedBarcode || scannedBarcode.trim() === '') {
        setIsProcessing(false);
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        barcodes: prev.barcodes ? `${prev.barcodes}, ${scannedBarcode}` : scannedBarcode,
      }));
      setIsScanning(false);
      failedAttempts.current = 0; // Resetear contador de fallos
      setIsProcessing(false);
    },
    onError(error) {
      // Solo registrar errores importantes, no los comunes de "no se detecta código"
      if (!error.message.includes('No MultiFormat Readers were able to detect the code')) {
        console.error('Error en escaneo de código de barras:', error);
        // Solo mostrar alerta si no hemos excedido el límite de intentos fallidos
        if (failedAttempts.current < maxFailedAttempts) {
          alert('Error al escanear el código de barras. Intente nuevamente.');
        }
        failedAttempts.current++;
      }
      
      // Resetear estado de procesamiento si hay un error
      if (isProcessing) {
        setIsProcessing(false);
      }
    },
    enabled: isScanning,
    formats: ['code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'data_matrix'],
    constraints: {
      facingMode: 'environment', // Preferir la cámara trasera si está disponible
      width: { ideal: 1920, min: 1280, max: 1920 }, // Aumentar resolución para mejor detección
      height: { ideal: 1080, min: 720, max: 1080 },
      frameRate: { ideal: 30, max: 60 }, // Aumentar velocidad de fotogramas para mejor detección
      aspectRatio: 16/9, // Relación de aspecto común
      focusMode: 'continuous', // Enfoque automático continuo si está disponible
    },
    delay: 100, // Reducir retraso entre escaneos para mayor responsividad
  });

  // Función para activar/desactivar la linterna de la cámara
  const toggleTorch = async () => {
    if (ref.current && ref.current.srcObject) {
      const tracks = ref.current.srcObject.getVideoTracks();
      if (tracks && tracks.length > 0) {
        const track = tracks[0];
        try {
          const capabilities = track.getCapabilities ? track.getCapabilities() : {};
          if (capabilities && 'torch' in capabilities) {
            await track.applyConstraints({
              advanced: [{ torch: !torchEnabled }]
            });
            setTorchEnabled(!torchEnabled);
          } else {
            console.log('La linterna no está disponible en este dispositivo');
            // Mostrar mensaje solo una vez, no cada vez que se intente
            if (!torchEnabled) {
              alert('La linterna no está disponible en este dispositivo');
            }
          }
        } catch (err) {
          console.warn('Error al controlar la linterna:', err);
          // Algunos navegadores o dispositivos no permiten controlar la linterna
          if (!torchEnabled) {
            alert('La linterna no puede activarse en este dispositivo');
          }
        }
      }
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent submission if currently scanning
    if (isScanning) {
      alert("Por favor, detenga el escaneo de códigos de barras antes de guardar el producto.");
      return;
    }
    
    const barcodesArray = formData.barcodes.split(',').map(b => b.trim()).filter(b => b);
    
    // Excluir campos que no deben enviarse a la base de datos
    const { wholesalePrice, expirationDate, createdAt, updatedAt, created_at, updated_at, ...otherFormData } = formData;
    
    // Verificar que tenemos un storeId válido
    // Para administradores, usamos la tienda seleccionada en el formulario
    let storeId = formData.storeId;
    
    // Si el usuario es admin o gerente y no tiene tienda seleccionada, mostrar error
    if ((currentUser?.role === 'admin' || currentUser?.role === 'gerente') && !storeId) {
      console.error("No se puede guardar el producto: Administrador sin tienda seleccionada");
      alert("Error: No se puede guardar el producto. Como administrador/gerente, debes seleccionar una tienda para el producto.");
      return;
    }
    
    // Para cajeros, usar la tienda asignada al usuario
    if (currentUser?.role === 'cashier') {
      storeId = currentUser?.storeId;
    }
    
    if (!storeId) {
      console.error("No se puede guardar el producto: No se encontró storeId para el usuario actual");
      alert("Error: No se puede guardar el producto. Por favor, asegúrate de que tu usuario tiene una tienda asignada.");
      return;
    }
    
    const dataToSubmit = {
      // Pasar todos los campos requeridos
      storeId: storeId,
      categoryId: otherFormData.categoryId,
      subcategoryId: otherFormData.subcategoryId,
      initialStock: otherFormData.initialStock || 0, // Cantidad inicial en inventario
      // Mapear campos del formulario a las columnas correctas de la base de datos
      name: otherFormData.name,
      price: parseFloat(otherFormData.price) || 0,
      cost: parseFloat(otherFormData.cost) || 0,
      barcode: barcodesArray[0] || null,  // Usar solo el primer código de barras como VARCHAR
      unit: otherFormData.unitOfMeasure,  // Mapear a la columna correcta en la base de datos
      image_url: otherFormData.image || null,
    };

    try {
      if (product) {
        // Actualizar producto existente
        const result = await updateProduct(product.id, {
          // Para actualización, solo pasar los campos relevantes sin storeId, categoryId, subcategoryId
          name: otherFormData.name,
          price: parseFloat(otherFormData.price) || 0,
          cost: parseFloat(otherFormData.cost) || 0,
          categoryId: otherFormData.categoryId,
          subcategoryId: otherFormData.subcategoryId,
          barcode: barcodesArray[0] || null,
          unit: otherFormData.unitOfMeasure,
          image_url: otherFormData.image || null,
        });
        
        if (result.success) {
          alert("Producto actualizado exitosamente.");
          onClose();
        } else {
          alert(`Error al actualizar el producto: ${result.error}`);
        }
      } else {
        // Agregar nuevo producto
        const result = await addProduct(dataToSubmit);
        
        if (result.success) {
          alert("Producto agregado exitosamente.");
          onClose();
        } else {
          alert(`Error al agregar el producto: ${result.error}`);
        }
      }
    } catch (error) {
      console.error("Error en handleSubmit:", error);
      alert(`Error al procesar el producto: ${error.message || error}`);
    }
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
          value={formData.price ?? 0}
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
          value={formData.wholesalePrice ?? 0}
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
          value={formData.cost ?? 0}
          onChange={handleChange}
          step="0.01"
          prefix="$"
        />
      </div>
      <div>
        <label htmlFor="initialStock" className="block text-sm font-medium text-gray-700">Cantidad Inicial en Inventario</label>
        <Input
          id="initialStock"
          name="initialStock"
          type="number"
          value={formData.initialStock ?? 0}
          onChange={handleChange}
          min="0"
          step="1"
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
      {formData.categoryId && (() => {
        const selectedCategory = categories.find(cat => cat.id === formData.categoryId);
        return selectedCategory && selectedCategory.subcategories && selectedCategory.subcategories.length > 0;
      })() && (
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
        <label className="block text-sm font-medium text-gray-700">Imagen del Producto</label>
        <div className="mt-1 flex flex-col space-y-3">
          {/* Image preview if available */}
          {formData.image && (
            <div className="mb-2">
              <img 
                src={formData.image} 
                alt="Vista previa" 
                className="w-24 h-24 object-contain border rounded"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-image.jpg'; // Fallback image
                }}
              />
            </div>
          )}
          
          {/* URL input */}
          <div>
            <label htmlFor="image" className="block text-xs text-gray-500 mb-1">Ingresar URL de imagen</label>
            <Input
              id="image"
              name="image"
              type="text"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>
          
          {/* Or separator */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-sm">o</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          
          {/* File upload */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Subir imagen desde archivo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageFileUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
            />
          </div>
        </div>
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
            ref={barcodeInputRef}
            className="flex-grow"
          />
          <Button type="button" onClick={toggleScanning} className="p-2 bg-blue-200">
            <Scan size={20} />
          </Button>
          {isScanning && (
            <Button 
              type="button" 
              onClick={toggleTorch} 
              className={`p-2 ${torchEnabled ? 'bg-yellow-400' : 'bg-gray-200'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
              </svg>
            </Button>
          )}
        </div>
        {isScanning && (
          <div className="mt-2 flex flex-col items-center max-w-full overflow-hidden">
            <div className="relative w-full max-w-sm">
              <video ref={ref} className="w-full h-auto max-h-64 bg-gray-200 rounded-md border border-gray-300"></video>
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Rectángulo de ayuda para escaneo */}
                <div className="border-2 border-blue-500 border-dashed rounded w-4/5 h-16 flex items-center justify-center pointer-events-none">
                  <span className="text-blue-500 text-xs font-bold opacity-70">Alinee el código</span>
                </div>
              </div>
              <Button
                type="button"
                onClick={toggleScanning}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
              >
                <X size={16} />
              </Button>
            </div>
            <p className="text-center text-sm text-gray-500 mt-1">Escaneando código de barras...</p>
            <p className="text-center text-xs text-gray-400 mt-1">Apunte la cámara al código de barras</p>
            <div className="flex items-center mt-2">
              <div className={`w-3 h-3 rounded-full mr-2 ${torchEnabled ? 'bg-yellow-400' : 'bg-gray-400'}`}></div>
              <span className="text-xs text-gray-600">Linterna {torchEnabled ? 'activada' : 'desactivada'}</span>
            </div>
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
