/**
 * CamouflageSettings Component
 * 
 * Settings screen for changing the app icon (camouflage feature).
 * Only visible in the unlocked secure mode (MainApp).
 * 
 * SECURITY: This allows users to change the app icon to blend in
 * with other apps (Calculator, Notes, Weather) for additional
 * plausible deniability.
 * 
 * PLATFORM LIMITATIONS:
 * - Android: Can change icon programmatically (requires native module)
 * - iOS: Requires user interaction and shows system alert (Apple limitation)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import {
  changeAppIcon,
  getCurrentAppIcon,
  getAvailableIcons,
  isDynamicIconSupported,
} from '../utils/dynamicAppIcon';

const CamouflageSettings = ({ navigation }) => {
  const [currentIcon, setCurrentIcon] = useState('default');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCurrentIcon();
  }, []);

  const loadCurrentIcon = async () => {
    try {
      const icon = await getCurrentAppIcon();
      setCurrentIcon(icon);
    } catch (error) {
      console.error('Error loading current icon:', error);
    }
  };

  const handleIconChange = async (iconName) => {
    if (iconName === currentIcon) {
      return; // Already selected
    }

    setLoading(true);
    try {
      const success = await changeAppIcon(iconName);
      
      if (success) {
        setCurrentIcon(iconName);
        Alert.alert(
          'Icon Changed',
          `App icon changed to ${iconName}. You may need to restart the app to see the change.`,
          [{ text: 'OK' }]
        );
      } else {
        if (Platform.OS === 'ios') {
          Alert.alert(
            'iOS Limitation',
            'On iOS, changing the app icon requires using the system settings. This is a security feature by Apple.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Change Failed',
            'Unable to change app icon. Please ensure the native module is properly configured.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Error changing icon:', error);
      Alert.alert('Error', 'Failed to change app icon.', [{ text: 'OK' }]);
    } finally {
      setLoading(false);
    }
  };

  const iconOptions = [
    {
      name: 'default',
      label: 'Galois',
      icon: '🌈',
      description: 'Default Galois icon',
    },
    {
      name: 'calculator',
      label: 'Calculator',
      icon: '🔢',
      description: 'Disguise as calculator app',
    },
    {
      name: 'notes',
      label: 'Notes',
      icon: '📝',
      description: 'Disguise as notes app',
    },
    {
      name: 'weather',
      label: 'Weather',
      icon: '☁️',
      description: 'Disguise as weather app',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Camouflage Settings</Text>
        <Text style={styles.subtitle}>
          Change the app icon to blend in with other apps
        </Text>
      </View>

      {!isDynamicIconSupported() && Platform.OS === 'ios' && (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            ⚠️ iOS Limitation: Changing app icons on iOS requires user interaction
            and shows a system alert. This is a security feature by Apple.
          </Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Icons</Text>
        
        {iconOptions.map((option) => (
          <TouchableOpacity
            key={option.name}
            style={[
              styles.iconOption,
              currentIcon === option.name && styles.iconOptionSelected,
            ]}
            onPress={() => handleIconChange(option.name)}
            disabled={loading}
            activeOpacity={0.7}
          >
            <View style={styles.iconOptionContent}>
              <Text style={styles.iconEmoji}>{option.icon}</Text>
              <View style={styles.iconOptionText}>
                <Text style={styles.iconOptionLabel}>{option.label}</Text>
                <Text style={styles.iconOptionDescription}>
                  {option.description}
                </Text>
              </View>
            </View>
            {currentIcon === option.name && (
              <Text style={styles.selectedBadge}>✓ Selected</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Security Note</Text>
        <Text style={styles.infoText}>
          Changing the app icon provides an additional layer of plausible
          deniability. The app will appear as the selected icon on your home screen.
        </Text>
        <Text style={styles.infoText}>
          Note: On Android, the icon change is immediate. On iOS, you may need
          to use system settings due to platform limitations.
        </Text>
      </View>
    </ScrollView>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E0E0',
    marginTop: 4,
  },
  warningBox: {
    backgroundColor: '#FFF3CD',
    margin: 20,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFC107',
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  iconOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconOptionSelected: {
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  iconOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  iconOptionText: {
    flex: 1,
  },
  iconOptionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  iconOptionDescription: {
    fontSize: 14,
    color: '#666',
  },
  selectedBadge: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 12,
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    margin: 20,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1565C0',
    lineHeight: 20,
    marginBottom: 8,
  },
});

export default CamouflageSettings;
