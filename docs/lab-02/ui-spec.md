\# Lab 2 UI Specification — Zen Green Theme



\## 1. Color Tokens



| Token | Value | Usage |

|---|---|---|

| --color-primary | #006B3C | App header background, primary buttons, strong emphasis, active nav underline |

| --color-secondary | #0B7A46 | Active tabs, focus rings, links, hover states on secondary elements |

| --color-pale | #EAF6EF | Selected rows, success backgrounds, subtle section emphasis, read-only field background alternative |

| --color-bg | #F5F7F6 | Page background |

| --color-surface | #FFFFFF | Cards, panels, modals (with 1px #E2E8E5 border and a restrained 0 1px 3px rgba(0,0,0,0.06) shadow) |

| --color-text | #1F2A24 | Primary text (dark charcoal-green, not pure black) |

| --color-text-muted | #5B6B62 | Secondary text, helper text, placeholders |

| --color-field-editable-bg | #FFFFFF | Editable field background |

| --color-field-editable-border | #C9D6D0 | Editable field border (neutral) |

| --color-field-readonly-bg | #F1EFE6 | Read-only field background (warm ivory) |

| --color-field-readonly-text | #5B6B62 | Read-only field text |

| --color-error | #B3261E | Error text, error border, error icon |

| --color-error-bg | #FBEAE9 | Error message background |

| --color-warning | #B8860B | Warning callout/badge (amber) |

| --color-warning-bg | #FCF3D9 | Warning banner background |

| --color-success | #0B7A46 | Success text/icon (paired with a checkmark, not color alone) |



\## 2. Typography and Spacing



\- Base font size: 16px (1rem); line-height 1.5.

\- Headings: H1 24px/bold (page titles), H2 18px/semibold (section titles), H3 15px/semibold (card/group titles).

\- Labels: 14px/medium, --color-text, positioned above their control with 4px gap.

\- Helper/validation text: 13px, positioned directly below the control with 4px gap.

\- Spacing scale: 4, 8, 12, 16, 24, 32px. Form field vertical gap: 16px. Section gap: 32px.

\- Field height: 40px (single-line inputs, selects). Description textarea: min-height 96px, resizable vertically only, max-height capped to avoid breaking layout.



\## 3. Component States



\### 3.1 Editable Field

\- Background --color-field-editable-bg, border --color-field-editable-border (1px), border-radius 6px.

\- Focus: border color --color-secondary, 2px focus ring (box-shadow: 0 0 0 2px rgba(11,122,70,0.25)), visible for keyboard users (:focus-visible).

\- Disabled: background #F0F0F0, text #9AA5A0, cursor not-allowed, no hover/focus effects.



\### 3.2 Read-only Field

\- Background --color-field-readonly-bg, border 1px solid #E5DFC9, text --color-field-readonly-text.

\- Never receives focus ring; aria-readonly="true".

\- Visually distinct from editable fields at a glance (warm ivory vs. white).



\### 3.3 Required-field Marker

\- Red asterisk (\*, --color-error) immediately after the label text.

\- Asterisk alone never substitutes for a validation message — an error message must still appear on invalid submission.



\### 3.4 Validation Message

\- Appears directly below the associated field (never only as a single banner at the top).

\- Style: --color-error text, small error icon, 13px font.

\- Field border switches to --color-error when invalid.

\- Example: "Summary must be between 5 and 150 characters."



\### 3.5 Buttons — Hierarchy



| Variant | Style |

|---|---|

| Primary | --color-primary background, white text, used for the single main action per screen (Submit, Create Ticket, Continue) |

| Secondary | White background, --color-primary border and text (e.g., Cancel, Clear Filters) |

| Tertiary / Link | No border/background, --color-secondary text, underline on hover (e.g., "Change Requester") |

| Destructive | --color-error border and text on white background; confirmation required before executing (e.g., "Remove Attachment") |

| Disabled | 40% opacity, cursor: not-allowed, no hover/focus effects, applies to any variant |

| Busy | Primary button shows an inline spinner + "Submitting..." text, disabled attribute set, click handler ignored |



\- Every icon-only control (e.g., a trash icon for remove) must have aria-label and a visible tooltip on hover/focus.



\### 3.6 Screen-level States



| State | Rule |

|---|---|

| Loading | Skeleton rows/cards or a centered spinner with "Loading..." text; never a blank white screen |

| Empty | Illustration/icon + explanatory text + a relevant call-to-action button (e.g., "Create your first ticket") |

| No-results | Distinct copy from Empty (e.g., "No tickets match your filters") + a "Clear Filters" action |

| Error / API failure | Inline banner with --color-error-bg, explanatory text, and a "Retry" action where applicable; form values are preserved, never cleared |

