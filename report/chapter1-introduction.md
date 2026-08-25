# Chapter 1: Introduction

## 1.1 Background of the Study

Immigration control is a core function of national sovereignty, requiring the accurate identification of travelers, the timely processing of visa applications, and the reliable monitoring of entry and exit at national borders. Many national immigration authorities have moved toward digital systems that reduce processing time, improve record accuracy, and support risk-based decision-making at the border (see Chapter 2, Literature Review, for a comparative review of Singapore, Canada, the United Kingdom, Australia, and the United Arab Emirates).

The Sierra Leone Immigration Department (SLID) is responsible for traveler registration, visa issuance, and border control across the country's airports, land borders, and seaports. [Insert here: a brief, factual description of SLID's current process, based on your own research/interviews — e.g., extent of paper-based recordkeeping, manual visa processing, or any existing partial digitization. This section should be grounded in your own primary research rather than assumptions, since it is the justification for the entire project.]

## 1.2 Problem Statement

Manual and paper-based immigration processes are associated with several well-documented limitations that this project addresses:

1. **Slow processing** — paper-based visa applications and manual document review extend processing time for both applicants and officers.
2. **Data fragmentation** — traveler, passport, and visa records maintained on paper or in disconnected systems are difficult to cross-reference, search, or audit.
3. **Limited real-time visibility** — without a shared entry/exit record, identifying travelers who have overstayed their authorized period is a manual, retrospective process rather than a proactive one.
4. **Weak accountability** — actions taken by staff (application decisions, border crossing decisions) are not consistently logged in a way that supports later review.
5. **No systematic risk prioritization** — without structured risk indicators (watchlist status, prior overstay history, application patterns), officers must rely entirely on manual judgment and institutional memory, which does not scale as traveler volume grows.

*(Adjust this list to match SLID's actual documented pain points if you have access to departmental reports or interview data — a problem statement grounded in real evidence from your case study organization is significantly stronger than a generic one.)*

## 1.3 Aim

To design and implement a web-based immigration management system for the Sierra Leone Immigration Department that digitizes traveler registration, visa processing, and entry/exit monitoring, incorporating risk-based decision support while preserving human officer authority over all final decisions.

## 1.4 Objectives

1. To design a relational database schema capable of representing traveler, passport, visa, staff, checkpoint, and border-crossing records with appropriate integrity constraints and access controls.
2. To implement a public-facing portal through which applicants can register, submit visa applications, and track application status.
3. To implement an officer-facing workflow for reviewing, approving, rejecting, and issuing digital visas.
4. To implement a border check-in workflow incorporating simulated biometric verification and a transparent, rules-based risk assessment, in which the assessing officer retains final decision authority.
5. To implement an overstay-detection mechanism based on entry/exit records and visa validity periods.
6. To implement role-based access control and an auditable administrative layer for user, checkpoint, and system management.
7. To evaluate the system through structured testing against defined test cases (Chapter 4) and to critically assess its limitations relative to more resourced international systems (Chapter 5).

## 1.5 Scope of the Study

### In scope (implemented and demonstrated):
- Traveler registration, passport records, visa application and approval workflow, digital visa issuance
- Entry/exit logging at checkpoints, simulated biometric verification, rules-based risk scoring
- Watchlist management, overstay detection
- Role-based access control (applicant, immigration officer, visa officer, admin)
- Administrative reporting, exportable reports, and an audit trail

### Out of scope (discussed but not implemented — see Chapter 5, Limitations and Future Work):
- Integration with real biometric hardware (fingerprint scanners, facial recognition cameras) or a trained biometric matching model
- Machine-learning-based risk scoring (the implemented risk engine is deterministic and rules-based by design — see Chapter 3, §3.x, Design Note on ethical risk scoring)
- Integration with national or international databases (e.g., INTERPOL watchlists, ECOWAS member-state systems)
- Payment gateway integration beyond a data-model placeholder for mobile money transactions
- Multi-language support

## 1.6 Significance of the Study

This project is significant for three audiences:

- **For SLID**, it demonstrates a concrete, low-cost architecture (a small officer-facing web application backed by a managed Postgres database) that could inform future digitization efforts, without requiring the infrastructure investment of the more resourced systems reviewed in Chapter 2.
- **For the applicant/traveler**, it demonstrates how a public visa application portal can reduce reliance on in-person, paper-based submission.
- **For the wider field**, it contributes a worked example of how automated risk-assessment can be designed to support rather than replace human officer judgment — a design principle with relevance beyond this specific case study, particularly for immigration authorities in similar resource contexts considering their own digitization path.

## 1.7 Organization of the Report

- **Chapter 2** reviews international immigration system approaches and derives design principles applicable to SLID's context.
- **Chapter 3** presents the system design: requirements, database schema, use case analysis, sequence diagrams, and deployment architecture.
- **Chapter 4** presents the implementation and the testing plan/results.
- **Chapter 5** concludes the study, discusses limitations and ethical considerations, and recommends directions for future work.
