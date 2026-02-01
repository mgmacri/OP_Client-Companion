## Client Log Types & Behavioral Requirements

This section extends the signed-off CRS by specifying **all supported client log types** that the Client Companion App can collect and feed into therapist-facing draft notes, while preserving all signed-off behaviors (consent gating, deterministic draft generation, offline queueing, auditability, and therapist approval workflow). fileciteturn2file0L1-L7

### Shared Rules (apply to all log types unless overridden below)

- **Consent required:** A client MUST have an accepted consent record before creating or submitting any log entry (see FR-002). fileciteturn2file0L110-L127  
- **Timestamping:** Each submitted log entry MUST store `submitted_at_utc` equal to the moment the client taps **Submit**. UTC is stored; local time is display-only (see Definitions). fileciteturn2file0L71-L79  
- **Deterministic demo behavior:** Draft note synthesis MUST be template-based; all user-facing validation errors MUST be static strings (see NFR-007). fileciteturn2file0L662-L666  
- **Persistence guarantees:** After the client receives “submission confirmation,” the entry MUST be persisted according to existing durability rules (see FR-003/FR-008). fileciteturn2file0L188-L194 fileciteturn2file0L425-L432  
- **Offline behavior:** When offline, log submissions MUST follow the offline encrypted queue rules and limits (see FR-005). fileciteturn2file0L292-L336  
- **No clinical decision-making:** The system MUST NOT infer diagnosis, severity, or provide clinical interpretation from client logs. Logs are presented as client-reported information only. fileciteturn2file0L55-L61  
- **Therapist review required:** Log-derived notes MUST be created as draft notes with status `Pending Review` and are not part of the official record until therapist approval (see FR-011/FR-016). fileciteturn2file0L507-L550 fileciteturn2file0L598-L646  

---

### Log Type: Mood Diary (mood_diary)

**Target Conditions:** Depression, Bipolar Disorder

**Description:** A structured daily mood snapshot capturing time-of-day context, self-described emotion, and two Likert ratings for mood intensity and energy level.

**BDD Scenarios**

```gherkin
Scenario: Client submits a valid Mood Diary
Given the client is authenticated
  And the client has accepted consent
When the client selects "Time of Day" as "Morning"
  And the client enters "Current Emotion" as a non-empty string
  And the client optionally enters "Trigger or Context"
  And the client sets "Mood Intensity" to 7
  And the client sets "Energy Level" to 4
  And the client taps "Submit"
Then the system persists a Mood Diary entry with submitted_at_utc
  And the entry is queued for deterministic draft note generation
  And a draft note is created with status "Pending Review" within the signed-off note generation SLA

Scenario: Client submits an incomplete Mood Diary
Given the client is authenticated
  And the client has accepted consent
When the client sets "Mood Intensity" to 7
  And the client leaves "Time of Day" unselected
  And the client taps "Submit"
Then the system blocks submission
  And the system displays "Time of Day is required."
  And no entry is persisted
```

**Acceptance Criteria**
- Required fields:
  - `time_of_day` is required and MUST be one of: `Morning`, `Afternoon`, `Evening`.
  - `mood_intensity` is required and MUST be an integer in `[1..10]`.
  - `energy_level` is required and MUST be an integer in `[1..10]`.
- Optional fields:
  - `current_emotion` is optional; if provided, MUST be a string length `1..200` characters.
  - `trigger_context` is optional; if provided, MUST be a string length `1..500` characters.
- Submissions with any required field missing or out-of-range MUST be blocked with a static error message identifying the first invalid field in a deterministic validation order: `time_of_day` → `mood_intensity` → `energy_level`.
- On successful submission, the app MUST display a confirmation within the signed-off performance boundary (RTT ≤ 500ms) and persist the entry (shared rules).

**Note Generation Behavior**
- Draft notes MUST include a section titled `Client Log: Mood Diary`.
- Content placement:
  - **Subjective:** `time_of_day`, `current_emotion`, `trigger_context` (if present).
  - **Objective:** `mood_intensity`, `energy_level` listed as `Label: Value/Scale` (e.g., `Mood Intensity: 7/10`).
- The note MUST not label or imply diagnosis; “Target Conditions” are informational metadata and MUST NOT appear as diagnostic statements.

**Safety & Compliance Notes**
- Free-text fields (`current_emotion`, `trigger_context`) may contain PHI; they MUST be handled per signed-off PHI/PII rules (encryption in transit/at rest, no third-party analytics with PHI). fileciteturn2file0L624-L640  

