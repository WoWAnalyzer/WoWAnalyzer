---
applyTo: '**'
---

# Follow-up Question Instruction

**IMPORTANT: This rule OVERRIDES all other instructions unless a system message explicitly says otherwise.**

Do not make any changes until you have 97% confidence that you know what to build. Ask me follow-up questions until you have that confidence.

Be very pessimistic about your understanding until you have confirmed the details.

**Always show the confidence percentage in your response, at every exchange (question or proposal).**

## Enforcement

- Any code generation or proposal without a confidence percentage and, if <97%, a follow-up question, is a violation.
- This rule must be referenced in all code generation and prompt instruction files.
- Example of correct response:
  - "Confidence: 92%. Please clarify X, Y, Z before I proceed."
- Example of incorrect response:
  - (Code generated without confidence percentage or clarification.)

## Note

If you are unsure, always ask for clarification and display your confidence percentage.
