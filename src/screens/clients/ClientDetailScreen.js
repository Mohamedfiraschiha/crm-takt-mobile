import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import dayjs from "dayjs";
import { addClientInteraction, deleteClient, getClient } from "../../api/clients";
import { getErrorMessage } from "../../api/errors";
import { colors, radii } from "../../theme/colors";
import GradientButton from "../../components/GradientButton";
import ScreenHeader from "../../components/ScreenHeader";

const STATUS_STYLES = {
  Actif: colors.green,
  Inactif: colors.textMuted,
  Prospect: colors.yellow,
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || "—"}</Text>
    </View>
  );
}

export default function ClientDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [client, setClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      setClient(await getClient(id));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [id]);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await load();
      setIsLoading(false);
    })();
  }, [load]);

  const handleAddInteraction = async () => {
    if (!note.trim()) return;
    setIsSubmitting(true);
    setError("");
    try {
      await addClientInteraction(id, { summary: note.trim() });
      setNote("");
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Supprimer ce client ?",
      "Cette action est définitive.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteClient(id);
              navigation.goBack();
            } catch (err) {
              setError(getErrorMessage(err));
            }
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Client" onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!client) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Client" onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <Text style={styles.error}>{error || "Client introuvable"}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title={client.entreprise}
        onBackPress={() => navigation.goBack()}
        actions={[{ label: "Modifier", onPress: () => navigation.navigate("ClientForm", { id }) }]}
      />
      <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View
          style={[
            styles.badge,
            { backgroundColor: STATUS_STYLES[client.statut] || colors.textMuted },
          ]}
        >
          <Text style={styles.badgeText}>{client.statut}</Text>
        </View>
      </View>

      {!!error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.card}>
        <InfoRow label="Email" value={client.email} />
        <InfoRow label="Téléphone" value={client.telephone} />
        <InfoRow label="Localité" value={client.localite} />
        <InfoRow label="Secteur" value={client.secteurActivite} />
        <InfoRow label="CA" value={formatCurrency(client.ca)} />
        <InfoRow label="Score" value={`${client.score ?? 0}/100`} />
        <InfoRow
          label="Dernier contact"
          value={client.dernierContact ? dayjs(client.dernierContact).format("D MMM YYYY") : "—"}
        />
      </View>

      {!!client.contacts?.length && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contacts</Text>
          {client.contacts.map((contact, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.contactName}>
                {contact.nom} {contact.isPrimary ? "★" : ""}
              </Text>
              <Text style={styles.infoValue}>{contact.poste}</Text>
              <Text style={styles.infoValue}>{contact.email}</Text>
              <Text style={styles.infoValue}>{contact.telephone}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ajouter une interaction</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Résumé de l'échange..."
          placeholderTextColor={colors.textMuted}
          value={note}
          onChangeText={setNote}
          multiline
        />
        <GradientButton
          title="Ajouter"
          onPress={handleAddInteraction}
          loading={isSubmitting}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Historique des interactions</Text>
        {!client.interactions?.length && (
          <Text style={styles.empty}>Aucune interaction enregistrée.</Text>
        )}
        {client.interactions?.map((interaction, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.interactionType}>{interaction.type}</Text>
            <Text style={styles.infoValue}>{interaction.summary}</Text>
            <Text style={styles.interactionDate}>
              {dayjs(interaction.date).format("D MMM YYYY HH:mm")}
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>Supprimer ce client</Text>
      </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { padding: 16, paddingBottom: 40 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 22, fontFamily: "BarlowCondensed_700Bold", color: colors.textDark, flexShrink: 1, marginRight: 8 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: "#fff", fontSize: 11, fontFamily: "Manrope_700Bold" },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  infoLabel: { fontSize: 13, fontFamily: "Manrope_400Regular", color: colors.textMuted },
  infoValue: { fontSize: 13, fontFamily: "Manrope_600SemiBold", color: colors.textDark, flexShrink: 1, textAlign: "right" },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontFamily: "Manrope_700Bold", color: colors.textDark, marginBottom: 10 },
  contactName: { fontSize: 14, fontFamily: "Manrope_700Bold", color: colors.textDark, marginBottom: 4 },
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
    marginBottom: 10,
  },
  interactionType: { fontSize: 12, fontFamily: "Manrope_700Bold", color: colors.primary, marginBottom: 4 },
  interactionDate: { fontSize: 11, fontFamily: "Manrope_400Regular", color: colors.textMuted, marginTop: 6 },
  deleteButton: { alignItems: "center", paddingVertical: 14, marginTop: 8 },
  deleteButtonText: { color: colors.error, fontFamily: "Manrope_700Bold", fontSize: 14 },
  error: { color: colors.error, fontFamily: "Manrope_600SemiBold", marginBottom: 12, textAlign: "center" },
  empty: { color: colors.textMuted, fontFamily: "Manrope_400Regular" },
});
