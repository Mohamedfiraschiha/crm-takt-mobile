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
import { deleteBankAccount, getBankAccounts } from "../../api/finance";
import { getErrorMessage } from "../../api/errors";
import { colors, radii } from "../../theme/colors";
import ScreenHeader from "../../components/ScreenHeader";

const formatCurrency = (amount, currency) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: /^[A-Za-z]{3}$/.test(currency) ? currency : "EUR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

function AccountCard({ account, onPress, onDelete }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{account.name}</Text>
        <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.deleteIcon}>✕</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.bank}>{account.bankName}</Text>
      <Text style={styles.balance}>
        {formatCurrency(account.currentBalance, account.currency)}
      </Text>
      {!account.isActive && <Text style={styles.inactive}>Inactif</Text>}
    </TouchableOpacity>
  );
}

export default function BankAccountsScreen({ navigation }) {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const result = await getBankAccounts();
      setAccounts(result.comptes);
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
    Alert.alert("Supprimer ce compte ?", "Cette action est définitive.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteBankAccount(id);
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
        title="Comptes bancaires"
        onBackPress={() => navigation.goBack()}
        actions={[{ icon: "＋", onPress: () => navigation.navigate("BankAccountForm", {}) }]}
      />
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.content}
          data={accounts}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
          ListHeaderComponent={!!error && <Text style={styles.error}>{error}</Text>}
          renderItem={({ item }) => (
            <AccountCard
              account={item}
              onPress={() => navigation.navigate("BankAccountForm", { id: item._id })}
              onDelete={() => handleDelete(item._id)}
            />
          )}
          ListEmptyComponent={<Text style={styles.empty}>Aucun compte bancaire.</Text>}
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
  bank: { fontSize: 13, fontFamily: "Manrope_400Regular", color: colors.textMuted, marginTop: 4 },
  balance: { fontSize: 18, fontFamily: "BarlowCondensed_700Bold", color: colors.textDark, marginTop: 8 },
  inactive: { fontSize: 11, fontFamily: "Manrope_600SemiBold", color: colors.error, marginTop: 6 },
  error: { color: colors.error, fontFamily: "Manrope_600SemiBold", marginBottom: 12, textAlign: "center" },
  empty: { textAlign: "center", color: colors.textMuted, fontFamily: "Manrope_400Regular", marginTop: 40 },
});
