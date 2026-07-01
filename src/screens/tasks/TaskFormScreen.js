import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import { createTask, getProjects, getTask, updateTask } from "../../api/tasks";
import { getErrorMessage } from "../../api/errors";
import { colors, radii } from "../../theme/colors";
import GradientButton from "../../components/GradientButton";
import ScreenHeader from "../../components/ScreenHeader";

const PRIORITIES = ["Basse", "Moyenne", "Haute", "Urgente"];

export default function TaskFormScreen({ route, navigation }) {
  const editingId = route.params?.id;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Moyenne");
  const [projectId, setProjectId] = useState(null);
  const [dueDate, setDueDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [projects, setProjects] = useState([]);
  const [projectsError, setProjectsError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const list = await getProjects();
        setProjects(list);
      } catch (err) {
        setProjectsError(getErrorMessage(err));
      }

      if (editingId) {
        try {
          const task = await getTask(editingId);
          setTitle(task.title || "");
          setDescription(task.description || "");
          setPriority(task.priority || "Moyenne");
          setProjectId(task.project?._id || null);
          setDueDate(task.dueDate ? new Date(task.dueDate) : null);
        } catch (err) {
          setError(getErrorMessage(err));
        }
      }
      setIsLoading(false);
    })();
  }, [editingId]);

  const handleSubmit = async () => {
    setError("");
    if (!title.trim()) {
      setError("Le titre est requis");
      return;
    }
    if (!projectId) {
      setError("Un projet est requis pour créer une tâche");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        priority,
        project: projectId,
        dueDate: dueDate ? dueDate.toISOString() : undefined,
      };
      if (editingId) {
        await updateTask(editingId, payload);
      } else {
        await createTask(payload);
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
          title={editingId ? "Modifier la tâche" : "Nouvelle tâche"}
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
        title={editingId ? "Modifier la tâche" : "Nouvelle tâche"}
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Titre *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Ex: Préparer la présentation client"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.textArea}
          value={description}
          onChangeText={setDescription}
          placeholder="Détails de la tâche..."
          placeholderTextColor={colors.textMuted}
          multiline
        />

        <Text style={styles.label}>Priorité</Text>
        <View style={styles.chipsRow}>
          {PRIORITIES.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.chip, priority === p && styles.chipActive]}
              onPress={() => setPriority(p)}
            >
              <Text style={[styles.chipText, priority === p && styles.chipTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Échéance</Text>
        <TouchableOpacity style={styles.dateInput} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateText}>
            {dueDate ? dayjs(dueDate).format("D MMMM YYYY") : "Aucune échéance"}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={dueDate || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "default"}
            onChange={(event, selected) => {
              setShowDatePicker(Platform.OS === "ios");
              if (event.type === "dismissed" || !selected) return;
              setDueDate(selected);
            }}
          />
        )}

        <Text style={styles.label}>Projet *</Text>
        {!!projectsError && <Text style={styles.error}>{projectsError}</Text>}
        {!projectsError && !projects.length && (
          <Text style={styles.hint}>Aucun projet disponible.</Text>
        )}
        <View style={styles.chipsRow}>
          {projects.map((p) => (
            <TouchableOpacity
              key={p._id}
              style={[styles.chip, projectId === p._id && styles.chipActive]}
              onPress={() => setProjectId(p._id)}
            >
              <Text style={[styles.chipText, projectId === p._id && styles.chipTextActive]}>
                {p.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {!!error && <Text style={styles.error}>{error}</Text>}

        <GradientButton
          title={editingId ? "Enregistrer" : "Créer la tâche"}
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
  dateInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.card,
  },
  dateText: { fontFamily: "Manrope_600SemiBold", color: colors.textDark, fontSize: 15 },
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
  hint: { color: colors.textMuted, fontFamily: "Manrope_400Regular", fontSize: 13 },
  error: {
    color: colors.error,
    fontFamily: "Manrope_600SemiBold",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
});
