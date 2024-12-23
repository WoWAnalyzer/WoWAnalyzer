import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import { TIERS } from 'game/TIERS';
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
  recentIT: number = 0;
  has2Piece: boolean = true;
  tier31Effectiveness: number = 1.0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.INESCAPABLE_TORMENT_TALENT);
    this.has2Piece = this.selectedCombatant.has2PieceByTier(TIERS.DF3);
    //Shadow's Tier 31 2 piece causes Inescapable torment to proc at 15% effectiveness 2-3 times after a cast of SW:D
    //It occurs quickly, so it is not possible to have a cast between any of these damage events.
    //The damage is calculated correctly automatically, but the extension time on mindbender is not.
    this.tier31Effectiveness = 1.0;

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.INESCAPABLE_TORMENT_TALENT_DAMAGE),
      this.onDamage,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.MINDBENDER_SHADOW_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHADOW_PRIEST_VOIDWEAVER_VOIDWRAITH_CAST),
      this.onCast,
    );
    this.has2Piece &&
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(TALENTS.SHADOW_WORD_DEATH_TALENT),
        this.onCastSWD,
      );
    this.has2Piece &&
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(SPELLS.MIND_BLAST),
        this.onCastMB,
      );
    this.addEventListener(Events.fightend, this.onEnd);
  }

  private finalizeMindBenderCast() {
    if (this.castTime !== 0) {
      const tooltip = (
        <>
          @<strong>{this.owner.formatTimestamp(this.castTime)}</strong>, Extension:
          <strong>{this.extension.toFixed(1)}</strong>
        </>
      );

      let value = QualitativePerformance.Good;
      if (this.extension <= 6) {
        value = QualitativePerformance.Ok;
      }
      if (this.extension <= 4) {
        value = QualitativePerformance.Fail;
      }

      this.MBExtension.push({ value, tooltip });
    }
  }

  onCastSWD(event: CastEvent) {
    //console.log("SW:D Cast", event.timestamp)
    this.tier31Effectiveness = 1.0;
  }

  onCastMB(event: CastEvent) {
    //console.log("MB Cast", event.timestamp)
    this.tier31Effectiveness = 1.0;
  }

  onCast(event: CastEvent) {
    //Since there is no way to tell when mindbender ends, we resolve the previous Mindbender when a new one is cast.
    //If this is not the first mindbender cast, then we generate the extension.
    this.finalizeMindBenderCast();

    this.totalTime += this.extension; // add previous extension to total time.
    this.castTime = event.timestamp; //get cast time for current mindbender.
    this.extension = 0; // reset extension.
  }

  onEnd(event: FightEndEvent) {
    //Since there is no way to tell when mindbender ends, we resolve the last Mindbender when the fight is over.
    //So long as a mindbender was cast, we generate the extension.
    this.finalizeMindBenderCast();
    this.totalTime += this.extension; // add previous extension to total time.
  }

  onDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
    //Inescapable Torment can hit 5 targets at once, but it only gives the extension for the first one hit.
    if (event.timestamp !== this.recentIT) {
      //console.log("extension at", event.timestamp, "With", this.Tier31TwoPiece)
      this.extension +=
        INESCAPABLE_TORMENT_EXTENSION *
        this.tier31Effectiveness *
        this.selectedCombatant.getTalentRank(TALENTS.INESCAPABLE_TORMENT_TALENT);
      if (this.has2Piece) {
        this.tier31Effectiveness = 0.15;
      }
    }
    this.recentIT = event.timestamp;
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
        and deals damage.
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
