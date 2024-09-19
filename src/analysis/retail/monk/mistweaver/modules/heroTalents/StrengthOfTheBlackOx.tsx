import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { RefreshBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import { isStrengthOfTheBlackOxConsumed } from '../../normalizers/CastLinkNormalizer';
import SpellLink from 'interface/SpellLink';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import BaseCelestialAnalyzer from '../spells/BaseCelestialAnalyzer';

class StrengthOfTheBlackOx extends Analyzer {
  static dependencies = {
    celestial: BaseCelestialAnalyzer,
  };
  wastedBuffs: number = 0;
  entries: BoxRowEntry[] = [];
  protected celestial!: BaseCelestialAnalyzer;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.STRENGTH_OF_THE_BLACK_OX_TALENT);

    this.addEventListener(
      Events.refreshbuff.to(SELECTED_PLAYER).spell(SPELLS.STRENGTH_OF_THE_BLACK_OX_BUFF),
      this.onRefreshBuff,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.STRENGTH_OF_THE_BLACK_OX_BUFF),
      this.onRemoveBuff,
    );
  }

  private onRefreshBuff(event: RefreshBuffEvent) {
    this.wastedBuffs += 1;
    this.entries.push({
      value: QualitativePerformance.Fail,
      tooltip: (
        <>
          <div>Refreshed @ {this.owner.formatTimestamp(event.timestamp)}</div>
        </>
      ),
    });
  }

  private hasManaBuff(): boolean {
    return (
      this.selectedCombatant.hasBuff(SPELLS.MANA_TEA_BUFF) ||
      this.selectedCombatant.hasBuff(SPELLS.INNERVATE) ||
      this.celestial.celestialActive
    );
  }

  private onRemoveBuff(event: RemoveBuffEvent) {
    const isConsumed = isStrengthOfTheBlackOxConsumed(event);
    if (!isConsumed) {
      this.wastedBuffs += 1;
    }
    const hasBuff = this.hasManaBuff();
    this.entries.push({
      value:
        isConsumed && hasBuff
          ? QualitativePerformance.Perfect
          : isConsumed !== hasBuff
            ? QualitativePerformance.Good
            : QualitativePerformance.Fail,
      tooltip: (
        <>
          <div>
            {isConsumed ? 'Consumed ' : 'Expired '}@ {this.owner.formatTimestamp(event.timestamp)}
          </div>
          {isConsumed && (
            <div>
              <SpellLink spell={TALENTS_MONK.MANA_TEA_TALENT} /> or{' '}
              <SpellLink spell={this.celestial.getCelestialTalent()} /> active:{' '}
              <strong>{hasBuff ? 'Yes' : 'No'}</strong>
            </div>
          )}
        </>
      ),
    });
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS_MONK.STRENGTH_OF_THE_BLACK_OX_TALENT} />
        </b>{' '}
        is a buff that makes your next <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} />{' '}
        have a reduced cast time and apply a shield to 5 nearby allies. It is very important to
        never let this buff refresh or expire as it is a considerable amount of shielding. Try to
        have <SpellLink spell={TALENTS_MONK.MANA_TEA_TALENT} /> or{' '}
        <SpellLink spell={this.celestial.getCelestialTalent()} /> active when casting{' '}
        <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} /> as it is very expensive.
      </p>
    );
    const styleObj = {
      fontSize: 20,
    };
    const styleObjInner = {
      fontSize: 15,
    };
    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={TALENTS_MONK.STRENGTH_OF_THE_BLACK_OX_TALENT} /> utilization
          </strong>
          <PerformanceBoxRow values={this.entries} />
          <div style={styleObj}>
            <b>{this.wastedBuffs}</b> <small style={styleObjInner}>wasted buffs</small>
          </div>
        </RoundedPanel>
      </div>
    );
    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }
}

export default StrengthOfTheBlackOx;
