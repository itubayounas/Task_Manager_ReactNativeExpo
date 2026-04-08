import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  collection, query, where,
  onSnapshot, doc, updateDoc,
  deleteDoc, orderBy,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { auth, db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import Toast from "../components/Toast";
import useToast from "../hooks/useToast";

const CATEGORIES = ["All", "Personal", "Work", "Study"];

const isTaskOverdue = (task) => {
  if (task.status === "completed") return false;
  if (!task.dueDateISO) return false;
  const due = new Date(task.dueDateISO);
  due.setHours(23, 59, 59, 999);
  return due < new Date();
};

const categoryColors = {
  Personal: { bg: "#ede9fe", text: "#7c3aed" },
  Work:     { bg: "#dbeafe", text: "#1d4ed8" },
  Study:    { bg: "#dcfce7", text: "#15803d" },
};

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { toast, showToast, hideToast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // ─── Firestore real-time listener ─────────────────────────────
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "tasks"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setTasks(fetched);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  // ─── Logout ────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      showToast("Failed to logout. Try again.", "error");
    }
  };

  // ─── Toggle complete ───────────────────────────────────────────
  const handleToggleComplete = async (task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    try {
      await updateDoc(doc(db, "tasks", task.id), { status: newStatus });
      if (newStatus === "completed") {
        showToast("Task completed!", "success");
      } else {
        showToast("Task marked as pending", "info");
      }
    } catch (error) {
      showToast("Failed to update task", "error");
    }
  };

  // ─── Delete task ───────────────────────────────────────────────
  const handleDelete = async (taskId) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId));
      showToast("Task deleted", "warning");
    } catch (error) {
      showToast("Failed to delete task", "error");
    }
  };

  // ─── Filter + Sort ─────────────────────────────────────────────
  const filteredTasks = tasks
    .filter((task) =>
      selectedCategory === "All" ? true : task.category === selectedCategory
    )
    .sort((a, b) => {
      const aOverdue = isTaskOverdue(a);
      const bOverdue = isTaskOverdue(b);
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      if (a.status === "pending" && b.status === "completed") return -1;
      if (a.status === "completed" && b.status === "pending") return 1;
      return 0;
    });

  // ─── Stats ─────────────────────────────────────────────────────
  const totalTasks     = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const pendingTasks   = tasks.filter((t) => t.status === "pending").length;
  const overdueTasks   = tasks.filter(isTaskOverdue).length;

  // ─── Task Card ─────────────────────────────────────────────────
  const renderTask = ({ item }) => {
    const isCompleted = item.status === "completed";
    const overdue = isTaskOverdue(item);
    const catColor = categoryColors[item.category] || { bg: "#f3f4f6", text: "#374151" };
    const borderColor = overdue ? "#ef4444" : isCompleted ? "#d1d5db" : "#4f46e5";

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate("TaskDetail", { task: item })}
        activeOpacity={0.85}
      >
        <View style={{
          backgroundColor: overdue ? "#fff5f5" : "white",
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          elevation: 2,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          borderLeftWidth: 4,
          borderLeftColor: borderColor,
        }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>

            {/* Checkbox */}
            <TouchableOpacity
              onPress={() => handleToggleComplete(item)}
              style={{
                width: 24, height: 24,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: isCompleted ? "#10b981" : overdue ? "#ef4444" : "#4f46e5",
                backgroundColor: isCompleted ? "#10b981" : "white",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
                marginTop: 2,
              }}
            >
              {isCompleted && (
                <Ionicons name="checkmark" size={14} color="white" />
              )}
            </TouchableOpacity>

            {/* Content */}
            <View style={{ flex: 1 }}>

              {/* Overdue badge */}
              {overdue && (
                <View style={{
                  backgroundColor: "#fef2f2",
                  borderRadius: 6,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  marginBottom: 6,
                  flexDirection: "row",
                  alignItems: "center",
                  alignSelf: "flex-start",
                  gap: 4,
                }}>
                  <MaterialIcons name="warning" size={11} color="#ef4444" />
                  <Text style={{ color: "#ef4444", fontSize: 11, fontWeight: "700" }}>
                    OVERDUE
                  </Text>
                </View>
              )}

              {/* Title */}
              <Text style={{
                fontSize: 15,
                fontWeight: "600",
                color: isCompleted ? "#9ca3af" : overdue ? "#ef4444" : "#1f2937",
                textDecorationLine: isCompleted ? "line-through" : "none",
                marginBottom: 4,
              }}>
                {item.title}
              </Text>

              {/* Description */}
              {item.description ? (
                <Text style={{
                  fontSize: 13,
                  color: "#6b7280",
                  marginBottom: 8,
                }} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}

              {/* Badges */}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>

                {/* Category */}
                <View style={{
                  backgroundColor: catColor.bg,
                  borderRadius: 8,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                }}>
                  <Text style={{ fontSize: 11, fontWeight: "600", color: catColor.text }}>
                    {item.category}
                  </Text>
                </View>

                {/* Due date */}
                {item.dueDate ? (
                  <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: overdue ? "#fee2e2" : "#f3f4f6",
                    borderRadius: 8,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    gap: 4,
                  }}>
                    <Ionicons
                      name="calendar-outline"
                      size={11}
                      color={overdue ? "#ef4444" : "#6b7280"}
                    />
                    <Text style={{
                      fontSize: 11,
                      color: overdue ? "#ef4444" : "#6b7280",
                      fontWeight: overdue ? "700" : "400",
                    }}>
                      {item.dueDate}
                    </Text>
                  </View>
                ) : null}

                {/* Status */}
                <View style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: overdue ? "#fee2e2" : isCompleted ? "#dcfce7" : "#fef3c7",
                  borderRadius: 8,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  gap: 4,
                }}>
                  <Ionicons
                    name={overdue ? "alert-circle" : isCompleted ? "checkmark-circle" : "time-outline"}
                    size={11}
                    color={overdue ? "#ef4444" : isCompleted ? "#15803d" : "#d97706"}
                  />
                  <Text style={{
                    fontSize: 11,
                    fontWeight: "600",
                    color: overdue ? "#ef4444" : isCompleted ? "#15803d" : "#d97706",
                  }}>
                    {overdue ? "Overdue" : isCompleted ? "Completed" : "Pending"}
                  </Text>
                </View>

              </View>
            </View>

            {/* Action buttons */}
            <View style={{ alignItems: "center", gap: 8, marginLeft: 8 }}>
              <TouchableOpacity
                onPress={() => navigation.navigate("AddEditTask", { task: item })}
                style={{ backgroundColor: "#ede9fe", borderRadius: 8, padding: 6 }}
              >
                <Ionicons name="pencil" size={16} color="#7c3aed" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                style={{ backgroundColor: "#fee2e2", borderRadius: 8, padding: 6 }}
              >
                <Ionicons name="trash" size={16} color="#ef4444" />
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ─── Empty State ───────────────────────────────────────────────
  const EmptyState = () => (
    <View style={{ alignItems: "center", marginTop: 40, paddingHorizontal: 24 }}>

      {/* Planora logo circle */}
      <View style={{
        width: 90, height: 90,
        backgroundColor: "#ede9fe",
        borderRadius: 45,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
      }}>
        <Ionicons name="checkmark-done-circle" size={52} color="#4f46e5" />
      </View>

      {/* App name */}
      <Text style={{
        fontSize: 28,
        fontWeight: "800",
        color: "#4f46e5",
        letterSpacing: 1,
      }}>
        Planora
      </Text>

      {/* Tagline */}
      <Text style={{
        fontSize: 14,
        color: "#6b7280",
        marginTop: 8,
        textAlign: "center",
        lineHeight: 22,
      }}>
        Your smart task manager.{"\n"}
        Stay organized, stay productive.
      </Text>

      {/* Divider */}
      <View style={{
        width: 50, height: 3,
        backgroundColor: "#4f46e5",
        borderRadius: 2,
        marginTop: 20,
        marginBottom: 20,
        opacity: 0.3,
      }} />

      {/* No tasks message */}
      <Text style={{
        fontSize: 16,
        fontWeight: "700",
        color: "#374151",
      }}>
        No tasks yet!
      </Text>
      <Text style={{
        fontSize: 13,
        color: "#9ca3af",
        marginTop: 6,
        textAlign: "center",
        lineHeight: 20,
      }}>
        Start managing your day by{"\n"}adding your first task
      </Text>

      {/* + button hint */}
      <View style={{ alignItems: "center", marginTop: 32, gap: 10 }}>
        <View style={{
          width: 52, height: 52,
          borderRadius: 26,
          backgroundColor: "#4f46e5",
          alignItems: "center",
          justifyContent: "center",
          elevation: 4,
          shadowColor: "#4f46e5",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
        }}>
          <Ionicons name="add" size={28} color="white" />
        </View>
        <Text style={{ fontSize: 12, color: "#9ca3af", textAlign: "center" }}>
          Tap the{" "}
          <Text style={{ color: "#4f46e5", fontWeight: "700" }}>+</Text>
          {" "}button to add your first task
        </Text>
      </View>

    </View>
  );

  // ─── Main UI ───────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f3ff" }}>
      <StatusBar backgroundColor="#4f46e5" barStyle="light-content" />

      {/* Toast */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />

      {/* ── Header ── */}
      <View style={{
        backgroundColor: "#4f46e5",
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 20,
      }}>
        {/* Name + Logout */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}>
              Welcome back,
            </Text>
            <Text style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>
              {user?.displayName || "User"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingVertical: 8,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Ionicons name="log-out-outline" size={16} color="white" />
            <Text style={{ color: "white", fontWeight: "600", fontSize: 13 }}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: "row", marginTop: 20, gap: 8 }}>
          {[
            { label: "Total",   value: totalTasks,     bg: "rgba(255,255,255,0.2)", color: "white",   icon: "list",            lib: "Ionicons"      },
            { label: "Pending", value: pendingTasks,   bg: "#fef3c7",               color: "#d97706", icon: "time-outline",    lib: "Ionicons"      },
            { label: "Done",    value: completedTasks, bg: "#dcfce7",               color: "#15803d", icon: "checkmark-circle",lib: "Ionicons"      },
            { label: "Overdue", value: overdueTasks,   bg: "#fee2e2",               color: "#ef4444", icon: "warning",         lib: "MaterialIcons" },
          ].map((stat) => (
            <View key={stat.label} style={{
              flex: 1,
              backgroundColor: stat.bg,
              borderRadius: 12,
              padding: 10,
              alignItems: "center",
              gap: 4,
            }}>
              {stat.lib === "MaterialIcons"
                ? <MaterialIcons name={stat.icon} size={18} color={stat.color} />
                : <Ionicons name={stat.icon} size={18} color={stat.color} />
              }
              <Text style={{ fontSize: 18, fontWeight: "bold", color: stat.color }}>
                {stat.value}
              </Text>
              <Text style={{ fontSize: 10, color: stat.color }}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── Category Tabs ── */}
      <View style={{ flexDirection: "row", paddingHorizontal: 24, paddingVertical: 16, gap: 8 }}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 10,
              alignItems: "center",
              backgroundColor: selectedCategory === cat ? "#4f46e5" : "white",
              elevation: selectedCategory === cat ? 3 : 1,
            }}
          >
            <Text style={{
              fontSize: 12,
              fontWeight: "600",
              color: selectedCategory === cat ? "white" : "#6b7280",
            }}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Task List ── */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={{ color: "#6b7280", marginTop: 12 }}>Loading tasks...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTask}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: 160,
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState />}
        />
      )}

      {/* ── FAB ── */}
      <View style={{
        position: "absolute",
        bottom: 80,
        right: 20,
        alignItems: "center",
        gap: 8,
      }}>
        {/* Label */}
        <View style={{
          backgroundColor: "rgba(79, 70, 229, 0.9)",
          borderRadius: 20,
          paddingHorizontal: 12,
          paddingVertical: 6,
        }}>
          <Text style={{ color: "white", fontSize: 11, fontWeight: "600" }}>
            Add Task
          </Text>
        </View>

        {/* FAB button */}
        <TouchableOpacity
          onPress={() => navigation.navigate("AddEditTask", { task: null })}
          style={{
            width: 58,
            height: 58,
            borderRadius: 29,
            backgroundColor: "#4f46e5",
            alignItems: "center",
            justifyContent: "center",
            elevation: 6,
            shadowColor: "#4f46e5",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
          }}
        >
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}