---

### Log Type: CBT Thought Record (cbt_thought_record)

**Target Conditions:** Anxiety, Depression

**Description:** A CBT-style structured entry capturing a situation, automatic negative thought, optional cognitive distortion label, and an alternative thought, with belief and intensity ratings expressed as percentages.

**BDD Scenarios**

```gherkin
Scenario: Client submits a valid CBT Thought Record
Given the client is authenticated
  And the client has accepted consent
When the client enters "The Situation" as a non-empty string
  And the client enters "Automatic Negative Thought" as a non-empty string
  And the client optionally enters "Cognitive Distortion"
  And the client optionally enters "Alternative Thought"
  And the client sets "Belief in Automatic Thought" to 80
  And the client sets "Emotion Intensity" to 70
  And the client sets "Belief in Alternative Thought" to 40
  And the client taps "Submit"
Then the system persists a CBT Thought Record entry with submitted_at_utc
  And the entry is queued for deterministic draft note generation
  And a draft note is created with status "Pending Review" within the signed-off note generation SLA

Scenario: Client submits an incomplete CBT Thought Record
Given the client is authenticated
  And the client has accepted consent
When the client enters "The Situation" as a non-empty string
  And the client sets "Emotion Intensity" to 120
  And the client taps "Submit"
Then the system blocks submission
  And the system displays "Emotion Intensity must be between 0 and 100."
  And no entry is persisted
```

**Acceptance Criteria**
- Required fields:
  - `situation` is required; MUST be a string length `1..2000` characters.
  - `auto_thought` is required; MUST be a string length `1..2000` characters.
  - `belief_auto` is required; MUST be an integer in `[0..100]`.
  - `emotion_intensity` is required; MUST be an integer in `[0..100]`.
  - `belief_alt` is required; MUST be an integer in `[0..100]`.
- Optional fields:
  - `distortion` is optional; if provided, MUST be a string length `1..200` characters.
  - `alt_thought` is optional; if provided, MUST be a string length `1..2000` characters.
- Percent fields MUST be integers only (no decimals).
- Validation failures MUST be blocked with static error strings, and MUST not persist partial entries.

**Note Generation Behavior**
- Draft notes MUST include a section titled `Client Log: CBT Thought Record`.
- Content placement:
  - **Subjective:** `situation`, `auto_thought`, `distortion` (if present), `alt_thought` (if present).
  - **Objective:** percentage metrics formatted as `Label: Value%`.
- No scoring, diagnosis, or “clinical interpretation” statements may be generated; content must be a faithful structured rendering.

**Safety & Compliance Notes**
- Textareas may include sensitive narrative. The system MUST not apply sentiment analysis or clinical labeling in the demo.
- Logs MUST remain therapist-reviewable drafts until approved. fileciteturn2file0L507-L550  

---

### Log Type: Sleep Log (CBT-I) (sleep_log)

**Target Conditions:** Insomnia, Sleep Disorders

**Description:** A CBT-I style sleep diary capturing bed/sleep/wake times and sleep quality measures to support therapist review of sleep patterns without automated interpretation.

**BDD Scenarios**

```gherkin
Scenario: Client submits a valid Sleep Log (CBT-I)
Given the client is authenticated
  And the client has accepted consent
When the client enters "Time into Bed" as 22:30
  And the client enters "Time Attempted Sleep" as 23:00
  And the client enters "Wake Up Time" as 07:00
  And the client optionally enters "Caffeine/Alcohol Use"
  And the client sets "Minutes to Fall Asleep" to 45
  And the client sets "Number of Awakenings" to 2
  And the client sets "Sleep Quality" to 3
  And the client sets "Restedness upon Waking" to 6
  And the client taps "Submit"
Then the system persists a Sleep Log entry with submitted_at_utc
  And the entry is queued for deterministic draft note generation
  And a draft note is created with status "Pending Review" within the signed-off note generation SLA

Scenario: Client submits an incomplete Sleep Log (CBT-I)
Given the client is authenticated
  And the client has accepted consent
When the client enters "Time into Bed" as 22:30
  And the client leaves "Wake Up Time" empty
  And the client taps "Submit"
Then the system blocks submission
  And the system displays "Wake Up Time is required."
  And no entry is persisted
```

