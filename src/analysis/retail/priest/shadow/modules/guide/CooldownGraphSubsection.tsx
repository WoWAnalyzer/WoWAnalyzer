import { Talent } from 'common/TALENTS/types';
import Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';
import { SubSection, useAnalyzer, useInfo } from 'interface/guide';
import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS/priest';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { CooldownWindow, fromExecuteRange, GapHighlight } from 'parser/ui/CooldownBar';
import Voidbolt from '../spells/Voidbolt';
import ShadowWordDeath from '../spells/ShadowWordDeath';
import ItemSetLink from 'interface/ItemSetLink';
import { TIERS } from 'game/TIERS';
import { PRIEST_T31_ID } from 'common/ITEMS/dragonflight';

type Cooldown = {
  talent: Talent;
  extraTalents?: Talent[];
};

type SpellCooldown = {
  spell: Spell;
  activeWindows?: CooldownWindow[];
};

const coreCooldowns: SpellCooldown[] = [
  { spell: SPELLS.MIND_BLAST },
  { spell: TALENTS.SHADOW_WORD_DEATH_TALENT },
];

const coreCooldownsVB: SpellCooldown[] = [
  //you can't push VoidBolt to coreCooldowns later on without adding it multiple times when changing tabs, so we just use a different list
  { spell: SPELLS.MIND_BLAST },
  { spell: TALENTS.SHADOW_WORD_DEATH_TALENT },
  { spell: SPELLS.VOID_BOLT },
];

const shortCooldowns: Cooldown[] = [
  { talent: TALENTS.VOID_TORRENT_TALENT },
  { talent: TALENTS.MINDGAMES_TALENT },
  { talent: TALENTS.SHADOW_CRASH_TALENT },
];

const longCooldownsMB: Cooldown[] = [
  { talent: TALENTS.POWER_INFUSION_TALENT },
  { talent: TALENTS.DARK_ASCENSION_TALENT },
  { talent: TALENTS.VOID_ERUPTION_TALENT },
  { talent: TALENTS.MINDBENDER_SHADOW_TALENT },
];
const longCooldownsSF: Cooldown[] = [
  { talent: TALENTS.POWER_INFUSION_TALENT },
  { talent: TALENTS.DARK_ASCENSION_TALENT },
  { talent: TALENTS.VOID_ERUPTION_TALENT },
  { talent: TALENTS.SHADOWFIEND_TALENT },
];

const CoreCooldownsGraph = () => {
  const VoidboltAnalyzer = useAnalyzer(Voidbolt);
  const ShadowWordDeathAnalyzer = useAnalyzer(ShadowWordDeath);
  const info = useInfo();
  let coreCooldown = coreCooldowns;

  const message = (
    <p>
      <strong>
        <SpellLink spell={SPELLS.MIND_BLAST} />
      </strong>{' '}
      is a core spell that should be keept on cooldown as much as possible.
      <br />
      <strong>
        <SpellLink spell={TALENTS.SHADOW_WORD_DEATH_TALENT} />
      </strong>{' '}
      {info!.combatant.has4PieceByTier(TIERS.T31) && (
        <>
          should always be used on cooldown with{' '}
          <ItemSetLink id={PRIEST_T31_ID}> Amirdrassil 4 Piece</ItemSetLink> equppied.
        </>
      )}
      {!info!.combatant.has4PieceByTier(TIERS.T31) && (
        <>
          should be used during execute,{' '}
          {info!.combatant.hasTalent(TALENTS.DEATHSPEAKER_TALENT) && (
            <>
              and with <SpellLink spell={TALENTS.DEATHSPEAKER_TALENT} /> procs,{' '}
            </>
          )}
          {info!.combatant.hasTalent(TALENTS.INESCAPABLE_TORMENT_TALENT) && (
            <>
              and during <SpellLink spell={TALENTS.MINDBENDER_SHADOW_TALENT} /> with{' '}
              <SpellLink spell={TALENTS.INESCAPABLE_TORMENT_TALENT} /> talented.
            </>
          )}
        </>
      )}
      <br />
      {info!.combatant.hasTalent(TALENTS.VOID_ERUPTION_TALENT) && (
        <>
          <strong>
            {' '}
            <SpellLink spell={SPELLS.VOID_BOLT} />{' '}
          </strong>{' '}
          is a powerful spell that should be cast on cooldown while you have access to it during{' '}
          <SpellLink spell={SPELLS.VOIDFORM} />
          <br />
        </>
      )}
    </p>
  );

  if (info!.combatant.hasTalent(TALENTS.VOID_ERUPTION_TALENT)) {
    coreCooldown = coreCooldownsVB;
    // not the prettiest solution, but functional
    coreCooldown.find((cd) => cd.spell.id === SPELLS.VOID_BOLT.id)!.activeWindows =
      VoidboltAnalyzer?.executeRanges.map(fromExecuteRange);
  }

  coreCooldown.find((cd) => cd.spell.id === TALENTS.SHADOW_WORD_DEATH_TALENT.id)!.activeWindows =
    ShadowWordDeathAnalyzer?.executeRanges.map(fromExecuteRange);

  // If the found Ranges overlap, the graph visuals stack.
  // This happens often for SW:D because every enemy below the threshold creates a highlight
  // to fix this, we combine overlaping regions
  // In order to combine them, we have to sort them (I do not know why the timestamps are not in order)
  // This could instead be done in CastEfficencyBar, but I am not confiedent enough that this works universally to do so.

  const cdIndex = coreCooldown.findIndex(
    (cd) => cd.spell.id === TALENTS.SHADOW_WORD_DEATH_TALENT.id,
  );
  const highlights = ShadowWordDeathAnalyzer?.executeRanges.map(fromExecuteRange);

  highlights?.sort((a, b) => a.startTime - b.startTime);

  if (highlights != null && highlights.length > 0) {
    const combined = [highlights[0]];
    for (let i = 1; i < highlights.length; i = i + 1) {
      const currentRange = combined[combined.length - 1];
      const nextRange = highlights[i];
      if (nextRange.startTime <= currentRange.endTime) {
        currentRange.endTime = Math.max(currentRange.endTime, nextRange.endTime);
      } else {
        combined.push(nextRange);
      }
    }
    coreCooldown[cdIndex].activeWindows = combined;
  }
  return CoreCooldownGraphSubsection(coreCooldown, message);
};

