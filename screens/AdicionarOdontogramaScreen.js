import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOdontogramas } from '../hooks/useOdontogramas';

export default function AdicionarOdontogramaScreen({ navigation, route }) {
  const [identificacao, setIdentificacao] = useState('');
  const [observacao, setObservacao] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showDropdown, setShowDropdown] = useState(false);
  
  const { vitimaId, vitima, onReturn } = route.params || {};
  const { criarOdontograma } = useOdontogramas();

  // Lista de identificações possíveis
  const identificacoesPossiveis = [
    18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
    48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38
  ];

  const validarFormulario = () => {
    const novosErros = {};

    if (!identificacao.trim()) {
      novosErros.identificacao = 'Identificação é obrigatória';
    } else if (!identificacoesPossiveis.includes(parseInt(identificacao))) {
      novosErros.identificacao = 'Identificação deve ser um número válido de dente';
    }

    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSalvar = async () => {
    if (!validarFormulario()) {
      return;
    }

    try {
      setLoading(true);

      const odontogramaData = {
        identificacao: parseInt(identificacao),
        observacao: observacao.trim() || undefined,
        idVitima: vitimaId
      };

      await criarOdontograma(odontogramaData);

      Alert.alert(
        'Sucesso',
        'Odontograma criado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => {
              if (onReturn) {
                onReturn();
              }
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao criar odontograma:', error);
      Alert.alert(
        'Erro',
        error.error || 'Erro ao criar odontograma. Tente novamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    if (identificacao.trim() || observacao.trim()) {
      Alert.alert(
        'Cancelar',
        'Tem certeza que deseja cancelar? As alterações serão perdidas.',
        [
          { text: 'Continuar editando', style: 'cancel' },
          { text: 'Cancelar', style: 'destructive', onPress: () => navigation.goBack() }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const handleSelecionarDente = (numero) => {
    setIdentificacao(numero.toString());
    setShowDropdown(false);
    setErrors(prev => ({ ...prev, identificacao: null }));
  };

  const getDenteLabel = (numero) => {
    if (numero >= 11 && numero <= 18) return `Superior Direito - ${numero}`;
    if (numero >= 21 && numero <= 28) return `Superior Esquerdo - ${numero}`;
    if (numero >= 31 && numero <= 38) return `Inferior Esquerdo - ${numero}`;
    if (numero >= 41 && numero <= 48) return `Inferior Direito - ${numero}`;
    return numero.toString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleCancelar}>
              <Ionicons name="arrow-back" size={24} color="#007AFF" />
              <Text style={styles.backButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Novo Odontograma</Text>
            
            <TouchableOpacity 
              style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
              onPress={handleSalvar}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color="white" />
                  <Text style={styles.saveButtonText}>Salvar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Informações da Vítima */}
          {vitima && (
            <View style={styles.vitimaCard}>
              <View style={styles.vitimaHeader}>
                <Ionicons name="person-outline" size={24} color="#8B5CF6" />
                <Text style={styles.vitimaTitle}>Vítima</Text>
              </View>
              <Text style={styles.vitimaName}>{vitima.nome || 'Vítima sem nome'}</Text>
              <Text style={styles.vitimaNic}>NIC: {vitima.nic}</Text>
            </View>
          )}

          {/* Formulário */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Informações do Odontograma</Text>

            {/* Identificação */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Identificação do Dente <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={[styles.dropdownButton, errors.identificacao && styles.inputError]}
                onPress={() => setShowDropdown(true)}
              >
                <Text style={[styles.dropdownButtonText, !identificacao && styles.placeholderText]}>
                  {identificacao ? getDenteLabel(parseInt(identificacao)) : 'Selecione o dente...'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
              {errors.identificacao && (
                <Text style={styles.errorText}>{errors.identificacao}</Text>
              )}
            </View>

            {/* Observação */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Observação</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={observacao}
                onChangeText={setObservacao}
                placeholder="Descreva as observações sobre o dente..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <Text style={styles.helpText}>
                Descreva detalhes sobre o estado, tratamento ou características do dente
              </Text>
            </View>
          </View>

          {/* Guia de Identificação com Imagem */}
          <View style={styles.guideCard}>
            <View style={styles.guideHeader}>
              <Ionicons name="information-circle-outline" size={24} color="#007AFF" />
              <Text style={styles.guideTitle}>Guia de Identificação</Text>
            </View>
            
            <Text style={styles.guideText}>
              Use a imagem abaixo para identificar o dente correto:
            </Text>
            
            <View style={styles.imageContainer}>
              <View style={styles.odontogramaPlaceholder}>
                <Ionicons name="medical-outline" size={64} color="#007AFF" />
                <Text style={styles.placeholderTitle}>Guia do Odontograma</Text>
                <Text style={styles.placeholderText}>
                  Use a nomenclatura internacional dos dentes:
                </Text>
                <View style={styles.teethGuide}>
                  <View style={styles.teethRow}>
                    <Text style={styles.teethLabel}>Superior Direito:</Text>
                    <Text style={styles.teethNumbers}>18, 17, 16, 15, 14, 13, 12, 11</Text>
                  </View>
                  <View style={styles.teethRow}>
                    <Text style={styles.teethLabel}>Superior Esquerdo:</Text>
                    <Text style={styles.teethNumbers}>21, 22, 23, 24, 25, 26, 27, 28</Text>
                  </View>
                  <View style={styles.teethRow}>
                    <Text style={styles.teethLabel}>Inferior Esquerdo:</Text>
                    <Text style={styles.teethNumbers}>31, 32, 33, 34, 35, 36, 37, 38</Text>
                  </View>
                  <View style={styles.teethRow}>
                    <Text style={styles.teethLabel}>Inferior Direito:</Text>
                    <Text style={styles.teethNumbers}>41, 42, 43, 44, 45, 46, 47, 48</Text>
                  </View>
                </View>
              </View>
            </View>
            
            <Text style={styles.guideSubtext}>
              A identificação segue a nomenclatura internacional dos dentes. Selecione o dente correto no dropdown acima.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal Dropdown */}
      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDropdown(false)}
        >
          <View style={styles.dropdownContainer}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Selecione o Dente</Text>
              <TouchableOpacity onPress={() => setShowDropdown(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.dropdownList}>
              {identificacoesPossiveis.map((numero) => (
                <TouchableOpacity
                  key={numero}
                  style={[
                    styles.dropdownItem,
                    identificacao === numero.toString() && styles.dropdownItemSelected
                  ]}
                  onPress={() => handleSelecionarDente(numero)}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    identificacao === numero.toString() && styles.dropdownItemTextSelected
                  ]}>
                    {getDenteLabel(numero)}
                  </Text>
                  {identificacao === numero.toString() && (
                    <Ionicons name="checkmark" size={20} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  vitimaCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  vitimaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  vitimaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  vitimaName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  vitimaNic: {
    fontSize: 14,
    color: '#666',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#FF3B30',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholderText: {
    color: '#999',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 4,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  guideCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  guideText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  odontogramaPlaceholder: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  teethGuide: {
    marginTop: 12,
  },
  teethRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  teethLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  teethNumbers: {
    fontSize: 14,
    color: '#666',
  },
  guideSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  dropdownList: {
    maxHeight: 400,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemSelected: {
    backgroundColor: '#f0f8ff',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownItemTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
}); 