import React, { useState, useRef, useEffect } from 'react';
import { useZxing } from 'react-zxing';

const QRScanner = ({ onResult, onError }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);

  // Función para solicitar permiso de cámara
  const requestCameraPermission = async () => {
    try {
      // Verificar si estamos en un contexto seguro (HTTPS)
      if (!window.isSecureContext) {
        throw new Error('Camera access requires HTTPS');
      }

      // Verificar si mediaDevices está disponible
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not supported in this browser');
      }

      // Solicitar acceso a la cámara
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Usar cámara trasera si está disponible
        } 
      });
      
      // Detener el stream inmediatamente después de obtener permiso
      stream.getTracks().forEach(track => track.stop());
      
      setHasPermission(true);
      setError(null);
      return true;
    } catch (err) {
      console.error('Error requesting camera permission:', err);
      setHasPermission(false);
      
      // Manejar diferentes tipos de errores
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Permiso de cámara denegado. Por favor, permite el acceso a la cámara en la configuración de tu navegador.');
      } else if (err.name === 'NotFoundError' || err.name === 'OverconstrainedError') {
        setError('No se encontró una cámara compatible.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('La cámara no está disponible. Puede estar en uso por otra aplicación.');
      } else if (err.name === 'AbortError') {
        setError('La solicitud de acceso a la cámara fue abortada.');
      } else {
        setError(`Error al acceder a la cámara: ${err.message}`);
      }
      
      onError?.(err);
      return false;
    }
  };

  // Función para iniciar el escaneo
  const startScanning = async () => {
    const permissionGranted = await requestCameraPermission();
    if (permissionGranted) {
      setIsScanning(true);
    }
  };

  // Función para detener el escaneo
  const stopScanning = () => {
    setIsScanning(false);
  };

  // Hook de react-zxing
  const { ref } = useZxing({
    onResult(result) {
      if (isScanning) {
        onResult?.(result);
        stopScanning(); // Detener escaneo después de obtener un resultado
      }
    },
    onError(err) {
      console.error('Scanner error:', err);
      onError?.(err);
    },
  });

  // Asignar la referencia al video cuando está escaneando
  useEffect(() => {
    if (isScanning && videoRef.current) {
      ref(videoRef.current);
    }
  }, [isScanning]);

  return (
    <div className="qr-scanner">
      {!isScanning ? (
        <div className="scanner-controls">
          <button 
            onClick={startScanning}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Iniciar Escáner QR
          </button>
          {error && (
            <div className="error-message text-red-500 mt-2 text-sm">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="scanner-container">
          <div className="video-container relative">
            <video 
              ref={videoRef}
              className="w-full max-w-md h-auto aspect-video bg-gray-200 rounded-xl mx-auto"
            />
            <button 
              onClick={stopScanning}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
            >
              Detener
            </button>
          </div>
          <p className="text-center text-sm text-gray-500 mt-2">
            Apunta la cámara hacia un código QR o código de barras
          </p>
        </div>
      )}
      
      {/* Mostrar estado de permisos */}
      {hasPermission === false && !isScanning && (
        <div className="permission-info mt-4 p-4 bg-yellow-100 rounded-lg">
          <p className="text-yellow-800">
            Para usar el escáner QR, necesitas permitir el acceso a la cámara.
            Si ya denegaste el permiso, puedes cambiarlo en la configuración de tu navegador.
          </p>
          <button 
            onClick={requestCameraPermission}
            className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded text-sm"
          >
            Reintentar Permiso
          </button>
        </div>
      )}
    </div>
  );
};

export default QRScanner;