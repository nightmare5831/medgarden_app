import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Ionicons } from '@expo/vector-icons';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [role, setRole] = useState<'patient' | 'professional' | 'association' | 'store'>('patient');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  const { register, isAuthLoading } = useAppStore();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (!agreeToTerms) {
      Alert.alert('Erro', 'Você deve concordar com os Termos da MedGarden');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Erro', 'A senha deve ter no mínimo 8 caracteres');
      return;
    }

    try {
      // Send the role directly to backend (no mapping needed)
      await register(name, email, password, password, phone, role);
      Alert.alert(
        'Sucesso',
        'Conta criada com sucesso!',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
      );
    } catch (error: any) {
      Alert.alert('Erro no Registro', error.message || 'Não foi possível criar a conta');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cadastro de novo usuário</Text>
        </View>

        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.profileImageContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Image
                  source={require('../../assets/profile.png')}
                  style={styles.profileIconPlaceholder}
                  resizeMode="contain"
                />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.profileText}>Clique para adicionar foto de perfil</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome Completo*</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Digite seu nome completo"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                placeholderTextColor="#b3b3b3"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email*</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Digite seu e-mail"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                placeholderTextColor="#b3b3b3"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha*</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Digite uma senha de acesso"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                placeholderTextColor="#b3b3b3"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tipo de conta</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[styles.roleButton, styles.roleButtonSmall, role === 'patient' && styles.roleButtonActive]}
                onPress={() => setRole('patient')}
              >
                <Image
                  source={require('../../assets/category/pacient.png')}
                  style={styles.roleIconImage}
                  resizeMode="contain"
                />
                <Text style={[styles.roleButtonText, role === 'patient' && styles.roleButtonTextActive]}>
                  Paciente
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleButton, styles.roleButtonLarge, role === 'professional' && styles.roleButtonActive]}
                onPress={() => setRole('professional')}
              >
                <Image
                  source={require('../../assets/category/profesional.png')}
                  style={styles.roleIconImage}
                  resizeMode="contain"
                />
                <Text style={[styles.roleButtonText, role === 'professional' && styles.roleButtonTextActive]}>
                  Profissional
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleButton, styles.roleButtonLarge, role === 'association' && styles.roleButtonActive]}
                onPress={() => setRole('association')}
              >
                <Image
                  source={require('../../assets/category/association.png')}
                  style={styles.roleIconImage}
                  resizeMode="contain"
                />
                <Text style={[styles.roleButtonText, role === 'association' && styles.roleButtonTextActive]}>
                  Associação
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleButton, styles.roleButtonSmall, role === 'store' && styles.roleButtonActive]}
                onPress={() => setRole('store')}
              >
                <Image
                  source={require('../../assets/category/products.png')}
                  style={styles.roleIconImage}
                  resizeMode="contain"
                />
                <Text style={[styles.roleButtonText, role === 'store' && styles.roleButtonTextActive]}>
                  Lojista
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.termsContainer}
            onPress={() => setAgreeToTerms(!agreeToTerms)}
          >
            <View style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}>
              {agreeToTerms && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <View style={styles.termsTextContainer}>
              <Text style={styles.termsText}>
                Concordo com os <Text style={styles.termsLink}>Termos da MedGarden</Text>
              </Text>
              <Text style={styles.termsSubtext}>
                Leia com atenção a nossa política de privacidade e termos de uso.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, isAuthLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isAuthLoading}
          >
            {isAuthLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Viver essa experiência</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 44,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 44,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    color: '#000000',
    fontWeight: '400',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#d1d5db',
    marginBottom: 12,
  },
  profilePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIconPlaceholder: {
    width: 50,
    height: 50,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileText: {
    fontSize: 16,
    color: '#6b7280',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    padding: 0,
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  roleButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 60,
  },
  roleButtonSmall: {
    flex: 0.8,
  },
  roleButtonLarge: {
    flex: 1.2,
  },
  roleButtonActive: {
    borderColor: '#6FFF25',
    backgroundColor: '#E5FFD6',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginTop: 8,
    textAlign: 'center',
  },
  roleButtonTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  roleIcon: {
    width: '100%',
    height: '100%',
  },
  roleIconImage: {
    width: 40,
    height: 40,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  checkboxChecked: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 4,
  },
  termsLink: {
    fontWeight: '600',
    color: '#000000',
  },
  termsSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  button: {
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    borderRadius: 28,
    marginTop: 0,
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
