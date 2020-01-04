import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Checklist from 'parser/shared/modules/features/Checklist';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import PreparationRule from 'parser/shared/modules/features/Checklist/PreparationRule';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';

const RestorationDruidChecklist = ({ combatant, castEfficiency, thresholds }) => {
  const AbilityRequirement = props => (
    <GenericCastEfficiencyRequirement
      castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
      {...props}
    />
  );
  AbilityRequirement.propTypes = {
    spell: PropTypes.number.isRequired,
  };

  return (
    <Checklist>
      <Rule
        name="Stay active throughout the fight"
        description={(
          <>
            While constantly casting heals will quickly run you out of mana, you should still try to always be doing something throughout the fight. You can reduce your downtime while saving mana by spamming <SpellLink id={SPELLS.SOLAR_WRATH.id} /> on the boss when there is nothing serious to heal. If you safely healed through the entire fight and still had high non-healing time, your raid team is probably bringing too many healers.
          </>
        )}
      >
        <Requirement name="Non healing time" thresholds={thresholds.nonHealingTime} />
        <Requirement name="Downtime" thresholds={thresholds.downtime} />
      </Rule>
      <Rule
        name={(<>Use <SpellLink id={SPELLS.WILD_GROWTH.id} /> effectively</>)}
        description={(
          <>
            Effective use of <SpellLink id={SPELLS.WILD_GROWTH.id} /> is incredibly important to your healing performance. When more than 5 raiders are wounded, it is probably the most efficienct and effective spell you can cast. Try to time your <SpellLink id={SPELLS.WILD_GROWTH.id} /> cast to land just after a boss ability in order to keep raiders healthy even through heavy AoE.
          </>
        )}
      >
        <Requirement
          name={(
            <>
              <SpellLink id={SPELLS.WILD_GROWTH.id} /> / <SpellLink id={SPELLS.REJUVENATION.id} /> ratio
            </>
          )}
          tooltip="This is your ratio of Wild Growth casts to Rejuvenation casts. If this number is too low, it probably indicates you were missing good opportunities to cast Wild Growth."
          thresholds={thresholds.wildGrowthRatio} />
        <Requirement
          name={(
            <>
              Low target <SpellLink id={SPELLS.WILD_GROWTH.id} /> casts
            </>
          )}
          tooltip="This is your percent of Wild Growth casts that hit too few wounded targets. Low target casts happen either by casting it when almost all the raid was full health, or casting it on an isolated target. Remember that Wild Growth can only apply to players within 30 yds of the primary target, so if you use it on a target far away from the rest of the raid your cast will not be effective."
          thresholds={thresholds.wildGrowthPercentBelowRecommendedCasts} />
        <Requirement
          name={(
            <>
              High initial overhealing <SpellLink id={SPELLS.WILD_GROWTH.id} />
            </>
          )}
          tooltip="This is your percent of Wild Growth casts that has high initial overhealing. Wild Growth does most of it's healing initially and declines over duration. Make sure you are not precasting it before damaging event but after damage occurs."
          thresholds={thresholds.wildGrowthPercentBelowRecommendedPrecasts} />
      </Rule>
      <Rule
        name="Use your healing cooldowns"
        description={(
          <>
            Your cooldowns can be a big contributor to healing throughput when used frequently throughout the fight. When used early and often they can contribute a lot of healing for very little mana. Try to plan your major cooldowns like (<SpellLink id={SPELLS.TRANQUILITY_CAST.id} /> around big damage boss abilities, like the Transition Phase on Imonar or Fusillade on Antoran High Command. The below percentages represent the percentage of time you kept each spell on cooldown.
          </>
        )}
      >
        {combatant.hasTalent(SPELLS.CENARION_WARD_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.CENARION_WARD_TALENT.id} />
        )}
        {combatant.hasTalent(SPELLS.FLOURISH_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.FLOURISH_TALENT.id} />
        )}
        {combatant.hasTalent(SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id} />
        )}
        <AbilityRequirement spell={SPELLS.TRANQUILITY_CAST.id} />
        <AbilityRequirement spell={SPELLS.INNERVATE.id} />
      </Rule>
      <Rule
        name={(
          <>
            Keep <SpellLink id={SPELLS.LIFEBLOOM_HOT_HEAL.id} /> and <SpellLink id={SPELLS.EFFLORESCENCE_CAST.id} /> active
          </>
        )}
        description={(
          <>
            Maintaining uptime on these two important spells will improve your mana efficiency and overall throughput. It is good to keep <SpellLink id={SPELLS.LIFEBLOOM_HOT_HEAL.id} /> constantly active on a tank. While its throughput is comparable to a <SpellLink id={SPELLS.REJUVENATION.id} />, it also provides a constant chance to proc <SpellLink id={SPELLS.CLEARCASTING_BUFF.id} />. <SpellLink id={SPELLS.EFFLORESCENCE_CAST.id} /> is very mana efficient when it can tick over its full duration. Place it where raiders are liable to be and refresh it as soon as it expires.
          </>
        )}
      >
        {!combatant.hasWaist(ITEMS.THE_DARK_TITANS_ADVICE.id) && (
          <Requirement
            name={(<><SpellLink id={SPELLS.LIFEBLOOM_HOT_HEAL.id} /> uptime</>)}
            thresholds={thresholds.lifebloomUpTime}
          />
        )}
        {combatant.hasWaist(ITEMS.THE_DARK_TITANS_ADVICE.id) && (
          <Requirement
            name={(<><SpellLink id={SPELLS.LIFEBLOOM_HOT_HEAL.id} /> uptime</>)}
            tooltip="This requirement is more stringent because you have The Dark Titans Advice equipped"
            thresholds={thresholds.lifebloomUpTime}
          />
        )}
        <Requirement
          name={(<><SpellLink id={SPELLS.EFFLORESCENCE_CAST.id} /> uptime</>)}
          thresholds={thresholds.efflorescenceUpTime}
        />
      </Rule>
      <Rule
        name="Manage your mana"
        description={(
          <>
            Casting on targets who don't need healing or recklessly using inefficienct heals can result in running out of mana well before an encounter ends. Adapt your spell use to the situation, and as a rule of thumb try and keep your current mana percentage just above the bosses health percentage.
          </>
        )}
        >
        <Requirement
          name={(
            <>
              Mana saved during <SpellLink id={SPELLS.INNERVATE.id} />
            </>
          )}
          thresholds={thresholds.innervateAverageManaSaved}
          tooltip="All spells cost no mana during Innervate, so take care to chain cast for its duration. Typically this means casting a Wild Growth, refreshing Efflorescence, and spamming Rejuvenation. It's also fine to Regrowth a target that is in immediate danger of dying."
        />
        <Requirement
          name={(
            <>Use your <SpellLink id={SPELLS.CLEARCASTING_BUFF.id} /> procs</>
          )}
          thresholds={thresholds.clearCastingUtil}
          tooltip="This is the percentage of Clearcasting procs that you used. Regrowth is normally very expensive, but it's completely free with a Clearcasting proc. Use your procs in a timely fashion for a lot of free healing."
        />
        <Requirement
          name={(
            <>
              Don't overuse <SpellLink id={SPELLS.REGROWTH.id} />
            </>
          )}
          thresholds={thresholds.nonCCRegrowths}
          tooltip="This is the number of no-clearcasting Regrowths you cast per minute. Regrowth is very mana inefficient, and should only be used in emergency situations (and when you've already expended Swiftmend). Usually, you should rely on other healers in your raid to triage."
        />
        <Requirement
          name="Mana remaining at fight end"
          thresholds={thresholds.manaValues}
          tooltip="Try to spend your mana at roughly the same rate the boss is dying. Having too much mana left at fight end could mean you were too conservative with your spell casts. If your mana is in good shape but there isn't much to heal, consider mixing Moonfire and Sunfire into your DPS rotation, which will burn some mana for extra DPS contribution."
        />
      </Rule>
      <Rule
        name="Use your defensive / emergency spells"
        description={(
          <>Restoration Druids unfortunately do not have many tools to deal with burst damage, but you should take care to use the ones you have. Swiftmend is a fairly inefficient spell, and should only be used in an emergency. The below percentages represent the percentage of time you kept each spell on cooldown.</>
        )}
      >
        <AbilityRequirement spell={SPELLS.SWIFTMEND.id} />
        <AbilityRequirement spell={SPELLS.IRONBARK.id} />
        <AbilityRequirement spell={SPELLS.BARKSKIN.id} />
      </Rule>
      <Rule
        name="Pick the right tools for the fight"
        description={(
          <>
            Different talent choices can be more or less effective depending on the fight. Listed below you will see how much throughput some talents were providing.
          </>
        )}
        >
        {combatant.hasTalent(SPELLS.CULTIVATION.id) && (
          <Requirement
            name={(<><SpellLink id={SPELLS.CULTIVATION.id} /> throughput</>)}
            thresholds={thresholds.cultivationPercent}
            tooltip={`This is the percent of your total healing that Cultivation contributed. Below around ${formatPercentage(thresholds.cultivationPercent.isLessThan.average, 0)}%, you either had too many healers in this fight, or the fight is better for Tree of Life`}
          />
        )}
        {combatant.hasTalent(SPELLS.SPRING_BLOSSOMS.id) && (
          <Requirement
            name={(<><SpellLink id={SPELLS.SPRING_BLOSSOMS.id} /> throughput</>)}
            thresholds={thresholds.springBlossomsPercent}
            tooltip={`This is the percent of your total healing that Spring Blossoms contributed. Below around ${formatPercentage(thresholds.springBlossomsPercent.isLessThan.average, 0)}%, you either weren't doing a good job with Efflorescence placement or you would have been better off picking Germination`}
          />
        )}
        {combatant.hasTalent(SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id) && (
          <Requirement
            name={(<><SpellLink id={SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id} /> throughput</>)}
            thresholds={thresholds.treeOfLifePercent}
            tooltip={`This is the percent of your total healing that Tree of Life contributed. Below around ${formatPercentage(thresholds.treeOfLifePercent.isLessThan.average, 0)}%, you either didn't pick good times to use ToL or you would have been better off picking Cultivation`}
          />
        )}
      </Rule>
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

RestorationDruidChecklist.propTypes = {
  castEfficiency: PropTypes.object.isRequired,
  combatant: PropTypes.shape({
    hasTalent: PropTypes.func.isRequired,
    hasTrinket: PropTypes.func.isRequired,
    hasWaist: PropTypes.func.isRequired,
  }).isRequired,
  thresholds: PropTypes.object.isRequired,
};

export default RestorationDruidChecklist;
