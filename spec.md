# Specification

## Summary
**Goal:** Fix the article submission flow on the Admin page so admins can successfully create and publish new articles.

**Planned changes:**
- Investigate and fix the article submission form on the Admin page so it correctly sends all article data (title, content, category, image, author, etc.) to the backend
- Fix the backend `addArticle` function (or equivalent) to properly accept and store submitted article data
- Ensure the newly created article appears in the article list after successful submission
- Surface any form validation errors clearly to the user
- Eliminate any console errors or unhandled promise rejections during submission

**User-visible outcome:** Admins can fill out and submit the article form on the Admin page without errors, and the new article immediately appears in the article list.
