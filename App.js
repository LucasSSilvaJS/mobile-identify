import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, Platform, StatusBar, ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Importar telas
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import CasosScreen from './screens/CasosScreen';
import RelatoriosScreen from './screens/RelatoriosScreen';
import CriarCasoScreen from './screens/CriarCasoScreen';
import DetalhesCasoScreen from './screens/DetalhesCasoScreen';
import DetalhesRelatorioScreen from './screens/DetalhesRelatorioScreen';
import EditarRelatorioScreen from './screens/EditarRelatorioScreen';
import AdicionarEvidenciaScreen from './screens/AdicionarEvidenciaScreen';
import EditarEvidenciaScreen from './screens/EditarEvidenciaScreen';
import AdicionarVitimaScreen from './screens/AdicionarVitimaScreen';
import EditarVitimaScreen from './screens/EditarVitimaScreen';
import AdicionarRelatorioScreen from './screens/AdicionarRelatorioScreen';
import DetalhesVitimaScreen from './screens/DetalhesVitimaScreen';
import AdicionarOdontogramaScreen from './screens/AdicionarOdontogramaScreen';
import EditarOdontogramaScreen from './screens/EditarOdontogramaScreen';
import ImagensEvidenciaScreen from './screens/ImagensEvidenciaScreen';
import DetalhesEvidenciaScreen from './screens/DetalhesEvidenciaScreen';

// Componente da Logo
import Svg, { Path } from 'react-native-svg';

