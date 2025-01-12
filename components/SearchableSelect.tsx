'use client'

import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import React, { useState, useEffect, useRef } from 'react';

interface Option {
  id: number;
  name: string;
}

interface SearchableSelectProps {
  options: Option[];
  value?: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  isLoading?: boolean;
  error?: string;
}

const SearchableSelect = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select an option",
  isLoading = false,
  error
}: SearchableSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(option => option.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <div
        className="w-full px-4 py-2 text-black dark:text-white dark:bg-black border border-gray-300 rounded-lg flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`${!selectedOption ? 'text-gray-500 dark:text-white' : ''}`}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <ChevronDownIcon className="w-4 h-4 text-black dark:text-white" />
      </div>

      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 text-black dark:text-white bg-white dark:bg-black border border-gray-300 rounded-lg shadow-lg">
          <input
            type="text"
            className="w-full p-2 border-b border-gray-300 bg-white dark:bg-black"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
          <div className="max-h-60 overflow-auto">
            {isLoading ? (
              <div className="p-2 text-center text-gray-500 dark:text-white">Loading...</div>
            ) : filteredOptions.length === 0 ? (
              <div className="p-2 text-center text-gray-500 dark:text-white">No results found</div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                  onClick={() => {
                    onChange(option.id);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                >
                  <span>{option.name}</span>
                  {value === option.id && (
                    <CheckIcon className="w-4 h-4 text-blue-600" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;