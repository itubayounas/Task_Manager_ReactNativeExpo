import { LogBox } from "react-native";
import { AuthProvider } from "./src/context/AuthContext";
import AppNavigator from "./src/navigation/AppNavigator";

LogBox.ignoreLogs([
  "expo-notifications",
  "`expo-notifications`",
]);

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}