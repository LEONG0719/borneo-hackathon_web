# BorNEO AI

BorNEO AI is a role-based disaster preparedness and emergency response platform for Borneo communities. The app separates resident and administrator workflows so each user sees only the tools they need during preparedness, alert monitoring, and emergency response.

- Website URL: https://borneo-hackathon-web-beige.vercel.app/
- Demo Video URL: https://youtu.be/FFtnrWynUGQ
- Final Report URL: https://drive.google.com/file/d/1MfYfEInGYYWXxgn2inuS9eN2ZNnaedgs/view?usp=sharing

<br />

- More Details Information (Setup Instructions / Login Steps): https://github.com/ACZH05/borneo-hackathon/tree/main/doc

## What's New

- Rescue-card updates now support an emergency-contact Gmail consent flow, so a new contact address is only saved after the contact approves by email.
- SOS submissions can notify an approved emergency contact with incident details, responder-facing medical context, and a location link.
- The admin alerts workspace now covers AI draft generation from SOS incidents, live weather draft ingestion, source/status-aware filtering, pagination, and draft-to-published status changes.
- Session validation and inactivity monitoring now help protect authenticated resident and admin workflows.

## What The App Does

- Helps residents prepare with AI-powered simulations and personalized emergency checklists.
- Gives residents a rescue card with medical details, approved emergency-contact support, home location, and QR code access.
- Lets residents send SOS reports with live GPS coordinates, hazard details, and emergency-contact notification support when consent has been approved.
- Gives administrators a triage workspace for SOS requests plus an alert operations dashboard for AI-assisted drafts, live weather ingestion, and publication control.

## Role Views

### Resident view

- Resident navigation includes `Home`, `Alerts`, `Resources`, and `Profile`.
- Global search can jump to the dashboard, alerts, resources, simulation, checklist, and profile pages.
- Residents can log in with a Supabase magic link.
- Residents can trigger SOS reports, view published alerts, generate checklists, run simulations, and manage a rescue card with approval-gated emergency-contact Gmail support.

### Admin view

- Admin navigation includes `SOS`, `Alerts`, and `Profile`.
- Admin routes are protected by a role check and redirect non-admin users away from `/admin/*`.
- Global search switches to admin-specific items like the SOS dashboard, AI alert drafts, and admin profile.
- Admins can review incoming SOS cases, inspect rescue-card data, generate alert drafts from incident reports, and move alerts between `draft` and `published` states.

## Shared Shell Features

- Sticky header with role-aware navigation.
- Mobile drawer navigation and desktop nav pills.
- Search bar with contextual route suggestions that switch between resident and admin destinations.
- Magic-link login modal and logout button.
- Session validation on load plus inactivity-based expiry monitoring for signed-in users.
- Shared footer and loading states.

## Resident Pages

### `/` Home

- Hero dashboard for the resident experience.
- Browser geolocation request to center the map on the user.
- Live map panel showing the current location area.
- `SOS` button that opens an emergency modal.
- SOS modal includes hazard selection, optional incident description, GPS capture, submission feedback, and error handling.
- Quick-access emergency details card.
- Emergency details modal showing name, blood type, allergies, medical conditions, emergency contact, phone, home address, and QR code.
- Latest alerts section that highlights the top active alerts.
- Featured alert cards support deep-link navigation into the alerts page.
- Platform status card shows current alert level, active incidents, and last update time.
- Trusted contacts list includes click-to-call emergency numbers.

### `/page-alerts` Alerts

- Dedicated active alert dashboard.
- Toggle between `List` view and `Map` view.
- Hazard filters for `All Threats`, `Flood`, `Landslide`, `Tidal`, and `Other`.
- List cards for active alerts with severity styling and location context.
- Map mode for viewing alert locations visually.
- Clicking a list item can focus the map.
- Clicking a map pin can jump back to the related list item.
- URL query support for opening the page and auto-scrolling to a selected alert.

### `/page-resources` Resources Hub

- Preparedness landing page for low-bandwidth tools.
- Card entry point for the AI Survival Simulator.
- Card entry point for Smart Emergency Checklists.

### `/page-resources/page-resources-simulation` AI Survival Simulator

- Hazard selection for `Flood`, `Landslide`, and `Tidal`.
- Scenario descriptions before starting the simulation.
- Start button becomes active only after hazard selection.
- AI-generated emergency scenario fetched from `/api/ai/quiz`.
- Multiple-choice response flow with one selected answer.
- Correct and incorrect answer feedback after submission.
- Explanation panel describing the best action.
- Restart flow to generate another scenario.
- Loading and error states for quiz generation.

