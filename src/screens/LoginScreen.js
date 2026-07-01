import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { verifyTwoFactorLogin } from "../api/auth";
import { getErrorMessage } from "../api/errors";
import { API_URL } from "../api/config";
import { colors, radii } from "../theme/colors";
import Logo from "../components/Logo";
import GradientButton from "../components/GradientButton";

export default function LoginScreen() {
  const { signin, completeLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pendingUserId, setPendingUserId] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignin = async () => {
    setError("");
    setIsSubmitting(true);
    try {
      const result = await signin(email.trim(), password);
      if (result.requiresTwoFactor) {
        setPendingUserId(result.userId);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyTwoFactor = async () => {
    setError("");
    setIsSubmitting(true);
    try {
      const result = await verifyTwoFactorLogin(pendingUserId, code.trim());
      await completeLogin(result.data.user, result.data.token);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pendingUserId) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Logo size={64} />
        <Text style={styles.title}>Vérification 2FA</Text>
        <Text style={styles.subtitle}>
          Saisissez le code à 6 chiffres de votre application
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Code 2FA"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          maxLength={6}
          value={code}
          onChangeText={setCode}
        />
        {!!error && <Text style={styles.error}>{error}</Text>}
        <GradientButton
          title="Vérifier"
          onPress={handleVerifyTwoFactor}
          loading={isSubmitting}
        />
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Logo size={72} />
      <Text style={styles.title}>Nexia Digital</Text>
      <Text style={styles.subtitle}>Connectez-vous à votre compte CRM</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        placeholderTextColor={colors.textMuted}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {!!error && (
        <View>
          <Text style={styles.error}>{error}</Text>
          <Text style={styles.debug}>API: {API_URL}</Text>
        </View>
      )}
      <GradientButton
        title="Se connecter"
        onPress={handleSignin}
        loading={isSubmitting}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 28,
    fontFamily: "BarlowCondensed_700Bold",
    textAlign: "center",
    color: colors.textDark,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Manrope_400Regular",
    textAlign: "center",
    color: colors.textMuted,
    marginTop: 6,
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: "Manrope_400Regular",
    color: colors.textDark,
    backgroundColor: colors.card,
    marginBottom: 14,
  },
  error: {
    color: colors.error,
    fontFamily: "Manrope_600SemiBold",
    marginBottom: 4,
    textAlign: "center",
  },
  debug: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: "Manrope_400Regular",
    marginBottom: 12,
    textAlign: "center",
  },
});
