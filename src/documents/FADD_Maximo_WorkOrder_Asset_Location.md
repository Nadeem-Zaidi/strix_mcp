# FUNCTIONAL ANALYSIS AND DESIGN DOCUMENT (FADD)

## IBM Maximo — Work Order, Asset, and Location Application
### Development and Enhancement Initiative

---

| **Document Control** | |
|---|---|
| **Document Title** | Functional Analysis and Design Document — Work Order, Asset & Location |
| **Document ID** | FADD-MX-WOAL-2025-001 |
| **Version** | 2.4.1 |
| **Status** | Approved — In Development |
| **Classification** | Internal — Restricted |
| **System** | IBM Maximo Application Suite (MAS) 8.11 |
| **Module** | Work Management / Asset Management / Location Management |
| **Prepared By** | Enterprise Asset Management (EAM) Solutions Team |
| **Organization** | Nexagen Infrastructure Services, LLC |
| **Date Created** | January 15, 2025 |
| **Last Revised** | March 3, 2025 |
| **Approved By** | Director of IT Operations, EAM Program Manager |

---

## REVISION HISTORY

| Version | Date | Author | Description |
|---|---|---|---|
| 1.0 | 2024-09-10 | J. Harmon | Initial draft — Work Order module scope |
| 1.5 | 2024-11-01 | M. Castillo | Added Asset Management functional requirements |
| 2.0 | 2024-12-15 | J. Harmon, T. Nguyen | Location Management integration, data model updates |
| 2.2 | 2025-01-20 | A. Patel | UI/UX enhancements, mobile Maximo Anywhere specs |
| 2.3 | 2025-02-10 | M. Castillo | Workflow automation, escalation rules added |
| 2.4 | 2025-02-25 | T. Nguyen | Integration specifications (ERP, GIS, IoT) |
| 2.4.1 | 2025-03-03 | J. Harmon | Final peer review corrections, approval submitted |

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Project Overview and Background](#2-project-overview-and-background)
3. [Scope](#3-scope)
4. [Stakeholders and Roles](#4-stakeholders-and-roles)
5. [Current State Analysis (As-Is)](#5-current-state-analysis-as-is)
6. [Future State Design (To-Be)](#6-future-state-design-to-be)
7. [Functional Requirements — Work Order Application](#7-functional-requirements--work-order-application)
8. [Functional Requirements — Asset Application](#8-functional-requirements--asset-application)
9. [Functional Requirements — Location Application](#9-functional-requirements--location-application)
10. [Business Rules and Validations](#10-business-rules-and-validations)
11. [Workflow Design](#11-workflow-design)
12. [Data Model and Field Specifications](#12-data-model-and-field-specifications)
13. [Integration Design](#13-integration-design)
14. [Security and Access Control](#14-security-and-access-control)
15. [Reporting and KPIs](#15-reporting-and-kpis)
16. [User Interface Enhancements](#16-user-interface-enhancements)
17. [Non-Functional Requirements](#17-non-functional-requirements)
18. [Testing Strategy](#18-testing-strategy)
19. [Migration and Conversion Plan](#19-migration-and-conversion-plan)
20. [Open Issues and Assumptions](#20-open-issues-and-assumptions)
21. [Glossary](#21-glossary)
22. [Appendices](#22-appendices)

---

## 1. EXECUTIVE SUMMARY

This Functional Analysis and Design Document (FADD) defines the functional specifications, business rules, data model enhancements, workflow configurations, and integration requirements for the development and enhancement of the **Work Order**, **Asset**, and **Location** applications within IBM Maximo Application Suite (MAS) version 8.11 for Nexagen Infrastructure Services, LLC.

The initiative is driven by the need to modernize legacy work management processes, improve asset lifecycle tracking accuracy, reduce unplanned downtime through predictive maintenance enablement, and enhance field technician productivity through mobile-first capabilities.

This document serves as the authoritative reference for all development, configuration, testing, and deployment activities associated with this program. It is intended for use by functional analysts, Maximo developers, system integrators, QA engineers, and project leadership.

**Key deliverables covered by this FADD:**

- Enhanced Work Order creation, approval, and closure workflows
- Asset hierarchy management and lifecycle tracking enhancements
- Location structure redesign with GIS integration
- Custom fields, validations, and automation scripts
- Integration with SAP ERP, ESRI ArcGIS, and IoT sensor platforms
- Mobile Maximo Anywhere configuration
- Role-based security model updates

---

## 2. PROJECT OVERVIEW AND BACKGROUND

### 2.1 Organization Background

Nexagen Infrastructure Services manages over 45,000 physical assets across 12 regional facilities including water treatment plants, substations, pumping stations, and administrative campuses. The organization operates IBM Maximo as its primary Enterprise Asset Management (EAM) platform, currently running on Maximo 7.6.1.2 with a planned migration to MAS 8.11.

### 2.2 Business Drivers

The following conditions have necessitated the current enhancement initiative:

- **Operational inefficiency:** Manual work order assignment and paper-based field data collection result in 3–5 hour data entry delays.
- **Asset data quality:** Over 38% of asset records lack complete specifications, acquisition dates, or maintenance history, reducing MTBF analysis reliability.
- **Location hierarchy gaps:** The existing location tree does not reflect current site configurations following two facility expansions in 2022 and 2023.
- **Integration gaps:** Work orders are not automatically generated from SAP Plant Maintenance (PM) notifications or from IoT sensor threshold breach alerts.
- **Compliance requirements:** NERC CIP and AWIA 2018 mandates require stricter asset lifecycle documentation and audit trail capabilities.
- **Mobile adoption:** Field technicians currently lack real-time access to work orders, asset history, and manuals in the field.

### 2.3 Program Objectives

| # | Objective | Success Metric |
|---|---|---|
| O-01 | Reduce work order cycle time | Reduce average WO cycle time by 25% within 6 months of go-live |
| O-02 | Improve asset data completeness | Achieve ≥ 95% asset record completeness score |
| O-03 | Enable predictive maintenance | Generate condition-based WOs from IoT triggers for 80% of critical assets |
| O-04 | Improve first-time fix rate | Increase FTFR from 62% to 80% |
| O-05 | GIS-enabled location management | 100% of functional locations mapped with GIS coordinates |
| O-06 | Mobile field workforce | 90% of field WO updates completed via mobile device |

---

## 3. SCOPE

### 3.1 In-Scope

The following Maximo applications and capabilities are within the scope of this FADD:

- **Work Order Tracking** application — full enhancement
- **Work Order (Quick Reporting)** — mobile optimization
- **Assets** application — full enhancement
- **Locations** application — full enhancement
- **Job Plans** application — supporting enhancements
- **Preventive Maintenance** application — supporting enhancements
- **Safety Plans** — integration with WO application
- **Service Requests** — conversion to Work Orders
- **Automation Scripts (AUTOSCRIPT)** — new and modified scripts
- **Workflow Designer** — new and modified workflows
- **Report Designer (BIRT)** — new operational reports
- **Integration Framework** — SAP, GIS, IoT, and Document Management

### 3.2 Out-of-Scope

The following are explicitly excluded from this FADD:

- Purchasing and Inventory applications (covered under separate FADD-MX-INV-2025-002)
- Labor and Craft management redesign
- Financial module configurations
- Maximo Spatial integration with non-ESRI platforms
- Third-party mobile platforms other than Maximo Anywhere / Maximo Mobile

### 3.3 Assumptions

- IBM Maximo MAS 8.11 licensing is in place prior to development start.
- SAP ECC 6.0 or S/4HANA API access is available for integration.
- ESRI ArcGIS Enterprise 10.9+ is deployed and accessible.
- IoT sensor data is available via MQTT or REST API.
- Existing Maximo 7.6.1.2 data will be migrated prior to go-live.

---

## 4. STAKEHOLDERS AND ROLES

| Role | Name | Responsibility |
|---|---|---|
| Executive Sponsor | VP of Operations | Program authority, budget approval |
| EAM Program Manager | Dana Whitfield | Overall program governance |
| Functional Lead — Work Management | Jorge Harmon | WO application requirements owner |
| Functional Lead — Asset Management | Maria Castillo | Asset/Location requirements owner |
| Technical Architect | Thanh Nguyen | Solution architecture, integrations |
| Maximo Developer (Lead) | Priya Desai | Customizations, automation scripts |
| Maximo Developer | Carlos Ruiz | UI, workflow, security |
| Integration Engineer | Sam Okafor | SAP, GIS, IoT integration |
| QA Lead | Rachel Frost | Test strategy, UAT coordination |
| Field Operations Representative | Mike Torres | SME — field technician workflows |
| IT Security | Lisa Park | Security and compliance review |
| Change Management | Angela Voss | Training and communications |

---

## 5. CURRENT STATE ANALYSIS (AS-IS)

### 5.1 Work Order Process — Current State

The current work order process suffers from the following documented deficiencies:

**Work Order Creation:**
- Work orders are created manually by planners from phone, email, or verbal requests.
- No automatic generation from SAP PM notifications or IoT alerts.
- Priority assignment is subjective; no standardized priority matrix is enforced.
- Duplicate WOs for the same asset failure are common (estimated 12% duplication rate).

**Work Order Assignment:**
- Dispatchers manually review open WOs each morning for assignment.
- No skill-based routing or workload balancing is in place.
- Assignment confirmation from technicians is done via phone.

**Work Order Execution:**
- Field technicians receive printed WO packets.
- Labor, materials, and failure codes are recorded on paper and re-entered by administrators.
- Average data entry lag: 4.2 hours post-job completion.

**Work Order Closure:**
- Closure requires supervisor sign-off via email confirmation.
- Actual costs are not validated against estimates at closure.
- Failure analysis codes (FAILURECODE) are frequently left blank.

### 5.2 Asset Management — Current State

- Asset records exist for approximately 41,200 of an estimated 45,000 physical assets.
- Asset hierarchy (parent-child relationships) is incomplete for 60% of records.
- No consistent classification taxonomy; asset categories are ad hoc.
- Warranty tracking is not utilized.
- Meter readings are entered manually with no mobile support.
- No integration with vendor asset lifecycle data.

### 5.3 Location Management — Current State

- Location hierarchy reflects a 2018 site layout and does not include two facility expansions.
- GIS coordinates are missing for 72% of functional locations.
- No consistent naming convention for location records.
- Location type field is underutilized.
- Child asset-to-location relationships are inconsistent.

### 5.4 Gap Summary Table

| Gap ID | Module | Gap Description | Priority |
|---|---|---|---|
| GAP-01 | Work Order | No automatic WO generation from IoT/SAP | Critical |
| GAP-02 | Work Order | No priority matrix enforcement | High |
| GAP-03 | Work Order | Paper-based field data capture | Critical |
| GAP-04 | Work Order | Missing failure codes at closure | High |
| GAP-05 | Work Order | No cost validation at closure | Medium |
| GAP-06 | Asset | Incomplete asset hierarchy | High |
| GAP-07 | Asset | No classification taxonomy | High |
| GAP-08 | Asset | No warranty tracking | Medium |
| GAP-09 | Asset | No mobile meter reading | High |
| GAP-10 | Location | Outdated site hierarchy | Critical |
| GAP-11 | Location | Missing GIS coordinates | High |
| GAP-12 | Location | No location naming convention | Medium |

---

## 6. FUTURE STATE DESIGN (TO-BE)

### 6.1 Work Order Process — Future State

**Automated Generation:** Work orders will be automatically created via integration with SAP PM notification conversion, IoT sensor breach alerts (via REST API), and PM-triggered scheduled maintenance.

**Intelligent Routing:** A skill-based dispatcher queue will be implemented. The system will suggest technician assignment based on craft, skill level, geographic proximity, and current workload.

**Mobile Field Execution:** Field technicians will use Maximo Mobile (MAS 8.11 native) or Maximo Anywhere for work order access, labor reporting, material usage, meter reading, and failure code entry.

**Structured Closure:** Work orders will enforce required failure code entry before closure. Actual vs. estimated cost variance will generate an alert if variance exceeds 20%. Supervisors will approve closure within Maximo (no email required).

### 6.2 Asset Management — Future State

A standardized IBM TPAE-compatible asset classification taxonomy will be implemented aligned with ISO 14224. Complete parent-child asset hierarchies will be established. Warranty tracking will be configured. Meter-based PM triggers will be enabled. IoT sensor-to-asset linking will allow real-time condition monitoring.

### 6.3 Location Management — Future State

The location hierarchy will be rebuilt to reflect current site configurations. A standard naming convention will be enforced via validation. GIS coordinates (latitude/longitude) will be stored and displayed via ESRI ArcGIS integration. All active assets will be linked to their current functional location.

---

## 7. FUNCTIONAL REQUIREMENTS — WORK ORDER APPLICATION

### 7.1 Work Order Creation

#### FR-WO-001: Auto-Generation from SAP PM Notifications

**Description:** When a PM Notification is created and approved in SAP, an integration event shall automatically create a corresponding Work Order in Maximo within 5 minutes of SAP notification approval.

**Trigger:** SAP PM Notification status changes to "Released" (NOCO = REL).

**Maximo Record Created:** WORKORDER record with `WOCLASS = WORKORDER`.

**Field Mapping:**

| SAP Field | SAP Object | Maximo Field | Maximo Object | Transformation |
|---|---|---|---|---|
| QMNUM | QMEL | EXTERNALREF | WORKORDER | Direct copy |
| QMTXT | QMEL | DESCRIPTION | WORKORDER | Direct copy |
| PRIOK | QMEL | WOPRIORITY | WORKORDER | Lookup: SAP priority → Maximo priority |
| TPLNR | IFLOT | LOCATION | WORKORDER | Cross-reference via SITEID |
| EQUNR | EQUI | ASSETNUM | WORKORDER | Cross-reference via serial/tag number |
| IWERK | T001W | SITEID | WORKORDER | Direct copy |
| ARBPL | CRHD | CREWID | WORKORDER | Cross-reference craft table |

**Validation:** If no matching asset or location is found, WO is created with status `WAPPR` and a flag `EXTERNALREF_UNMATCHED = Y` is set. An alert is sent to the EAM data steward.

**Priority:** Must Have

---

#### FR-WO-002: Auto-Generation from IoT Sensor Alerts

**Description:** When an IoT sensor associated with a critical asset breaches a configured threshold, Maximo shall automatically create a Work Order of type `CM` (Corrective Maintenance).

**Trigger:** IoT platform (OSIsoft PI / Azure IoT Hub) sends a threshold breach event via REST API to the Maximo Integration Framework endpoint `/maximo/oslc/os/MXWO`.

**Logic:**
1. Receive JSON payload with sensor ID, asset tag, breach value, breach type, and severity.
2. Look up asset record by sensor ID mapping table (`IOTASSETMAP`).
3. Check if an open WO already exists for this asset with `IOTORIGINATED = Y` and `STATUS NOT IN ('CLOSE', 'CAN')`. If yes, suppress duplicate creation and update existing WO with new breach event in long description.
4. If no duplicate: create WO, populate fields per mapping, set `STATUS = WAPPR`, notify dispatcher.

**Required New Field:** `IOTORIGINATED` (YORN) on WORKORDER object.

**Priority:** Must Have

---

#### FR-WO-003: Priority Matrix Enforcement

**Description:** Work order priority shall be determined by a standardized Priority Matrix based on asset criticality rank and failure impact severity. The system shall automatically calculate and populate the WOPRIORITY field.

**Priority Matrix:**

| Asset Criticality | Impact: Safety | Impact: Production | Impact: Quality | Impact: Administrative |
|---|---|---|---|---|
| **Tier 1 (Critical)** | 1 — Emergency | 1 — Emergency | 2 — Urgent | 2 — Urgent |
| **Tier 2 (Essential)** | 1 — Emergency | 2 — Urgent | 3 — High | 3 — High |
| **Tier 3 (Important)** | 2 — Urgent | 3 — High | 4 — Medium | 5 — Low |
| **Tier 4 (General)** | 3 — High | 4 — Medium | 5 — Low | 5 — Low |

**Implementation:** Automation script `WOPRIORITY_CALC` shall fire on Save of WORKORDER when `WOPRIORITY` is null or when `ASSETNUM` or `FAILURECODE` is modified.

**Priority:** Must Have

---

#### FR-WO-004: Required Fields at WO Creation

The following fields shall be mandatory (validated at save) for any Work Order with `WOCLASS = WORKORDER`:

| Field | Label | Condition |
|---|---|---|
| DESCRIPTION | Description | Always required |
| WONUM | WO Number | Auto-generated; system-enforced |
| SITEID | Site | Always required |
| WOCLASS | WO Class | Always required |
| WOPRIORITY | Priority | Always required |
| WORKTYPE | Work Type | Always required |
| ASSETNUM or LOCATION | Asset or Location | At least one required |
| TARGSTARTDATE | Target Start Date | Required when STATUS = WAPPR or higher |

**Priority:** Must Have

---

### 7.2 Work Order Assignment and Scheduling

#### FR-WO-010: Skill-Based Assignment Queue

**Description:** The dispatcher console shall display open/approved Work Orders sorted by priority. For each WO, the system shall recommend up to 3 qualified technicians based on: required craft match, required skill level, current workload (open WO count), and proximity to WO location (from GIS coordinates).

**Implementation:** New Maximo application page `DISPATCHQUEUE` (Application Designer). Automation script `TECH_RECOMMEND` called on queue load.

**Priority:** Should Have

---

#### FR-WO-011: Crew Assignment with Capacity Check

**Description:** When assigning a crew to a Work Order, the system shall validate that the crew's scheduled availability on the target start date is not exceeded based on total estimated labor hours.

**Validation Rule:** If sum of `LABESTLABHRS` for all open WOs assigned to crew on `TARGSTARTDATE` + new WO estimated hours > crew capacity hours, display a warning message. Warning is non-blocking (planner can override).

**Priority:** Should Have

---

### 7.3 Work Order Execution

#### FR-WO-020: Mobile Work Order Access (Maximo Mobile)

**Description:** Field technicians shall access, update, and close Work Orders via Maximo Mobile (MAS 8.11 native application) on iOS and Android devices. The mobile application shall support offline mode with synchronization upon reconnection.

**Mobile Capabilities Required:**

- View assigned WO list with priority and location
- View asset details, specifications, and maintenance history
- View attached documents and safety plans
- Record actual labor hours with start/stop timer
- Record material usage (from storeroom or direct issue)
- Enter meter readings
- Enter failure codes (FAILURECODE, CAUSECODE, REMEDYCODE)
- Capture photo evidence (auto-attached to WO)
- Change WO status (INPRG, COMP, WMATL)
- Add work log entries
- Electronic signature for WO completion

**Priority:** Must Have

---

#### FR-WO-021: Safety Plan Display

**Description:** Upon opening a Work Order that has an associated Safety Plan, the mobile and desktop interfaces shall display a safety notification requiring the technician to acknowledge safety precautions before status can be changed to `INPRG`.

**Implementation:** Safety acknowledgment flag `SAFETYPLN_ACK` (YORN) on WORKORDER. Automation script `SAFETY_ACK_CHECK` fires on status change to INPRG.

**Priority:** Must Have

---

### 7.4 Work Order Closure

#### FR-WO-030: Failure Code Requirement at Closure

**Description:** A Work Order with `WORKTYPE IN ('CM', 'EM')` (Corrective Maintenance, Emergency) shall not be closeable unless `FAILURECODE`, `CAUSECODE`, and `REMEDYCODE` are all populated.

**Implementation:** Status transition rule in Maximo Workflow and Application Designer screen validation.

**Error Message:** `"Failure Analysis codes are required for Corrective and Emergency work orders. Please complete the Failure Code, Cause Code, and Remedy Code before closing."`

**Priority:** Must Have

---

#### FR-WO-031: Actual vs. Estimated Cost Variance Alert

**Description:** Upon Work Order closure, the system shall calculate the variance between estimated total cost (`WOEESTCOST`) and actual total cost (`WOACTCOST`). If variance exceeds 20%, a non-blocking alert shall be displayed and a workflow notification sent to the WO supervisor.

**Formula:**  
`Variance % = ABS((WOACTCOST - WOEESTCOST) / WOEESTCOST) * 100`

**Condition:** Only evaluated when `WOEESTCOST > 0`.

**Priority:** Should Have

---

#### FR-WO-032: Supervisor Approval for Closure

**Description:** Work Orders with `WOPRIORITY IN (1, 2)` (Emergency, Urgent) shall require supervisor electronic approval within Maximo before final closure. Approval request is sent via Maximo Communication Template `WOCLOSURE_APPROVAL`.

**Workflow:** `WO_CLOSURE_APPROVAL_WF` — routes to WO supervisor (`SUPERVISOR` field) for approval. On approval, status transitions to `CLOSE`. On rejection, WO returns to `COMP` with a work log entry noting the rejection reason.

**Priority:** Must Have

---

## 8. FUNCTIONAL REQUIREMENTS — ASSET APPLICATION

### 8.1 Asset Classification and Hierarchy

#### FR-AS-001: ISO 14224-Aligned Asset Classification Taxonomy

**Description:** A standardized asset classification taxonomy shall be implemented using Maximo's Classification application, aligned with ISO 14224 equipment taxonomy for oil, gas, and energy industries (adapted for water/utility sector).

**Taxonomy Structure (Top-Level Classes):**

| Class Code | Class Name | Examples |
|---|---|---|
| ROTAT | Rotating Equipment | Pumps, compressors, fans, motors |
| STATIC | Static Equipment | Tanks, vessels, heat exchangers, filters |
| ELEC | Electrical Equipment | Switchgear, transformers, panels, UPS |
| INSTRU | Instrumentation | Transmitters, analyzers, PLCs, SCADA |
| CIVIL | Civil/Structural | Buildings, roads, fences, foundations |
| PIPING | Piping Systems | Pipes, valves, fittings, manifolds |
| VEHICLE | Vehicles/Mobile | Fleet vehicles, mobile equipment |
| IT | IT Equipment | Servers, network equipment, workstations |

**Implementation:** Each top-level class will have sub-classes and attribute templates. Classification assignment shall be required at asset creation.

**Priority:** Must Have

---

#### FR-AS-002: Parent-Child Asset Hierarchy Enforcement

**Description:** All assets classified under `ROTAT`, `STATIC`, `ELEC`, or `INSTRU` shall have a parent asset assigned unless the asset is designated a Top-Level System asset (`TOPLEVELSYSTEM = Y`, new field).

**Validation:** On save, if `ASSETCLASS IN ('ROTAT','STATIC','ELEC','INSTRU')` and `PARENT` is null and `TOPLEVELSYSTEM ≠ Y`, display a warning requiring the user to assign a parent or confirm top-level designation.

**Priority:** Must Have

---

#### FR-AS-003: Asset Criticality Ranking

**Description:** Each asset shall have a Criticality Tier assigned (`CRITICALITYRANK`: Tier 1, 2, 3, or 4) based on a structured criticality assessment process. Criticality rank shall drive the Priority Matrix (FR-WO-003) and PM frequency recommendations.

**New Fields on ASSET object:**

| Field Name | Type | Length | Description |
|---|---|---|---|
| CRITICALITYRANK | UPPER | 10 | Tier 1 / Tier 2 / Tier 3 / Tier 4 |
| CRITASSESSDATE | DATE | — | Date of last criticality assessment |
| CRITASSESSEDBY | UPPER | 30 | Person who performed assessment |
| CRITJUSTIFICATION | ALN | 256 | Justification for tier assignment |

**Priority:** Must Have

---

### 8.2 Asset Lifecycle Management

#### FR-AS-010: Warranty Tracking

**Description:** The Asset application shall support tracking of active warranties with automated alerts when warranties are nearing expiration.

**New Fields on ASSET object:**

| Field Name | Type | Description |
|---|---|---|
| WARRANTYNUM | UPPER | Warranty contract number |
| WARRANTYVENDOR | UPPER | Vendor providing warranty |
| WARRANTYSTARTDATE | DATE | Warranty start date |
| WARRANTYENDDATE | DATE | Warranty end date |
| WARRANTYTYPE | UPPER | Parts / Labor / Full / Extended |
| WARRANTYNOTES | ALN | Warranty terms summary |

**Alert Rule:** 60 days before `WARRANTYENDDATE`, Maximo Cron Task `WARRANTY_EXPIRY_ALERT` generates a notification to the asset's responsible craft supervisor and the Procurement team.

**Priority:** Should Have

---

#### FR-AS-011: Asset Status Lifecycle

**Description:** Asset status transitions shall follow a defined lifecycle with enforced rules.

**Asset Status Lifecycle:**

```
[PLANNING] → [ACTIVE] → [DEACTIVATED] → [DISPOSED]
                ↓              ↑
           [IN REPAIR] ────────┘
```

**Transition Rules:**

| From Status | To Status | Rule |
|---|---|---|
| PLANNING | ACTIVE | Commissioning date must be populated |
| ACTIVE | IN REPAIR | Open WO with WORKTYPE = CM must exist |
| IN REPAIR | ACTIVE | WO must be in CLOSE status |
| ACTIVE | DEACTIVATED | Approval required from Asset Manager |
| DEACTIVATED | DISPOSED | Disposal form (custom application) must be completed |
| DEACTIVATED | ACTIVE | Recommissioning date must be populated |

**Priority:** Must Have

---

#### FR-AS-012: Mobile Meter Reading

**Description:** Field technicians shall be able to enter meter readings for assets (e.g., run hours, mileage, gallons treated) using Maximo Mobile. Readings shall trigger PM evaluation upon submission.

**Mobile UX Requirements:**
- Display current meter value and last reading date
- Prompt for reading value with unit confirmation
- Validate reading is not less than previous reading (for non-resettable meters)
- Auto-trigger PM evaluation on save

**Priority:** Must Have

---

### 8.3 IoT Sensor Integration with Assets

#### FR-AS-020: IoT Sensor-to-Asset Mapping

**Description:** A new `IOTASSETMAP` table shall map IoT sensor IDs to Maximo asset records, supporting many-to-one (multiple sensors per asset) mapping.

**IOTASSETMAP Table:**

| Column | Type | Description |
|---|---|---|
| SENSORID | UPPER(50) | Unique identifier from IoT platform |
| ASSETNUM | UPPER(25) | Maximo asset number |
| SITEID | UPPER(8) | Maximo site ID |
| SENSORTYPE | UPPER(30) | Vibration, Temperature, Pressure, Flow, etc. |
| THRESHOLDLOW | DECIMAL | Low threshold value |
| THRESHOLDHIGH | DECIMAL | High threshold value |
| UNIT | UPPER(20) | Engineering unit |
| ALERTPRIORITY | INTEGER | 1–5; maps to WO priority |
| ACTIVEYN | YORN | Sensor mapping active flag |

**Priority:** Must Have

---

## 9. FUNCTIONAL REQUIREMENTS — LOCATION APPLICATION

### 9.1 Location Hierarchy Redesign

#### FR-LC-001: Location Hierarchy Structure

**Description:** The functional location hierarchy shall be redesigned to reflect current operational site configurations. The standard hierarchy shall be implemented at all sites.

**Standard Location Hierarchy:**

```
Level 0: ENTERPRISE        (Nexagen Infrastructure Services)
  Level 1: REGION          (e.g., REGION-NE, REGION-SW)
    Level 2: SITE/FACILITY (e.g., WTP-NORTHGATE, SS-RIVERSIDE)
      Level 3: SYSTEM      (e.g., PUMPING-SYSTEM, CHLORINATION)
        Level 4: SUBSYSTEM (e.g., HIGH-SERVICE-PUMPS, CHEMICAL-FEED)
          Level 5: EQUIP   (specific equipment location)
```

**Location Type Lookup Values:**

| LOCTYPE Code | Description |
|---|---|
| ENTERPRISE | Enterprise level |
| REGION | Regional grouping |
| FACILITY | Physical facility/site |
| SYSTEM | Operational system |
| SUBSYSTEM | Operational subsystem |
| EQUIP | Equipment position |
| STOREROOM | Storeroom / warehouse |

**Priority:** Must Have

---

#### FR-LC-002: Location Naming Convention

**Description:** All new location records shall follow a standardized naming convention enforced by validation.

**Naming Pattern:** `[SITE]-[SYSTEM]-[SUBSYSTEM]-[SEQ]`

**Examples:**
- `WTP-NORTH-PUMP-HV-001` — Water Treatment Plant North, Pump System, High Voltage area, unit 1
- `SS-RIVER-XFMR-001` — Substation Riverside, Transformer, unit 1

**Validation:** Automation script `LOC_NAMING_VALIDATE` shall validate location ID format on save using regex: `^[A-Z]{2,6}-[A-Z0-9]{2,8}-[A-Z0-9]{2,8}-\d{3}$`.

**Override:** Locations at Level 0–2 (Enterprise/Region/Facility) are exempt from this pattern.

**Priority:** Should Have

---

#### FR-LC-003: GIS Coordinate Integration

**Description:** All functional locations at Level 3 (System) and below shall have GIS coordinates stored and displayed via integration with ESRI ArcGIS Enterprise.

**New Fields on LOCATIONS object:**

| Field Name | Type | Description |
|---|---|---|
| LATITUDE | DECIMAL(10,7) | WGS84 latitude |
| LONGITUDE | DECIMAL(10,7) | WGS84 longitude |
| ELEVATION | DECIMAL(8,2) | Elevation in meters above sea level |
| GISLAYERID | ALN(50) | ESRI feature class layer ID |
| GISFEATUREID | ALN(50) | ESRI feature object ID |
| GISSYNCDATE | DATETIME | Last synchronization date with GIS |

**Map View:** An ESRI map viewer shall be embedded in the Location application using Maximo Spatial (included in MAS 8.11). Clicking a map feature shall navigate to the corresponding Location record.

**Priority:** Must Have

---

#### FR-LC-004: Asset-to-Location Integrity Validation

**Description:** When an asset is moved to a new location (ASSET.LOCATION changed), the system shall validate that:

1. The target location exists and has `ACTIVE` status.
2. The target location's type is `EQUIP` or `SUBSYSTEM` (assets may not be installed at ENTERPRISE, REGION, or FACILITY level).
3. If the asset has children, all child assets shall be moved to the same location or a child location.

**Priority:** Must Have

---

## 10. BUSINESS RULES AND VALIDATIONS

### 10.1 Summary of Business Rules

| Rule ID | Module | Rule Description | Enforcement |
|---|---|---|---|
| BR-001 | Work Order | WO cannot transition from WAPPR to INPRG without an assigned labor record | Workflow / Script |
| BR-002 | Work Order | Emergency WOs (Priority 1) must have TARGSTARTDATE within 4 hours of creation | Script warning |
| BR-003 | Work Order | WO with open child WOs cannot be closed | Application validation |
| BR-004 | Work Order | Actual finish date cannot precede actual start date | Database validation |
| BR-005 | Work Order | FAILURECODE required for CM and EM work types at closure | Workflow transition |
| BR-006 | Asset | Asset cannot be set to ACTIVE without a physical location assigned | Script |
| BR-007 | Asset | Asset INSTALLDATE cannot be prior to asset ORDERDATE | Validation |
| BR-008 | Asset | Changing asset SITEID requires supervisor-level security role | Role-based restriction |
| BR-009 | Location | LOCATION ID must be unique across the enterprise (not just per site) | Uniqueness constraint |
| BR-010 | Location | Location cannot be deactivated if active assets are installed at that location | Validation |
| BR-011 | Location | GIS coordinates are required before a location can be set to OPERATING status | Script |

---

## 11. WORKFLOW DESIGN

### 11.1 Work Order Approval Workflow

**Workflow Name:** `WO_APPROVAL_WF`
**Object:** WORKORDER
**Trigger:** Status change from `WAPPR` to any status ≥ APPR

```
[WO Created - Status: WAPPR]
         |
         ▼
[Priority = 1 or 2?]
    /          \
  YES           NO
   |             |
   ▼             ▼
[Route to     [Auto-Approve;
 Supervisor]   Status → APPR]
   |
   ▼
[Supervisor Reviews]
    /         \
 APPROVE      REJECT
   |             |
   ▼             ▼
[Status →    [Status stays WAPPR;
  APPR]       Notification to Requestor
              with rejection reason]
```

**Notifications:**
- On routing to supervisor: Email + Maximo inbox notification via `WO_SUPVAPPROVAL_REQUEST` communication template.
- On rejection: Email to requestor via `WO_REJECTION_NOTIFY` template.
- SLA: Supervisor must respond within 2 business hours for Priority 1, 8 hours for Priority 2.
- Escalation: If SLA breached, escalate to EAM Program Manager.

---

### 11.2 Work Order Closure Workflow

**Workflow Name:** `WO_CLOSURE_APPROVAL_WF`
**Object:** WORKORDER
**Trigger:** Status change to `COMP` for Priority 1/2 WOs

```
[WO Status → COMP]
         |
         ▼
[Failure codes complete?]
    /          \
   NO           YES
   |             |
   ▼             ▼
[Return to     [Cost variance > 20%?]
 INPRG with      /         \
 validation    YES          NO
 message]       |            |
                ▼            ▼
           [Alert sent;  [Route to supervisor
            still routes  for closure approval]
            to supervisor]
                  |
                  ▼
          [Supervisor Approves?]
              /       \
           YES          NO
            |            |
            ▼            ▼
       [Status →     [Return to COMP;
         CLOSE]       Work log entry added]
```

---

### 11.3 Asset Deactivation Workflow

**Workflow Name:** `ASSET_DEACTIVATE_WF`
**Object:** ASSET
**Trigger:** Status change from ACTIVE to DEACTIVATED

Steps:
1. Validate no open Work Orders exist for the asset.
2. Route deactivation request to Asset Manager for approval.
3. On approval: set status to DEACTIVATED, record deactivation date, remove from active PM schedules.
4. On rejection: revert status to ACTIVE with notification.

---

## 12. DATA MODEL AND FIELD SPECIFICATIONS

### 12.1 New Fields — WORKORDER Object

| Field Name | Data Type | Length | Label | Description | Required |
|---|---|---|---|---|---|
| IOTORIGINATED | YORN | 1 | IoT Generated | Indicates WO was auto-generated from IoT alert | No |
| IOTSENSORID | UPPER | 50 | Sensor ID | Source IoT sensor ID | No |
| IOTBREACHWVAL | DECIMAL | 15,4 | Breach Value | Sensor value that triggered WO | No |
| SAFETYPLN_ACK | YORN | 1 | Safety Acknowledged | Technician acknowledged safety plan | No |
| EXTERNALREF | UPPER | 30 | External Reference | SAP Notification or external system reference | No |
| EXTERNALREF_UNMATCHED | YORN | 1 | Ext Ref Unmatched | Asset/location not found during auto-creation | No |
| DISPATCHNOTES | ALN | 512 | Dispatch Notes | Dispatcher instructions to technician | No |
| TECHSIGNATURE | ALN | 256 | Tech Signature | Electronic signature data (Base64) | No |
| CLOSURENOTES | ALN | 1024 | Closure Notes | Summary of work performed at closure | No |

### 12.2 New Fields — ASSET Object

| Field Name | Data Type | Length | Label | Description | Required |
|---|---|---|---|---|---|
| CRITICALITYRANK | UPPER | 10 | Criticality Rank | Asset criticality tier (Tier 1–4) | Yes |
| CRITASSESSDATE | DATE | — | Criticality Assessed Date | Date criticality was assessed | No |
| CRITASSESSEDBY | UPPER | 30 | Assessed By | Person conducting criticality assessment | No |
| CRITJUSTIFICATION | ALN | 256 | Criticality Justification | Rationale for tier assignment | No |
| TOPLEVELSYSTEM | YORN | 1 | Top Level System | Asset is a top-level system (no parent required) | No |
| WARRANTYNUM | UPPER | 30 | Warranty Number | Warranty contract number | No |
| WARRANTYVENDOR | UPPER | 50 | Warranty Vendor | Vendor providing warranty service | No |
| WARRANTYSTARTDATE | DATE | — | Warranty Start Date | Start date of warranty | No |
| WARRANTYENDDATE | DATE | — | Warranty End Date | End date of warranty | No |
| WARRANTYTYPE | UPPER | 20 | Warranty Type | Parts / Labor / Full / Extended | No |
| WARRANTYNOTES | ALN | 512 | Warranty Notes | Warranty terms summary | No |
| IOTLINKED | YORN | 1 | IoT Linked | Asset has linked IoT sensors | No |

### 12.3 New Fields — LOCATIONS Object

| Field Name | Data Type | Length | Label | Description | Required |
|---|---|---|---|---|---|
| LATITUDE | DECIMAL | 10,7 | Latitude | WGS84 latitude coordinate | Conditional |
| LONGITUDE | DECIMAL | 10,7 | Longitude | WGS84 longitude coordinate | Conditional |
| ELEVATION | DECIMAL | 8,2 | Elevation (m) | Elevation in meters above sea level | No |
| GISLAYERID | ALN | 50 | GIS Layer ID | ESRI feature class layer identifier | No |
| GISFEATUREID | ALN | 50 | GIS Feature ID | ESRI feature object ID | No |
| GISSYNCDATE | DATETIME | — | GIS Sync Date | Last synchronization with GIS platform | No |
| LOCTYPE | UPPER | 20 | Location Type | Enterprise/Region/Facility/System/Subsystem/Equip | Yes |

### 12.4 New Table — IOTASSETMAP

| Column | Data Type | Length | PK | Description |
|---|---|---|---|---|
| SENSORID | UPPER | 50 | PK | IoT sensor unique identifier |
| ASSETNUM | UPPER | 25 | FK | Maximo asset number |
| SITEID | UPPER | 8 | FK | Maximo site ID |
| SENSORTYPE | UPPER | 30 | — | Sensor measurement type |
| THRESHOLDLOW | DECIMAL | 15,4 | — | Low alert threshold |
| THRESHOLDHIGH | DECIMAL | 15,4 | — | High alert threshold |
| UNIT | UPPER | 20 | — | Engineering unit of measurement |
| ALERTPRIORITY | INTEGER | — | — | Alert priority (1–5) |
| ACTIVEYN | YORN | 1 | — | Active mapping flag |
| CREATEDBY | UPPER | 30 | — | Record created by |
| CREATEDATE | DATETIME | — | — | Record creation date |

---

## 13. INTEGRATION DESIGN

### 13.1 SAP Integration

**Integration Type:** Bidirectional via SAP PI/PO or SAP Integration Suite (REST/SOAP)

**Integration Flows:**

| Flow ID | Direction | Trigger | Description |
|---|---|---|---|
| INT-SAP-001 | SAP → Maximo | SAP PM Notification Released | Create WO in Maximo (FR-WO-001) |
| INT-SAP-002 | Maximo → SAP | WO Closed in Maximo | Update SAP PM Order with actual costs and closure |
| INT-SAP-003 | SAP → Maximo | SAP Asset Master Created/Modified | Sync asset data to Maximo |
| INT-SAP-004 | Maximo → SAP | Maximo WO Material Issued | Post goods issue in SAP MM |

**Authentication:** OAuth 2.0 client credentials via SAP API Management gateway.

**Error Handling:** Failed integration messages are captured in Maximo `INTMSGLOG`. Retry policy: 3 attempts at 5-minute intervals. Failed messages after 3 attempts trigger an alert to the Integration Administrator.

---

### 13.2 ESRI ArcGIS Integration

**Integration Type:** Maximo Spatial (ArcGIS Maps for Maximo, included in MAS 8.11)

**Capabilities:**
- View Maximo Locations and Assets on ArcGIS map within Maximo UI
- Click map feature to open corresponding Maximo record
- Sync GIS coordinates to LOCATIONS.LATITUDE / LOCATIONS.LONGITUDE
- Display Work Orders on map by location

**Synchronization Schedule:** Nightly sync via Cron Task `GIS_COORD_SYNC` at 02:00 local time. On-demand sync available via button in Location application.

---

### 13.3 IoT Platform Integration

**Integration Type:** Inbound REST API (JSON payload to Maximo Integration Framework)

**Endpoint:** `POST /maximo/oslc/os/MXIOTBREACH`

**Payload Schema:**

```json
{
  "sensorId": "SENSOR-WTP-PUMP-VIB-001",
  "assetTag": "WTP-NORTH-PUMP-HV-001",
  "breachType": "HIGH",
  "breachValue": 14.7,
  "unit": "mm/s",
  "severity": "CRITICAL",
  "timestamp": "2025-03-01T14:32:00Z",
  "siteId": "WTP-NORTH",
  "description": "Vibration velocity exceeded high threshold on Pump HV-001"
}
```

**Maximo Processing:** Object Structure `MXIOTBREACH` receives payload. Automation script `IOT_WO_CREATE` processes the message and executes FR-WO-002 logic.

---

### 13.4 Document Management Integration

**System:** Microsoft SharePoint Online

**Integration:** Maximo Doclinks configured to point to SharePoint document library. Technicians accessing linked documents via mobile are served SharePoint links requiring single sign-on (SSO via Azure AD).

**Document Types Linked to WO/Asset:** Maintenance procedures, OEM manuals, safety data sheets, as-built drawings, inspection reports, commissioning records.

---

## 14. SECURITY AND ACCESS CONTROL

### 14.1 Security Group Definitions

| Security Group | Description | Key Permissions |
|---|---|---|
| MAXADMIN | System Administrator | Full access to all applications |
| EAM-PLANNER | Work Order Planners | Create/modify WOs; read Asset/Location |
| EAM-DISPATCHER | Dispatchers | Modify WO assignment; view all WOs |
| EAM-TECHNICIAN | Field Technicians | View/update assigned WOs; enter readings |
| EAM-SUPERVISOR | Maintenance Supervisors | Approve WOs and closures; manage crew |
| EAM-ASSETMGR | Asset Managers | Full access to Asset and Location apps |
| EAM-READONLY | Read-Only Users | View-only access to WO, Asset, Location |
| EAM-INTEGRATION | Integration Service Account | API access for SAP, IoT, GIS integrations |

### 14.2 Field-Level Security

The following fields shall have restricted visibility or editability by security group:

| Field | Object | Restricted To | Restriction Type |
|---|---|---|---|
| WOACTCOST | WORKORDER | EAM-SUPERVISOR, EAM-PLANNER, MAXADMIN | Read for TECHNICIAN |
| CRITICALITYRANK | ASSET | EAM-ASSETMGR, MAXADMIN | Read-only for others |
| WARRANTYNUM | ASSET | EAM-ASSETMGR, MAXADMIN | Hidden for TECHNICIAN |
| LATITUDE/LONGITUDE | LOCATIONS | EAM-ASSETMGR, MAXADMIN | Read-only for others |

### 14.3 Audit Trail Requirements

All changes to the following fields shall be logged in the AUDIT table:

- WORKORDER: STATUS, WOPRIORITY, ASSETNUM, LOCATION, IOTSENSORID
- ASSET: STATUS, CRITICALITYRANK, LOCATION, SERIALNUM, SITEID
- LOCATIONS: LOCTYPE, LATITUDE, LONGITUDE, STATUS, PARENT

---

## 15. REPORTING AND KPIs

### 15.1 New Operational Reports

| Report ID | Name | Module | Description | Schedule |
|---|---|---|---|---|
| RPT-001 | Open WO Aging Report | Work Order | Lists open WOs by age, priority, and assigned crew | Daily |
| RPT-002 | WO Completion Rate | Work Order | % WOs completed on time vs. target | Weekly |
| RPT-003 | Failure Analysis Summary | Work Order | Top failure codes by asset class | Monthly |
| RPT-004 | Cost Variance Report | Work Order | WOs where actual cost exceeded estimate by >20% | Monthly |
| RPT-005 | Asset Criticality Dashboard | Asset | Distribution of assets by criticality tier and status | On demand |
| RPT-006 | Warranty Expiry Report | Asset | Assets with warranties expiring in 30/60/90 days | Weekly |
| RPT-007 | IoT-Generated WO Report | Work Order | WOs originated from IoT alerts with breach details | Weekly |
| RPT-008 | Location GIS Coverage | Location | % of locations with GIS coordinates populated | Monthly |
| RPT-009 | PM Compliance Report | PM | Scheduled vs. completed PMs by site | Monthly |
| RPT-010 | Technician Productivity | Work Order | Actual labor hours vs. estimated by technician | Weekly |

### 15.2 KPI Definitions

| KPI ID | KPI Name | Formula | Target | Source |
|---|---|---|---|---|
| KPI-001 | Work Order Cycle Time | AVG(ACTFINISH - STATUSDATE where STATUS first = WAPPR) | ≤ 72 hours | WORKORDER |
| KPI-002 | First-Time Fix Rate | WOs closed without reopening / Total WOs closed | ≥ 80% | WORKORDER |
| KPI-003 | PM Compliance Rate | PMs completed on schedule / PMs scheduled | ≥ 95% | WOACTIVITY, PMSCHEDULE |
| KPI-004 | Asset Data Completeness | Assets with all required fields populated / Total assets | ≥ 95% | ASSET |
| KPI-005 | Failure Code Compliance | WOs with CM type that have failure codes / Total CM WOs | 100% | WORKORDER |
| KPI-006 | IoT WO Auto-Generation Rate | WOs from IoT triggers / Total IoT alerts received | ≥ 98% | IOTASSETMAP, WORKORDER |
| KPI-007 | Mobile WO Update Rate | WOs updated via mobile / Total WOs assigned to technicians | ≥ 90% | WORKORDER (source flag) |

---

## 16. USER INTERFACE ENHANCEMENTS

### 16.1 Work Order Tracking — Screen Enhancements

**Work Order Header Tab — New Fields Added:**
- IoT Origin indicator (display only, icon badge)
- Safety Plan Acknowledged checkbox (visible when safety plan attached)
- External Reference field
- Criticality banner (derived from linked asset criticality rank)

**New Tab: Failure Analysis**
- Failure Code (FAILURECODE) — lookup enabled
- Cause Code (CAUSECODE) — lookup enabled
- Remedy Code (REMEDYCODE) — lookup enabled
- Root Cause Description (ALN field)
- Photo Evidence attachments (drag-and-drop upload)

**New Tab: IoT Data**
- Sensor ID
- Sensor Type
- Breach Value and Unit
- Breach Timestamp
- Historical trend chart (last 24 hours) — embedded from IoT platform URL

### 16.2 Asset Application — Screen Enhancements

**New Tab: Criticality**
- Criticality Rank (dropdown)
- Assessment Date
- Assessed By
- Justification

**New Tab: Warranty**
- All warranty fields listed in FR-AS-010
- Warranty expiry alert badge

**New Tab: IoT Sensors**
- Table of linked sensors from IOTASSETMAP
- Current reading display (pulled live from IoT API on tab open)
- Add/Remove sensor mapping buttons

### 16.3 Location Application — Screen Enhancements

**Enhanced Header:**
- Location Type (prominent display with icon)
- GIS Coordinates (Latitude, Longitude fields with "Open in Map" button)

**New Tab: GIS Map View**
- Embedded ESRI ArcGIS map centered on location coordinates
- All child locations shown as markers
- All active assets at this location shown as markers with WO status overlay

---

## 17. NON-FUNCTIONAL REQUIREMENTS

| NFR ID | Category | Requirement |
|---|---|---|
| NFR-001 | Performance | Work Order list page load time ≤ 3 seconds with up to 10,000 open records |
| NFR-002 | Performance | IoT alert to WO creation time ≤ 5 minutes end-to-end |
| NFR-003 | Availability | Maximo MAS availability ≥ 99.5% (excluding scheduled maintenance) |
| NFR-004 | Scalability | System shall support 500 concurrent users without performance degradation |
| NFR-005 | Mobile | Maximo Mobile shall support offline mode with ≥ 4 hours of field work before sync required |
| NFR-006 | Security | All data in transit encrypted via TLS 1.2 or higher |
| NFR-007 | Security | All API integrations require OAuth 2.0 or API key authentication |
| NFR-008 | Audit | All status changes on WORKORDER, ASSET, LOCATIONS logged with timestamp and user |
| NFR-009 | Data Retention | Work Order records retained for minimum 10 years per NERC/AWIA requirements |
| NFR-010 | Accessibility | Maximo web UI shall meet WCAG 2.1 Level AA accessibility standards |

---

## 18. TESTING STRATEGY

### 18.1 Testing Phases

| Phase | Type | Scope | Responsible |
|---|---|---|---|
| Phase 1 | Unit Testing | Individual automation scripts, field validations, workflow transitions | Maximo Developer |
| Phase 2 | Integration Testing | SAP ↔ Maximo, IoT → Maximo, GIS ↔ Maximo | Integration Engineer + Developer |
| Phase 3 | System Testing | End-to-end functional scenarios across all three modules | QA Lead |
| Phase 4 | Performance Testing | Load test with 500 concurrent users, IoT message throughput | IT Infrastructure + QA |
| Phase 5 | UAT | Business validation by Functional Leads and Field SME | Functional Leads, Field Operations |
| Phase 6 | Regression Testing | Ensure existing Maximo functionality unaffected | QA Lead |

### 18.2 Key Test Scenarios

| Test ID | Module | Scenario | Expected Result |
|---|---|---|---|
| TS-001 | Work Order | SAP PM Notification triggers WO creation | WO created within 5 min with correct field mapping |
| TS-002 | Work Order | IoT sensor breach creates WO | WO created; duplicate suppressed if open WO exists |
| TS-003 | Work Order | Close CM WO without failure codes | System blocks closure with validation message |
| TS-004 | Work Order | WO actual cost 25% over estimate | Warning displayed; supervisor notified |
| TS-005 | Work Order | Priority 1 WO created; supervisor approval requested | Workflow routes to supervisor; escalates if no response in 2 hours |
| TS-006 | Asset | Create asset without parent (non-top-level) | Warning displayed; user must confirm or assign parent |
| TS-007 | Asset | Warranty expiry within 60 days | Notification generated to craft supervisor and Procurement |
| TS-008 | Asset | Set asset status to ACTIVE without location | Validation blocks status change |
| TS-009 | Location | Create location with non-conformant naming | Validation warning displayed |
| TS-010 | Location | Attempt to deactivate location with active assets | System blocks deactivation |
| TS-011 | Integration | GIS sync populates coordinates | LATITUDE/LONGITUDE populated; map view displays location |
| TS-012 | Mobile | Technician completes WO via mobile offline | Data syncs on reconnect; WO updated |

---

## 19. MIGRATION AND CONVERSION PLAN

### 19.1 Data Migration Overview

Migration from Maximo 7.6.1.2 to MAS 8.11 will be handled via the IBM Maximo Migration Manager tool and custom data conversion scripts.

### 19.2 Migration Scope

| Object | Estimated Records | Migration Approach |
|---|---|---|
| WORKORDER (Open) | ~4,200 | Full migration with status mapping |
| WORKORDER (Historical, 5 yr) | ~280,000 | Full migration, read-only archive |
| ASSET | ~45,000 | Full migration + criticality enrichment |
| LOCATIONS | ~8,500 | Full migration + hierarchy rebuild |
| PM Records | ~3,100 | Full migration |
| Job Plans | ~850 | Full migration |
| Labor / Crafts | ~1,200 | Full migration |

### 19.3 Data Quality Pre-Migration Tasks

Prior to migration, the following data quality activities shall be completed:

1. Asset hierarchy reconciliation — identify and correct parent-child gaps for top 500 assets by WO count.
2. Location hierarchy rebuild — manual review and restructuring by site operations team.
3. Failure code backfill — attempt automated backfill of missing failure codes using historical WO descriptions and ML classification tool.
4. Duplicate WO identification and consolidation.
5. Asset classification taxonomy assignment — batch assign classifications using asset description text matching.

### 19.4 Cutover Plan

| Phase | Activity | Duration |
|---|---|---|
| T-30 days | Final data quality review; freeze new location/asset creation | 5 days |
| T-14 days | Migration trial run in staging environment | 3 days |
| T-7 days | Final go/no-go review | 1 day |
| T-2 days | Begin blackout period; read-only mode on legacy system | 2 days |
| T-0 (Go-live weekend) | Production migration execution | 16 hours |
| T+1 day | Smoke testing; validate critical functions | 4 hours |
| T+3 days | Parallel operations: legacy read-only available as fallback | 3 days |
| T+30 days | Legacy system decommissioned | — |

---

## 20. OPEN ISSUES AND ASSUMPTIONS

### 20.1 Open Issues

| Issue ID | Module | Description | Owner | Target Resolution |
|---|---|---|---|---|
| OI-001 | Integration | SAP API credentials for INT-SAP-001 not yet received from SAP Basis team | S. Okafor | 2025-03-20 |
| OI-002 | Asset | ISO 14224 sub-class taxonomy for civil/structural assets needs domain expert review | M. Castillo | 2025-04-01 |
| OI-003 | Location | Two facility expansion sites (Site 11, Site 12) do not have CAD drawings for GIS layer creation | Field Ops | 2025-04-15 |
| OI-004 | Mobile | Maximo Mobile license count to be confirmed with IBM procurement | IT Procurement | 2025-03-15 |
| OI-005 | Work Order | Priority matrix for environmental impact category not yet approved by Environmental team | J. Harmon | 2025-03-25 |

### 20.2 Assumptions

| Assumption ID | Description |
|---|---|
| A-001 | IBM Maximo MAS 8.11 will be deployed and accessible in the development environment by March 15, 2025. |
| A-002 | SAP ECC 6.0 system API access will be granted to the integration service account by March 20, 2025. |
| A-003 | ESRI ArcGIS Enterprise 10.9 is deployed and spatial data for all 12 sites is available. |
| A-004 | IoT sensor data is available via MQTT or REST API with JSON payload. |
| A-005 | Field technicians will have company-issued iOS or Android devices prior to go-live. |
| A-006 | All legacy Maximo 7.6.1.2 data is accessible for extraction via standard Maximo Integration Framework. |
| A-007 | End-user training will be delivered by the Change Management team using materials developed by the EAM team. |

---

## 21. GLOSSARY

| Term | Definition |
|---|---|
| ALN | Alphanumeric — Maximo field data type for text |
| AUTOSCRIPT | Maximo Automation Scripting application for custom server-side logic |
| CM | Corrective Maintenance — work type for repair after failure |
| Cron Task | Scheduled background task in Maximo |
| CRITICALITYRANK | Custom field for asset tier classification |
| DXA | Device-independent document unit (used in formatting) |
| EAM | Enterprise Asset Management |
| EM | Emergency Maintenance — work type for urgent unplanned work |
| ESRI | Environmental Systems Research Institute — GIS platform provider |
| FADD | Functional Analysis and Design Document |
| FAILURECODE | Maximo field capturing the failure class/code for WO failure analysis |
| FR | Functional Requirement |
| FTFR | First-Time Fix Rate — % of WOs resolved without reopening |
| GIS | Geographic Information System |
| IoT | Internet of Things — sensor and connected device ecosystem |
| ISO 14224 | International standard for collection/exchange of reliability and maintenance data |
| MAS | IBM Maximo Application Suite |
| MTBF | Mean Time Between Failures |
| MQTT | Message Queuing Telemetry Transport — lightweight IoT messaging protocol |
| NFR | Non-Functional Requirement |
| OSIsoft PI | Process data historian platform (now AVEVA PI) |
| PM | Preventive Maintenance — scheduled maintenance work type |
| SAP MM | SAP Materials Management module |
| SAP PM | SAP Plant Maintenance module |
| TPAE | Tivoli Process Automation Engine — the underlying Maximo platform |
| UAT | User Acceptance Testing |
| WO | Work Order |
| WOCLASS | Work Order class field (WORKORDER, ACTIVITY, CHANGE, RELEASE) |
| WOEESTCOST | Work Order estimated total cost |
| WOACTCOST | Work Order actual total cost |
| WOPRIORITY | Work Order priority field |
| YORN | Yes or No — Maximo field data type for boolean |

---

## 22. APPENDICES

### Appendix A — Automation Scripts Inventory

| Script Name | Object | Event | Description |
|---|---|---|---|
| WOPRIORITY_CALC | WORKORDER | Save | Calculate and assign WO priority from priority matrix |
| SAFETY_ACK_CHECK | WORKORDER | Status Change | Validate safety plan acknowledgment before INPRG |
| IOT_WO_CREATE | MXIOTBREACH | Message Received | Create WO from IoT breach payload |
| WO_CLOSURE_VALIDATE | WORKORDER | Status Change (→CLOSE) | Validate failure codes and compute cost variance |
| TECH_RECOMMEND | DISPATCHQUEUE | App Launch | Recommend technicians for WO assignment |
| LOC_NAMING_VALIDATE | LOCATIONS | Save | Validate location ID naming convention |
| LOC_ASSET_MOVE_VALIDATE | ASSET | Save | Validate asset location change rules |
| WARRANTY_EXPIRY_ALERT | ASSET | Cron | Generate warranty expiry notifications |
| GIS_COORD_SYNC | LOCATIONS | Cron | Sync GIS coordinates from ArcGIS |

---

### Appendix B — Communication Templates

| Template Name | Module | Trigger | Recipients |
|---|---|---|---|
| WO_SUPVAPPROVAL_REQUEST | Work Order | WO Priority 1/2 needs approval | WO Supervisor |
| WO_REJECTION_NOTIFY | Work Order | WO approval rejected | WO Requestor |
| WO_CLOSURE_APPROVAL | Work Order | WO closure needs supervisor approval | WO Supervisor |
| WO_COSTVARIANCE_ALERT | Work Order | Actual cost >20% over estimate | WO Supervisor, Planner |
| IOT_WO_CREATED | Work Order | IoT-generated WO created | Dispatcher, EAM Manager |
| WARRANTY_EXPIRY_60DAY | Asset | Warranty expires in 60 days | Craft Supervisor, Procurement |
| WARRANTY_EXPIRY_30DAY | Asset | Warranty expires in 30 days | Craft Supervisor, Procurement |
| ASSET_DEACT_REQUEST | Asset | Asset deactivation requested | Asset Manager |

---

### Appendix C — Dependencies and Prerequisites

| Dependency | Type | Owner | Required By |
|---|---|---|---|
| IBM MAS 8.11 Dev Environment | Infrastructure | IT Infrastructure | March 15, 2025 |
| SAP API Credentials | Access | SAP Basis Team | March 20, 2025 |
| ESRI ArcGIS Maximo Connector License | Software License | IT Procurement | April 1, 2025 |
| IoT Platform API Documentation | Documentation | IoT/OT Team | March 10, 2025 |
| Maximo Mobile License Count | Software License | IT Procurement | March 15, 2025 |
| SharePoint DocLinks Configuration | Configuration | IT SharePoint Admin | April 15, 2025 |
| Asset Criticality Assessment Completion | Data | Asset Management | May 1, 2025 |
| Location Hierarchy Rebuild (Sites 1–10) | Data | Field Operations | April 30, 2025 |

---

### Appendix D — Sign-Off and Approvals

| Role | Name | Signature | Date |
|---|---|---|---|
| EAM Program Manager | Dana Whitfield | *(Signed electronically)* | March 3, 2025 |
| Functional Lead — Work Management | Jorge Harmon | *(Signed electronically)* | March 3, 2025 |
| Functional Lead — Asset Management | Maria Castillo | *(Signed electronically)* | March 3, 2025 |
| Technical Architect | Thanh Nguyen | *(Signed electronically)* | March 3, 2025 |
| IT Security | Lisa Park | *(Signed electronically)* | March 3, 2025 |
| VP of Operations | *(Executive Sponsor)* | *(Signed electronically)* | March 3, 2025 |

---

*End of Document*

---

**Document Control Notice:** This document is version-controlled. Any modifications must be submitted as a Change Request to the EAM Program Manager. Unauthorized modifications are prohibited. The latest approved version is maintained in the EAM SharePoint document library under `/EAM-Program/FADD/FADD-MX-WOAL-2025-001`.
