# Specification

## Summary
**Goal:** Replace the image file upload input in the AdminPage article form with a URL text input field.

**Planned changes:**
- Remove the file picker (`<input type="file">`) from the AdminPage article form
- Add a text input labeled "Image URL" that accepts an HTTP/HTTPS URL string
- Update the backend to store and return the image field as a plain URL string instead of base64 or binary
- Ensure existing article image rendering components (ArticleCard, ArticleDetailPage, etc.) continue to display images using the URL field

**User-visible outcome:** Admins can now provide an image URL when creating or editing articles instead of uploading a file, and article images are displayed using the provided URL throughout the site.
