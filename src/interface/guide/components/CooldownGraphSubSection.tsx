import Spell from 'common/SPELLS/Spell';
import Combatant from 'parser/core/Combatant';
import { SubSection, useAnalyzer, useInfo } from 'interface/guide/index';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';

/**
 * Represents a cooldown that we might want to have show up in the graph. Example:
 *
 * @example
 *   {
 *     spell: TALENTS.WAKE_OF_ASHES_TALENT,
 *     isActive: (c) => c.hasTalent(TALENTS.WAKE_OF_ASHES_TALENT),
 *   },
 */
export type Cooldown = {
  spell: Spell;
  isActive?: (c: Combatant) => boolean;
};

type CooldownGraphSubsectionProps = {
  /**
   * Any cooldowns that we want to render in our graph.
   */
  cooldowns: Cooldown[];
  /**
   * A title that we may want to render as part of the subsection.
   */
  title?: string;
  /**
   * How many casts of a spell will remove its icon from the graph? Defaults to 10.
   */
  tooManyCasts?: number;
};

/**
 * Renders a subsection for a Guide that contains cast efficiency information about cooldowns that
 * were used during a fight.
 *
 * Needs a list of {@link Cooldown}s so that it can properly process them.
 */
const CooldownGraphSubsection = ({
  cooldowns,
  title,
  tooManyCasts = 10,
}: CooldownGraphSubsectionProps) => {
  const info = useInfo();
  const castEfficiency = useAnalyzer(CastEfficiency);
  if (!info || !castEfficiency) {
    return null;
  }

  const activeCooldowns = cooldowns.filter(
    (cooldown) => cooldown.isActive?.(info.combatant) ?? true,
  );
  const hasTooManyCasts = activeCooldowns.some((cooldown) => {
    const casts = castEfficiency.getCastEfficiencyForSpell(cooldown.spell)?.casts ?? 0;
    return casts >= tooManyCasts;
  });

  return (
    <SubSection title={title}>
      <strong>Cooldown Graph</strong> - this graph shows when you used your cooldowns and how long
      you waited to use them again. Grey segments show when the spell was available, yellow segments
      show when the spell was cooling down. Red segments highlight times when you could have fit a
      whole extra use of the cooldown.
      {activeCooldowns.map((cooldownCheck) => (
        <CastEfficiencyBar
          key={cooldownCheck.spell.id}
          spell={cooldownCheck.spell}
          gapHighlightMode={GapHighlight.FullCooldown}
          minimizeIcons={hasTooManyCasts}
          useThresholds
        />
      ))}
    </SubSection>
  );
};

export default CooldownGraphSubsection;
