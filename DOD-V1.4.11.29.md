# Definition of Done — v1.4.11.29

## Functional acceptance

- [x] Start from v1.4.11.22 stable source.
- [x] Food item tap opens Food metadata/details, not the logging modal.
- [x] Recipe item tap opens Recipe metadata/details.
- [x] Food and Recipe use the same Promote to Meal form.
- [x] Promotion form contains editable Meal name and Meal category.
- [x] Meal category defaults explicitly to Any.
- [x] No field auto-focuses when promotion opens.
- [x] Promotion creates a categorized Meal definition linked to the source.
- [x] Promotion does not log, consume, plan, or decrement Pantry.
- [x] Food details contain Consumption Role metadata.
- [x] Food/Recipe metadata screens do not contain Consume now or Plan for later.

## Release integrity

- [x] Application version, build, deployment, created timestamp, and schema metadata updated.
- [x] Release verification passes.
- [x] JSX parser check passes.
- [x] Focused acceptance tests pass.
- [ ] `npm clean-install` passes — blocked by package gateway HTTP 503.
- [ ] `npm run build` passes — not runnable without completed dependency install.
- [ ] Built-bundle browser smoke test passes.

## Deployment decision

Not deployment-certified until the three unchecked gates pass.
