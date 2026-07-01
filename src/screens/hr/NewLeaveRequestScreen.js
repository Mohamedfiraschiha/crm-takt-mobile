import React, { useState } from "react";
import {
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
import { createLeave } from "../../api/hr";
import { getErrorMessage } from "../../api/errors";
import { colors, radii } from "../../theme/colors";
import GradientButton from "../../components/GradientButton";
import ScreenHeader from "../../components/ScreenHeader";

const TYPES = [
  { key: "annuel", label: "Congé annuel" },
  { key: "maladie", label: "Maladie" },
  { key: "sans_solde", label: "Sans solde" },
  { key: "maternite", label: "Maternité" },
  { key: "autre", label: "Autre" },
];

export default function NewLeaveRequestScreen({ navigation }) {
  const [type, setType] = useState("annuel");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reason, setReason] = useState("");
  const [activePicker, setActivePicker] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!reason.trim()) {
      setError("Le motif du congé est requis");
      return;
    }
    setIsSubmitting(true);
    try {
      await createLeave({
        type,
        startDate: dayjs(startDate).format("YYYY-MM-DD"),
        endDate: dayjs(endDate).format("YYYY-MM-DD"),
        reason: reason.trim(),
      });
      navigation.goBack();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Nouvelle demande" onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.label}>Type de congé</Text>
      <View style={styles.chipsRow}>
        {TYPES.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.chip, type === item.key && styles.chipActive]}
            onPress={() => setType(item.key)}
          >
            <Text style={[styles.chipText, type === item.key && styles.chipTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Date de début</Text>
      <TouchableOpacity style={styles.dateInput} onPress={() => setActivePicker("start")}>
        <Text style={styles.dateText}>{dayjs(startDate).format("D MMMM YYYY")}</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Date de fin</Text>
      <TouchableOpacity style={styles.dateInput} onPress={() => setActivePicker("end")}>
        <Text style={styles.dateText}>{dayjs(endDate).format("D MMMM YYYY")}</Text>
      </TouchableOpacity>

      {activePicker && (
        <DateTimePicker
          value={activePicker === "start" ? startDate : endDate}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={(event, selected) => {
            setActivePicker(Platform.OS === "ios" ? activePicker : null);
            if (event.type === "dismissed" || !selected) return;
            if (activePicker === "start") setStartDate(selected);
            else setEndDate(selected);
          }}
        />
      )}

      <Text style={styles.label}>Motif</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Précisez le motif de votre demande"
        placeholderTextColor={colors.textMuted}
        value={reason}
        onChangeText={setReason}
        multiline
        numberOfLines={4}
      />

      {!!error && <Text style={styles.error}>{error}</Text>}

      <GradientButton
        title="Envoyer la demande"
        onPress={handleSubmit}
        loading={isSubmitting}
      />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  label: {
    fontSize: 13,
    fontFamily: "Manrope_700Bold",
    color: colors.textDark,
    marginBottom: 8,
    marginTop: 12,
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
  dateInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.card,
  },
  dateText: { fontFamily: "Manrope_600SemiBold", color: colors.textDark, fontSize: 15 },
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
    minHeight: 100,
    textAlignVertical: "top",
  },
  error: {
    color: colors.error,
    fontFamily: "Manrope_600SemiBold",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
});
