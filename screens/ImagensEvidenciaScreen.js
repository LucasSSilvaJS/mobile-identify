import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  Dimensions,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useImagensEvidencia } from '../hooks/useImagensEvidencia';
import { formatarData } from '../utils/dateUtils';

const { width } = Dimensions.get('window');

const ImagensEvidenciaScreen = ({ route, navigation }) => {
  const { evidenciaId, evidenciaNome } = route.params;
  const {
    imagens,
    loading,
    error,
    getImagensEvidencia,
    criarImagemEvidencia,
    excluirImagemEvidencia,
    limparErro,
  } = useImagensEvidencia();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Carregar imagens ao receber foco
  useFocusEffect(
    useCallback(() => {
      if (evidenciaId && !isInitialized) {
        carregarImagens();
        setIsInitialized(true);
      }
    }, [evidenciaId, isInitialized])
  );

  const carregarImagens = useCallback(async (forceRefresh = false) => {
    if (!evidenciaId) return;
    
    try {
      console.log('Carregando imagens para evidência:', evidenciaId, 'forceRefresh:', forceRefresh);
      await getImagensEvidencia(evidenciaId, forceRefresh);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erro ao carregar imagens:', error);
    }
  }, [evidenciaId, getImagensEvidencia]);

  const onRefresh = async () => {
    setRefreshing(true);
    setIsInitialized(false);
    await carregarImagens(true);
    setRefreshing(false);
  };

  const solicitarPermissaoCamera = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão Necessária',
        'É necessário permitir o acesso à galeria para adicionar imagens.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const selecionarImagem = async () => {
    const temPermissao = await solicitarPermissaoCamera();
    if (!temPermissao) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await adicionarImagem(result.assets[0]);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Erro ao selecionar imagem. Tente novamente.');
    }
  };

  const adicionarImagem = async (imageAsset) => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: imageAsset.uri,
        type: 'image/jpeg',
        name: 'imagem.jpg',
      });

      await criarImagemEvidencia(evidenciaId, formData);
      Alert.alert('Sucesso', 'Imagem adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar imagem:', error);
      Alert.alert('Erro', error.error || 'Erro ao adicionar imagem. Tente novamente.');
    }
  };

  const confirmarExclusao = (imagem) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta imagem? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => excluirImagem(imagem._id),
        },
      ]
    );
  };

  const excluirImagem = async (imagemId) => {
    try {
      await excluirImagemEvidencia(evidenciaId, imagemId);
      Alert.alert('Sucesso', 'Imagem excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir imagem:', error);
      Alert.alert('Erro', error.error || 'Erro ao excluir imagem. Tente novamente.');
    }
  };

  const abrirImagemModal = (imagem) => {
    setSelectedImage(imagem);
    setImageModalVisible(true);
  };

  const renderImagem = ({ item }) => (
    <View style={styles.imagemContainer}>
      <TouchableOpacity
        style={styles.imagemWrapper}
        onPress={() => abrirImagemModal(item)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: item.imagemUrl }}
          style={styles.imagem}
          resizeMode="cover"
        />
        <View style={styles.imagemOverlay}>
          <Ionicons name="eye" size={20} color="white" />
        </View>
      </TouchableOpacity>
      
      <View style={styles.imagemInfo}>
        <Text style={styles.imagemData}>
          Adicionada em: {formatarData(item.createdAt)}
        </Text>
        
        <View style={styles.imagemActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => abrirImagemModal(item)}
          >
            <Ionicons name="eye" size={16} color="#007AFF" />
            <Text style={styles.actionButtonText}>Visualizar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => confirmarExclusao(item)}
          >
            <Ionicons name="trash" size={16} color="#FF3B30" />
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
              Excluir
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="images-outline" size={64} color="#8E8E93" />
      <Text style={styles.emptyStateTitle}>Nenhuma imagem encontrada</Text>
      <Text style={styles.emptyStateSubtitle}>
        Adicione imagens para esta evidência para melhor documentação
      </Text>
      <TouchableOpacity style={styles.addButton} onPress={selecionarImagem}>
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>Adicionar Primeira Imagem</Text>
      </TouchableOpacity>
    </View>
  );

  const renderImageModal = () => (
    <Modal
      visible={imageModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setImageModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Visualizar Imagem</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setImageModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>
          
          {selectedImage && (
            <View style={styles.modalImageContainer}>
              <Image
                source={{ uri: selectedImage.imagemUrl }}
                style={styles.modalImage}
                resizeMode="contain"
              />
              <View style={styles.modalImageInfo}>
                <Text style={styles.modalImageData}>
                  Adicionada em: {formatarData(selectedImage.createdAt)}
                </Text>
                <Text style={styles.modalImageId}>
                  ID: {selectedImage._id}
                </Text>
              </View>
            </View>
          )}
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.deleteModalButton]}
              onPress={() => {
                setImageModalVisible(false);
                if (selectedImage) {
                  confirmarExclusao(selectedImage);
                }
              }}
            >
              <Ionicons name="trash" size={20} color="white" />
              <Text style={styles.modalButtonText}>Excluir Imagem</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Imagens da Evidência</Text>
          <Text style={styles.headerSubtitle}>{evidenciaNome}</Text>
        </View>
        
        <TouchableOpacity style={styles.addButton} onPress={selecionarImagem}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Status e última atualização */}
      {lastUpdate && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            Última atualização: {formatarData(lastUpdate)}
          </Text>
        </View>
      )}

      {/* Lista de imagens */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={24} color="#FF3B30" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => carregarImagens(true)}>
              <Text style={styles.retryButtonText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && imagens.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Carregando imagens...</Text>
          </View>
        ) : imagens.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.imagensGrid}>
            {imagens.map((imagem) => (
              <View key={imagem._id} style={styles.imagemItem}>
                {renderImagem({ item: imagem })}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modal de visualização */}
      {renderImageModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F2F2F7',
  },
  statusText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  imagensGrid: {
    gap: 16,
  },
  imagemItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imagemContainer: {
    flex: 1,
  },
  imagemWrapper: {
    position: 'relative',
  },
  imagem: {
    width: '100%',
    height: 200,
  },
  imagemOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 6,
  },
  imagemInfo: {
    padding: 16,
  },
  imagemData: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 12,
  },
  imagemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flex: 1,
    justifyContent: 'center',
  },
  viewButton: {
    backgroundColor: '#E3F2FD',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  deleteButtonText: {
    color: '#FF3B30',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 20,
    maxHeight: '90%',
    width: width - 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  closeButton: {
    padding: 4,
  },
  modalImageContainer: {
    flex: 1,
  },
  modalImage: {
    width: '100%',
    height: 300,
  },
  modalImageInfo: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  modalImageData: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  modalImageId: {
    fontSize: 12,
    color: '#C7C7CC',
  },
  modalActions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  deleteModalButton: {
    backgroundColor: '#FF3B30',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default ImagensEvidenciaScreen; 