import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const CalculatorModal = ({ onClose, onResult }) => {
  const [display, setDisplay] = useState('0');
  const [currentValue, setCurrentValue] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputDigit = (digit) => {
    if (waitingForOperand) {
      setDisplay(String(digit));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(digit) : display + digit);
    }
  };

  const inputDot = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clearDisplay = () => {
    setDisplay('0');
    setCurrentValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  };

  const toggleSign = () => {
    setDisplay(String(parseFloat(display) * -1));
  };

  const inputPercent = () => {
    const value = parseFloat(display);
    setDisplay(String(value / 100));
  };

  const performOperation = (nextOperator) => {
    const inputValue = parseFloat(display);

    if (currentValue === null) {
      setCurrentValue(inputValue);
    } else if (operator) {
      const result = operate(currentValue, inputValue, operator);
      setDisplay(String(result));
      setCurrentValue(result);
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  const operate = (val1, val2, op) => {
    switch (op) {
      case '+': return val1 + val2;
      case '-': return val1 - val2;
      case '*': return val1 * val2;
      case '/': return val1 / val2;
      default: return val2;
    }
  };

  const handleEquals = () => {
    if (currentValue !== null && operator !== null && !waitingForOperand) {
      const result = operate(currentValue, parseFloat(display), operator);
      setDisplay(String(result));
      setCurrentValue(null);
      setOperator(null);
      setWaitingForOperand(false);
      onResult(result); // Pass result back to parent
      onClose();
    } else if (onResult) {
        onResult(parseFloat(display)); // If equals is pressed without a full operation, just return current display
        onClose();
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-lg w-64 mx-auto">
      <Input type="text" value={display} readOnly className="w-full text-right text-2xl mb-4 p-2 border rounded" />
      <div className="grid grid-cols-4 gap-2">
        <Button onClick={clearDisplay} className="col-span-1 bg-gray-300 hover:bg-gray-400">AC</Button>
        <Button onClick={toggleSign} className="col-span-1 bg-gray-300 hover:bg-gray-400">+/-</Button>
        <Button onClick={inputPercent} className="col-span-1 bg-gray-300 hover:bg-gray-400">%</Button>
        <Button onClick={() => performOperation('/')} className="col-span-1 bg-orange-500 hover:bg-orange-600 text-white">/</Button>

        <Button onClick={() => inputDigit(7)} className="col-span-1 bg-gray-200 hover:bg-gray-300">7</Button>
        <Button onClick={() => inputDigit(8)} className="col-span-1 bg-gray-200 hover:bg-gray-300">8</Button>
        <Button onClick={() => inputDigit(9)} className="col-span-1 bg-gray-200 hover:bg-gray-300">9</Button>
        <Button onClick={() => performOperation('*')} className="col-span-1 bg-orange-500 hover:bg-orange-600 text-white">x</Button>

        <Button onClick={() => inputDigit(4)} className="col-span-1 bg-gray-200 hover:bg-gray-300">4</Button>
        <Button onClick={() => inputDigit(5)} className="col-span-1 bg-gray-200 hover:bg-gray-300">5</Button>
        <Button onClick={() => inputDigit(6)} className="col-span-1 bg-gray-200 hover:bg-gray-300">6</Button>
        <Button onClick={() => performOperation('-')} className="col-span-1 bg-orange-500 hover:bg-orange-600 text-white">-</Button>

        <Button onClick={() => inputDigit(1)} className="col-span-1 bg-gray-200 hover:bg-gray-300">1</Button>
        <Button onClick={() => inputDigit(2)} className="col-span-1 bg-gray-200 hover:bg-gray-300">2</Button>
        <Button onClick={() => inputDigit(3)} className="col-span-1 bg-gray-200 hover:bg-gray-300">3</Button>
        <Button onClick={() => performOperation('+')} className="col-span-1 bg-orange-500 hover:bg-orange-600 text-white">+</Button>

        <Button onClick={() => inputDigit(0)} className="col-span-2 bg-gray-200 hover:bg-gray-300">0</Button>
        <Button onClick={inputDot} className="col-span-1 bg-gray-200 hover:bg-gray-300">.</Button>
        <Button onClick={handleEquals} className="col-span-1 bg-orange-500 hover:bg-orange-600 text-white">=</Button>
      </div>
    </div>
  );
};

export default CalculatorModal;
