import { GuideProps, Section, SubSection } from 'interface/guide';
import talents from 'common/TALENTS/deathknight';
import spells from 'common/SPELLS/deathknight';
import CombatLogParser from './CombatLogParser';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { SpellLink } from 'interface';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import SPELLS from 'common/SPELLS';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Section title="Resource Use">
        <SubSection title="Runes">
          <span>
            Runes are Death Knight's primary resource. Instead of cooldowns on rotational abilities,
            you are prevented from spamming our strongest spells by the flow of Runes. You can have
            up to three runes recharging at once. You want to spend runes whenever you have 4 or
            more runes to make sure none are wasted. This chart shows your available Runes over the
            course of the fight.
            {modules.runeGraph.plot}
          </span>
        </SubSection>
        <SubSection title="Runic Power">
          <span>
            Runic Power is builder/spender resource for Death Knights. For Frost Death Knights, it
            is linked to Runes through <SpellLink spell={spells.RUNIC_EMPOWERMENT} />. Spending
            Runes grants Runic Power, and spending Runic Power can recover Runes. This makes it
            important to not waste Runic Power, both so you can maximize spender casts and to get
            more casts of your Rune based abilities. However, because Rune spenders are a higher
            priority than Runic Power spenders, it is okay to waste Runic Power if you are using the
            GCD on a Rune spender instead.
            {modules.runicPowerGraph.plot}
          </span>
        </SubSection>
        {info.combatant.hasTalent(talents.BREATH_OF_SINDRAGOSA_TALENT) && (
          <SubSection title="Resource Cooldowns">
            <span>
              Getting the most out of resource cooldowns while playing{' '}
              <SpellLink spell={talents.BREATH_OF_SINDRAGOSA_TALENT} />
              is crucial to achieving good performance with this build. You want to use your
              resource cooldowns as often as possible to maximize how many resources you can put
              into a single <SpellLink spell={talents.BREATH_OF_SINDRAGOSA_TALENT} /> cast without
              wasting any of the resources granted.
              {info.combatant.hasTalent(talents.HORN_OF_WINTER_TALENT) &&
                modules.hornOfWinter.guideCastBreakdown}
              {info.combatant.hasTalent(talents.EMPOWER_RUNE_WEAPON_TALENT) &&
                modules.empowerRuneWeapon.guideCastBreakdown}
            </span>
          </SubSection>
        )}
      </Section>
      <Section title="Proc Usage">
        <SubSection title="Killing Machine">
          {modules.killingMachineEfficiency.guideSubsection}
        </SubSection>
        <SubSection title="Rime">{modules.rimeEfficiency.guideSubsection}</SubSection>
      </Section>
      <Section title="Cooldowns">
        <CooldownsSubsection modules={modules} events={events} info={info} />
        <CooldownBreakdownSubsection modules={modules} events={events} info={info} />
      </Section>
      <PreparationSection />
    </>
  );
}

function CooldownsSubsection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <SubSection>
      <strong>Cooldown Graph</strong> - this graph shows when you used your cooldowns and how long
      you waited to use them again. Grey segments show when the spell was available, yellow segments
      show when the spell was cooling down. Red segments highlight times when you could have fit a
      whole extra use of the cooldown.
      {info.combatant.hasTalent(talents.PILLAR_OF_FROST_TALENT) && (
        <div className="flex-main chart" style={{ padding: 5 }}>
          <CastEfficiencyBar
            spellId={talents.PILLAR_OF_FROST_TALENT.id}
            gapHighlightMode={GapHighlight.FullCooldown}
          />
        </div>
      )}
      {/* adding reapers mark talent */}
      {info.combatant.hasTalent(talents.REAPERS_MARK_TALENT) && (
        <div className="flex-main chart" style={{ padding: 5 }}>
          <CastEfficiencyBar
            spellId={talents.REAPERS_MARK_TALENT.id}
            gapHighlightMode={GapHighlight.FullCooldown}
          />
        </div>
      )}
      <div className="flex-main chart" style={{ padding: 5 }}>
        <CastEfficiencyBar
          spellId={SPELLS.REMORSELESS_WINTER.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      </div>
      {info.combatant.hasTalent(talents.CHILL_STREAK_TALENT) && (
        <div className="flex-main chart" style={{ padding: 5 }}>
          <CastEfficiencyBar
            spellId={talents.CHILL_STREAK_TALENT.id}
            gapHighlightMode={GapHighlight.FullCooldown}
            useThresholds
          />
        </div>
      )}
      {info.combatant.hasTalent(talents.BREATH_OF_SINDRAGOSA_TALENT) && (
        <div className="flex-main chart" style={{ padding: 5 }}>
          <CastEfficiencyBar
            spellId={talents.BREATH_OF_SINDRAGOSA_TALENT.id}
            gapHighlightMode={GapHighlight.FullCooldown}
            useThresholds
          />
        </div>
      )}
      {info.combatant.hasTalent(talents.FROSTWYRMS_FURY_TALENT) && (
        <div className="flex-main chart" style={{ padding: 5 }}>
          <CastEfficiencyBar
            spellId={talents.FROSTWYRMS_FURY_TALENT.id}
            gapHighlightMode={GapHighlight.FullCooldown}
            useThresholds
          />
        </div>
      )}
      {info.combatant.hasTalent(talents.HORN_OF_WINTER_TALENT) && (
        <div className="flex-main chart" style={{ padding: 5 }}>
          <CastEfficiencyBar
            spellId={talents.HORN_OF_WINTER_TALENT.id}
            gapHighlightMode={GapHighlight.FullCooldown}
            useThresholds
          />
        </div>
      )}
      {info.combatant.hasTalent(talents.EMPOWER_RUNE_WEAPON_TALENT) && (
        <div className="flex-main chart" style={{ padding: 5 }}>
          <CastEfficiencyBar
            spellId={talents.EMPOWER_RUNE_WEAPON_TALENT.id}
            gapHighlightMode={GapHighlight.FullCooldown}
            useThresholds
          />
        </div>
      )}
    </SubSection>
  );
}

function CooldownBreakdownSubsection({
  modules,
  events,
  info,
}: GuideProps<typeof CombatLogParser>) {
  const hasBreath = info.combatant.hasTalent(talents.BREATH_OF_SINDRAGOSA_TALENT);
  return <SubSection>{hasBreath && modules.breathofSindragoa.guideCastBreakdown}</SubSection>;
}
