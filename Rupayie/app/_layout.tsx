
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";
import { UserDetailsProvider } from "@/context/user";
import { AnalyticsProvider } from "@/context/analytics";
import { TransactionsCategoryProvider } from "@/context/transCategory";
import { TransactionImageProvider } from "@/context/image";
import { TransactionsProvider } from "@/context/transactions";
import { CategoryProvider } from "@/context/categories";
import { RecurringTransProvider } from "@/context/recurringTransactions";
import { TranshProvider } from "@/context/trash";
import { SearchProvider } from "@/context/search";
import { ProfileProvider } from "@/context/profilePhoto";
import { NotificationProvider } from "@/context/notification";
import { PeopleProvider } from "@/context/people";
import { BudgetProvider } from "@/context/budget";
import { FilterByDateProvider } from "@/context/filterTransByDate";
import { LoginProvider } from "@/context/login";
import { AuthProvider } from "@/context/auth";
import { MessagesProvider } from "@/context/messages";
import { ExportTransactionsProvider } from "@/context/exportTransactions";
import { ConnectionProvider } from "@/context/connection";
import { SharedLinksProvider } from "@/context/sharedLinks";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <UserDetailsProvider>
        <AnalyticsProvider>
          <TransactionsCategoryProvider>
            <TransactionImageProvider>
              <TransactionsProvider>
                <RecurringTransProvider>
                  <CategoryProvider>
                    <TranshProvider>
                      <SearchProvider>
                        <ProfileProvider>
                          <NotificationProvider>
                            <PeopleProvider>
                              <BudgetProvider>
                                <FilterByDateProvider>
                                  <LoginProvider>
                                    <AuthProvider>
                                      <MessagesProvider>
                                        <ExportTransactionsProvider>
                                          <ConnectionProvider>
                                            <SharedLinksProvider>
                                              <Stack
                                                screenOptions={{
                                                  animation: "fade_from_bottom",
                                                }}
                                              >
                                                <Stack.Screen
                                                  name="(tabs)"
                                                  options={{ headerShown: false }}
                                                />
                                                <Stack.Screen
                                                  name="modal"
                                                  options={{ presentation: "modal" }}
                                                />
                                                <Stack.Screen
                                                  name="categories"
                                                  options={{ title: "Your Categories" }}
                                                />
                                                <Stack.Screen
                                                  name="recurrings"
                                                  options={{ title: "Your Recurrings" }}
                                                />
                                                <Stack.Screen
                                                  name="trash"
                                                  options={{ title: "Your Trash" }}
                                                />
                                                <Stack.Screen
                                                  name="search"
                                                  options={{
                                                    title: "Search Transaction",
                                                  }}
                                                />
                                                <Stack.Screen
                                                  name="notification"
                                                  options={{
                                                    title: "Your Notifications",
                                                  }}
                                                />
                                                <Stack.Screen
                                                  name="people"
                                                  options={{ title: "Your People" }}
                                                />
                                                <Stack.Screen
                                                  name="profile"
                                                  options={{ title: "Your Profile" }}
                                                />
                                                <Stack.Screen
                                                  name="login"
                                                  options={{ headerShown: false }}
                                                />
                                                <Stack.Screen
                                                  name="addBudget"
                                                  options={{ title: "Add Budget" }}
                                                />
                                                <Stack.Screen
                                                  name="readBudget"
                                                  options={{ title: "Budget Analysis" }}
                                                />
                                                <Stack.Screen
                                                  name="editBudget"
                                                  options={{
                                                    title: "Edit Budget",
                                                    // headerShown: false,
                                                  }}
                                                />
                                                <Stack.Screen
                                                  name="categoryTransactions"
                                                  options={{ title: "Your Transactions" }}
                                                />
                                                <Stack.Screen
                                                  name="typeDonut"
                                                  options={{ title: "Your Transactions" }}
                                                />
                                                <Stack.Screen
                                                  name="settings"
                                                  options={{ title: "Settings" }}
                                                />
                                              </Stack>
                                            </SharedLinksProvider>
                                          </ConnectionProvider>
                                        </ExportTransactionsProvider>
                                      </MessagesProvider>
                                    </AuthProvider>
                                  </LoginProvider>
                                </FilterByDateProvider>
                              </BudgetProvider>
                            </PeopleProvider>
                          </NotificationProvider>
                        </ProfileProvider>
                      </SearchProvider>
                    </TranshProvider>
                  </CategoryProvider>
                </RecurringTransProvider>
              </TransactionsProvider>
            </TransactionImageProvider>
          </TransactionsCategoryProvider>
        </AnalyticsProvider>
      </UserDetailsProvider>
    </ThemeProvider >
  );
}
