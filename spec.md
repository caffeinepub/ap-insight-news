# Specification

## Summary
**Goal:** Automate news ingestion from Eenadu, Sakshi, and Andhra Jyothy by extending the backend fetch logic and updating the Admin dashboard to trigger and display results for each source.

**Planned changes:**
- Extend the backend `autoFetchNews` function to fetch and parse articles from eenadu.net, sakshi.com, and andhrajyothy.com via their RSS feed endpoints
- Extract title, summary, URL, category, author, and publication date for each article and store as News records, deduplicating by URL
- Ensure a fetch failure from one source does not block ingestion from the other sources
- Update AdminPage.tsx to show controls for triggering fetch from all three sources (individually or collectively) with per-source status, article count, loading states, and error messages
- Add React Query hooks in useQueries.ts for the multi-source fetch, with cache invalidation of the news article list on success

**User-visible outcome:** Admins can trigger news ingestion from Eenadu, Sakshi, and Andhra Jyothy directly from the Admin dashboard, see how many articles were added per source, and have the news list automatically reflect newly ingested articles.