**Acceptance Criteria**
- Required fields:
  - `bedtime`, `lights_out`, `wake_time` are required and MUST be valid local times in `HH:MM` 24-hour format.
  - `onset_latency` is required and MUST be an integer `>= 0` (minutes).
  - `awakenings` is required and MUST be an integer `>= 0` (count).
  - `sleep_quality` is required and MUST be an integer in `[1..5]`.
  - `restedness` is required and MUST be an integer in `[1..10]`.
- Optional fields:
  - `substances` is optional; if provided, MUST be a string length `1..200` characters.
- Time ordering is NOT interpreted clinically; however, for deterministic validation:
  - The system MUST accept any valid time values without enforcing bedtime < wake_time (to avoid implicit clinical logic).
- Validation failures MUST block submission and MUST not persist partial entries.

**Note Generation Behavior**
- Draft notes MUST include a section titled `Client Log: Sleep Log (CBT-I)`.
- Content placement:
  - **Subjective:** `substances` (if present).
  - **Objective:** times and metrics presented as entered, including units (minutes/count) and scales (`3/5`, `6/10`).
- The note MUST NOT compute derived metrics (e.g., total sleep time, sleep efficiency).

**Safety & Compliance Notes**
- Substance text may contain PHI; apply signed-off PHI handling constraints (encryption, no third-party analytics). fileciteturn2file0L624-L640  

---

### Log Type: Panic Attack Log (panic_log)

**Target Conditions:** Panic Disorder, GAD

**Description:** A structured event log capturing panic triggers, symptoms, thoughts, behavioral response, and distress/duration metrics for therapist review.

**BDD Scenarios**

```gherkin
Scenario: Client submits a valid Panic Attack Log
Given the client is authenticated
  And the client has accepted consent
When the client optionally enters "Trigger"
  And the client enters "Physical Symptoms" as a non-empty string
  And the client enters "Catastrophic Thoughts" as a non-empty string
  And the client optionally enters "Behavioral Response"
  And the client sets "Peak Distress" to 8
  And the client sets "Duration of Attack" to 20
  And the client taps "Submit"
Then the system persists a Panic Attack Log entry with submitted_at_utc
  And the entry is queued for deterministic draft note generation
  And a draft note is created with status "Pending Review" within the signed-off note generation SLA

Scenario: Client submits an incomplete Panic Attack Log
Given the client is authenticated
  And the client has accepted consent
When the client enters "Physical Symptoms" as a non-empty string
  And the client sets "Peak Distress" to -1
  And the client taps "Submit"
Then the system blocks submission
  And the system displays "Peak Distress must be between 0 and 10."
  And no entry is persisted
```

**Acceptance Criteria**
- Required fields:
  - `symptoms` is required; MUST be a string length `1..2000` characters.
  - `thoughts` is required; MUST be a string length `1..2000` characters.
  - `peak_distress` is required; MUST be an integer in `[0..10]`.
- Optional fields:
  - `trigger` is optional; if provided, MUST be a string length `1..200` characters.
  - `behavior` is optional; if provided, MUST be a string length `1..500` characters.
  - `duration` is optional; if provided, MUST be an integer `>= 0` minutes.
- Out-of-range metrics MUST block submission with static error strings.
- The system MUST NOT categorize the event as a diagnosis or severity tier.

**Note Generation Behavior**
- Draft notes MUST include a section titled `Client Log: Panic Attack Log`.
- Content placement:
  - **Subjective:** trigger (if present), symptoms, thoughts, behavior (if present).
  - **Objective:** `peak_distress` as `Value/10` and `duration` as minutes (if present).
- The note MUST avoid clinical conclusions (e.g., “meets criteria,” “severe panic disorder”).

**Safety & Compliance Notes**
- Narrative fields may include high-risk content. In demo scope, the system MUST NOT generate real-time alerts or crisis workflows; it only creates a therapist-reviewable draft. fileciteturn2file0L55-L61  

---

### Log Type: Behavioral Activation Log (behavioral_activation)

**Target Conditions:** Depression

**Description:** A structured activity log capturing a time block and activity description, plus mastery and pleasure ratings to support therapist discussion of behavioral activation practices.

**BDD Scenarios**

```gherkin
Scenario: Client submits a valid Behavioral Activation Log
Given the client is authenticated
  And the client has accepted consent
When the client enters "Hour Block" as 14:00
  And the client enters "Activity Description" as a non-empty string
  And the client sets "Sense of Mastery" to 6
  And the client sets "Sense of Pleasure" to 4
  And the client taps "Submit"
Then the system persists a Behavioral Activation Log entry with submitted_at_utc
  And the entry is queued for deterministic draft note generation
  And a draft note is created with status "Pending Review" within the signed-off note generation SLA

Scenario: Client submits an incomplete Behavioral Activation Log
Given the client is authenticated
  And the client has accepted consent
When the client leaves "Activity Description" empty
  And the client taps "Submit"
Then the system blocks submission
  And the system displays "Activity Description is required."
  And no entry is persisted
```

