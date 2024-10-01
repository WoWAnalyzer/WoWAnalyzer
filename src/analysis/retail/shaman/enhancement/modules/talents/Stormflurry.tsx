import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { EnhancementEventLinks, STORMSTRIKE_CAST_SPELLS } from '../../constants';
import Spell from 'common/SPELLS/Spell';
import TalentSpellText from 'parser/ui/TalentSpellText';

const MAIN_HAND_DAMAGES = [SPELLS.STORMSTRIKE_DAMAGE.id, SPELLS.WINDSTRIKE_DAMAGE.id];

/**
 * Stormstrike has a 25% chance to strike the target an additional time for
 * 40% of normal damage. This effect can chain off of itself.
 *
 * Example Log:
 *
 */
class Stormflurry extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;

  protected extraHits: number = 0;
  protected extraDamage: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_SHAMAN.STORMFLURRY_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(STORMSTRIKE_CAST_SPELLS),
      this.onStormstrike,
    );
  }

  get totalStormstrikeCasts() {
    return STORMSTRIKE_CAST_SPELLS.reduce(
      (casts: number, spell: Spell) =>
        (casts += this.abilityTracker.getAbility(spell.id).casts || 0),
      0,
    );
  }

  onStormstrike(event: CastEvent) {
    if (!event._linkedEvents) {
      return;
    }
    const stormstrikeDamageEvents = event._linkedEvents
      .filter((le) => le.relation === EnhancementEventLinks.STORMSTRIKE_LINK)
      .map((le) => le.event as DamageEvent);
    if (stormstrikeDamageEvents.length <= 2) {
      return;
    }
    stormstrikeDamageEvents
      .filter((_, index) => index >= 2)
      .forEach((damageEvent) => {
        if (MAIN_HAND_DAMAGES.includes(damageEvent.ability.guid)) {
          this.extraHits += 1;
        }
        this.extraDamage += damageEvent.amount + (damageEvent.absorb || 0);
      });
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            <p>
              You had {this.extraHits} extra Stormstrike
              {this.selectedCombatant.hasTalent(TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT) ||
              this.selectedCombatant.hasTalent(TALENTS_SHAMAN.DEEPLY_ROOTED_ELEMENTS_TALENT)
                ? '/Windstrike'
                : ''}{' '}
              hits (+{formatPercentage(this.extraHits / this.totalStormstrikeCasts)}%).
            </p>
            <p>
              <small>
                This is the maximum possible value, however it is highly likely the actual damage
                and number of hits are lower than displayed. This is a technical limitation due to
                how the hits appear in logs.
              </small>
            </p>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_SHAMAN.STORMFLURRY_TALENT}>
          <ItemDamageDone amount={this.extraDamage} approximate />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Stormflurry;
