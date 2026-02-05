import type { LogType } from '../types/models';

export const LOG_TYPES: LogType[] = [
  {
    id: "mood_diary",
    name: "Mood Diary",
    target_conditions: ["Depression", "Bipolar Disorder"],
    text_inputs: [
      { key: "time_of_day", label: "Time of Day", type: "select", options: ["Morning", "Afternoon", "Evening"] },
      { key: "current_emotion", label: "Current Emotion", type: "string" },
      { key: "trigger_context", label: "Trigger or Context", type: "textarea" }
    ],
    metrics: [
      { key: "mood_intensity", label: "Mood Intensity", min: 1, max: 10, unit: "Likert" },
      { key: "energy_level", label: "Energy Level", min: 1, max: 10, unit: "Likert" }
    ]
  },
  {
    id: "cbt_thought_record",
    name: "CBT Thought Record",
    target_conditions: ["Anxiety", "Depression"],
    text_inputs: [
      { key: "situation", label: "The Situation", type: "textarea" },
      { key: "auto_thought", label: "Automatic Negative Thought", type: "textarea" },
      { key: "distortion", label: "Cognitive Distortion", type: "string" },
      { key: "alt_thought", label: "Alternative Thought", type: "textarea" }
    ],
    metrics: [
      { key: "belief_auto", label: "Belief in Automatic Thought", min: 0, max: 100, unit: "Percentage" },
      { key: "emotion_intensity", label: "Emotion Intensity", min: 0, max: 100, unit: "Percentage" },
      { key: "belief_alt", label: "Belief in Alternative Thought", min: 0, max: 100, unit: "Percentage" }
    ]
  },
  {
    id: "sleep_log",
    name: "Sleep Log (CBT-I)",
    target_conditions: ["Insomnia", "Sleep Disorders"],
    text_inputs: [
      { key: "bedtime", label: "Time into Bed", type: "time" },
      { key: "lights_out", label: "Time Attempted Sleep", type: "time" },
      { key: "wake_time", label: "Wake Up Time", type: "time" },
      { key: "substances", label: "Caffeine/Alcohol Use", type: "string" }
    ],
    metrics: [
      { key: "onset_latency", label: "Minutes to Fall Asleep", min: 0, max: null, unit: "Minutes" },
      { key: "awakenings", label: "Number of Awakenings", min: 0, max: null, unit: "Count" },
      { key: "sleep_quality", label: "Sleep Quality", min: 1, max: 5, unit: "Likert" },
      { key: "restedness", label: "Restedness upon Waking", min: 1, max: 10, unit: "Likert" }
    ]
  },
  {
    id: "panic_log",
    name: "Panic Attack Log",
    target_conditions: ["Panic Disorder", "GAD"],
    text_inputs: [
      { key: "trigger", label: "Trigger", type: "string" },
      { key: "symptoms", label: "Physical Symptoms", type: "textarea" },
      { key: "thoughts", label: "Catastrophic Thoughts", type: "textarea" },
      { key: "behavior", label: "Behavioral Response", type: "string" }
    ],
    metrics: [
      { key: "peak_distress", label: "Peak Distress", min: 0, max: 10, unit: "Likert" },
      { key: "duration", label: "Duration of Attack", min: 0, max: null, unit: "Minutes" }
    ]
  },
  {
    id: "behavioral_activation",
    name: "Behavioral Activation Log",
    target_conditions: ["Depression"],
    text_inputs: [
      { key: "time_block", label: "Hour Block", type: "time" },
      { key: "activity", label: "Activity Description", type: "string" }
    ],
    metrics: [
      { key: "mastery", label: "Sense of Mastery", min: 0, max: 10, unit: "Likert" },
      { key: "pleasure", label: "Sense of Pleasure", min: 0, max: 10, unit: "Likert" }
    ]
  },
  {
    id: "exposure_erp",
    name: "Exposure Hierarchy (ERP)",
    target_conditions: ["OCD", "Phobias", "PTSD"],
    text_inputs: [
      { key: "exposure_task", label: "Exposure Task", type: "string" },
      { key: "prediction", label: "Predicted Outcome", type: "string" },
      { key: "outcome", label: "Actual Outcome", type: "string" }
    ],
    metrics: [
      { key: "pre_suds", label: "Pre-Exposure SUDs", min: 0, max: 100, unit: "SUDs" },
      { key: "peak_suds", label: "Peak SUDs", min: 0, max: 100, unit: "SUDs" },
      { key: "post_suds", label: "Post-Exposure SUDs", min: 0, max: 100, unit: "SUDs" }
    ]
  },
  {
    id: "gratitude_journal",
    name: "Gratitude Journal",
    target_conditions: ["Depression", "General Wellness"],
    text_inputs: [
      { key: "gratitude_1", label: "I'm grateful for...", type: "textarea" },
      { key: "gratitude_2", label: "I'm grateful for...", type: "textarea" },
      { key: "gratitude_3", label: "I'm grateful for...", type: "textarea" }
    ],
    metrics: [
      { key: "overall_mood", label: "Overall Mood", min: 1, max: 10, unit: "Likert" }
    ]
  },
  {
    id: "anger_log",
    name: "Anger Management Log",
    target_conditions: ["Anger Management", "Impulse Control"],
    text_inputs: [
      { key: "trigger", label: "What triggered your anger?", type: "textarea" },
      { key: "thoughts", label: "Thoughts at the time", type: "textarea" },
      { key: "response", label: "How did you respond?", type: "textarea" },
      { key: "alternative", label: "Alternative response", type: "textarea" }
    ],
    metrics: [
      { key: "intensity", label: "Anger Intensity", min: 1, max: 10, unit: "Likert" },
      { key: "duration", label: "Duration (minutes)", min: 0, max: null, unit: "Minutes" }
    ]
  }
];
