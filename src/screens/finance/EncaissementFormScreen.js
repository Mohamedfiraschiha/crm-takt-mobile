import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import {
  createEncaissement,
  getBankAccounts,
  getEncaissement,
  updateEncaissement,
} from "../../api/finance";
import { getClients } from "../../api/clients";
import { getErrorMessage } from "../../api/errors";
import { colors, radii } from "../../theme/colors";
import GradientButton from "../../components/GradientButton";
import ScreenHeader from "../../components/ScreenHeader";

const MODES = ["Virement", "Espèces", "Chèque", "Carte", "Autre"];

export default function EncaissementFormScreen({ route, navigation }) {
  const editingId = route.params?.id;
  const [montant, setMontant] = useState("");
  const [modePaiement, setModePaiement] = useState("Virement");
  const [categorie, setCategorie] = useState("Encaissement");
  const [reference, setReference] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState(null);
  const [compteId, setCompteId] = useState(null);
  const [clients, setClients] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [clientsResult, accountsResult] = await Promise.all([
          getClients({ limit: 200 }),
          getBankAccounts(),
        ]);
        setClients(clientsResult.clients);
        setAccounts(accountsResult.comptes);
      } catch (err) {
        setError(getErrorMessage(err));
      }
      if (editingId) {
        try {
          const item = await getEncaissement(editingId);
          setMontant(String(item.montant ?? ""));
          setModePaiement(item.modePaiement || "Virement");
          setCategorie(item.categorie || "Encaissement");
          setReference(item.reference || "");
          setDescription(item.description || "");
          setClientId(item.client?._id || null);
          setCompteId(item.compteBancaire?._id || null);
        } catch (err) {
          setError(getErrorMessage(err));
        }
      }
      setIsLoading(false);
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
      const payload = {
        montant: Number(montant),
        modePaiement,
        categorie: categorie.trim(),
        reference: reference.trim(),
        description: description.trim(),
        client: clientId || undefined,
        compteBancaire: compteId || undefined,
      };
      if (editingId) {
        await updateEncaissement(editingId, payload);
      } else {
        await createEncaissement(payload);
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
        <ScreenHeader title="Encaissement" onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title={editingId ? "Modifier l'encaissement" : "Nouvel encaissement"}
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Montant (€) *</Text>
        <TextInput style={styles.input} value={montant} onChangeText={setMontant} keyboardType="numeric" placeholderTextColor={colors.textMuted} />

        <Text style={styles.label}>Mode de paiement</Text>
        <View style={styles.chipsRow}>
          {MODES.map((m) => (
            <TouchableOpacity key={m} style={[styles.chip, modePaiement === m && styles.chipActive]} onPress={() => setModePaiement(m)}>
              <Text style={[styles.chipText, modePaiement === m && styles.chipTextActive]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Client</Text>
        <View style={styles.chipsRow}>
          {clients.map((c) => (
            <TouchableOpacity key={c._id} style={[styles.chip, clientId === c._id && styles.chipActive]} onPress={() => setClientId(clientId === c._id ? null : c._id)}>
              <Text style={[styles.chipText, clientId === c._id && styles.chipTextActive]}>{c.entreprise}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Compte bancaire</Text>
        <View style={styles.chipsRow}>
          {accounts.map((a) => (
            <TouchableOpacity key={a._id} style={[styles.chip, compteId === a._id && styles.chipActive]} onPress={() => setCompteId(compteId === a._id ? null : a._id)}>
              <Text style={[styles.chipText, compteId === a._id && styles.chipTextActive]}>{a.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Catégorie</Text>
        <TextInput style={styles.input} value={categorie} onChangeText={setCategorie} placeholderTextColor={colors.textMuted} />

        <Text style={styles.label}>Référence</Text>
        <TextInput style={styles.input} value={reference} onChangeText={setReference} placeholderTextColor={colors.textMuted} />

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
