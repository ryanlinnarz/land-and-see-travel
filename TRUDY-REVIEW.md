# Trudy Travels — first-pass review

## Scope

Based on GitHub main at 44ef065e3e946daff1062140d2c31a3c5ab99e7f. This draft is for review, not approval to merge or publish to the production site. Ryan subsequently authorized a protected Cloudflare preview and reported enabling its Access policy. Verify that protection on the actual preview before treating it as private.

## Files

- `index.html`: one text link beneath the Travel Tips introduction. No promotional image or large button. The four existing tips remain unchanged.
- `Trudy-Travels.html`: book page with existing header/footer, cover slot, three real sample-page slots, activities/audience, factual placeholders, and two disabled Amazon buttons.
- `trudy-travels.css`: page-specific responsive styles, using existing site colors and fonts. Shared styles are unchanged.
- `TRUDY-REVIEW.md`: scope, content checklist, and future placement plan.

## Content needed before production

1. Verify exact Amazon listing and published title/subtitle, creator credit, edition, format, page count, dimensions, age guidance, publication date, and ISBN/ASIN.
2. Supply the official cover and two or three approved actual interior pages. Replace the labeled slots with images, meaningful alternative text, and factual captions. Do not invent sample artwork.
3. Compare all copy with the final book. Coloring is supported by Ryan's description; specific stories and lessons remain unverified. Current learning bullets are suggested shared activities, not promises about specific contents or outcomes.
4. Replace both disabled purchase buttons with links to the same verified Amazon listing. Do not guess a listing or price.
5. Remove review notes and the page's noindex directive only when content is complete and production publication is explicitly approved.

## Placement now and later

Now: a modest sentence in Travel Tips links directly to Trudy. Gear stays editorial. No new main-navigation item or empty Shop page.

When a second product category is ready: add a Land & See Shop landing page with Trudy and the actual second category, plus a Shop navigation link. Keep Trudy's existing URL to preserve links. Add resources only when real products exist.

A separate broader store can have its own brand and unrelated products. Land & See's future Shop can link directly to that store's Land & See collection; that collection can link back to the travel site. Choose products, store platform, costs, and brand before building it. No Etsy/direct-sales promise or specific Book 2 is included here.

## Review workflow

Review local changes, save a commit on the review branch, push that branch, and create a draft pull request. A push can create the now-authorized Cloudflare preview. Confirm signed-out access is blocked and review desktop/mobile layouts, menu, links, and disabled CTAs. Merge to main remains a separate user decision because main deploys automatically. No domain or production settings changes are part of this work.

## Artwork and content update

Added the supplied official cover, two supplied coloring pages, and “Where Is Bunny Hiding?” extracted from PDF page 16. Website images are optimized WebP copies; original files are unchanged. The complete interior PDF is not included in the website.

The PDF confirms R.C. Linnarz, editor E.M. Linnarz, 24 interior pages, and 8.5 × 11 inch page size. These describe the source interior, not independently verified Amazon manufacturing details. Copy now names actual activities found in the book. Both purchase buttons use Ryan’s supplied Amazon Mexico URL, explicitly labeled for that marketplace. Amazon blocked automated listing inspection; binding, age guidance, publication date, and published page count still require confirmation. Do not infer publication date from copyright year. These edits remain local for Ryan to commit and push using GitHub Desktop.

## Supplied Amazon details confirmed by Ryan

Paperback, Book 1 of Trudy Travels, reading age 3–9, 24 pages, English, dimensions 8.5 × 0.06 × 11 inches. Description confirms 10 coloring pages, 10 activities, a certificate, and notes/doodles space. Applied these details. Publication date was not supplied; omitted that optional row rather than guessing. Amazon lists both R.C. Linnarz and E.M. Linnarz as authors, while the interior credits E.M. as editor; the page labels Amazon author credits separately and retains the interior credit in the introduction. Existing Amazon Mexico product link is retained; supplied series links are not substituted for the product purchase link.

## US purchase link and subtitle

Ryan supplied the Amazon US product listing for the same ASIN and confirmed the subtitle as A Day at the Beach. Both purchase links now use https://www.amazon.com/dp/B0HL7F1RQM with search tracking removed. This supersedes the earlier Mexico-link notes.
