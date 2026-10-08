import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, ResourceChangeEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemManaGained from 'parser/ui/ItemManaGained';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { WATER_SHIELD_MANA_REGENERATION_PER_SECOND } from '../../constants';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';
import { RESTORATION_COLORS } from 'src/analysis/retail/shaman/restoration/constants';
import { Uptime } from 'parser/ui/UptimeBar';
import { SpellLink } from 'interface';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'src/analysis/retail/shaman/restoration/Guide';
import type { JSX } from 'react';
import './ManaTideTotem.scss';

class WaterShield extends Analyzer {
  manaGain = 0;
  prepullApplication = false;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.WATER_SHIELD_ENERGIZE),
      this.waterShield,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.WATER_SHIELD),
      this.waterShieldPrepullCheck,
    );
  }

  waterShield(event: ResourceChangeEvent) {
    this.manaGain += event.resourceChange;
  }

  waterShieldPrepullCheck(event: ApplyBuffEvent) {
    if (event.prepull) {
      this.prepullApplication = true;
    }
  }

  get regenOnPlayer() {
    let uptimePercent = this.uptimePercent;
    if (uptimePercent === 0) {
      uptimePercent = 1;
    }

    return (
      (this.owner.fightDuration / 1000) * WATER_SHIELD_MANA_REGENERATION_PER_SECOND * uptimePercent
    );
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.WATER_SHIELD.id);
  }

  get uptimePercent() {
    return this.uptime / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptimePercent,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get suggestionThresholdsPrepull() {
    return {
      actual: this.prepullApplication,
      isEqual: false,
      style: ThresholdStyle.BOOLEAN,
    };
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.UNIMPORTANT(88)}
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <ul>
            <li>{formatNumber(this.regenOnPlayer)} from passive regen</li>
            <li>{formatNumber(this.manaGain)} from hits taken</li>
          </ul>
        }
      >
        <BoringSpellValueText spell={SPELLS.WATER_SHIELD}>
          <ItemManaGained amount={this.manaGain + this.regenOnPlayer} useAbbrev />
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get guideSubsection(): JSX.Element {
    const hasResurgence = this.selectedCombatant.hasTalent(TALENTS.RESURGENCE_TALENT);
    const hasReactiveWarding = this.selectedCombatant.hasTalent(TALENTS.REACTIVE_WARDING_TALENT);
    const hasTherazanesResilience = this.selectedCombatant.hasTalent(
      TALENTS.THERAZANES_RESILIENCE_TALENT,
    );

    const explanation = (
      <>
        <p>
          <b>
            <SpellLink spell={SPELLS.WATER_SHIELD} />
          </b>{' '}
          should be applied prior to the fight starting and reapplied after a consuming your{' '}
          <SpellLink spell={SPELLS.REINCARNATION} /> or a battle-resurrection as to not loose out on
          the Intellect gained from <SpellLink spell={TALENTS.INSTINCTIVE_IMBUEMENTS_TALENT} />.
        </p>
        {hasResurgence && (
          <>
            <p>
              <b>
                <SpellLink spell={TALENTS.RESURGENCE_TALENT} />
              </b>{' '}
              allows you to refund mana through critical strikes from{' '}
              <SpellLink spell={SPELLS.HEALING_WAVE} />,{' '}
              <SpellLink spell={TALENTS.CHAIN_HEAL_TALENT} />,{' '}
              <SpellLink spell={TALENTS.RIPTIDE_TALENT} />.
            </p>
          </>
        )}
        {hasReactiveWarding && (
          <>
            <p>
              <b>
                <SpellLink spell={TALENTS.REACTIVE_WARDING_TALENT} />
              </b>{' '}
              When refreshing Water Shield, you are refunded 429 mana for each stack of Water Shield
              missing. Additionally, Earth Shield and Water Shield can consume charges 1.0 sec
              faster.
            </p>
          </>
        )}
        {hasTherazanesResilience && (
          <>
            <p>
              As you have taken{' '}
              <b>
                <SpellLink spell={TALENTS.THERAZANES_RESILIENCE_TALENT} />
              </b>
              , this uptime should be close to 100%.
            </p>
          </>
        )}
      </>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={SPELLS.WATER_SHIELD} /> Uptimes
          </strong>
          {this.waterShieldUptimeBar()}
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  getUptimeHistory(spellId: number): Uptime[] {
    return this.selectedCombatant.getBuffHistory(spellId).map((trackedBuff) => ({
      start: trackedBuff.start,
      end: trackedBuff.end || this.owner.fight.end_time,
    }));
  }

  waterShieldUptimeBar() {
    return uptimeBarSubStatistic(this.owner.fight, {
      spells: [SPELLS.WATER_SHIELD],
      uptimes: this.getUptimeHistory(SPELLS.WATER_SHIELD.id),
      color: RESTORATION_COLORS.WATER_SHIELD,
    });
  }
}

export default WaterShield;
