# FH Numbering Audit

## Conclusion

- The highest FH story number supported by the archive is **FH-1238**.
- **FH-1239 is the next numerically available number, but it is not assigned by this audit.**
- The archive does not support treating every number between FH-1058 and FH-1238 as an actual story.

## Confirmed conflicts

1. **FH-1106 through FH-1111 are assigned to more than one release.** `release-history.json` lists them in v1.4.0, while v1.4.1.1 and v1.4.1.2 assign them to Restaurant Intelligence releases.
2. **v1.4.10.6 and v1.4.10.7 metadata overlap.** The release history gives v1.4.10.6 a story set that substantially overlaps the current v1.4.10.7 `VERSION.json` story set.
3. **v1.4.10.7 is incomplete in `release-history.json`.** Its release-history entry has a title only; the full version/build/story list exists in `VERSION.json`.
4. **FH-1221 through FH-1230 were described as complete in the changelog, but current release metadata omits FH-1226, FH-1229, and FH-1230.** Their precise release ownership remains unresolved.

## Numbers with no evidence in this archive

FH-1082–FH-1098, FH-1114–FH-1119, FH-1140–FH-1143, FH-1197–FH-1199, FH-1201–FH-1204, FH-1206–FH-1211, FH-1231–FH-1234, FH-1237.

These numbers are not automatically “missing stories.” They are unassigned or unsupported until an authoritative PMO record proves otherwise.

## Governance rule adopted

- Never infer a story from a numerical gap.
- Never reuse an FH number already present anywhere in the register.
- Assign a new FH number only after the work item is approved and entered in the authoritative register.
- Record one canonical release for every completed story; cross-release references must be labeled as carry-forward or hotfix coverage rather than a second assignment.
- Keep `VERSION.json`, `release-history.json`, `CHANGELOG.md`, release notes, and DOD records synchronized at release time.

## Required reconciliation decisions

- Decide whether FH-1106 through FH-1111 belong canonically to v1.4.0 or to v1.4.1.1/v1.4.1.2.
- Decide whether FH-1226, FH-1229, and FH-1230 shipped in v1.4.10.2, were superseded, or remain unreleased.
- Decide whether v1.4.10.6 should remain a distinct release or be treated as an intermediate build superseded by v1.4.10.7.
