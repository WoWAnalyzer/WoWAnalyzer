import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import Combatants from 'parser/shared/modules/Combatants';

class JadefireStomp extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    spellUsable: SpellUsable,
    combatants: Combatants,
  };

  protected abilities!: Abilities;
  protected spellUsable!: SpellUsable;
  protected combatants!: Combatants;

  resets = 0;
  jfsCasts = 0;
  targetsDamaged = 0;
  targetsHealed = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.JADEFIRE_STOMP_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.JADEFIRE_STOMP_TALENT),
      this.casts,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FAELINE_STOMP_RESET),
      this.reset,
    );
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([SPELLS.JADEFIRE_STOMP_HEAL, TALENTS_MONK.JADEFIRE_STOMP_TALENT]),
      this.damage,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.JADEFIRE_STOMP_HEAL),
      this.heal,
    );
  }

  casts() {
    this.jfsCasts += 1;
  }

  reset() {
    if (this.spellUsable.isOnCooldown(TALENTS_MONK.JADEFIRE_STOMP_TALENT.id)) {
      this.spellUsable.endCooldown(TALENTS_MONK.JADEFIRE_STOMP_TALENT.id);
      this.resets += 1;
    }
  }

  damage() {
    this.targetsDamaged += 1;
  }

  heal(event: HealEvent) {
    this.targetsHealed += 1;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(99)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <TalentSpellText talent={TALENTS_MONK.JADEFIRE_STOMP_TALENT}>
          <>
            <div>
              {this.resets} <small>resets</small>
            </div>
            <div>
              {(this.targetsDamaged / this.jfsCasts).toFixed(2)}{' '}
              <small>Foes Hit per cast</small>{' '}
            </div>
            <div>
              {(this.targetsHealed / this.jfsCasts).toFixed(2)} <small>Allies Hit per cast</small>
            </div>
          </>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default JadefireStomp;
