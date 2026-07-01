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
  addChecklistItem,
  addTaskComment,
  deleteTask,
  getTask,
  getTaskStatuses,
  toggleChecklistItem,
  updateTaskStatus,
} from "../../api/tasks";
import { getErrorMessage } from "../../api/errors";
import { colors, radii } from "../../theme/colors";
import GradientButton from "../../components/GradientButton";
import ScreenHeader from "../../components/ScreenHeader";

const PRIORITY_COLORS = {
  Urgente: colors.error,
  Haute: colors.yellow,
  Moyenne: colors.primary,
  Basse: colors.textMuted,
};

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || "—"}</Text>
    </View>
  );
}

export default function TaskDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [task, setTask] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checklistText, setChecklistText] = useState("");
  const [commentText, setCommentText] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const [taskResult, statusesResult] = await Promise.all([
        getTask(id),
        getTaskStatuses(),
      ]);
      setTask(taskResult);
      setStatuses(statusesResult);
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
      setTask(await updateTaskStatus(id, status));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddChecklistItem = async () => {
    if (!checklistText.trim()) return;
    setIsSubmitting(true);
    setError("");
    try {
      setTask(await addChecklistItem(id, checklistText.trim()));
      setChecklistText("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleItem = async (itemId) => {
    setError("");
    try {
      setTask(await toggleChecklistItem(id, itemId));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setIsSubmitting(true);
    setError("");
    try {
      setTask(await addTaskComment(id, commentText.trim()));
      setCommentText("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Supprimer cette tâche ?", "Cette action est définitive.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTask(id);
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
        <ScreenHeader title="Tâche" onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Tâche" onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <Text style={styles.error}>{error || "Tâche introuvable"}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title={task.title}
        onBackPress={() => navigation.goBack()}
        actions={[{ label: "Modifier", onPress: () => navigation.navigate("TaskForm", { id }) }]}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {!!error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.card}>
          <InfoRow label="Priorité" value={task.priority} />
          <InfoRow label="Projet" value={task.project?.name} />
          <InfoRow label="Client" value={task.client?.entreprise} />
          <InfoRow
            label="Échéance"
            value={task.dueDate ? dayjs(task.dueDate).format("D MMM YYYY") : "—"}
          />
        </View>

        {!!task.description && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.infoValue}>{task.description}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statut</Text>
          <View style={styles.chipsRow}>
            {statuses.map((s) => (
              <TouchableOpacity
                key={s._id}
                style={[
                  styles.chip,
                  task.status === s.name && {
                    backgroundColor: PRIORITY_COLORS[task.priority] || colors.primary,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => handleStatusChange(s.name)}
                disabled={isSubmitting}
              >
                <Text style={[styles.chipText, task.status === s.name && styles.chipTextActive]}>
                  {s.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Checklist</Text>
          {task.checklist?.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={styles.checklistItem}
              onPress={() => handleToggleItem(item._id)}
            >
              <View style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
                {item.completed && <Text style={styles.checkboxMark}>✓</Text>}
              </View>
              <Text
                style={[styles.checklistText, item.completed && styles.checklistTextDone]}
              >
                {item.text}
              </Text>
            </TouchableOpacity>
          ))}
          <View style={styles.inlineRow}>
            <TextInput
              style={styles.inlineInput}
              placeholder="Nouvel élément..."
              placeholderTextColor={colors.textMuted}
              value={checklistText}
              onChangeText={setChecklistText}
              onSubmitEditing={handleAddChecklistItem}
            />
            <TouchableOpacity style={styles.inlineButton} onPress={handleAddChecklistItem}>
              <Text style={styles.inlineButtonText}>＋</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Commentaires</Text>
          {!task.comments?.length && <Text style={styles.empty}>Aucun commentaire.</Text>}
          {task.comments
            ?.slice()
            .reverse()
            .map((c, index) => (
              <View key={index} style={styles.card}>
                <Text style={styles.infoValue}>{c.content}</Text>
                <Text style={styles.commentMeta}>
                  {c.createdBy?.name} · {dayjs(c.createdAt).format("D MMM YYYY HH:mm")}
                </Text>
              </View>
            ))}
          <TextInput
            style={styles.textArea}
            placeholder="Ajouter un commentaire..."
            placeholderTextColor={colors.textMuted}
            value={commentText}
            onChangeText={setCommentText}
            multiline
          />
          <GradientButton title="Commenter" onPress={handleAddComment} loading={isSubmitting} />
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Supprimer cette tâche</Text>
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
  checklistItem: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: colors.green, borderColor: colors.green },
  checkboxMark: { color: "#fff", fontSize: 13, fontFamily: "Manrope_700Bold" },
  checklistText: { fontSize: 14, fontFamily: "Manrope_400Regular", color: colors.textDark, flexShrink: 1 },
  checklistTextDone: { textDecorationLine: "line-through", color: colors.textMuted },
  inlineRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  inlineInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.card,
    fontFamily: "Manrope_400Regular",
    color: colors.textDark,
  },
  inlineButton: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  inlineButtonText: { color: "#fff", fontSize: 18, fontFamily: "Manrope_700Bold" },
  commentMeta: { fontSize: 11, fontFamily: "Manrope_400Regular", color: colors.textMuted, marginTop: 6 },
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
    minHeight: 70,
    textAlignVertical: "top",
    marginBottom: 10,
  },
  deleteButton: { alignItems: "center", paddingVertical: 14, marginTop: 8 },
  deleteButtonText: { color: colors.error, fontFamily: "Manrope_700Bold", fontSize: 14 },
  error: { color: colors.error, fontFamily: "Manrope_600SemiBold", marginBottom: 12, textAlign: "center" },
  empty: { color: colors.textMuted, fontFamily: "Manrope_400Regular" },
});
