import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  collection, addDoc, updateDoc,
  doc, serverTimestamp,
} from "firebase/firestore";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";

import Toast from "../components/Toast";
import useToast from "../hooks/useToast";

const CATEGORIES = ["Personal", "Work", "Study"];

const categoryColors = {
  Personal: { active: "#7c3aed", bg: "#ede9fe" },
  Work:     { active: "#1d4ed8", bg: "#dbeafe" },
  Study:    { active: "#15803d", bg: "#dcfce7" },
};

const categoryIcons = {
  Personal: "person-outline",
  Work:     "briefcase-outline",
  Study:    "book-outline",
};

export default function AddEditTaskScreen({ navigation, route }) {
  const existingTask = route.params?.task || null;
  const isEditing = existingTask !== null;
  const { user } = useAuth();
  const { toast, showToast, hideToast } = useToast();

  const [title, setTitle] = useState(existingTask?.title || "");
  const [description, setDescription] = useState(existingTask?.description || "");
  const [category, setCategory] = useState(existingTask?.category || "Personal");
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [dueDate, setDueDate] = useState(() => {
    if (existingTask?.dueDateISO) return new Date(existingTask.dueDateISO);
    return new Date();
  });

  const formatDisplay = (date) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Select date";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (event.type === "dismissed") return;
    if (selectedDate) setDueDate(selectedDate);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showToast("Please enter a task title", "error");
      return;
    }
    setLoading(true);
    try {
      const dueDateISO = dueDate.toISOString();
      if (isEditing) {
        await updateDoc(doc(db, "tasks", existingTask.id), {
          title: title.trim(),
          description: description.trim(),
          category,
          dueDateISO,
          dueDate: formatDisplay(dueDate),
        });
         showToast("Task updated successfully!", "success"); // ✅ this was missing
         setTimeout(() => navigation.goBack(), 1500);
       
        setTimeout(() => navigation.goBack(), 1500);
      } else {
        const docRef = await addDoc(collection(db, "tasks"), {
          title: title.trim(),
          description: description.trim(),
          category,
          dueDateISO,
          dueDate: formatDisplay(dueDate),
          status: "pending",
          userId: user.uid,
          createdAt: serverTimestamp(),
        });
        
        showToast("Task added successfully!", "success");
        setTimeout(() => navigation.goBack(), 1500);
      }
    } catch (error) {
      showToast("Failed to save task. Try again.", "error");
    } finally {
      setLoading(false);
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
      <View style={{ backgroundColor: "#4f46e5", paddingHorizontal: 24, paddingTop: 12, paddingBottom: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>

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
            {isEditing ? "Edit Task" : "Add Task"}
          </Text>

          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
              flexDirection: "row", alignItems: "center", gap: 4,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="checkmark" size={16} color="white" />
                <Text style={{ color: "white", fontWeight: "600", fontSize: 13 }}>
                  {isEditing ? "Update" : "Save"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView
          contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* Title Card */}
          <View style={{
            backgroundColor: "white", borderRadius: 16, padding: 20, marginBottom: 16,
            elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08, shadowRadius: 4,
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 8 }}>
              <Ionicons name="create-outline" size={18} color="#4f46e5" />
              <Text style={{ color: "#374151", fontWeight: "700", fontSize: 14 }}>
                Task Title *
              </Text>
            </View>
            <TextInput
              style={{
                borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12,
                paddingHorizontal: 16, paddingVertical: 12,
                backgroundColor: "#f9fafb", color: "#1f2937", fontSize: 15,
              }}
              placeholder="What do you need to do?"
              placeholderTextColor="#9ca3af"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
            <Text style={{ color: "#9ca3af", fontSize: 11, marginTop: 6, textAlign: "right" }}>
              {title.length}/100
            </Text>
          </View>

          {/* Description Card */}
          <View style={{
            backgroundColor: "white", borderRadius: 16, padding: 20, marginBottom: 16,
            elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08, shadowRadius: 4,
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 8 }}>
              <Ionicons name="document-text-outline" size={18} color="#4f46e5" />
              <Text style={{ color: "#374151", fontWeight: "700", fontSize: 14 }}>
                Description (optional)
              </Text>
            </View>
            <TextInput
              style={{
                borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12,
                paddingHorizontal: 16, paddingVertical: 12,
                backgroundColor: "#f9fafb", color: "#1f2937", fontSize: 15,
                minHeight: 100, textAlignVertical: "top",
              }}
              placeholder="Add more details about this task..."
              placeholderTextColor="#9ca3af"
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={500}
            />
            <Text style={{ color: "#9ca3af", fontSize: 11, marginTop: 6, textAlign: "right" }}>
              {description.length}/500
            </Text>
          </View>

          {/* Category Card */}
          <View style={{
            backgroundColor: "white", borderRadius: 16, padding: 20, marginBottom: 16,
            elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08, shadowRadius: 4,
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 8 }}>
              <Ionicons name="pricetag-outline" size={18} color="#4f46e5" />
              <Text style={{ color: "#374151", fontWeight: "700", fontSize: 14 }}>
                Category *
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                const colors = categoryColors[cat];
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 12,
                      alignItems: "center",
                      gap: 6,
                      backgroundColor: isSelected ? colors.active : colors.bg,
                      borderWidth: 2,
                      borderColor: isSelected ? colors.active : "transparent",
                    }}
                  >
                    <Ionicons
                      name={categoryIcons[cat]}
                      size={18}
                      color={isSelected ? "white" : colors.active}
                    />
                    <Text style={{
                      fontSize: 12, fontWeight: "700",
                      color: isSelected ? "white" : colors.active,
                    }}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Due Date Card */}
          <View style={{
            backgroundColor: "white", borderRadius: 16, padding: 20, marginBottom: 24,
            elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08, shadowRadius: 4,
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 8 }}>
              <Ionicons name="calendar-outline" size={18} color="#4f46e5" />
              <Text style={{ color: "#374151", fontWeight: "700", fontSize: 14 }}>
                Due Date
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={{
                flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12,
                paddingHorizontal: 16, paddingVertical: 14, backgroundColor: "#f9fafb",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name="calendar" size={16} color="#4f46e5" />
                <Text style={{ color: "#1f2937", fontSize: 15 }}>
                  {formatDisplay(dueDate)}
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Text style={{ color: "#4f46e5", fontWeight: "600", fontSize: 13 }}>Change</Text>
                <Ionicons name="chevron-forward" size={14} color="#4f46e5" />
              </View>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={dueDate}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={onDateChange}
              />
            )}

            {/* Reminder hint */}
           
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            style={{
              backgroundColor: "#4f46e5",
              borderRadius: 16, paddingVertical: 16,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
              elevation: 4,
              shadowColor: "#4f46e5",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="white" />
                <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
                  {isEditing ? "Update Task" : "Save Task"}
                </Text>
              </>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}