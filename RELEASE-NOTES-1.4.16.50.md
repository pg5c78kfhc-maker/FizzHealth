# Fizz Health v1.4.16.50 — Playlist Consistency & Interaction Reliability

## Implemented

- Repaired the podcast-detail **Show Played Episodes (N)** disclosure so played cards render directly beneath the expanded control and collapse reliably.
- Replaced the episode-card swipe-right interaction with one shared deliberate gesture implementation featuring finger-following feedback, release threshold validation, diagonal/vertical cancellation, reverse-movement cancellation, snap-back, and lifecycle reset.
- Added a live Shuffle remaining-time value to the Shuffle section header. It subtracts current playback position and refreshes from the current Shuffle projection after playback and queue changes.
- Corrected standard playlist projection so each podcast's stable `oldest_first` preference determines its internal episode sequence before Master Order and Variety are applied.
- Added diagnostics for disclosure toggles, gesture release/cancellation, live progress, and podcast sequence resolution.

## Scope boundaries

No unrelated application features were added or changed.

## Corrective packaging update

A production syntax defect reported by Cloudflare Pages was repaired after the initial package was delivered. The shared episode card's `onKeyDown` JSX expression was missing one closing brace before the `onTouchStart` attribute. The corrected source passes a complete JSX parser validation with zero diagnostics. No feature behavior or release scope changed.
