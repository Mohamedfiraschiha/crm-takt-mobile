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
import { createClient, getClient, updateClient } from "../../api/clients";
import { getErrorMessage } from "../../api/errors";
import { colors, radii } from "../../theme/colors";
import GradientButton from "../../components/GradientButton";
import ScreenHeader from "../../components/ScreenHeader";

const STATUSES = ["Prospect", "Actif", "Inactif"];

export default function ClientFormScreen({ route, navigation }) {
  const editingId = route.params?.id;
  const [form, setForm] = useState({
    entreprise: "",
    email: "",
    telephone: "",
    localite: "",
    statut: "Prospect",
    secteurActivite: "",
    ca: "",
    notes: "",
  });
  const [isLoading, setIsLoading] = useState(!!editingId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editingId) return;
    (async () => {
      try {
        const client = await getClient(editingId);
        setForm({
          entreprise: client.entreprise || "",
          email: client.email || "",
          telephone: client.telephone || "",
          localite: client.localite || "",
          statut: client.statut || "Prospect",
          secteurActivite: client.secteurActivite || "",
          ca: client.ca != null ? String(client.ca) : "",
          notes: client.notes || "",
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
    if (!form.entreprise.trim() || !form.email.trim() || !form.telephone.trim() || !form.localite.trim()) {
      setError("Entreprise, email, téléphone et localité sont requis");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        ca: form.ca ? Number(form.ca) : 0,
      };
      if (editingId) {
        await updateClient(editingId, payload);
      } else {
        await createClient(payload);
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
          title={editingId ? "Modifier le client" : "Nouveau client"}
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
        title={editingId ? "Modifier le client" : "Nouveau client"}
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.label}>Entreprise *</Text>
      <TextInput
        style={styles.input}
        value={form.entreprise}
        onChangeText={setField("entreprise")}
        placeholder="Nom de l'entreprise"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Email *</Text>
      <TextInput
        style={styles.input}
        value={form.email}
        onChangeText={setField("email")}
        placeholder="contact@entreprise.com"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Text style={styles.label}>Téléphone *</Text>
      <TextInput
        style={styles.input}
        value={form.telephone}
        onChangeText={setField("telephone")}
        placeholder="+216 XX XXX XXX"
        placeholderTextColor={colors.textMuted}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Localité *</Text>
      <TextInput
        style={styles.input}
        value={form.localite}
        onChangeText={setField("localite")}
        placeholder="Ville"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Statut</Text>
      <View style={styles.chipsRow}>
        {STATUSES.map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.chip, form.statut === status && styles.chipActive]}
            onPress={() => setField("statut")(status)}
          >
            <Text style={[styles.chipText, form.statut === status && styles.chipTextActive]}>
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Secteur d'activité</Text>
      <TextInput
        style={styles.input}
        value={form.secteurActivite}
        onChangeText={setField("secteurActivite")}
        placeholder="Ex: E-commerce"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Chiffre d'affaires (€)</Text>
      <TextInput
        style={styles.input}
        value={form.ca}
        onChangeText={setField("ca")}
        placeholder="0"
        placeholderTextColor={colors.textMuted}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={styles.textArea}
        value={form.notes}
        onChangeText={setField("notes")}
        placeholder="Notes internes"
        placeholderTextColor={colors.textMuted}
        multiline
      />

      {!!error && <Text style={styles.error}>{error}</Text>}

      <GradientButton
        title={editingId ? "Enregistrer" : "Créer le client"}
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
