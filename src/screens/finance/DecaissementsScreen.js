import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import dayjs from "dayjs";
import { useAuth } from "../../context/AuthContext";
import { deleteDecaissement, getDecaissements, validateDecaissement } from "../../api/finance";
import { getErrorMessage } from "../../api/errors";
import { colors, radii } from "../../theme/colors";
import ScreenHeader from "../../components/ScreenHeader";

const ADMIN_ROLES = ["super_admin", "administrateur", "manager"];

const STATUS_STYLES = {
  en_attente: { label: "En attente", color: colors.yellow },
  approuve: { label: "Approuvé", color: colors.green },
  refuse: { label: "Refusé", color: colors.error },
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
    Number(amount || 0),
  );

function Card({ item, onPress, onDelete, onDecide, canValidate }) {
  const status = STATUS_STYLES[item.status] || { label: item.status, color: colors.textMuted };
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <Text style={styles.amount}>{formatCurrency(item.montant)}</Text>
        <View style={[styles.badge, { backgroundColor: status.color }]}>
          <Text style={styles.badgeText}>{status.label}</Text>
        </View>
      </View>
      <Text style={styles.meta}>{item.categorie} · {item.modePaiement}</Text>
      {!!item.beneficiaire && <Text style={styles.meta}>{item.beneficiaire}</Text>}
      <Text style={styles.date}>{dayjs(item.date).format("D MMM YYYY")}</Text>

      {canValidate && item.status === "en_attente" && (
        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.actionButton, styles.approveButton]} onPress={() => onDecide(item._id, "approuve")}>
            <Text style={styles.actionText}>Approuver</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.refuseButton]} onPress={() => onDecide(item._id, "refuse")}>
            <Text style={styles.actionText}>Refuser</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity onPress={onDelete} style={styles.deleteRow}>
        <Text style={styles.deleteIcon}>Supprimer</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function DecaissementsScreen({ navigation }) {
  const { user } = useAuth();
  const canValidate = ADMIN_ROLES.includes(user?.role);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const result = await getDecaissements();
      setItems(result.decaissements);
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

  const handleDecide = async (id, status) => {
    setError("");
    try {
      await validateDecaissement(id, status);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Supprimer ce décaissement ?", "Cette action est définitive.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDecaissement(id);
            await load();
          } catch (err) {
            setError(getErrorMessage(err));
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="Décaissements"
        onBackPress={() => navigation.goBack()}
        actions={[{ icon: "＋", onPress: () => navigation.navigate("DecaissementForm", {}) }]}
      />
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.content}
          data={items}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
          ListHeaderComponent={!!error && <Text style={styles.error}>{error}</Text>}
          renderItem={({ item }) => (
            <Card
              item={item}
              onPress={() => navigation.navigate("DecaissementForm", { id: item._id })}
              onDelete={() => handleDelete(item._id)}
              onDecide={handleDecide}
              canValidate={canValidate}
            />
          )}
          ListEmptyComponent={<Text style={styles.empty}>Aucun décaissement.</Text>}
        />
      )}
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
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  amount: { fontSize: 18, fontFamily: "BarlowCondensed_700Bold", color: colors.error },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: "#fff", fontSize: 11, fontFamily: "Manrope_700Bold" },
  meta: { fontSize: 13, fontFamily: "Manrope_400Regular", color: colors.textMuted, marginTop: 4 },
  date: { fontSize: 12, fontFamily: "Manrope_400Regular", color: colors.textMuted, marginTop: 6 },
  actionsRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  actionButton: { flex: 1, borderRadius: radii.md, paddingVertical: 10, alignItems: "center" },
  approveButton: { backgroundColor: colors.green },
  refuseButton: { backgroundColor: colors.error },
  actionText: { color: "#fff", fontFamily: "Manrope_700Bold", fontSize: 13 },
  deleteRow: { marginTop: 10 },
  deleteIcon: { color: colors.error, fontSize: 12, fontFamily: "Manrope_700Bold" },
  error: { color: colors.error, fontFamily: "Manrope_600SemiBold", marginBottom: 12, textAlign: "center" },
  empty: { textAlign: "center", color: colors.textMuted, fontFamily: "Manrope_400Regular", marginTop: 40 },
});
