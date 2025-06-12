import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function NotificationBanner({ 
  visible, 
  message, 
  type = 'success', // 'success', 'error', 'info'
  onClose,
  autoHide = true,
  duration = 3000 
}) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Mostrar banner
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide se configurado
      if (autoHide) {
        const timer = setTimeout(() => {
          hideBanner();
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      hideBanner();
    }
  }, [visible]);

  const hideBanner = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onClose) {
        onClose();
      }
    });
  };

  const getBannerStyle = () => {
    switch (type) {
      case 'success':
        return { backgroundColor: '#10B981', icon: 'checkmark-circle' };
      case 'error':
        return { backgroundColor: '#EF4444', icon: 'alert-circle' };
      case 'info':
        return { backgroundColor: '#3B82F6', icon: 'information-circle' };
      default:
        return { backgroundColor: '#10B981', icon: 'checkmark-circle' };
    }
  };

  const bannerStyle = getBannerStyle();

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          backgroundColor: bannerStyle.backgroundColor,
        },
      ]}
    >
      <View style={styles.content}>
        <Ionicons name={bannerStyle.icon} size={24} color="white" />
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity style={styles.closeButton} onPress={hideBanner}>
          <Ionicons name="close" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: 50, // Para status bar
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  message: {
    flex: 1,
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    marginLeft: 12,
  },
  closeButton: {
    padding: 4,
  },
}); 