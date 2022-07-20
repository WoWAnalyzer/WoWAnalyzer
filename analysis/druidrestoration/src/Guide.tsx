import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { SpellLink } from 'interface';
import { GradiatedPerformanceBar, GuideProps, Section, SubSection } from 'interface/guide';
import { CooldownBar } from 'parser/ui/CooldownBar';

import CombatLogParser from './CombatLogParser';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <CoreSpellSection modules={modules} events={events} info={info} />
      <CooldownsSection modules={modules} events={events} info={info} />
    </>
  );
}

function CoreSpellSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Core Spells">
      <RejuvenationSubsection modules={modules} events={events} info={info} />
      <WildGrowthSubsection modules={modules} events={events} info={info} />
      <RegrowthSubsection modules={modules} events={events} info={info} />
      <LifebloomSubsection modules={modules} events={events} info={info} />
      <EfflorescenceSubsection modules={modules} events={events} info={info} />
      <SwiftmendSubsection modules={modules} events={events} info={info} />
      {info.combatant.hasTalent(SPELLS.CENARION_WARD_TALENT) && (
        <CenarionWardSubsection modules={modules} events={events} info={info} />
      )}
    </Section>
  );
}

function RejuvenationSubsection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  const goodRejuvs = {
    count: modules.prematureRejuvenations.goodRejuvs,
    label: 'Good Rejuvenations',
  };
  const highOverhealRejuvs = {
    count: modules.prematureRejuvenations.highOverhealCasts,
    label: 'High-overheal Rejuvenations',
  };
  const clippedRejuvs = {
    count: modules.prematureRejuvenations.earlyRefreshments,
    label: 'Clipped duration Rejuvenations',
  };
  return (
    <SubSection title="">
      <b>
        <SpellLink id={SPELLS.REJUVENATION.id} />
      </b>{' '}
      is your primary filler spell and will almost always be your most cast spell. It can be used on
      injured raiders or even pre-cast on full health raiders if you know big damage is coming soon.
      Do not spam it unmotivated - you'll run yourself out of mana. You also shouldn't cast it on
      targets that already have a high duration Rejuvenation, as you will clip duration. Note that
      some high-overheal Rejuvs are unavoidable due to heal sniping, but if a large proportion of
      them are, you might be casting too much.
      <p />
      <strong>Rejuvenation cast breakdown</strong>
      <small>
        {' '}
        - Green is a good cast, Yellow is a cast with very high overheal, and Red is an early
        refresh that clipped duration. Mouseover for more details.
      </small>
      <br />
      <GradiatedPerformanceBar good={goodRejuvs} ok={highOverhealRejuvs} bad={clippedRejuvs} />
    </SubSection>
  );
}

function WildGrowthSubsection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <SubSection title="">
      <b>
        <SpellLink id={SPELLS.WILD_GROWTH.id} />
      </b>{' '}
      is your best healing spell when multiple raiders are injured. It quickly heals a lot of
      damage, but has a high mana cost. Use Wild Growth over Rejuvenation if there are at least 3
      injured targets. Remember that only allies within 30 yds of the primary target can be hit -
      don't cast this on an isolated player!
      <p />
      <strong>Wild Growth casts</strong>
      <small>
        {' '}
        - Green is a good cast, Red was effective on fewer than three targets. A hit is considered
        "ineffective" if over the first 3 seconds it did more than 50% overhealing. Mouseover boxes
        for details.
      </small>
      {modules.wildGrowth.guideTimeline}
    </SubSection>
  );
}

function RegrowthSubsection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  const hasAbundance = info.combatant.hasTalent(SPELLS.ABUNDANCE_TALENT);
  return (
    <SubSection title="">
      <b>
        <SpellLink id={SPELLS.REGROWTH.id} />
      </b>{' '}
      is for urgent spot healing. The HoT it applies is very weak, meaning Regrowth is only
      efficient when its direct portion is effective. Exceptions are when Regrowth is free due to{' '}
      <SpellLink id={SPELLS.CLEARCASTING_BUFF.id} /> /{' '}
      <SpellLink id={SPELLS.NATURES_SWIFTNESS.id} />{' '}
      {hasAbundance && (
        <>
          or cheap due to <SpellLink id={SPELLS.ABUNDANCE_TALENT.id} />.<p />
          Even with <SpellLink id={SPELLS.ABUNDANCE_TALENT.id} /> you still shouldn't cast Regrowth
          during your ramp. Wait until after you <SpellLink id={SPELLS.CONVOKE_SPIRITS.id} /> or{' '}
          <SpellLink id={SPELLS.FLOURISH_TALENT.id} />, then you can fill with high-stack Regrowth
          casts.
        </>
      )}
      <p />
      <strong>Regrowth casts</strong>
      <small>
        {' '}
        - Green is a good cast, Red is a bad cast (at full mana cost on a high health target).
        Mouseover boxes for details.
      </small>
      {modules.regrowthAndClearcasting.guideTimeline}
    </SubSection>
  );
}

