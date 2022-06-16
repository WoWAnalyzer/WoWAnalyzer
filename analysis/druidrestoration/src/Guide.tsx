import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { GuideProps, Section, SubSection } from 'interface/guide';

import CombatLogParser from './CombatLogParser';

export default function Guide({ modules }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Section title="Core Spells">
        <SubSection title="Rejuvenation">
          <b>
            <SpellLink id={SPELLS.REJUVENATION.id} />
          </b>{' '}
          is your primary filler spell and will almost always be your most cast spell. It can be
          used on injured raiders or even pre-cast on full health raiders if you know big damage is
          coming soon. Do not spam it unmotivated - you'll run yourself out of mana. You also
          shouldn't cast it on targets that already have a high duration Rejuvenation, as you will
          clip duration.
          <br />
          <b>
            {modules.prematureRejuvenations.earlyRefreshmentsPerMinute.toFixed(1)}{' '}
            <small>early Rejuvenation refreshes per minute</small>
          </b>
          <br />
          SHOW TIMELINE OF EARLY REFRESHES - ALSO HIGH OVERHEAL CASTS?
        </SubSection>
        <SubSection title="Wild Growth">
          <SpellLink id={SPELLS.WILD_GROWTH.id} /> is your best healing spell when multiple raiders
          are injured. It quickly heals a lot of damage, but has a high mana cost. You need to hit
          at least 3 injured targets for this to be mana efficient over just using{' '}
          <SpellLink id={SPELLS.REJUVENATION.id} />.
          <br />
          <br />
          {modules.wildGrowth.guideTimeline()}
        </SubSection>
        <SubSection title="Regrowth">
          <SpellLink id={SPELLS.REGROWTH.id} /> is for urgent spot healing. The HoT it applies is
          very weak - never pre-cast Regrowth. Regrowth is only efficient when its direct portion
          doesn't overheal. Exceptions are when Regrowth is free due to{' '}
          <SpellLink id={SPELLS.CLEARCASTING_BUFF.id} /> or cheap due to{' '}
          <SpellLink id={SPELLS.ABUNDANCE_TALENT.id} />
          <br />
          <br />
          GOOD RG COUNTER + CLEARCAST UTIL
        </SubSection>
        <SubSection title="Lifebloom">
          <SpellLink id={SPELLS.LIFEBLOOM_HOT_HEAL.id} /> can only be active on one target at time
          and provides similar throughput to Rejuvenation. However, it causes{' '}
          <SpellLink id={SPELLS.CLEARCASTING_BUFF.id} /> procs and so is a big benefit to your mana
          efficiency . It should always be active on a target - the tank is usually a safe bet.
          <br />
          {modules.lifebloom.subStatistic()}
        </SubSection>
        <SubSection title="Efflorescence">
          <SpellLink id={SPELLS.EFFLORESCENCE_CAST.id} /> is extremely mana efficient if you're good
          about placing it where raiders are standing. Under the boss is usually a safe bet. Aim to
          keep it active at all times.
          <br />
          {modules.efflorescence.subStatistic()}
        </SubSection>
        <SubSection title="Swiftmend">
          <SpellLink id={SPELLS.SWIFTMEND.id} /> is our emergency heal and it isn't very mana
          efficient - normally it should only be used to prevent an eminent death. However, if using{' '}
          <SpellLink id={SPELLS.SOUL_OF_THE_FOREST_TALENT_RESTORATION.id} /> or the Tier 4-piece (
          <SpellLink id={SPELLS.RESTO_DRUID_TIER_28_4P_SET_BONUS.id} />
          ), it should be used frequently in order to generate procs.
          <br />
          <br />
          CAST EFFIC (4P or SOTF only) / SOTF USAGE COUNTER?
        </SubSection>
      </Section>
      <Section title="Major Healing Cooldowns">
        <p>
          Resto Druids have access to a variety of powerful healing cooldowns. These cooldowns are
          very mana efficient and powerful, and you should aim to use them frequently. The
          effectiveness of your cooldowns will be greatly increased by "ramping" or pre-casting many{' '}
          <SpellLink id={SPELLS.REJUVENATION.id} /> and a <SpellLink id={SPELLS.WILD_GROWTH.id} />{' '}
          in order to maximize the number of <SpellLink id={SPELLS.MASTERY_HARMONY.id} /> stacks
          present when you activate your cooldown. Plan ahead by starting your ramp in the seconds
          before major raid damage hits.
          <br />
          <br />
          USAGE GRAPH FOR CONVOKE / FLOURISH / TRANQ - also show how well we did on ramping?
        </p>
      </Section>
      <Section title="Talents, Legendaries, and Covenant">
        <SubSection title="Tier 1 - CHOSEN TALENT GOES HERE">
          <SpellLink id={SPELLS.ABUNDANCE_TALENT.id} /> is the usual pick for Raiding. (BLURB ON HOW
          TO USE IT WITH RAMPS GOES HERE)
          <br />
          (STATS ON AVG STACKS PER RG CAST GOES HERE)
          <br />
          <br />
          <SpellLink id={SPELLS.NOURISH_TALENT.id} /> is undertuned and not currently picked in any
          content
          <br />
          <br />
          <SpellLink id={SPELLS.CENARION_WARD_TALENT.id} /> is the usual pick for Mythic+. It is a
          big mana efficient heal that should be used on cooldown on a target likely to be taking
          damage - the tank is a safe bet.
          <br />
          (STATS ON CAST EFFIC GOES HERE)
        </SubSection>
        <SubSection title="Tier 5 - CHOSEN TALENT GOES HERE">
          <SpellLink id={SPELLS.SOUL_OF_THE_FOREST_TALENT_RESTORATION.id} /> is the standard pick
          for Raiding and Mythic+. When picking this talent, <SpellLink id={SPELLS.SWIFTMEND.id} />{' '}
          is part of your standard rotation in order to generate procs. It is best to always consume
          the proc with <SpellLink id={SPELLS.WILD_GROWTH.id} />
          <br />
          (STATS ON WHAT PROCS WERE CONSUMED WITH)
          <br />
          <br />
          <SpellLink id={SPELLS.CULTIVATION_TALENT.id} /> is undertuned and not currently picked in
          any content
          <br />
          <br />
          <SpellLink id={SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id} /> is a strong pick for Raiding.
          Use it when available during high damage phases. (WHAT STATS TO SHOW HERE?)
        </SubSection>
        <SubSection title="Tier 6 - CHOSEN TALENT GOES HERE">
          <SpellLink id={SPELLS.INNER_PEACE_TALENT.id} /> is best in raid encounters where damage
          timers will allow you to benefit from the reduced cooldown, or in encounters where raiders
          are spread out and moving too much to benefit from Spring Blossoms.
          <br />
          (STATS ON IF PLAYER ACTUALLY MADE USE OF THE CDR)
          <br />
          <br />
          <SpellLink id={SPELLS.SPRING_BLOSSOMS_TALENT.id} /> is the standard pick for Raiding and
          Mythic+. Make sure to maintain high <SpellLink id={SPELLS.EFFLORESCENCE_CAST.id} /> uptime
          and you'll get strong extra healing from this talent.
          <br />
          <br />
          <SpellLink id={SPELLS.OVERGROWTH_TALENT.id} /> is terrible do not pick it.
        </SubSection>
        <SubSection title="Tier 7 - CHOSEN TALENT GOES HERE"></SubSection>
        <SubSection title="Legendary - CHOSEN LEGENDARY GOES HERE"></SubSection>
      </Section>
    </>
  );
}
