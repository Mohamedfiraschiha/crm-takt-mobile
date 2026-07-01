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
import { createInvoice, getInvoice, updateInvoice } from "../../api/invoices";
import { getErrorMessage } from "../../api/errors";
import { colors, radii } from "../../theme/colors";
import GradientButton from "../../components/GradientButton";
import ScreenHeader from "../../components/ScreenHeader";

const TYPES = ["Devis", "Facture"];

const emptyItem = () => ({ description: "", quantity: "1", unitPrice: "0" });

const formatCurrency = (amount) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

export default function InvoiceFormScreen({ route, navigation }) {
  const editingId = route.params?.id;
  const [type, setType] = useState("Devis");
  const [clientId, setClientId] = useState(null);
  const [taxRate, setTaxRate] = useState("20");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([emptyItem()]);
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
          const invoice = await getInvoice(editingId);
          setType(invoice.type);
          setClientId(invoice.client?._id || null);
          setTaxRate(String(invoice.taxRate ?? 20));
          setNotes(invoice.notes || "");
          setItems(
            invoice.items?.length
              ? invoice.items.map((item) => ({
                  description: item.description,
                  quantity: String(item.quantity),
                  unitPrice: String(item.unitPrice),
                }))
              : [emptyItem()],
          );
        } catch (err) {
          setError(getErrorMessage(err));
        }
      }
      setIsLoading(false);
    })();
  }, [editingId]);

  const updateItem = (index, field, value) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (index) => setItems((prev) => prev.filter((_, i) => i !== index));

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0),
    0,
  );
  const taxAmount = (subtotal * Number(taxRate || 0)) / 100;
  const total = subtotal + taxAmount;

  const handleSubmit = async () => {
    setError("");
    if (!clientId) {
      setError("Un client est requis");
      return;
    }
    const validItems = items.filter((item) => item.description.trim());
    if (!validItems.length) {
      setError("Au moins une ligne avec une description est requise");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        type,
        client: clientId,
        taxRate: Number(taxRate || 0),
        notes: notes.trim(),
        items: validItems.map((item) => ({
          description: item.description.trim(),
          quantity: Number(item.quantity || 0),
          unitPrice: Number(item.unitPrice || 0),
        })),
      };
      if (editingId) {
        await updateInvoice(editingId, payload);
      } else {
        await createInvoice(payload);
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
          title={editingId ? "Modifier le document" : "Nouveau document"}
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
        title={editingId ? "Modifier le document" : "Nouveau document"}
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {!editingId && (
          <>
            <Text style={styles.label}>Type de document</Text>
            <View style={styles.chipsRow}>
              {TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, type === t && styles.chipActive]}
                  onPress={() => setType(t)}
                >
                  <Text style={[styles.chipText, type === t && styles.chipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

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

        <Text style={styles.label}>Lignes *</Text>
        {items.map((item, index) => (
          <View key={index} style={styles.itemCard}>
            <TextInput
              style={styles.input}
              value={item.description}
              onChangeText={(v) => updateItem(index, "description", v)}
              placeholder="Description"
              placeholderTextColor={colors.textMuted}
            />
            <View style={styles.itemRow}>
              <TextInput
                style={[styles.input, styles.itemInput]}
                value={item.quantity}
                onChangeText={(v) => updateItem(index, "quantity", v)}
                placeholder="Qté"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.itemInput]}
                value={item.unitPrice}
                onChangeText={(v) => updateItem(index, "unitPrice", v)}
                placeholder="Prix unitaire"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
              />
              <TouchableOpacity style={styles.removeButton} onPress={() => removeItem(index)}>
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.itemTotal}>
              = {formatCurrency(Number(item.quantity || 0) * Number(item.unitPrice || 0))}
            </Text>
          </View>
        ))}
        <TouchableOpacity style={styles.addItemButton} onPress={addItem}>
          <Text style={styles.addItemButtonText}>＋ Ajouter une ligne</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Taux de TVA (%)</Text>
        <TextInput
          style={styles.input}
          value={taxRate}
          onChangeText={setTaxRate}
          placeholder="20"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
        />

        <View style={styles.totalsBox}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Sous-total</Text>
            <Text style={styles.totalsValue}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>TVA</Text>
            <Text style={styles.totalsValue}>{formatCurrency(taxAmount)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          </View>
        </View>

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={styles.textArea}
          value={notes}
          onChangeText={setNotes}
          placeholder="Notes ou conditions..."
          placeholderTextColor={colors.textMuted}
          multiline
        />

        {!!error && <Text style={styles.error}>{error}</Text>}

        <GradientButton
          title={editingId ? "Enregistrer" : "Créer le document"}
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
    paddingVertical: 12,
    backgroundColor: colors.card,
    fontFamily: "Manrope_400Regular",
    color: colors.textDark,
    fontSize: 14,
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
  itemCard: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 10,
    gap: 8,
  },
  itemRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  itemInput: { flex: 1 },
  removeButton: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  removeButtonText: { color: colors.error, fontFamily: "Manrope_700Bold", fontSize: 16 },
  itemTotal: { fontSize: 12, fontFamily: "Manrope_600SemiBold", color: colors.textMuted, textAlign: "right" },
  addItemButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: "dashed",
    borderRadius: radii.md,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  addItemButtonText: { color: colors.primary, fontFamily: "Manrope_700Bold", fontSize: 13 },
  totalsBox: {
    backgroundColor: colors.textDark,
    borderRadius: radii.lg,
    padding: 16,
    marginTop: 16,
  },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  totalsLabel: { fontSize: 13, fontFamily: "Manrope_400Regular", color: "#cfe9f2" },
  totalsValue: { fontSize: 13, fontFamily: "Manrope_600SemiBold", color: "#fff" },
  totalLabel: { fontSize: 14, fontFamily: "Manrope_700Bold", color: "#fff" },
  totalValue: { fontSize: 16, fontFamily: "BarlowCondensed_700Bold", color: "#fff" },
  error: {
    color: colors.error,
    fontFamily: "Manrope_600SemiBold",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
});