| Success | --color-pale background confirmation area with a checkmark icon and the generated Ticket Number, plus next-action buttons |



\## 4. Application Shell



\- Header: fixed top bar, --color-primary background, height 56px.

&#x20; - Left: TokTickIT logo/name (white text).

&#x20; - Center/left-of-center: nav links "My Tickets", "Create Ticket" — active link gets a --color-secondary-colored 2px underline and slightly bolder weight.

&#x20; - Right: current Requester name (e.g., "Jennifer Anderson") + "Change Requester" link/icon button opening the Development Requester Selection screen.

\- On Mobile (<768px): nav collapses into a hamburger menu; current Requester name shown in the collapsed menu, not the header bar, to save space.



\## 5. Development Requester Selection Screen



\- Centered card, max-width 480px, on --color-bg background.

\- Icon + "Select Development Requester" H2 title.

\- Explanatory text (required, per handout Section 8.1): "Choose a development requester to simulate the current requester context for Lab 2. This is for testing only and is not a login screen."

\- Dropdown (<select>) labeled "Development Requester \*", populated only with active Requesters from GET /api/requesters.

\- Info callout (--color-pale background): "Only active development requesters are shown."

\- Secondary callout (neutral gray, shield icon): "Authentication coming in Lab 3 — in Lab 3, this selection will be replaced with secure authentication."

\- Buttons: "Cancel" (secondary) and "Continue" (primary, disabled until a Requester is chosen).

\- States:

&#x20; - Loading: dropdown shows a disabled "Loading requesters..." placeholder option.

&#x20; - Empty (no active Requesters): replace dropdown + Continue with an Empty state message: "No active Development Requesters are available. Please contact an administrator." No Continue action offered.

&#x20; - API failure: Error banner: "Unable to load Development Requesters. Please try again." + Retry button.

\- All controls keyboard-navigable (Tab order: dropdown -> Cancel -> Continue); dropdown is a native <select> for built-in accessibility.



\## 6. Create Ticket Screen



\### 6.1 Layout (top to bottom)

