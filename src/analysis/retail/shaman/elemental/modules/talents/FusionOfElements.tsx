import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS/shaman';
import Events, { CastEvent, DamageEvent, RemoveBuffEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { SpellLink } from 'interface';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import SpellUsageSubSection from 'parser/core/SpellUsage/SpellUsageSubSection';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import { SpellUse } from 'parser/core/SpellUsage/core';
import MAGIC_SCHOOLS, { color } from 'game/MAGIC_SCHOOLS';

// create a record that matches the fire buff id to the nature buff id and vice versa
const FUSION_BUFFS: Record<number, number> = {
  [SPELLS.FUSION_OF_THE_ELEMENTS_FIRE_BUFF.id]: SPELLS.FUSION_OF_THE_ELEMENTS_NATURE_BUFF.id,
  [SPELLS.FUSION_OF_THE_ELEMENTS_NATURE_BUFF.id]: SPELLS.FUSION_OF_THE_ELEMENTS_FIRE_BUFF.id,
};

/**
 * After casting a Fire or Nature damage spell, your next cast of the opposite type causes
 * you to cast an Elemental Blast at 60% effectiveness.
 */

interface IcefuryCast {
  event: CastEvent;
  hasNatureBuff: boolean;
  hasFireBuff: boolean;
}

class FusionOfElements extends Analyzer {
  fusionTriggered = false;
  elementalBlastDamage = 0;
  triggerCount = 0;
  lastBuffRemoval = 0;
  icefuryCasts: IcefuryCast[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.FUSION_OF_ELEMENTS_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ICEFURY_CAST),
      this.onIcefuryCast,
    );

    this.addEventListener(
      Events.removebuff
        .by(SELECTED_PLAYER)
        .spell([
          SPELLS.FUSION_OF_THE_ELEMENTS_FIRE_BUFF,
          SPELLS.FUSION_OF_THE_ELEMENTS_NATURE_BUFF,
        ]),
      this.onFusionBuffRemoved,
    );

    // Track Elemental Blast damage
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([SPELLS.ELEMENTAL_BLAST, SPELLS.ELEMENTAL_BLAST_OVERLOAD]),
      this.onElementalBlastDamage,
    );
  }

  onFusionBuffRemoved(event: RemoveBuffEvent) {
    const oppositeBuff = FUSION_BUFFS[event.ability.guid];
    const hasOppositeBuff = this.selectedCombatant.hasBuff(oppositeBuff);

    // If the opposite buff is missing, the next elemental blast damage is a triggered one and we should record it
    if (!hasOppositeBuff) {
      this.lastBuffRemoval = event.timestamp;
      this.fusionTriggered = true;
    }
  }

  onElementalBlastDamage(event: DamageEvent) {
    // If we've triggered fusion recently (within 1 second of buff removal), count this damage
    if (this.fusionTriggered && event.timestamp - this.lastBuffRemoval < 1000) {
      const damage = event.amount + (event.absorbed || 0);
      this.elementalBlastDamage += damage;
      this.triggerCount += 1;
      this.fusionTriggered = false; // Reset triggered state after counting damage
    }
  }

  onIcefuryCast(event: CastEvent) {
    // Track all icefury casts
    this.icefuryCasts.push({
      event: event,
      hasNatureBuff: this.selectedCombatant.hasBuff(SPELLS.FUSION_OF_THE_ELEMENTS_NATURE_BUFF.id),
      hasFireBuff: this.selectedCombatant.hasBuff(SPELLS.FUSION_OF_THE_ELEMENTS_FIRE_BUFF.id),
    });

    const cast = this.icefuryCasts.at(-1)!;

    if (cast.hasFireBuff || cast.hasNatureBuff) {
      addInefficientCastReason(
        event,
        <>
          <SpellLink spell={TALENTS.ICEFURY_TALENT} /> cast with{' '}
          {cast.hasFireBuff && cast.hasNatureBuff ? 'both' : 'one'}{' '}
          <SpellLink spell={TALENTS.FUSION_OF_ELEMENTS_TALENT} /> buff.
        </>,
      );
    }
  }

  get getExplanation() {
    return (
      <>
        <p>
          <SpellLink spell={TALENTS.FUSION_OF_ELEMENTS_TALENT} /> gives you two buffs when cast{' '}
          <SpellLink spell={TALENTS.ICEFURY_TALENT} />. You must cast a{' '}
          <span style={{ color: color(MAGIC_SCHOOLS.ids.NATURE) }}>nature</span> <i>and</i> a{' '}
          <span style={{ color: color(MAGIC_SCHOOLS.ids.FIRE) }}>fire</span> spell (or one that is
          both, such as <SpellLink spell={TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT} /> or{' '}
          <SpellLink spell={SPELLS.FLAME_SHOCK} />) to trigger a free{' '}
          <SpellLink spell={TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT} />.
        </p>
        <p>
          <SpellLink spell={TALENTS.ICEFURY_TALENT} /> should not be cast when you have{' '}
          <SpellLink spell={TALENTS.FUSION_OF_ELEMENTS_TALENT} /> buffs active, as this wastes
          potential free Elemental Blasts. Always consume both Fusion of Elements buffs before using
          Icefury.
        </p>
      </>
    );
  }

  guideSubsection() {
    if (!this.active) {
      return null;
    }

    // Create performances and uses only for Icefury casts
    const performances: BoxRowEntry[] = this.icefuryCasts.map((cast) => {
      const hasBuff = cast.hasFireBuff || cast.hasNatureBuff;
      return {
        value: hasBuff ? QualitativePerformance.Fail : QualitativePerformance.Perfect,
        tooltip: hasBuff ? (
          <>
            <SpellLink spell={TALENTS.ICEFURY_TALENT} /> cast with{' '}
            {cast.hasFireBuff && cast.hasNatureBuff ? 'both' : 'one'}{' '}
            <SpellLink spell={TALENTS.FUSION_OF_ELEMENTS_TALENT} /> buff
            {cast.hasFireBuff && cast.hasNatureBuff ? 's' : ''} active
          </>
        ) : (
          <>
            <SpellLink spell={TALENTS.ICEFURY_TALENT} /> cast with no{' '}
            <SpellLink spell={TALENTS.FUSION_OF_ELEMENTS_TALENT} /> buffs active
          </>
        ),
      };
    });

    const uses: SpellUse[] = this.icefuryCasts.map((cast) => {
      const hasBuff = cast.hasFireBuff || cast.hasNatureBuff;
      const performance = hasBuff ? QualitativePerformance.Fail : QualitativePerformance.Perfect;

      return {
        event: cast.event,
        checklistItems: [
          {
            timestamp: cast.event.timestamp,
            summary: hasBuff ? (
              <>
                Cast with <SpellLink spell={TALENTS.FUSION_OF_ELEMENTS_TALENT} /> buffs active
              </>
            ) : (
              <>
                Cast with no <SpellLink spell={TALENTS.FUSION_OF_ELEMENTS_TALENT} /> active
              </>
            ),
            check: 'fusion-buffs',
            performance: performance,
            details: (
              <div>
                {hasBuff ? (
                  <>
                    <SpellLink spell={TALENTS.ICEFURY_TALENT} /> was cast with{' '}
                    {cast.hasNatureBuff && (
                      <>
                        the <span style={{ color: color(MAGIC_SCHOOLS.ids.NATURE) }}>Nature</span>{' '}
                        <SpellLink spell={SPELLS.FUSION_OF_THE_ELEMENTS_NATURE_BUFF} /> buff
                      </>
                    )}
                    {cast.hasNatureBuff && cast.hasFireBuff && ' and'}
                    {cast.hasFireBuff && (
                      <>
                        the <span style={{ color: color(MAGIC_SCHOOLS.ids.FIRE) }}>Fire</span>{' '}
                        <SpellLink spell={SPELLS.FUSION_OF_THE_ELEMENTS_FIRE_BUFF} /> buff
                      </>
                    )}{' '}
                    active.
                  </>
                ) : (
                  <>
                    <SpellLink spell={TALENTS.ICEFURY_TALENT} /> was cast correctly with no{' '}
                    <SpellLink spell={TALENTS.FUSION_OF_ELEMENTS_TALENT} /> buffs active.
                  </>
                )}
              </div>
            ),
          },
        ],
        performance: hasBuff ? QualitativePerformance.Fail : QualitativePerformance.Perfect,
      };
    });

    return (
      <SpellUsageSubSection
        title={
          <>
            <SpellLink spell={TALENTS.ICEFURY_TALENT} /> with{' '}
            <SpellLink spell={TALENTS.FUSION_OF_ELEMENTS_TALENT} />
          </>
        }
        explanation={this.getExplanation}
        performances={performances}
        uses={uses}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
      >
        <TalentSpellText talent={TALENTS.FUSION_OF_ELEMENTS_TALENT}>
          <p>
            <ItemDamageDone amount={this.elementalBlastDamage} />
          </p>
          <p style={{ fontSize: 18 }}>
            {this.triggerCount} <SpellLink spell={TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT} />{' '}
            <small>trigger{this.triggerCount !== 1 ? 's' : ''}</small>
          </p>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default FusionOfElements;
