import { useRouter } from 'expo-router'
import { useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import Toast from 'react-native-toast-message'
import { authService } from '../../services/authService'
import * as haptics from '../../utils/haptics'

const COLORS = {
  primary: '#FF5722',
  primaryDark: '#E64A19',
  background: '#FAFAFA',
  card: '#FFFFFF',
  text: '#1A1A1A',
  secondary: '#666666',
  muted: '#999999',
  border: '#F0F0F0',
  error: '#F44336',
  success: '#4CAF50',
  warning: '#FF9800',
}

// Password strength requirements
const PASSWORD_REQUIREMENTS = [
  { label: 'At least 8 characters', test: (pwd) => pwd.length >= 8 },
  { label: 'Contains uppercase letter', test: (pwd) => /[A-Z]/.test(pwd) },
  { label: 'Contains lowercase letter', test: (pwd) => /[a-z]/.test(pwd) },
  { label: 'Contains number', test: (pwd) => /[0-9]/.test(pwd) },
  { label: 'Contains special character', test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
]

export default function RegisterScreen() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const getPasswordStrength = (pwd) => {
    return PASSWORD_REQUIREMENTS.filter(req => req.test(pwd)).length
  }

  const getStrengthColor = () => {
    const strength = getPasswordStrength(password)
    if (strength <= 2) return COLORS.error
    if (strength <= 3) return COLORS.warning
    return COLORS.success
  }

  const getStrengthLabel = () => {
    const strength = getPasswordStrength(password)
    if (strength <= 2) return 'Weak'
    if (strength <= 3) return 'Medium'
    if (strength <= 4) return 'Strong'
    return 'Very Strong'
  }

  const validateForm = () => {
    const newErrors = {}

    // Username validation
    if (!username.trim()) {
      newErrors.username = 'Username is required'
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    } else if (username.length > 30) {
      newErrors.username = 'Username must be less than 30 characters'
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores'
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email'
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (getPasswordStrength(password) < 3) {
      newErrors.password = 'Password is too weak'
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRegister = async () => {
    if (!validateForm()) {
      haptics.error()
      return
    }

    setLoading(true)
    try {
      await authService.signUp(email, password)
      haptics.success()
      Toast.show({
        type: 'success',
        text1: 'Account created!',
        text2: 'Please check your email to verify your account.',
      })
      router.replace('/(auth)/login')
    } catch (error) {
      haptics.error()
      let errorMessage = 'Registration failed. Please try again.'
      
      if (error.message) {
        if (error.message.includes('User already registered')) {
          errorMessage = 'An account with this email already exists'
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Please enter a valid email address'
        } else if (error.message.includes('Weak password')) {
          errorMessage = 'Please choose a stronger password'
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many attempts. Please try again later.'
        } else {
          errorMessage = error.message
        }
      }

      Toast.show({
        type: 'error',
        text1: 'Registration failed',
        text2: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🔥</Text>
          <Text style={styles.title}>Join Slow Burn</Text>
          <Text style={styles.subtitle}>Create your account to start your journey</Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          {/* Username Field */}
          <View style={styles.field}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={[styles.input, errors.username && styles.inputError]}
              placeholder="Choose a username"
              placeholderTextColor={COLORS.muted}
              value={username}
              onChangeText={(text) => {
                setUsername(text)
                if (errors.username) setErrors({ ...errors, username: '' })
              }}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            {errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null}
          </View>

          {/* Email Field */}
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="you@example.com"
              placeholderTextColor={COLORS.muted}
              value={email}
              onChangeText={(text) => {
                setEmail(text)
                if (errors.email) setErrors({ ...errors, email: '' })
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          {/* Password Field */}
          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, errors.password && styles.inputError]}
                placeholder="Create a strong password"
                placeholderTextColor={COLORS.muted}
                value={password}
                onChangeText={(text) => {
                  setPassword(text)
                  if (errors.password) setErrors({ ...errors, password: '' })
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                disabled={loading}
              >
                <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
              </Pressable>
            </View>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

            {/* Password Strength Indicator */}
            {password.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBar}>
                  <View
                    style={[
                      styles.strengthFill,
                      {
                        width: `${(getPasswordStrength(password) / PASSWORD_REQUIREMENTS.length) * 100}%`,
                        backgroundColor: getStrengthColor(),
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.strengthText, { color: getStrengthColor() }]}>
                  {getStrengthLabel()}
                </Text>
              </View>
            )}

            {/* Password Requirements */}
            <View style={styles.requirements}>
              {PASSWORD_REQUIREMENTS.map((req, index) => (
                <View key={index} style={styles.requirementItem}>
                  <Text
                    style={[
                      styles.requirementDot,
                      { color: req.test(password) ? COLORS.success : COLORS.muted },
                    ]}
                  >
                    {req.test(password) ? '●' : '○'}
                  </Text>
                  <Text
                    style={[
                      styles.requirementText,
                      { color: req.test(password) ? COLORS.success : COLORS.muted },
                    ]}
                  >
                    {req.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Confirm Password Field */}
          <View style={styles.field}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, errors.confirmPassword && styles.inputError]}
                placeholder="Confirm your password"
                placeholderTextColor={COLORS.muted}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text)
                  if (errors.confirmPassword)
                    setErrors({ ...errors, confirmPassword: '' })
                }}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              <Pressable
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
                disabled={loading}
              >
                <Text style={styles.eyeText}>
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </Text>
              </Pressable>
            </View>
            {errors.confirmPassword ? (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            ) : null}
          </View>

          {/* Register Button */}
          <Pressable
            onPress={handleRegister}
            style={[styles.button, loading && styles.buttonDisabled]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </Pressable>
        </View>

        {/* Login Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Pressable onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.footerLink}>Sign in</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.secondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FAFAFA',
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
    fontSize: 15,
    color: COLORS.text,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    backgroundColor: '#FAFAFA',
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
    paddingRight: 72,
    fontSize: 15,
    color: COLORS.text,
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    top: 0,
    height: 52,
    justifyContent: 'center',
  },
  eyeText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 6,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginRight: 12,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
    width: 70,
    textAlign: 'right',
  },
  requirements: {
    marginTop: 4,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requirementDot: {
    fontSize: 12,
    marginRight: 8,
    fontWeight: '600',
  },
  requirementText: {
    fontSize: 12,
    color: COLORS.muted,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: COLORS.secondary,
    fontSize: 14,
  },
  footerLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
})