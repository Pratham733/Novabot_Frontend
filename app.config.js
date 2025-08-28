// app.config.js
export default {
  expo: {
    name: "nova_bot",
    slug: "nova-bot",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "nova-bot",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
      injectedJavaScript: `
        // Aggressive React Native Web CSS fixes
        (function() {
          if (typeof CSSStyleDeclaration === 'undefined') return;
          
          // Store originals
          const originalSetProperty = CSSStyleDeclaration.prototype.setProperty;
          const originalItem = CSSStyleDeclaration.prototype.item;
          
          // Shadow properties that cause issues
          const shadowProps = ['shadowColor', 'shadowOffset', 'shadowOpacity', 'shadowRadius', 'elevation'];
          
          // Override setProperty completely
          CSSStyleDeclaration.prototype.setProperty = function(property, value, priority) {
            try {
              // Block all indexed property access
              if (typeof property === 'number' || !isNaN(Number(property))) {
                console.warn('Blocked indexed CSS property:', property, value);
                return;
              }
              
              // Block shadow properties that cause conversion issues
              if (shadowProps.includes(property)) {
                console.warn('Blocked shadow property (use boxShadow):', property, value);
                return;
              }
              
              // Handle transform arrays properly
              if (property === 'transform' && Array.isArray(value)) {
                value = value.map(t => {
                  if (typeof t === 'object' && t !== null) {
                    return Object.keys(t).map(k => \`\${k}(\${t[k]})\`).join(' ');
                  }
                  return String(t);
                }).join(' ');
              }
              
              // Validate property name
              if (typeof property !== 'string' || property.length === 0) {
                console.warn('Invalid CSS property name:', property);
                return;
              }
              
              return originalSetProperty.call(this, property, value, priority);
            } catch (e) {
              console.error('CSS setProperty error:', { property, value, error: e.message });
              return; // Fail silently
            }
          };
          
          // Override indexed item access
          CSSStyleDeclaration.prototype.item = function(index) {
            try {
              return originalItem.call(this, index);
            } catch (e) {
              console.warn('CSS item access blocked:', index);
              return '';
            }
          };
          
          // Prevent direct property assignment via defineProperty
          const originalDefineProperty = Object.defineProperty;
          Object.defineProperty = function(obj, prop, descriptor) {
            if (obj instanceof CSSStyleDeclaration) {
              if (typeof prop === 'number' || !isNaN(Number(prop))) {
                console.warn('Blocked CSS indexed property definition:', prop);
                return obj;
              }
              if (shadowProps.includes(prop)) {
                console.warn('Blocked shadow property definition:', prop);
                return obj;
              }
            }
            return originalDefineProperty.call(this, obj, prop, descriptor);
          };
          
          // Global error handler for CSS-related errors
          const originalError = window.onerror;
          window.onerror = function(msg, source, lineno, colno, error) {
            if (msg && typeof msg === 'string') {
              if (msg.includes('CSSStyleDeclaration') || 
                  msg.includes('indexed property') ||
                  msg.includes('setValueForStyle')) {
                console.warn('Intercepted CSS error:', msg);
                return true; // Prevent error propagation
              }
            }
            return originalError ? originalError.call(this, msg, source, lineno, colno, error) : false;
          };
          
          // Also handle unhandled promise rejections related to CSS
          window.addEventListener('unhandledrejection', function(event) {
            if (event.reason && event.reason.message && 
                (event.reason.message.includes('CSSStyleDeclaration') ||
                 event.reason.message.includes('indexed property'))) {
              console.warn('Prevented CSS-related promise rejection:', event.reason.message);
              event.preventDefault();
            }
          });
          
          console.log('React Native Web CSS protection enabled');
        })();
      `
    },
    plugins: [
      "expo-router"
    ],
    experiments: {
      typedRoutes: true
    }
  }
};
