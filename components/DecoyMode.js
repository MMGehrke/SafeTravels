/**
 * DecoyMode Component - "Plausible Deniability" Decoy Interface
 * 
 * This component appears after a duress PIN is entered.
 * It shows generic, non-controversial tourist information to satisfy
 * an attacker while the real data has already been wiped.
 * 
 * SECURITY:
 * - No connection to real Galois data
 * - Hardcoded generic content only
 * - No user accounts or sensitive information
 * - Appears as a legitimate travel information app
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const DecoyMode = () => {
  const [selectedCategory, setSelectedCategory] = useState('museums');

  // Hardcoded generic tourist information (non-controversial)
  const decoyData = {
    museums: {
      title: 'Museum Hours & Information',
      items: [
        {
          name: 'City History Museum',
          hours: 'Monday - Sunday: 9:00 AM - 5:00 PM',
          address: '123 Main Street',
          admission: 'Adults: $10, Students: $5',
        },
        {
          name: 'Art Gallery',
          hours: 'Tuesday - Sunday: 10:00 AM - 6:00 PM',
          address: '456 Art Avenue',
          admission: 'Free admission',
        },
        {
          name: 'Science Center',
          hours: 'Daily: 9:00 AM - 6:00 PM',
          address: '789 Science Boulevard',
          admission: 'Adults: $15, Children: $8',
        },
      ],
    },
    transportation: {
      title: 'Public Transportation',
      items: [
        {
          name: 'Bus Routes',
          info: 'Route 1: Downtown - Airport (Every 15 minutes)',
          schedule: 'First bus: 5:30 AM, Last bus: 11:30 PM',
        },
        {
          name: 'Subway Lines',
          info: 'Red Line: North-South, Blue Line: East-West',
          schedule: 'Operating hours: 5:00 AM - 1:00 AM',
        },
        {
          name: 'Taxi Services',
          info: 'Available 24/7, Call: +1-555-0123',
          schedule: 'Average wait time: 5-10 minutes',
        },
      ],
    },
    restaurants: {
      title: 'Popular Restaurants',
      items: [
        {
          name: 'Café Central',
          cuisine: 'International',
          hours: '7:00 AM - 10:00 PM',
          rating: '4.5 stars',
        },
        {
          name: 'Riverside Bistro',
          cuisine: 'Local Cuisine',
          hours: '11:00 AM - 9:00 PM',
          rating: '4.7 stars',
        },
        {
          name: 'Market Square Eatery',
          cuisine: 'Casual Dining',
          hours: '8:00 AM - 8:00 PM',
          rating: '4.3 stars',
        },
      ],
    },
    attractions: {
      title: 'Tourist Attractions',
      items: [
        {
          name: 'City Park',
          description: 'Beautiful park with walking trails and gardens',
          hours: 'Open daily: 6:00 AM - 10:00 PM',
        },
        {
          name: 'Historic District',
          description: 'Walking tour of historic buildings and architecture',
          hours: 'Guided tours: 10:00 AM, 2:00 PM, 4:00 PM',
        },
        {
          name: 'Waterfront Promenade',
          description: 'Scenic walkway along the river',
          hours: 'Open 24 hours',
        },
      ],
    },
  };

  const categories = [
    { id: 'museums', label: 'Museums', icon: '🏛️' },
    { id: 'transportation', label: 'Transport', icon: '🚌' },
    { id: 'restaurants', label: 'Dining', icon: '🍽️' },
    { id: 'attractions', label: 'Attractions', icon: '📍' },
  ];

  const currentData = decoyData[selectedCategory];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Travel Guide</Text>
        <Text style={styles.headerSubtitle}>Tourist Information</Text>
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryTab,
              selectedCategory === category.id && styles.categoryTabActive,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text
              style={[
                styles.categoryLabel,
                selectedCategory === category.id && styles.categoryLabelActive,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>{currentData.title}</Text>

        {currentData.items.map((item, index) => (
          <View key={index} style={styles.itemCard}>
            <Text style={styles.itemName}>{item.name}</Text>
            
            {item.hours && (
              <View style={styles.itemRow}>
                <Text style={styles.itemLabel}>Hours:</Text>
                <Text style={styles.itemValue}>{item.hours}</Text>
              </View>
            )}
            
            {item.address && (
              <View style={styles.itemRow}>
                <Text style={styles.itemLabel}>Address:</Text>
                <Text style={styles.itemValue}>{item.address}</Text>
              </View>
            )}
            
            {item.admission && (
              <View style={styles.itemRow}>
                <Text style={styles.itemLabel}>Admission:</Text>
                <Text style={styles.itemValue}>{item.admission}</Text>
              </View>
            )}
            
            {item.info && (
              <View style={styles.itemRow}>
                <Text style={styles.itemValue}>{item.info}</Text>
              </View>
            )}
            
            {item.schedule && (
              <View style={styles.itemRow}>
                <Text style={styles.itemLabel}>Schedule:</Text>
                <Text style={styles.itemValue}>{item.schedule}</Text>
              </View>
            )}
            
            {item.cuisine && (
              <View style={styles.itemRow}>
                <Text style={styles.itemLabel}>Cuisine:</Text>
                <Text style={styles.itemValue}>{item.cuisine}</Text>
              </View>
            )}
            
            {item.rating && (
              <View style={styles.itemRow}>
                <Text style={styles.itemLabel}>Rating:</Text>
                <Text style={styles.itemValue}>{item.rating}</Text>
              </View>
            )}
            
            {item.description && (
              <View style={styles.itemRow}>
                <Text style={styles.itemValue}>{item.description}</Text>
              </View>
            )}
          </View>
        ))}

        {/* Footer Note */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Information provided for general reference.
          </Text>
          <Text style={styles.footerText}>
            Please verify current hours and availability.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E0E0E0',
    marginTop: 4,
  },
  categoryContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  categoryContent: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  categoryTabActive: {
    backgroundColor: '#007AFF',
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  categoryLabelActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginRight: 8,
  },
  itemValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  footer: {
    marginTop: 20,
    marginBottom: 40,
    padding: 16,
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
});

export default DecoyMode;
