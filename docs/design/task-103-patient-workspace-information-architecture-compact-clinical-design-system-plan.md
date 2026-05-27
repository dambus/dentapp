# Task 103 - Patient Workspace Information Architecture & Compact Clinical Design System Plan

## Decision Summary

Task 102 remains valid: the pilot workflow is functionally ready.

Task 103 does not reverse that result. It records the product-owner decision to
insert one focused UI/UX refinement phase before the first serious guided doctor
pilot so the session evaluates the clinical flow rather than the current visual
density and generic presentation.

Recommended outcome:

- keep the validated pilot behavior and route semantics intact;
- redesign Patient Workspace around a much shorter `Overview` and clearer
  patient-scoped section navigation;
- reduce button, badge, and card density through a compact clinical UI language;
- move full-detail content behind stable patient-level sections instead of one
  long continuous page;
- treat odontogram as a separate future module, not a cosmetic polish item;
- follow with three small implementation slices rather than one broad redesign.

## Why Functional Readiness Does Not Yet Equal Pilot Presentation Quality

The current app can complete the clinic path, but the screenshots and runtime
structure still create three risks for doctor testing:

1. users react first to density and card stacking rather than to the workflow;
2. routine statuses and repeated buttons compete with the real clinical action;
3. Patient Workspace mixes overview, action surface, rebooking, shortcuts, and
   full record in one very long page, especially on mobile.

This is a presentation and information-architecture problem, not a functional
workflow failure.

## Screenshot-Based UI Findings

The current screenshots and runtime inspection show:

- Patient Workspace is too long and reads like several pages concatenated into
  one.
- The patient header has too many visible peer actions.
- Colored pills and badges are overused, with too many equal-emphasis states
  visible at once.
- Workflow Shortcuts behaves like a mini dashboard rather than a compact action
  system.
- Timeline/history uses too many cards inside cards and is harder to scan than
  a clinical event list should be.
- Treatment Plan detail mixes plan metadata, item detail, and actions inside a
  crowded nested card structure.
- Planner and Visit Completion are directionally correct, but they still inherit
  oversized button/badge/card primitives from the shared UI system.

## Target Patient Workspace Information Architecture

### Recommended Navigation Model

Recommended model: a hybrid based on stable patient-scoped query-backed section
navigation.

Use one patient route with a top-level section model such as:

- `Overview`
- `Record`
- `Treatment plan`
- `Timeline`
- `Odontogram`
- `Documents` only while the existing placeholder still exists

Recommended mechanics:

- preserve deep-linkable query state because the current implementation already
  uses `section=...`;
- evolve it into clearer patient-level navigation rather than hiding the full
  record selector deep inside the page;
- keep the same underlying route initially to avoid unnecessary route churn;
- if future runtime work shows true patient sub-routes are cleaner, the section
  model should still map cleanly onto them.

Reasoning:

- it preserves deep linking with minimal functional risk;
- it avoids immediate route proliferation;
- it supports a compact local-navigation treatment on desktop and a select/sheet
  treatment on mobile without changing the semantics.

### Persistent Patient Header

Target patient header across patient views:

- left-arrow back navigation beside page context, not a boxed competing button;
- patient name;
- one concise secondary identity line such as age/date of birth and maybe phone;
- only essential alert/status context;
- one contextually relevant primary action when appropriate;
- one overflow menu for secondary/admin actions.

Do not keep multiple visible peer buttons such as:

- edit patient,
- edit medical record,
- archive/restore,
- view full record,
- back to patients

all exposed at the same priority in the header.

### Overview Content Limit

The initial patient view should become a short clinical overview only.

Recommended overview content:

1. compact patient identity and critical warning context;
2. today's/current workflow card with the single primary clinical action;
3. treatment-plan summary card;
4. next appointment / rebooking summary card;
5. compact recent clinical activity / next step summary.

The overview should not contain:

- the full medical-record detail grid;
- the full treatment-plan editor;
- the full timeline;
- the large workflow shortcut grid;
- section-level detail views stacked inline below the overview.

## Overview Versus Detailed-Section Content Map

### Keep On Overview

- patient identity line;
- compact warning summary;
- current workflow summary and start/continue/view visit action;
- compact treatment-plan summary;
- compact appointment / rebooking summary;
- compact recent completed-visit summary;
- compact follow-up / next-step summary if it remains distinct enough after
  merging with recent activity.

### Condense Into Summary Cards

- safety / priority notes;
- treatment-plan context;
- appointment scheduling context;
- latest clinical activity;
- follow-up / next step.

