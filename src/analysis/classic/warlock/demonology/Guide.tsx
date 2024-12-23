import { GuideProps, Section, SubSection } from 'interface/guide';
import CombatLogParser from 'analysis/classic/warlock/demonology/CombatLogParser';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import { FoundationDowntimeSection } from 'interface/guide/foundation/FoundationDowntimeSection';
import Expansion from 'game/Expansion';
import SpellLink from 'interface/SpellLink';
import SPELLS from 'common/SPELLS/classic/warlock';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import Explanation from 'interface/guide/components/Explanation';
import { DoomguardSection } from './guide/DoomguardSection';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Section title="The ABC rule : Always Be Casting">
        <FoundationDowntimeSection />
      </Section>
      <CooldownsSection modules={modules} events={events} info={info} />
      <DoomguardSection modules={modules} events={events} info={info} />
      <PreparationSection expansion={Expansion.Cataclysm} />
    </>
  );
}

function CooldownsSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Use your cooldowns">
      <Explanation>
        <p>
          Demonology Warlocks rely on 3 major cooldowns : <SpellLink spell={SPELLS.METAMORPHOSIS} />
          , <SpellLink spell={SPELLS.DEMON_SOUL} /> and{' '}
          <SpellLink spell={SPELLS.SUMMON_DOOMGUARD} />, which all are{' '}
          <strong>insanely powerful</strong>.
          <br />
          Perfect cooldown usage is a combination of in-depth fight knowledge and player skill, to
          adapt to certain boss mechanics or certain kill times. However, it will mostly be better
          to use
          <strong>every cooldown available to you.</strong> than to postpone a cast and miss one.
        </p>
      </Explanation>
      <CooldownGraphSubsection />
    </Section>
  );
}

function CooldownGraphSubsection() {
  return (
    <SubSection>
      <strong>Cooldown Graph</strong> - this graph shows when you used cooldowns and how long you
      waited to use them again. Grey segments show when the spell was available, yellow segments
      show when the spell was cooling down, and red segments highlight times when you could have fit
      a whole extra use of the cooldown.
      <CastEfficiencyBar
        spellId={SPELLS.METAMORPHOSIS.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        useThresholds
      />
      <CastEfficiencyBar
        spellId={SPELLS.DEMON_SOUL.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        useThresholds
      />
      <CastEfficiencyBar
        spellId={SPELLS.SUMMON_DOOMGUARD.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        useThresholds
      />
    </SubSection>
  );
}
