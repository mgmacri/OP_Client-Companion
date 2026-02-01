{
  "version": "1.0",
  "last_reviewed_date": "2026-02-01",
  "scope": {
    "product_example": "Mood diary app with explicit user consent to share logs with a practitioner (psychologist/counsellor/therapist).",
    "data_types": [
      "personal information (PI)",
      "personal health information / health information (PHI/HI)",
      "highly sensitive mental-health notes (free-text journal entries)"
    ],
    "typical_roles": {
      "practitioner": {
        "role_name": "health information custodian / custodian (varies by province & setting)",
        "core_obligations": [
          "lawful collection/use/disclosure for care",
          "record retention per professional standards",
          "responding to access requests",
          "breach notifications to regulators/individuals when required"
        ]
      },
      "app_company": {
        "role_name": "service provider / processor / information manager / electronic service provider (terminology varies)",
        "core_obligations": [
          "process only under written instructions / agreement",
          "implement safeguards and auditability",
          "support practitioner compliance (retention, access logs, breach support)",
          "limit internal use (no secondary use without lawful basis & appropriate consent)"
        ]
      }
    }
  },
  "legal_landscape_map": {
    "federal_baseline": {
      "name": "PIPEDA (private-sector commercial activity)",
      "key_concepts": [
        "accountability",
        "identifying purposes",
        "meaningful consent",
        "limiting collection/use/disclosure/retention",
        "safeguards",
        "openness",
        "individual access"
      ]
    },
    "provincial_examples": {
      "ON": {
        "name": "Ontario PHIPA (personal health information)",
        "notes": [
          "Often used as a practical benchmark for health apps serving providers in Ontario.",
          "Requires strong controls around access, consent directives, and auditability in many health contexts."
        ]
      },
      "BC": {
        "name": "BC PIPA + (where relevant) E-Health Act",
        "notes": [
          "Private practices commonly align to PIPA; additional health-sector rules may apply depending on integration with provincial health information banks."
        ]
      },
      "AB": {
        "name": "Alberta HIA (health information)",
        "notes": [
          "HIA is central for custodians; logging/auditing expectations exist in the Alberta health sector."
        ]
      },
      "QC": {
        "name": "Québec Private Sector Act as amended by Law 25",
        "notes": [
          "Higher governance requirements (privacy officer), incident register, and stronger rules for cross-border transfers and privacy impact assessments."
        ]
      }
    }
  },
  "non_negotiable_controls": [
    {
      "id": "GOV-01",
      "name": "Privacy governance & accountability",
      "requirements": [
        "Assign a privacy lead/owner responsible for the privacy program, policies, and incident handling.",
        "Maintain an internal privacy management program: policies, training, risk tracking, vendor oversight, and review cadence."
      ],
      "evidence_artifacts": [
        "privacy program doc",
        "RACI",
        "training logs",
        "policy register"
      ]
    },
    {
      "id": "DATA-01",
      "name": "Data inventory & classification",
      "requirements": [
        "Maintain a living data map: what data you collect, where it flows, where it is stored, and who can access it.",
        "Classify mood diary content (especially free text) as highly sensitive; treat it as health information by default."
      ],
      "evidence_artifacts": [
        "data flow diagrams",
        "data inventory",
        "data classification standard"
      ]
    },
    {
      "id": "CONSENT-01",
      "name": "Meaningful, explicit consent for sharing with a practitioner",
      "requirements": [
        "Require an explicit opt-in action before any sharing with a practitioner account (no default sharing).",
        "Provide granular sharing controls (e.g., share mood scores/graphs vs. share free-text entries).",
        "Record consent events (who, what scope, when, how) and support withdrawal."
      ],
      "evidence_artifacts": [
        "consent UX specs",
        "consent event schema",
        "consent audit reports"
      ]
    },
    {
      "id": "CONSENT-02",
      "name": "Consent withdrawal / unlinking",
      "requirements": [
        "Allow users to revoke sharing at any time.",
        "Revocation must stop future access immediately (token revocation, access rule updates).",
        "Clarify what happens to already-shared data that forms part of a practitioner record (retention obligations may apply)."
      ],
      "evidence_artifacts": [
        "revocation flow test cases",
        "access control policy",
        "token revocation logs"
      ]
    },
    {
      "id": "ACCESS-01",
      "name": "Strong authentication & role-based access control (RBAC)",
      "requirements": [
        "Separate user and practitioner identity domains.",
        "Enforce MFA for practitioner accounts.",
        "Implement least privilege (practitioner can only access linked clients)."
      ],
      "evidence_artifacts": [
        "IAM policy",
        "RBAC matrix",
        "MFA enforcement proof"
      ]
    },
    {
      "id": "SEC-01",
      "name": "Encryption in transit and at rest",
      "requirements": [
        "TLS for all network communications.",
        "Encrypt sensitive data at rest using modern, industry-standard cryptography.",
        "Protect secrets/keys using a managed KMS/HSM where feasible."
      ],
      "evidence_artifacts": [
        "TLS configuration",
        "KMS key policies",
        "security architecture doc"
      ]
    },
    {
      "id": "SEC-02",
      "name": "Optional end-to-end encryption (E2EE) for free-text notes",
      "requirements": [
        "For the highest-sensitivity journal content, consider E2EE so the service operator cannot read plaintext.",
        "If E2EE is used, design recovery and key-rotation policies explicitly (avoid silent lockouts)."
      ],
      "evidence_artifacts": [
        "crypto design doc",
        "key management procedures",
        "threat model"
      ]
    },
    {
      "id": "AUDIT-01",
      "name": "Immutable audit logging for access and disclosure",
      "requirements": [
        "Log all access to sensitive records: actor, patient/user, data category, timestamp, action, and outcome.",
        "Log consent creation/withdrawal and sharing events.",
        "Protect logs from tampering (WORM storage / append-only design) and restrict access."
      ],
      "evidence_artifacts": [
        "audit event taxonomy",
        "WORM/immutability configuration",
        "audit review procedures"
      ]
    },
    {
      "id": "MIN-01",
      "name": "Data minimization & purpose limitation",
      "requirements": [
        "Collect only what is necessary for the mood diary and sharing purpose.",
        "Disable or strictly segregate analytics/marketing tracking from PHI/HI.",
        "No secondary use (model training, advertising, profiling) without a clear lawful basis and appropriate consent."
      ],
      "evidence_artifacts": [
        "collection spec",
        "analytics DPIA/PIA",
        "data use policy"
      ]
    },
    {
      "id": "VENDOR-01",
      "name": "Written agreements with practitioners and subprocessors",
      "requirements": [
        "Execute a data processing / service provider agreement with practitioner organizations that defines roles, instructions, safeguards, audit rights, breach notice timelines, and retention/export responsibilities.",
        "Maintain a subprocessor list (cloud, email, push notifications) and flow down obligations contractually."
      ],
      "evidence_artifacts": [
        "DPA template",
        "subprocessor register",
        "security annex"
      ]
    },
    {
      "id": "XFER-01",
      "name": "Cross-border transfers & data residency strategy",
      "requirements": [
        "Decide and document where data is stored and accessed from (regions, backups, support tooling).",
        "If serving Québec users, perform a privacy impact assessment before communicating personal information outside Québec, and implement contractual/technical protections accordingly.",
        "Prefer Canadian hosting for sensitive health data to reduce cross-border access risk and customer friction."
      ],
      "evidence_artifacts": [
        "hosting architecture",
        "cross-border transfer assessment (QC)",
        "vendor transfer clauses"
      ]
    },
    {
      "id": "RET-01",
      "name": "Retention, deletion, and practitioner record obligations",
      "requirements": [
        "Define retention by data category (user-owned diary vs. practitioner record copy).",
        "Support user account deletion, but do not break lawful practitioner retention duties for records already incorporated into clinical files.",
        "Implement export/archival pathways so practitioners can retain required records independent of the app if needed."
      ],
      "evidence_artifacts": [
        "retention schedule",
        "deletion design doc",
        "export workflow specs"
      ]
    },
    {
      "id": "RIGHTS-01",
      "name": "Individual access & correction",
      "requirements": [
        "Provide users a way to access their diary data and sharing history.",
        "Provide correction mechanisms (or append-only corrections where required for clinical integrity).",
        "Route requests that relate to the practitioner’s clinical record appropriately (often the practitioner is the responding party)."
      ],
      "evidence_artifacts": [
        "DSAR playbook",
        "request tracking",
        "response templates"
      ]
    },
    {
      "id": "INC-01",
      "name": "Breach / confidentiality incident management",
      "requirements": [
        "Detect, triage, and contain incidents; preserve evidence.",
        "Maintain an incident register; for Québec, maintain a register of confidentiality incidents and be prepared to provide it to the regulator on request.",
        "Define notification SLAs to practitioners so they can meet their legal reporting obligations."
      ],
      "evidence_artifacts": [
        "incident response plan",
        "incident register",
        "tabletop exercise reports"
      ]
    },
    {
      "id": "SDLC-01",
      "name": "Secure SDLC for health data",
      "requirements": [
        "Threat model the consent/sharing flows and practitioner access paths.",
        "Perform security testing (SAST/DAST/dependency scanning) and remediate high-risk findings.",
        "Implement environment separation and restrict production data access."
      ],
      "evidence_artifacts": [
        "threat models",
        "security test reports",
        "access reviews"
      ]
    }
  ],
  "quebec_law25_addendum": {
    "triggers": [
      "You collect/use/disclose personal information of Québec residents in the course of carrying on an enterprise."
    ],
    "extra_requirements": [
      "Designate a person in charge of the protection of personal information (privacy officer) and ensure governance is documented.",
      "Keep a register of confidentiality incidents and provide it to the regulator upon request.",
      "Before communicating personal information outside Québec, conduct a privacy impact assessment and ensure adequate protection."
    ],
    "recommended_artifacts": [
      "Law 25 governance memo",
      "incident register template",
      "cross-border PIA template"
    ]
  },
  "release_readiness_checks": [
    "DPA/service-provider agreement template finalized",
    "Data inventory + data flow diagram completed",
    "Consent grant/withdrawal fully tested (including immediate access revocation)",
    "MFA enforced for practitioners",
    "Audit logging verified (tamper-resistant storage; access reviews in place)",
    "Incident response runbook + tabletop exercise completed",
    "Retention/deletion behavior validated against practitioner recordkeeping expectations",
    "Québec cross-border assessment completed if applicable"
  ]
}
