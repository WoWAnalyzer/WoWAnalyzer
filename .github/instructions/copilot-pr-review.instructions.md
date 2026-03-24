---
applyTo: '**'
---

# Copilot PR Review

## Spell ID length

- **1–9 digit** spell IDs are valid, even though most are 6 or fewer.
- Do not flag a spell ID as "invalid/suspicious" purely due to digit length (treat **1–9 digit** integers in spell contexts as normal).
- Only comment when there's clear evidence beyond length (e.g., name/constant mismatch, wrong identifier type/field, non-integer/truncated value).
