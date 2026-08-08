# Fizz Health v1.4.17.32 — Audible-Only Fulfillment & 25-Cover Batches

## Scope

This release is tightly scoped to Audible exchange fulfillment reliability. It does not redesign Audible library screens, playback, podcasts, workouts, nutrition, or unrelated functionality.

## Changes

- Reduced cover-art-only targeted enrichment from 50 records to a hard maximum of 25 records per request.
- Updated every generated Audible exchange request so Audible.com is the authoritative and only catalog website for lookup, identity verification, enrichment, metadata verification, and artwork retrieval.
- Explicitly prohibits podcast directories, podcast websites, blogs, review sites, general web results, Google Books, Apple Books, Goodreads, publisher catalogs, retailer catalogs, and other third-party catalog sources during Audible fulfillment.
- When an `audible_product_url` is supplied, fulfillment must open that exact Audible URL first and verify the supplied Audible ASIN.
- Failed Audible lookups must remain unknown/null rather than widening into an unrestricted Internet search.
- Amazon-hosted media assets are allowed only when they are exposed by or directly associated with the exact matched Audible product page; separate Amazon catalog searches are prohibited.
- Cover-art requests now instruct ChatGPT to inspect the exact Audible page's displayed cover plus `og:image`, structured/JSON-LD image data, and product image/srcset metadata when available.
- Cover-art source evidence must state the exact Audible product URL checked and whether the image came from the Audible page or an image asset exposed by that page.
- Existing Base64 UTF-8 + SHA-256 transport, stateless universal import, patch semantics, ASIN matching, duplicate prevention, and transaction safety remain unchanged.

## Versioning

- App version: 1.4.17.32
- Build: 141732
- Database schema: 147 (unchanged)
- Completed stories: FH-17132.1–FH-17132.4
