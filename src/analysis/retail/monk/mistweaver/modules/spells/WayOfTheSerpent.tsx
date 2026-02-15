import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  BeginChannelEvent,
  CastEvent,
  HealEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import {
  WAY_OF_THE_SERPENT_VIV_SG_INCREASE,
  WAY_OF_THE_SERPENT_REM_INCREASE,
} from '../../constants';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import { SpellLink } from 'interface/index';
import { formatPercentage, formatNumber } from 'common/format';
import MovementDuringBuffTracker from '../features/MovementDuringBuffTracker';

class WayOfTheSerpent extends Analyzer {
  static dependencies = {
    movementTracker: MovementDuringBuffTracker,
  };

  protected movementTracker!: MovementDuringBuffTracker;

  activeVivifySpell = SPELLS.VIVIFY;

  vivifySheilunsHealing: number = 0;
  renewingMistHealing: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.WAY_OF_THE_SERPENT_TALENT);

    if (this.selectedCombatant.hasTalent(TALENTS_MONK.SHEILUNS_GIFT_TALENT)) {
      this.activeVivifySpell = TALENTS_MONK.SHEILUNS_GIFT_TALENT;
    }

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell([this.activeVivifySpell, SPELLS.RENEWING_MIST_HEAL]),
      this.onHeal,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.SOOTHING_MIST_TALENT),
      this.onChannelStart,
    );
    this.addEventListener(
      Events.BeginChannel.by(SELECTED_PLAYER).spell(SPELLS.CRACKLING_JADE_LIGHTNING),
      this.onChannelStart,
    );
    this.addEventListener(
      Events.removebuff
        .by(SELECTED_PLAYER)
        .spell([TALENTS_MONK.SOOTHING_MIST_TALENT, SPELLS.CRACKLING_JADE_LIGHTNING]),
      this.onChannelEnd,
    );
  }

  onChannelStart(event: CastEvent | BeginChannelEvent) {
    this.movementTracker.startTracking(event.ability.guid, event.timestamp);
  }

  onChannelEnd(event: RemoveBuffEvent) {
    this.movementTracker.stopTracking(event.ability.guid, event.timestamp);
  }

  get totalHealing(): number {
    return this.vivifySheilunsHealing + this.renewingMistHealing;
  }

  onHeal(event: HealEvent) {
    if (event.ability.guid === this.activeVivifySpell.id) {
      this.vivifySheilunsHealing += calculateEffectiveHealing(
        event,
        WAY_OF_THE_SERPENT_VIV_SG_INCREASE,
      );
    } else if (event.ability.guid === SPELLS.RENEWING_MIST_HEAL.id) {
      this.renewingMistHealing += calculateEffectiveHealing(event, WAY_OF_THE_SERPENT_REM_INCREASE);
    }
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS_MONK.WAY_OF_THE_SERPENT_TALENT} />}
        value={`${formatPercentage(
          this.owner.getPercentageOfTotalHealingDone(this.totalHealing),
        )} %`}
      />
    );
  }

  statistic() {
    const soomMovement = this.movementTracker.getTotalMovement(
      TALENTS_MONK.SOOTHING_MIST_TALENT.id,
    );
    const cjlMovement = this.movementTracker.getTotalMovement(SPELLS.CRACKLING_JADE_LIGHTNING.id);

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(1)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <div>
              <SpellLink spell={this.activeVivifySpell} /> additional healing:{' '}
              {formatNumber(this.vivifySheilunsHealing)}
            </div>
            <div>
              <SpellLink spell={SPELLS.RENEWING_MIST_HEAL} /> additional healing:{' '}
              {formatNumber(this.renewingMistHealing)}
            </div>
            {soomMovement > 0 && (
              <div>
                Movement during <SpellLink spell={TALENTS_MONK.SOOTHING_MIST_TALENT} />:{' '}
                {formatNumber(soomMovement)} yards
              </div>
            )}
            {cjlMovement > 0 && (
              <div>
                Movement during <SpellLink spell={SPELLS.CRACKLING_JADE_LIGHTNING} />:{' '}
                {formatNumber(cjlMovement)} yards
              </div>
            )}
          </>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.WAY_OF_THE_SERPENT_TALENT}>
          <ItemHealingDone amount={this.totalHealing} />
          <br />
          {formatNumber(soomMovement + cjlMovement)} <small>yards moved while channeling</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default WayOfTheSerpent;
