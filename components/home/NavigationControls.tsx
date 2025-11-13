import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NavigationControlsProps {
  showDetail: boolean;
  onDetailToggle: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  showDetail,
  onDetailToggle,
  onPrevious,
  onNext,
}) => {
  return (
    <View style={styles.navigationControls}>
      <TouchableOpacity style={styles.navButton} onPress={onDetailToggle}>
        <Ionicons
          name={showDetail ? "close" : "ellipsis-horizontal"}
          size={24}
          color="#000"
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={onPrevious}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={onNext}>
        <Ionicons name="arrow-forward" size={24} color="#000" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navigationControls: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    zIndex: 10,
    gap: 16,
  },
  navButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