const ShortCooldownsGraph = () => {
  const info = useInfo();

  const message = (
    <p>
      {info!.combatant.hasTalent(TALENTS.VOID_TORRENT_TALENT) && (
        <>
          <strong>
            <SpellLink spell={TALENTS.VOID_TORRENT_TALENT} />
          </strong>{' '}
          is a powerful spell that should be used as often as possible with{' '}
          <SpellLink spell={TALENTS.DEVOURING_PLAGUE_TALENT} /> on its target. It should be
          channeled for its full duration.
          <br />
        </>
      )}

      {info!.combatant.hasTalent(TALENTS.MINDGAMES_TALENT) && (
        <>
          <strong>
            <SpellLink spell={TALENTS.MINDGAMES_TALENT} />
          </strong>{' '}
          is a lower priority spell, but when it is cast, make sure{' '}
          <SpellLink spell={TALENTS.DEVOURING_PLAGUE_TALENT} /> is on its target so it benefits
          fully from <SpellLink spell={SPELLS.MASTERY_SHADOW_WEAVING} />.
        </>
      )}

      {info!.combatant.hasTalent(TALENTS.SHADOW_CRASH_TALENT) && (
        <>
          <strong>
            <SpellLink spell={TALENTS.SHADOW_CRASH_TALENT} />
          </strong>{' '}
          is used to apply and refresh <SpellLink spell={SPELLS.VAMPIRIC_TOUCH} />. This can be held
          if it would allow you to apply your dots to more targets.
          <br />
          {info!.combatant.has4PieceByTier(TIERS.T31) && (
            <>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <SpellLink spell={TALENTS.SHADOW_CRASH_TALENT} /> should also be used to spend stacks
              of <SpellLink spell={SPELLS.SHADOW_PRIEST_TIER_31_4_SET_BUFF} /> from{' '}
              <ItemSetLink id={PRIEST_T31_ID}> Amirdrassil 4 Piece </ItemSetLink>{' '}
            </>
          )}
        </>
      )}
    </p>
  );
  return CooldownGraphSubsection(shortCooldowns, message);
};

const LongCooldownsGraph = () => {
  const info = useInfo();
  let longCooldowns = longCooldownsSF;
  if (info!.combatant.hasTalent(TALENTS.MINDBENDER_SHADOW_TALENT)) {
    longCooldowns = longCooldownsMB;
  }

  const message = (
    <p>
      <strong>Major Cooldowns</strong> - this graph shows when you used your cooldowns and how long
      you waited to use them again. You should use these cooldowns together when possible to
      maximize the damage they can deal, without missing any possible casts in the encounter.
    </p>
  );
  return CooldownGraphSubsection(longCooldowns, message);
};

const CooldownGraphSubsection = (cooldownsToCheck: Cooldown[], message: JSX.Element) => {
  const info = useInfo();
  const castEfficiency = useAnalyzer(CastEfficiency);
  if (!info || !castEfficiency) {
    return null;
  }

  const cooldowns = cooldownsToCheck.filter((cooldown) => {
    const hasTalent = info.combatant.hasTalent(cooldown.talent);
    const hasExtraTalents =
      cooldown.extraTalents?.reduce(
        (acc, talent) => acc && info.combatant.hasTalent(talent),
        true,
      ) ?? true;
    return hasTalent && hasExtraTalents;
  });
  const hasTooManyCasts = cooldowns.some((cooldown) => {
    const casts = castEfficiency.getCastEfficiencyForSpell(cooldown.talent)?.casts ?? 0;
    return casts >= 10;
  });

  return (
    <SubSection>
      {message}

      {cooldowns.map((cooldownCheck) => (
        <CastEfficiencyBar
          key={cooldownCheck.talent.id}
          spellId={cooldownCheck.talent.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          minimizeIcons={hasTooManyCasts}
          useThresholds
        />
      ))}
    </SubSection>
  );
};

const CoreCooldownGraphSubsection = (cooldownsToCheck: SpellCooldown[], message: JSX.Element) => {
  const info = useInfo();
  const castEfficiency = useAnalyzer(CastEfficiency);
  if (!info || !castEfficiency) {
    return null;
  }
  const cooldowns = cooldownsToCheck;

  const hasTooManyCasts = cooldowns.some((cooldown) => {
    const casts = castEfficiency.getCastEfficiencyForSpell(cooldown.spell)?.casts ?? 0;
    return casts >= 10;
  });

  return (
    <SubSection>
      {message}

      {cooldowns.map((cooldownCheck) => (
        <CastEfficiencyBar
          key={cooldownCheck.spell.id}
          spellId={cooldownCheck.spell.id}
          gapHighlightMode={GapHighlight.None}
          minimizeIcons={hasTooManyCasts}
          useThresholds
          activeWindows={cooldownCheck.activeWindows}
        />
      ))}
    </SubSection>
  );
};

export default { CoreCooldownsGraph, ShortCooldownsGraph, LongCooldownsGraph };
