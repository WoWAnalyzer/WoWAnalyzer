import { defineMessage } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { GUIDE_EXPLANATION_PERCENT_WIDTH, ON_CAST_BUFF_REMOVAL_GRACE_MS } from '../../constants';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { ExplanationAndDataSubSection } from 'interface/guide/components/ExplanationRow';
import { addEnhancedCastReason } from 'parser/core/EventMetaLib';
import typedKeys from 'common/typedKeys';
import { maybeGetTalentOrSpell } from 'common/maybeGetTalentOrSpell';

const SURGE_OF_POWER = {
  AFFECTED_CASTS: [
    SPELLS.FLAME_SHOCK,
    TALENTS.FROST_SHOCK_TALENT,
    TALENTS.LAVA_BURST_TALENT,
    SPELLS.LIGHTNING_BOLT,
  ],
};

class SurgeOfPower extends Analyzer {
  sopBuffedAbilities: { [key: number]: number } = {};
  // total SK + SoP lightning bolt casts
  skSopCasts = 0;
  // total SK lightning bolt casts
  skCasts = 0;

  sopActive = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SURGE_OF_POWER_TALENT);
    if (!this.active) {
      return;
    }

    Object.values(SURGE_OF_POWER.AFFECTED_CASTS).forEach(({ id: spellid }) => {
      this.sopBuffedAbilities[spellid] = 0;
    });

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SURGE_OF_POWER_BUFF),
      this.onSopGain,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SURGE_OF_POWER.AFFECTED_CASTS),
      this._onCast,
    );
  }

  onSopGain(event: ApplyBuffEvent) {
    // There are instances where there are two cast events within the grace window
    // for determining if SoP is active. This boolean overrides that, to ensure
    // that only one of the spells are marked as empowered.
    this.sopActive = true;
  }

  get suggestionThresholds() {
    return {
      actual: this.skSopCasts / this.skCasts,
      isLessThan: {
        minor: 0.9,
        average: 0.75,
        major: 0.5,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  _onCast(event: CastEvent) {
    // cast lightning bolt with only SK buff active
    if (
      this.selectedCombatant.hasBuff(
        SPELLS.STORMKEEPER_BUFF_AND_CAST.id,
        event.timestamp,
        ON_CAST_BUFF_REMOVAL_GRACE_MS,
      ) &&
      event.ability.guid === SPELLS.LIGHTNING_BOLT.id
    ) {
      this.skCasts += 1;
    }

    if (
      !this.selectedCombatant.hasBuff(
        SPELLS.SURGE_OF_POWER_BUFF.id,
        event.timestamp,
        ON_CAST_BUFF_REMOVAL_GRACE_MS,
      ) ||
      !this.sopActive
    ) {
      return;
    }

    addEnhancedCastReason(event);
    this.sopBuffedAbilities[event.ability.guid] += 1;
    this.sopActive = false;

    // cast lightning bolt with SoP and SK buffs active
    if (
      this.selectedCombatant.hasBuff(
        SPELLS.STORMKEEPER_BUFF_AND_CAST.id,
        event.timestamp,
        ON_CAST_BUFF_REMOVAL_GRACE_MS,
      ) &&
      event.ability.guid === SPELLS.LIGHTNING_BOLT.id
    ) {
      this.skSopCasts += 1;
    }
  }

  statistic() {
    const buffedAbilities = typedKeys(this.sopBuffedAbilities)
      .filter((spellId) => this.sopBuffedAbilities[spellId] > 0)
      .reduce<Record<number, number>>((rec, spellId) => {
        rec[spellId] = this.sopBuffedAbilities[spellId];
        return rec;
      }, {});

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        dropdown={
          <table className="table table-condensed">
            <thead>
              <tr>
                <th>Ability</th>
                <th>Number of Buffed Casts</th>
              </tr>
            </thead>
            <tbody>
              {typedKeys(buffedAbilities).map((spellId) => (
                <tr key={spellId}>
                  <th>
                    <SpellLink spell={maybeGetTalentOrSpell(spellId)!} />
                  </th>
                  <td>{buffedAbilities[spellId]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      >
        <BoringSpellValueText spell={TALENTS.SURGE_OF_POWER_TALENT}>
          {Object.values(buffedAbilities).reduce((a, b) => a + b)} buffs consumed
        </BoringSpellValueText>
      </Statistic>
    );
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <span>
          You should aim to empower all of your Stormkeeper lightning bolts with Surge of Power. You
          can accomplish this consistently by pooling to 95+ maelstrom right before Stormkeeper is
          available, then casting ES {'->'} SK {'->'} LB {'->'} LvB {'->'} ES {'->'} LB.
        </span>,
      )
        .icon(TALENTS.SURGE_OF_POWER_TALENT.icon)
        .actual(
          defineMessage({
            id: 'shaman.elemental.suggestions.surgeOfPower.stormKeeperEmpowered',
            message: `${formatPercentage(
              actual,
            )}% of Stormkeeper Lightning Bolts empowered with Surge`,
          }),
        )
        .recommended(`100% is recommended.`),
    );
  }

  guideSubsection(): JSX.Element {
    const explanation = <>TODO</>;
    const data = this.statistic();

    return (
      <ExplanationAndDataSubSection
        title="Surge of Power"
        explanationPercent={GUIDE_EXPLANATION_PERCENT_WIDTH}
        explanation={explanation}
        data={data}
      />
    );
  }
}

export default SurgeOfPower;
