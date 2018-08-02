# Azerite Scaling Data

Scale factors and other metadata about the available azerite traits. Each
object looks like:

```js
{
  "263962": { // spell ID
    "name": "Resounding Protection", // spell name
    "effect_list": [
      707038 // id of spell effects -- currently unused
    ],
    "secondary": false, // whether this trait uses primary or secondary scaling
    "effects": {
      "707038": {
        "avg": 10.883929 // effect scale factor
      }
    }
  },
}
```

Each trait may have multiple effects.

## Regenerating

See `scripts/azerite` for details.

## Primary vs Secondary Scaling

Scaling traits should generally be handled by the function
`calculateAzeriteEffects` in `common/stats.js`, which will scale the effects
appropriately for your target ilvl. That said, it is worth noting that most
traits scale exponentially as if they were primary stats -- *even if they give
secondary stats!*

If `secondary` is `true`, then the trait instead uses the linearized secondary
scaling as if it were a secondary stat on a piece of armor.

## Effects & Effect Scales

Each spell is associated with a list of *effects.* These are mostly internal
details, but it is worth noting that although each effect (there can be more than
one) may scale with a different multiplier (given by `effects[id].avg`), they
all use either primary or secondary scaling -- no mixing.
