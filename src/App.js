import React, { useState, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import './App.css';

function App() {
  const [billTotal, setBillTotal] = useState(null);
  const [tipPercentage, setTipPercentage] = useState(15);
  const [people, setPeople] = useState(1);
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
      
      const amounts = text.match(/\$?\d+\.\d{2}/g);
      if (amounts && amounts.length > 0) {
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
    if (!billTotal) return { tip: 0, total: 0, perPerson: 0 };
    const tip = (billTotal * tipPercentage) / 100;
    const total = billTotal + tip;
    const perPerson = total / people;
    return {
      tip: tip.toFixed(2),
      total: total.toFixed(2),
      perPerson: perPerson.toFixed(2)
    };
  };

  const results = calculateTip();

  const commonTipPercentages = [15, 18, 20, 25];

  return (
    <div className="App">
      <div className="app-header">
        <h1>Snap & Split</h1>
        <p className="subtitle">Scan receipt • Calculate tip • Split bill</p>
      </div>
      
      <div className="camera-section">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline
          onLoadedMetadata={() => videoRef.current.play()}
        />
        <canvas ref={photoRef} style={{ display: 'none' }} />
        
        {!billTotal && (
          <div className="camera-controls">
            <button className="primary-btn" onClick={startCamera}>
              <span className="camera-icon">📷</span> Open Camera
            </button>
            <button className="capture-btn" onClick={captureReceipt}>
              Capture Receipt
            </button>
          </div>
        )}
      </div>

      {isProcessing && (
        <div className="processing-overlay">
          <div className="spinner"></div>
          <p>Processing receipt...</p>
        </div>
      )}

      {billTotal && (
        <div className="calculator">
          <div className="bill-display">
            <h2>Bill Total</h2>
            <div className="amount">${billTotal.toFixed(2)}</div>
          </div>

          <div className="tip-section">
            <h3>Select Tip %</h3>
            <div className="quick-tips">
              {commonTipPercentages.map(percent => (
                <button 
                  key={percent}
                  className={`tip-btn ${tipPercentage === percent ? 'active' : ''}`}
                  onClick={() => setTipPercentage(percent)}
                >
                  {percent}%
                </button>
              ))}
            </div>
            
            <div className="tip-slider">
              <input 
                type="range"
                min="0"
                max="50"
                value={tipPercentage}
                onChange={(e) => setTipPercentage(parseInt(e.target.value))}
              />
              <div className="custom-tip">
                Custom: {tipPercentage}%
              </div>
            </div>
          </div>

          <div className="split-section">
            <h3>Split Between</h3>
            <div className="people-control">
              <button 
                className="circle-btn"
                onClick={() => setPeople(Math.max(1, people - 1))}
              >
                -
              </button>
              <span className="people-count">{people} {people === 1 ? 'person' : 'people'}</span>
              <button 
                className="circle-btn"
                onClick={() => setPeople(people + 1)}
              >
                +
              </button>
            </div>
          </div>

          <div className="results">
            <div className="result-row">
              <span>Tip Amount</span>
              <span className="amount">${results.tip}</span>
            </div>
            <div className="result-row">
              <span>Total with Tip</span>
              <span className="amount">${results.total}</span>
            </div>
            <div className="result-row highlight">
              <span>Per Person</span>
              <span className="amount">${results.perPerson}</span>
            </div>
          </div>

          <button className="secondary-btn" onClick={() => setBillTotal(null)}>
            Scan New Receipt
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
