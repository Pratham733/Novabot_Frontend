import { Platform } from 'react-native';

export const createWebSafeStyles = (styles: any) => {
  if (Platform.OS !== 'web') {
    return styles;
  }

  // For web platform, remove or modify problematic style properties
  const webSafeStyles = { ...styles };
  
  Object.keys(webSafeStyles).forEach(styleKey => {
    const style = webSafeStyles[styleKey];
    if (typeof style === 'object' && style !== null) {
      // Convert shadow properties to web-safe box shadow
      if (style.shadowColor) {
        const shadowColor = style.shadowColor;
        const shadowOffset = style.shadowOffset || { width: 0, height: 2 };
        const shadowOpacity = style.shadowOpacity || 0.1;
        const shadowRadius = style.shadowRadius || 4;
        
        // Create box-shadow from React Native shadow properties
        const rgba = shadowColor === '#000' 
          ? `rgba(0, 0, 0, ${shadowOpacity})`
          : shadowColor.includes('#') 
            ? `${shadowColor}${Math.round(shadowOpacity * 255).toString(16).padStart(2, '0')}`
            : shadowColor;
            
        style.boxShadow = `${shadowOffset.width}px ${shadowOffset.height}px ${shadowRadius}px ${rgba}`;
        
        // Remove React Native shadow properties
        delete style.shadowColor;
        delete style.shadowOffset;
        delete style.shadowOpacity;
        delete style.shadowRadius;
        delete style.elevation;
      }
      
      // Fix transform arrays for web
      if (style.transform && Array.isArray(style.transform)) {
        style.transform = style.transform.map((t: any) => {
          if (typeof t === 'object') {
            const key = Object.keys(t)[0];
            return `${key}(${t[key]})`;
          }
          return t;
        }).join(' ');
      }

      // Fix textTransform for web compatibility
      if (style.textTransform) {
        // Keep as is - React Native Web handles this correctly
      }
    }
  });

  return webSafeStyles;
};

// Helper function to create platform-specific styles
export const platformStyles = (webStyles: any, nativeStyles: any) => {
  return Platform.OS === 'web' ? webStyles : nativeStyles;
};

// Shadow utility specifically for buttons and cards
export const createShadow = (color: string = '#000', opacity: number = 0.1, radius: number = 4, offset = { width: 0, height: 2 }) => {
  if (Platform.OS === 'web') {
    return {
      boxShadow: `${offset.width}px ${offset.height}px ${radius}px rgba(0, 0, 0, ${opacity})`,
    };
  }
  return {
    shadowColor: color,
    shadowOffset: offset,
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation: radius,
  };
};

export default createWebSafeStyles;
