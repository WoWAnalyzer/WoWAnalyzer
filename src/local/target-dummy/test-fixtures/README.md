# Target-dummy test fixtures

These compact fixtures are checked in for default unit tests. They are intentionally small enough to
review line by line and have no runtime dependency on another checkout.

## Provenance and review

The four fixtures were reviewed against revision
`548efa38a6799c583b47cc60e07f071b0e82ab7a` of the sibling
`WoW-Target-Dummy-Log-Transformer` repository. Their source paths are the same paths below, rooted at
that repository's `tests/fixtures/` directory.

| Fixture                              | Provenance                                                                     | Purpose and sanitization                                                                                                                                                                                                                                                                            |
| ------------------------------------ | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `derived/current-retail-samples.log` | Derived from the sibling repository's reviewed Retail 12.1.0 captures.         | Preserves timestamp precision, quoted CSV, `nil`, Unicode, advanced actor fields, a summon edge, and an unsupported event shape. All player names, player GUIDs, and creature instance/realm identifiers were replaced; spell, NPC, map, flag, position, resource, and amount fields were retained. |
| `derived/encounter-envelope.log`     | Shape-preserving reduction of the sibling repository's real encounter capture. | Preserves a complete usable encounter envelope and a structurally representative reduced `COMBATANT_INFO`; the player GUID was replaced.                                                                                                                                                            |
| `synthetic/external-effect.log`      | Invented by the sibling project.                                               | Isolates selected-player damage plus another player's external aura. It contains no real identities.                                                                                                                                                                                                |
| `synthetic/missing-ownership.log`    | Invented by the sibling project.                                               | Distinguishes an explicitly summoned entity from a same-named creature with no ownership evidence. It contains no real identities.                                                                                                                                                                  |

The derived fixtures are evidence for current wire shapes, not complete captures or golden discovery
results. Synthetic fixtures must not be presented as evidence of real-world behavior.

## Fixture integrity

SHA-256 hashes are recorded so future edits are deliberate:

| Fixture                              | SHA-256                                                            |
| ------------------------------------ | ------------------------------------------------------------------ |
| `derived/current-retail-samples.log` | `40435c057965042381ace7c61b3da0ac79c12ee3865a5a34e4517765301cfc7a` |
| `derived/encounter-envelope.log`     | `df213308032c6b2845284cc6fecebee3aa59cc876706fa35aece48e7fb37d18a` |
| `synthetic/external-effect.log`      | `aac4163adc6eed5d3bd775b4b68f3c3e96a164bc806066aa91c5014f26c21263` |
| `synthetic/missing-ownership.log`    | `62399b9c68645db05cf58bde640137ae1e8dfa774834f6157afc2eebe8a7cc95` |

## Deliberately excluded captures

No full capture was copied. In particular, the 28.9 MB `data/dummy-encounter.txt` capture remains
outside this repository and outside default tests. Capture-wide performance or end-to-end evidence
requires a later, explicit repository-size and privacy decision as described by TD-05B.
