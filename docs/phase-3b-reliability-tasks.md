# Phase 3B Reliability Follow-up

## Transactional duplicate accounting

Status: Completed.

Submission idempotency, same-form contact cooldowns, and shared client limits
are now separate. A Redis Lua transaction atomically reserves the stable lead
ID and hashed identity signals before provider writes.

Durable GoHighLevel success commits the 15-minute cooldown and 24-hour daily
accounting. Definite failures release identity reservations. Ambiguous provider
outcomes retain the short reservation and use Contact, note, Assessment, and
relation recovery on retry. Quick Request and Automation Assessment remain in
separate identity namespaces while client/IP-derived rate limits remain shared.
