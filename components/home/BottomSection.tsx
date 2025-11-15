import React from 'react';
import { View, TouchableOpacity, Text, Image, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { User } from '../../services/api';

interface BottomSectionProps {
  selectedCategory: string | null;
  onCategoryClick: (categoryKey: string) => void;
  currentUser: User | null;
  getUserInitials: () => string;
  onPostarClick: () => void;
}

export const BottomSection: React.FC<BottomSectionProps> = ({
  selectedCategory,
  onCategoryClick,
  currentUser,
  getUserInitials,
  onPostarClick,
}) => {
  return (
    <View style={styles.bottomContent}>
      {/* LEFT COLUMN - 60% (2x2 Category Grid) */}
      <View style={styles.leftColumn}>
        {/* Row 1 */}
        <View style={styles.gridRow}>
          <TouchableOpacity
            style={[
              styles.gridCell,
              selectedCategory === 'profissionais' && styles.gridCellSelected
            ]}
            onPress={() => onCategoryClick('profissionais')}
          >
            <Image
              source={require('../../assets/category/profesional.png')}
              style={styles.categoryImage}
              resizeMode="contain"
            />
            <Text style={styles.gridLabel}>Profissionais</Text>
          </TouchableOpacity>

          <View style={styles.verticalDivider} />

          <TouchableOpacity
            style={[
              styles.gridCell,
              selectedCategory === 'pacientes' && styles.gridCellSelected
            ]}
            onPress={() => onCategoryClick('pacientes')}
          >
            <Image
              source={require('../../assets/category/pacient.png')}
              style={styles.categoryImage}
              resizeMode="contain"
            />
            <Text style={styles.gridLabel}>Pacientes</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.horizontalDivider} />

        {/* Row 2 */}
        <View style={styles.gridRow}>
          <TouchableOpacity
            style={[
              styles.gridCell,
              selectedCategory === 'associacoes' && styles.gridCellSelected
            ]}
            onPress={() => onCategoryClick('associacoes')}
          >
            <Image
              source={require('../../assets/category/association.png')}
              style={styles.categoryImage}
              resizeMode="contain"
            />
            <Text style={styles.gridLabel}>Associações</Text>
          </TouchableOpacity>

          <View style={styles.verticalDivider} />

          <TouchableOpacity
            style={[
              styles.gridCell,
              selectedCategory === 'produtos' && styles.gridCellSelected
            ]}
            onPress={() => onCategoryClick('produtos')}
          >
            <Image
              source={require('../../assets/category/products.png')}
              style={styles.categoryImage}
              resizeMode="contain"
            />
            <Text style={styles.gridLabel}>Produtos</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mainVerticalDivider} />

      {/* RIGHT COLUMN - 40% (Forum, Profile, Postar) */}
      <View style={styles.rightColumn}>
        {/* Top Row - Forum and Profile (Side by Side) */}
        <View style={styles.rightTopRow}>
          {/* Forum Button (Left) */}
          <TouchableOpacity
            style={styles.forumCell}
            onPress={() => router.push('/(tabs)/forum')}
          >
            <Image
              source={require('../../assets/forum.png')}
              style={styles.forumImage}
              resizeMode="contain"
            />
            <Text style={styles.forumLabel}>Forum</Text>
          </TouchableOpacity>

          <View style={styles.verticalDivider} />

          {/* Profile Button (Right) */}
          <TouchableOpacity
            style={styles.profileCell}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <View style={styles.profileButton}>
              <Text style={styles.profileAvatarText}>{getUserInitials()}</Text>
            </View>
            <Text style={styles.profileLabel}>{currentUser?.name?.split(' ')[0] || 'Perfil'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.horizontalDivider} />

        {/* Bottom Row - Postar Button */}
        <View style={styles.rightBottomSection}>
          <TouchableOpacity style={styles.postarButton} onPress={onPostarClick}>
            <View style={styles.postarIconCircle}>
              <Image
                source={require('../../assets/post.png')}
                style={styles.postarImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.postarLabel}>Postar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomContent: {
    flex: 1,
    flexDirection: 'row',
  },

  // LEFT COLUMN - 60% (2x2 Category Grid)
  leftColumn: {
    flex: 0.6,
    backgroundColor: '#fff',
  },
  gridRow: {
    flex: 1,
    flexDirection: 'row',
  },
  gridCell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  gridCellSelected: {
    backgroundColor: '#e0f2fe',
  },
  gridLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000',
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  categoryImage: {
    width: 56,
    height: 56,
  },

  // RIGHT COLUMN - 40% (Forum, Profile, Postar)
  rightColumn: {
    flex: 0.4,
    backgroundColor: '#fff',
  },
  mainVerticalDivider: {
    width: 2,
    backgroundColor: '#d1d5db',
  },

  // Right Top Row - Forum and Profile (Side by Side) - 1/3
  rightTopRow: {
    flex: 1,
    flexDirection: 'row',
  },
  forumCell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  forumLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  forumImage: {
    width: 56,
    height: 56,
  },
  profileCell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButton: {
    width: 60,
    height: 60,
    backgroundColor: '#3b82f6',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  profileAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },

  // Right Bottom Section - Postar Button - 2/3
  rightBottomSection: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  postarButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  postarIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postarLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  postarImage: {
    width: 56,
    height: 56,
  },

  // Dividers
  verticalDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
});
