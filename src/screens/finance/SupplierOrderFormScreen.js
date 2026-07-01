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
import {
  createSupplierOrder,
  getSupplierOrder,
  getSuppliers,
  updateSupplierOrder,
} from "../../api/finance";
import { getErrorMessage } from "../../api/errors";
import { colors, radii } from "../../theme/colors";
import GradientButton from "../../components/GradientButton";
import ScreenHeader from "../../components/ScreenHeader";

const STATUSES = ["Brouillon", "Validée", "Partiellement payée", "Payée", "Annulée"];

export default function SupplierOrderFormScreen({ route, navigation }) {
  const editingId = route.params?.id;
  const [orderNumber, setOrderNumber] = useState("");
  const [title, setTitle] = useState("");
  const [supplierId, setSupplierId] = useState(null);
  const [totalAmount, setTotalAmount] = useState("");
  const [status, setStatus] = useState("Brouillon");
  const [dueDate, setDueDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const result = await getSuppliers();
        setSuppliers(result.suppliers);
      } catch (err) {
        setError(getErrorMessage(err));
      }
      if (editingId) {
        try {
          const order = await getSupplierOrder(editingId);
          setOrderNumber(order.orderNumber || "");
          setTitle(order.title || "");
          setSupplierId(order.supplier?._id || null);
          setTotalAmount(String(order.totalAmount ?? ""));
          setStatus(order.status || "Brouillon");
          setDueDate(order.dueDate ? new Date(order.dueDate) : null);
        } catch (err) {
          setError(getErrorMessage(err));
        }
      }
      setIsLoading(false);
    })();
  }, [editingId]);

  const handleSubmit = async () => {
    setError("");
    if (!orderNumber.trim() || !supplierId || !totalAmount) {
      setError("Numéro, fournisseur et montant sont requis");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        orderNumber: orderNumber.trim(),
        title: title.trim(),
        supplier: supplierId,
        totalAmount: Number(totalAmount),
        status,
        dueDate: dueDate ? dueDate.toISOString() : undefined,
      };
      if (editingId) {
        await updateSupplierOrder(editingId, payload);
      } else {
        await createSupplierOrder(payload);
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
        <ScreenHeader title="Commande fournisseur" onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title={editingId ? "Modifier la commande" : "Nouvelle commande"}
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Numéro de commande *</Text>
        <TextInput style={styles.input} value={orderNumber} onChangeText={setOrderNumber} placeholderTextColor={colors.textMuted} />

        <Text style={styles.label}>Titre</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholderTextColor={colors.textMuted} />

        <Text style={styles.label}>Fournisseur *</Text>
        <View style={styles.chipsRow}>
          {suppliers.map((s) => (
            <TouchableOpacity
              key={s._id}
              style={[styles.chip, supplierId === s._id && styles.chipActive]}
              onPress={() => setSupplierId(s._id)}
            >
              <Text style={[styles.chipText, supplierId === s._id && styles.chipTextActive]}>{s.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Montant total (€) *</Text>
        <TextInput style={styles.input} value={totalAmount} onChangeText={setTotalAmount} keyboardType="numeric" placeholderTextColor={colors.textMuted} />

        <Text style={styles.label}>Statut</Text>
        <View style={styles.chipsRow}>
          {STATUSES.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.chip, status === s && styles.chipActive]}
              onPress={() => setStatus(s)}
            >
              <Text style={[styles.chipText, status === s && styles.chipTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Échéance</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
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

        {!!error && <Text style={styles.error}>{error}</Text>}
        <GradientButton
          title={editingId ? "Enregistrer" : "Créer"}
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
  error: { color: colors.error, fontFamily: "Manrope_600SemiBold", marginTop: 16, marginBottom: 8, textAlign: "center" },
});
