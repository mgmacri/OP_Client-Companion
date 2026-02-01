import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";
import { useDispatch } from "react-redux";
import ValidationBanner from "../../../shared/components/ValidationBanner";
import { submitLogRequested } from "../state/logFormSlice";

type MoodDiaryFields = {
  time_of_day: string;
  current_emotion: string;
  trigger_context: string;
  mood_intensity: string;
  energy_level: string;
};

const VALID_TIME_OF_DAY = ["Morning", "Afternoon", "Evening"] as const;

const fieldOrder = ["time_of_day", "mood_intensity", "energy_level"] as const;

const MoodDiaryForm: React.FC = () => {
  const dispatch = useDispatch();
  const [fields, setFields] = useState<MoodDiaryFields>({
    time_of_day: "",
    current_emotion: "",
    trigger_context: "",
    mood_intensity: "",
    energy_level: "",
  });
  const [error, setError] = useState<string | null>(null);

  const parsedNumbers = useMemo(() => {
    const mood = parseInt(fields.mood_intensity, 10);
    const energy = parseInt(fields.energy_level, 10);
    return { mood, energy };
  }, [fields.mood_intensity, fields.energy_level]);

  const validate = (): boolean => {
    for (const key of fieldOrder) {
      if (key === "time_of_day") {
        if (!fields.time_of_day) {
          setError("Time of Day is required.");
          return false;
        }
        if (!VALID_TIME_OF_DAY.includes(fields.time_of_day as typeof VALID_TIME_OF_DAY[number])) {
          setError("Time of Day must be Morning, Afternoon, or Evening.");
          return false;
        }
      }
      if (key === "mood_intensity") {
        if (Number.isNaN(parsedNumbers.mood)) {
          setError("Mood Intensity is required.");
          return false;
        }
        if (parsedNumbers.mood < 1 || parsedNumbers.mood > 10) {
          setError("Mood Intensity must be between 1 and 10.");
          return false;
        }
      }
      if (key === "energy_level") {
        if (Number.isNaN(parsedNumbers.energy)) {
          setError("Energy Level is required.");
          return false;
        }
        if (parsedNumbers.energy < 1 || parsedNumbers.energy > 10) {
          setError("Energy Level must be between 1 and 10.");
          return false;
        }
      }
    }

    if (fields.current_emotion && (fields.current_emotion.length < 1 || fields.current_emotion.length > 200)) {
      setError("Current Emotion must be 1-200 characters.");
      return false;
    }

    if (fields.trigger_context && (fields.trigger_context.length < 1 || fields.trigger_context.length > 500)) {
      setError("Trigger/Context must be 1-500 characters.");
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    dispatch(
      submitLogRequested({
        fields: {
          time_of_day: fields.time_of_day,
          current_emotion: fields.current_emotion,
          trigger_context: fields.trigger_context,
          mood_intensity: parsedNumbers.mood,
          energy_level: parsedNumbers.energy,
        },
      })
    );
  };

  const updateField = (key: keyof MoodDiaryFields, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ValidationBanner message={error} />

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Time of Day *</Text>
        <TextInput
          style={styles.input}
          placeholder="Morning / Afternoon / Evening"
          value={fields.time_of_day}
          onChangeText={(text) => updateField("time_of_day", text)}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Current Emotion (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Sad, Anxious, Content"
          value={fields.current_emotion}
          onChangeText={(text) => updateField("current_emotion", text)}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Trigger / Context (optional)</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Who were you with? What were you doing?"
          value={fields.trigger_context}
          onChangeText={(text) => updateField("trigger_context", text)}
          multiline
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.half, styles.halfSpacing]}>
          <Text style={styles.label}>Mood Intensity (1-10) *</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={fields.mood_intensity}
            onChangeText={(text) => updateField("mood_intensity", text)}
          />
        </View>
        <View style={styles.half}>
          <Text style={styles.label}>Energy Level (1-10) *</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={fields.energy_level}
            onChangeText={(text) => updateField("energy_level", text)}
          />
        </View>
      </View>

      <Pressable style={styles.submit} accessibilityRole="button" onPress={handleSubmit}>
        <Text style={styles.submitLabel}>Submit Mood Diary</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  half: {
    flex: 1,
    marginBottom: 0,
  },
  halfSpacing: {
    marginRight: 6,
  },
  submit: {
    marginTop: 12,
    backgroundColor: "#0b6efd",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  submitLabel: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default MoodDiaryForm;
