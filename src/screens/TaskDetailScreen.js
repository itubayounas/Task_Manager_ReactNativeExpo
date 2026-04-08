import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { db } from "../firebase/firebaseConfig";

import Toast from "../components/Toast";
import useToast from "../hooks/useToast";

const categoryColors = {
  Personal: { bg: "#ede9fe", text: "#7c3aed" },
  Work:     { bg: "#dbeafe", text: "#1d4ed8" },
  Study:    { bg: "#dcfce7", text: "#15803d" },
};

const categoryIcons = {
  Personal: "person-outline",
  Work:     "briefcase-outline",
  Study:    "book-outline",
};

// ✅ Check if task is overdue
const isTaskOverdue = (task) => {
  if (task.status === "completed") return false;
  if (!task.dueDateISO) return false;
  const due = new Date(task.dueDateISO);
  due.setHours(23, 59, 59, 999);
  return due < new Date();
};

export default function TaskDetailScreen({ navigation, route }) {
  const { task } = route.params;
  const { toast, showToast, hideToast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isCompleted = task.status === "completed";
  const overdue = isTaskOverdue(task);
  const catColor = categoryColors[task.category] || { bg: "#f3f4f6", text: "#374151" };

  // ─── Status config ────────────────────────────────────────────
  const statusConfig = {
    completed: {
      bg: "#dcfce7",
      color: "#15803d",
      icon: "checkmark-circle",
      label: "Completed",
      sub: "Great job finishing this task!",
    },
    overdue: {
      bg: "#fef2f2",
      color: "#ef4444",
      icon: "alert-circle",
      label: "Overdue",
      sub: "This task is past its due date",
    },
    pending: {
      bg: "#fef3c7",
      color: "#d97706",
      icon: "time",
      label: "Pending",
      sub: "This task is not done yet",
    },
  };

  const currentStatus = isCompleted ? "completed" : overdue ? "overdue" : "pending";
  const status = statusConfig[currentStatus];

  // ─── Toggle complete ──────────────────────────────────────────
  const handleToggleComplete = async () => {
    const newStatus = isCompleted ? "pending" : "completed";
    try {
      await updateDoc(doc(db, "tasks", task.id), { status: newStatus });
      
      setTimeout(() => navigation.goBack(), 1500);
    } catch (error) {
      showToast("Failed to update task", "error");
    }
  };

  // ─── Delete task ──────────────────────────────────────────────
  const handleDelete = async () => {
    try {
      
      await deleteDoc(doc(db, "tasks", task.id));
      showToast("Task deleted", "warning");
      setTimeout(() => navigation.goBack(), 1500);
    } catch (error) {
      showToast("Failed to delete task", "error");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f3ff" }}>

      {/* Toast */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />

      {/* Header */}
      <View style={{
        backgroundColor: "#4f46e5",
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 20,
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>

          {/* Back button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
              flexDirection: "row", alignItems: "center", gap: 4,
            }}
          >
            <Ionicons name="arrow-back" size={16} color="white" />
            <Text style={{ color: "white", fontWeight: "600", fontSize: 13 }}>Back</Text>
          </TouchableOpacity>

          <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
            Task Detail
          </Text>

          {/* Edit button */}
          <TouchableOpacity
            onPress={() => navigation.navigate("AddEditTask", { task })}
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
              flexDirection: "row", alignItems: "center", gap: 4,
            }}
          >
            <Ionicons name="pencil" size={16} color="white" />
            <Text style={{ color: "white", fontWeight: "600", fontSize: 13 }}>Edit</Text>
          </TouchableOpacity>

        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Status Banner ── */}
        <View style={{
          backgroundColor: status.bg,
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 14,
          marginBottom: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}>
          <Ionicons name={status.icon} size={32} color={status.color} />
          <View>
            <Text style={{ color: status.color, fontWeight: "bold", fontSize: 16 }}>
              {status.label}
            </Text>
            <Text style={{ color: status.color, fontSize: 12, marginTop: 2 }}>
              {status.sub}
            </Text>
          </View>
        </View>

        {/* ── Main Info Card ── */}
        <View style={{
          backgroundColor: "white",
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          elevation: 2,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
        }}>

          {/* Title */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <Ionicons name="create-outline" size={13} color="#9ca3af" />
            <Text style={{ color: "#9ca3af", fontSize: 11, fontWeight: "600", textTransform: "uppercase" }}>
              Task Title
            </Text>
          </View>
          <Text style={{
            fontSize: 20,
            fontWeight: "bold",
            color: isCompleted ? "#9ca3af" : overdue ? "#ef4444" : "#1f2937",
            textDecorationLine: isCompleted ? "line-through" : "none",
            marginBottom: 16,
          }}>
            {task.title}
          </Text>

          <View style={{ height: 1, backgroundColor: "#f3f4f6", marginBottom: 16 }} />

          {/* Description */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <Ionicons name="document-text-outline" size={13} color="#9ca3af" />
            <Text style={{ color: "#9ca3af", fontSize: 11, fontWeight: "600", textTransform: "uppercase" }}>
              Description
            </Text>
          </View>
          <Text style={{ color: "#374151", fontSize: 15, lineHeight: 22, marginBottom: 16 }}>
            {task.description || "No description provided."}
          </Text>

          <View style={{ height: 1, backgroundColor: "#f3f4f6", marginBottom: 16 }} />

          {/* Category + Due Date row */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>

            {/* Category */}
            <View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <Ionicons name="pricetag-outline" size={13} color="#9ca3af" />
                <Text style={{ color: "#9ca3af", fontSize: 11, fontWeight: "600", textTransform: "uppercase" }}>
                  Category
                </Text>
              </View>
              <View style={{
                backgroundColor: catColor.bg,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 6,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}>
                <Ionicons
                  name={categoryIcons[task.category] || "folder-outline"}
                  size={13}
                  color={catColor.text}
                />
                <Text style={{ color: catColor.text, fontWeight: "700", fontSize: 13 }}>
                  {task.category}
                </Text>
              </View>
            </View>

            {/* Due Date */}
            <View style={{ alignItems: "flex-end" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <Ionicons name="calendar-outline" size={13} color="#9ca3af" />
                <Text style={{ color: "#9ca3af", fontSize: 11, fontWeight: "600", textTransform: "uppercase" }}>
                  Due Date
                </Text>
              </View>
              <View style={{
                backgroundColor: overdue ? "#fee2e2" : "#ede9fe",
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 6,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}>
                <Ionicons
                  name="calendar"
                  size={13}
                  color={overdue ? "#ef4444" : "#4f46e5"}
                />
                <Text style={{
                  color: overdue ? "#ef4444" : "#4f46e5",
                  fontWeight: "700",
                  fontSize: 13,
                }}>
                  {task.dueDate || "Not set"}
                </Text>
              </View>
            </View>

          </View>

          {/* Reminder info */}
          {/* {task.dueDate && !isCompleted && (
            <>
              <View style={{ height: 1, backgroundColor: "#f3f4f6", marginTop: 16, marginBottom: 16 }} />
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name="notifications-outline" size={15} color="#9ca3af" />
                <Text style={{ color: "#9ca3af", fontSize: 12 }}>
                  {overdue
                    ? "This task's reminder has already passed"
                    : `You'll be reminded when you open the app on ${task.dueDate}`
                  }
                </Text>
              </View>
            </>
          )} */}

        </View>

        {/* ── Action Buttons ── */}
        <View style={{ gap: 12 }}>

          {/* Toggle Complete */}
          <TouchableOpacity
            onPress={handleToggleComplete}
            style={{
              backgroundColor: isCompleted ? "#f59e0b" : "#10b981",
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
              elevation: 3,
              shadowColor: isCompleted ? "#f59e0b" : "#10b981",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
            }}
          >
            <Ionicons
              name={isCompleted ? "refresh-circle-outline" : "checkmark-circle-outline"}
              size={20}
              color="white"
            />
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 15 }}>
              {isCompleted ? "Mark as Pending" : "Mark as Completed"}
            </Text>
          </TouchableOpacity>

          {/* Edit */}
          <TouchableOpacity
            onPress={() => navigation.navigate("AddEditTask", { task })}
            style={{
              backgroundColor: "#4f46e5",
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
              elevation: 3,
              shadowColor: "#4f46e5",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
            }}
          >
            <Ionicons name="pencil-outline" size={20} color="white" />
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 15 }}>
              Edit Task
            </Text>
          </TouchableOpacity>

          {/* Delete — inline confirm */}
          {!showDeleteConfirm ? (
            <TouchableOpacity
              onPress={() => setShowDeleteConfirm(true)}
              style={{
                backgroundColor: "white",
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
                borderWidth: 2,
                borderColor: "#ef4444",
                elevation: 1,
              }}
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
              <Text style={{ color: "#ef4444", fontWeight: "bold", fontSize: 15 }}>
                Delete Task
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={{
              backgroundColor: "white",
              borderRadius: 16,
              padding: 16,
              borderWidth: 2,
              borderColor: "#ef4444",
            }}>
              {/* Warning icon */}
              <View style={{ alignItems: "center", marginBottom: 12 }}>
                <View style={{
                  backgroundColor: "#fef2f2",
                  borderRadius: 50,
                  padding: 12,
                  marginBottom: 8,
                }}>
                  <Ionicons name="warning-outline" size={28} color="#ef4444" />
                </View>
                <Text style={{ color: "#1f2937", fontWeight: "700", fontSize: 15 }}>
                  Delete Task?
                </Text>
                <Text style={{ color: "#6b7280", fontSize: 13, marginTop: 4, textAlign: "center" }}>
                  This action cannot be undone
                </Text>
              </View>

              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity
                  onPress={() => setShowDeleteConfirm(false)}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 12,
                    alignItems: "center",
                    backgroundColor: "#f3f4f6",
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <Ionicons name="close-outline" size={18} color="#374151" />
                  <Text style={{ color: "#374151", fontWeight: "600" }}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleDelete}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 12,
                    alignItems: "center",
                    backgroundColor: "#ef4444",
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <Ionicons name="trash-outline" size={18} color="white" />
                  <Text style={{ color: "white", fontWeight: "600" }}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
