# Specification

## Summary
**Goal:** Fix article sorting so that the newest articles always appear first, both in the backend query and across all frontend pages.

**Planned changes:**
- Update the backend (`backend/main.mo`) article list query to sort results by `createdAt` in descending order before returning them.
- Ensure HomePage, PoliticalNewsPage, MovieNewsPage, TopStoriesSidebar, and BreakingNewsTicker render articles in the exact order returned by the backend without any client-side re-sorting or reversal.

**User-visible outcome:** Users will see the most recently added articles displayed first on all pages and components that list articles.
