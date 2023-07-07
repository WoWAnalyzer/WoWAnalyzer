import { GuideProps } from 'interface/guide';
import CombatLogParser from 'analysis/classic/warlock/demonology/CombatLogParser';
import { PerformanceLabel } from 'parser/ui/PerformanceLabel';
import { formatPercentage } from 'common/format';
import { SpellLink, TooltipElement } from 'interface';
import SPELLS from 'common/SPELLS/classic/warlock';

function CastingSubsection({ modules }: GuideProps<typeof CombatLogParser>) {
  const abcMod = modules.alwaysBeCasting;
  const activePercent = formatPercentage(abcMod.activeTimePercentage, 1);
  const cancelledMod = modules.cancelledCasts;
  const cancelledPercent = formatPercentage(cancelledMod.cancelledPercentage, 1);
  return (
    <>
      <div>
        <b>
          <SpellLink spell={SPELLS.SHADOW_BOLT} />
        </b>{' '}
        |{' '}
        <b>
          <SpellLink spell={SPELLS.INCINERATE} />
        </b>{' '}
        |{' '}
        <b>
          <SpellLink spell={SPELLS.SOUL_FIRE} />
        </b>
      </div>
      <div>
        Demo Warlocks use filler spells when all DoTs and Debuffs are applied. Your go-to filler
        spell is <SpellLink spell={SPELLS.SHADOW_BOLT} />. It should be used to provide{' '}
        <SpellLink spell={SPELLS.SHADOW_MASTERY_DEBUFF} /> for the raid. When{' '}
        <SpellLink spell={SPELLS.MOLTEN_CORE_BUFF} /> procs from{' '}
        <SpellLink spell={SPELLS.CORRUPTION} />, use <SpellLink spell={SPELLS.INCINERATE} />. When
        your target falls below 35% health, you receive <SpellLink spell={SPELLS.DECIMATION} />{' '}
        which is used to cast <SpellLink spell={SPELLS.SOUL_FIRE} /> faster and without the cost of
        a Soul Shard.
      </div>
      <hr />
      <div>
        <b>Always Be Casting (ABC)</b> throughout the encounter. When moving, use your instant
        abilities or set up{' '}
        <SpellLink spell={SPELLS.DEMONIC_CIRCLE_TELEPORT} icon>
          Demonic Circle{' '}
        </SpellLink>{' '}
        to reduce your movement.
      </div>
      <small>
        Some fights have unavoidable downtime due to events like phase transitions. In these cases,
        keep active as much as possible.
      </small>
      <div>
        <b>Active Time</b>:{' '}
        <PerformanceLabel performance={abcMod.DowntimePerformance}>
          {activePercent}%
        </PerformanceLabel>
      </div>
      <b>Cancelled Casts</b>:{' '}
      <PerformanceLabel performance={cancelledMod.CancelledPerformance}>
        <TooltipElement
          content={
            <>
              You cast {cancelledMod.totalCasts} spells:
              <ul>
                <li>{cancelledMod.castsFinished} completed</li>
                <li>{cancelledMod.castsCancelled} cancelled</li>
              </ul>
            </>
          }
        >
          {cancelledPercent}%
        </TooltipElement>
      </PerformanceLabel>
    </>
  );
}

export default { CastingSubsection };
