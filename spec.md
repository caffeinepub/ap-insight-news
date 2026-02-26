# Specification

## Summary
**Goal:** Fix the infinite loading state during app initialization and stabilize the actor setup and admin "Go Live" functionality.

**Planned changes:**
- Add a 15-second timeout to `ActorLoadingGuard` so it transitions to an error/retry state instead of spinning indefinitely
- Display a user-readable error message and a "Retry" button when actor initialization fails or times out
- Audit and fix the actor initialization flow so anonymous and authenticated actor instances are created without silent failures
- Ensure actor creation errors are caught and surfaced to the user rather than causing a silent hang
- Fix the "Go Live" / "End Live" admin button in `Header.tsx` to be visible and functional for authenticated admin users
- Ensure the toggle correctly calls the backend `toggleLiveStatus` function and updates the button label to reflect the current live state

**User-visible outcome:** The app no longer hangs on a loading spinner indefinitely. If initialization fails, users see an error message with a retry option. Admin users can see and use the "Go Live"/"End Live" button, which correctly reflects and updates the broadcast state.
