param(
	[switch]$WireOnly
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repo = "mgmacri/OP_Client-Companion"
$owner = "mgmacri"
$projectTitle = "OP_Client-Companion"
$iterationStart = "2026-02-02"

function Invoke-GraphQl {
	param(
		[Parameter(Mandatory = $true)][string]$Query,
		[Parameter()][hashtable]$Variables = @{}
	)

	$args = @("api", "graphql", "-f", "query=$Query")
	foreach ($key in $Variables.Keys) {
		$args += "-f"
		$args += "$key=$($Variables[$key])"
	}

	$raw = gh @args
	return ($raw | ConvertFrom-Json)
}

function Get-OrCreate-Project {
	$projectsRaw = gh project list --owner $owner --format json
	$projects = ($projectsRaw | ConvertFrom-Json).projects
	$project = $projects | Where-Object { $_.title -eq $projectTitle } | Select-Object -First 1

	if (-not $project) {
		$createdUrl = gh project create --owner $owner --title $projectTitle
		$projectsRaw = gh project list --owner $owner --format json
		$projects = ($projectsRaw | ConvertFrom-Json).projects
		$project = $projects | Where-Object { $_.title -eq $projectTitle } | Select-Object -First 1
	}

	if (-not $project) {
		throw "Failed to locate or create project '$projectTitle'."
	}

	$projectNumber = $project.number
	$projectView = gh project view $projectNumber --owner $owner --format json | ConvertFrom-Json

	return [pscustomobject]@{
		Number = $projectNumber
		Id     = $projectView.id
		Url    = $projectView.url
	}
}

function Get-Project-Fields {
	param(
		[Parameter(Mandatory = $true)][string]$ProjectId
	)

	$query = 'query($projectId:ID!){node(id:$projectId){... on ProjectV2{fields(first:100){nodes{... on ProjectV2SingleSelectField{id name dataType} ... on ProjectV2IterationField{id name dataType} ... on ProjectV2Field{id name dataType}}}}}}'
	$result = Invoke-GraphQl -Query $query -Variables @{ projectId = $ProjectId }
	return $result.data.node.fields.nodes
}

function Ensure-Type-Field {
	param(
		[Parameter(Mandatory = $true)][string]$ProjectId,
		[Parameter(Mandatory = $true)]$Fields
	)

	if ($Fields | Where-Object { $_.name -eq "Type" }) {
		return
	}

	$query = 'mutation($projectId:ID!){createProjectV2Field(input:{projectId:$projectId,name:"Type",dataType:SINGLE_SELECT,singleSelectOptions:[{name:"Epic",color:BLUE,description:""},{name:"Story",color:GREEN,description:""},{name:"Task",color:ORANGE,description:""},{name:"Subtask",color:RED,description:""}]}){projectV2Field{... on ProjectV2SingleSelectField{id name}}}}'
	Invoke-GraphQl -Query $query -Variables @{ projectId = $ProjectId } | Out-Null
}

function Ensure-Iteration-Field {
	param(
		[Parameter(Mandatory = $true)][string]$ProjectId,
		[Parameter(Mandatory = $true)]$Fields
	)

	if ($Fields | Where-Object { $_.name -eq "Iteration" }) {
		return
	}

	$query = 'mutation($projectId:ID!){createProjectV2Field(input:{projectId:$projectId,name:"Iteration",dataType:ITERATION,iterationConfiguration:{startDate:"2026-02-02",duration:14,iterations:[{startDate:"2026-02-02",duration:14,title:"2026-02-02"},{startDate:"2026-02-16",duration:14,title:"2026-02-16"},{startDate:"2026-03-02",duration:14,title:"2026-03-02"},{startDate:"2026-03-16",duration:14,title:"2026-03-16"},{startDate:"2026-03-30",duration:14,title:"2026-03-30"},{startDate:"2026-04-13",duration:14,title:"2026-04-13"}]}}){projectV2Field{... on ProjectV2IterationField{id name}}}}'
	Invoke-GraphQl -Query $query -Variables @{ projectId = $ProjectId } | Out-Null
}

function Ensure-Status-Field-Options {
	param(
		[Parameter(Mandatory = $true)]$Fields
	)

	$status = $Fields | Where-Object { $_.name -eq "Status" } | Select-Object -First 1
	if (-not $status) {
		return
	}

	$query = 'mutation($fieldId:ID!){updateProjectV2Field(input:{fieldId:$fieldId,singleSelectOptions:[{name:"Backlog",color:GRAY,description:""},{name:"Ready",color:BLUE,description:""},{name:"In Progress",color:YELLOW,description:""},{name:"In Review",color:PURPLE,description:""},{name:"Blocked",color:RED,description:""},{name:"Done",color:GREEN,description:""}]}){projectV2Field{... on ProjectV2SingleSelectField{id name}}}}'
	Invoke-GraphQl -Query $query -Variables @{ fieldId = $status.id } | Out-Null
}

function Ensure-Labels {
	$required = @(
		@{ Name = "product"; Color = "0E8A16"; Description = "Product scope" },
		@{ Name = "mobile"; Color = "1D76DB"; Description = "Mobile work" },
		@{ Name = "backend"; Color = "0052CC"; Description = "Backend work" },
		@{ Name = "frontend"; Color = "5319E7"; Description = "Frontend work" },
		@{ Name = "infra"; Color = "006B75"; Description = "Infrastructure" },
		@{ Name = "testing"; Color = "FBCA04"; Description = "Testing" },
		@{ Name = "compliance"; Color = "D93F0B"; Description = "Compliance" }
	)

	$existing = gh label list --repo $repo --json name | ConvertFrom-Json
	$existingNames = $existing.name

	foreach ($label in $required) {
		if ($existingNames -notcontains $label.Name) {
			gh label create $label.Name --repo $repo --color $label.Color --description $label.Description | Out-Null
		}
	}
}

$projectInfo = Get-OrCreate-Project
$projectFields = Get-Project-Fields -ProjectId $projectInfo.Id
Ensure-Type-Field -ProjectId $projectInfo.Id -Fields $projectFields
Ensure-Iteration-Field -ProjectId $projectInfo.Id -Fields $projectFields
Ensure-Status-Field-Options -Fields $projectFields
Ensure-Labels

function New-Issue {
	param(
		[Parameter(Mandatory = $true)][string]$Title,
		[Parameter(Mandatory = $true)][string]$Body,
		[Parameter(Mandatory = $true)][string]$Labels
	)

	$issueUrl = gh issue create --repo $repo --title $Title --body $Body --label $Labels
	$issue = gh issue view $issueUrl --json id,number,url | ConvertFrom-Json
	Write-Host $issue.url
	return $issue
}

function Set-Parent {
	param(
		[Parameter(Mandatory = $true)][string]$IssueId,
		[Parameter(Mandatory = $true)][string]$ParentId
	)

	$query = 'mutation($issueId:ID!,$subIssueId:ID!){addSubIssue(input:{issueId:$issueId,subIssueId:$subIssueId}){issue{id}}}'
	Invoke-GraphQl -Query $query -Variables @{ issueId = $ParentId; subIssueId = $IssueId } | Out-Null
}

function Get-Issue-ByTitle {
	param(
		[Parameter(Mandatory = $true)][string]$Title
	)

	$search = 'in:title "' + $Title + '"'
	$result = gh issue list --repo $repo -S $search --json id,title --limit 1 | ConvertFrom-Json
	return $result | Select-Object -First 1
}

if (-not $WireOnly) {
	# =========================
	# Epics
	# =========================
	$epic1 = @"
Description: Enable client-side capture of each approved log type with required/optional fields, deterministic validation order, and consent gating.
Scope: MVP
"@
	$epicCapture = New-Issue -Title "Epic: Client Log Capture & Validation" -Body $epic1 -Labels "product,mobile,compliance"

	$epic2 = @"
Description: Offline encrypted queueing, max 50 submissions, auto-sync on connectivity restoration.
Scope: MVP
"@
	$epicQueue = New-Issue -Title "Epic: Client Log Persistence, Queueing, and Sync" -Body $epic2 -Labels "mobile,backend,compliance,infra"

	$epic3 = @"
Description: Deterministic draft notes from log data with Pending Review status.
Scope: MVP
"@
	$epicNotes = New-Issue -Title "Epic: Note Draft Generation & Therapist Review" -Body $epic3 -Labels "backend,frontend,compliance"

	$epic4 = @"
Description: Store submitted_at_utc in UTC at submit; display localized only; enforce consent.
Scope: MVP
"@
	$epicCompliance = New-Issue -Title "Epic: Timestamp Handling & Compliance Guardrails" -Body $epic4 -Labels "backend,frontend,mobile,compliance"

	# =========================
	# Story 1.1 Mood Diary
	# =========================
	$story = @"
As a client, I want to record my mood diary entry so that my therapist can review a structured summary.
Acceptance Criteria:
- Required fields: time_of_day, mood_intensity (1–10), energy_level (1–10)
- Optional fields: current_emotion (1–200), trigger_context (1–500)
- Validation order enforced: time_of_day → mood_intensity → energy_level
- Consent required before submission
- Errors are static, deterministic strings
"@
	$storyMood = New-Issue -Title "Story: Mood Diary Log" -Body $story -Labels "mobile,testing,compliance"
	Set-Parent -IssueId $storyMood.id -ParentId $epicCapture.id
	$taskMoodForm = New-Issue -Title "Task: Mobile – Mood Diary Form UI" -Body "Implement form UI with required/optional fields and constraints for Mood Diary." -Labels "mobile"
	Set-Parent -IssueId $taskMoodForm.id -ParentId $storyMood.id
	$taskMoodValidation = New-Issue -Title "Task: Mobile – Mood Diary Validation" -Body "Enforce validation order and static error strings for Mood Diary." -Labels "mobile,testing"
	Set-Parent -IssueId $taskMoodValidation.id -ParentId $storyMood.id
	$taskMoodConsent = New-Issue -Title "Task: Mobile – Mood Diary Consent Gate" -Body "Block submit until consent is confirmed." -Labels "mobile,compliance"
	Set-Parent -IssueId $taskMoodConsent.id -ParentId $storyMood.id

# =========================
# Story 1.2 CBT Thought Record
# =========================
$story = @"
As a client, I want to record a CBT thought record so that my therapist can review a structured summary.
Acceptance Criteria:
- Required fields: situation, auto thought, belief auto (0–100), emotion intensity (0–100), belief alt (0–100)
- Optional fields: distortion, alternative thought
- Consent required before submission
- Errors are static, deterministic strings
"@
$storyCbt = New-Issue -Title "Story: CBT Thought Record Log" -Body $story -Labels "mobile,testing,compliance"
Set-Parent -IssueId $storyCbt.id -ParentId $epicCapture.id
$taskCbtForm = New-Issue -Title "Task: Mobile – CBT Form UI" -Body "Implement CBT Thought Record form UI with required/optional fields and constraints." -Labels "mobile"
Set-Parent -IssueId $taskCbtForm.id -ParentId $storyCbt.id
$taskCbtValidation = New-Issue -Title "Task: Mobile – CBT Validation" -Body "Implement validation and static error messaging for CBT Thought Record." -Labels "mobile,testing"
Set-Parent -IssueId $taskCbtValidation.id -ParentId $storyCbt.id
$taskCbtConsent = New-Issue -Title "Task: Mobile – CBT Consent Gate" -Body "Block submit until consent is confirmed." -Labels "mobile,compliance"
Set-Parent -IssueId $taskCbtConsent.id -ParentId $storyCbt.id

# =========================
# Story 1.3 Sleep Log (CBT-I)
# =========================
$story = @"
As a client, I want to record my sleep log so that my therapist can review sleep patterns.
Acceptance Criteria:
- Required fields: bedtime, lights out, wake time, onset latency (minutes), awakenings (count), sleep quality (1–5), restedness (1–10)
- Optional fields: substances
- No derived metrics and no time ordering enforcement
- Consent required before submission
- Errors are static, deterministic strings
"@
$storySleep = New-Issue -Title "Story: Sleep Log (CBT-I)" -Body $story -Labels "mobile,testing,compliance"
Set-Parent -IssueId $storySleep.id -ParentId $epicCapture.id
$taskSleepForm = New-Issue -Title "Task: Mobile – Sleep Log Form UI" -Body "Implement Sleep Log form UI with required/optional fields and constraints." -Labels "mobile"
Set-Parent -IssueId $taskSleepForm.id -ParentId $storySleep.id
$taskSleepValidation = New-Issue -Title "Task: Mobile – Sleep Log Validation" -Body "Implement validation and static error messaging for Sleep Log." -Labels "mobile,testing"
Set-Parent -IssueId $taskSleepValidation.id -ParentId $storySleep.id
$taskSleepConsent = New-Issue -Title "Task: Mobile – Sleep Log Consent Gate" -Body "Block submit until consent is confirmed." -Labels "mobile,compliance"
Set-Parent -IssueId $taskSleepConsent.id -ParentId $storySleep.id

# =========================
# Story 1.4 Panic Attack Log
# =========================
$story = @"
As a client, I want to record a panic attack log so that my therapist can review my episode details.
Acceptance Criteria:
- Required fields: symptoms, thoughts, peak distress (0–10)
- Optional fields: trigger, behavior, duration (minutes)
- Consent required before submission
- Errors are static, deterministic strings
"@
$storyPanic = New-Issue -Title "Story: Panic Attack Log" -Body $story -Labels "mobile,testing,compliance"
Set-Parent -IssueId $storyPanic.id -ParentId $epicCapture.id
$taskPanicForm = New-Issue -Title "Task: Mobile – Panic Log Form UI" -Body "Implement Panic Log form UI with required/optional fields and constraints." -Labels "mobile"
Set-Parent -IssueId $taskPanicForm.id -ParentId $storyPanic.id
$taskPanicValidation = New-Issue -Title "Task: Mobile – Panic Log Validation" -Body "Implement validation and static error messaging for Panic Log." -Labels "mobile,testing"
Set-Parent -IssueId $taskPanicValidation.id -ParentId $storyPanic.id
$taskPanicConsent = New-Issue -Title "Task: Mobile – Panic Log Consent Gate" -Body "Block submit until consent is confirmed." -Labels "mobile,compliance"
Set-Parent -IssueId $taskPanicConsent.id -ParentId $storyPanic.id

# =========================
# Story 1.5 Behavioral Activation
# =========================
$story = @"
As a client, I want to record a behavioral activation activity so that my therapist can review my activity impact.
Acceptance Criteria:
- Required fields: time block, activity, mastery (0–10), pleasure (0–10)
- Consent required before submission
- Errors are static, deterministic strings
"@
$storyBa = New-Issue -Title "Story: Behavioral Activation Log" -Body $story -Labels "mobile,testing,compliance"
Set-Parent -IssueId $storyBa.id -ParentId $epicCapture.id
$taskBaForm = New-Issue -Title "Task: Mobile – Behavioral Activation Form UI" -Body "Implement Behavioral Activation form UI with required fields and constraints." -Labels "mobile"
Set-Parent -IssueId $taskBaForm.id -ParentId $storyBa.id
$taskBaValidation = New-Issue -Title "Task: Mobile – Behavioral Activation Validation" -Body "Implement validation and static error messaging for Behavioral Activation." -Labels "mobile,testing"
Set-Parent -IssueId $taskBaValidation.id -ParentId $storyBa.id
$taskBaConsent = New-Issue -Title "Task: Mobile – Behavioral Activation Consent Gate" -Body "Block submit until consent is confirmed." -Labels "mobile,compliance"
Set-Parent -IssueId $taskBaConsent.id -ParentId $storyBa.id

# =========================
# Story 1.6 Exposure Hierarchy (ERP)
# =========================
$story = @"
As a client, I want to record an exposure task so that my therapist can review my ERP progress.
Acceptance Criteria:
- Required fields: exposure task, pre SUDS (0–100), peak SUDS (0–100), post SUDS (0–100)
- Optional fields: prediction, outcome
- No delta scoring
- Consent required before submission
- Errors are static, deterministic strings
"@
$storyErp = New-Issue -Title "Story: Exposure Hierarchy (ERP)" -Body $story -Labels "mobile,testing,compliance"
Set-Parent -IssueId $storyErp.id -ParentId $epicCapture.id
$taskErpForm = New-Issue -Title "Task: Mobile – ERP Form UI" -Body "Implement ERP form UI with required/optional fields and constraints." -Labels "mobile"
Set-Parent -IssueId $taskErpForm.id -ParentId $storyErp.id
$taskErpValidation = New-Issue -Title "Task: Mobile – ERP Validation" -Body "Implement validation and static error messaging for ERP." -Labels "mobile,testing"
Set-Parent -IssueId $taskErpValidation.id -ParentId $storyErp.id
$taskErpConsent = New-Issue -Title "Task: Mobile – ERP Consent Gate" -Body "Block submit until consent is confirmed." -Labels "mobile,compliance"
Set-Parent -IssueId $taskErpConsent.id -ParentId $storyErp.id

# =========================
# Story 1.7 Food & Emotional Eating
# =========================
$story = @"
As a client, I want to record a food and emotional eating log so that my therapist can review eating patterns.
Acceptance Criteria:
- Required fields: food item, binge/purge explicit selection, hunger (1–10), fullness (1–10)
- Optional fields: context, emotional state
- Validation order enforced: food_item → binge_purge → hunger → fullness
- Consent required before submission
- Errors are static, deterministic strings
"@
$storyFood = New-Issue -Title "Story: Food & Emotional Eating Log" -Body $story -Labels "mobile,testing,compliance"
Set-Parent -IssueId $storyFood.id -ParentId $epicCapture.id
$taskFoodForm = New-Issue -Title "Task: Mobile – Food Log Form UI" -Body "Implement Food & Emotional Eating form UI with required/optional fields and constraints." -Labels "mobile"
Set-Parent -IssueId $taskFoodForm.id -ParentId $storyFood.id
$taskFoodValidation = New-Issue -Title "Task: Mobile – Food Log Validation" -Body "Enforce validation order and static error strings for Food Log." -Labels "mobile,testing"
Set-Parent -IssueId $taskFoodValidation.id -ParentId $storyFood.id
$taskFoodConsent = New-Issue -Title "Task: Mobile – Food Log Consent Gate" -Body "Block submit until consent is confirmed." -Labels "mobile,compliance"
Set-Parent -IssueId $taskFoodConsent.id -ParentId $storyFood.id

# =========================
# Story 1.8 Chronic Pain
# =========================
$story = @"
As a client, I want to record a chronic pain log so that my therapist can review pain impact.
Acceptance Criteria:
- Required fields: time, pain intensity (0–10), interference (0–10), emotional distress (0–10)
- Optional fields: activity
- Consent required before submission
- Errors are static, deterministic strings
"@
$storyPain = New-Issue -Title "Story: Chronic Pain Log" -Body $story -Labels "mobile,testing,compliance"
Set-Parent -IssueId $storyPain.id -ParentId $epicCapture.id
$taskPainForm = New-Issue -Title "Task: Mobile – Chronic Pain Form UI" -Body "Implement Chronic Pain form UI with required/optional fields and constraints." -Labels "mobile"
Set-Parent -IssueId $taskPainForm.id -ParentId $storyPain.id
$taskPainValidation = New-Issue -Title "Task: Mobile – Chronic Pain Validation" -Body "Implement validation and static error messaging for Chronic Pain." -Labels "mobile,testing"
Set-Parent -IssueId $taskPainValidation.id -ParentId $storyPain.id
$taskPainConsent = New-Issue -Title "Task: Mobile – Chronic Pain Consent Gate" -Body "Block submit until consent is confirmed." -Labels "mobile,compliance"
Set-Parent -IssueId $taskPainConsent.id -ParentId $storyPain.id

# =========================
# Story 2.1 Offline Encrypted Queue & Auto-Sync
# =========================
$story = @"
As a client, I want my submissions queued securely when offline so that they are submitted automatically when connectivity returns.
Acceptance Criteria:
- Queue encrypted at rest
- Max 50 queued submissions
- Auto-sync on connectivity restoration
- Deterministic behavior and static error strings
"@
$storyQueue = New-Issue -Title "Story: Offline Encrypted Queue & Auto-Sync" -Body $story -Labels "mobile,backend,compliance,infra,testing"
Set-Parent -IssueId $storyQueue.id -ParentId $epicQueue.id
$taskQueueStorage = New-Issue -Title "Task: Mobile – Encrypted Queue Storage" -Body "Implement encrypted local queue storage." -Labels "mobile,compliance"
Set-Parent -IssueId $taskQueueStorage.id -ParentId $storyQueue.id
$taskQueueLimit = New-Issue -Title "Task: Mobile – Queue Limit Enforcement" -Body "Enforce max 50 queue limit with deterministic error." -Labels "mobile,testing"
Set-Parent -IssueId $taskQueueLimit.id -ParentId $storyQueue.id
$taskQueueSync = New-Issue -Title "Task: Mobile – Auto-Sync Trigger" -Body "Implement connectivity listener and auto-sync submission." -Labels "mobile"
Set-Parent -IssueId $taskQueueSync.id -ParentId $storyQueue.id
$taskQueueBackend = New-Issue -Title "Task: Backend – Idempotent Submission Handling" -Body "Ensure submissions can be safely retried." -Labels "backend,testing"
Set-Parent -IssueId $taskQueueBackend.id -ParentId $storyQueue.id

# =========================
# Story 3.1 Deterministic Draft Note Synthesis
# =========================
$story = @"
As a therapist, I want draft notes generated deterministically so that I can review and approve without clinical interpretation.
Acceptance Criteria:
- Template-based synthesis per log type
- Static deterministic error strings
- No diagnosis or clinical interpretation
"@
$storySynthesis = New-Issue -Title "Story: Deterministic Draft Note Synthesis" -Body $story -Labels "backend,compliance,testing"
Set-Parent -IssueId $storySynthesis.id -ParentId $epicNotes.id
$taskSynthesisTemplate = New-Issue -Title "Task: Backend – Template-Based Note Generation" -Body "Implement template-based note generation per log type." -Labels "backend"
Set-Parent -IssueId $taskSynthesisTemplate.id -ParentId $storySynthesis.id
$taskSynthesisMapping = New-Issue -Title "Task: Backend – Field Mapping to SO Sections" -Body "Map fields into Subjective/Objective per CRS." -Labels "backend,testing"
Set-Parent -IssueId $taskSynthesisMapping.id -ParentId $storySynthesis.id

# =========================
# Story 3.2 Pending Review Status
# =========================
$story = @"
As a therapist, I want all log-derived notes to be Pending Review so that I maintain final clinical authority.
Acceptance Criteria:
- Notes created as Pending Review drafts
- Therapist approval required for official record
"@
$storyPending = New-Issue -Title "Story: Draft Notes Created as Pending Review" -Body $story -Labels "backend,frontend,compliance,testing"
Set-Parent -IssueId $storyPending.id -ParentId $epicNotes.id
$taskPendingBackend = New-Issue -Title "Task: Backend – Pending Review Status on Create" -Body "Ensure note status is Pending Review." -Labels "backend,compliance"
Set-Parent -IssueId $taskPendingBackend.id -ParentId $storyPending.id
$taskPendingFrontend = New-Issue -Title "Task: Frontend – Show Pending Review Status" -Body "Surface Pending Review status in Owl Practice UI." -Labels "frontend,testing"
Set-Parent -IssueId $taskPendingFrontend.id -ParentId $storyPending.id

# =========================
# Story 4.1 UTC Submission Timestamp
# =========================
$story = @"
As a system, I want submission timestamps stored in UTC so that records are consistent and compliant.
Acceptance Criteria:
- submitted_at_utc stored in UTC at submit
- Localized display only at presentation layer
"@
$storyUtc = New-Issue -Title "Story: UTC Submission Timestamp" -Body $story -Labels "backend,frontend,compliance,testing"
Set-Parent -IssueId $storyUtc.id -ParentId $epicCompliance.id
$taskUtcBackend = New-Issue -Title "Task: Backend – Store submitted_at_utc" -Body "Persist submission timestamp in UTC." -Labels "backend,compliance"
Set-Parent -IssueId $taskUtcBackend.id -ParentId $storyUtc.id
$taskUtcFrontend = New-Issue -Title "Task: Frontend – Localized Display" -Body "Display localized timestamps only." -Labels "frontend,testing"
Set-Parent -IssueId $taskUtcFrontend.id -ParentId $storyUtc.id

# =========================
# Story 4.2 Consent Required
# =========================
$story = @"
As a client, I want to explicitly consent before submission so that I control what is sent.
Acceptance Criteria:
- Consent required before creating/submitting any log entry
- Submission blocked without consent
"@
 	$storyConsent = New-Issue -Title "Story: Consent Required Before Submission" -Body $story -Labels "mobile,compliance,testing"
	Set-Parent -IssueId $storyConsent.id -ParentId $epicCompliance.id
	$taskConsent = New-Issue -Title "Task: Mobile – Consent Gate" -Body "Add consent confirmation gate prior to submit and include consent status in payload." -Labels "mobile,compliance"
	Set-Parent -IssueId $taskConsent.id -ParentId $storyConsent.id
}

if ($WireOnly) {
	$epicCapture = Get-Issue-ByTitle "Epic: Client Log Capture & Validation"
	$epicQueue = Get-Issue-ByTitle "Epic: Client Log Persistence, Queueing, and Sync"
	$epicNotes = Get-Issue-ByTitle "Epic: Note Draft Generation & Therapist Review"
	$epicCompliance = Get-Issue-ByTitle "Epic: Timestamp Handling & Compliance Guardrails"

	$storyMood = Get-Issue-ByTitle "Story: Mood Diary Log"
	Set-Parent -IssueId $storyMood.id -ParentId $epicCapture.id
	$taskMoodForm = Get-Issue-ByTitle "Task: Mobile – Mood Diary Form UI"
	Set-Parent -IssueId $taskMoodForm.id -ParentId $storyMood.id
	$taskMoodValidation = Get-Issue-ByTitle "Task: Mobile – Mood Diary Validation"
	Set-Parent -IssueId $taskMoodValidation.id -ParentId $storyMood.id
	$taskMoodConsent = Get-Issue-ByTitle "Task: Mobile – Mood Diary Consent Gate"
	Set-Parent -IssueId $taskMoodConsent.id -ParentId $storyMood.id

	$storyCbt = Get-Issue-ByTitle "Story: CBT Thought Record Log"
	Set-Parent -IssueId $storyCbt.id -ParentId $epicCapture.id
	$taskCbtForm = Get-Issue-ByTitle "Task: Mobile – CBT Form UI"
	Set-Parent -IssueId $taskCbtForm.id -ParentId $storyCbt.id
	$taskCbtValidation = Get-Issue-ByTitle "Task: Mobile – CBT Validation"
	Set-Parent -IssueId $taskCbtValidation.id -ParentId $storyCbt.id
	$taskCbtConsent = Get-Issue-ByTitle "Task: Mobile – CBT Consent Gate"
	Set-Parent -IssueId $taskCbtConsent.id -ParentId $storyCbt.id

	$storySleep = Get-Issue-ByTitle "Story: Sleep Log (CBT-I)"
	Set-Parent -IssueId $storySleep.id -ParentId $epicCapture.id
	$taskSleepForm = Get-Issue-ByTitle "Task: Mobile – Sleep Log Form UI"
	Set-Parent -IssueId $taskSleepForm.id -ParentId $storySleep.id
	$taskSleepValidation = Get-Issue-ByTitle "Task: Mobile – Sleep Log Validation"
	Set-Parent -IssueId $taskSleepValidation.id -ParentId $storySleep.id
	$taskSleepConsent = Get-Issue-ByTitle "Task: Mobile – Sleep Log Consent Gate"
	Set-Parent -IssueId $taskSleepConsent.id -ParentId $storySleep.id

	$storyPanic = Get-Issue-ByTitle "Story: Panic Attack Log"
	Set-Parent -IssueId $storyPanic.id -ParentId $epicCapture.id
	$taskPanicForm = Get-Issue-ByTitle "Task: Mobile – Panic Log Form UI"
	Set-Parent -IssueId $taskPanicForm.id -ParentId $storyPanic.id
	$taskPanicValidation = Get-Issue-ByTitle "Task: Mobile – Panic Log Validation"
	Set-Parent -IssueId $taskPanicValidation.id -ParentId $storyPanic.id
	$taskPanicConsent = Get-Issue-ByTitle "Task: Mobile – Panic Log Consent Gate"
	Set-Parent -IssueId $taskPanicConsent.id -ParentId $storyPanic.id

	$storyBa = Get-Issue-ByTitle "Story: Behavioral Activation Log"
	Set-Parent -IssueId $storyBa.id -ParentId $epicCapture.id
	$taskBaForm = Get-Issue-ByTitle "Task: Mobile – Behavioral Activation Form UI"
	Set-Parent -IssueId $taskBaForm.id -ParentId $storyBa.id
	$taskBaValidation = Get-Issue-ByTitle "Task: Mobile – Behavioral Activation Validation"
	Set-Parent -IssueId $taskBaValidation.id -ParentId $storyBa.id
	$taskBaConsent = Get-Issue-ByTitle "Task: Mobile – Behavioral Activation Consent Gate"
	Set-Parent -IssueId $taskBaConsent.id -ParentId $storyBa.id

	$storyErp = Get-Issue-ByTitle "Story: Exposure Hierarchy (ERP)"
	Set-Parent -IssueId $storyErp.id -ParentId $epicCapture.id
	$taskErpForm = Get-Issue-ByTitle "Task: Mobile – ERP Form UI"
	Set-Parent -IssueId $taskErpForm.id -ParentId $storyErp.id
	$taskErpValidation = Get-Issue-ByTitle "Task: Mobile – ERP Validation"
	Set-Parent -IssueId $taskErpValidation.id -ParentId $storyErp.id
	$taskErpConsent = Get-Issue-ByTitle "Task: Mobile – ERP Consent Gate"
	Set-Parent -IssueId $taskErpConsent.id -ParentId $storyErp.id

	$storyFood = Get-Issue-ByTitle "Story: Food & Emotional Eating Log"
	Set-Parent -IssueId $storyFood.id -ParentId $epicCapture.id
	$taskFoodForm = Get-Issue-ByTitle "Task: Mobile – Food Log Form UI"
	Set-Parent -IssueId $taskFoodForm.id -ParentId $storyFood.id
	$taskFoodValidation = Get-Issue-ByTitle "Task: Mobile – Food Log Validation"
	Set-Parent -IssueId $taskFoodValidation.id -ParentId $storyFood.id
	$taskFoodConsent = Get-Issue-ByTitle "Task: Mobile – Food Log Consent Gate"
	Set-Parent -IssueId $taskFoodConsent.id -ParentId $storyFood.id

	$storyPain = Get-Issue-ByTitle "Story: Chronic Pain Log"
	Set-Parent -IssueId $storyPain.id -ParentId $epicCapture.id
	$taskPainForm = Get-Issue-ByTitle "Task: Mobile – Chronic Pain Form UI"
	Set-Parent -IssueId $taskPainForm.id -ParentId $storyPain.id
	$taskPainValidation = Get-Issue-ByTitle "Task: Mobile – Chronic Pain Validation"
	Set-Parent -IssueId $taskPainValidation.id -ParentId $storyPain.id
	$taskPainConsent = Get-Issue-ByTitle "Task: Mobile – Chronic Pain Consent Gate"
	Set-Parent -IssueId $taskPainConsent.id -ParentId $storyPain.id

	$storyQueue = Get-Issue-ByTitle "Story: Offline Encrypted Queue & Auto-Sync"
	Set-Parent -IssueId $storyQueue.id -ParentId $epicQueue.id
	$taskQueueStorage = Get-Issue-ByTitle "Task: Mobile – Encrypted Queue Storage"
	Set-Parent -IssueId $taskQueueStorage.id -ParentId $storyQueue.id
	$taskQueueLimit = Get-Issue-ByTitle "Task: Mobile – Queue Limit Enforcement"
	Set-Parent -IssueId $taskQueueLimit.id -ParentId $storyQueue.id
	$taskQueueSync = Get-Issue-ByTitle "Task: Mobile – Auto-Sync Trigger"
	Set-Parent -IssueId $taskQueueSync.id -ParentId $storyQueue.id
	$taskQueueBackend = Get-Issue-ByTitle "Task: Backend – Idempotent Submission Handling"
	Set-Parent -IssueId $taskQueueBackend.id -ParentId $storyQueue.id

	$storySynthesis = Get-Issue-ByTitle "Story: Deterministic Draft Note Synthesis"
	Set-Parent -IssueId $storySynthesis.id -ParentId $epicNotes.id
	$taskSynthesisTemplate = Get-Issue-ByTitle "Task: Backend – Template-Based Note Generation"
	Set-Parent -IssueId $taskSynthesisTemplate.id -ParentId $storySynthesis.id
	$taskSynthesisMapping = Get-Issue-ByTitle "Task: Backend – Field Mapping to SO Sections"
	Set-Parent -IssueId $taskSynthesisMapping.id -ParentId $storySynthesis.id

	$storyPending = Get-Issue-ByTitle "Story: Draft Notes Created as Pending Review"
	Set-Parent -IssueId $storyPending.id -ParentId $epicNotes.id
	$taskPendingBackend = Get-Issue-ByTitle "Task: Backend – Pending Review Status on Create"
	Set-Parent -IssueId $taskPendingBackend.id -ParentId $storyPending.id
	$taskPendingFrontend = Get-Issue-ByTitle "Task: Frontend – Show Pending Review Status"
	Set-Parent -IssueId $taskPendingFrontend.id -ParentId $storyPending.id

	$storyUtc = Get-Issue-ByTitle "Story: UTC Submission Timestamp"
	Set-Parent -IssueId $storyUtc.id -ParentId $epicCompliance.id
	$taskUtcBackend = Get-Issue-ByTitle "Task: Backend – Store submitted_at_utc"
	Set-Parent -IssueId $taskUtcBackend.id -ParentId $storyUtc.id
	$taskUtcFrontend = Get-Issue-ByTitle "Task: Frontend – Localized Display"
	Set-Parent -IssueId $taskUtcFrontend.id -ParentId $storyUtc.id

	$storyConsent = Get-Issue-ByTitle "Story: Consent Required Before Submission"
	Set-Parent -IssueId $storyConsent.id -ParentId $epicCompliance.id
	$taskConsent = Get-Issue-ByTitle "Task: Mobile – Consent Gate"
	Set-Parent -IssueId $taskConsent.id -ParentId $storyConsent.id
}
