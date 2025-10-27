import React, { useState, useMemo, useRef } from 'react';
import {
  Plus,
  Printer,
  FileText,
  Search,
  Package,
  CreditCard,
  UserCircle,
  Zap,
  Percent,
  Calendar,
  X,
  Scan,
  Calculator,
  Maximize,
  Moon,
  Sun,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import useAppStore from '../store/useAppStore';
import Ticket from '../features/pos/Ticket';
import { useReactToPrint } from 'react-to-print';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useZxing } from 'react-zxing';

import EmployeeConsumptionModal from '../features/pos/EmployeeConsumptionModal';
import CalculatorModal from '../features/pos/CalculatorModal';
import TicketDesignModal from '../features/pos/TicketDesignModal';
import DiscountModal from '../features/pos/DiscountModal';
import NoteModal from '../features/pos/NoteModal';
import PaymentModal from '../features/pos/PaymentModal';
import CashClosingModal from '../features/pos/CashClosingModal';
import ProductFormModal from '../features/products/ProductFormModal';
import PreviousSalesModal from '../features/pos/PreviousSalesModal';
import ScheduleVisitModal from '../features/pos/ScheduleVisitModal';
import WithdrawalModal from '../features/pos/WithdrawalModal';
import ProductCollectionModal from '../features/pos/ProductCollectionModal';
import QRScanner from '../components/qr/QRScanner';





