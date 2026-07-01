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
  convertQuoteToInvoice,
  deleteInvoice,
  getInvoice,
  sendQuoteToClient,
  updateInvoice,
} from "../../api/invoices";
import { getErrorMessage } from "../../api/errors";
import { colors, radii } from "../../theme/colors";
import GradientButton from "../../components/GradientButton";
import ScreenHeader from "../../components/ScreenHeader";

const QUOTE_STATUSES = ["Brouillon", "Envoyée", "Accepté", "Refusé"];
const INVOICE_STATUSES = [
  "Brouillon",
  "Envoyée",
  "Partiellement payée",
  "Payée",
  "En retard",
  "Annulée",
];

const STATUS_COLORS = {
  Brouillon: colors.textMuted,
  Envoyée: colors.primary,
  Accepté: colors.green,
  Refusé: colors.error,
  "Partiellement payée": colors.yellow,
  Payée: colors.green,
  "En retard": colors.error,
  Annulée: colors.textMuted,
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

export default function InvoiceDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [invoice, setInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      setInvoice(await getInvoice(id));
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
      setInvoice(await updateInvoice(id, { status }));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendToClient = async () => {
    setError("");
    setInfo("");
    setIsSubmitting(true);
    try {
      await sendQuoteToClient(id);
      setInfo("Devis envoyé au client");
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConvert = () => {
    Alert.alert("Convertir en facture ?", "Une nouvelle facture sera générée à partir de ce devis.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Convertir",
        onPress: async () => {
          setIsSubmitting(true);
          setError("");
          try {
            const result = await convertQuoteToInvoice(id);
            navigation.replace("InvoiceDetail", { id: result.invoice._id });
          } catch (err) {
            setError(getErrorMessage(err));
          } finally {
            setIsSubmitting(false);
          }
        },
      },
    ]);
  };

  const handleDelete = () => {
    Alert.alert("Supprimer ce document ?", "Cette action est définitive.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteInvoice(id);
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
        <ScreenHeader title="Document" onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!invoice) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Document" onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <Text style={styles.error}>{error || "Document introuvable"}</Text>
        </View>
      </View>
    );
  }

  const statuses = invoice.type === "Devis" ? QUOTE_STATUSES : INVOICE_STATUSES;

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title={invoice.number}
        onBackPress={() => navigation.goBack()}
        actions={[{ label: "Modifier", onPress: () => navigation.navigate("InvoiceForm", { id }) }]}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {!!error && <Text style={styles.error}>{error}</Text>}
        {!!info && <Text style={styles.info}>{info}</Text>}

        <View style={styles.card}>
          <InfoRow label="Type" value={invoice.type} />
          <InfoRow label="Client" value={invoice.client?.entreprise} />
          <InfoRow label="Date" value={dayjs(invoice.date).format("D MMM YYYY")} />
          <InfoRow
            label="Échéance"
            value={invoice.dueDate ? dayjs(invoice.dueDate).format("D MMM YYYY") : "—"}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lignes</Text>
          {invoice.items?.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemDesc}>{item.description}</Text>
              <Text style={styles.itemMeta}>
                {item.quantity} × {formatCurrency(item.unitPrice)} = {formatCurrency(item.total)}
              </Text>
            </View>
          ))}
          <View style={styles.totalsBox}>
            <View style={styles.infoRow}>
              <Text style={styles.totalsLabel}>Sous-total</Text>
              <Text style={styles.totalsValue}>{formatCurrency(invoice.subtotal)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.totalsLabel}>TVA ({invoice.taxRate}%)</Text>
              <Text style={styles.totalsValue}>{formatCurrency(invoice.taxAmount)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(invoice.total)}</Text>
            </View>
            {invoice.type === "Facture" && (
              <View style={styles.infoRow}>
                <Text style={styles.totalsLabel}>Reste à payer</Text>
                <Text style={styles.totalsValue}>{formatCurrency(invoice.balanceDue)}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statut</Text>
          <View style={styles.chipsRow}>
            {statuses.map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.chip,
                  invoice.status === status && {
                    backgroundColor: STATUS_COLORS[status],
                    borderColor: STATUS_COLORS[status],
                  },
                ]}
                onPress={() => handleStatusChange(status)}
                disabled={isSubmitting}
              >
                <Text
                  style={[styles.chipText, invoice.status === status && styles.chipTextActive]}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {invoice.type === "Devis" && (
          <GradientButton
            title="Envoyer au client"
            onPress={handleSendToClient}
            loading={isSubmitting}
          />
        )}

        {invoice.type === "Devis" && invoice.status === "Accepté" && !invoice.convertedToInvoice && (
          <GradientButton
            title="Convertir en facture"
            onPress={handleConvert}
            loading={isSubmitting}
            colors={[colors.green, "#16a34a", colors.primary]}
            style={{ marginTop: 12 }}
          />
        )}

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Supprimer ce document</Text>
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
  itemRow: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 8,
  },
  itemDesc: { fontSize: 13, fontFamily: "Manrope_700Bold", color: colors.textDark },
  itemMeta: { fontSize: 12, fontFamily: "Manrope_400Regular", color: colors.textMuted, marginTop: 4 },
  totalsBox: {
    backgroundColor: colors.textDark,
    borderRadius: radii.lg,
    padding: 16,
    marginTop: 8,
  },
  totalsLabel: { fontSize: 13, fontFamily: "Manrope_400Regular", color: "#cfe9f2" },
  totalsValue: { fontSize: 13, fontFamily: "Manrope_600SemiBold", color: "#fff" },
  totalLabel: { fontSize: 14, fontFamily: "Manrope_700Bold", color: "#fff" },
  totalValue: { fontSize: 16, fontFamily: "BarlowCondensed_700Bold", color: "#fff" },
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
  deleteButton: { alignItems: "center", paddingVertical: 14, marginTop: 16 },
  deleteButtonText: { color: colors.error, fontFamily: "Manrope_700Bold", fontSize: 14 },
  error: { color: colors.error, fontFamily: "Manrope_600SemiBold", marginBottom: 12, textAlign: "center" },
  info: { color: colors.green, fontFamily: "Manrope_600SemiBold", marginBottom: 12, textAlign: "center" },
});
