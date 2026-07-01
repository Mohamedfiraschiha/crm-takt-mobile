import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import dayjs from "dayjs";
import {
  archiveProject,
  deleteProject,
  getProject,
  updateProject,
} from "../../api/projects";
import { getErrorMessage } from "../../api/errors";
import { colors, radii } from "../../theme/colors";
import ScreenHeader from "../../components/ScreenHeader";

const STATUSES = ["Planifie", "En cours", "En pause", "Termine", "Annule"];

const STATUS_COLORS = {
  Planifie: colors.textMuted,
  "En cours": colors.primary,
  "En pause": colors.yellow,
  Termine: colors.green,
  Annule: colors.error,
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

export default function ProjectDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      setProject(await getProject(id));
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

  const handleStatusChange = async (status) => {
    setError("");
    setIsSubmitting(true);
    try {
      setProject(await updateProject(id, { status }));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = () => {
    Alert.alert("Archiver ce projet ?", "Le projet ne sera plus visible dans la liste active.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Archiver",
        onPress: async () => {
          try {
            await archiveProject(id);
            navigation.goBack();
          } catch (err) {
            setError(getErrorMessage(err));
          }
        },
      },
    ]);
  };

  const handleDelete = () => {
    Alert.alert("Supprimer ce projet ?", "Cette action est définitive.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteProject(id);
            navigation.goBack();
          } catch (err) {
            setError(getErrorMessage(err));
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Projet" onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Projet" onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <Text style={styles.error}>{error || "Projet introuvable"}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title={project.name}
        onBackPress={() => navigation.goBack()}
        actions={[{ label: "Modifier", onPress: () => navigation.navigate("ProjectForm", { id }) }]}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {!!error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.card}>
          <InfoRow label="Code" value={project.code} />
          <InfoRow label="Client" value={project.client?.entreprise} />
          <InfoRow label="Budget" value={formatCurrency(project.budget)} />
          <InfoRow label="Responsable" value={project.owner?.name} />
          <InfoRow
            label="Début"
            value={project.startDate ? dayjs(project.startDate).format("D MMM YYYY") : "—"}
          />
          <InfoRow
            label="Fin"
            value={project.endDate ? dayjs(project.endDate).format("D MMM YYYY") : "—"}
          />
        </View>

        {!!project.description && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.infoValue}>{project.description}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statut</Text>
          <View style={styles.chipsRow}>
            {STATUSES.map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.chip,
                  project.status === status && {
                    backgroundColor: STATUS_COLORS[status],
                    borderColor: STATUS_COLORS[status],
                  },
                ]}
                onPress={() => handleStatusChange(status)}
                disabled={isSubmitting}
              >
                <Text
                  style={[styles.chipText, project.status === status && styles.chipTextActive]}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.archiveButton} onPress={handleArchive}>
          <Text style={styles.archiveButtonText}>Archiver ce projet</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Supprimer ce projet</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { padding: 16, paddingBottom: 40 },
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
  archiveButton: { alignItems: "center", paddingVertical: 14, marginTop: 8 },
  archiveButtonText: { color: colors.yellow, fontFamily: "Manrope_700Bold", fontSize: 14 },
  deleteButton: { alignItems: "center", paddingVertical: 14 },
  deleteButtonText: { color: colors.error, fontFamily: "Manrope_700Bold", fontSize: 14 },
  error: { color: colors.error, fontFamily: "Manrope_600SemiBold", marginBottom: 12, textAlign: "center" },
});
