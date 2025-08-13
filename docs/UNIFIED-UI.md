# Unified UI: Quick Actions, ZIA Widget, and Feature Flags

This document explains how to use the unified v2 quick actions, the ZIA Chat Widget, toast notifications, and the new reusable action patterns.

## Components

- `components/UnifiedActionButton.tsx`
  - Reusable primary/secondary button with built-in loading state.
- `components/client/ClientQuickActionsUnified.tsx`
  - Minimal example wired to v2 quick actions via `runQuickAction()`.
- `components/client/ClientQuickActions.tsx`
  - Existing quick actions updated to prefer v2 quick actions with safe fallbacks.
- `components/client/client-quick-actions.tsx`
  - Larger quick actions UI updated to prefer v2 quick actions with safe fallbacks.
- `components/ZiaChatWidget.tsx` and `components/ZiaChatMount.tsx`
  - Feature-flagged ZIA chat widget with optional voice and bedside mode.
- `components/ui/toaster.tsx` and `hooks/use-toast.ts`
  - Global toast notifications.

## API Client Helpers

- `lib/actions.ts`
  - `runQuickAction({ action, params })` → POST `/api/v2/shared/quick-actions`
  - `ziaChat(message, userId?)` → POST `/api/v2/shared/zia/chat`
  - `mapPhraseToAction(input)` → Quick mappings from natural phrases → quick actions.

## Feature Flags (.env.local)

- `NEXT_PUBLIC_ENABLE_ZIA_WIDGET=true`
  - Mounts ZIA widget globally (via `app/layout.tsx`).
- `NEXT_PUBLIC_ZIA_VOICE_ENABLED=false`
  - Enables voice input inside ZIA widget when true.
- `NEXT_PUBLIC_ZIA_BEDSIDE_MODE=false`
  - Enables “bedside mode” UI for widget when true.

Restart dev server after modifying NEXT_PUBLIC flags.

## Testing

- Unified actions sandbox page:
  - `http://localhost:5369/sandbox/unified-actions`
  - Renders `ClientQuickActionsUnified` for zero-regression testing.
- Existing components:
  - Try Schedule Appointment, Message Care Team, Start Video Call.
  - You should see toast notifications and new tabs for URLs when provided.
- ZIA widget:
  - Appears bottom-right on all pages when enabled.
  - Try phrases like:
    - "update my status to available"
    - "set me as off-duty"
    - "remind me to call Sarah tomorrow"
    - "what's my next appointment"

## Implementation Notes

- v2-first, fallback-safe: Components call v2 (`runQuickAction`) first, fallback to existing v1/legacy endpoints to avoid regressions.
- Toasts: Success/error messages use `hooks/use-toast.ts` and are mounted app-wide via `<Toaster />` in `app/layout.tsx`.
- URLs: When APIs return `meetingUrl`, `roomUrl`, or `bookingUrl`, new tabs open automatically.

## Where to Extend

- Add new quick actions: extend `lib/actions.ts` phrase mapping and back-end v2 wrappers.
- Replace more legacy buttons: drop in `UnifiedActionButton` and route onClick to `runQuickAction()`.
- Voice phrases: add regexes to `ActionPhrases` in `lib/actions.ts`.

## Rollout Guidance

- Keep v1 routes intact until v2 parity confirmed.
- Use feature flags to gradually enable ZIA voice and bedside mode.
- Add audit logging on server-side routes as required for HIPAA compliance.