const Logo = ({ width = 173, height = 47, color = "#123458" }) => (
  <Svg width={width} height={height} viewBox="0 0 173 47" fill="none">
    <Path 
      d="M55.632 35V14.392H60.784V35H55.632ZM64.0383 35V14.392H72.9663C75.0569 14.392 76.8169 14.744 78.2463 15.448C79.6756 16.1307 80.7636 17.24 81.5103 18.776C82.2569 20.2907 82.6303 22.3067 82.6303 24.824C82.6303 28.3653 81.8089 30.9467 80.1663 32.568C78.5449 34.1893 76.1449 35 72.9663 35H64.0383ZM69.1903 31.032H72.2623C73.3716 31.032 74.2996 30.872 75.0463 30.552C75.8143 30.2107 76.3903 29.592 76.7743 28.696C77.1796 27.8 77.3823 26.5093 77.3823 24.824C77.3823 23.1173 77.2009 21.8053 76.8383 20.888C76.4969 19.9493 75.9423 19.2987 75.1743 18.936C74.4276 18.552 73.4569 18.36 72.2623 18.36H69.1903V31.032ZM93.385 35.32C90.7397 35.32 88.617 34.6693 87.017 33.368C85.417 32.0453 84.617 30.0613 84.617 27.416C84.617 25.0053 85.2783 23.0853 86.601 21.656C87.9237 20.2267 89.9077 19.512 92.553 19.512C94.9637 19.512 96.8303 20.1307 98.153 21.368C99.4757 22.6053 100.137 24.2693 100.137 26.36V29.08H89.385C89.6197 30.0827 90.1637 30.7867 91.017 31.192C91.8917 31.576 93.0757 31.768 94.569 31.768C95.401 31.768 96.2437 31.6933 97.097 31.544C97.9717 31.3947 98.697 31.2027 99.273 30.968V34.328C98.5477 34.6693 97.6837 34.9147 96.681 35.064C95.6783 35.2347 94.5797 35.32 93.385 35.32ZM89.385 26.104H95.657V25.432C95.657 24.6853 95.433 24.0987 94.985 23.672C94.537 23.224 93.7797 23 92.713 23C91.4757 23 90.6117 23.256 90.121 23.768C89.6303 24.2587 89.385 25.0373 89.385 26.104ZM102.757 35V19.832H107.557L107.717 21.144C108.336 20.7173 109.114 20.344 110.053 20.024C110.992 19.6827 111.994 19.512 113.061 19.512C115.024 19.512 116.453 19.9813 117.349 20.92C118.245 21.8587 118.693 23.3093 118.693 25.272V35H113.541V25.688C113.541 24.8347 113.36 24.2267 112.997 23.864C112.634 23.5013 111.984 23.32 111.045 23.32C110.49 23.32 109.925 23.448 109.349 23.704C108.773 23.96 108.293 24.28 107.909 24.664V35H102.757ZM128.028 35.32C126.151 35.32 124.764 34.84 123.868 33.88C122.994 32.92 122.556 31.5973 122.556 29.912V23.736H120.508V19.832H122.556V16.664L127.708 15.288V19.832H131.388L131.164 23.736H127.708V29.56C127.708 30.2853 127.89 30.7973 128.252 31.096C128.615 31.3733 129.159 31.512 129.884 31.512C130.503 31.512 131.132 31.4053 131.772 31.192V34.68C130.77 35.1067 129.522 35.32 128.028 35.32ZM134.781 17.432V13.56H140.381V17.432H134.781ZM135.197 35V23.64H132.957L133.405 19.832H140.349V35H135.197ZM144.336 35V23.736H142.32V19.832H144.336V18.584C144.336 16.9413 144.805 15.5867 145.744 14.52C146.683 13.4533 148.08 12.92 149.936 12.92C150.704 12.92 151.387 12.984 151.984 13.112C152.581 13.2187 153.147 13.3787 153.68 13.592V17.048C153.36 16.9413 153.051 16.856 152.752 16.792C152.453 16.728 152.123 16.696 151.76 16.696C150.928 16.696 150.341 16.856 150 17.176C149.659 17.4747 149.488 17.976 149.488 18.68V19.832H153.232L153.008 23.736H149.488V35H144.336ZM158.55 40.632C157.782 40.632 157.121 40.5893 156.566 40.504C156.033 40.44 155.5 40.3013 154.966 40.088V36.504C155.329 36.632 155.66 36.7173 155.958 36.76C156.278 36.8027 156.598 36.824 156.918 36.824C157.793 36.824 158.444 36.664 158.87 36.344C159.318 36.0453 159.766 35.5013 160.214 34.712L153.398 19.832H158.806L162.806 29.464L166.742 19.832H172.118L166.326 33.752C165.75 35.1387 165.11 36.344 164.406 37.368C163.702 38.4133 162.881 39.2133 161.942 39.768C161.004 40.344 159.873 40.632 158.55 40.632Z" 
      fill={color}
    />
    <Path 
      d="M12.5722 44C10.1877 42.5816 5.05086 37.0702 3.57929 26.3716C2.10772 15.673 3.78368 9.08099 4.8056 7.12228C5.48689 5.23112 7.99402 1.85404 12.5722 3.47504C18.295 5.50128 19.1125 7.73015 21.7695 7.73015C24.8353 7.73015 26.4704 5.9064 29.7405 3.88012C32.8063 2.46157 37.2619 2.25931 39.551 7.12228C41.8401 11.9853 40.9136 21.9814 40.1642 26.3716C38.7335 32.8556 35.6677 42.3787 32.8063 43.7972" 
      stroke={color} 
      strokeWidth="5" 
      strokeLinecap="round"
    />
  </Svg>
);

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack Navigator para a tela Home
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="CriarCaso" component={CriarCasoScreen} />
      <Stack.Screen name="EditarCaso" component={CriarCasoScreen} />
      <Stack.Screen name="DetalhesCaso" component={DetalhesCasoScreen} />
      <Stack.Screen name="DetalhesRelatorio" component={DetalhesRelatorioScreen} />
      <Stack.Screen name="EditarRelatorio" component={EditarRelatorioScreen} />
      <Stack.Screen name="AdicionarEvidencia" component={AdicionarEvidenciaScreen} />
      <Stack.Screen name="EditarEvidencia" component={EditarEvidenciaScreen} />
      <Stack.Screen name="AdicionarVitima" component={AdicionarVitimaScreen} />
      <Stack.Screen name="EditarVitima" component={EditarVitimaScreen} />
      <Stack.Screen name="DetalhesVitima" component={DetalhesVitimaScreen} />
      <Stack.Screen name="AdicionarOdontograma" component={AdicionarOdontogramaScreen} />
      <Stack.Screen name="EditarOdontograma" component={EditarOdontogramaScreen} />
      <Stack.Screen name="AdicionarRelatorio" component={AdicionarRelatorioScreen} />
      <Stack.Screen name="ImagensEvidencia" component={ImagensEvidenciaScreen} />
      <Stack.Screen name="DetalhesEvidencia" component={DetalhesEvidenciaScreen} />
    </Stack.Navigator>
  );
}

