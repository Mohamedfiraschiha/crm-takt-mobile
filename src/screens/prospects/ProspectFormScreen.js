import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { createDeal, getDeal, updateDeal } from "../../api/deals";
import { getErrorMessage } from "../../api/errors";
import { colors, radii } from "../../theme/colors";
import GradientButton from "../../components/GradientButton";
import ScreenHeader from "../../components/ScreenHeader";

const PRIORITIES = ["Basse", "Moyenne", "Haute"];

export default function ProspectFormScreen({ route, navigation }) {
  const editingId = route.params?.id;
  const [form, setForm] = useState({
    title: "",
    company: "",
    amount: "",
    priority: "Moyenne",
    source: "",
    contactEmail: "",
    contactPhone: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(!!editingId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editingId) return;
    (async () => {
      try {
        const deal = await getDeal(editingId);
        setForm({
          title: deal.title || "",
          company: deal.company || "",
          amount: deal.amount != null ? String(deal.amount) : "",
          priority: deal.priority || "Moyenne",
          source: deal.source || "",
          contactEmail: deal.contactEmail || "",
          contactPhone: deal.contactPhone || "",
          description: deal.description || "",
        });
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    })();
  }, [editingId]);

  const setField = (field) => (value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setError("");
    if (!form.title.trim() || !form.company.trim() || !form.amount) {
      setError("Titre, entreprise et montant sont requis");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (editingId) {
        await updateDeal(editingId, payload);
      } else {
        await createDeal(payload);
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
        <ScreenHeader
          title={editingId ? "Modifier le deal" : "Nouveau deal"}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title={editingId ? "Modifier le deal" : "Nouveau deal"}
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.label}>Titre du deal *</Text>
      <TextInput
        style={styles.input}
        value={form.title}
        onChangeText={setField("title")}
        placeholder="Ex: Refonte site web"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Entreprise *</Text>
      <TextInput
        style={styles.input}
        value={form.company}
        onChangeText={setField("company")}
        placeholder="Nom de l'entreprise"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Montant (€) *</Text>
      <TextInput
        style={styles.input}
        value={form.amount}
        onChangeText={setField("amount")}
        placeholder="0"
        placeholderTextColor={colors.textMuted}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Priorité</Text>
      <View style={styles.chipsRow}>
        {PRIORITIES.map((priority) => (
          <TouchableOpacity
            key={priority}
            style={[styles.chip, form.priority === priority && styles.chipActive]}
            onPress={() => setField("priority")(priority)}
          >
            <Text style={[styles.chipText, form.priority === priority && styles.chipTextActive]}>
              {priority}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Source</Text>
      <TextInput
        style={styles.input}
        value={form.source}
        onChangeText={setField("source")}
        placeholder="Ex: Site web, référence..."
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Email contact</Text>
      <TextInput
        style={styles.input}
        value={form.contactEmail}
        onChangeText={setField("contactEmail")}
        placeholder="contact@entreprise.com"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Text style={styles.label}>Téléphone contact</Text>
      <TextInput
        style={styles.input}
        value={form.contactPhone}
        onChangeText={setField("contactPhone")}
        placeholder="+216 XX XXX XXX"
        placeholderTextColor={colors.textMuted}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.textArea}
        value={form.description}
        onChangeText={setField("description")}
        placeholder="Détails du besoin..."
        placeholderTextColor={colors.textMuted}
        multiline
      />

      {!!error && <Text style={styles.error}>{error}</Text>}

      <GradientButton
        title={editingId ? "Enregistrer" : "Créer le deal"}
        onPress={handleSubmit}
        loading={isSubmitting}
      />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { padding: 16, paddingBottom: 40 },
  label: {
    fontSize: 13,
    fontFamily: "Manrope_700Bold",
    color: colors.textDark,
    marginBottom: 8,
    marginTop: 12,
  },
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
    minHeight: 90,
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
  error: {
    color: colors.error,
    fontFamily: "Manrope_600SemiBold",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
});
