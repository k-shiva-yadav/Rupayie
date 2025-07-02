import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { Text, View } from "../Themed";
import { useColorScheme } from "@/components/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import formatDateTimeSimple from "@/utils/formatDateTimeSimple";
import { useUserData } from "@/context/user";
import { Link } from "expo-router";
import { formatAmount } from "@/utils/formatAmount";

const RecentTransFlatList = () => {
  const colorScheme = useColorScheme();
  const placeholderColor = colorScheme === "dark" ? "#3D3D3D" : "#c4c4c4";

  const { recentTransactions, currencyObj, loadingUserDetails } = useUserData();

  const renderNotificationItem = ({
    item,
  }: {
    item: (typeof recentTransactions)[0];
  }) => (
    <View style={styles.transactionCard}>
      <View style={styles.flex_row_btw}>
        <SafeAreaView style={styles.flex_row}>
          <View
            style={[
              styles.categoryIndicator,
              { backgroundColor: item.category.hexColor },
            ]}
          />
          <Text numberOfLines={1} style={styles.text}>
            {item.category.name.length > 12
              ? `${item.category.name.slice(0, 12)}...`
              : item.category.name}{" "}
          </Text>
        </SafeAreaView>

        <Text
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: item.category.sign === "+" ? "#28A745" : "#FC0820",
          }}
        >
          {formatAmount(item.amount, currencyObj)}
          {item.category.sign === "+" ? (
            <Ionicons name="arrow-down" />
          ) : (
            <Ionicons name="arrow-up" />
          )}
        </Text>
      </View>

      <Text style={styles.createdAtText}>
        {formatDateTimeSimple(item.createdAt)}
      </Text>
    </View>
  );

  return !loadingUserDetails && recentTransactions.length >= 1 ? (
    <View style={styles.container}>
      <View style={styles.flex_row_btw}>
        <Text style={styles.header}>Recent Transactions</Text>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: colorScheme == "dark" ? "#000" : "#fff" },
          ]}
        >
          <Link href="/(tabs)/two">
            <Text style={styles.buttonText}>See All</Text>
          </Link>
        </TouchableOpacity>
      </View>

      <FlatList
        data={recentTransactions}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderNotificationItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 15 }}
        ItemSeparatorComponent={() => <SafeAreaView style={{ width: 10 }} />}
      />
    </View>
  ) : (
    loadingUserDetails && (
      <>
        <SafeAreaView style={[styles.flex_row_btw, { marginBottom: 20 }]}>
          <View
            style={{
              width: 170,
              height: 25,
              backgroundColor: placeholderColor,
              borderRadius: 5,
            }}
          />
          <View
            style={{
              width: 70,
              height: 25,
              backgroundColor: placeholderColor,
              borderRadius: 15,
            }}
          />
        </SafeAreaView>

        <SafeAreaView
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <FlatList
            data={Array.from({ length: 2 })}
            keyExtractor={(_, index) => index.toString()}
            horizontal
            renderItem={() => (
              <View
                style={[
                  styles.cardSkeleton,
                  { backgroundColor: placeholderColor },
                ]}
              />
            )}
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <SafeAreaView style={{ width: 10 }} />}
          />
        </SafeAreaView>
      </>
    )
  );
};

export default RecentTransFlatList;

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    backgroundColor: "transaparent",
  },
  header: {
    fontSize: 18,
    fontWeight: 500,
  },
  button: {
    paddingHorizontal: 15,
    paddingVertical: 4,
    borderRadius: 30,
  },
  buttonText: {
    fontWeight: 500,
  },
  flex_row_btw: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "transparent",
  },
  flex_row: {
    gap: 7,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  transactionCard: {
    width: 240,
    padding: 15,
    borderRadius: 10,
  },
  createdAtText: {
    fontSize: 10,
    textAlign: "right",
    marginTop: 7,
  },
  text: {
    fontSize: 14,
  },
  categoryIndicator: {
    width: 10,
    height: 10,
    borderRadius: 20,
  },
  cardSkeleton: {
    width: 240,
    height: 65,
    borderRadius: 10,
  },
});
