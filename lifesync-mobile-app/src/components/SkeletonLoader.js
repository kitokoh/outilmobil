import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const SkeletonLoader = ({ width = '100%', height = 20, borderRadius = 8, style }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#CBD5E1',
          opacity,
        },
        style,
      ]}
    />
  );
};

const DashboardSkeleton = ({ colors }) => {
  const bgColor = colors?.background || '#F8FAFC';
  const surfaceColor = colors?.surface || '#FFFFFF';
  const borderColor = colors?.border || '#E2E8F0';

  return (
    <View style={[skeletonStyles.container, { backgroundColor: bgColor }]}>
      {/* Header card skeleton */}
      <View style={[skeletonStyles.headerCard, { backgroundColor: colors?.primary || '#4F46E5' }]}>
        <View style={skeletonStyles.headerRow}>
          <View style={{ flex: 1 }}>
            <SkeletonLoader width="60%" height={28} style={{ backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 8 }} />
            <SkeletonLoader width="80%" height={16} style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <SkeletonLoader width={60} height={32} borderRadius={20} style={{ backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 4 }} />
            <SkeletonLoader width={80} height={12} style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
          </View>
        </View>
        <View style={skeletonStyles.statsRow}>
          <SkeletonLoader width={100} height={16} style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
          <SkeletonLoader width={80} height={16} style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
        </View>
      </View>

      {/* AI suggestion skeleton */}
      <View style={[skeletonStyles.card, { backgroundColor: surfaceColor, borderColor }]}>
        <View style={skeletonStyles.row}>
          <SkeletonLoader width={24} height={24} borderRadius={12} />
          <SkeletonLoader width="40%" height={18} style={{ marginLeft: 8 }} />
        </View>
        <SkeletonLoader width="90%" height={14} style={{ marginTop: 12 }} />
        <SkeletonLoader width="70%" height={14} style={{ marginTop: 6 }} />
      </View>

      {/* Quick nav grid skeleton */}
      <View style={skeletonStyles.gridRow}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={[skeletonStyles.gridItem, { backgroundColor: surfaceColor, borderColor }]}>
            <SkeletonLoader width={28} height={28} borderRadius={14} />
            <SkeletonLoader width="70%" height={14} style={{ marginTop: 8 }} />
            <SkeletonLoader width="40%" height={12} style={{ marginTop: 4 }} />
          </View>
        ))}
      </View>

      {/* Task list skeleton */}
      <View style={[skeletonStyles.card, { backgroundColor: surfaceColor, borderColor }]}>
        <SkeletonLoader width="50%" height={20} style={{ marginBottom: 16 }} />
        {[1, 2, 3].map((i) => (
          <View key={i} style={skeletonStyles.taskItem}>
            <SkeletonLoader width={22} height={22} borderRadius={11} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <SkeletonLoader width="80%" height={16} />
              <SkeletonLoader width="50%" height={12} style={{ marginTop: 6 }} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const skeletonStyles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  headerCard: {
    borderRadius: 16,
    padding: 24,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  gridItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0,
  },
});

export { SkeletonLoader, DashboardSkeleton };
export default SkeletonLoader;