1\. System-generated group (read-only fields, shaded per Section 3.2): Ticket Number ("Generated after submission"), Ticket Date (today's date, read-only), Requester (current selection, read-only).

2\. Classification group (editable, side-by-side on Desktop/Tablet, stacked on Mobile): Category (<select>), Related System (<select>), Requested Priority (segmented control or <select>: Low/Medium/High).

3\. Content group (full-width): Ticket Summary (single-line input, required, asterisk), Description (textarea, required, asterisk).

4\. Attachments section: drag-and-drop zone or "Choose Files" button, list of selected files below with filename, size, and a per-file remove (x) control before submission; inline error per rejected file (wrong type / too large).

5\. Actions row (bottom, right-aligned on Desktop, full-width stacked on Mobile): "Cancel" (secondary) and "Submit Ticket" (primary, busy-state capable).



\### 6.2 States

\- Initial: all editable fields empty, Submit enabled but performs client validation on click.

\- Validation failure: offending field(s) show red border + message; focus moves to the first invalid field; no API call is made.

\- Submitting: Submit button shows busy state (see 3.5); all fields become read-only/disabled to prevent edits mid-submit.

\- Success: form is replaced by a --color-pale confirmation panel showing the official Ticket Number in large bold text, a success icon, and buttons "View Ticket" / "Create Another".

\- API failure: error banner appears above the form; all entered field values remain exactly as typed; Submit button re-enabled for retry.

\- Invalid attachment: rejected file is not added to the list; an inline message appears near the Attachments section stating the reason (e.g., "logo.gif: unsupported file type. Allowed: JPG, PNG, WEBP, PDF." or "photo.png: exceeds 5 MB limit.").



\## 7. My Tickets Screen



\### 7.1 Layout

\- Page header: "My Tickets" title + subtitle + "Clear Filters" (secondary) and "+ Create Ticket" (primary) buttons, top-right.

\- Filter bar (below header): search input (placeholder: "Search by ticket number or summary..."), Category dropdown, Requested Priority dropdown, Current Status dropdown — each defaulting to "All ...".

\- Desktop (>=992px): table with sortable column headers (click toggles asc/desc, shows a sort arrow icon): Ticket No., Created Date, Summary, Category, Requested Priority, Current Status, Last Updated.

\- Tablet (768-991px): reduced-column table (Ticket No., Summary, Current Status, Last Updated) with the rest visible on row expand/tap, or a card layout — implementation choice, but must remain fully readable with no clipped text.

\- Mobile (<768px): table collapses into stacked cards, one ticket per card, key fields only (Ticket No., Summary, Category badge, Status badge, Last Updated); no horizontal scrolling of the page.

\- Pagination controls at the bottom: "Previous", numbered pages, "Next"; shows "Showing X to Y of Z tickets".



\### 7.2 Badges

\- Requested Priority / IT Priority: Low = --color-pale bg / dark green text; Medium = --color-warning-bg bg / --color-warning text; High = --color-error-bg bg / --color-error text.

\- Current Status: New = neutral gray badge; (future statuses reserved for later labs, not implemented in Lab 2 beyond "New").

\- Badges never rely on color alone — each includes its text label (e.g., "High", "New").



\### 7.3 States

\- Loading: skeleton table/card rows (5-8 placeholder rows).

\- Empty (Requester has zero tickets total): centered message + icon + "Create your first ticket" primary button; filter bar is hidden or disabled in this state.

\- No-results (filters/search applied, zero matches): message "No tickets match your search or filters." + "Clear Filters" button; filter bar remains visible and usable.

\- Failure: error banner replacing the table area + "Retry" button.



\## 8. Requester Ticket Detail Screen



\### 8.1 Layout

\- Breadcrumb: "My Tickets > Ticket Details" with a "Back to My Tickets" link/button, top-right.

\- Ticket header group (read-only, per Section 3.2 shading): Ticket No., Ticket Date, Category, Related System, Requester, Requested Priority (badge), Current Status (badge), Summary, Description — laid out in a responsive grid (multi-column Desktop, stacked Mobile).

\- Attachments section (visually separated by a divider and its own heading "Attachments (N)"): list of attachment cards/rows, each showing filename, size, upload date, and action icons (Download, Remove) for active attachments.

\- Removed attachments appear in the same list, visually muted (reduced opacity / gray styling), showing "Removed - <reason>" instead of action icons, with Download/Preview disabled.

\- "Add Attachment" control at the bottom of the Attachments section (same upload rules as Create Ticket).



\### 8.2 States

\- Loading: skeleton layout matching the header + attachment list shape.

\- Not found / not owned: full-page "Ticket not found" message (never reveals that a differently-owned ticket exists) with a "Back to My Tickets" action.

\- Attachment upload in progress: uploading file shows a progress row with a spinner; other attachments remain interactive.

\- Attachment removal: clicking Remove opens a confirmation dialog requiring a removal reason (text input, required, min 5 characters) before confirming; Cancel closes without action.

\- Attachment removal success: the item updates in place to the "Removed" muted style without a full page reload.

\- Attachment action failure (e.g., download of an unavailable file): inline error toast/message, not a full-page error.
- Removed attachments never expose a clickable Download/Preview control in the UI (the button is
  omitted entirely, not just disabled) — the backend's 410 response is a defensive safety net only,
  not the primary way removal is communicated to the user.



\## 9. Responsive Rules Summary



| Viewport | Rule |

|---|---|

| Desktop >=992px | Multi-column layouts as described per screen; content max-width \~1140px, centered |

| Tablet 768-991px | Two-column layout where practical; Summary/Description retain full usable width |

| Mobile <768px | All fields stack vertically; buttons are full-width and touch-friendly (min 44px tap target); no horizontal page scrolling under any state |

| All sizes | No clipped labels, no overlapping validation messages, no hidden buttons, attachment filenames truncate with ellipsis + full name on hover/focus (title attribute) rather than overflowing |



\## 10. Accessibility Rules



\- All form controls have an associated <label> (via for/id or wrapping).

\- Focus indicators (:focus-visible) are never removed/hidden via CSS.

\- Color is never the only signal for state — badges, errors, and success states pair color with text and/or icons.

\- Icon-only buttons require aria-label and a visible tooltip.

\- Modals/dialogs (e.g., attachment removal confirmation) trap focus and are dismissible via Escape.



\## 11. Visual Inspection Checklist (for Section 8.8 evidence)



\- \[ ] Zen Green color tokens applied exactly as specified (header, buttons, badges, backgrounds).

\- \[ ] Editable vs. read-only fields are visually distinguishable at a glance.

\- \[ ] Required-field asterisks present; validation messages appear beside/below their field, not only at the top.

\- \[ ] Button hierarchy (primary/secondary/tertiary/destructive/disabled/busy) is visually consistent across all three screens.

\- \[ ] No clipped labels, overlapping messages, or hidden buttons at Desktop/Tablet/Mobile widths.

\- \[ ] No unintended horizontal scrolling at any viewport.

\- \[ ] Badge styles for Requested Priority / Current Status are consistent between My Tickets and Ticket Detail.

\- \[ ] Empty state and No-results state are visually and textually distinct in My Tickets.

\- \[ ] Screenshots captured at Desktop (>=992px), Tablet (768-991px), and Mobile (<768px) for Create Ticket, My Tickets, and Ticket Detail, stored under artifacts/lab-02/screenshots/.

