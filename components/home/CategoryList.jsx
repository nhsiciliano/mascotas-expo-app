import React from 'react';
import { FlatList, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

// Categorías de mascotas
const CATEGORIES = [
  { id: '1', name: 'Todos', icon: 'paw' },
  { id: '2', name: 'Perros', icon: 'dog' },
  { id: '3', name: 'Gatos', icon: 'cat' },
  { id: '4', name: 'Aves', icon: 'dove' },
  { id: '5', name: 'Otros', icon: 'kiwi-bird' },
];

/**
 * Lista horizontal de categorías de mascotas
 */
const CategoryList = ({ selectedCategory, onSelectCategory }) => {
  /**
   * Renderiza un botón de categoría
   */
  const renderCategoryButton = ({ item }) => {
    const isSelected = selectedCategory === item.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.categoryButton,
          isSelected && styles.selectedCategoryButton
        ]}
        onPress={() => onSelectCategory(item.id)}
      >
        <FontAwesome5 
          name={item.icon} 
          size={16} 
          color={isSelected ? COLORS.white : COLORS.primary} 
        />
        <Text 
          style={[
            styles.categoryText,
            isSelected && styles.selectedCategoryText
          ]}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.categoriesContainer}>
      <FlatList
        data={CATEGORIES}
        keyExtractor={(item) => item.id}
        renderItem={renderCategoryButton}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  categoriesContainer: {
    marginBottom: 15,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
  },
  selectedCategoryButton: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: COLORS.white,
  },
});

export default CategoryList;
