# Testing

> [!NOTE]
> Return back to the [README.md](README.md) file.

---

## Code Validation

### HTML

I have used the recommended [HTML W3C Validator](https://validator.w3.org) to validate all of my HTML files using the deployed URLs.

| File       | URL                                                                              | Screenshot                                                          | Notes           |
| ---------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------- |
| index.html | https://validator.w3.org/nu/?doc=https://raigonlab.github.io/raigon-mmxi/index.html | ![index validation](documentation/testing/index-html-validation.png) | No major errors |
| 404.html   | https://validator.w3.org/nu/?doc=https://raigonlab.github.io/raigon-mmxi/404.html   | ![404 validation](documentation/testing/404-html-validation.png)     | No major errors |

---

### CSS

I have used the recommended [CSS Jigsaw Validator](https://jigsaw.w3.org/css-validator/) to validate my CSS file.

| File      | URL                                            | Screenshot                                               | Notes            |
| --------- | ----------------------------------------------- | ---------------------------------------------------------- | ----------------- |
| style.css | https://jigsaw.w3.org/css-validator/validator | ![css validation](documentation/testing/css-validation.png) | No major errors |

---

### JavaScript

I have used [JSHint](https://jshint.com) to validate `script.js`.

| File      | Screenshot                                              | Notes            |
| --------- | --------------------------------------------------------- | ----------------- |
| script.js | ![js validation](documentation/testing/js-validation.png) | No major errors  |

---

## Responsiveness

The project was tested across multiple screen sizes using browser developer tools and real device testing.

| Section          | Mobile                                                              | Tablet                                                              | Desktop                                                               | Notes                                          |
| ---------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------- |
| Home (gallery)    | ![mobile](documentation/responsiveness/mobile-home.jpeg)             | ![tablet](documentation/responsiveness/tablet-home.jpeg)             | ![desktop](documentation/responsiveness/desktop-home.jpeg)              | Parallax gallery and depth-of-field scale correctly |
| Artwork Modal     | ![mobile](documentation/responsiveness/mobile-modal.jpeg)            | ![tablet](documentation/responsiveness/tablet-modal.jpeg)            | ![desktop](documentation/responsiveness/desktop-modal.jpeg)             | Info/inquire panels align with artwork on tablet |
| Vault             | ![mobile](documentation/responsiveness/mobile-vault.jpeg)            | ![tablet](documentation/responsiveness/tablet-vault.jpeg)            | ![desktop](documentation/responsiveness/desktop-vault.jpeg)             | Collection cards stack/center correctly        |
| Accord access gate | ![mobile](documentation/responsiveness/mobile-access-gate.jpeg)      | ![tablet](documentation/responsiveness/tablet-access-gate.jpeg)      | ![desktop](documentation/responsiveness/desktop-access-gate.jpeg)       | Input no longer triggers iOS zoom              |
| Arquive           | ![mobile](documentation/responsiveness/mobile-arquive.png)          | ![tablet](documentation/responsiveness/tablet-arquive.png)          | ![desktop](documentation/responsiveness/desktop-arquive.png)           | Events list and contact form remain usable     |
| 404               | ![mobile](documentation/responsiveness/mobile-404.png)              | ![tablet](documentation/responsiveness/tablet-404.png)              | ![desktop](documentation/responsiveness/desktop-404.png)               | Frame illustration fits viewport               |

---

## Browser Compatibility

The project was tested across major browsers.

| Section       | Chrome                                                       | Firefox                                                        | Safari                                                       | Notes            |
| ------------- | --------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------- | ----------------- |
| Home (gallery) | ![chrome](documentation/browsers/chrome-home.png)            | ![firefox](documentation/browsers/firefox-home.png)            | ![safari](documentation/browsers/safari-home.png)            | Works correctly |
| Artwork Modal  | ![chrome](documentation/browsers/chrome-modal.png)           | ![firefox](documentation/browsers/firefox-modal.png)           | ![safari](documentation/browsers/safari-modal.png)           | Works correctly |
| Vault          | ![chrome](documentation/browsers/chrome-vault.png)           | ![firefox](documentation/browsers/firefox-vault.png)           | ![safari](documentation/browsers/safari-vault.png)           | No issues        |
| Arquive        | ![chrome](documentation/browsers/chrome-arquive.png)         | ![firefox](documentation/browsers/firefox-arquive.png)         | ![safari](documentation/browsers/safari-arquive.png)         | Form works       |
| 404            | ![chrome](documentation/browsers/chrome-404.png)             | ![firefox](documentation/browsers/firefox-404.png)             | ![safari](documentation/browsers/safari-404.png)             | Works correctly |

---

## Lighthouse Audit

Lighthouse audits were performed on both pages.

| Page       | Mobile                                                        | Desktop                                                         |
| ---------- | ---------------------------------------------------------------- | -------------------------------------------------------------------- |
| index.html | ![mobile](documentation/lighthouse/mobile-home.png)            | ![desktop](documentation/lighthouse/desktop-home.png)            |
| 404.html   | ![mobile](documentation/lighthouse/mobile-404.png)             | ![desktop](documentation/lighthouse/desktop-404.png)             |

---

## Defensive Programming

Manual testing was conducted to ensure correct user interactions and validation across the site.

| Feature                 | Expectation                                       | Test                                          | Result                                  |
| ------------------------ | --------------------------------------------------- | ----------------------------------------------- | ------------------------------------------ |
| Contact form (Arquive)    | Form should not submit with empty required fields  | Submitted with empty Name/Email/Message       | Blocked, inline field errors shown      |
| Contact form (Arquive)    | Email must be valid                                 | Entered an invalid email address              | Validation error triggered              |
| Contact form (Arquive)    | Valid submission confirms success                   | Filled all fields correctly and submitted     | Success overlay displayed               |
| Inquire form (Artwork Modal) | Form should not submit with empty required fields | Submitted with empty fields                   | Blocked, inline field errors shown      |
| Inquire form (Artwork Modal) | Valid submission confirms success                | Filled all fields correctly and submitted     | Success state shown inside modal        |
| Accord access gate        | Incorrect code is rejected                          | Entered an invalid access code                | Error message shown, gate stays closed  |
| Accord access gate        | Correct code unlocks the collection                 | Entered the valid access code                 | Two-step success flow, collection unlocked |
| Hash routing              | Back/forward buttons work without reload            | Navigated Home → Vault → Arquive, used browser back | URL hash and active section update correctly |
| Artwork modal              | Keyboard navigation works                           | Pressed arrow keys and Escape                 | Navigates between artworks / closes modal |
| Artwork modal (mobile)     | Swipe navigation works                              | Swiped left/right inside the modal            | Navigates to next/previous artwork      |
| Async event loading        | Loading and error states are handled               | Tested with `data/events.json` unavailable    | Loading indicator, then error state shown |
| 404                        | Invalid URL shows the custom error page             | Visited a non-existent path                   | 404 page displayed with correct styling |
| 404                        | "Return home" link works                            | Clicked "Return home"                         | Redirects to `index.html`               |

---

## User Story Testing

| Target               | Expectation                                                          | Result    |
| --------------------- | ------------------------------------------------------------------- | --------- |
| As an art collector   | Browse artwork in a visually immersive gallery                       | Achieved  |
| As a visitor          | View an artwork in full detail (title, series, year, description)    | Achieved  |
| As a visitor          | Navigate between artworks without closing the viewer                 | Achieved  |
| As an art collector   | Inquire about acquiring a piece through direct contact                | Achieved  |
| As a creative / peer artist | Understand the artist's visual language                        | Achieved  |
| As a creative / peer artist | Explore curated collections by theme                             | Achieved  |
| As a site visitor     | Find contact information easily                                       | Achieved  |
| As a site visitor     | Use the site on any device                                            | Achieved  |
| As a site visitor     | Receive feedback when actions produce a result                       | Achieved  |
| As a site visitor     | See a 404 page when something goes wrong                              | Achieved  |

---

## Bugs

### Fixed Bugs

* **iOS Safari auto-zoom on form inputs** — inputs and textareas under 16px font-size triggered a page-wide zoom on focus that persisted across navigation. Fixed by bumping `.modal-inquire-input`, `.modal-inquire-textarea`, `.cf-input`, and `.access-gate-input` to 16px on mobile, with the access-gate placeholder shrunk separately to avoid overflow.

* **404 page rendered with a white background** — `404.html` was missing the `.site-bg` layer used on `index.html` to apply the site's dark background. Added the missing element so the 404 page matches the rest of the site.

* **404 frame illustration overflowed on mobile** — the row of three picture frames plus the plant illustration was wider than the mobile viewport, clipping the leftmost frame. Fixed by scaling down the frames, plant, and gaps inside the existing mobile breakpoint.

* **Artwork modal text panel not aligned with image on tablet** — on iPad, the info/inquire text panels stretched edge-to-edge while the artwork image was inset, making the layout feel unbalanced. Fixed by constraining `.modal-info-panel` and `.modal-inquire-panel` to the same width as the image on mobile breakpoints.

* **Depth-of-field blur too strong** — the gallery's "Foco dinâmico" blur effect was too pronounced on desktop and tablet. Made `FOCUS_BLUR` responsive: reduced by 25% on desktop, and reduced to roughly a quarter of that on tablet/mobile (≤768px).

---

### Unfixed Bugs

There are no known unfixed bugs at the time of submission.

---

### Known Issues

| Issue                                    | Notes                                                            |
| ------------------------------------------ | -------------------------------------------------------------- |
| Minor Lighthouse performance variations    | Due to artwork image sizes and the continuous gallery animation |
| Custom scrollbar styling falls back on Safari | Thin custom scrollbar is a WebKit/Blink feature; Safari uses its default |

---

> [!IMPORTANT]
> No critical issues remain after testing.
