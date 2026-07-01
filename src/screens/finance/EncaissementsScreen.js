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
import { deleteEncaissement, getEncaissements } from "../../api/finance";
import { getErrorMessage } from "../../api/errors";
import { colors, radii } from "../../theme/colors";
import ScreenHeader from "../../components/ScreenHeader";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
    Number(amount || 0),
  );

function Card({ item, onPress, onDelete }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <Text style={styles.amount}>{formatCurrency(item.montant)}</Text>
        <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.deleteIcon}>✕</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.meta}>{item.categorie} · {item.modePaiement}</Text>
      {!!item.client?.entreprise && <Text style={styles.meta}>{item.client.entreprise}</Text>}
      <Text style={styles.date}>{dayjs(item.date).format("D MMM YYYY")}</Text>
    </TouchableOpacity>
  );
}

export default function EncaissementsScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const result = await getEncaissements();
      setItems(result.encaissements);
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
    Alert.alert("Supprimer cet encaissement ?", "Cette action est définitive.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteEncaissement(id);
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
        title="Encaissements"
        onBackPress={() => navigation.goBack()}
        actions={[{ icon: "＋", onPress: () => navigation.navigate("EncaissementForm", {}) }]}
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
            <Card item={item} onPress={() => navigation.navigate("EncaissementForm", { id: item._id })} onDelete={() => handleDelete(item._id)} />
          )}
          ListEmptyComponent={<Text style={styles.empty}>Aucun encaissement.</Text>}
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
  amount: { fontSize: 18, fontFamily: "BarlowCondensed_700Bold", color: colors.green },
  deleteIcon: { color: colors.error, fontSize: 16, fontFamily: "Manrope_700Bold" },
  meta: { fontSize: 13, fontFamily: "Manrope_400Regular", color: colors.textMuted, marginTop: 4 },
  date: { fontSize: 12, fontFamily: "Manrope_400Regular", color: colors.textMuted, marginTop: 6 },
  error: { color: colors.error, fontFamily: "Manrope_600SemiBold", marginBottom: 12, textAlign: "center" },
  empty: { textAlign: "center", color: colors.textMuted, fontFamily: "Manrope_400Regular", marginTop: 40 },
});
