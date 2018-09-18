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
    "scaling_type": -1, // the scaling type used, typically either -1, -7, or -8
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

## Effects & Effect Scales

Each spell is associated with a list of *effects.* These are mostly internal
details, but it is worth noting that although each effect (there can be more than
one) may scale with a different multiplier (given by `effects[id].avg`), they
all use either primary or secondary scaling -- no mixing.
