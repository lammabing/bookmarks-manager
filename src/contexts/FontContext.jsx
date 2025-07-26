import React, { createContext, useContext, useState, useEffect } from 'react';

const FontContext = createContext();

export const useFontContext = () => {
  const context = useContext(FontContext);
  if (!context) {
    throw new Error('useFontContext must be used within a FontProvider');
  }
  return context;
};

export const FontProvider = ({ children }) => {
  const [fontSettings, setFontSettings] = useState({
    titleFontFamily: 'Inter, sans-serif',
    titleFontSize: 16,
    titleFontWeight: 'bold',
    titleFontColor: '#111827',
    descriptionFontFamily: 'Inter, sans-serif',
    descriptionFontSize: 14,
    descriptionFontWeight: 'normal',
    descriptionFontColor: '#6B7280',
    bodyFontFamily: 'Inter, sans-serif',
    fontSize: 'medium',
    bodyFontSize: 'medium',
    bodyFontWeight: 'normal',
    bodyFontColor: '#111827'
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('fontSettings');
    if (savedSettings) {
      setFontSettings(JSON.parse(savedSettings));
    }
  }, []);

  const updateFontSettings = (newSettings) => {
    const updatedSettings = { ...fontSettings, ...newSettings };
    setFontSettings(updatedSettings);
    localStorage.setItem('fontSettings', JSON.stringify(updatedSettings));
  };

  const value = {
    fontSettings,
    updateFontSettings
  };

  return (
    <FontContext.Provider value={value}>
      {children}
    </FontContext.Provider>
  );
};
