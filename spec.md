# Specification

## Summary
**Goal:** Fix the "Unable to connect to backend" error so the frontend can successfully connect to the Motoko backend on page load.

**Planned changes:**
- Diagnose and fix the backend actor initialization so it connects correctly on page load
- Ensure canister ID environment variables are properly wired for the frontend to reach the backend
- Verify the `ActorLoadingGuard` component transitions from loading to ready state without errors

**User-visible outcome:** The app loads without displaying the "Unable to connect to backend" error, and backend data (e.g., news articles) loads successfully on the home page.
