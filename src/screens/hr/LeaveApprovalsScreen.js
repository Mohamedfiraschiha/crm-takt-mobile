import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import dayjs from "dayjs";
import { getLeaves, updateLeaveStatus } from "../../api/hr";
import { getErrorMessage } from "../../api/errors";
import { colors, radii } from "../../theme/colors";
import ScreenHeader from "../../components/ScreenHeader";

const TYPE_LABELS = {
  annuel: "Congé annuel",
  maladie: "Maladie",
  sans_solde: "Sans solde",
  maternite: "Maternité",
  autre: "Autre",
};

const STATUS_STYLES = {
  en_attente: { label: "En attente", color: colors.yellow },
  approuve: { label: "Approuvé", color: colors.green },
  refuse: { label: "Refusé", color: colors.error },
};

function LeaveApprovalCard({ leave, onDecide, isSubmitting }) {
  const [comment, setComment] = useState("");
  const status = STATUS_STYLES[leave.status] || { label: leave.status, color: colors.textMuted };
  const employeeName = leave.employee
    ? `${leave.employee.firstName} ${leave.employee.lastName}`
    : "Employé inconnu";

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.employeeName}>{employeeName}</Text>
        <View style={[styles.badge, { backgroundColor: status.color }]}>
          <Text style={styles.badgeText}>{status.label}</Text>
        </View>
      </View>
      <Text style={styles.type}>{TYPE_LABELS[leave.type] || leave.type}</Text>
      <Text style={styles.dates}>
        {dayjs(leave.startDate).format("D MMM YYYY")} → {dayjs(leave.endDate).format("D MMM YYYY")}
      </Text>
      <Text style={styles.reason}>{leave.reason}</Text>

      {leave.status === "en_attente" && (
        <>
          <TextInput
            style={styles.commentInput}
            placeholder="Commentaire (optionnel)"
            placeholderTextColor={colors.textMuted}
            value={comment}
            onChangeText={setComment}
          />
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => onDecide(leave._id, "approuve", comment)}
              disabled={isSubmitting}
            >
              <Text style={styles.actionText}>Approuver</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.refuseButton]}
              onPress={() => onDecide(leave._id, "refuse", comment)}
              disabled={isSubmitting}
            >
              <Text style={styles.actionText}>Refuser</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {leave.status !== "en_attente" && !!leave.decisionComment && (
        <Text style={styles.decisionComment}>Commentaire : {leave.decisionComment}</Text>
      )}
    </View>
  );
}

export default function LeaveApprovalsScreen({ navigation }) {
  const [leaves, setLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const result = await getLeaves();
      const sorted = [...result].sort((a, b) => {
        if (a.status === "en_attente" && b.status !== "en_attente") return -1;
        if (a.status !== "en_attente" && b.status === "en_attente") return 1;
        return 0;
      });
      setLeaves(sorted);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await load();
      setIsLoading(false);
    })();
  }, [load]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await load();
    setIsRefreshing(false);
  };

  const handleDecide = async (id, status, comment) => {
    setError("");
    setIsSubmitting(true);
    try {
      await updateLeaveStatus(id, status, comment || undefined);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Validation des congés" onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Validation des congés" onBackPress={() => navigation.goBack()} />
      <FlatList
        contentContainerStyle={styles.content}
        data={leaves}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={!!error && <Text style={styles.error}>{error}</Text>}
        renderItem={({ item }) => (
          <LeaveApprovalCard
            leave={item}
            onDecide={handleDecide}
            isSubmitting={isSubmitting}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Aucune demande de congé pour le moment.</Text>
        }
      />
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  employeeName: {
    fontSize: 15,
    fontFamily: "Manrope_700Bold",
    color: colors.textDark,
    flexShrink: 1,
    marginRight: 8,
  },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: "#fff", fontSize: 11, fontFamily: "Manrope_700Bold" },
  type: {
    fontSize: 13,
    fontFamily: "Manrope_600SemiBold",
    color: colors.textDark,
    marginTop: 8,
  },
  dates: {
    fontSize: 13,
    fontFamily: "Manrope_400Regular",
    color: colors.textMuted,
    marginTop: 2,
  },
  reason: {
    fontSize: 13,
    fontFamily: "Manrope_400Regular",
    color: colors.textMuted,
    marginTop: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: "Manrope_400Regular",
    color: colors.textDark,
    fontSize: 13,
    marginTop: 12,
  },
  actionsRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  actionButton: {
    flex: 1,
    borderRadius: radii.md,
    paddingVertical: 10,
    alignItems: "center",
  },
  approveButton: { backgroundColor: colors.green },
  refuseButton: { backgroundColor: colors.error },
  actionText: { color: "#fff", fontFamily: "Manrope_700Bold", fontSize: 13 },
  decisionComment: {
    fontSize: 12,
    fontFamily: "Manrope_400Regular",
    color: colors.textMuted,
    marginTop: 8,
    fontStyle: "italic",
  },
  error: { color: colors.error, fontFamily: "Manrope_600SemiBold", marginBottom: 12, textAlign: "center" },
  empty: { textAlign: "center", color: colors.textMuted, fontFamily: "Manrope_400Regular", marginTop: 40 },
});
