# Fizz Health v1.4.17.29 — Audible iPhone Clipboard JSON Reliability

Focused Audible enrichment clipboard reliability release. Structural smart quotes introduced by iPhone clipboard round-trips are normalized only when they act as JSON syntax, legitimate typographic punctuation inside audiobook metadata is preserved, strict parsing remains mandatory after normalization, and malformed or truncated 10-record enrichment batches remain blocked before any database write.

Completed story range: **FH-17129.1-FH-17129.4**
