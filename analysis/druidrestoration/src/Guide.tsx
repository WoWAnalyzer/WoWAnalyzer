import { formatDuration, formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { ControlledExpandable, SpellIcon, SpellLink, Tooltip } from 'interface';
import {
  GradiatedPerformanceBar,
  GuideProps,
  PassFailCheckmark,
  Section,
  SectionHeader,
  SubSection,
} from 'interface/guide';
import InformationIcon from 'interface/icons/Information';
import { Info } from 'parser/core/metric';
import { CooldownBar } from 'parser/ui/CooldownBar';
import { useState } from 'react';
import * as React from 'react';

import CombatLogParser from './CombatLogParser';
import { GREED_INNERVATE, SMART_INNERVATE } from './modules/features/Innervate';
import { MAX_TRANQ_TICKS } from './modules/features/Tranquility';

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
      {info.combatant.hasTalent(SPELLS.PHOTOSYNTHESIS_TALENT) && (
        <>
          Because you took{' '}
          <strong>
            <SpellLink id={SPELLS.PHOTOSYNTHESIS_TALENT.id} />
          </strong>
          , high uptime is particularly important. Typically the Lifebloom-on-self effect is most
          powerful.
          <br />
          Total Uptime on{' '}
          <strong>
            Self:{' '}
            {formatPercentage(modules.photosynthesis.selfLifebloomUptime / info.fightDuration, 1)}%
          </strong>{' '}
          / on{' '}
          <strong>
            Others:{' '}
            {formatPercentage(modules.photosynthesis.othersLifebloomUptime / info.fightDuration, 1)}
            %
          </strong>
          <p />
        </>
      )}
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
      <strong>Spell Breakdowns</strong>
      <p />
      {info.combatant.hasCovenant(COVENANTS.NIGHT_FAE.id) && (
        <>
          <strong>
            <SpellLink id={SPELLS.CONVOKE_SPIRITS.id} />
          </strong>{' '}
          is a powerful but somewhat random burst of healing with a decent chance of proccing{' '}
          <SpellLink id={SPELLS.FLOURISH_TALENT.id} />. Its short cooldown and random nature mean
          its best used as it becomes available. Lightly ramping for a Convoke is still worthwhile
          in case it procs Flourish.
          <p />
          {modules.convokeSpirits.convokeTracker.map((cast, ix) => {
            const restoCast = modules.convokeSpirits.restoConvokeTracker[ix];
            const castTotalHealing =
              restoCast.totalAttribution.healing + restoCast.flourishRateAttribution.amount;
            const checklistItems: CooldownExpandableItem[] = [];
            checklistItems.push({
              label: (
                <>
                  <SpellLink id={SPELLS.WILD_GROWTH} /> ramp
                </>
              ),
              result: <PassFailCheckmark pass={restoCast.wgsOnCast > 0} />,
              details: <>({restoCast.wgsOnCast} HoTs active)</>,
            });
            checklistItems.push({
              label: (
                <>
                  <SpellLink id={SPELLS.REJUVENATION} /> ramp
                </>
              ),
              result: <PassFailCheckmark pass={restoCast.rejuvsOnCast > 0} />,
              details: <>({restoCast.rejuvsOnCast} HoTs active)</>,
            });
            info.combatant.hasTalent(SPELLS.FLOURISH_TALENT.id) &&
              checklistItems.push({
                label: (
                  <>
                    Avoid <SpellLink id={SPELLS.FLOURISH_TALENT} /> clip{' '}
                    <Tooltip
                      hoverable
                      content={
                        <>
                          When casting <SpellLink id={SPELLS.CONVOKE_SPIRITS.id} /> and{' '}
                          <SpellLink id={SPELLS.FLOURISH_TALENT} /> together, the Convoke should
                          ALWAYS go first. This is both because the Convoke could proc Flourish and
                          cause you to clip your hardcast's buff, and also because Convoke produces
                          a lot of HoTs which Flourish could extend. If you got an{' '}
                          <i className="glyphicon glyphicon-remove fail-mark" /> here, it means you
                          cast Flourish before this Convoke.
                        </>
                      }
                    >
                      <span>
                        <InformationIcon />
                      </span>
                    </Tooltip>
                  </>
                ),
                result: <PassFailCheckmark pass={!restoCast.recentlyFlourished} />,
              });
            info.combatant.has4Piece() &&
              checklistItems.push({
                label: (
                  <>
                    Sync with <SpellLink id={SPELLS.RESTO_DRUID_TIER_28_4P_SET_BONUS.id} />{' '}
                    <Tooltip
                      hoverable
                      content={
                        <>
                          <SpellLink id={SPELLS.CONVOKE_SPIRITS.id} />
                          's power is greatly increased when in Tree of Life form. With the 4 piece
                          set bonus <SpellLink id={SPELLS.RESTO_DRUID_TIER_28_4P_SET_BONUS.id} />,
                          you can reasonably get a proc about once every minute, so it is
                          recommended to sync your procs with Convoke.
                        </>
                      }
                    >
                      <span>
                        <InformationIcon />
                      </span>
                    </Tooltip>
                  </>
                ),
                result: <PassFailCheckmark pass={cast.form === 'Tree of Life'} />,
              });

            return (
              <CooldownExpandable
                info={info}
                timestamp={cast.timestamp}
                spellId={SPELLS.CONVOKE_SPIRITS.id}
                magnitude={castTotalHealing}
                magnitudeLabel="healing"
                checklistItems={checklistItems}
                key={ix}
              />
            );
          })}
          <p />
        </>
      )}
      {info.combatant.hasTalent(SPELLS.FLOURISH_TALENT.id) && (
        <>
          <strong>
            <SpellLink id={SPELLS.FLOURISH_TALENT.id} />
          </strong>{' '}
          requires a ramp more than any of your other cooldowns, as its power is based almost
          entirely in the HoTs present when you cast it. Cast many Rejuvenations, and then a Wild
          Growth a few seconds before you're ready to Flourish.{' '}
          {info.combatant.hasCovenant(COVENANTS.NIGHT_FAE.id) && (
            <>
              When pairing this with <SpellLink id={SPELLS.CONVOKE_SPIRITS.id} />, the Convoke
              should ALWAYS be cast first. This is because the Convoke will produce many HoTs which
              can be extended, but also because it could proc a Flourish thus allowing you to save
              the hardcast.
            </>
          )}
          <p />
          {modules.flourish.rampTrackers.map((cast, ix) => {
            const castTotalHealing =
              cast.extensionAttribution.healing + cast.rateAttribution.amount;

            const checklistItems: CooldownExpandableItem[] = [];
            checklistItems.push({
              label: (
                <>
                  <SpellLink id={SPELLS.WILD_GROWTH} /> ramp
                </>
              ),
              result: <PassFailCheckmark pass={cast.wgsOnCast > 0} />,
              details: <>({cast.wgsOnCast} HoTs active)</>,
            });
            checklistItems.push({
              label: (
                <>
                  <SpellLink id={SPELLS.REJUVENATION} /> ramp
                </>
              ),
              result: <PassFailCheckmark pass={cast.rejuvsOnCast > 0} />,
              details: <>({cast.rejuvsOnCast} HoTs active)</>,
            });
            info.combatant.hasCovenant(COVENANTS.NIGHT_FAE.id) &&
              checklistItems.push({
                label: (
                  <>
                    Don't clip existing <SpellLink id={SPELLS.FLOURISH_TALENT} />{' '}
                    <Tooltip
                      hoverable
                      content={
                        <>
                          <SpellLink id={SPELLS.CONVOKE_SPIRITS.id} /> can proc{' '}
                          <SpellLink id={SPELLS.FLOURISH_TALENT} />. After Convoking, always check
                          to see if you get a proc before Flourishing. If you got a proc, you need
                          to wait before Flourishing so you don't overwrite the buff and lose a lot
                          of duration. If you got an{' '}
                          <i className="glyphicon glyphicon-remove fail-mark" /> here, it means you
                          overwrote an existing Flourish.
                        </>
                      }
                    >
                      <span>
                        <InformationIcon />
                      </span>
                    </Tooltip>
                  </>
                ),
                result: <PassFailCheckmark pass={!cast.clipped} />,
              });

            return (
              <CooldownExpandable
                info={info}
                timestamp={cast.timestamp}
                spellId={SPELLS.FLOURISH_TALENT.id}
                magnitude={castTotalHealing}
                magnitudeLabel="healing"
                checklistItems={checklistItems}
                key={ix}
              />
            );
          })}
          <p />
        </>
      )}
      {info.combatant.hasTalent(SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id) && (
        <>
          <strong>
            <SpellLink id={SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id} />
          </strong>{' '}
          is a longer, lower-impact cooldown. It should be planned around periods of high sustained
          healing.
          <br />
          <strong>EXPANDABLE PER-CAST BREAKDOWN COMING SOON!</strong>
          <p />
        </>
      )}
      <>
        <strong>
          <SpellLink id={SPELLS.TRANQUILITY_CAST.id} />
        </strong>{' '}
        is the most independent of your cooldowns, and the one most likely to be assigned explicitly
        by your raid leader. It should typically be planned for a specific mechanic. The vast
        majority of Tranquility's healing is direct and not from the HoT. Do NOT use the HoT to
        ramp. Watch your positioning when you cast - you want to be able to channel full duration
        without moving.
        <p />
        {modules.tranquility.tranqCasts.map((cast, ix) => {
          const checklistItems: CooldownExpandableItem[] = [];
          checklistItems.push({
            label: (
              <>
                <SpellLink id={SPELLS.WILD_GROWTH} /> ramp
              </>
            ),
            result: <PassFailCheckmark pass={cast.wgsOnCast > 0} />,
            details: <>({cast.wgsOnCast} HoTs active)</>,
          });
          checklistItems.push({
            label: (
              <>
                <SpellLink id={SPELLS.REJUVENATION} /> ramp
              </>
            ),
            result: <PassFailCheckmark pass={cast.rejuvsOnCast > 0} />,
            details: <>({cast.rejuvsOnCast} HoTs active)</>,
          });
          checklistItems.push({
            label: (
              <>
                Channeled full duration{' '}
                <Tooltip
                  hoverable
                  content={
                    <>
                      Every tick of Tranquility is very powerful - plan ahead so you're in a
                      position to channel it for its full duration, and be careful not to clip ticks
                      at the end.
                    </>
                  }
                >
                  <span>
                    <InformationIcon />
                  </span>
                </Tooltip>
              </>
            ),
            result: <PassFailCheckmark pass={cast.channeledTicks === MAX_TRANQ_TICKS} />,
            details: (
              <>
                ({cast.channeledTicks} / {MAX_TRANQ_TICKS} ticks)
              </>
            ),
          });

          const detailItems: CooldownExpandableItem[] = [];
          detailItems.push({
            label: 'Direct Healing',
            result: '',
            details: <>{formatNumber(cast.directHealing)}</>,
          });
          detailItems.push({
            label: 'Periodic Healing',
            result: '',
            details: <>{formatNumber(cast.periodicHealing)}</>,
          });

          return (
            <CooldownExpandable
              info={info}
              timestamp={cast.timestamp}
              spellId={SPELLS.TRANQUILITY_CAST.id}
              magnitude={cast.directHealing + cast.periodicHealing}
              magnitudeLabel="healing"
              checklistItems={checklistItems}
              detailItems={detailItems}
              key={ix}
            />
          );
        })}
        <p />
      </>
      <>
        <strong>
          <SpellLink id={SPELLS.INNERVATE.id} />
        </strong>{' '}
        is best used during your ramp, or any time when you expect to spam cast. Typically it should
        be used as soon as it's available. Remember to fit a Wild Growth inside the Innervate, as
        it's one of your most expensive spells.
        <p />
        {modules.innervate.castTrackers.map((cast, ix) => {
          const isSelfCast = cast.targetId === undefined;
          const targetName = cast.targetId === undefined ? 'SELF' : 'ALLY'; // TODO we can't get at combatants here so can't get name - fix?
          const metThresholdMana = isSelfCast
            ? cast.manaSaved >= GREED_INNERVATE
            : cast.manaSaved >= SMART_INNERVATE;
          const castWildGrowth =
            cast.casts.filter((c) => c.ability.guid === SPELLS.WILD_GROWTH.id).length > 0;

          const checklistItems: CooldownExpandableItem[] = [];
          checklistItems.push({
            label: 'Chain-cast expensive spells',
            result: <PassFailCheckmark pass={metThresholdMana} />,
            details: (
              <>
                {isSelfCast
                  ? `(for a self-cast, save at least ${GREED_INNERVATE} mana)`
                  : `(for an ally-cast, save at least ${SMART_INNERVATE} mana)`}
              </>
            ),
          });
          checklistItems.push({
            label: (
              <>
                Cast <SpellLink id={SPELLS.WILD_GROWTH.id} />
              </>
            ),
            result: <PassFailCheckmark pass={castWildGrowth} />,
          });

          const detailItems: CooldownExpandableItem[] = [];
          detailItems.push({
            label: 'Used on',
            result: '',
            details: <>{targetName}</>,
          });
          detailItems.push({
            label: 'Casts during Innervate',
            result: '',
            details: (
              <>
                {cast.casts.map((c, iix) => (
                  <>
                    <SpellIcon id={c.ability.guid} key={iix} />{' '}
                  </>
                ))}
              </>
            ),
          });

          return (
            <CooldownExpandable
              info={info}
              timestamp={cast.timestamp}
              spellId={SPELLS.INNERVATE.id}
              magnitude={cast.manaSaved}
              magnitudeLabel="mana saved"
              checklistItems={checklistItems}
              detailItems={detailItems}
              key={ix}
            />
          );
        })}
        <p />
      </>
    </SubSection>
  );
}

