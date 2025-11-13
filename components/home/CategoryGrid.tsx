import React from 'react';
import { View, TouchableOpacity, Text, Image, StyleSheet } from 'react-native';

interface CategoryGridProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  selectedCategory,
  onCategorySelect,
}) => {
  return (
    <View style={styles.categoryGrid}>
      <TouchableOpacity
        style={[
          styles.categoryButton,
          selectedCategory === 'male' && styles.categoryButtonActive,
        ]}
        onPress={() => onCategorySelect('male')}
      >
        <Image
          source={require('../../assets/profesional.png')}
          style={styles.categoryImage}
          resizeMode="contain"
        />
        <Text
          style={[
            styles.categoryText,
            selectedCategory === 'male' && styles.categoryTextActive,
          ]}
        >
          Profissionais
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.categoryButton,
          selectedCategory === 'female' && styles.categoryButtonActive,
        ]}
        onPress={() => onCategorySelect('female')}
      >
        <Image
          source={require('../../assets/pacient.png')}
          style={styles.categoryImage}
          resizeMode="contain"
        />
        <Text
          style={[
            styles.categoryText,
            selectedCategory === 'female' && styles.categoryTextActive,
          ]}
        >
          Pacientes
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.categoryButton,
          selectedCategory === 'graduation' && styles.categoryButtonActive,
        ]}
        onPress={() => onCategorySelect('graduation')}
      >
        <Image
          source={require('../../assets/association.png')}
          style={styles.categoryImage}
          resizeMode="contain"
        />
        <Text
          style={[
            styles.categoryText,
            selectedCategory === 'graduation' && styles.categoryTextActive,
          ]}
        >
          Associações
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.categoryButton,
          selectedCategory === 'wedding' && styles.categoryButtonActive,
        ]}
        onPress={() => onCategorySelect('wedding')}
      >
        <Image
          source={require('../../assets/products.png')}
          style={styles.categoryImage}
          resizeMode="contain"
        />
        <Text
          style={[
            styles.categoryText,
            selectedCategory === 'wedding' && styles.categoryTextActive,
          ]}
        >
          Produtos
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryButton: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 100,
  },
  categoryButtonActive: {
    backgroundColor: '#6fee5f',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  categoryImage: {
    width: 56,
    height: 56,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  categoryTextActive: {
    color: '#000',
    fontWeight: '700',
  },
});
