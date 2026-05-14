# Functional Design Document
## IBM Maximo — Asset Application

---

| **Document Information** | |
|---|---|
| **Document Title** | Functional Design Document — Asset Application |
| **Application Module** | IBM Maximo Asset Management |
| **Application Name** | Assets (ASSET) |
| **Version** | 1.0 |
| **Status** | Draft |
| **Prepared By** | [Author Name] |
| **Reviewed By** | [Reviewer Name] |
| **Approved By** | [Approver Name] |
| **Date Created** | [Date] |
| **Last Updated** | [Date] |
| **Maximo Version** | 7.6.1.x / MAS 8.x |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Scope and Objectives](#2-scope-and-objectives)
3. [Application Overview](#3-application-overview)
4. [User Roles and Access Control](#4-user-roles-and-access-control)
5. [Application Navigation and Layout](#5-application-navigation-and-layout)
6. [Data Model and Key Objects](#6-data-model-and-key-objects)
7. [Asset Application Tabs — Detailed Functional Design](#7-asset-application-tabs--detailed-functional-design)
   - 7.1 [Asset Tab (Header)](#71-asset-tab-header)
   - 7.2 [Details Tab](#72-details-tab)
   - 7.3 [Specifications Tab](#73-specifications-tab)
   - 7.4 [Meters Tab](#74-meters-tab)
   - 7.5 [Safety Tab](#75-safety-tab)
   - 7.6 [Failure Tab](#76-failure-tab)
   - 7.7 [Log Tab](#77-log-tab)
   - 7.8 [List Tab](#78-list-tab)
8. [Actions and Toolbar Operations](#8-actions-and-toolbar-operations)
9. [Business Rules and Validation Logic](#9-business-rules-and-validation-logic)
10. [Status Lifecycle](#10-status-lifecycle)
11. [Relationships to Other Applications](#11-relationships-to-other-applications)
12. [Integration Points](#12-integration-points)
13. [Automation Scripts and Customizations](#13-automation-scripts-and-customizations)
14. [Reports](#14-reports)
15. [Non-Functional Requirements](#15-non-functional-requirements)
16. [Open Issues and Decisions](#16-open-issues-and-decisions)
17. [Glossary](#17-glossary)
18. [Revision History](#18-revision-history)

---

## 1. Introduction

### 1.1 Purpose

This Functional Design Document (FDD) describes the functional requirements, business rules, data definitions, UI layout, and process flows for the **Asset Application** in IBM Maximo Asset Management. It serves as a reference for developers, business analysts, testers, and end-users involved in the configuration, customization, deployment, and use of the Asset module.

### 1.2 Document Conventions

- **Bold** text denotes UI field labels or application element names.
- `Code blocks` denote field names, database columns, or script identifiers.
- [REQUIRED] denotes mandatory configuration or field entry.
- [CONDITIONAL] denotes fields required only under specific conditions.
- [READ-ONLY] denotes fields that cannot be manually edited by users.

### 1.3 Intended Audience

| Audience | Purpose |
|---|---|
| Business Analysts | Requirements verification and gap analysis |
| Maximo Developers | Configuration, automation script development |
| Database Administrators | Schema understanding, SQL queries |
| System Administrators | Security, roles, and access control setup |
| QA / Testers | Test case derivation and UAT support |
| End Users | Training reference material |

---

## 2. Scope and Objectives

### 2.1 In Scope

- Functional design of the out-of-the-box (OOTB) Asset application
- All standard tabs, fields, and toolbar actions
- Customizations and automation scripts applied to the Asset application
- Status lifecycle and transitions
- Business rules enforced through validation
- Integration with Work Orders, Purchase Orders, Locations, Inventory, and Safety modules
- Role-based access control requirements
- BIRT report specifications associated with asset data

### 2.2 Out of Scope

- Financials module deep integration (only asset cost fields are covered)
- ERP/EAM integration middleware configuration
- Infrastructure setup and environment-specific deployment details
- Mobile (Maximo Anywhere / Manage Mobile) specific UX differences

### 2.3 Business Objectives

1. Provide a centralized registry of all physical and logical assets across the organization.
2. Track asset hierarchy (parent-child relationships) for structured reporting.
3. Enable accurate tracking of asset location, condition, and operational status.
4. Support lifecycle management from asset commissioning through decommissioning.
5. Maintain meter-based and calendar-based preventive maintenance schedules.
6. Enforce safety plans and hazard tagging on assets.
7. Facilitate failure analysis and reliability reporting.

---

## 3. Application Overview

### 3.1 Application Identity

| Property | Value |
|---|---|
| **Application Name** | Assets |
| **Application ID** | ASSET |
| **Database Object (MBO)** | `ASSET` |
| **Primary Table** | `ASSET` |
| **Navigation Path** | Assets > Assets |
| **Module** | Asset Management |

### 3.2 Application Description

The Asset application is the core registry of all physical equipment, infrastructure components, tools, and other maintainable items tracked by the organization. Each asset record captures identity, location, classification, specifications, operational history, and cost information.

Assets can be:
- **Physical Assets** – Pumps, motors, vehicles, buildings, instruments
- **Logical Assets** – Software licenses, IT services (when tracked as assets)
- **Rotating Assets** – Items that move between locations (e.g., spare pumps)

### 3.3 Key Capabilities

- Create, update, and manage asset master records
- Assign assets to locations and sites
- Define asset hierarchies (parent asset → child asset)
- Associate assets with Item Masters (for rotating assets)
- Track meter readings and meter-based PM triggers
- Attach hazards and lock-out/tag-out (LOTO) plans
- Record failure codes, problem codes, and causes
- Generate work orders from the asset context
- View financial cost rollups (YTD, lifetime cost)

---

## 4. User Roles and Access Control

### 4.1 Security Groups and Authorizations

| Role | Security Group | Access Level | Description |
|---|---|---|---|
| Asset Manager | `ASSETMGR` | Full Create / Edit / Delete | Full lifecycle management of assets |
| Asset Technician | `ASSETTECH` | Create / Edit (limited) | Create and update assets, no delete |
| Planner | `PLANNER` | Read / Edit specifications | View and update specs, no status change |
| Supervisor | `SUPERVISOR` | Read / Approve | Approve asset decommissioning |
| Read-Only User | `ASSETVIEW` | Read Only | View asset records, no modifications |
| System Administrator | `MAXADMIN` | Full + Admin | Unrestricted access |

### 4.2 Field-Level Security

| Field | Restricted Role | Restriction Type |
|---|---|---|
| `PURCHASEPRICE` | `ASSETTECH` | Hidden |
| `REPLACECOST` | `ASSETTECH` | Hidden |
| `YTDCOST` | `ASSETTECH` | Read-Only |
| `SERIALNUM` | `ASSETVIEW` | Read-Only |
| `ASSETNUM` | All after save | Read-Only (system-set) |

### 4.3 Application-Level Restrictions (SIGOPTIONs)

| SIGOPTION | Description | Restricted Groups |
|---|---|---|
| `CHANGESTAT` | Change asset status | `ASSETVIEW`, `ASSETTECH` |
| `DECOMMISSION` | Decommission an asset | `ASSETVIEW`, `ASSETTECH`, `PLANNER` |
| `SPLIT` | Split rotating asset | `ASSETVIEW` |
| `MOVEASSET` | Move asset to new location | `ASSETVIEW` |
| `SAFETYPLAN` | Attach/edit safety plan | `ASSETVIEW`, `ASSETTECH` |

---

## 5. Application Navigation and Layout

### 5.1 Start Center Integration

The Asset application surface is accessible from:
- **Navigation Bar** → Assets → Assets
- **Start Center portlets** (Recent Edits, KPI portlets)
- **Quick Insert** from Work Order or Location applications (linked navigation)

### 5.2 Application Toolbar

```
[ New Asset ]  [ Save ]  [ Delete ]  [ Duplicate ]  |  [ Previous ] [ Next ]  |  [ Actions ▼ ]  [ More Actions ▼ ]
```

### 5.3 Tab Structure

The Asset application contains the following tabs:

| Tab Order | Tab Label | Description |
|---|---|---|
| 1 | **Asset** | Header information — core identity fields |
| 2 | **Details** | Extended details — financial, location history |
| 3 | **Specifications** | Attribute specifications from classification |
| 4 | **Meters** | Meter definitions and reading history |
| 5 | **Safety** | Safety plans, hazards, precautions, LOTO |
| 6 | **Failure** | Failure codes, problem codes, causes |
| 7 | **Log** | Communication log entries |
| 8 | **List** | List view with search and filtering |

---

## 6. Data Model and Key Objects

### 6.1 Primary Table: `ASSET`

| Column | Data Type | Nullable | Description |
|---|---|---|---|
| `ASSETNUM` | VARCHAR(25) | NOT NULL | Unique asset identifier (PK) |
| `SITEID` | VARCHAR(8) | NOT NULL | Site identifier (multi-site key) |
| `ORGID` | VARCHAR(8) | NOT NULL | Organization identifier |
| `DESCRIPTION` | VARCHAR(100) | NULL | Short description of the asset |
| `DESCRIPTION_LONGDESC` | CLOB | NULL | Long description |
| `STATUS` | VARCHAR(20) | NOT NULL | Asset status (e.g., OPERATING, DECOMMISSIONED) |
| `STATUSDATE` | DATETIME | NULL | Date of last status change |
| `LOCATION` | VARCHAR(12) | NULL | Current operational location |
| `SITEID` | VARCHAR(8) | NOT NULL | Current site |
| `PARENT` | VARCHAR(25) | NULL | Parent asset number |
| `PARENTREL` | VARCHAR(25) | NULL | Parent asset relationship code |
| `SERIALNUM` | VARCHAR(64) | NULL | Manufacturer serial number |
| `ITEMNUM` | VARCHAR(30) | NULL | Linked Item Master (for rotating assets) |
| `ITEMSETID` | VARCHAR(8) | NULL | Item set for rotating asset |
| `CLASSSTRUCTUREID` | VARCHAR(20) | NULL | Classification structure reference |
| `ASSETTAG` | VARCHAR(25) | NULL | Physical tag/barcode number |
| `ASSETTYPE` | VARCHAR(15) | NULL | Type: IT, FACILITIES, PRODUCTION, VEHICLE, etc. |
| `MANUFACTURER` | VARCHAR(25) | NULL | Manufacturer code |
| `MODEL` | VARCHAR(25) | NULL | Model number |
| `VENDOR` | VARCHAR(25) | NULL | Vendor/supplier code |
| `PURCHASEPRICE` | DECIMAL(10,2) | NULL | Original purchase price |
| `REPLACECOST` | DECIMAL(10,2) | NULL | Estimated replacement cost |
| `YTDCOST` | DECIMAL(10,2) | NULL | Year-to-date total cost |
| `TOTALCOST` | DECIMAL(10,2) | NULL | Lifetime total cost |
| `INSTALLDATE` | DATE | NULL | Installation date |
| `WARRANTYEXPDATE` | DATE | NULL | Warranty expiry date |
| `PRIORITY` | INTEGER | NULL | Asset criticality priority (1–5) |
| `ISRUNNING` | YORN | NOT NULL | Currently running flag |
| `INVCOST` | DECIMAL(10,2) | NULL | Inventory/standard cost |
| `CHANGEBY` | VARCHAR(30) | NULL | Last changed by (system-set) |
| `CHANGEDATE` | DATETIME | NULL | Last change date (system-set) |

### 6.2 Key Related Tables

| Table | Relationship | Description |
|---|---|---|
| `ASSETMETER` | ASSET → ASSETMETER (1:N) | Meters attached to an asset |
| `ASSETSPEC` | ASSET → ASSETSPEC (1:N) | Specification attributes |
| `ASSETLOCHISTORY` | ASSET → location log (1:N) | Location change audit trail |
| `COMMLOG` | ASSET → COMMLOG (1:N) | Communication/log entries |
| `WORKORDER` | ASSET → WORKORDER (1:N) | Work orders against asset |
| `ASSETFAILURECODE` | ASSET → failure codes (1:N) | Failure code assignments |
| `SAFETYPLANDTL` | via ASSET.ASSETNUM | Safety plan linkage |
| `ASSETSTATUS` | Status history | Historical status transitions |

---

## 7. Asset Application Tabs — Detailed Functional Design

---

### 7.1 Asset Tab (Header)

This is the primary tab displayed when the Asset application is opened. It contains the most critical identity and location information.

#### 7.1.1 Header Section

| Field Label | DB Column | Data Type | Required | Editable | Description |
|---|---|---|---|---|---|
| **Asset** | `ASSETNUM` | VARCHAR(25) | Yes | No (after save) | System-assigned or manually entered unique asset number |
| **Description** | `DESCRIPTION` | VARCHAR(100) | Yes | Yes | Short description of the asset |
| **Long Description** | `DESCRIPTION_LONGDESC` | CLOB | No | Yes | Extended description (accessible via long-text icon) |
| **Status** | `STATUS` | VARCHAR(20) | Yes | Via Action only | Asset operational status. Changed only via **Change Status** action |
| **Status Date** | `STATUSDATE` | DATETIME | No | [READ-ONLY] | System-set date of last status change |
| **Asset Type** | `ASSETTYPE` | ALN | No | Yes | Lookup from `ASSETTYPE` domain |
| **Priority** | `PRIORITY` | INTEGER | No | Yes | 1 (Critical) to 5 (Non-Critical) |
| **Is Running?** | `ISRUNNING` | YORN | No | Yes | Checkbox: Is the asset currently running/in service |
| **Rotating** | `ISLINEAR` | YORN | No | Yes | Flag: Is this a rotating asset linked to an Item Master |

#### 7.1.2 Location Section

| Field Label | DB Column | Data Type | Required | Description |
|---|---|---|---|---|
| **Location** | `LOCATION` | VARCHAR(12) | No | Operational location of the asset. Lookup from `LOCATIONS` |
| **Location Description** | (derived) | VARCHAR(100) | No | [READ-ONLY] Description from LOCATIONS record |
| **Site** | `SITEID` | VARCHAR(8) | Yes | Site where asset resides. Set from user session; multi-site aware |
| **Organization** | `ORGID` | VARCHAR(8) | Yes | [READ-ONLY] Derived from SITEID |
| **System** | `LOCSYSTEM` | VARCHAR(25) | No | System/sub-system the asset belongs to |
| **Parent Asset** | `PARENT` | VARCHAR(25) | No | Parent asset number for hierarchy |
| **Parent Relationship** | `PARENTREL` | VARCHAR(25) | No | Type of parent relationship (e.g., SYSTEM, SUBSYSTEM) |

**Business Rule — Location and Site Consistency:**
- When a **Location** is entered, the `SITEID` on the Location must match the `SITEID` of the asset.
- Cross-site asset-location assignment is not permitted without explicit override.
- Changing the location of a rotating asset triggers a **Move/Modify** dialog.

#### 7.1.3 Asset Identity Section

| Field Label | DB Column | Data Type | Required | Description |
|---|---|---|---|---|
| **Serial Number** | `SERIALNUM` | VARCHAR(64) | No | Manufacturer serial number. Must be unique if asset type is ROTATING |
| **Asset Tag** | `ASSETTAG` | VARCHAR(25) | No | Physical barcode or RFID tag number |
| **Manufacturer** | `MANUFACTURER` | VARCHAR(25) | No | Lookup from `COMPANIES` filtered by type=MANUFACTURER |
| **Model** | `MODEL` | VARCHAR(25) | No | Model number |
| **Vendor** | `VENDOR` | VARCHAR(25) | No | Lookup from `COMPANIES` filtered by type=VENDOR |
| **Item Number** | `ITEMNUM` | VARCHAR(30) | [CONDITIONAL] | Required if asset is rotating. Links to Item Master |
| **Item Set** | `ITEMSETID` | VARCHAR(8) | [CONDITIONAL] | Required when Item Number is entered |

#### 7.1.4 Classification Section

| Field Label | DB Column | Data Type | Required | Description |
|---|---|---|---|---|
| **Classification** | `CLASSSTRUCTUREID` | VARCHAR(20) | No | Links to asset classification hierarchy. Drives Specifications tab |
| **Classification Description** | (derived) | VARCHAR(100) | No | [READ-ONLY] Derived from CLASSSTRUCTURE |

**Business Rule — Classification Change:**
- Changing the classification on an existing asset with existing specifications will prompt the user whether to retain or clear old specifications.
- Specifications tab content is dynamically rendered based on classification.

---

### 7.2 Details Tab

The Details tab contains extended asset information including financial data, warranty, purchase, and location history.

#### 7.2.1 Financial Information Section

| Field Label | DB Column | Data Type | Required | Description |
|---|---|---|---|---|
| **Purchase Price** | `PURCHASEPRICE` | DECIMAL(10,2) | No | Original acquisition cost |
| **Replacement Cost** | `REPLACECOST` | DECIMAL(10,2) | No | Estimated cost to replace the asset today |
| **Inventory Cost** | `INVCOST` | DECIMAL(10,2) | No | [READ-ONLY] For rotating assets, derived from Item Master |
| **YTD Cost** | `YTDCOST` | DECIMAL(10,2) | No | [READ-ONLY] Year-to-date accumulated cost from work orders |
| **Total Cost** | `TOTALCOST` | DECIMAL(10,2) | No | [READ-ONLY] Lifetime accumulated cost rollup |
| **Currency** | (org-level) | VARCHAR(8) | No | Org-level default currency |

#### 7.2.2 Purchase and Warranty Section

| Field Label | DB Column | Data Type | Required | Description |
|---|---|---|---|---|
| **Purchase Date** | `PURCHASEDATE` | DATE | No | Date asset was purchased |
| **Install Date** | `INSTALLDATE` | DATE | No | Date asset was physically installed |
| **PO Number** | `PONUM` | VARCHAR(25) | No | Purchase Order number linked to acquisition |
| **Warranty Expiry Date** | `WARRANTYEXPDATE` | DATE | No | Warranty expiration date. System highlights if near/past expiry |

**Business Rule — Warranty Alerts:**
- If `WARRANTYEXPDATE` is within 30 days of the current date, display a visual indicator on the asset record.
- Work orders linked to assets under warranty should display a warranty flag.

#### 7.2.3 Location History Sub-Table

This read-only sub-table (sourced from `ASSETLOCHISTORY`) shows the full history of location changes for the asset.

| Column | DB Column | Description |
|---|---|---|
| **Location** | `LOCATION` | Previous location code |
| **Site** | `SITEID` | Site at the time |
| **Move Date** | `MOVEDATE` | Date the move occurred |
| **Moved By** | `CHANGEBY` | User who performed the move |
| **GL Account** | `GLACCOUNT` | GL account charged for the move |

---

### 7.3 Specifications Tab

#### 7.3.1 Purpose

The Specifications tab renders dynamic attribute fields based on the asset's **Classification**. Specifications allow capturing technical parameters specific to the asset type (e.g., Voltage for electrical assets, Flow Rate for pumps).

#### 7.3.2 Functional Behavior

- Specifications are defined in the **Classifications** application under `CLASSSTRUCTURE`.
- Each classification attribute appears as a row in the Specifications sub-table.
- Attribute types supported: `ALN` (text), `NUMERIC`, `TABLE` (lookup), `DATE`, `BOOL` (yes/no).
- Attributes can be marked as **mandatory** at the classification level.
- **Unit of Measure (UOM)** can be specified per attribute and is displayed alongside the value.
- Specifications are inherited when an asset's classification is assigned to a child classification.

#### 7.3.3 Specifications Sub-Table Fields

| Column | DB Column | Description |
|---|---|---|
| **Attribute** | `ASSETATTRID` | Attribute code from classification |
| **Description** | (derived) | Attribute description |
| **Alphanumeric Value** | `ALNVALUE` | Text value (if ALN type) |
| **Numeric Value** | `NUMVALUE` | Numeric value (if NUMERIC type) |
| **Unit of Measure** | `MEASUREUNITID` | UOM for numeric attribute |
| **Date Value** | `DATEVALUE` | Date value (if DATE type) |
| **Table Value** | `TABLEVALUE` | Lookup/coded value (if TABLE type) |

---

### 7.4 Meters Tab

#### 7.4.1 Purpose

The Meters tab manages all meter definitions attached to an asset and provides entry points for recording meter readings. Meters are used to drive meter-based Preventive Maintenance (PM) schedules.

#### 7.4.2 Asset Meters Sub-Table (`ASSETMETER`)

| Column | DB Column | Required | Description |
|---|---|---|---|
| **Meter** | `METERNAME` | Yes | Meter name. Lookup from `METER` |
| **Meter Type** | `METERTYPE` | [READ-ONLY] | CONTINUOUS, GAUGE, or CHARACTERISTIC |
| **Unit of Measure** | `MEASUREUNITID` | No | UOM of the meter reading |
| **Last Reading** | `LASTREADING` | [READ-ONLY] | Most recent reading value |
| **Last Reading Date** | `LASTREADINGDATE` | [READ-ONLY] | Date of last reading |
| **Average** | `AVGCALC` | [READ-ONLY] | Computed average consumption/cycle rate |
| **Rollover Value** | `ROLLOVER` | No | Maximum value before meter rolls over to 0 |
| **Sequence** | `SEQUENCE` | No | Display order of meters |
| **Active** | `ACTIVE` | Yes | Whether meter is active (default: Yes) |

#### 7.4.3 Meter Types

| Meter Type | Description | PM Trigger Basis |
|---|---|---|
| `CONTINUOUS` | Continuously increasing value (e.g., odometer, run hours) | Accumulated reading delta |
| `GAUGE` | Point-in-time measurement (e.g., temperature, pressure) | Threshold value |
| `CHARACTERISTIC` | Qualitative state (e.g., Condition: GOOD/FAIR/POOR) | Specific value match |

#### 7.4.4 Entering Meter Readings

- Readings are entered via the **Enter Meter Readings** action or inline within the sub-table.
- Continuous meters validate that new readings are ≥ last reading (unless a rollover is recorded).
- All readings are stored in `METERREADING` table and contribute to PM forecast calculations.

---

### 7.5 Safety Tab

#### 7.5.1 Purpose

The Safety tab links safety plans, hazards, precautions, and lock-out/tag-out (LOTO) procedures to the asset. Safety data is propagated to Work Orders generated against the asset.

#### 7.5.2 Hazards Sub-Table

| Column | DB Column | Description |
|---|---|---|
| **Hazard** | `HAZARDID` | Hazard code. Lookup from `HAZARD` |
| **Description** | (derived) | Hazard description |
| **Hazard Type** | `HAZARDTYPE` | Type of hazard (CHEMICAL, ELECTRICAL, MECHANICAL, etc.) |
| **Controlling Hazard** | `CONTROLLINGHAZARDID` | Parent hazard (if this is a sub-hazard) |

#### 7.5.3 Safety Plans Sub-Table

| Column | DB Column | Description |
|---|---|---|
| **Safety Plan** | `SAFETYPLANID` | Reference to a Safety Plan record |
| **Description** | (derived) | Safety plan description |
| **Has Hazards** | (derived) | Indicator if plan contains hazards |
| **Has Precautions** | (derived) | Indicator if plan contains precautions |
| **Has LOTO** | (derived) | Indicator if plan includes lockout procedures |

**Business Rule — Safety Plan Propagation to Work Orders:**
- When a Work Order is created for an asset that has safety plans, the WO's Safety tab is automatically populated with the asset's safety plan data.
- Users must acknowledge safety procedures before a Work Order can be approved (if configured).

---

### 7.6 Failure Tab

#### 7.6.1 Purpose

The Failure tab configures the failure reporting hierarchy for the asset. This determines the failure codes, problem codes, and root cause codes available when closing Work Orders against this asset.

#### 7.6.2 Failure Codes Sub-Table

| Column | DB Column | Description |
|---|---|---|
| **Failure Class** | `FAILURECODE` | Top-level failure class. Lookup from `FAILURECODE` |
| **Description** | (derived) | Failure class description |
| **Inherited** | (flag) | Indicates if inherited from parent asset or location |

#### 7.6.3 Failure Hierarchy

```
Failure Class
└── Problem (What failed)
    └── Cause (Why it failed)
        └── Remedy (How it was fixed)
```

- Failure codes are defined in the **Failure Codes** application.
- Multiple failure classes can be assigned to a single asset.
- Work Orders reference the asset's failure class when requiring failure reporting on WO completion.

---

### 7.7 Log Tab

#### 7.7.1 Purpose

The Log tab provides a communication log (`COMMLOG`) associated with the asset. Users can record notes, attach documents, and track communications related to the asset's history.

#### 7.7.2 Communication Log Sub-Table

| Column | DB Column | Required | Description |
|---|---|---|---|
| **Log Type** | `LOGTYPE` | Yes | Log entry type: CLIENT, WORK, CLIENTNOTE, etc. |
| **Description** | `DESCRIPTION` | Yes | Subject/title of the log entry |
| **Long Description** | `DESCRIPTION_LONGDESC` | No | Full narrative |
| **Date** | `CREATEDATE` | [READ-ONLY] | System-set creation date |
| **Created By** | `CREATEBY` | [READ-ONLY] | User who created the log entry |

**Business Rule — Log Entry on Closed Assets:**
- Assets in `DECOMMISSIONED` or `DISPOSED` status are read-only.
- Direct `COMMLOG` creation on closed assets is blocked by Maximo's `historyflag` check.
- A custom automation script using `commLogSet.add(2)` with `MboConstants.NOACCESSCHECK` is required to bypass the read-only restriction when programmatically creating log entries.

---

### 7.8 List Tab

The List tab provides a tabular view of all asset records accessible to the current user, with search, filter, and sort capabilities.

#### 7.8.1 Default Columns Displayed

| Column | DB Column | Sortable | Filterable |
|---|---|---|---|
| **Asset** | `ASSETNUM` | Yes | Yes |
| **Description** | `DESCRIPTION` | Yes | Yes |
| **Status** | `STATUS` | Yes | Yes |
| **Location** | `LOCATION` | Yes | Yes |
| **Site** | `SITEID` | Yes | Yes |
| **Asset Type** | `ASSETTYPE` | Yes | Yes |
| **Priority** | `PRIORITY` | Yes | Yes |
| **Is Running** | `ISRUNNING` | No | Yes |
| **Parent** | `PARENT` | Yes | Yes |

#### 7.8.2 Search Filters

- **Basic Search**: Single text box filtering on `ASSETNUM` and `DESCRIPTION`.
- **Advanced Search**: All columns filterable using `=`, `LIKE`, `>`, `<`, and `BETWEEN` operators.
- **Saved Queries**: Users can save and share frequently used search filters.
- **Bookmarks**: Individual records can be bookmarked for quick access.

---

## 8. Actions and Toolbar Operations

### 8.1 Toolbar Actions

| Action | SIGOPTION | Description | Trigger Condition |
|---|---|---|---|
| **New Asset** | `INSERT` | Create a new blank asset record | Always available |
| **Save** | N/A | Save current record | Dirty record |
| **Delete** | `DELETE` | Delete asset (only if no WOs or history) | Asset has no work order history |
| **Duplicate** | `DUPLICATE` | Duplicate current asset record | Always available |
| **Previous / Next** | N/A | Navigate between records in result set | Search results exist |

### 8.2 Select Action Menu

| Action | SIGOPTION | Description |
|---|---|---|
| **Change Status** | `CHANGESTAT` | Transition asset to a new status state |
| **Move/Modify Asset** | `MOVEASSET` | Move asset to a new location or change parent |
| **Create Work Order** | `CREATEWO` | Create a corrective or PM work order against this asset |
| **View Work Orders** | N/A | Open related work orders list for this asset |
| **Enter Meter Readings** | `METERREADING` | Open meter reading entry dialog |
| **Attach Safety Plan** | `SAFETYPLAN` | Attach or detach a safety plan |
| **Split Asset** | `SPLIT` | Split rotating asset into two separate records |
| **View Asset Downtime** | N/A | View downtime history for this asset |
| **Generate Barcode/QR** | `BARCODE` | Generate printable asset tag (if configured) |
| **View Asset Hierarchy** | N/A | Open graphical hierarchy viewer |
| **View Cost YTD** | N/A | Open cost summary report |
| **Print Asset Record** | N/A | Print current asset details |

### 8.3 Move/Modify Asset Dialog

The **Move/Modify Asset** action opens a dialog for:

| Field | Description |
|---|---|
| **New Location** | Target location for the asset |
| **New Site** | Target site (cross-site moves if permitted) |
| **New Parent Asset** | New parent in the asset hierarchy |
| **Move Date** | Date of the physical move |
| **GL Account** | General Ledger account for cost allocation |
| **Move Reason** | Free-text reason for the move |

**Validation:**
- `New Location.SITEID` must equal `New Site` or the user must confirm a cross-site move.
- GL Account is required if financial integration is active.

---

## 9. Business Rules and Validation Logic

### 9.1 Asset Number Generation

| Rule | Detail |
|---|---|
| **Auto-Numbering** | If `ASSETNUM` is blank on save, the system generates a number from the `AUTONUM` sequence object configured for `ASSET` |
| **Manual Entry** | Users may manually enter an `ASSETNUM` before saving |
| **Uniqueness** | `ASSETNUM` + `SITEID` must be unique across the system |
| **Case Sensitivity** | `ASSETNUM` is stored in uppercase |

### 9.2 Rotating Asset Rules

| Rule | Detail |
|---|---|
| **Item Number Required** | If `ISROTATING = Y`, then `ITEMNUM` is mandatory |
| **Serial Number Uniqueness** | Serial number must be unique across all rotating assets of the same item |
| **Location Assignment** | Rotating asset location changes are tracked in `ASSETLOCHISTORY` |
| **Inventory Link** | Rotating assets are linked to Inventory records; moving to a storeroom creates an inventory transaction |

### 9.3 Hierarchy Rules

| Rule | Detail |
|---|---|
| **No Circular References** | An asset cannot be its own parent or ancestor |
| **Cross-Site Hierarchy** | Parent-child assets must be within the same `ORGID` |
| **Depth Limit** | No hard limit, but performance degrades beyond 10 levels |

### 9.4 Status Transition Rules

See [Section 10 — Status Lifecycle](#10-status-lifecycle).

### 9.5 Deletion Rules

| Condition | Rule |
|---|---|
| Asset has open Work Orders | Deletion blocked |
| Asset has active PM records | Deletion blocked |
| Asset has location history | Deletion blocked |
| Asset is a parent of other assets | Deletion blocked unless child assets are reassigned |
| Asset has no history | Deletion permitted (with confirmation) |

---

## 10. Status Lifecycle

### 10.1 Asset Status Values

| Status Code | Label | Description |
|---|---|---|
| `OPERATING` | Operating | Asset is in active, normal operation |
| `DECOMMISSIONED` | Decommissioned | Asset is permanently removed from service |
| `INACTIVE` | Inactive | Asset is not currently in use but not decommissioned |
| `BROKEN` | Broken | Asset is non-functional, awaiting repair |
| `SEALED` | Sealed | Asset is locked for regulatory or legal reasons |
| `MISSING` | Missing | Asset cannot be located |
| `DISPOSED` | Disposed | Asset physically discarded/sold |

### 10.2 Allowed Status Transitions

```
                   ┌──────────────────────┐
                   │       INACTIVE       │◄────────────────┐
                   └─────────┬────────────┘                 │
                             │                              │
                             ▼                              │
                   ┌──────────────────────┐           (Reactivate)
     [New Asset]──►│      OPERATING       │─────────────────┤
                   └──────┬───────┬───────┘                 │
                          │       │                         │
                    (Break)│   (Decommission)         (Return from
                          │       │                     repair)
                          ▼       ▼                         │
              ┌────────────┐   ┌──────────────────┐         │
              │   BROKEN   │──►│  DECOMMISSIONED  │         │
              └────────────┘   └────────┬─────────┘         │
                   │                   │                     │
              (Repair Complete)    (Dispose)            (Unseal)
                   │                   │                     │
                   └──────►OPERATING   ▼               ┌─────────┐
                                   ┌────────┐          │ SEALED  │◄──(Seal)
                                   │DISPOSED│          └─────────┘
                                   └────────┘
```

### 10.3 Status Transition Table

| From Status | To Status | Roles Permitted | Conditions |
|---|---|---|---|
| (New) | `OPERATING` | ASSETMGR, ASSETTECH | Default status on creation |
| `OPERATING` | `INACTIVE` | ASSETMGR | No open WOs required |
| `OPERATING` | `BROKEN` | ASSETMGR, ASSETTECH | — |
| `OPERATING` | `SEALED` | ASSETMGR | Requires reason |
| `OPERATING` | `DECOMMISSIONED` | ASSETMGR | Supervisor approval required |
| `INACTIVE` | `OPERATING` | ASSETMGR | — |
| `BROKEN` | `OPERATING` | ASSETMGR, ASSETTECH | — |
| `DECOMMISSIONED` | `DISPOSED` | ASSETMGR | Requires approval |
| `SEALED` | `OPERATING` | ASSETMGR | Unsealing authority required |

### 10.4 Status Change Dialog Fields

| Field | Required | Description |
|---|---|---|
| **New Status** | Yes | Target status from allowed transitions |
| **Change Date** | Yes | Effective date of status change (default: today) |
| **Reason** | [CONDITIONAL] | Required for DECOMMISSIONED and DISPOSED transitions |
| **Memo** | No | Free-text note recorded in COMMLOG |

---

## 11. Relationships to Other Applications

### 11.1 Work Orders

| Relationship | Direction | Description |
|---|---|---|
| Asset → Work Orders | 1:N | An asset can have many work orders |
| Work Order lookup | ASSET field in WO | Work Order's ASSETNUM links to this Asset record |
| Cost rollup | WO → Asset | WO actual costs roll up into asset's `YTDCOST` and `TOTALCOST` |
| Failure codes | WO ← Asset | Work Orders inherit failure class from asset |
| Safety | WO ← Asset | Safety plans from asset propagated to WO Safety tab |

### 11.2 Locations

| Relationship | Direction | Description |
|---|---|---|
| Asset is placed at Location | ASSET.LOCATION → LOCATIONS | Asset's current location reference |
| Location hierarchy | — | Asset location inherits system/area from parent location |
| Location change history | — | Logged in `ASSETLOCHISTORY` |

### 11.3 Preventive Maintenance (PM)

| Relationship | Direction | Description |
|---|---|---|
| PM targets Asset | PM.ASSETNUM → ASSET | PM schedules generate WOs for the asset |
| Meter-based PM | ASSETMETER → PM | Meter readings on asset trigger PM WO generation |

### 11.4 Inventory / Item Master (Rotating Assets)

| Relationship | Direction | Description |
|---|---|---|
| Rotating asset ↔ Item Master | ASSET.ITEMNUM → ITEM | Asset linked to storeroom inventory |
| Location = Storeroom | ASSET.LOCATION → STOREROOM | Asset physically in inventory |
| Asset move to/from storeroom | — | Triggers inventory transaction |

### 11.5 Purchasing

| Relationship | Direction | Description |
|---|---|---|
| Asset acquired via PO | ASSET.PONUM → PO | Purchase order reference for acquisition |
| Warranty linked to PO | — | Warranty terms can be derived from PO |

---

## 12. Integration Points

### 12.1 External System Integrations

| System | Integration Type | Direction | Description |
|---|---|---|---|
| ERP (SAP/Oracle) | OSLC / REST / MIF | Bidirectional | Asset financial data sync (cost centers, GL accounts) |
| GIS System | REST API | Inbound | GPS coordinates and location sync |
| IoT / SCADA | REST / MQTT | Inbound | Live sensor data to meter readings |
| Document Management | OSLC Attachment | Outbound | Asset documents stored in external DMS |
| HR System | REST | Inbound | Owner/responsible person data |

### 12.2 Maximo Integration Framework (MIF)

| Object Structure | Description |
|---|---|
| `MXASSET` | Standard Maximo OSLC/REST object structure for Asset |
| `MXWO` | Used for creating WOs via asset context |
| `MXINVENTORY` | Used when rotating assets are moved to storerooms |

### 12.3 REST API Access (Maximo Application Framework)

```
GET    /maximo/oslc/os/mxasset/{assetnum}          — Retrieve asset
POST   /maximo/oslc/os/mxasset                     — Create asset
PATCH  /maximo/oslc/os/mxasset/{assetnum}          — Update asset
DELETE /maximo/oslc/os/mxasset/{assetnum}          — Delete asset
GET    /maximo/oslc/os/mxasset?oslc.where=siteid="SITE1"  — Query assets
```

---

## 13. Automation Scripts and Customizations

### 13.1 Automation Script: ASSET_ONADD

| Property | Value |
|---|---|
| **Script Name** | `ASSET_ONADD` |
| **Language** | Jython (Python 2.7) |
| **Launch Point** | Object: `ASSET`, Event: `ONADD` |
| **Trigger** | Fires when a new asset record is added (saved for the first time) |

**Purpose:** Perform post-creation initialization:
- Auto-populate `ASSETTAG` from `ASSETNUM` if tag is blank.
- Log asset creation to an audit COMMLOG entry.
- Assign default classification if asset type maps to a standard classification.

**Caution — ONADD Firing 1000x Bug:**
> In some Maximo versions, the `ONADD` event can fire multiple times during batch imports or API-based creation. Guard against this with a flag check:

```python
if mbo.isNew() and not mbo.getBoolean("_ONADD_FIRED"):
    mbo.setValue("_ONADD_FIRED", True, MboConstants.NOACCESSCHECK)
    # ... rest of logic
```

### 13.2 Automation Script: ASSET_COMMLOG_BYPASS

| Property | Value |
|---|---|
| **Script Name** | `ASSET_COMMLOG_BYPASS` |
| **Language** | Jython |
| **Launch Point** | Custom / Called from external script |
| **Purpose** | Create COMMLOG entries on closed/decommissioned assets |

**Problem Context:** Standard Maximo blocks COMMLOG creation on assets with `historyflag=1` (closed records) via `canEditRelatedSet()` returning false.

**Solution:**
```python
from com.ibm.tivoli.maximo.script import ScriptMbo
from psdi.mbo import MboConstants

def createCommLog(assetMbo, logType, description, longDesc):
    commLogSet = assetMbo.getMboSet("COMMLOG")
    commLogSet.add(2)  # 2 = bypass read-only check flag
    newLog = commLogSet.getMbo(0)
    newLog.setValue("LOGTYPE", logType, MboConstants.NOACCESSCHECK)
    newLog.setValue("DESCRIPTION", description, MboConstants.NOACCESSCHECK)
    newLog.setValue("DESCRIPTION_LONGDESC", longDesc, MboConstants.NOACCESSCHECK)
    commLogSet.save()
```

### 13.3 Automation Script: ASSET_STATUS_VALIDATE

| Property | Value |
|---|---|
| **Script Name** | `ASSET_STATUS_VALIDATE` |
| **Launch Point** | Attribute: `ASSET.STATUS`, Event: `VALIDATE` |
| **Purpose** | Enforce custom status transition rules beyond OOTB |

**Logic:**
- Prevent status change to `DECOMMISSIONED` if open Work Orders exist.
- Require memo when transitioning to `SEALED`.
- Log all status changes with before/after values to COMMLOG.

### 13.4 Application Designer Customizations

| Customization | Description |
|---|---|
| **Asset Tab — Conditional Field Visibility** | `ITEMNUM` field hidden unless `ISROTATING = 1` |
| **Details Tab — Purchase Section** | `PURCHASEPRICE` and `REPLACECOST` hidden for `ASSETTECH` group |
| **Safety Tab — Read-Only in DECOMMISSIONED** | Entire Safety tab set read-only when status is `DECOMMISSIONED` |
| **Custom Section — GPS Coordinates** | Added `LATITUDE` and `LONGITUDE` (custom attributes) to Details tab |
| **Log Tab — Restricted Log Types** | Domain filtered to exclude internal log types from user view |

---

## 14. Reports

### 14.1 Asset Detail Report

| Property | Value |
|---|---|
| **Report Name** | `ASSET_DETAIL` |
| **Report Type** | BIRT |
| **Trigger** | Print action from Asset application |
| **Output Formats** | PDF, HTML, XLS |

**Content Sections:**
1. Asset header (ASSETNUM, Description, Status, Site, Location)
2. Identity data (Serial, Tag, Manufacturer, Model)
3. Financial summary (Purchase Price, Replacement Cost, YTD Cost, Total Cost)
4. Meters list (Meter name, Last Reading, Last Reading Date)
5. Active Work Orders list
6. Specifications list

### 14.2 Asset Inventory Report

| Property | Value |
|---|---|
| **Report Name** | `ASSET_INVENTORY` |
| **Type** | BIRT |
| **Parameters** | Site, Asset Type, Status, Location |
| **Purpose** | Full asset register export for audit/inventory |

### 14.3 Asset Cost Summary Report

| Property | Value |
|---|---|
| **Report Name** | `ASSET_COSTSUMMARY` |
| **Type** | BIRT |
| **Parameters** | Asset Number, Date Range |
| **Data Source** | `WORKORDER` joined to `ASSET` on `ASSETNUM` and `SITEID` |
| **Content** | Monthly cost breakdown by WO type (PM, CM, EM) |

**Key SQL Pattern:**
```sql
SELECT
    a.ASSETNUM,
    a.SITEID,
    TO_CHAR(w.ACTFINISH, 'YYYY-MM') AS MONTH,
    w.WORKTYPE,
    SUM(w.ACTLABCOST + w.ACTMATCOST + w.ACTSERVCOST + w.ACTTOOLLABCOST) AS TOTAL_COST
FROM
    ASSET a
    JOIN WORKORDER w ON w.ASSETNUM = a.ASSETNUM AND w.SITEID = a.SITEID
WHERE
    a.ASSETNUM = :assetnum
    AND a.SITEID = :siteid
    AND w.ACTFINISH BETWEEN :startdate AND :enddate
GROUP BY
    a.ASSETNUM, a.SITEID, TO_CHAR(w.ACTFINISH, 'YYYY-MM'), w.WORKTYPE
ORDER BY
    MONTH, w.WORKTYPE
```

### 14.4 Asset Status History Report

| Property | Value |
|---|---|
| **Report Name** | `ASSET_STATUSHISTORY` |
| **Data Source** | `ASSETSTATUS` table |
| **Purpose** | Audit trail of all status transitions for an asset |

---

## 15. Non-Functional Requirements

### 15.1 Performance

| Requirement | Target |
|---|---|
| Asset record load time | < 2 seconds (95th percentile) |
| Asset list search response | < 3 seconds for up to 10,000 records |
| Batch asset import (1,000 records via MIF) | < 5 minutes |
| Meter reading batch processing | < 10 seconds per 100 readings |

### 15.2 Data Volume

| Entity | Expected Volume | Notes |
|---|---|---|
| Total Asset Records | Up to 500,000 | Across all sites |
| Assets per Site | Up to 50,000 | Per `SITEID` |
| COMMLOG entries per Asset | Up to 1,000 | Before archiving |
| Meter Readings per Meter | Unlimited (archiving required after 2 years) | |

### 15.3 Security

- All asset data is site-scoped; users only see assets from their authorized sites.
- Sensitive financial fields are secured at field-level per security group.
- All status changes are audit-logged with user, timestamp, and reason.
- API access requires valid Maximo API key and authorized security group.

### 15.4 Availability

- Asset application must be available during core business hours (06:00–22:00 local).
- Planned downtime for maintenance must not exceed 4 hours per month.

### 15.5 Auditability

- All field changes to `ASSETNUM`, `STATUS`, `LOCATION`, `PARENT`, and `SERIALNUM` must be logged via Maximo's field audit capability.
- Audit logs retained for minimum 7 years.

---

## 16. Open Issues and Decisions

| ID | Issue / Decision | Owner | Status | Target Date |
|---|---|---|---|---|
| OI-001 | Confirm auto-numbering sequence start value for ASSETNUM | [Business Analyst] | Open | [Date] |
| OI-002 | Cross-site asset moves: confirm whether allowed and GL account rules | [Finance Lead] | Open | [Date] |
| OI-003 | BIRT report RTL requirement for Arabic locale — mirror layout needed | [Developer] | In Progress | [Date] |
| OI-004 | Rotating asset serial number uniqueness: enforce globally or per ITEMNUM | [Architect] | Open | [Date] |
| OI-005 | GPS coordinates on assets — confirm UDF attribute names for LATITUDE/LONGITUDE | [BA / DBA] | Open | [Date] |
| OI-006 | Warranty alert threshold: confirm 30-day default or site-configurable | [Business Owner] | Open | [Date] |
| OI-007 | Whether COMMLOG entries should be created on DECOMMISSIONED assets via automation | [Developer] | Resolved: Yes via bypass script | — |

---

## 17. Glossary

| Term | Definition |
|---|---|
| **Asset** | A physical or logical item maintained by the organization and tracked in Maximo |
| **MBO** | Maximo Business Object — the Java object layer representing a database record |
| **SITEID** | Site identifier used for multi-site partitioning in Maximo |
| **ORGID** | Organization identifier; parent grouping above SITEID |
| **Rotating Asset** | An asset that can move between locations and is tracked as inventory when in a storeroom |
| **Classification** | A hierarchical taxonomy used to group assets and define their specification attributes |
| **COMMLOG** | Communication Log — a journal of notes and events against a Maximo record |
| **PM** | Preventive Maintenance schedule that auto-generates Work Orders |
| **LOTO** | Lock-Out/Tag-Out — safety procedure to ensure equipment is de-energized before maintenance |
| **SIGOPTION** | Security Option — a granular permission flag controlling access to specific application actions |
| **WO** | Work Order — a record of maintenance work performed or planned against an asset |
| **MIF** | Maximo Integration Framework — middleware layer for integrating Maximo with external systems |
| **BIRT** | Business Intelligence and Reporting Tools — the report engine integrated with Maximo |
| **historyflag** | Internal Maximo flag (`1` = closed/historical) that triggers read-only enforcement on MBO sets |
| **MboConstants** | Java constants class in Maximo used to control field access flags in automation scripts |
| **OSLC** | Open Services for Lifecycle Collaboration — REST-based API standard used by Maximo |

---

## 18. Revision History

| Version | Date | Author | Description |
|---|---|---|---|
| 0.1 | [Date] | [Author] | Initial draft — structure and scope |
| 0.2 | [Date] | [Author] | Added data model, tab designs, and business rules |
| 0.3 | [Date] | [Author] | Added automation scripts, integration, and BIRT reports |
| 1.0 | [Date] | [Author] | Final review and approval |

---

*End of Document — IBM Maximo Asset Application Functional Design Document v1.0*
