import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { SpellLink } from 'interface';
import { GradiatedPerformanceBar, GuideProps, Section, SubSection } from 'interface/guide';
import CooldownBar from 'parser/ui/CooldownBar';

import CombatLogParser from './CombatLogParser';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Section title="Core Spells">
        <SubSection title="">
          <b>
            <SpellLink id={SPELLS.REJUVENATION.id} />
          </b>{' '}
          is your primary filler spell and will almost always be your most cast spell. It can be
          used on injured raiders or even pre-cast on full health raiders if you know big damage is
          coming soon. Do not spam it unmotivated - you'll run yourself out of mana. You also
          shouldn't cast it on targets that already have a high duration Rejuvenation, as you will
          clip duration. Note that high-overheal Rejuvs are unavoidable due to heal sniping, but if
          a high proportion of them are high-overheal, you might be casting too much.
          <br />
          <br />
          <strong>Rejuvenation cast breakdown</strong>
          <small>
            {' '}
            - Green is a good cast, Yellow was a cast with very high overheal, and Red is an early
            refresh that clipped duration. Mouseover for more details.
          </small>
          <br />
          <GradiatedPerformanceBar
            good={{ count: modules.prematureRejuvenations.goodRejuvs, label: 'Good Rejuvenations' }}
            ok={{
              count: modules.prematureRejuvenations.highOverhealCasts,
              label: 'High-overheal Rejuvenations',
            }}
            bad={{
              count: modules.prematureRejuvenations.earlyRefreshments,
              label: 'Clipped duration Rejuvenations',
            }}
          />
        </SubSection>
        <SubSection title="">
          <b>
            <SpellLink id={SPELLS.WILD_GROWTH.id} />
          </b>{' '}
          is your best healing spell when multiple raiders are injured. It quickly heals a lot of
          damage, but has a high mana cost. You need to hit at least 3 injured targets for this to
          be mana efficient over just using <SpellLink id={SPELLS.REJUVENATION.id} />.
          <br />
          <br />
          <strong>Wild Growth casts</strong>
          <small>
            {' '}
            - Green is a good cast, Red was effective on fewer than three targets. A hit is
            considered "ineffective" if over the first 3 seconds it did more than 50% overhealing.
            Mouseover boxes for details.
          </small>
          {modules.wildGrowth.guideTimeline}
        </SubSection>
        <SubSection title="">
          <b>
            <SpellLink id={SPELLS.REGROWTH.id} />
          </b>{' '}
          is for urgent spot healing. The HoT it applies is very weak - never pre-cast Regrowth.
          Regrowth is only efficient when its direct portion doesn't overheal. Exceptions are when
          Regrowth is free due to <SpellLink id={SPELLS.CLEARCASTING_BUFF.id} /> or cheap due to{' '}
          <SpellLink id={SPELLS.ABUNDANCE_TALENT.id} />
          <br />
          <br />
          <strong>Regrowth casts</strong>
          <small>
            {' '}
            - Green is a good cast, Red is a bad cast (at full mana cost on a high health target).
            Mouseover boxes for details.
          </small>
          {modules.clearcasting.guideTimeline}
        </SubSection>
        <SubSection title="">
          <b>
            <SpellLink id={SPELLS.LIFEBLOOM_HOT_HEAL.id} />
          </b>{' '}
          can only be active on one target at time and provides similar throughput to Rejuvenation.
          However, it causes <SpellLink id={SPELLS.CLEARCASTING_BUFF.id} /> procs and so is a big
          benefit to your mana efficiency . It should always be active on a target - the tank is
          usually a safe bet.
          <br />
          {modules.lifebloom.subStatistic()}
        </SubSection>
        <SubSection title="">
          <b>
            <SpellLink id={SPELLS.EFFLORESCENCE_CAST.id} />
          </b>{' '}
          is extremely mana efficient if you're good about placing it where raiders are standing.
          Under the boss is usually a safe bet. Aim to keep it active at all times.
          <br />
          {modules.efflorescence.subStatistic()}
        </SubSection>
        <SubSection title="">
          <b>
            <SpellLink id={SPELLS.SWIFTMEND.id} />
          </b>{' '}
          is our emergency heal and it isn't very mana efficient - normally it should only be used
          to prevent an eminent death. However, if using{' '}
          <SpellLink id={SPELLS.SOUL_OF_THE_FOREST_TALENT_RESTORATION.id} /> or the Tier 4-piece (
          <SpellLink id={SPELLS.RESTO_DRUID_TIER_28_4P_SET_BONUS.id} />
          ), it should be used frequently in order to generate procs.
          <br />
          <br />
          TODO explanation of this cooldown bar... highlight gaps when player has SotF or 4pc?
          <div className="flex-main chart" style={{ padding: 5 }}>
            <CooldownBar spellId={SPELLS.SWIFTMEND.id} events={events} info={info} />
          </div>
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
          before major raid damage hits. You should always have a Wild Growth out before activating
          one of your cooldowns.
          <br />
          <br />
          <strong>HoT Graph</strong> - this graph shows how many Rejuvenation and Wild Growths you
          had active over the course of the encounter, with rule lines showing when you activated
          your healing cooldowns. Did you have a Wild Growth out before every cooldown? Did you ramp
          Rejuvenations well before big damage?
          {modules.hotCountGraph.plot}
          <br />
          <br />
          <strong>Cooldown Graph</strong> - this graph when you used your cooldowns and how long you
          waited to use them again. Grey segments show when the spell was available, yellow segments
          show when the spell was cooling down. Red segments highlight times when you could have fit
          a whole extra use of the cooldown.
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
        </p>
      </Section>
      {/*<Section title="Talents, Legendaries, and Covenant">*/}
      {/*  <SubSection title="Tier 1 - CHOSEN TALENT GOES HERE">*/}
      {/*    <SpellLink id={SPELLS.ABUNDANCE_TALENT.id} /> is the usual pick for Raiding. (BLURB ON HOW*/}
      {/*    TO USE IT WITH RAMPS GOES HERE)*/}
      {/*    <br />*/}
      {/*    (STATS ON AVG STACKS PER RG CAST GOES HERE)*/}
      {/*    <br />*/}
      {/*    <br />*/}
      {/*    <SpellLink id={SPELLS.NOURISH_TALENT.id} /> is undertuned and not currently picked in any*/}
      {/*    content*/}
      {/*    <br />*/}
      {/*    <br />*/}
      {/*    <SpellLink id={SPELLS.CENARION_WARD_TALENT.id} /> is the usual pick for Mythic+. It is a*/}
      {/*    big mana efficient heal that should be used on cooldown on a target likely to be taking*/}
      {/*    damage - the tank is a safe bet.*/}
      {/*    <br />*/}
      {/*    (STATS ON CAST EFFIC GOES HERE)*/}
      {/*  </SubSection>*/}
      {/*  <SubSection title="Tier 5 - CHOSEN TALENT GOES HERE">*/}
      {/*    <SpellLink id={SPELLS.SOUL_OF_THE_FOREST_TALENT_RESTORATION.id} /> is the standard pick*/}
      {/*    for Raiding and Mythic+. When picking this talent, <SpellLink id={SPELLS.SWIFTMEND.id} />{' '}*/}
      {/*    is part of your standard rotation in order to generate procs. It is best to always consume*/}
      {/*    the proc with <SpellLink id={SPELLS.WILD_GROWTH.id} />*/}
      {/*    <br />*/}
      {/*    (STATS ON WHAT PROCS WERE CONSUMED WITH)*/}
      {/*    <br />*/}
      {/*    <br />*/}
      {/*    <SpellLink id={SPELLS.CULTIVATION_TALENT.id} /> is undertuned and not currently picked in*/}
      {/*    any content*/}
      {/*    <br />*/}
      {/*    <br />*/}
      {/*    <SpellLink id={SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id} /> is a strong pick for Raiding.*/}
      {/*    Use it when available during high damage phases. (WHAT STATS TO SHOW HERE?)*/}
      {/*  </SubSection>*/}
      {/*  <SubSection title="Tier 6 - CHOSEN TALENT GOES HERE">*/}
      {/*    <SpellLink id={SPELLS.INNER_PEACE_TALENT.id} /> is best in raid encounters where damage*/}
      {/*    timers will allow you to benefit from the reduced cooldown, or in encounters where raiders*/}
      {/*    are spread out and moving too much to benefit from Spring Blossoms.*/}
      {/*    <br />*/}
      {/*    (STATS ON IF PLAYER ACTUALLY MADE USE OF THE CDR)*/}
      {/*    <br />*/}
      {/*    <br />*/}
      {/*    <SpellLink id={SPELLS.SPRING_BLOSSOMS_TALENT.id} /> is the standard pick for Raiding and*/}
      {/*    Mythic+. Make sure to maintain high <SpellLink id={SPELLS.EFFLORESCENCE_CAST.id} /> uptime*/}
      {/*    and you'll get strong extra healing from this talent.*/}
      {/*    <br />*/}
      {/*    <br />*/}
      {/*    <SpellLink id={SPELLS.OVERGROWTH_TALENT.id} /> is terrible do not pick it.*/}
      {/*  </SubSection>*/}
      {/*  <SubSection title="Tier 7 - CHOSEN TALENT GOES HERE"></SubSection>*/}
      {/*  <SubSection title="Legendary - CHOSEN LEGENDARY GOES HERE"></SubSection>*/}
      {/*</Section>*/}
    </>
  );
}
