import React, { cloneElement } from 'react';
import { Link, LinkProps } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';

// Safe Link wrapper that prevents CSS errors on web by flattening and
// sanitizing the child's style prop (removes shadow props and ensures we
// don't pass raw style arrays to the DOM).
export const SafeLink: React.FC<LinkProps> = ({ children, ...props }) => {
  // On web, clone the child and replace its style with a flattened, sanitized
  // object so react-native-web doesn't attempt to write indexed properties
  // (which triggers the "indexed property [0]" TypeError).
  if (Platform.OS === 'web' && React.isValidElement(children)) {
    const child: any = children;
    const originalStyle = child.props?.style;
    const flattened = StyleSheet.flatten(originalStyle) || {};

    // Remove problematic shadow properties and ensure no top-level arrays
    const { shadowColor, shadowOffset, shadowOpacity, shadowRadius, elevation, ...rest } = flattened;

    const safeStyle = { ...rest };

    // If any property is an array at top-level (rare after flatten), remove it
    Object.keys(safeStyle).forEach((k) => {
      if (Array.isArray((safeStyle as any)[k])) {
        delete (safeStyle as any)[k];
      }
    });

    const cloned = cloneElement(child, {
      style: safeStyle,
    });

    return (
      <Link {...props}>
        {cloned}
      </Link>
    );
  }

  // Non-web or non-element children: just render Link normally
  return <Link {...props}>{children}</Link>;
};
