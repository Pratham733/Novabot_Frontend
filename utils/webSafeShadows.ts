// Comprehensive React Native Web Shadow Fix
import { Platform } from 'react-native';
import React from 'react';

// Utility to convert React Native shadow to web-safe boxShadow
export const convertShadowStyles = (styles: any) => {
  if (Platform.OS !== 'web') return styles;
  
  const convertedStyles = { ...styles };
  
  // Extract shadow properties
  const { shadowColor, shadowOffset, shadowOpacity, shadowRadius, elevation, ...restStyles } = convertedStyles;
  
  // If we have shadow properties, convert to boxShadow
  if (shadowColor || shadowOffset || shadowOpacity || shadowRadius || elevation) {
    const color = shadowColor || '#000';
    const offsetX = shadowOffset?.width || 0;
    const offsetY = shadowOffset?.height || 2;
    const blur = shadowRadius || 4;
    const opacity = shadowOpacity || 0.1;
    
    // Convert color with opacity
    let shadowColorWithOpacity;
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      shadowColorWithOpacity = `rgba(${r}, ${g}, ${b}, ${opacity})`;
    } else if (color.startsWith('rgba')) {
      shadowColorWithOpacity = color;
    } else {
      shadowColorWithOpacity = `rgba(0, 0, 0, ${opacity})`;
    }
    
    return {
      ...restStyles,
      boxShadow: `${offsetX}px ${offsetY}px ${blur}px ${shadowColorWithOpacity}`,
      // Explicitly undefined React Native shadow properties for web
      shadowColor: undefined,
      shadowOffset: undefined,
      shadowOpacity: undefined,
      shadowRadius: undefined,
      elevation: undefined,
    };
  }
  
  return convertedStyles;
};

// Higher-order component to automatically fix shadow styles
export const withWebSafeShadows = (Component: React.ComponentType<any>) => {
  return (props: any) => {
    if (Platform.OS !== 'web') return React.createElement(Component, props);
    
    const convertedProps = { ...props };
    if (convertedProps.style) {
      convertedProps.style = Array.isArray(convertedProps.style)
        ? convertedProps.style.map(convertShadowStyles)
        : convertShadowStyles(convertedProps.style);
    }
    
    return React.createElement(Component, convertedProps);
  };
};

// StyleSheet.create wrapper that automatically converts shadows for web
export const createWebSafeStyles = (styles: Record<string, any>) => {
  if (Platform.OS !== 'web') return styles;
  
  const convertedStyles: Record<string, any> = {};
  
  Object.keys(styles).forEach(key => {
    convertedStyles[key] = convertShadowStyles(styles[key]);
  });
  
  return convertedStyles;
};
