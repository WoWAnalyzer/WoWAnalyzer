import { formatPercentage } from 'common/format';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { UNRESTRAINED_FURY_SCALING } from 'analysis/retail/demonhunter/shared';

const BASE_MAX_FURY = 100;

class BlindFury extends Analyzer {
  maxFury = BASE_MAX_FURY;
  gained = 0;
  badCast = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.BLIND_FURY_HAVOC_TALENT.id);
    if (!this.active) {
      return;
    }
    this.maxFury =
      BASE_MAX_FURY +
      UNRESTRAINED_FURY_SCALING[
        this.selectedCombatant.getTalentRank(TALENTS_DEMON_HUNTER.UNRESTRAINED_FURY_TALENT.id)
      ];
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_DEMON_HUNTER.EYE_BEAM_HAVOC_TALENT),
      this.onEyeBeamsCast,
    );
  }

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
      style: ThresholdStyle.NUMBER,
    };
  }

  onEyeBeamsCast(event: CastEvent) {
    event.classResources &&
      event.classResources.forEach((resource) => {
        if (resource.type !== RESOURCE_TYPES.FURY.id) {
          return;
        }
        this.gained += this.maxFury - (resource.amount - resource.cost);
        if (resource.amount >= 50) {
          this.badCast += 1;
        }
      });
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Cast <SpellLink id={TALENTS_DEMON_HUNTER.EYE_BEAM_HAVOC_TALENT.id} /> with 50 or less Fury
          when you take the <SpellLink id={TALENTS_DEMON_HUNTER.BLIND_FURY_HAVOC_TALENT.id} />{' '}
          talent to minimize Fury waste and maximize DPS.
        </>,
      )
        .icon(TALENTS_DEMON_HUNTER.BLIND_FURY_HAVOC_TALENT.icon)
        .actual(
          <>
            {actual} bad <SpellLink id={TALENTS_DEMON_HUNTER.EYE_BEAM_HAVOC_TALENT.id} /> casts
            above 50 Fury.{' '}
          </>,
        )
        .recommended(`${formatPercentage(recommended)}% is recommended.`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(6)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
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
        <BoringSpellValueText spellId={TALENTS_DEMON_HUNTER.BLIND_FURY_HAVOC_TALENT.id}>
          <>
            {this.badCast}{' '}
            <small>
              bad <SpellLink id={TALENTS_DEMON_HUNTER.EYE_BEAM_HAVOC_TALENT.id} /> casts
            </small>
            <br />
            {this.furyPerMin} <small>Fury per min</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BlindFury;
