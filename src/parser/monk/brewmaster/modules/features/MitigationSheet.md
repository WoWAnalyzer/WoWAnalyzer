# Mitigation Value Calculation

This files documents the ideas and methods behind the way we calculate stats in
the `MitigationSheet.js` module.

## Stats

### Normalization

Armor is our baseline, since BFA made the majority of tank damage physical.
For the purposes of placing stat values values on a consistent scale, we
calculate the calculate the expected/approximate value of a stat per-point and
then multiply by the number of points that would be given by scaling up your
exact gear by 5 ilvls. This correctly adjusts for the relative amount of
different stats on gear. That is:

```
+5 ilvls (Normalized) = Value per Point / Armor Value per Point * Points for Scaling +5 ilvls
```

The points for scaling +5 ilvls is straightforward for agi/armor: just apply
the scaling formula to the on-pull stats and take the difference. For secondary stats, we do the
same but also note that this skews the result towards stats that you have a lot
of. In extreme cases, this can inflate the value of certain stats. This could
be addressed better.

(Reorigination Array is also a huge problem, but it goes away after Uldir so
we're ignoring it)

Thus, for armor the `+5 ilvls (Normalized)` field is just the amount of armor
you'd get from scaling your gear up. Everything else is relative to this,
allowing more straightforward comparison of one stat to another.

This normalization is critical in making stats easy to compare, because
Brewmasters in particular have 3 different sets of scales: primary (Agi),
armor, and secondary---all of which are important. Having to interpret values
in the context of 3 different scales is difficult, even for experienced
theorycrafters.

### Armor

Armor's value per point is calculated in a very straightforward fashion: we
take the `unmitigatedAmount` from physical damage taken by the brewmaster and
then calculate the amount that'd be mitigated by the tank's armor at that
point. This does include buffs. Then the value per-point is given as:

```
Armor Value = Physical Damage Mitigated / Average Armor
```

where `Average Armor` includes buffs.

### Agility

Agility's value is broken down into three parts:

1. Healing from Gift of the Ox (via Agility -> AP conversion)
2. Added dodge (via Agility -> Dodge conversion)
3. Added purification (via Agility -> Stagger % conversion)

The first is handled in the `spells/GiftOfTheOx.js` module, with the math laid
out there.

The second is done in `core/MasteryValue.js`, and is calculated by computing
the expected amount dodged with and without bonus agility, then taking the
difference. See that module for details on calculating the expected dodge
amount. This effect has a range of values depending on whether the dodged
damage would've been partially purified or not. This is explicitly given as
a range in the output.

The last is done in the `AgilityValue.js` module, and is described therein.

```
Agility Value = {
    min: (GotOx Healing + (1 - Purified Dmg %) * Dodged Damage + Added Purification) / Avg Agility,
    max: (GotOx Healing + Dodged Damage + Added Purification) / Avg Agility,
}
```

Obviously, the amount purified is going to depend on how well the Brewmaster
plays, but this is an inevitable confounding factor.

### Critical Strike

Crit's value comes from two sources:

1. Celestial Fortune healing
2. Bonus healing from critical self-heals (including GotOx and azerite traits)

Note that critical CF heals are excluded from the 2nd category to avoid
double-counting them.

The former is handled in `spells/CelestialFortune.js`, which just sums the
total healing done by CF. The latter is handled by this module.

We take a similar (same?) approach to the healer stat valuation, where the
bonus healing from crit is calculated, and then overhealing is removed from
this. That is: overhealing is considered to come from crits first, and only any
remainder is given as actual healing by crit.

```
Crit Value = (CF Healing + Crit Bonus Healing) / Avg Crit
```

### Mastery

Mastery is our most complex stat to analyze. It can be broken down into two
parts:

1. Bonus healing from GotOx
2. Additional (expected) dodge from Mastery rating

The `spells/GiftOfTheOx.js` module handles the former, and details on the
latter can be found in `core/MasteryValue.js`.

For completeness' sake: the dodge value is calculated by calculating the
expected number of mastery stacks each time the tank is hit by a dodgeable
attack, and then calculating the expected amount of damage avoided via dodge
from this. 

This is relatively slow, but can be delayed til requested by the
user to make the page more responsive. It is also not too expensive to run it
with multiple different stat values, so we actually calculate the expected
number of mastery stacks with your actual mastery rating and with 0 rating. The
difference in expected amounts of damage avoided is the value attributed to
mastery.

As with agility's dodge value, there is a range of values presented that
accounts for the amount of potentially purified damage that was dodged.

```
Mastery Value = {
    min: (GotOx Healing + (1 - Purified Dmg %) * Dodged Damage) / Avg Mastery,
    max: (GotOx Healing + Dodged Damage) / Avg Mastery,
}
```

### Versatility

Versatility's value comes from two places:

1. Damage reduction
2. Added healing

The damage reduction is calculated as with Armor, but applied to the damage
that'd be taken *after* Armor (since one generally has no choice in how much
armor they have). Note that Vers is only half as effective for damage
mitigation as it is for adding healing and damage.

The added healing is calculated by taking the amount of total healing
(including overhealing) that was provided by vers, then subtracting the
overhealing off. Due to fights like Vectis, we treat absorbed healing as real
healing (i.e. absorbed healing is not a "mistake" that doesn't count).

Celestial Fortune's heals are unaffected by versatility, and therefore are
excluded from this.

```
Vers Value = (Damage Reduction + Added Healing) / Avg Vers
```
