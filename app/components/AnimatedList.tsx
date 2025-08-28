import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';

// motion/react is web-only; make component degrade gracefully on native
let motion: any = null;
let useInView: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  motion = require('motion/react');
  useInView = motion.useInView;
} catch (e) {
  // motion not available (native), continue without animation
  motion = null;
}

type AnimatedListProps = {
  items?: string[];
  onItemSelect?: (item: string, index: number) => void;
  showGradients?: boolean;
  enableArrowNavigation?: boolean;
  displayScrollbar?: boolean;
  className?: string;
  itemClassName?: string;
};

export default function AnimatedList({
  items = Array.from({ length: 15 }).map((_, i) => `Item ${i + 1}`),
  onItemSelect,
  showGradients = true,
  enableArrowNavigation = true,
  displayScrollbar = true,
}: AnimatedListProps) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [keyboardNav, setKeyboardNav] = useState(false);
  const [topGradientOpacity, setTopGradientOpacity] = useState(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(1);

  useEffect(() => {
    if (!enableArrowNavigation) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
        e.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
      } else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
        e.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        if (selectedIndex >= 0 && selectedIndex < items.length) {
          e.preventDefault();
          if (onItemSelect) onItemSelect(items[selectedIndex], selectedIndex);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, selectedIndex, onItemSelect, enableArrowNavigation]);

  useEffect(() => {
    if (!keyboardNav || selectedIndex < 0 || !listRef.current) return;
    const container = listRef.current as any;
    const selectedItem = container.querySelector(`[data-index="${selectedIndex}"]`);
    if (selectedItem) {
      const extraMargin = 50;
      const containerScrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const itemTop = selectedItem.offsetTop;
      const itemBottom = itemTop + selectedItem.offsetHeight;
      if (itemTop < containerScrollTop + extraMargin) {
        container.scrollTo({ top: itemTop - extraMargin, behavior: 'smooth' });
      } else if (itemBottom > containerScrollTop + containerHeight - extraMargin) {
        container.scrollTo({ top: itemBottom - containerHeight + extraMargin, behavior: 'smooth' });
      }
    }
    setKeyboardNav(false);
  }, [selectedIndex, keyboardNav]);

  const handleScroll = (e: any) => {
    const target = e.target;
    const { scrollTop, scrollHeight, clientHeight } = target;
    setTopGradientOpacity(Math.min(scrollTop / 50, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1));
  };

  // If motion is available and we're on web, use motion.div for items; otherwise fall back to div or View
  const ItemWrapper: any = (props: any) => {
    if (motion && Platform.OS === 'web') {
      const MotionDiv = motion.motion.div;
      const { index, delay, children, onMouseEnter, onClick } = props;
      return (
        <MotionDiv
          ref={props.forwardedRef}
          data-index={index}
          onMouseEnter={onMouseEnter}
          onClick={onClick}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={props.inView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
          transition={{ duration: 0.2, delay }}
          style={{ marginBottom: '1rem', cursor: 'pointer' }}
        >
          {children}
        </MotionDiv>
      );
    }
    return (
      <div data-index={props.index} onMouseEnter={props.onMouseEnter} onClick={props.onClick} style={{ marginBottom: '1rem', cursor: 'pointer' }}>
        {props.children}
      </div>
    );
  };

  return (
    <div style={webStyles.container}>
      <div
        ref={listRef as any}
        style={{
          ...webStyles.scrollList,
          overflowY: displayScrollbar ? 'auto' : 'hidden',
        }}
        onScroll={handleScroll}
      >
        {items.map((item, index) => (
          <ItemWrapper
            key={index}
            index={index}
            delay={0.1}
            onMouseEnter={() => setSelectedIndex(index)}
            onClick={() => {
              setSelectedIndex(index);
              if (onItemSelect) onItemSelect(item, index);
            }}
          >
            <div data-index={index} style={{ ...webStyles.item, ...(selectedIndex === index ? webStyles.itemSelected : {}) }}>
              <p style={webStyles.itemText}>{item}</p>
            </div>
          </ItemWrapper>
        ))}
      </div>

      {showGradients && (
        <>
          <div style={{ ...webStyles.topGradient, opacity: topGradientOpacity }} />
          <div style={{ ...webStyles.bottomGradient, opacity: bottomGradientOpacity }} />
        </>
      )}
    </div>
  );
}

const webStyles: any = {
  container: { position: 'relative', width: 500 },
  scrollList: { maxHeight: 400, overflowY: 'auto', padding: 16 },
  item: { padding: 16, backgroundColor: '#170D27', borderRadius: 8 },
  itemSelected: { backgroundColor: '#271E37' },
  itemText: { color: 'white', margin: 0 },
  topGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 50, background: 'linear-gradient(to bottom, #060010, transparent)', pointerEvents: 'none', transition: 'opacity 0.3s ease' },
  bottomGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, background: 'linear-gradient(to top, #060010, transparent)', pointerEvents: 'none', transition: 'opacity 0.3s ease' },
};