### Move Behind Detail Sections

- full medical-record grid;
- full treatment-plan CRUD surface;
- full timeline/history;
- clinical notes detail area;
- documents placeholder area;
- odontogram section;
- broad workflow-shortcut set.

### Remove Or Collapse As Redundant

- prominent patient lifecycle status as its own overview concern unless it is
  operationally critical;
- repeated `Available`, `Read-only`, `Editable`, and role badges;
- duplicate workflow entry points that already exist in the main workflow card;
- long explanatory copy under routine shortcut actions.

## Button / Action System Rules

### Hierarchy

Use five action levels:

- `Primary`: the one dominant next action for the page or card.
- `Secondary`: important supporting action adjacent to the primary.
- `Tertiary / text`: low-emphasis navigation or reveal action.
- `Overflow / icon menu`: secondary, administrative, contextual, or repeated
  actions.
- `Destructive`: hidden in overflow unless the action is the entire blocked-state
  purpose.

### Rules

- Only one visually dominant primary action should exist per workflow card or
  page context.
- Administrative actions must not compete with clinical workflow actions.
- Repeated actions should not appear in multiple equally prominent places.
- Use icon plus label only when it improves scan speed for a known clinical
  action.
- Reserve icon-only actions for universal meanings such as back, close, more,
  and search, always with an accessible label.
- Destructive actions such as archive, cancel, and no-show should default to
  overflow placement.

### Density Direction

- Reduce desktop button padding and visual weight slightly.
- Keep mobile tap targets adequate, but avoid several stacked equal-weight
  full-width buttons unless one is the true current primary action.
- Prefer one primary plus one lightweight secondary over stacks of outlined
  buttons.
- In dense lists, use smaller secondary/tertiary actions instead of full button
  rows where safe.

## Badge / Status System Rules

### Target Principle

Colored pills should mark only meaningful state changes, warnings, or action
readiness. Routine metadata should become plain muted text or compact label
text.

### Use Alert Panels For

- critical medical warnings;
- blocked workflow conditions;
- actionable save/load/error notices.

### Use Badges For

- current workflow/action-required status;
- clearly meaningful lifecycle/operational state when it changes decisions;
- treatment-plan or visit state when it affects the next action.

### Use Plain Muted Text For

- read-only metadata;
- provider context;
- technical source labels in routine daily use;
- role labels;
- `patient scheduling` style descriptors;
- demo-only context in non-debug builds.

### Hide Or Remove From Production Display

- `Supabase mode`;
- most role/admin badges;
- generic `Available` / `Editable` / `Read-only` pills when the state is already
  obvious from the visible action model.

### Specific Badge Treatment

- `Active`: plain text by default, not a dominant pill.
- `Supabase mode`: technical/debug metadata, remove from production-facing UI.
- `Completed today`: valid badge only when it drives the next action.
- `Scheduled`: keep when distinguishing appointment lifecycle matters.
- `Not arrived`: keep on Planner cards, demote elsewhere.
- `Read-only`: remove unless it prevents expected editing.
- `In progress`: keep when the user must understand resumable workflow state.
- `Patient scheduling`: convert to muted subtitle text.
- `Available`: remove from shortcut cards; the presence of the action is enough.
- role/admin badges: move to overflow/context or hide unless operationally
  necessary.

Goal: no more than one or two meaningful colored badges in the main visible
block of a card or header.

## Treatment Plan Presentation Target

### Overview Summary

Overview should show only:

- current plan title;
- status;
- count of active planned items;
- one next relevant planned item or short objective;
- one action: `View treatment plan`.

No plan-level or item-level edit/archive/add controls should appear on Overview.

### Detailed Treatment Plan View

Recommended target:

- plan header with title, status, short objective;
- clear split between plan-level metadata and plan items;
- one scoped plan-level action area, preferably overflow-driven;
- one clear `Add item` action for authorized writers;
- compact item list rows with title, tooth/region, state, and minimal excerpt;
- item-level actions grouped at row level and visually subordinate.

Recommendation:

- promote Treatment Plan from a deep Full Record subsection into a first-class
  patient-level section;
- reuse the existing CRUD behavior and service boundaries;
- avoid leaving treatment-plan editing buried inside the generic `Clinical
  Record` block once the navigation restructure begins.

## Timeline / Clinical History Target

Recommended target:

- a chronological event list rather than nested dashboard cards;
- each row shows date/time, event type, one-line summary, and optional truncated
  note/recommendation excerpt;
