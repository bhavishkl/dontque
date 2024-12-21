import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, Clock } from 'lucide-react';

const TimePicker = ({ value, onChange, className = '', label = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState('12');
  const [minutes, setMinutes] = useState('00');
  const [period, setPeriod] = useState('AM');
  const [inputValue, setInputValue] = useState('');
  const timePickerRef = useRef(null);

  useEffect(() => {
    if (value) {
      const [time, ampm] = value.split(' ');
      const [h, m] = time.split(':');
      setHours(h);
      setMinutes(m);
      setPeriod(ampm);
      setInputValue(time);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (timePickerRef.current && !timePickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTimeChange = (newHours, newMinutes) => {
    const formattedHours = (newHours || hours).toString().padStart(2, '0');
    const formattedMinutes = (newMinutes || minutes).toString().padStart(2, '0');
    const newValue = `${formattedHours}:${formattedMinutes}`;
    setInputValue(newValue);
    setHours(formattedHours);
    setMinutes(formattedMinutes);
    onChange(`${newValue} ${period}`);
  };

  const formatTimeInput = (input) => {
    const digitsOnly = input.replace(/\D/g, '');
    
    if (digitsOnly.length <= 2) {
      return digitsOnly;
    } else {
      return `${digitsOnly.slice(0, 2)}:${digitsOnly.slice(2, 4)}`;
    }
  };

  const validateTimeFormat = (time) => {
    const timeRegex = /^(0?[1-9]|1[0-2]):([0-5][0-9])$/;
    return timeRegex.test(time);
  };

  const handleInputChange = (e) => {
    const newValue = formatTimeInput(e.target.value);
    setInputValue(newValue);

    if (validateTimeFormat(newValue)) {
      const [h, m] = newValue.split(':');
      setHours(h.padStart(2, '0'));
      setMinutes(m);
      onChange(`${newValue} ${period}`);
    }
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    onChange(`${inputValue} ${newPeriod}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsOpen(false);
    }
  };

  const incrementHours = () => {
    const newHours = (parseInt(hours) % 12) + 1;
    handleTimeChange(newHours, parseInt(minutes));
  };
  
  const decrementHours = () => {
    const newHours = (parseInt(hours) - 1 + 12) % 12 || 12;
    handleTimeChange(newHours, parseInt(minutes));
  };
  
  const incrementMinutes = () => {
    const newMinutes = (parseInt(minutes) + 1) % 60;
    handleTimeChange(parseInt(hours), newMinutes);
  };
  
  const decrementMinutes = () => {
    const newMinutes = (parseInt(minutes) - 1 + 60) % 60;
    handleTimeChange(parseInt(hours), newMinutes);
  };

  return (
<div className={`relative ${className}`} ref={timePickerRef}>
{label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}      <div className="flex items-center justify-between p-2 border border-gray-300 rounded-md cursor-pointer hover:border-blue-500 transition-colors duration-200">
        <Clock className="w-5 h-5 text-gray-500" />
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onClick={() => setIsOpen(true)}
          className="ml-2 w-full focus:outline-none"
          placeholder="HH:MM"
          maxLength={5}
        />
        <div className="flex">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handlePeriodChange('AM');
            }}
            className={`px-2 py-1 text-sm ${period === 'AM' ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded-l-md`}
          >
            AM
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handlePeriodChange('PM');
            }}
            className={`px-2 py-1 text-sm ${period === 'PM' ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded-r-md`}
          >
            PM
          </button>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        />
      </div>
      {isOpen && (
        <div className="absolute z-10 mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4 w-64 animate-fade-in-down">
          <div className="flex justify-between items-center mb-4">
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  incrementHours();
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <ChevronUp className="w-5 h-5 text-gray-500" />
              </button>
              <span className="w-12 text-center text-2xl font-semibold">{hours}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  decrementHours();
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <ChevronDown className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <span className="text-2xl font-semibold">:</span>
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  incrementMinutes();
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <ChevronUp className="w-5 h-5 text-gray-500" />
              </button>
              <span className="w-12 text-center text-2xl font-semibold">{minutes}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  decrementMinutes();
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <ChevronDown className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
          >
            Set Time
          </button>
        </div>
      )}
    </div>
  );
};

export default TimePicker;