function CooldownExpandable({
  info,
  timestamp,
  spellId,
  magnitude,
  magnitudeLabel,
  checklistItems,
  detailItems,
}: {
  info: Info;
  timestamp: number;
  spellId: number;
  magnitude?: number;
  magnitudeLabel?: React.ReactNode;
  checklistItems?: CooldownExpandableItem[];
  detailItems?: CooldownExpandableItem[];
}): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <ControlledExpandable
      header={
        <SectionHeader>
          @ {formatDuration(timestamp - info.fightStart)} &mdash; <SpellLink id={spellId} />
          {magnitude !== undefined && (
            <>
              {' '}
              ({formatNumber(magnitude)}
              {magnitudeLabel && <> {magnitudeLabel}</>})
            </>
          )}
        </SectionHeader>
      }
      element="section"
      expanded={isExpanded}
      inverseExpanded={() => setIsExpanded(!isExpanded)}
    >
      <div>
        {checklistItems && checklistItems.length !== 0 && (
          <section>
            <header style={{ fontWeight: 'bold' }}>Checklist</header>
            <tbody>
              <table>
                {checklistItems.map((item, ix) => (
                  <tr key={'checklist-' + ix}>
                    <td style={{ paddingRight: '1em', paddingLeft: '1em', minWidth: '25em' }}>
                      {item.label}
                    </td>
                    <td style={{ paddingRight: '1em', textAlign: 'right' }}>{item.result}</td>
                    {item.details && <td style={{ paddingRight: '1em' }}>{item.details}</td>}
                  </tr>
                ))}
              </table>
            </tbody>
          </section>
        )}
        {detailItems && detailItems.length !== 0 && (
          <section>
            <tbody>
              <header style={{ fontWeight: 'bold' }}>Details</header>
              <table>
                {detailItems.map((item, ix) => (
                  <tr key={'details-' + ix}>
                    <td style={{ paddingRight: '1em', paddingLeft: '1em', minWidth: '25em' }}>
                      {item.label}
                    </td>
                    <td style={{ paddingRight: '1em', textAlign: 'right' }}>{item.result}</td>
                    {item.details && <td style={{ paddingRight: '1em' }}>{item.details}</td>}
                  </tr>
                ))}
              </table>
            </tbody>
          </section>
        )}
      </div>
    </ControlledExpandable>
  );
}

interface CooldownExpandableItem {
  label: React.ReactNode;
  result: React.ReactNode;
  details?: React.ReactNode;
}
