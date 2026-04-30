import type { JSX } from 'react';
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
  Void Blast
  Void Volley
  Mind Flay
  Mind Flay: Insanity

  And only applies when you have the buff, which occurs when ALL of the following debuffs are present on ANY target

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
        const wasIred = this.selectedCombatant.hasBuff(
          SPELLS.INSIDIOUS_IRE_TALENT_BUFF,
          damage.timestamp,
        );
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

  statistic() {
    const mindBlast = this.ireDataForSpell(TALENTS.MIND_BLAST_TALENT);
    const voidTorrent = this.ireDataForSpell(TALENTS.VOID_TORRENT_TALENT);
    const voidVolley = this.ireDataForSpell(SPELLS.VOID_VOLLEY_DAMAGE);
    const voidBlast = this.ireDataForSpell(SPELLS.SHADOW_PRIEST_VOIDWEAVER_VOID_BLAST);
    const mindFlayInsanity = this.ireDataForSpell(SPELLS.MIND_FLAY_INSANITY_TALENT_DAMAGE);
    const mindFlay = this.ireDataForSpell(SPELLS.MIND_FLAY);

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
            <ItemDamageDone
              amount={
                mindBlast.damageGained +
                voidTorrent.damageGained +
                voidVolley.damageGained +
                voidBlast.damageGained +
                mindFlayInsanity.damageGained +
                mindFlay.damageGained
              }
            />
          </BoringSpellValueText>
          <BoringSpellValueText
            key={TALENTS.MIND_BLAST_TALENT.id}
            spell={TALENTS.MIND_BLAST_TALENT}
          >
            <div>
              <UptimeIcon /> {formatPercentage(mindBlast.efficiency)} % <small>efficiency</small>
            </div>
            <ItemDamageDone amount={mindBlast.damageGained} />
          </BoringSpellValueText>

          {this.selectedCombatant.hasTalent(TALENTS.VOID_TORRENT_TALENT) && (
            <>
              <BoringSpellValueText
                key={TALENTS.VOID_BLAST_TALENT.id}
                spell={TALENTS.VOID_BLAST_TALENT}
              >
                <div>
                  <UptimeIcon /> {formatPercentage(voidBlast.efficiency)} %{' '}
                  <small>efficiency</small>
                </div>
                <ItemDamageDone amount={voidBlast.damageGained} />
              </BoringSpellValueText>

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
            </>
          )}

          <BoringSpellValueText
            key={SPELLS.VOID_VOLLEY_DAMAGE.id}
            spell={SPELLS.VOID_VOLLEY_DAMAGE}
          >
            <div>
              <UptimeIcon /> {formatPercentage(voidVolley.efficiency)} % <small>efficiency</small>
            </div>
            <ItemDamageDone amount={voidVolley.damageGained} />
          </BoringSpellValueText>

          <BoringSpellValueText key={SPELLS.MIND_FLAY.id} spell={SPELLS.MIND_FLAY}>
            <div>
              <UptimeIcon /> {formatPercentage(mindFlay.efficiency)} % <small>efficiency</small>
            </div>
            <ItemDamageDone amount={mindFlay.damageGained} />
          </BoringSpellValueText>

          {this.selectedCombatant.hasTalent(TALENTS.HALO_SHADOW_TALENT) && (
            <BoringSpellValueText
              key={SPELLS.MIND_FLAY_INSANITY_TALENT_DAMAGE.id}
              spell={SPELLS.MIND_FLAY_INSANITY_TALENT_DAMAGE}
            >
              <div>
                <UptimeIcon /> {formatPercentage(mindFlayInsanity.efficiency)} %{' '}
                <small>efficiency</small>
              </div>
              <ItemDamageDone amount={mindFlayInsanity.damageGained} />
            </BoringSpellValueText>
          )}
        </>
      </Statistic>
    );
  }

  get guideSubsection(): JSX.Element {
    const mindBlast = this.ireDataForSpell(TALENTS.MIND_BLAST_TALENT);
    const voidTorrent = this.ireDataForSpell(TALENTS.VOID_TORRENT_TALENT);
    const voidVolley = this.ireDataForSpell(SPELLS.VOID_VOLLEY_DAMAGE);
    const voidBlast = this.ireDataForSpell(SPELLS.SHADOW_PRIEST_VOIDWEAVER_VOID_BLAST);
    const mindFlayInsanity = this.ireDataForSpell(SPELLS.MIND_FLAY_INSANITY_TALENT_DAMAGE);
    //const mindFlay = this.ireDataForSpell(SPELLS.MIND_FLAY)

    const explanation = (
      <>
        <p>
          <b>
            <SpellLink spell={TALENTS.INSIDIOUS_IRE_TALENT} />
          </b>{' '}
          is active when <SpellLink spell={SPELLS.SHADOW_WORD_PAIN} />,{' '}
          <SpellLink spell={SPELLS.VAMPIRIC_TOUCH} />, and{' '}
          <SpellLink spell={TALENTS.SHADOW_WORD_MADNESS_TALENT} /> are all on a target. <div />
          This increases the damage of <SpellLink spell={SPELLS.MIND_FLAY} />,{' '}
          <SpellLink spell={SPELLS.VOID_VOLLEY_CAST} />,{' '}
          <SpellLink spell={TALENTS.MIND_BLAST_TALENT} />,{' '}
          {this.selectedCombatant.hasTalent(TALENTS.VOID_TORRENT_TALENT) && (
            <>
              <SpellLink spell={TALENTS.VOID_BLAST_TALENT} /> and{' '}
              <SpellLink spell={TALENTS.VOID_TORRENT_TALENT} />
            </>
          )}
          {this.selectedCombatant.hasTalent(TALENTS.HALO_SHADOW_TALENT) && (
            <>
              {' '}
              and <SpellLink spell={SPELLS.MIND_FLAY_INSANITY_TALENT_DAMAGE} />
            </>
          )}
          . <div>Try to make sure this buff is active when casting these powerful spells.</div>
        </p>
      </>
    );

    const data = (
      <div>
        <strong>Mindblast breakdown</strong>
        <GradiatedPerformanceBar good={mindBlast.instancesHit} bad={mindBlast.instancesMissed} />

        {this.selectedCombatant.hasTalent(TALENTS.VOID_TORRENT_TALENT) && (
          <>
            <strong>VoidBlast breakdown</strong>
            <GradiatedPerformanceBar
              good={voidBlast.instancesHit}
              bad={voidBlast.instancesMissed}
            />
            <strong>Void Torrent breakdown</strong>
            <GradiatedPerformanceBar
              good={voidTorrent.instancesHit}
              bad={voidTorrent.instancesMissed}
            />
          </>
        )}

        <strong>Void Volley breakdown</strong>
        <GradiatedPerformanceBar good={voidVolley.instancesHit} bad={voidVolley.instancesMissed} />
        {/*<strong>Mind Flay breakdown</strong> <GradiatedPerformanceBar good={mindFlay.instancesHit} bad={mindFlay.instancesMissed} />*/}

        {this.selectedCombatant.hasTalent(TALENTS.HALO_SHADOW_TALENT) && (
          <>
            <strong>Mind Flay Insanity breakdown</strong>
            <GradiatedPerformanceBar
              good={mindFlayInsanity.instancesHit}
              bad={mindFlayInsanity.instancesMissed}
            />
          </>
        )}
      </div>
    );
    return explanationAndDataSubsection(explanation, data, 50);
  }
}

export default InsidiousIre;