### `/page-resources/page-resources-checklist` Smart Emergency Checklists

- Auth-aware access that requires the user to be logged in.
- Responsive side drawer with an introduction view, a create-new-checklist action, and checklist history.
- Introduction panel explaining the 3-step checklist workflow.
- Checklist generator form with preset or custom hazard type, household size, number of pets, and special-needs or medical notes.
- AI checklist generation via `/api/ai/generate-plan`.
- Rotating progress messages while the checklist is being generated.
- Saved checklist history loaded from `/api/checklist`.
- Checklist detail view with completion counter.
- Item toggle support for marking tasks complete/incomplete.
- Unsaved/synced state indicator.
- Manual save action.
- Auto-save on view changes and before page unload.
- Delete action for removing a saved checklist.
- Mobile floating action button to open the drawer.

### `/page-profile` Resident Profile

- Loads the authenticated resident profile from Supabase and `/api/user/[id]`.
- Identity card with generated avatar, role badge, and assigned region.
- Edit profile drawer for display name and region updates.
- Read-only email field in the profile editor.
- Rescue-card section showing blood type, allergies, medical conditions, emergency contact, phone number, and home base address or coordinates.
- Rescue-card editing drawer with blood type selection, allergy and medical-condition fields, emergency contact fields, emergency-contact Gmail approval support, home address input, address lookup via `/api/geocode`, map-based pin selection, reverse geocoding via `/api/reverse-geocode`, coordinate preview, and QR code generation on save.
- Pending emergency-contact consent state is surfaced when a new Gmail address is awaiting email approval.
- Emergency QR panel supports responder scanning and QR sharing when QR data exists.
- Toast feedback covers profile saves, rescue-card saves, and consent-email dispatch.
- Loading and fetch-error states.

## Admin Pages

### `/admin/page-sos` SOS Dashboard

- Split layout with request queue on the left and detail panel on the right.
- Empty-state detail panel prompting the admin to select a request.
- Active SOS request list built from `/api/reports`.
- Severity filter chips for `False Alarm`, `Low`, `Medium`, `High`, and `Critical`.
- Per-severity request counts.
- Refresh button to reload the request list.
- Request tabs show severity, hazard type, location, and report time.
- Clicking a request opens its detailed triage page.

### `/admin/page-sos/[uid]` SOS Triage Detail

- Incident map centered on the reported SOS coordinates.
- Rescue card summary for the affected resident.
- Medical details pulled from the resident rescue card.
- Emergency contact and home address visibility for responders.
- AI signal intelligence panel showing the recommended action summary from triage output.
- `Deploy Alert` action can generate an AI alert draft from the incident report, let the admin edit it, and post it into the alert system.
- Loading state while report and resident data are being fetched.
- Secure-system status footer strip.

### `/admin/page-alerts` AI Alert Draft Review

- Loads alerts from `/api/alert` for a broader admin operations view.
- Supports source, status, severity, hazard, state, and sort-order filters.
- Shows empty, load-error, and no-results states based on the current filter set.
- Displays alert metadata, source, severity, status, title, and body for each item.
- Status actions update alerts through `/api/alert/[id]/status` so admins can move items between `draft` and `published`.
- Includes per-alert loading feedback, action banners, pagination, and list refresh support.

### `/admin/page-profile` Admin Profile

- Loads the authenticated admin profile from Supabase and `/api/user/[id]`.
- Admin identity card with avatar, role badge, and assigned region.
- Edit profile drawer for name and region updates.
- Account details panel showing display name, email, role, and region.
- Admin access panel summarizing the control-panel workspace.
- Toast feedback for successful profile updates.
- Loading and fetch-error states.

## API-backed Features

The platform is driven by a set of Next.js route handlers that connect the UI to Prisma, PostgreSQL, Gemini, Google Maps, Supabase-authenticated users, and QR generation.

### Core API Reference

