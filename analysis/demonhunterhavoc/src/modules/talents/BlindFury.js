import { formatPercentage, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import BoringResourceValue from 'parser/ui/BoringResourceValue';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Example Report: https://www.warcraftlogs.com/reports/KGJgZPxanBX82LzV/#fight=4&source=20
 */
const MAX_FURY = 120;

class BlindFury extends Analyzer {
  get furyPerMin() {
    return (this.gained / (this.owner.fightDuration / 60000)).toFixed(2);
  }

  get suggestionThresholds() {
    return {
      actual: this.badCast,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 1,
      },
      style: 'number',
    };
  }

  gained = 0;
  badCast = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BLIND_FURY_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.EYE_BEAM),
      this.onEyeBeamsCast,
    );
  }

  onEyeBeamsCast(event) {
    event.classResources &&
      event.classResources.forEach((resource) => {
        if (resource.type !== RESOURCE_TYPES.FURY.id) {
          return;
        }
        this.gained += MAX_FURY - (resource.amount - resource.cost);
        if (resource.amount >= 50) {
          this.badCast += 1;
        }
      });
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Cast <SpellLink id={SPELLS.EYE_BEAM.id} /> with 50 or less Fury when you take the{' '}
          <SpellLink id={SPELLS.BLIND_FURY_TALENT.id} /> talent to minimize Fury waste and maximize
          DPS.
        </>,
      )
        .icon(SPELLS.BLIND_FURY_TALENT.icon)
        .actual(
          <>
            {actual} bad <SpellLink id={SPELLS.EYE_BEAM.id} /> casts above 50 Fury.{' '}
          </>,
        )
        .recommended(`${formatPercentage(recommended)}% is recommended.`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(1)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            Since this will always max out your Fury on cast, wasted and totals do not matter. Only
            the amount effectively gained. <br />
            A bad cast is when you cast Eye Beam with more than 50 Fury. At that point you are
            wasting enough fury gained for it to be a DPS loss. <br />
            <br />
            {this.gained} Effective Fury gained
            <br />
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.BLIND_FURY_TALENT.id}>
          {this.badCast}{' '}
          <small>
            bad <SpellLink id={SPELLS.EYE_BEAM.id} /> casts
          </small>
          <BoringResourceValue
            resource={RESOURCE_TYPES.FURY}
            value={this.furyPerMin}
            label="Fury per min"
          />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BlindFury;
