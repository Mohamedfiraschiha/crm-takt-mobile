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
import { deleteSupplier, getSuppliers } from "../../api/finance";
import { getErrorMessage } from "../../api/errors";
import { colors, radii } from "../../theme/colors";
import ScreenHeader from "../../components/ScreenHeader";

function SupplierCard({ supplier, onPress, onDelete }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{supplier.name}</Text>
        <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.deleteIcon}>✕</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.meta}>{supplier.contactPerson}</Text>
      <Text style={styles.meta}>{supplier.email}</Text>
      <Text style={styles.terms}>Conditions : {supplier.paymentTerms}</Text>
    </TouchableOpacity>
  );
}

export default function SuppliersScreen({ navigation }) {
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const result = await getSuppliers();
      setSuppliers(result.suppliers);
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
    Alert.alert("Supprimer ce fournisseur ?", "Cette action est définitive.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteSupplier(id);
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
        title="Fournisseurs"
        onBackPress={() => navigation.goBack()}
        actions={[{ icon: "＋", onPress: () => navigation.navigate("SupplierForm", {}) }]}
      />
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.content}
          data={suppliers}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
          ListHeaderComponent={!!error && <Text style={styles.error}>{error}</Text>}
          renderItem={({ item }) => (
            <SupplierCard
              supplier={item}
              onPress={() => navigation.navigate("SupplierForm", { id: item._id })}
              onDelete={() => handleDelete(item._id)}
            />
          )}
          ListEmptyComponent={<Text style={styles.empty}>Aucun fournisseur.</Text>}
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
  title: { fontSize: 15, fontFamily: "Manrope_700Bold", color: colors.textDark },
  deleteIcon: { color: colors.error, fontSize: 16, fontFamily: "Manrope_700Bold" },
  meta: { fontSize: 13, fontFamily: "Manrope_400Regular", color: colors.textMuted, marginTop: 4 },
  terms: { fontSize: 12, fontFamily: "Manrope_600SemiBold", color: colors.primary, marginTop: 8 },
  error: { color: colors.error, fontFamily: "Manrope_600SemiBold", marginBottom: 12, textAlign: "center" },
  empty: { textAlign: "center", color: colors.textMuted, fontFamily: "Manrope_400Regular", marginTop: 40 },
});
