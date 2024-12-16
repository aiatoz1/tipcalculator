import React, { useState, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import './App.css';

function App() {
  const [billTotal, setBillTotal] = useState(null);
  const [tipPercentage, setTipPercentage] = useState(15);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef(null);
  const photoRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const captureReceipt = () => {
    const width = videoRef.current.videoWidth;
    const height = videoRef.current.videoHeight;
    
    photoRef.current.width = width;
    photoRef.current.height = height;
    
    const ctx = photoRef.current.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, width, height);
    
    processImage(photoRef.current.toDataURL('image/jpeg'));
  };

  const processImage = async (imageData) => {
    setIsProcessing(true);
    const worker = await createWorker();
    
    try {
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      const { data: { text } } = await worker.recognize(imageData);
      
      // Extract total amount using regex
      const amounts = text.match(/\$?\d+\.\d{2}/g);
      if (amounts && amounts.length > 0) {
        // Usually the last amount is the total
        const total = parseFloat(amounts[amounts.length - 1].replace('$', ''));
        setBillTotal(total);
      }
    } catch (err) {
      console.error("Error processing image:", err);
    } finally {
      await worker.terminate();
      setIsProcessing(false);
    }
  };

  const calculateTip = () => {
    if (!billTotal) return { tip: 0, total: 0 };
    const tip = (billTotal * tipPercentage) / 100;
    const total = billTotal + tip;
    return {
      tip: tip.toFixed(2),
      total: total.toFixed(2)
    };
  };

  const results = calculateTip();

  return (
    <div className="App">
      <h1>Receipt Scanner & Tip Calculator</h1>
      
      <div className="camera-section">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline
          onLoadedMetadata={() => videoRef.current.play()}
        />
        <canvas ref={photoRef} style={{ display: 'none' }} />
        
        {!billTotal && (
          <>
            <button onClick={startCamera}>Start Camera</button>
            <button onClick={captureReceipt}>Capture Receipt</button>
          </>
        )}
      </div>

      {isProcessing && <div className="processing">Processing receipt...</div>}

      {billTotal && (
        <div className="calculator">
          <div className="bill-display">
            <h2>Bill Total: ${billTotal.toFixed(2)}</h2>
          </div>

          <div className="tip-slider">
            <label>Tip Percentage: {tipPercentage}%</label>
            <input 
              type="range"
              min="0"
              max="30"
              value={tipPercentage}
              onChange={(e) => setTipPercentage(parseInt(e.target.value))}
            />
          </div>

          <div className="results">
            <h3>Tip Amount: ${results.tip}</h3>
            <h3>Total with Tip: ${results.total}</h3>
          </div>

          <button onClick={() => setBillTotal(null)}>Scan New Receipt</button>
        </div>
      )}
    </div>
  );
}

export default App;
