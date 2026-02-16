import { StyleSheet, Text, View, TextInput, Pressable, FlatList, Platform, ActivityIndicator } from "react-native";
import { useState, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Image } from "expo-image";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { searchProducts, lookupByAsin, lookupByBarcode, formatCurrency, formatBSR, type ProductData } from "@/lib/mock-data";

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductData[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const handleSearch = useCallback(() => {
    if (!query.trim()) return;
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setTimeout(() => {
      const q = query.trim();
      const byAsin = lookupByAsin(q);
      if (byAsin) {
        setResults([byAsin]);
        setSearched(true);
        setLoading(false);
        return;
      }

      const byBarcode = lookupByBarcode(q);
      if (byBarcode) {
        setResults([byBarcode]);
        setSearched(true);
        setLoading(false);
        return;
      }

      const searchResults = searchProducts(q);
      setResults(searchResults);
      setSearched(true);
      setLoading(false);
    }, 400);
  }, [query]);

  const renderResult = useCallback(({ item }: { item: ProductData }) => (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push({ pathname: "/product/[asin]", params: { asin: item.asin } });
      }}
      style={({ pressed }) => [styles.resultCard, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
    >
      <View style={styles.resultImageWrap}>
        <Image source={{ uri: item.imageUrl }} style={styles.resultImage} contentFit="contain" />
      </View>
      <View style={styles.resultInfo}>
        <Text style={styles.resultBrand}>{item.brand}</Text>
        <Text style={styles.resultTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.resultMeta}>
          <Text style={styles.resultPrice}>{formatCurrency(item.buyBoxPrice)}</Text>
          <View style={styles.resultBsr}>
            <Text style={styles.resultBsrText}>BSR #{formatBSR(item.categoryRank)}</Text>
          </View>
        </View>
      </View>
      <Feather name="chevron-right" size={18} color={Colors.dark.textTertiary} />
    </Pressable>
  ), []);

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.headerSection}>
        <Text style={styles.screenTitle}>Search</Text>
        <View style={styles.searchRow}>
          <View style={styles.searchInputWrap}>
            <Feather name="search" size={18} color={Colors.dark.textTertiary} />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="ASIN, UPC, or product name..."
              placeholderTextColor={Colors.dark.textTertiary}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {query.length > 0 && (
              <Pressable onPress={() => { setQuery(""); setResults([]); setSearched(false); }}>
                <Feather name="x-circle" size={18} color={Colors.dark.textTertiary} />
              </Pressable>
            )}
          </View>
          <Pressable onPress={handleSearch} style={({ pressed }) => [styles.searchBtn, pressed && { opacity: 0.8 }]}>
            <Feather name="arrow-right" size={20} color={Colors.dark.background} />
          </Pressable>
        </View>

        <View style={styles.quickLinks}>
          {["B0CXLR7LKY", "B09V3KXJPB", "B0CHX3QBCH", "B0D7C56X19"].map((asin) => (
            <Pressable
              key={asin}
              onPress={() => {
                setQuery(asin);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={({ pressed }) => [styles.quickChip, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.quickChipText}>{asin}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={Colors.dark.tint} />
          <Text style={styles.emptyText}>Searching...</Text>
        </View>
      ) : searched && results.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="search" size={40} color={Colors.dark.textTertiary} />
          <Text style={styles.emptyTitle}>No Results Found</Text>
          <Text style={styles.emptyText}>Try a different ASIN, UPC, or search term</Text>
        </View>
      ) : !searched ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="barcode-scan" size={48} color={Colors.dark.textTertiary} />
          <Text style={styles.emptyTitle}>Look Up Products</Text>
          <Text style={styles.emptyText}>Search by ASIN, UPC barcode, or product name to analyze profitability</Text>
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
    backgroundColor: Colors.dark.background,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: Colors.dark.text,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  searchRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    paddingHorizontal: 14,
    gap: 10,
    height: 50,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.dark.text,
    padding: 0,
  },
  searchBtn: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: Colors.dark.tint,
    justifyContent: "center",
    alignItems: "center",
  },
  quickLinks: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  quickChip: {
    backgroundColor: Colors.dark.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  quickChipText: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    fontWeight: "500" as const,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
  },
  resultsList: {
    padding: 20,
    gap: 10,
  },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 12,
  },
  resultImageWrap: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  resultImage: {
    width: 50,
    height: 50,
  },
  resultInfo: {
    flex: 1,
    gap: 4,
  },
  resultBrand: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: Colors.dark.tint,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  resultTitle: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.dark.text,
    lineHeight: 18,
  },
  resultMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  resultPrice: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.dark.text,
  },
  resultBsr: {
    backgroundColor: Colors.dark.accentDim,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  resultBsrText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: Colors.dark.accent,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.dark.text,
    marginTop: 6,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.dark.textTertiary,
    textAlign: "center",
    lineHeight: 20,
  },
});
