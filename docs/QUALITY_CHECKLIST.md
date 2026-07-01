# Quality Checklist

## Before Editing

- Inspect the actual repository state.
- Confirm current scripts, routes, data models, and folder boundaries.
- Do not assume current behavior from prior reports.
- Identify related files before changing shared behavior.
- Keep the implementation plan focused on the request.

## During Implementation

- Keep diffs small and reviewable.
- Avoid drive-by refactors.
- Preserve working behavior unless the request requires changing it.
- Update documentation when architecture, setup, security, or operations change.
- Update or add tests when behavior changes and a test framework is available.
- Avoid unrelated dependency changes.

## Before Finishing

- Run relevant verification commands.
- Confirm known routes and API endpoints still work when touched.
- Report exact commands run and results.
- Report known limitations and deferred production work.
- Do not claim production readiness unless live credentials, production security, legal review, and deployment checks are complete.
