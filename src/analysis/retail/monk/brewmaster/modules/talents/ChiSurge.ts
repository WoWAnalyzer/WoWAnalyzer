import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, ApplyDebuffEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const CDR_PER_APPLICATION = 8000;
const MAX_CDR_APPLICATIONS = 5;

const debug = false;

class ChiSurge extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    spellUsable: SpellUsable,
  };

  protected abilities!: Abilities;
  protected spellUsable!: SpellUsable;

  // Array of triggering cast and number of debuff applications
  casts: Array<[CastEvent, number]> = [];

  constructor(options: Options) {
    super(options);

    const active = this.selectedCombatant.hasTalent(talents.CHI_SURGE_TALENT);

    this.active = active;

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(talents.WEAPONS_OF_ORDER_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.CHI_SURGE_DEBUFF),
      this.onDebuff,
    );
  }

  onCast(event: CastEvent) {
    this.casts.push([event, 0]);
  }

  onDebuff(event: ApplyDebuffEvent) {
    if (this.casts.length === 0) {
      debug &&
        this.warn(
          event.ability.name,
          'applied before first',
          talents.WEAPONS_OF_ORDER_TALENT.name,
          'cast',
        );
      return;
    }
    const [lastCast, applications] = this.casts[this.casts.length - 1];
    const baseCd = this.abilities.getExpectedCooldownDuration(lastCast.ability.guid);
    if (baseCd == null) {
      debug && this.warn('no cd for', lastCast.ability.name);
      return;
    }

    if (applications >= MAX_CDR_APPLICATIONS) {
      return;
    }

    if (this.spellUsable.isOnCooldown(lastCast.ability.guid)) {
      this.spellUsable.reduceCooldown(lastCast.ability.guid, CDR_PER_APPLICATION);
    }
    this.casts[this.casts.length - 1][1] = applications + 1;
  }
}

export default ChiSurge;
