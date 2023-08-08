import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/EventFilter';
import Events, { CastEvent, DamageEvent, FightEndEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import UptimeIcon from 'interface/icons/Uptime';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { INESCAPABLE_TORMENT_EXTENSION } from '../../constants';
import { SpellLink } from 'interface';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';

class InescapableTorment extends Analyzer {
  damage: number = 0;
  totalTime: number = 0;
  extension: number = 0;
  castTime: number = 0;
  MBExtension: BoxRowEntry[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.INESCAPABLE_TORMENT_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.INESCAPABLE_TORMENT_TALENT_DAMAGE),
      this.onDamage,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.MINDBENDER_SHADOW_TALENT),
      this.onCast,
    );
    this.addEventListener(Events.fightend, this.onEnd);
  }

  onCast(event: CastEvent) {
    //Since there is no way to tell when mindbender ends, we resolve the previous Mindbender when a new one is cast.
    //If this is not the first mindbender cast, then we generate the extension.
    if (this.castTime !== 0) {
      const tooltip = (
        <>
          @<strong>{this.owner.formatTimestamp(this.castTime)}</strong>, Extension:
          <strong>{this.extension.toFixed(1)}</strong>
        </>
      );

      let value = QualitativePerformance.Good;
      if (this.extension <= 7) {
        value = QualitativePerformance.Ok;
      }
      if (this.extension <= 4) {
        value = QualitativePerformance.Fail;
      }

      this.MBExtension.push({ value, tooltip });
    }

    this.totalTime += this.extension; // add previous extension to total time.
    this.castTime = event.timestamp; //get cast time for current mindbender.
    this.extension = 0; // reset extension.
  }

  onEnd(event: FightEndEvent) {
    //Since there is no way to tell when mindbender ends, we resolve the last Mindbender when the fight is over.
    //So long as a mindbender was cast, we generate the extension.
    if (this.castTime !== 0) {
      const tooltip = (
        <>
          @<strong>{this.owner.formatTimestamp(this.castTime)}</strong>, Extension:
          <strong>{this.extension.toFixed(1)}</strong>
        </>
      );

      let value = QualitativePerformance.Good;
      if (this.extension <= 7) {
        value = QualitativePerformance.Ok;
      }
      if (this.extension <= 4) {
        value = QualitativePerformance.Fail;
      }

      this.MBExtension.push({ value, tooltip });
    }

    this.totalTime += this.extension; // add previous extension to total time.
  }

  onDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
    this.extension +=
      INESCAPABLE_TORMENT_EXTENSION *
      this.selectedCombatant.getTalentRank(TALENTS.INESCAPABLE_TORMENT_TALENT);
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <BoringSpellValueText spell={TALENTS.INESCAPABLE_TORMENT_TALENT}>
          <div>
            <ItemDamageDone amount={this.damage} />{' '}
          </div>
          <div>
            <UptimeIcon /> {this.totalTime.toFixed(1)}s <small>of mindbender extension</small>{' '}
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS.MINDBENDER_SHADOW_TALENT} />
        </b>{' '}
        is a powerful cooldown when talented into{' '}
        <SpellLink spell={TALENTS.INESCAPABLE_TORMENT_TALENT} />.
        <br />
        Casting <SpellLink spell={SPELLS.MIND_BLAST} /> or{' '}
        <SpellLink spell={TALENTS.SHADOW_WORD_DEATH_TALENT} /> during{' '}
        <SpellLink spell={TALENTS.MINDBENDER_SHADOW_TALENT} /> extends its duration by 0.7 seconds
        and deals damage. Try to use these spells as much as possible in this window.
      </p>
    );

    const data = (
      <div>
        <strong>Mindbender Extension</strong>
        <br />
        <UptimeIcon /> <strong>{this.totalTime.toFixed(1)}</strong> <small> seconds</small>
        <PerformanceBoxRow values={this.MBExtension} />
      </div>
    );
    return explanationAndDataSubsection(explanation, data, 50);
  }
}

export default InescapableTorment;
