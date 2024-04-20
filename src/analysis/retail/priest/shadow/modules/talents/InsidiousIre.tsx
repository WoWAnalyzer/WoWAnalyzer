import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import EventHistory from 'parser/shared/modules/EventHistory';
import { formatPercentage } from 'common/format';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import UptimeIcon from 'interface/icons/Uptime';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { DamageEvent, EventType } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { INSIDIOUS_IRE_DAMAGE_PER_RANK } from '../../constants';
import { SpellInfo } from 'parser/core/EventFilter';
import GradiatedPerformanceBar from 'interface/guide/components/GradiatedPerformanceBar';

/*
  Insidious Ire affects:

  Void Torrent
  Mind Blast

  And only applies when ALL of the following debuffs are present

  Shadow Word: Pain
  Vamperic Touch
  Devouring Plague
 */
class InsidiousIre extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    eventHistory: EventHistory,
  };
  protected eventHistory!: EventHistory;
  protected enemies!: Enemies;
  protected insidiousIrePct: number;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.INSIDIOUS_IRE_TALENT);
    this.insidiousIrePct =
      this.selectedCombatant.getTalentRank(TALENTS.INSIDIOUS_IRE_TALENT) *
      INSIDIOUS_IRE_DAMAGE_PER_RANK;
  }

  ireDataForSpell(spell: SpellInfo) {
    const damageInstances = this.eventHistory.getEvents(EventType.Damage, {
      spell,
    });

    // Partition casts by if the target was affected by all three dots and thus would have been ired
    const [ired, unIred] = damageInstances.reduce<[DamageEvent[], DamageEvent[]]>(
      (result, damage) => {
        const enemy = this.enemies.getEntity(damage);
        const wasIred =
          enemy &&
          enemy.hasBuff(SPELLS.SHADOW_WORD_PAIN.id, damage.timestamp) &&
          enemy.hasBuff(SPELLS.VAMPIRIC_TOUCH.id, damage.timestamp) &&
          enemy.hasBuff(TALENTS.DEVOURING_PLAGUE_TALENT.id, damage.timestamp);
        result[wasIred ? 0 : 1].push(damage);
        return result;
      },
      [[], []],
    );

    return {
      instancesHit: ired.length,
      instancesMissed: unIred.length,
      efficiency: ired.length / (ired.length + unIred.length),
      damageGained: ired.reduce(
        (sum, damage) => sum + calculateEffectiveDamage(damage, this.insidiousIrePct),
        0,
      ),
      damageMissed: unIred.reduce((sum, damage) => sum + damage.amount * this.insidiousIrePct, 0),
    };
  }

  get mindBlastEfficiency() {
    return this.ireDataForSpell(SPELLS.MIND_BLAST).efficiency;
  }

  get voidTorrentEfficiency() {
    if (!this.selectedCombatant.hasTalent(TALENTS.VOID_TORRENT_TALENT)) {
      return 1.0;
    }
    return this.ireDataForSpell(TALENTS.VOID_TORRENT_TALENT).efficiency;
  }

  statistic() {
    const mindBlast = this.ireDataForSpell(SPELLS.MIND_BLAST);
    const voidTorrent = this.selectedCombatant.hasTalent(TALENTS.VOID_TORRENT_TALENT)
      ? this.ireDataForSpell(TALENTS.VOID_TORRENT_TALENT)
      : undefined;
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip="Number of casts where the target was affected by all 3 dots. Void torrent counts individual damage instances since a dot can fall off mid-channel."
      >
        <>
          <BoringSpellValueText
            key={TALENTS.INSIDIOUS_IRE_TALENT.id}
            spell={TALENTS.INSIDIOUS_IRE_TALENT}
          >
            <ItemDamageDone amount={mindBlast.damageGained + (voidTorrent?.damageGained || 0)} />
          </BoringSpellValueText>
          <BoringSpellValueText key={SPELLS.MIND_BLAST.id} spell={SPELLS.MIND_BLAST}>
            <div>
              <UptimeIcon /> {formatPercentage(mindBlast.efficiency)} % <small>efficiency</small>
            </div>
            <ItemDamageDone amount={mindBlast.damageGained} />
          </BoringSpellValueText>
          {voidTorrent ? (
            <BoringSpellValueText
              key={TALENTS.VOID_TORRENT_TALENT.id}
              spell={TALENTS.VOID_TORRENT_TALENT}
            >
              <div>
                <UptimeIcon /> {formatPercentage(voidTorrent.efficiency)} %{' '}
                <small>efficiency</small>
              </div>
              <ItemDamageDone amount={voidTorrent.damageGained} />
            </BoringSpellValueText>
          ) : null}
        </>
      </Statistic>
    );
  }

  get guideSubsection(): JSX.Element {
    const mindBlast = this.ireDataForSpell(SPELLS.MIND_BLAST);
    const voidTorrent = this.selectedCombatant.hasTalent(TALENTS.VOID_TORRENT_TALENT)
      ? this.ireDataForSpell(TALENTS.VOID_TORRENT_TALENT)
      : undefined;

    const explanation = (
      <>
        <p>
          <b>
            <SpellLink spell={TALENTS.INSIDIOUS_IRE_TALENT} />
          </b>{' '}
          adds damange to <SpellLink spell={SPELLS.MIND_BLAST} /> and{' '}
          <SpellLink spell={TALENTS.VOID_TORRENT_TALENT} /> when{' '}
          <SpellLink spell={SPELLS.SHADOW_WORD_PAIN} />, <SpellLink spell={SPELLS.VAMPIRIC_TOUCH} />
          , and <SpellLink spell={TALENTS.DEVOURING_PLAGUE_TALENT} /> are all active on the target.{' '}
          <br />
          Be sure to cast these spells while Devouring Plague is on your target to increase their
          damage.
        </p>
        {!this.selectedCombatant.hasTalent(TALENTS.VOID_TORRENT_TALENT) ? (
          <b>You should really talent Void Torrent in combination with this talent!</b>
        ) : null}
      </>
    );

    const data = (
      <div>
        <strong>Mindblast breakdown</strong>
        <GradiatedPerformanceBar good={mindBlast.instancesHit} bad={mindBlast.instancesMissed} />
        <strong>Void Torrent breakdown</strong>
        <GradiatedPerformanceBar
          good={voidTorrent?.instancesHit || 0}
          bad={voidTorrent?.instancesMissed || 1}
        />
      </div>
    );
    return explanationAndDataSubsection(explanation, data, 50);
  }
}

export default InsidiousIre;
