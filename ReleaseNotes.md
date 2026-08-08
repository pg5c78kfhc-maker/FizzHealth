# Fizz Health v1.4.17.32 — Audible-Only Fulfillment & 25-Cover Batches

Completed story: FH-17132.1-FH-17132.4

- All generated Audible exchange requests now explicitly require Audible.com as the authoritative and only catalog fulfillment website.
- Requests explicitly prohibit podcast directories, podcast sites, blogs, general web results, third-party book catalogs, and unrelated retailer/catalog searches.
- Cover-only fulfillment must open the supplied exact Audible product URL, verify the ASIN, and retrieve artwork from that Audible page or a directly associated image asset. Amazon-hosted media assets are acceptable only when exposed by the exact matched Audible page.
- Failed Audible lookups remain null rather than triggering a broader Internet hunt or guessed artwork.
- Cover-art-only targeted enrichment is reduced from 50 to a hard maximum of 25 records per request.
- The existing Base64 UTF-8 + SHA-256 transport, stateless importer, patch semantics, duplicate prevention, and schema 147 remain unchanged.

# Fizz Health v1.4.17.31 — Audible Universal Exchange & Targeted Enrichment

Completed story: FH-17131.1-FH-17131.5

- One universal Audible response importer now recognizes self-contained encoded responses regardless of which request is currently selected or whether the app has restarted.
- Add-new, full enrichment, and targeted enrichment requests all require the proven Base64 UTF-8 + SHA-256 clipboard-safe response transport.
- Existing records resolve deterministically by Fizz record ID and Audible ASIN; conflicting identities are rejected before writes.
- Targeted enrichment uses field-level patch semantics. Omitted and null target values do not clear existing metadata.
- Cover-art-only enrichment is the first targeted operation and supports up to 50 missing-cover records per request while touching only cover artwork.
- Existing schema 147 and transaction rollback protections remain unchanged.

# Fizz Health v1.4.17.30 — Audible Enrichment Clipboard-Safe Transport

Focused Audible enrichment clipboard transport release. Existing-audiobook enrichment responses now use a quote-free Base64 UTF-8 envelope with SHA-256 verification before strict JSON parsing, while the 10-record batch, exact ASIN/order reconciliation, duplicate prevention, and transactional import protections remain unchanged. Add-new and unrelated Audio behavior are unchanged.

Completed story range: **FH-17130.1-FH-17130.4**