function LifebloomSubsection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <SubSection title="">
      <b>
        <SpellLink id={SPELLS.LIFEBLOOM_HOT_HEAL.id} />
      </b>{' '}
      can only be active on one target at time and provides similar throughput to Rejuvenation.
      However, it causes <SpellLink id={SPELLS.CLEARCASTING_BUFF.id} /> procs and so is a big
      benefit to your mana efficiency . It should always be active on a target - the tank is usually
      a safe bet.
      <p />
      {modules.lifebloom.subStatistic()}
    </SubSection>
  );
}

function EfflorescenceSubsection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <SubSection title="">
      <b>
        <SpellLink id={SPELLS.EFFLORESCENCE_CAST.id} />
      </b>{' '}
      is extremely mana efficient if you're good about placing it where raiders are standing. Under
      the boss is usually a safe bet. While it's acceptable to let it drop during heavy movement,
      you should otherwise aim to keep it active at all times.
      <p />
      {modules.efflorescence.subStatistic()}
    </SubSection>
  );
}

function SwiftmendSubsection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  const hasSotf = info.combatant.hasTalent(SPELLS.SOUL_OF_THE_FOREST_TALENT_RESTORATION);
  const hasVi = info.combatant.hasLegendary(SPELLS.VERDANT_INFUSION);
  const has4p = info.combatant.has4Piece();
  const procCount = (hasSotf ? 1 : 0) + (hasVi ? 1 : 0) + (has4p ? 1 : 0);
  const chartDescription = ` - ${
    hasVi ? 'Blue is great (extended high value HoTs), ' : ''
  }Green is a fine cast, ${procCount > 0 ? 'Yellow' : 'Red'} is a non-triage (>50% health) cast${
    hasVi ? '' : ' that removes a WG or Rejuv'
  }${procCount ? ' (still acceptable for generating procs)' : ''}.  Mouseover for more details.`;
  return (
    <SubSection title="">
      <b>
        <SpellLink id={SPELLS.SWIFTMEND.id} />
      </b>{' '}
      is our emergency heal but it removes a HoT on its target, hurting overall throughput. Normally
      it should only be used on targets who need urgent healing.
      <br />
      {procCount === 1 && `However, you have a proc that is generated by casting Swiftmend: `}
      {procCount > 1 && `However, you have procs that are generated by casting Swiftmend: `}
      {hasSotf && (
        <>
          <SpellLink id={SPELLS.SOUL_OF_THE_FOREST_TALENT_RESTORATION.id} />
          &nbsp;
        </>
      )}
      {hasVi && (
        <>
          <SpellLink id={SPELLS.VERDANT_INFUSION.id} />
          &nbsp;
        </>
      )}
      {has4p && (
        <>
          <SpellLink id={SPELLS.RESTO_DRUID_TIER_28_4P_SET_BONUS.id} /> (the Tier 4pc)&nbsp;
        </>
      )}
      {procCount > 0 && (
        <>
          {procCount === 1 ? `This ability is ` : `These abilities are `}very powerful, so you
          should cast Swiftmend frequently in order to generate procs - even on targets who don't
          need urgent healing.
        </>
      )}
      <p />
      <strong>Swiftmend casts</strong>
      <small>{chartDescription}</small>
      {modules.swiftmend.guideTimeline}
      {info.combatant.hasTalent(SPELLS.SOUL_OF_THE_FOREST_TALENT_RESTORATION) && (
        <>
          <p />
          <strong>
            <SpellLink id={SPELLS.SOUL_OF_THE_FOREST_TALENT_RESTORATION.id} />
          </strong>{' '}
          procs are generated by casting Swiftmend. Consuming the proc with{' '}
          <SpellLink id={SPELLS.WILD_GROWTH.id} /> is by far the highest value, but if only a single
          target needs big healing it's acceptable to use <SpellLink id={SPELLS.REJUVENATION.id} />{' '}
          or <SpellLink id={SPELLS.REGROWTH.id} />. <SpellLink id={SPELLS.CONVOKE_SPIRITS.id} /> can
          both generate and consume procs - you should always use your proc before casting Convoke
          to avoid overwriting or consuming on a bad target. Never let a proc expire.
          <p />
          <strong>Soul of the Forest usage</strong>
          <small>
            {' '}
            - Green is a Wild Growth use, Yellow is a Rejuvenation or Regrowth use, and Red is an
            expired or overwritten proc. Mouseover for more details.
          </small>
          {modules.soulOfTheForest.guideTimeline}
        </>
      )}
    </SubSection>
  );
}