export default function POSPage() {
  const {
    currentUser,
    cart,
    searchTerm = '',
    setSearchTerm,
    categories,
    products: productCatalog,
    inventoryBatches,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    handleCheckout,
    lastSale,
    darkMode,
    toggleDarkMode,
    isOnline,
    offlineMode,
  } = useAppStore();

  const [isScanning, setIsScanning] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isEmployeeConsumptionModalOpen, setIsEmployeeConsumptionModalOpen] = useState(false);
  const [isTicketDesignModalOpen, setIsTicketDesignModalOpen] = useState(false);
  const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isPaymentMethodModalOpen, setIsPaymentMethodModalOpen] = useState(false);
  const [isCashClosingModalOpen, setIsCashClosingModalOpen] = useState(false);
  const [isProductFormModalOpen, setIsProductFormModalOpen] = useState(false);
  const [isPreviousSalesModalOpen, setIsPreviousSalesModalOpen] = useState(false);
  const [isScheduleVisitModalOpen, setIsScheduleVisitModalOpen] = useState(false);
  const [postPaymentModalOpen, setPostPaymentModalOpen] = useState(false);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [isProductCollectionModalOpen, setIsProductCollectionModalOpen] = useState(false);

  const ticketRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => ticketRef.current,
    documentTitle: `Ticket_Venta_${lastSale?.saleId}`,
  });

  const handleSaveTicket = async () => {
    const element = ticketRef.current;
    if (element) {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`ticket_venta_${lastSale?.saleId}.pdf`);
    }
    setPostPaymentModalOpen(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const productsForSale = useMemo(() => {
    const storeId = currentUser?.storeId;
    if (!storeId) return [];

    const stockByProduct = inventoryBatches.reduce((acc, batch) => {
      if (batch.locationId === storeId) {
        acc[batch.productId] = (acc[batch.productId] || 0) + batch.quantity;
      }
      return acc;
    }, {});

    return productCatalog
      .map(product => ({
        ...product,
        stockInLocation: stockByProduct[product.id] || 0,
      }))
      .filter(product => product.stockInLocation > 0)
      .filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()));

  }, [productCatalog, inventoryBatches, currentUser, searchTerm]);

  // Show notification when going offline
  React.useEffect(() => {
    const handleOnline = () => {
      alert('Conexión restaurada. Los datos se sincronizarán automáticamente.');
    };

    const handleOffline = () => {
      alert('Sin conexión a Internet. La aplicación está trabajando en modo sin conexión.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleScanning = async () => {
    // Check if we're turning scanning on and if not, toggle it
    if (!isScanning) {
      // Request camera permissions before starting scan
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop()); // Stop the test stream
        setIsScanning(true);
      } catch (err) {
        console.error('Error accessing camera:', err);
        alert('No se pudo acceder a la cámara. Por favor, verifica los permisos.');
      }
    } else {
      setIsScanning(false);
    }
  };

  const { ref } = useZxing({
    onResult(result) {
      const scannedBarcode = result.getText();
      const product = productsForSale.find(p => p.barcodes.includes(scannedBarcode));
      if (product) {
        addToCart(product);
        setIsScanning(false);
      } else {
        console.warn(`Product with barcode ${scannedBarcode} not found or out of stock in this location.`);
        alert(`Producto con código ${scannedBarcode} no encontrado o sin existencias en esta tienda.`);
      }
    },
    onError(error) {
      console.error('Error en escaneo de código de barras:', error);
      // Don't show an alert on error as it can be spammy
    },
    paused: !isScanning,
    video: {
      facingMode: 'environment', // Use back camera if available
      width: { min: 640, ideal: 1280 },
      height: { min: 480, ideal: 720 },
    }
  });

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleQuantityChange = (productId, e) => {
    const quantity = parseInt(e.target.value, 10);
    updateCartItemQuantity(productId, quantity);
  };

  const handleCheckoutClick = () => {
    setIsPaymentMethodModalOpen(true);
  };

  const handlePaymentSuccess = async (payment) => {
    const result = await handleCheckout(payment);
    
    // Handle offline mode result
    if (result.offline) {
      // Show a special message for offline transactions
      alert('Venta procesada en modo sin conexión. Se sincronizará cuando haya conexión a Internet.');
    }
    
    setIsPaymentMethodModalOpen(false);
    setPostPaymentModalOpen(true); // Open post-payment options modal
  };

  const canAccessEmployeeConsumption = currentUser && (currentUser.role === 'admin' || currentUser.role === 'gerente');

  return (
      <main className="flex-1 flex flex-col md:flex-row gap-4 p-4 h-screen">
        <div className="w-full md:w-2/3 flex flex-col gap-4">
          <header className={`flex justify-between items-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            <div>
              <h1 className="text-2xl font-bold">Punto de Venta</h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tienda: {currentUser?.storeName || 'Principal'}</p>
              {offlineMode && (
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-xs text-red-500 font-medium">Modo Sin Conexión</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {!isOnline && (
                <div className="flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md text-xs font-medium">
                  <Zap size={14} className="mr-1" />
                  <span>Sin conexión</span>
                </div>
              )}
              <Button onClick={toggleDarkMode} variant="outline" className="p-2">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </Button>
              <Button onClick={toggleFullscreen} variant="outline" className="p-2">
                <Maximize size={20} />
              </Button>
              <UserCircle size={24} className={darkMode ? 'text-gray-300' : 'text-gray-400'} />
              <span className={darkMode ? 'text-gray-200' : 'text-gray-700'}>{currentUser?.name}</span>
            </div>
          </header>

          <Card className="flex-1 flex flex-col">
            <div className="flex-1 overflow-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className="py-2 text-left">Cantidad</th>
                    <th className="py-2 text-left">Producto</th>
                    <th className="py-2 text-right">Precio</th>
                    <th className="py-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.id} className={`${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b last:border-none`}>
                      <td className="py-3">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, e)}
                          min="1"
                          className={`w-16 border rounded-lg text-center ${darkMode ? 'bg-gray-700/70 text-white border-gray-600' : 'bg-white/80 border-gray-300'}`}
                        />
                      </td>
                      <td className={`py-3 font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{item.name}</td>
                      <td className={`py-3 text-right font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        ${(item.price * item.quantity).toLocaleString()}
                      </td>
                      <td className="py-3 text-right">
                        <Button 
                          onClick={() => removeFromCart(item.id)} 
                          variant="ghost"
                          size="sm"
                          className={darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'}
                        >
                          <X size={18} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 flex flex-col xs:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setIsScheduleVisitModalOpen(true)} variant="outline" className="font-medium flex items-center space-x-2"><Calendar size={16}/><span>Agendar</span></Button>
                <Button onClick={() => setIsDiscountModalOpen(true)} variant="outline" className="font-medium flex items-center space-x-2"><Percent size={16}/><span>Descuento</span></Button>
                <Button onClick={() => setIsNoteModalOpen(true)} variant="outline" className="font-medium flex items-center space-x-2"><FileText size={16}/><span>Nota</span></Button>
                {canAccessEmployeeConsumption && (
                  <Button onClick={() => setIsEmployeeConsumptionModalOpen(true)} variant="outline" className="font-medium flex items-center space-x-2">
                    <UserCircle size={16}/><span>Consumo</span>
                  </Button>
                )}
              </div>
              <div className={`text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Subtotal: ${subtotal.toLocaleString()}</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Total: ${subtotal.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-3">
              <Button onClick={() => setIsPreviousSalesModalOpen(true)} variant="outline" className="font-medium flex-1">
                <Printer size={16} className="mr-2" />
                Ventas Anteriores
              </Button>
              <Button onClick={() => setIsCashClosingModalOpen(true)} variant="outline" className="font-medium flex-1">
                <FileText size={16} className="mr-2" />
                Cierre de Caja
              </Button>
              <Button onClick={() => setIsWithdrawalModalOpen(true)} variant="outline" className="font-medium flex-1">
                <CreditCard size={16} className="mr-2" />
                Retiro
              </Button>
            </div>
            
            <Button 
              onClick={handleCheckoutClick} 
              className="w-full mt-3 py-4 text-lg" 
              size="lg"
              variant="primary"
              disabled={offlineMode && cart.length === 0}
            >
              {offlineMode ? 'Modo Sin Conexión - Procesar Pago Local' : `Procesar Pago - ${subtotal.toLocaleString()}`}
            </Button>
          </Card>
        </div>

        <Card className="w-full md:w-1/3 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
              <Button onClick={() => setIsCalculatorModalOpen(true)} size="sm"><Calculator size={20} /></Button>
              <Button onClick={() => setIsProductCollectionModalOpen(true)} size="sm"><Package size={20} /></Button>
              <Button onClick={toggleScanning} size="sm">
                <Scan size={20} />
              </Button>
            </div>
            <Input icon={Search} type="text" placeholder="Buscar producto..." className="flex-1 ml-2 max-w-xs" onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          {isScanning && (
            <div className="mb-4">
              <video ref={ref} className="w-full max-w-md h-auto aspect-video bg-gray-200 rounded-xl mx-auto"></video>
              <p className="text-center text-sm text-gray-500 mt-2">Escaneando código de barras...</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {categories.slice(0, 6).map(c => <Button key={c.id} variant="outline" size="sm" className="py-1 font-medium whitespace-nowrap">{c.name}</Button>)}
            {categories.length > 6 && (
              <Button variant="outline" size="sm" className="py-1 font-medium" onClick={() => setIsProductCollectionModalOpen(true)}>
                +{categories.length - 6}
              </Button>
            )}
          </div>
          
          <div className="flex-1 overflow-auto" style={{maxHeight: 'calc(100vh - 220px)'}}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {productsForSale.map(p => (
                <div key={p.id} className={`relative rounded-xl p-3 text-center cursor-pointer transition-all duration-200 hover:scale-[1.02] ${darkMode ? 'bg-gray-700/80 hover:bg-gray-600/80' : 'bg-gray-100 hover:bg-gray-200'}`} onClick={() => addToCart(p)}>
                   <div className={`absolute top-1 right-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                     p.stockInLocation < 10 ? 'bg-red-500 text-white' : 
                     p.stockInLocation < 20 ? 'bg-yellow-500 text-gray-800' : 
                     'bg-green-500 text-white'
                   }`}>
                    {p.stockInLocation}
                  </div>
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-gray-500 text-xs">No imagen</span>
                    )}
                  </div>
                  <p className={`text-xs font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{p.name}</p>
                  <p className={`text-sm font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>${p.price}</p>
                </div>
              ))}
            </div>
          </div>
          
          <Button className="w-full mt-3 py-2 font-semibold flex items-center justify-center space-x-2" onClick={() => setIsProductFormModalOpen(true)}>
            <Plus size={18} />
            <span>Agregar Producto</span>
          </Button>
        </Card>

        {lastSale && (
          <Modal isOpen={postPaymentModalOpen} onClose={() => setPostPaymentModalOpen(false)} title="Opciones de Ticket">
            <div className="p-4">
              <Ticket saleDetails={lastSale} />
              <div className="flex justify-end space-x-4 mt-4">
                <Button onClick={handlePrint} className="bg-blue-600 text-white hover:bg-blue-700">
                  Imprimir Ticket
                </Button>
                <Button onClick={() => {
                  // Logic to save ticket (e.g., download as PDF/image)
                  alert('Funcionalidad de guardar ticket no implementada aún.');
                  setPostPaymentModalOpen(false);
                }} className="bg-green-600 text-white hover:bg-green-700">
                  Guardar Ticket
                </Button>
                <Button onClick={() => setPostPaymentModalOpen(false)} className="bg-gray-300 hover:bg-gray-400">
                  Cerrar
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {canAccessEmployeeConsumption && (
          <Modal isOpen={isEmployeeConsumptionModalOpen} onClose={() => setIsEmployeeConsumptionModalOpen(false)} title="Registrar Consumo de Empleados">
            <EmployeeConsumptionModal onClose={() => setIsEmployeeConsumptionModalOpen(false)} />
          </Modal>
        )}

        <Modal isOpen={isTicketDesignModalOpen} onClose={() => setIsTicketDesignModalOpen(false)} title="Editar Diseño de Ticket">
          <TicketDesignModal onClose={() => setIsTicketDesignModalOpen(false)} />
        </Modal>

        <Modal isOpen={isCalculatorModalOpen} onClose={() => setIsCalculatorModalOpen(false)} title="Calculadora">
          <CalculatorModal onClose={() => setIsCalculatorModalOpen(false)} />
        </Modal>

        <Modal isOpen={isDiscountModalOpen} onClose={() => setIsDiscountModalOpen(false)} title="Aplicar Descuento">
          <DiscountModal onClose={() => setIsDiscountModalOpen(false)} />
        </Modal>

        <Modal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} title="Añadir Nota a la Venta">
          <NoteModal onClose={() => setIsNoteModalOpen(false)} />
        </Modal>

        <Modal isOpen={isPaymentMethodModalOpen} onClose={() => setIsPaymentMethodModalOpen(false)} title="Procesar Pago">
          <PaymentModal 
            onClose={() => setIsPaymentMethodModalOpen(false)}
            onPayment={handlePaymentSuccess}
            total={subtotal}
          />
        </Modal>

        <Modal isOpen={isCashClosingModalOpen} onClose={() => setIsCashClosingModalOpen(false)} title="Cierre de Caja">
          <CashClosingModal onClose={() => setIsCashClosingModalOpen(false)} />
        </Modal>

        <Modal isOpen={isProductFormModalOpen} onClose={() => setIsProductFormModalOpen(false)} title="Añadir Producto">
          <ProductFormModal onClose={() => setIsProductFormModalOpen(false)} />
        </Modal>

        <Modal isOpen={isPreviousSalesModalOpen} onClose={() => setIsPreviousSalesModalOpen(false)} title="Ventas Anteriores">
          <PreviousSalesModal onClose={() => setIsPreviousSalesModalOpen(false)} />
        </Modal>

        <Modal isOpen={isScheduleVisitModalOpen} onClose={() => setIsScheduleVisitModalOpen(false)} title="Agendar Visita de Proveedor">
          <ScheduleVisitModal onClose={() => setIsScheduleVisitModalOpen(false)} />
        </Modal>

        <Modal isOpen={isWithdrawalModalOpen} onClose={() => setIsWithdrawalModalOpen(false)} title="Retiro de Efectivo">
          <WithdrawalModal onClose={() => setIsWithdrawalModalOpen(false)} />
        </Modal>

        <Modal isOpen={isProductCollectionModalOpen} onClose={() => setIsProductCollectionModalOpen(false)} title="Colección de Productos">
          <ProductCollectionModal onClose={() => setIsProductCollectionModalOpen(false)} />
        </Modal>
      </main>
  );
}