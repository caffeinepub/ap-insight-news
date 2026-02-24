# Specification

## Summary
**Goal:** Fix the "Backend connection not ready. Please wait and try again." error by ensuring the backend actor is fully initialized before any queries or mutations are attempted.

**Planned changes:**
- Add a loading/retry state at the app level or via a wrapper so dependent components wait for a valid actor before executing backend calls.
- Update `useQueries.ts` hooks to guard against undefined or null actor instances, returning a stable loading or idle state when the actor is not yet available.
- Show a loading indicator in components that depend on the backend actor while it is initializing.
- Show a user-friendly error state with a retry option if actor initialization genuinely fails.

**User-visible outcome:** The app no longer shows the backend connection error on page load; components display a loading state while connecting, and queries execute automatically once the actor is ready without requiring a manual page refresh.
