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
import { getClients } from "../../api/clients";
import { createProject, getProject, updateProject } from "../../api/projects";
import { getErrorMessage } from "../../api/errors";
import { colors, radii } from "../../theme/colors";
import GradientButton from "../../components/GradientButton";
import ScreenHeader from "../../components/ScreenHeader";

export default function ProjectFormScreen({ route, navigation }) {
  const editingId = route.params?.id;
  const { dealId, prefillName, prefillBudget, prefillClientId } = route.params || {};
  const [name, setName] = useState(prefillName || "");
  const [code, setCode] = useState("");
  const [clientId, setClientId] = useState(prefillClientId || null);
  const [budget, setBudget] = useState(prefillBudget != null ? String(prefillBudget) : "");
  const [description, setDescription] = useState("");
  const [clients, setClients] = useState([]);
  const [clientsError, setClientsError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const result = await getClients({ limit: 200 });
        setClients(result.clients);
      } catch (err) {
        setClientsError(getErrorMessage(err));
      }

      if (editingId) {
        try {
          const project = await getProject(editingId);
          setName(project.name || "");
          setCode(project.code || "");
          setClientId(project.client?._id || null);
          setBudget(project.budget != null ? String(project.budget) : "");
          setDescription(project.description || "");
        } catch (err) {
          setError(getErrorMessage(err));
        }
      }
      setIsLoading(false);
    })();
  }, [editingId]);

  const handleSubmit = async () => {
    setError("");
    if (!name.trim()) {
      setError("Le nom du projet est requis");
      return;
    }
    if (!clientId) {
      setError("Un client est requis");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        client: clientId,
        code: code.trim() || undefined,
        budget: budget ? Number(budget) : undefined,
        description: description.trim(),
        deal: dealId || undefined,
      };
      if (editingId) {
        await updateProject(editingId, payload);
      } else {
        await createProject(payload);
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
          title={editingId ? "Modifier le projet" : "Nouveau projet"}
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
        title={editingId ? "Modifier le projet" : "Nouveau projet"}
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Nom du projet *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Ex: Refonte site institutionnel"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>Code (optionnel)</Text>
        <TextInput
          style={styles.input}
          value={code}
          onChangeText={setCode}
          placeholder="Généré automatiquement si vide"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="characters"
        />

        <Text style={styles.label}>Client *</Text>
        {!!clientsError && <Text style={styles.error}>{clientsError}</Text>}
        <View style={styles.chipsRow}>
          {clients.map((c) => (
            <TouchableOpacity
              key={c._id}
              style={[styles.chip, clientId === c._id && styles.chipActive]}
              onPress={() => setClientId(c._id)}
            >
              <Text style={[styles.chipText, clientId === c._id && styles.chipTextActive]}>
                {c.entreprise}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Budget (€)</Text>
        <TextInput
          style={styles.input}
          value={budget}
          onChangeText={setBudget}
          placeholder="0"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.textArea}
          value={description}
          onChangeText={setDescription}
          placeholder="Détails du projet..."
          placeholderTextColor={colors.textMuted}
          multiline
        />

        {!!error && <Text style={styles.error}>{error}</Text>}

        <GradientButton
          title={editingId ? "Enregistrer" : "Créer le projet"}
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