| Route | Method | Purpose | Main Input | Main Output | Used By |
| --- | --- | --- | --- | --- | --- |
| `/api/reports` | `POST` | Submit a resident SOS report and run AI triage | Optional `userId`, `lat`, `lng`, `hazardType`, `description` | Saved incident report, reverse-geocoded address, AI triage payload, emergency-contact notification status | Home page SOS modal |
| `/api/reports` | `GET` | Load all incident reports for the admin queue | None | Incident report list ordered by newest first | Admin SOS dashboard |
| `/api/reports/[id]` | `GET` | Load one SOS report in detail | Report ID in route | One incident report with linked user info | Admin SOS detail page |
| `/api/reports/[id]` | `PATCH` | Update a report status | `status` | Updated incident report | Admin responder workflow support |
| `/api/alert` | `GET` | Load alert feed data | None | Formatted alert list with date/time/coords/status | Resident alerts page, home latest alerts, admin draft review |
| `/api/alert` | `POST` | Create a new alert record as an admin | `userId`, `regionCode`, `hazardType`, `severity`, `title`, `body`, `lat`, `lng`, optional `source` | Saved alert | Admin alert creation flow |
| `/api/alert/[id]/status` | `PATCH` | Change an alert between `draft` and `published` | `userId`, `status` | Updated alert with refreshed status metadata | Admin alert operations page |
| `/api/ai/draft-alert` | `POST` | Turn SOS incident details into a public-facing alert draft | `rawInput`, optional `location` | Generated alert draft with title, severity, hazard type, and body | Admin SOS detail deploy-alert flow |
| `/api/ai/quiz` | `POST` | Generate a simulation scenario | `hazardType`, optional `region` | Scenario, 3 options, correct answer index, explanation | AI Survival Simulator |
| `/api/ai/generate-plan` | `POST` | Generate and save a personalized checklist | `userId`, `hazardType`, `familySize`, `pets`, `specialNeeds` | Saved emergency plan with title and checklist JSON | Smart Emergency Checklists |
| `/api/cron/fetch-hazards` | `GET` | Pull live weather alerts into draft records | `Authorization` header with `CRON_SECRET` | Ingestion result message and new draft count | Scheduled alert ingestion |
| `/api/emergency-contact-consent` | `GET` | Load a consent request by token | `token` query param | Consent-request status and requester details | Public consent review page |
| `/api/emergency-contact-consent` | `POST` | Approve or decline a consent request | `token`, `action` | Updated consent status and save confirmation | Public consent review page |
| `/api/geocode` | `POST` | Convert a typed address into coordinates | `address` | Formatted address, `lat`, `lng` | Rescue-card editor |
| `/api/reverse-geocode` | `POST` | Convert map coordinates into a readable address | `lat`, `lng` | Formatted address, `lat`, `lng` | Rescue-card editor, SOS/report enrichment |
| `/api/rescue-card` | `GET` | Fetch a resident rescue card by email | `email` query param | Rescue-card record plus pending emergency-contact consent data | Home page, profile page, admin SOS detail |
| `/api/rescue-card` | `POST` | Create or update rescue-card data and QR code | `email`, medical/contact/home fields | Upserted rescue card, QR code data, shareable map URL, optional pending consent state | Resident profile page |
| `/api/user/[id]` | `GET` | Fetch a user profile with rescue-card relation | User ID in route | User record with role, region, rescue card, and pending consent info | Home, resident profile, admin profile, role-aware header |
| `/api/user/[id]` | `PATCH` | Update profile fields | `name`, `regionCode` | Updated user record with pending consent info | Resident profile, admin profile |

### What Each API Group Does

| API Group | What It Handles | Notes |
| --- | --- | --- |
| SOS and triage | Emergency submissions, incident storage, admin queue loading, and per-incident inspection | Includes Gemini-based triage, guest-reporter fallback, Google reverse geocoding, and emergency-contact notification attempts |
| Alerts | Alert feed retrieval, admin alert creation, alert status transitions, and scheduled live-weather ingestion | Alert responses are formatted for the resident UI with ready-to-render date, time, source, and status values |
| AI generation | Survival quiz generation, emergency checklist generation, and alert drafting | Gemini-backed endpoints return structured content that the frontend renders directly |
| Mapping and location | Address lookup and reverse geocoding | Used mainly inside the rescue-card workflow for reliable home-location capture |
| Identity and rescue data | User profile loading, rescue-card management, and emergency-contact approval | Returns role-aware data plus pending consent state so the UI can reflect approval status |

### Endpoint Details

