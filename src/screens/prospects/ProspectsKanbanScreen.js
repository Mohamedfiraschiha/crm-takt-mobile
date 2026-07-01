import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { getDeals, updateDealStage } from "../../api/deals";
import { getErrorMessage } from "../../api/errors";
import { colors, radii } from "../../theme/colors";
import ScreenHeader from "../../components/ScreenHeader";

const STAGES = ["Prospect", "Qualification", "Proposition", "Négociation", "Gagné", "Perdu"];

const STAGE_COLORS = {
  Prospect: colors.textMuted,
  Qualification: colors.indigo,
  Proposition: colors.primary,
  Négociation: colors.yellow,
  Gagné: colors.green,
  Perdu: colors.error,
};

const COLUMN_WIDTH = 220;

const formatCurrency = (amount) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

function DealCard({ deal, columnLayouts, scrollX, onDropStage, onOpen, disabled }) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(0);

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .activateAfterLongPress(180)
    .onStart(() => {
      isDragging.value = 1;
    })
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      const layouts = columnLayouts.value;
      const sx = scrollX.value;
      let targetStage = deal.stage;
      for (const stage of STAGES) {
        const layout = layouts[stage];
        if (!layout) continue;
        const screenStart = layout.x - sx;
        const screenEnd = screenStart + layout.width;
        if (e.absoluteX >= screenStart && e.absoluteX < screenEnd) {
          targetStage = stage;
          break;
        }
      }
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      isDragging.value = 0;
      if (targetStage !== deal.stage) {
        runOnJS(onDropStage)(deal._id, targetStage);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    zIndex: isDragging.value ? 100 : 1,
    elevation: isDragging.value ? 10 : 2,
    opacity: isDragging.value ? 0.92 : 1,
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <TouchableOpacity onPress={() => onOpen(deal._id)} activeOpacity={0.85}>
          <Text style={styles.cardTitle}>{deal.title}</Text>
          <Text style={styles.cardCompany}>{deal.company}</Text>
          <Text style={styles.cardAmount}>{formatCurrency(deal.amount)}</Text>
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
}

export default function ProspectsKanbanScreen({ navigation }) {
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const columnLayouts = useSharedValue({});
  const scrollX = useSharedValue(0);

  const load = useCallback(async () => {
    setError("");
    try {
      const result = await getDeals({ limit: 200 });
      setDeals(result.deals);
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

  const dealsByStage = useMemo(() => {
    const map = {};
    STAGES.forEach((stage) => {
      map[stage] = deals.filter((d) => d.stage === stage);
    });
    return map;
  }, [deals]);

  const handleDropStage = useCallback(
    async (dealId, targetStage) => {
      setDeals((prev) =>
        prev.map((d) => (d._id === dealId ? { ...d, stage: targetStage } : d)),
      );
      setIsUpdating(true);
      try {
        await updateDealStage(dealId, targetStage);
      } catch (err) {
        setError(getErrorMessage(err));
        await load();
      } finally {
        setIsUpdating(false);
      }
    },
    [load],
  );

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Pipeline (Kanban)" onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="Pipeline (Kanban)"
        onBackPress={() => navigation.goBack()}
        actions={[{ label: "Vue liste", onPress: () => navigation.navigate("ProspectsList") }]}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.board}
      >
        {STAGES.map((stage) => (
          <View
            key={stage}
            style={styles.column}
            onLayout={(e) => {
              const { x, width } = e.nativeEvent.layout;
              columnLayouts.value = { ...columnLayouts.value, [stage]: { x, width } };
            }}
          >
            <View style={[styles.columnHeader, { borderTopColor: STAGE_COLORS[stage] }]}>
              <Text style={styles.columnTitle}>{stage}</Text>
              <Text style={styles.columnCount}>{dealsByStage[stage].length}</Text>
            </View>
            <ScrollView style={styles.columnBody} showsVerticalScrollIndicator={false}>
              {dealsByStage[stage].map((deal) => (
                <DealCard
                  key={deal._id}
                  deal={deal}
                  columnLayouts={columnLayouts}
                  scrollX={scrollX}
                  onDropStage={handleDropStage}
                  onOpen={(id) => navigation.navigate("ProspectDetail", { id })}
                  disabled={isUpdating}
                />
              ))}
              {!dealsByStage[stage].length && (
                <Text style={styles.empty}>Aucun deal</Text>
              )}
            </ScrollView>
          </View>
        ))}
      </Animated.ScrollView>
      <Text style={styles.hint}>
        Maintenez une carte puis glissez-la vers une autre colonne pour changer son étape.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  board: { paddingHorizontal: 12, paddingTop: 12 },
  column: {
    width: COLUMN_WIDTH,
    marginRight: 12,
  },
  columnHeader: {
    borderTopWidth: 3,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  columnTitle: { fontFamily: "Manrope_700Bold", fontSize: 13, color: colors.textDark },
  columnCount: { fontFamily: "Manrope_600SemiBold", fontSize: 12, color: colors.textMuted },
  columnBody: { maxHeight: "100%" },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 10,
  },
  cardTitle: { fontFamily: "Manrope_700Bold", fontSize: 13, color: colors.textDark },
  cardCompany: { fontFamily: "Manrope_400Regular", fontSize: 12, color: colors.textMuted, marginTop: 4 },
  cardAmount: { fontFamily: "BarlowCondensed_700Bold", fontSize: 14, color: colors.textDark, marginTop: 6 },
  empty: { fontFamily: "Manrope_400Regular", fontSize: 12, color: colors.textMuted, textAlign: "center", marginTop: 12 },
  error: { color: colors.error, fontFamily: "Manrope_600SemiBold", textAlign: "center", paddingVertical: 8 },
  hint: {
    fontFamily: "Manrope_400Regular",
    fontSize: 11,
    color: colors.textMuted,
    textAlign: "center",
    paddingVertical: 10,
  },
});
