// Fix for React Native Web CSS styling issues
if (typeof document !== 'undefined') {
    // Override problematic style setting in React Native Web
    const originalSetProperty = CSSStyleDeclaration.prototype.setProperty;
    CSSStyleDeclaration.prototype.setProperty = function (property, value, priority) {
        try {
            // Skip problematic indexed property settings
            if (typeof property === 'number') {
                return;
            }
            return originalSetProperty.call(this, property, value, priority);
        } catch (e) {
            // Silently fail for problematic properties
            console.warn('Style property warning:', property, value, e);
        }
    };

    // Also override indexed setter
    const descriptor = Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, '0');
    if (descriptor && descriptor.set) {
        Object.defineProperty(CSSStyleDeclaration.prototype, '0', {
            set: function (value) {
                // Skip indexed property setting that causes the error
                console.warn('Skipping indexed CSS property setting:', value);
            },
            configurable: true
        });
    }

    // Fix for transform arrays in React Native Web
    const originalTransformSetter = Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, 'transform');
    if (originalTransformSetter && originalTransformSetter.set) {
        Object.defineProperty(CSSStyleDeclaration.prototype, 'transform', {
            set: function (value) {
                try {
                    if (Array.isArray(value)) {
                        // Convert React Native transform array to CSS transform string
                        const transformString = value.map(transform => {
                            const key = Object.keys(transform)[0];
                            const val = transform[key];
                            if (key === 'scale') return `scale(${val})`;
                            if (key === 'translateX') return `translateX(${val}px)`;
                            if (key === 'translateY') return `translateY(${val}px)`;
                            if (key === 'rotate') return `rotate(${val})`;
                            return `${key}(${val})`;
                        }).join(' ');
                        return originalTransformSetter.set.call(this, transformString);
                    }
                    return originalTransformSetter.set.call(this, value);
                } catch (e) {
                    console.warn('Transform property warning:', value, e);
                }
            },
            get: originalTransformSetter.get,
            configurable: true
        });
    }
}
