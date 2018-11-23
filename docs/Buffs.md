# Buffs

The buffs module is a core configuration module to teach modules about buffs. You will have to configure it if you wish to benefit from certain core features such as showing it on the timeline, but **this is fully optional**.

## Setup

Make a Buffs module in your spec folder, in the location `<spec>/modules/Buffs.js`. You can copy an existing Buffs module as a basis, or use the skeleton below.

To configure buffs, override the `buffs()` method of the module, and return an array with configuration objects for your buffs.

<details>
  <summary>
    <strong>
     A skeleton for the buffs module
    </strong>
  </summary>
  
```jsx
import SPELLS from 'common/SPELLS';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreBuffs, { BuffDuration } from 'parser/core/modules/Buffs';

class Buffs extends CoreBuffs {
  buffs() {
    const combatant = this.selectedCombatant;

    return [
      {
        spell: SPELLS.BESTIAL_WRATH,
        duration: BuffDuration.STATIC(15000),
        timelineHightlight: true,
      },
    ];
  }
}

export default Buffs;
```

</details>

# Buff config

You can configure each buff by providing an object with options to configure the [`Buff`](../src/parser/core/modules/Buff.js) class. The Buff class is documented inline, so [view the class](../src/parser/core/modules/Buff.js) to find out the available options (in the `propTypes` static). You don't have to fully configure everything at once. It's ok to only configure what you need at the moment and expand it later.

# Adding buffs in other modules

You can add buffs from other modules by adding the `Buffs` module to your dependencies and calling the `this.buffs.add(options)` method, where options is the config described in the previous section. You should only add buffs the player can actually receive or apply.

# Using buff info

Please use the Buffs config to fuel your modules! After adding the `Buffs` module to your dependencies, you can call `this.buffs.getBuff(spell)` to get a `Buff` instance for the spell, if available. You're welcome to add configuration props to the `Buff` class, but do so only if necessary and useful for multiple specs. Make sure your new prop is similar to the existing module-specific props. When in doubt, ask in Discord.
