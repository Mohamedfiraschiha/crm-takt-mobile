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
import { deleteTresorerieEntry, getTresorerieEntries } from "../../api/finance";
import { getErrorMessage } from "../../api/errors";
import { colors, radii } from "../../theme/colors";
import ScreenHeader from "../../components/ScreenHeader";

const TYPE_COLORS = { Entrée: colors.green, Sortie: colors.error, Ajustement: colors.yellow };

const formatCurrency = (amount) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
    Number(amount || 0),
  );

function Card({ item, onPress, onDelete }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <Text style={styles.amount}>{formatCurrency(item.montant)}</Text>
        <View style={[styles.badge, { backgroundColor: TYPE_COLORS[item.type] || colors.textMuted }]}>
          <Text style={styles.badgeText}>{item.type}</Text>
        </View>
      </View>
      <Text style={styles.meta}>{item.categorie}</Text>
      {!!item.description && <Text style={styles.meta}>{item.description}</Text>}
      <Text style={styles.date}>{dayjs(item.date).format("D MMM YYYY")}</Text>
      <TouchableOpacity onPress={onDelete} style={styles.deleteRow}>
        <Text style={styles.deleteIcon}>Supprimer</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function TresorerieScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const result = await getTresorerieEntries();
      setItems(result.entries);
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

  const handleDelete = (id) => {
    Alert.alert("Supprimer cette entrée ?", "Cette action est définitive.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTresorerieEntry(id);
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
        title="Trésorerie / Caisse"
        onBackPress={() => navigation.goBack()}
        actions={[{ icon: "＋", onPress: () => navigation.navigate("TresorerieForm", {}) }]}
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
            <Card item={item} onPress={() => navigation.navigate("TresorerieForm", { id: item._id })} onDelete={() => handleDelete(item._id)} />
          )}
          ListEmptyComponent={<Text style={styles.empty}>Aucune entrée.</Text>}
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
  amount: { fontSize: 18, fontFamily: "BarlowCondensed_700Bold", color: colors.textDark },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: "#fff", fontSize: 11, fontFamily: "Manrope_700Bold" },
  meta: { fontSize: 13, fontFamily: "Manrope_400Regular", color: colors.textMuted, marginTop: 4 },
  date: { fontSize: 12, fontFamily: "Manrope_400Regular", color: colors.textMuted, marginTop: 6 },
  deleteRow: { marginTop: 10 },
  deleteIcon: { color: colors.error, fontSize: 12, fontFamily: "Manrope_700Bold" },
  error: { color: colors.error, fontFamily: "Manrope_600SemiBold", marginBottom: 12, textAlign: "center" },
  empty: { textAlign: "center", color: colors.textMuted, fontFamily: "Manrope_400Regular", marginTop: 40 },
});
