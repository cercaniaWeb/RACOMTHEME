import React from 'react';
import useAppStore from '../../store/useAppStore';
import Button from '../../components/ui/Button';
import { X } from 'lucide-react';

const ProductDetailsModal = ({ product, onClose }) => {
  const { categories, stores } = useAppStore();
  
  if (!product) return null;
  
  const getCategoryName = (categoryId) => 
    categories.find(c => c.id === categoryId)?.name || 'Sin Categoría';
  
  const getSubcategoryName = (subcategoryId) => {
    let name = 'Sin Subcategoría';
    categories.forEach(cat => {
      const subCat = cat.subcategories?.find(sub => sub.id === subcategoryId);
      if (subCat) name = subCat.name;
    });
    return name;
  };
  
  const getStoreName = (storeId) => 
    stores.find(s => s.id === storeId)?.name || 'N/A';

  return (
    <div className="p-6 dark:text-white max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold dark:text-white">{product.name}</h2>
        <Button 
          onClick={onClose} 
          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Cerrar"
        >
          <X size={20} />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Información Básica</h3>
            <div className="mt-1 space-y-2">
              <p><span className="font-medium">Nombre:</span> {product.name}</p>
              <p><span className="font-medium">Precio Unitario:</span> ${product.price?.toFixed(2)}</p>
              <p><span className="font-medium">Precio Mayoreo:</span> {product.wholesalePrice ? `$${product.wholesalePrice.toFixed(2)}` : 'N/A'}</p>
              <p><span className="font-medium">Costo:</span> ${product.cost?.toFixed(2)}</p>
              <p><span className="font-medium">Unidad:</span> {product.unitOfMeasure}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Categorización</h3>
            <div className="mt-1 space-y-2">
              <p><span className="font-medium">Categoría:</span> {getCategoryName(product.categoryId)}</p>
              <p><span className="font-medium">Subcategoría:</span> {getSubcategoryName(product.subcategoryId)}</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Detalles Adicionales</h3>
            <div className="mt-1 space-y-2">
              <p><span className="font-medium">Códigos de Barras:</span> {product.barcodes ? product.barcodes.join(', ') : 'N/A'}</p>
              <p><span className="font-medium">Tienda:</span> {getStoreName(product.storeId)}</p>
              <p><span className="font-medium">Creado:</span> {product.createdAt ? new Date(product.createdAt).toLocaleString() : 'N/A'}</p>
              <p><span className="font-medium">Actualizado:</span> {product.updatedAt ? new Date(product.updatedAt).toLocaleString() : 'N/A'}</p>
            </div>
          </div>
          
          {product.image_url && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Imagen</h3>
              <div className="mt-2">
                <img 
                  src={product.image_url} 
                  alt={product.name} 
                  className="max-w-full h-32 object-contain border rounded"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-image.jpg'; // Fallback image
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <Button onClick={onClose} className="bg-indigo-600 text-white hover:bg-indigo-700">
          Cerrar
        </Button>
      </div>
    </div>
  );
};

export default ProductDetailsModal;