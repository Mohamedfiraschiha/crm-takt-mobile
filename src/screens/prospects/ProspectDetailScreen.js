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
import {
  addDealNote,
  convertDealToClient,
  deleteDeal,
  getDeal,
  updateDealStage,
} from "../../api/deals";
import { getErrorMessage } from "../../api/errors";
import { colors, radii } from "../../theme/colors";
import GradientButton from "../../components/GradientButton";
import ScreenHeader from "../../components/ScreenHeader";
import { useAuth } from "../../context/AuthContext";

const STAGES = ["Prospect", "Qualification", "Proposition", "Négociation", "Gagné", "Perdu"];
const PROJECT_MANAGER_ROLES = ["super_admin", "administrateur", "manager"];

const STAGE_COLORS = {
  Prospect: colors.textMuted,
  Qualification: colors.indigo,
  Proposition: colors.primary,
  Négociation: colors.yellow,
  Gagné: colors.green,
  Perdu: colors.error,
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

export default function ProspectDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { user } = useAuth();
  const canManageProjects = PROJECT_MANAGER_ROLES.includes(user?.role);
  const [deal, setDeal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      setDeal(await getDeal(id));
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

  const handleStageChange = async (stage) => {
    setError("");
    setIsSubmitting(true);
    try {
      setDeal(await updateDealStage(id, stage));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNote = async () => {
    if (!note.trim()) return;
    setIsSubmitting(true);
    setError("");
    try {
      setDeal(await addDealNote(id, note.trim()));
      setNote("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConvert = () => {
    Alert.alert(
      "Convertir en client ?",
      "Ce deal sera transformé en client actif.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Convertir",
          onPress: async () => {
            setIsSubmitting(true);
            try {
              await convertDealToClient(id);
              await load();
            } catch (err) {
              setError(getErrorMessage(err));
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ],
    );
  };

  const handleDelete = () => {
    Alert.alert(
      "Supprimer ce deal ?",
      "Cette action est définitive.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDeal(id);
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
        <ScreenHeader title="Deal" onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!deal) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Deal" onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <Text style={styles.error}>{error || "Deal introuvable"}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title={deal.title}
        onBackPress={() => navigation.goBack()}
        actions={[{ label: "Modifier", onPress: () => navigation.navigate("ProspectForm", { id }) }]}
      />
      <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View style={[styles.badge, { backgroundColor: STAGE_COLORS[deal.stage] || colors.textMuted }]}>
          <Text style={styles.badgeText}>{deal.stage}</Text>
        </View>
      </View>

      {!!error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.card}>
        <InfoRow label="Entreprise" value={deal.company} />
        <InfoRow label="Montant" value={formatCurrency(deal.amount)} />
        <InfoRow label="Probabilité" value={`${deal.probability}%`} />
        <InfoRow label="Priorité" value={deal.priority} />
        <InfoRow label="Source" value={deal.source} />
        <InfoRow label="Email contact" value={deal.contactEmail} />
        <InfoRow label="Téléphone contact" value={deal.contactPhone} />
        <InfoRow
          label="Clôture prévue"
          value={deal.expectedCloseDate ? dayjs(deal.expectedCloseDate).format("D MMM YYYY") : "—"}
        />
      </View>

      {!!deal.description && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.infoValue}>{deal.description}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Changer l'étape</Text>
        <View style={styles.chipsRow}>
          {STAGES.map((stage) => (
            <TouchableOpacity
              key={stage}
              style={[
                styles.chip,
                deal.stage === stage && { backgroundColor: STAGE_COLORS[stage], borderColor: STAGE_COLORS[stage] },
              ]}
              onPress={() => handleStageChange(stage)}
              disabled={isSubmitting}
            >
              <Text style={[styles.chipText, deal.stage === stage && styles.chipTextActive]}>
                {stage}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.actionsRow}>
        {deal.stage !== "Gagné" && (
          <GradientButton
            title="Convertir en client"
            onPress={handleConvert}
            loading={isSubmitting}
            colors={[colors.green, "#16a34a", colors.primary]}
            style={styles.actionButton}
          />
        )}
        {canManageProjects && (
          <GradientButton
            title="Créer projet"
            onPress={() =>
              navigation.navigate("Projects", {
                screen: "ProjectForm",
                params: {
                  dealId: deal._id,
                  prefillName: deal.title,
                  prefillBudget: deal.amount,
                  prefillClientId: deal.client?._id,
                },
              })
            }
            colors={[colors.indigo, colors.primary, colors.primary]}
            style={styles.actionButton}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ajouter une note</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Note sur ce deal..."
          placeholderTextColor={colors.textMuted}
          value={note}
          onChangeText={setNote}
          multiline
        />
        <GradientButton title="Ajouter" onPress={handleAddNote} loading={isSubmitting} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notes</Text>
        {!deal.notes?.length && <Text style={styles.empty}>Aucune note.</Text>}
        {deal.notes
          ?.slice()
          .reverse()
          .map((n, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.infoValue}>{n.content}</Text>
              <Text style={styles.noteDate}>{dayjs(n.createdAt).format("D MMM YYYY HH:mm")}</Text>
            </View>
          ))}
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>Supprimer ce deal</Text>
      </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { padding: 16, paddingBottom: 40 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 20, fontFamily: "BarlowCondensed_700Bold", color: colors.textDark, flexShrink: 1, marginRight: 8 },
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
  actionsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  actionButton: { flex: 1 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontFamily: "Manrope_700Bold", color: colors.textDark, marginBottom: 10 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.card,
  },
  chipText: { fontFamily: "Manrope_600SemiBold", color: colors.textDark, fontSize: 13 },
  chipTextActive: { color: "#fff" },
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
  noteDate: { fontSize: 11, fontFamily: "Manrope_400Regular", color: colors.textMuted, marginTop: 6 },
  deleteButton: { alignItems: "center", paddingVertical: 14, marginTop: 8 },
  deleteButtonText: { color: colors.error, fontFamily: "Manrope_700Bold", fontSize: 14 },
  error: { color: colors.error, fontFamily: "Manrope_600SemiBold", marginBottom: 12, textAlign: "center" },
  empty: { color: colors.textMuted, fontFamily: "Manrope_400Regular" },
});
