import { formatNumber, formatPercentage } from 'common/format';
import Abilities from 'analysis/retail/priest/holy/modules/Abilities';
import AbilityTracker from 'analysis/retail/priest/holy/modules/core/AbilityTracker';
import SPELLS from 'common/SPELLS';
import TALENTS, { TALENTS_PRIEST } from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { BeginCastEvent, CastEvent, HealEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { SANCTIFIED_PRAYERS_MULTIPLIER } from '../../../constants';
import EOLAttrib from '../../core/EchoOfLightAttributor';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import SpellLink from 'interface/SpellLink';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';

/*
  Using Holy Word: Sanctify increases the healing done by Prayer of Healing by 15% for 15 sec.
*/

class SanctifiedPrayers extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    abilities: Abilities,
    eolAttrib: EOLAttrib,
  };
  protected eolAttrib!: EOLAttrib;
  eolContrib = 0;

  lastCastStartWasBuffed: boolean = false;
  buffedPohCasts: number = 0;
  rawAdditionalHealing: number = 0;
  effectiveAdditionalHealing: number = 0;
  overhealing: number = 0;
  protected abilityTracker!: AbilityTracker;
  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SANCTIFIED_PRAYERS_TALENT);

    if (this.active) {
      this.addEventListener(
        Events.begincast.by(SELECTED_PLAYER).spell(TALENTS.PRAYER_OF_HEALING_TALENT),
        this.startPohCast,
      );
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(TALENTS.PRAYER_OF_HEALING_TALENT),
        this.finishPohCast,
      );
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER).spell(TALENTS.PRAYER_OF_HEALING_TALENT),
        this.onHeal,
      );
    }
  }

  get unbuffedPohCasts() {
    return (
      this.abilityTracker.getAbility(TALENTS.PRAYER_OF_HEALING_TALENT.id).casts -
      this.buffedPohCasts
    );
  }

  get percentOverhealing() {
    if (this.rawAdditionalHealing === 0) {
      return 0;
    }
    return this.overhealing / this.rawAdditionalHealing;
  }

  startPohCast(event: BeginCastEvent) {
    this.lastCastStartWasBuffed = this.selectedCombatant.hasBuff(SPELLS.SANCTIFIED_PRAYERS_BUFF.id);
  }

  finishPohCast(event: CastEvent) {
    if (this.lastCastStartWasBuffed) {
      this.buffedPohCasts += 1;
    }
  }

  onHeal(event: HealEvent) {
    // Check if PoH cast was buffed.
    if (this.lastCastStartWasBuffed) {
      this.effectiveAdditionalHealing += calculateEffectiveHealing(
        event,
        SANCTIFIED_PRAYERS_MULTIPLIER,
      );
      this.overhealing += calculateOverhealing(event, SANCTIFIED_PRAYERS_MULTIPLIER);
      this.eolContrib += this.eolAttrib.getEchoOfLightAmpAttrib(
        event,
        SANCTIFIED_PRAYERS_MULTIPLIER,
      );
    }
  }

  statistic() {
    return (
      <Statistic
        tooltip={
          <>
            {this.buffedPohCasts} Prayer of Healing casts with Sanctified Prayers active.
            <div>
              Total Healing: {formatNumber(this.rawAdditionalHealing)} (
              {formatPercentage(this.percentOverhealing)}% OH)
            </div>
            <br />
            <div>Breakdown: </div>
            <div>
              <SpellLink spell={TALENTS_PRIEST.SANCTIFIED_PRAYERS_TALENT} />:{' '}
              <ItemPercentHealingDone
                amount={this.effectiveAdditionalHealing}
              ></ItemPercentHealingDone>{' '}
            </div>
            <div>
              <SpellLink spell={SPELLS.ECHO_OF_LIGHT_MASTERY} />:{' '}
              <ItemPercentHealingDone amount={this.eolContrib}></ItemPercentHealingDone>
            </div>
          </>
        }
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(5)}
      >
        <BoringSpellValueText spell={TALENTS.SANCTIFIED_PRAYERS_TALENT}>
          <ItemHealingDone amount={this.effectiveAdditionalHealing + this.eolContrib} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SanctifiedPrayers;
