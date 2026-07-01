import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { createTresorerieEntry, getTresorerieEntry, updateTresorerieEntry } from "../../api/finance";
import { getErrorMessage } from "../../api/errors";
import { colors, radii } from "../../theme/colors";
import GradientButton from "../../components/GradientButton";
import ScreenHeader from "../../components/ScreenHeader";

const TYPES = ["Entrée", "Sortie", "Ajustement"];

export default function TresorerieFormScreen({ route, navigation }) {
  const editingId = route.params?.id;
  const [type, setType] = useState("Entrée");
  const [montant, setMontant] = useState("");
  const [categorie, setCategorie] = useState("Caisse");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(!!editingId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editingId) return;
    (async () => {
      try {
        const entry = await getTresorerieEntry(editingId);
        setType(entry.type || "Entrée");
        setMontant(String(entry.montant ?? ""));
        setCategorie(entry.categorie || "Caisse");
        setDescription(entry.description || "");
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    })();
  }, [editingId]);

  const handleSubmit = async () => {
    setError("");
    if (!montant) {
      setError("Le montant est requis");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = { type, montant: Number(montant), categorie: categorie.trim(), description: description.trim() };
      if (editingId) {
        await updateTresorerieEntry(editingId, payload);
      } else {
        await createTresorerieEntry(payload);
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
        <ScreenHeader title="Trésorerie" onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title={editingId ? "Modifier l'entrée" : "Nouvelle entrée"}
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Type</Text>
        <View style={styles.chipsRow}>
          {TYPES.map((t) => (
            <TouchableOpacity key={t} style={[styles.chip, type === t && styles.chipActive]} onPress={() => setType(t)}>
              <Text style={[styles.chipText, type === t && styles.chipTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Montant (€) *</Text>
        <TextInput style={styles.input} value={montant} onChangeText={setMontant} keyboardType="numeric" placeholderTextColor={colors.textMuted} />

        <Text style={styles.label}>Catégorie</Text>
        <TextInput style={styles.input} value={categorie} onChangeText={setCategorie} placeholderTextColor={colors.textMuted} />

        <Text style={styles.label}>Description</Text>
        <TextInput style={styles.textArea} value={description} onChangeText={setDescription} multiline placeholderTextColor={colors.textMuted} />

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
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.card,
    fontFamily: "Manrope_400Regular",
    color: colors.textDark,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: "top",
  },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.card,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: "Manrope_600SemiBold", color: colors.textDark, fontSize: 13 },
  chipTextActive: { color: "#fff" },
  error: { color: colors.error, fontFamily: "Manrope_600SemiBold", marginTop: 16, marginBottom: 8, textAlign: "center" },
});
