import { StyleSheet, Text, View, TextInput, Pressable, FlatList, Platform, ActivityIndicator } from "react-native";
import { useState, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Image } from "expo-image";
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { formatCurrency, formatBSR, type ProductData } from "@/lib/mock-data";
import { searchProductsAPI, lookupProductByASIN, lookupProductByUPC } from "@/lib/api";

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductData[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const q = query.trim();
      const byAsin = await lookupProductByASIN(q);
      if (byAsin) { setResults([byAsin]); setSearched(true); setLoading(false); return; }
      const byBarcode = await lookupProductByUPC(q);
      if (byBarcode) { setResults([byBarcode]); setSearched(true); setLoading(false); return; }
      const searchResults = await searchProductsAPI(q);
      setResults(searchResults);
      setSearched(true);
    } catch (err) {
      console.warn("Search error:", err);
      setResults([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const renderResult = useCallback(({ item }: { item: ProductData }) => {
    const hasAlerts = item.isHazmat || item.isGated || item.hasIPComplaints || item.isOversized;
    return (
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push({ pathname: "/product/[asin]", params: { asin: item.asin } });
        }}
        style={({ pressed }) => [styles.resultCard, pressed && { opacity: 0.9 }]}
      >
        <View style={styles.resultImageWrap}>
          <Image source={{ uri: item.imageUrl }} style={styles.resultImage} contentFit="contain" />
        </View>
        <View style={styles.resultInfo}>
          <Text style={styles.resultTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.resultMeta}>
            <Text style={styles.resultPrice}>{formatCurrency(item.buyBoxPrice)}</Text>
            <View style={styles.bsrPill}>
              <Text style={styles.bsrPillText}>#{formatBSR(item.categoryRank)}</Text>
            </View>
            {hasAlerts && (
              <View style={styles.alertPill}>
                <Feather name="alert-triangle" size={10} color={Colors.light.warning} />
              </View>
            )}
          </View>
          <Text style={styles.resultAsin}>ASIN: {item.asin}</Text>
        </View>
        <Feather name="chevron-right" size={16} color={Colors.light.textTertiary} />
      </Pressable>
    );
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.headerArea}>
        <View style={styles.searchRow}>
          <View style={styles.searchWrap}>
            <Feather name="search" size={16} color={Colors.light.textTertiary} />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="ASIN, UPC, or product name"
              placeholderTextColor={Colors.light.textTertiary}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {query.length > 0 && (
              <Pressable onPress={() => { setQuery(""); setResults([]); setSearched(false); }}>
                <Feather name="x" size={16} color={Colors.light.textTertiary} />
              </Pressable>
            )}
          </View>
          <Pressable onPress={handleSearch} style={({ pressed }) => [styles.searchBtn, pressed && { opacity: 0.85 }]}>
            <Text style={styles.searchBtnText}>Search</Text>
          </Pressable>
        </View>

        <View style={styles.quickChips}>
          <Text style={styles.quickLabel}>Try:</Text>
          {["B0CXLR7LKY", "B09V3KXJPB", "B0D7C56X19", "Apple"].map((q) => (
            <Pressable
              key={q}
              onPress={() => { setQuery(q); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              style={({ pressed }) => [styles.chip, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.chipText}>{q}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="small" color={Colors.light.accent} />
          <Text style={styles.emptyText}>Searching...</Text>
        </View>
      ) : searched && results.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="search" size={32} color={Colors.light.textTertiary} />
          <Text style={styles.emptyTitle}>No Results</Text>
          <Text style={styles.emptyText}>Try a different ASIN, UPC, or keyword</Text>
        </View>
      ) : !searched ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="barcode-scan" size={40} color={Colors.light.textTertiary} />
          <Text style={styles.emptyTitle}>Search Products</Text>
          <Text style={styles.emptyText}>Enter an ASIN, UPC, or product name to analyze profitability</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.asin}
          renderItem={renderResult}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  headerArea: {
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  searchRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  searchWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surfaceElevated,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: 10,
    gap: 8,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
    padding: 0,
  },
  searchBtn: {
    backgroundColor: Colors.light.accent,
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
  },
  searchBtnText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  quickChips: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  quickLabel: {
    fontSize: 11,
    color: Colors.light.textTertiary,
  },
  chip: {
    backgroundColor: Colors.light.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  chipText: {
    fontSize: 10,
    color: Colors.light.textSecondary,
    fontWeight: "500" as const,
  },
  resultsList: {
    padding: 12,
    gap: 8,
  },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 10,
  },
  resultImageWrap: {
    width: 52,
    height: 52,
    borderRadius: 6,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    justifyContent: "center",
    alignItems: "center",
  },
  resultImage: {
    width: 44,
    height: 44,
  },
  resultInfo: {
    flex: 1,
    gap: 3,
  },
  resultTitle: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.text,
    lineHeight: 17,
  },
  resultMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  resultPrice: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  bsrPill: {
    backgroundColor: Colors.light.accentDim,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  bsrPillText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: Colors.light.accent,
  },
  alertPill: {
    backgroundColor: Colors.light.warningDim,
    padding: 3,
    borderRadius: 3,
  },
  resultAsin: {
    fontSize: 10,
    color: Colors.light.textTertiary,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginTop: 4,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.light.textTertiary,
    textAlign: "center",
    lineHeight: 18,
  },
});