function CenarionWardSubsection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <SubSection title="">
      <b>
        <SpellLink id={SPELLS.CENARION_WARD_TALENT.id} />
      </b>{' '}
      is a talented HoT on a short cooldown. It is extremely powerful and efficient and should be
      cast virtually on cooldown. A tank is usually the best target.
      <br />
      <br />
      <strong>Cenarion Ward usage and cooldown</strong>
      <div className="flex-main chart" style={{ padding: 5 }}>
        <CooldownBar
          spellId={SPELLS.CENARION_WARD_TALENT.id}
          events={events}
          info={info}
          highlightGaps
        />
      </div>
    </SubSection>
  );
}

function CooldownsSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Healing Cooldowns">
      <p>
        Resto Druids have access to a variety of powerful healing cooldowns. These cooldowns are
        very mana efficient and powerful, and you should aim to use them frequently. The
        effectiveness of your cooldowns will be greatly increased by "ramping" or pre-casting many{' '}
        <SpellLink id={SPELLS.REJUVENATION.id} /> and a <SpellLink id={SPELLS.WILD_GROWTH.id} /> in
        order to maximize the number of <SpellLink id={SPELLS.MASTERY_HARMONY.id} /> stacks present
        when you activate your cooldown. Plan ahead by starting your ramp in the seconds before
        major raid damage hits. You should always have a Wild Growth out before activating one of
        your cooldowns.
      </p>
      <HotGraphSubsection modules={modules} events={events} info={info} />
      <CooldownGraphSubsection modules={modules} events={events} info={info} />
      <CooldownBreakdownSubsection modules={modules} events={events} info={info} />
    </Section>
  );
}

function HotGraphSubsection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <SubSection title="">
      <strong>HoT Graph</strong> - this graph shows how many Rejuvenation and Wild Growths you had
      active over the course of the encounter, with rule lines showing when you activated your
      healing cooldowns. Did you have a Wild Growth out before every cooldown? Did you ramp
      Rejuvenations well before big damage?
      {modules.hotCountGraph.plot}
    </SubSection>
  );
}

function CooldownGraphSubsection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <SubSection title="">
      <strong>Cooldown Graph</strong> - this graph shows when you used your cooldowns and how long
      you waited to use them again. Grey segments show when the spell was available, yellow segments
      show when the spell was cooling down. Red segments highlight times when you could have fit a
      whole extra use of the cooldown.
      {info.combatant.hasCovenant(COVENANTS.NIGHT_FAE.id) && (
        <div className="flex-main chart" style={{ padding: 5 }}>
          <CooldownBar
            spellId={SPELLS.CONVOKE_SPIRITS.id}
            events={events}
            info={info}
            highlightGaps
          />
        </div>
      )}
      {info.combatant.hasTalent(SPELLS.FLOURISH_TALENT.id) && (
        <div className="flex-main chart" style={{ padding: 5 }}>
          <CooldownBar
            spellId={SPELLS.FLOURISH_TALENT.id}
            events={events}
            info={info}
            highlightGaps
          />
        </div>
      )}
      {info.combatant.hasTalent(SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id) && (
        <div className="flex-main chart" style={{ padding: 5 }}>
          <CooldownBar
            spellId={SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id}
            events={events}
            info={info}
            highlightGaps
          />
        </div>
      )}
      <div className="flex-main chart" style={{ padding: 5 }}>
        <CooldownBar
          spellId={SPELLS.TRANQUILITY_CAST.id}
          events={events}
          info={info}
          highlightGaps
        />
      </div>
      <div className="flex-main chart" style={{ padding: 5 }}>
        <CooldownBar spellId={SPELLS.INNERVATE.id} events={events} info={info} highlightGaps />
      </div>
    </SubSection>
  );
}

function CooldownBreakdownSubsection({
  modules,
  events,
  info,
}: GuideProps<typeof CombatLogParser>) {
  return (
    <SubSection title="">
      <strong>Spell Breakdowns</strong> - evaluate your performance for each cooldown use
      <br /> <strong>COMING SOON</strong>
    </SubSection>
  );
}
