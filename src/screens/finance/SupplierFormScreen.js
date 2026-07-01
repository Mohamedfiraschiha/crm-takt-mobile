import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { createSupplier, getSupplier, updateSupplier } from "../../api/finance";
import { getErrorMessage } from "../../api/errors";
import { colors, radii } from "../../theme/colors";
import GradientButton from "../../components/GradientButton";
import ScreenHeader from "../../components/ScreenHeader";

export default function SupplierFormScreen({ route, navigation }) {
  const editingId = route.params?.id;
  const [name, setName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("30 jours");
  const [isLoading, setIsLoading] = useState(!!editingId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editingId) return;
    (async () => {
      try {
        const supplier = await getSupplier(editingId);
        setName(supplier.name || "");
        setContactPerson(supplier.contactPerson || "");
        setEmail(supplier.email || "");
        setPhone(supplier.phone || "");
        setPaymentTerms(supplier.paymentTerms || "30 jours");
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    })();
  }, [editingId]);

  const handleSubmit = async () => {
    setError("");
    if (!name.trim()) {
      setError("Le nom du fournisseur est requis");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        contactPerson: contactPerson.trim(),
        email: email.trim(),
        phone: phone.trim(),
        paymentTerms: paymentTerms.trim(),
      };
      if (editingId) {
        await updateSupplier(editingId, payload);
      } else {
        await createSupplier(payload);
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
        <ScreenHeader title="Fournisseur" onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title={editingId ? "Modifier le fournisseur" : "Nouveau fournisseur"}
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Nom *</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholderTextColor={colors.textMuted} />
        <Text style={styles.label}>Contact</Text>
        <TextInput style={styles.input} value={contactPerson} onChangeText={setContactPerson} placeholderTextColor={colors.textMuted} />
        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholderTextColor={colors.textMuted} />
        <Text style={styles.label}>Téléphone</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor={colors.textMuted} />
        <Text style={styles.label}>Conditions de paiement</Text>
        <TextInput style={styles.input} value={paymentTerms} onChangeText={setPaymentTerms} placeholderTextColor={colors.textMuted} />
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
