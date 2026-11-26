# CI timing failure investigation

2026-11-26: Release run 45814286985 failed in supplier-api-auth.test.ts.
The flood case called awaitFreshRateLimitWindow with a ten-second boundary
margin while Vitest allowed five seconds for the whole test. The wait alone
could exhaust the timeout. The following case then expected quota counts
created by the previous case, so it failed as a consequence.

The suite now fixes Date.now for signature timestamps and limit buckets,
keeps real timers and Miniflare I/O, and clears quota/replay state before each
case. Successful-auth assertions count only that case's own requests.
Miniflare setup and the 60-request flood case have explicit 30-second budgets
for real runtime startup, cryptography and serial database I/O. Other cases keep
the default timeout; no request counts or security assertions are removed.
No production rate-limit settings or authentication logic are changed.

Follow-up Release run 45820093868 passed supplier authentication but exposed
another wall-clock boundary dependency in auth-email-flow.test.ts. Four email
change requests could span two minute buckets, yielding four successful
responses rather than the expected fourth-request 429. That one case now
fixes Date.now before creating the auth factory (whose storage captures the
clock function), and restores it after the case. The 429 assertion is unchanged.

Test-only changes do not redeploy unchanged production code. The Release
quality gate still runs the complete suite for these changes.

Deploy run 45814286947 uploaded and deployed the Worker successfully. Its
post-deploy browser test read the old heading before React finished the route
transition. Policy browser QA now waits for the target heading and startup
overlay dismissal. Follow-up run 45816761759 passed all browser variants.

Historical failed runs retain their original results. New runs establish the
status of the corrected workflows; rerunning an old run uses its old source.
