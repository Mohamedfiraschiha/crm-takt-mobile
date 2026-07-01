import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { createBankAccount, getBankAccount, updateBankAccount } from "../../api/finance";
import { getErrorMessage } from "../../api/errors";
import { colors, radii } from "../../theme/colors";
import GradientButton from "../../components/GradientButton";
import ScreenHeader from "../../components/ScreenHeader";

export default function BankAccountFormScreen({ route, navigation }) {
  const editingId = route.params?.id;
  const [name, setName] = useState("");
  const [bankName, setBankName] = useState("");
  const [iban, setIban] = useState("");
  const [initialBalance, setInitialBalance] = useState("0");
  const [isLoading, setIsLoading] = useState(!!editingId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editingId) return;
    (async () => {
      try {
        const account = await getBankAccount(editingId);
        setName(account.name || "");
        setBankName(account.bankName || "");
        setIban(account.iban || "");
        setInitialBalance(String(account.initialBalance ?? 0));
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    })();
  }, [editingId]);

  const handleSubmit = async () => {
    setError("");
    if (!name.trim() || !bankName.trim()) {
      setError("Le nom et la banque sont requis");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = { name: name.trim(), bankName: bankName.trim(), iban: iban.trim() };
      if (!editingId) payload.initialBalance = Number(initialBalance || 0);
      if (editingId) {
        await updateBankAccount(editingId, payload);
      } else {
        await createBankAccount(payload);
      }
      navigation.goBack();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Compte bancaire" onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title={editingId ? "Modifier le compte" : "Nouveau compte"}
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Nom du compte *</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholderTextColor={colors.textMuted} />
        <Text style={styles.label}>Banque *</Text>
        <TextInput style={styles.input} value={bankName} onChangeText={setBankName} placeholderTextColor={colors.textMuted} />
        <Text style={styles.label}>IBAN</Text>
        <TextInput style={styles.input} value={iban} onChangeText={setIban} placeholderTextColor={colors.textMuted} autoCapitalize="characters" />
        {!editingId && (
          <>
            <Text style={styles.label}>Solde initial (€)</Text>
            <TextInput
              style={styles.input}
              value={initialBalance}
              onChangeText={setInitialBalance}
              keyboardType="numeric"
              placeholderTextColor={colors.textMuted}
            />
          </>
        )}
        {!!error && <Text style={styles.error}>{error}</Text>}
        <GradientButton title={editingId ? "Enregistrer" : "Créer"} onPress={handleSubmit} loading={isSubmitting} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { padding: 16, paddingBottom: 40 },
  label: { fontSize: 13, fontFamily: "Manrope_700Bold", color: colors.textDark, marginBottom: 8, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.card,
    fontFamily: "Manrope_400Regular",
    color: colors.textDark,
    fontSize: 15,
  },
  error: { color: colors.error, fontFamily: "Manrope_600SemiBold", marginTop: 16, marginBottom: 8, textAlign: "center" },
});