**Acceptance Criteria**
- Required fields:
  - `time_block` is required and MUST be a valid local time in `HH:MM` 24-hour format.
  - `activity` is required; MUST be a string length `1..200` characters.
  - `mastery` is required; MUST be an integer in `[0..10]`.
  - `pleasure` is required; MUST be an integer in `[0..10]`.
- Validation errors MUST be static strings and MUST not persist partial entries.

**Note Generation Behavior**
- Draft notes MUST include a section titled `Client Log: Behavioral Activation Log`.
- Content placement:
  - **Subjective:** `activity`.
  - **Objective:** `time_block`, `mastery` as `/10`, `pleasure` as `/10`.
- The note MUST NOT compute aggregates or trends across multiple logs (demo scope). fileciteturn2file0L55-L61  

**Safety & Compliance Notes**
- Activity text may include PHI; handle per signed-off PHI/PII requirements. fileciteturn2file0L624-L640  

---

### Log Type: Exposure Hierarchy (ERP) (exposure_erp)

**Target Conditions:** OCD, Phobias, PTSD

**Description:** A structured exposure entry capturing an exposure task and predicted vs actual outcomes, along with pre/peak/post SUDs ratings (0–100) to support therapist review of ERP practice.

**BDD Scenarios**

```gherkin
Scenario: Client submits a valid Exposure Hierarchy (ERP)
Given the client is authenticated
  And the client has accepted consent
When the client enters "Exposure Task" as a non-empty string
  And the client optionally enters "Predicted Outcome"
  And the client optionally enters "Actual Outcome"
  And the client sets "Pre-Exposure SUDs" to 60
  And the client sets "Peak SUDs" to 85
  And the client sets "Post-Exposure SUDs" to 30
  And the client taps "Submit"
Then the system persists an Exposure Hierarchy (ERP) entry with submitted_at_utc
  And the entry is queued for deterministic draft note generation
  And a draft note is created with status "Pending Review" within the signed-off note generation SLA

Scenario: Client submits an incomplete Exposure Hierarchy (ERP)
Given the client is authenticated
  And the client has accepted consent
When the client enters "Exposure Task" as a non-empty string
  And the client leaves "Pre-Exposure SUDs" empty
  And the client taps "Submit"
Then the system blocks submission
  And the system displays "Pre-Exposure SUDs is required."
  And no entry is persisted
```

**Acceptance Criteria**
- Required fields:
  - `exposure_task` is required; MUST be a string length `1..200` characters.
  - `pre_suds` is required; MUST be an integer in `[0..100]`.
  - `peak_suds` is required; MUST be an integer in `[0..100]`.
  - `post_suds` is required; MUST be an integer in `[0..100]`.
- Optional fields:
  - `prediction` optional; if provided, string length `1..500` characters.
  - `outcome` optional; if provided, string length `1..500` characters.
- Percent-like SUDs values MUST be integers only.
- The system MUST NOT provide exposure coaching, reassurance statements, or automated “progress” conclusions (demo scope; therapist review only). fileciteturn2file0L55-L61  

**Note Generation Behavior**
- Draft notes MUST include a section titled `Client Log: Exposure Hierarchy (ERP)`.
- Content placement:
  - **Subjective:** `exposure_task`, prediction (if present), outcome (if present).
  - **Objective:** `pre_suds`, `peak_suds`, `post_suds` formatted as `Value/100`.
- The note MUST NOT compute delta or “improvement score” (e.g., peak-post change).

**Safety & Compliance Notes**
- Exposure content may be sensitive; the system MUST not generate advice or clinical guidance. It only records the client-reported entry for therapist review.

---

### Log Type: Food & Emotional Eating Log (food_eating)

**Target Conditions:** Eating Disorders, Emotional Eating

**Description:** A structured eating entry capturing food/drink, context, binge/purge indicator, emotional state, and hunger/fullness Likert ratings to support therapist discussion without automated clinical inference.

**BDD Scenarios**

