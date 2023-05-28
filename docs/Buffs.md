# Buffs

The buffs module is a core configuration module to teach modules about buffs. You will have to configure it if you wish to benefit from certain core features such as showing it on the timeline, but **this is fully optional**.

## Setup

Make a Buffs module in your spec folder, in the location `<spec>/modules/Auras.ts`. You can copy an existing Buffs module as a basis, or use the skeleton below.

To configure buffs, override the `auras()` method of the module, and return an array with configuration objects for your buffs.

<details>
  <summary>
    <strong>
     A skeleton for the buffs module
    </strong>
  </summary>

```jsx
import SPELLS from 'common/SPELLS';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreAuras from 'parser/core/modules/Auras';

class Auras extends CoreAuras {
  auras() {
    const combatant = this.selectedCombatant;

    return [
      {
        spellId: SPELLS.BESTIAL_WRATH.id,
        timelineHighlight: true,
      },
    ];
  }
}

export default Buffs;
```

</details>

# Aura config

You can configure each buff by providing an object with options to configure the [`Aura`](../src/parser/core/modules/Aura.ts) class. The Buff class is documented inline, so [view the class](../src/parser/core/modules/Aura.ts) to find out the available options (in the `propTypes` static). You don't have to fully configure everything at once. It's ok to only configure what you need at the moment and expand it later.

# Adding auras in other modules

You can add auras from other modules by adding the `Auras` module to your dependencies and calling the `this.auras.add(options)` method, where options is the config described in the previous section. You should only add auras the player can actually receive or apply.

# Defaults

The Auras module is configured with defaults from the Abilities module where each ability with the (deprecated) `buffSpellId` property is added as a prop. Once you add the Auras module, the default will no longer be used so you'll have to add all buffs you could want manually. Please don't forget to remove all usages of the `buffSpellId` prop in the Abilities config as they're useless with an Auras module.

# Using aura info

Please use the Auras config to fuel your modules! After adding the `Auras` module to your dependencies, you can call `this.auras.getAura(spell)` to get an `Aura` instance for the spell, if available. You're welcome to add configuration props to the `Aura` class, but do so only if necessary and useful for multiple specs. Make sure your new prop is similar to the existing module-specific props. When in doubt, ask in Discord.