| Endpoint | Detailed Behavior |
| --- | --- |
| `/api/reports` | On SOS submission, the backend validates required fields, reverse-geocodes the live GPS position into a readable address when Google Maps is configured, sends the resident's free-text description to Gemini for emergency triage, classifies severity and recommended response, optionally creates a guest reporter when no authenticated user is present, stores everything in `IncidentReport`, and attempts to notify an approved emergency-contact Gmail. The `GET` side powers the admin request queue. |
| `/api/reports/[id]` | Returns a single incident report with linked user data so responders can inspect a specific SOS case. The `PATCH` handler supports updating report status as the response workflow matures. |
| `/api/alert` | The `GET` handler returns alerts in a UI-friendly format with normalized date, time, coordinates, severity, hazard type, source, and status. The `POST` handler is admin-only and stores a new alert record for broadcast use. |
| `/api/alert/[id]/status` | Lets an authenticated admin move an alert between supported statuses, which powers publish/unpublish style operations in the admin alerts workspace. |
| `/api/ai/draft-alert` | Converts SOS incident text and optional location context into a structured, multilingual public alert draft so an admin can review and post it quickly from the SOS detail view. |
| `/api/ai/quiz` | Builds a single-turn emergency scenario tailored to the selected hazard and region. The response includes a realistic scenario, 3 choices, one correct answer, and a short safety explanation. |
| `/api/ai/generate-plan` | Creates a personalized emergency checklist based on hazard type, household size, pets, and special needs. The generated plan is saved into PostgreSQL immediately so it appears in checklist history without another save step. |
| `/api/cron/fetch-hazards` | Protected cron ingestion that pulls live weather alerts from WeatherAPI, deduplicates by title, and stores new third-party alerts as drafts for admin review. |
| `/api/emergency-contact-consent` | The `GET` handler loads a consent request by token and updates expired pending requests when needed. The `POST` handler lets the recipient approve or decline the request, which controls whether the requested Gmail is saved to the resident's rescue card. |
| `/api/geocode` | Accepts a typed address and resolves it into a canonical formatted address and coordinates using Google Maps Geocoding. This helps residents search for their home before fine-tuning the location on the map. |
| `/api/reverse-geocode` | Accepts map coordinates and resolves them back into a readable address. This keeps the rescue card synchronized when the resident adjusts their home pin manually. |
| `/api/rescue-card` | The `GET` handler fetches rescue-card data by email together with any active pending emergency-contact consent. The `POST` handler upserts the rescue card, reverse-geocodes the home location when coordinates are present, generates a QR code from the medical/contact payload, stores a shareable Google Maps URL, and triggers a new consent request when the emergency-contact Gmail changes. |
| `/api/user/[id]` | The `GET` handler returns the user profile together with the related rescue card and any active pending emergency-contact consent so the frontend can render role, region, and medical identity in one request. The `PATCH` handler updates editable profile fields like name and assigned region while preserving the same enriched response shape. |

### External Services Used By The APIs

| Service | Where It Is Used | Why It Matters |
| --- | --- | --- |
| Gemini | `/api/reports`, `/api/ai/quiz`, `/api/ai/generate-plan`, `/api/ai/draft-alert` | Adds AI triage, alert drafting, training scenarios, and personalized preparedness plans |
| Google Maps Geocoding API | `/api/geocode`, `/api/reverse-geocode`, `/api/reports`, `/api/rescue-card` | Turns coordinates into addresses and addresses into coordinates |
| WeatherAPI | `/api/cron/fetch-hazards` | Supplies live weather alerts that can be ingested as admin-review drafts |
| Prisma + PostgreSQL | Most route handlers | Stores users, alerts, rescue cards, incident reports, and emergency plans |
| QRCode library | `/api/rescue-card` | Generates a scannable emergency QR image for responders |

### How These APIs Support The Product Flow

| User Flow | API Support |
| --- | --- |
| Resident presses `SOS` | `/api/reports` captures GPS, geocodes location, runs AI triage, saves the incident, and can notify an approved emergency contact |
| Admin reviews active incidents | `/api/reports` and `/api/reports/[id]` provide queue and detail views |
| Resident updates profile and rescue card | `/api/user/[id]`, `/api/rescue-card`, `/api/emergency-contact-consent`, `/api/geocode`, and `/api/reverse-geocode` keep identity, approval state, and home-location data current |
| Resident practices preparedness | `/api/ai/quiz` and `/api/ai/generate-plan` create learning and planning content |
| Admin publishes warnings | `/api/ai/draft-alert`, `/api/alert`, `/api/alert/[id]/status`, and `/api/cron/fetch-hazards` move alerts from incident text or live feeds into the public alert system |

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- MUI
- Supabase Auth
- Prisma + PostgreSQL
- Google Maps APIs
- Gemini API
- QR code generation

## Main Routes

### Resident

- `/`
- `/page-login`
- `/page-resetPassword`
- `/page-alerts`
- `/page-resources`
- `/page-resources/page-resources-simulation`
- `/page-resources/page-resources-checklist`
- `/page-profile`
- `/emergency-contact-consent`

### Admin

- `/admin/page-sos`
- `/admin/page-sos/[uid]`
- `/admin/page-alerts`
- `/admin/page-profile`