- row click or `View details` opens the existing completed-visit detail route;
- use subtle dividers or markers, not nested highlight cards by default.

Decisions:

- keep latest clinical activity on Overview only as a compact summary card;
- move the full timeline into its own patient-level `Timeline` section;
- keep completed visit details on the existing detail route;
- remove duplicate “latest activity” style panels once the full timeline section
  becomes the primary history destination.

## Workflow Shortcuts Reduction

The current Workflow Shortcuts grid should not remain on the main overview.

Recommended change:

- keep only the real primary workflow action inside the current workflow card;
- allow one or two contextual support actions beside it when clinically useful,
  such as `View appointment` or `View completed visit`;
- move the rest into an `Actions` overflow menu or compact action strip tied to
  the patient header or section header.

Shortcut mapping:

- `Start Visit`: stays as the main workflow-card primary action.
- `Appointments`: stays reachable from the rebooking summary or actions menu.
- `Timeline`: move to patient section navigation or actions menu.
- `Add Clinical Note`: move to actions menu.
- `Update Odontogram`: move to actions menu.
- `Treatment Plan`: move to patient section navigation.
- `Edit Medical Record`: move to overflow/admin actions.

Do not rely on icon-only shortcuts for primary clinical actions.

## Odontogram Boundary

Odontogram should remain available as a section entry, but visually demoted
until a real dental interaction model exists.

Task 103 decision:

- do not try to cosmetically “sell” the current odontogram as a mature dental
  module;
- keep it as a secondary patient section entry;
- explicitly treat graphical odontogram design as a separate future workstream.

Future odontogram work likely needs:

- jaw / tooth graphical model;
- tooth and surface selection;
- tooth-state editing;
- clinical-history integration;
- responsive touch interaction design;
- treatment-plan relationship decisions.

Whether that becomes pre-pilot critical should be decided only if doctor testing
shows the current lightweight section is unacceptable for MVP use.

## Planner And Visit Completion Follow-up Scope

### Planner

Planner does not need another structural redesign before the patient-workspace
refactor. It likely needs only a compactness/alignment pass after shared
primitive changes:

- smaller badge emphasis;
- slightly shorter card height;
- cleaner warning/demo fixture presentation;
- tighter action/icon alignment.

### Visit Completion

Visit Completion should not be redesigned again. It only needs alignment with
the compact UI system after shared primitives change:

- smaller button/badge treatment;
- consistent back-navigation pattern;
- possibly lighter card stacking in review/success states.

No persistence or workflow semantics should change.

## Pre-Pilot Implementation Task Sequence

### Task 104 - Compact Clinical UI Primitives / Action and Status System

Implement the minimal shared visual-language updates for:

- button hierarchy and density;
- restrained badge/status styling;
- compact inline notices;
- back-navigation pattern;
- overflow-menu and icon/action conventions;
- local patient-section navigation primitives if needed.

### Task 105 - Patient Workspace Overview and Section Navigation Restructure

Implement:

- compact patient header;
- shorter patient overview;
- patient-level section navigation using the current query-backed section model;
- removal/reduction of workflow shortcuts;
- summary-first workflow, treatment-plan, rebooking, and recent-activity cards.

### Task 106 - Treatment Plan and Timeline Compact Detailed Presentation

Implement:

- first-class detailed Treatment Plan presentation;
- compact Timeline/history event-list presentation;
- clearer plan-level and item-level action ownership;
- preserved Task 98 mutation behavior and completed-visit detail access.

### Task 107 - Pre-Pilot Visual Consistency Walkthrough

Verify:

- Planner;
- Patient Workspace;
- Treatment Plan;
- Timeline;
- Visit Completion;
- rebooking;
- responsive behavior;
- no functional regression;
- continued absence of finance/settlement visibility.

## Deferred / Non-goals

Task 103 does not authorize:

- runtime UI changes yet;
- route/service/schema/RLS/RPC changes;
- finance, settlement, payment, charge, balance, invoice, or receipt features;
- a full odontogram redesign/implementation;
- new clinical workflow behavior;
- reminder or automation work;
- broad Planner or Visit Completion redesign beyond later compactness alignment.

The pilot checklist / observation-log task remains valid, but it is deferred
until after the compact redesign sequence above.

## Pilot-Readiness Impact

Task 102 proved the workflow can run.

Task 103 defines how to make that workflow presentable enough for a serious
doctor-facing pilot session without changing the validated behavior. The
recommended sequence should reduce density, clarify hierarchy, and make user
feedback more about the clinical path itself than about generic UI clutter.
