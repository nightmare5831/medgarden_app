import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export const RightPanel: React.FC = () => {
  return (
    <View style={styles.rightPanel}>
      <TouchableOpacity
        style={styles.rightButton}
        onPress={() => router.push('/(tabs)/explore')}
      >
        <Image
          source={require('../../assets/forum.png')}
          style={styles.rightButtonImage}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.rightButton, styles.profileButtonContainer]}
        onPress={() => router.push('/(tabs)/profile')}
      >
        <View style={styles.profileButton}>
          <Image
            source={require('../../assets/profile.png')}
            style={styles.rightButtonImage}
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.rightButton}>
        <Image
          source={require('../../assets/post.png')}
          style={styles.rightButtonImage}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  rightPanel: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -120 }],
    zIndex: 10,
    gap: 16,
  },
  rightButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileButtonContainer: {
    backgroundColor: 'transparent',
  },
  profileButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightButtonImage: {
    width: 56,
    height: 56,
  },
});