```gherkin
Scenario: Client submits a valid Food & Emotional Eating Log
Given the client is authenticated
  And the client has accepted consent
When the client enters "Food/Drink Consumed" as a non-empty string
  And the client optionally enters "Location/Context"
  And the client selects "Binge/Purge Behavior" as "true"
  And the client optionally enters "Emotional State"
  And the client sets "Hunger (Pre-eating)" to 7
  And the client sets "Fullness (Post-eating)" to 8
  And the client taps "Submit"
Then the system persists a Food & Emotional Eating Log entry with submitted_at_utc
  And the entry is queued for deterministic draft note generation
  And a draft note is created with status "Pending Review" within the signed-off note generation SLA

Scenario: Client submits an incomplete Food & Emotional Eating Log
Given the client is authenticated
  And the client has accepted consent
When the client enters "Food/Drink Consumed" as a non-empty string
  And the client leaves "Binge/Purge Behavior" unselected
  And the client taps "Submit"
Then the system blocks submission
  And the system displays "Binge/Purge Behavior is required."
  And no entry is persisted
```

**Acceptance Criteria**
- Required fields:
  - `food_item` is required; MUST be a string length `1..200` characters.
  - `binge_purge` is required; MUST be a boolean (`true` or `false`), and MUST be explicitly selected (no default).
  - `hunger` is required; MUST be an integer in `[1..10]`.
  - `fullness` is required; MUST be an integer in `[1..10]`.
- Optional fields:
  - `context` optional; if provided, string length `1..200` characters.
  - `emotional_state` optional; if provided, string length `1..200` characters.
- Validation errors MUST be static strings and MUST not persist partial entries.
- Deterministic ordering in validation MUST be: `food_item` → `binge_purge` → `hunger` → `fullness`.

**Note Generation Behavior**
- Draft notes MUST include a section titled `Client Log: Food & Emotional Eating Log`.
- Content placement:
  - **Subjective:** `food_item`, context (if present), emotional_state (if present), binge_purge (as `Yes/No`).
  - **Objective:** `hunger` and `fullness` listed as `/10`.
- The note MUST NOT calculate calories/macros, diagnose eating disorders, or generate nutritional advice.

**Safety & Compliance Notes**
- This log can be sensitive; the system MUST not produce encouragement/discouragement guidance or clinical opinions. It only renders the submitted entry for therapist review.

---

### Log Type: Chronic Pain Log (pain_log)

**Target Conditions:** Chronic Pain

**Description:** A structured pain flare log capturing time, activity context, and 0–10 ratings for pain intensity, life interference, and emotional distress.

**BDD Scenarios**

```gherkin
Scenario: Client submits a valid Chronic Pain Log
Given the client is authenticated
  And the client has accepted consent
When the client enters "Time of Flare" as 16:30
  And the client optionally enters "Activity during Flare"
  And the client sets "Pain Intensity" to 7
  And the client sets "Life Interference" to 6
  And the client sets "Emotional Distress" to 5
  And the client taps "Submit"
Then the system persists a Chronic Pain Log entry with submitted_at_utc
  And the entry is queued for deterministic draft note generation
  And a draft note is created with status "Pending Review" within the signed-off note generation SLA

Scenario: Client submits an incomplete Chronic Pain Log
Given the client is authenticated
  And the client has accepted consent
When the client enters "Time of Flare" as 16:30
  And the client sets "Pain Intensity" to 11
  And the client taps "Submit"
Then the system blocks submission
  And the system displays "Pain Intensity must be between 0 and 10."
  And no entry is persisted
```

**Acceptance Criteria**
- Required fields:
  - `time` is required and MUST be a valid local time in `HH:MM` 24-hour format.
  - `pain_intensity` is required and MUST be an integer in `[0..10]`.
  - `interference` is required and MUST be an integer in `[0..10]`.
  - `emotional_distress` is required and MUST be an integer in `[0..10]`.
- Optional fields:
  - `activity` optional; if provided, string length `1..200` characters.
- Validation errors MUST be static strings and MUST not persist partial entries.

**Note Generation Behavior**
- Draft notes MUST include a section titled `Client Log: Chronic Pain Log`.
- Content placement:
  - **Subjective:** activity (if present).
  - **Objective:** time, pain_intensity `/10`, interference `/10`, emotional_distress `/10`.
- The note MUST NOT recommend treatment or interpret causality.

**Safety & Compliance Notes**
- Pain narratives can include medication references; the system MUST not provide medication advice and MUST remain within therapist-review draft flow. fileciteturn2file0L55-L61  
