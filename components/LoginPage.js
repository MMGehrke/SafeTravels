import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { checkServerHealth, API_BASE_URL } from '../services/api';

const { width, height } = Dimensions.get('window');

const LoginPage = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState({
    checking: true,
    connected: false,
    message: 'Checking server connection...',
  });

  // Check server health on component mount
  useEffect(() => {
    const checkHealth = async () => {
      setServerStatus({
        checking: true,
        connected: false,
        message: 'Checking server connection...',
      });

      const result = await checkServerHealth();

      if (result.success) {
        setServerStatus({
          checking: false,
          connected: true,
          message: `Server connected (${result.data.environment || 'unknown'})`,
        });
      } else {
        setServerStatus({
          checking: false,
          connected: false,
          message: `Server offline: ${result.error}`,
        });
      }
    };

    checkHealth();
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setIsLoading(true);
    
    // Simulate login delay
    setTimeout(() => {
      setIsLoading(false);
      navigation.replace('Home');
    }, 1500);
  };

  return (
    <View style={styles.container}>
      {/* Rainbow Gradient Title */}
      <View style={styles.titleContainer}>
        <LinearGradient
          colors={['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientText}
        >
          <Text style={styles.titleText}>Safe Travels</Text>
        </LinearGradient>
      </View>

      {/* Login Form */}
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#999"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Server Status Indicator */}
      <View style={styles.serverStatusContainer}>
        <View
          style={[
            styles.serverStatusIndicator,
            serverStatus.connected
              ? styles.serverStatusConnected
              : styles.serverStatusDisconnected,
          ]}
        />
        <View style={styles.serverStatusTextContainer}>
          {serverStatus.checking && (
            <ActivityIndicator size="small" color="#666" style={{ marginRight: 5 }} />
          )}
          <Text
            style={[
              styles.serverStatusText,
              serverStatus.connected
                ? styles.serverStatusTextConnected
                : styles.serverStatusTextDisconnected,
            ]}
          >
            {serverStatus.message}
          </Text>
        </View>
        {__DEV__ && (
          <Text style={styles.serverStatusUrl}>{API_BASE_URL}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  titleContainer: {
    marginBottom: 60,
  },
  gradientText: {
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  titleText: {
    fontSize: 48,
    fontFamily: 'DancingScript-Bold',
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  formContainer: {
    width: '100%',
    maxWidth: 300,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 20,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  loginButtonDisabled: {
    backgroundColor: '#ccc',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  serverStatusContainer: {
    marginTop: 30,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  serverStatusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  serverStatusConnected: {
    backgroundColor: '#4CAF50',
  },
  serverStatusDisconnected: {
    backgroundColor: '#F44336',
  },
  serverStatusTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serverStatusText: {
    fontSize: 12,
    textAlign: 'center',
  },
  serverStatusTextConnected: {
    color: '#4CAF50',
  },
  serverStatusTextDisconnected: {
    color: '#F44336',
  },
  serverStatusUrl: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    fontFamily: 'monospace',
  },
});

export default LoginPage; 