// Stack Navigator para a tela Casos
function CasosStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CasosMain" component={CasosScreen} />
      <Stack.Screen name="CriarCaso" component={CriarCasoScreen} />
      <Stack.Screen name="EditarCaso" component={CriarCasoScreen} />
      <Stack.Screen name="DetalhesCaso" component={DetalhesCasoScreen} />
      <Stack.Screen name="DetalhesRelatorio" component={DetalhesRelatorioScreen} />
      <Stack.Screen name="EditarRelatorio" component={EditarRelatorioScreen} />
      <Stack.Screen name="AdicionarEvidencia" component={AdicionarEvidenciaScreen} />
      <Stack.Screen name="EditarEvidencia" component={EditarEvidenciaScreen} />
      <Stack.Screen name="AdicionarVitima" component={AdicionarVitimaScreen} />
      <Stack.Screen name="EditarVitima" component={EditarVitimaScreen} />
      <Stack.Screen name="DetalhesVitima" component={DetalhesVitimaScreen} />
      <Stack.Screen name="AdicionarOdontograma" component={AdicionarOdontogramaScreen} />
      <Stack.Screen name="EditarOdontograma" component={EditarOdontogramaScreen} />
      <Stack.Screen name="AdicionarRelatorio" component={AdicionarRelatorioScreen} />
      <Stack.Screen name="ImagensEvidencia" component={ImagensEvidenciaScreen} />
      <Stack.Screen name="DetalhesEvidencia" component={DetalhesEvidenciaScreen} />
    </Stack.Navigator>
  );
}

// Stack Navigator para a tela Relatórios
function RelatoriosStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RelatoriosMain" component={RelatoriosScreen} />
      <Stack.Screen name="DetalhesRelatorio" component={DetalhesRelatorioScreen} />
      <Stack.Screen name="EditarRelatorio" component={EditarRelatorioScreen} />
    </Stack.Navigator>
  );
}

// Componente principal da aplicação
function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa', justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <View style={{ alignItems: 'center' }}>
          <Logo width={200} height={54} color="#123458" />
          <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 30 }} />
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Dashboard') {
                iconName = focused ? 'analytics' : 'analytics-outline';
              } else if (route.name === 'Casos') {
                iconName = focused ? 'folder' : 'folder-outline';
              } else if (route.name === 'Relatorios') {
                iconName = focused ? 'bar-chart' : 'bar-chart-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#007AFF',
            tabBarInactiveTintColor: 'gray',
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#fff',
              borderTopWidth: 1,
              borderTopColor: '#eee',
              paddingBottom: Platform.OS === 'ios' ? 20 : 10,
              paddingTop: 10,
              height: Platform.OS === 'ios' ? 90 : 70,
              elevation: 8,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: -2,
              },
              shadowOpacity: 0.1,
              shadowRadius: 3.84,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
              marginBottom: Platform.OS === 'ios' ? 0 : 5,
            },
            tabBarIconStyle: {
              marginTop: 5,
            },
          })}
        >
          <Tab.Screen 
            name="Dashboard" 
            component={HomeStack}
            options={{ tabBarLabel: 'Dashboard' }}
          />
          <Tab.Screen 
            name="Casos" 
            component={CasosStack}
            options={{ tabBarLabel: 'Casos' }}
          />
          <Tab.Screen 
            name="Relatorios" 
            component={RelatoriosStack}
            options={{ tabBarLabel: 'Relatorios' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
