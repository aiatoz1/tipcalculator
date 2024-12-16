import React, { useState } from 'react';
import './App.css';

function App() {
  const [bill, setBill] = useState('');
  const [tipPercentage, setTipPercentage] = useState(15);
  const [people, setPeople] = useState(1);

  const calculateTip = () => {
    const billAmount = parseFloat(bill);
    const tip = (billAmount * tipPercentage) / 100;
    const total = billAmount + tip;
    const perPerson = total / people;
    return {
      tip: tip.toFixed(2),
      total: total.toFixed(2),
      perPerson: perPerson.toFixed(2)
    };
  };

  const results = bill ? calculateTip() : { tip: '0.00', total: '0.00', perPerson: '0.00' };

  return (
    <div className="App">
      <h1>Tip Calculator</h1>
      <div className="calculator">
        <div className="input-group">
          <label>Bill Amount:</label>
          <input 
            type="number" 
            value={bill} 
            onChange={(e) => setBill(e.target.value)}
            placeholder="Enter bill amount"
          />
        </div>

        <div className="input-group">
          <label>Tip Percentage:</label>
          <input 
            type="number" 
            value={tipPercentage}
            onChange={(e) => setTipPercentage(parseInt(e.target.value) || 0)}
            placeholder="Tip percentage"
          />
        </div>

        <div className="input-group">
          <label>Number of People:</label>
          <input 
            type="number" 
            min="1"
            value={people}
            onChange={(e) => setPeople(parseInt(e.target.value) || 1)}
          />
        </div>

        <div className="results">
          <p>Tip Amount: ${results.tip}</p>
          <p>Total Amount: ${results.total}</p>
          <p>Per Person: ${results.perPerson}</p>
        </div>
      </div>
    </div>
  );
}

export default App;
