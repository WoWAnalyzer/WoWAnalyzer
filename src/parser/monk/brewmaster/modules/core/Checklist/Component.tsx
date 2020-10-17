import React from 'react';
import PropTypes from 'prop-types';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Checklist from 'parser/shared/modules/features/Checklist';
import Rule, { PERFORMANCE_METHOD } from 'parser/shared/modules/features/Checklist/Rule';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import PreparationRule from 'parser/shared/modules/features/Checklist/PreparationRule';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';

const Component = ({ combatant, castEfficiency, thresholds }: any) => {
  const AbilityRequirement = (props: any) => (
    <GenericCastEfficiencyRequirement
      castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
      {...props}
    />
  );
  AbilityRequirement.propTypes = {
    spell: PropTypes.number.isRequired,
    name: PropTypes.any,
  };


  return (
   <Checklist>
     <Rule name={<>Use <SpellLink id={SPELLS.CELESTIAL_BREW.id} onClick={e => e.preventDefault()} /> effectively</>}
           description={(
             <>
               <SpellLink id={SPELLS.CELESTIAL_BREW.id} /> is a key part of your defensive toolkit. While it might be tempting to wait to cast it until you have max <SpellLink id={SPELLS.PURIFIED_CHI.id} />, it is much better to get more total casts off in most situations.
             </>
           )}>
       <AbilityRequirement spell={SPELLS.CELESTIAL_BREW.id} name={<><SpellLink id={SPELLS.CELESTIAL_BREW.id} /> cast efficiency</>} />
       <Requirement name={<><SpellLink id={SPELLS.CELESTIAL_BREW.id} /> Absorbs Effectively Used</>}
                    thresholds={thresholds.goodCBCasts}
                    tooltip="A cast is counted as effective if at least 75% of the shield is used." />
     </Rule>
     <Rule name={<>Use <SpellLink id={SPELLS.PURIFYING_BREW.id} onClick={e => e.preventDefault()} /> effectively</>}
           performanceMethod={PERFORMANCE_METHOD.HARMONIC}
           description={(
             <>
               Effective use of <SpellLink id={SPELLS.PURIFYING_BREW.id} /> is fundamental to playing Brewmaster successfully. While we cannot <em>automatically</em> tell whether a purify is effective or not, there are some simple guidelines that naturally lead to more effective purifies:
               <ul>
                 <li>Spend all of your charges of <SpellLink id={SPELLS.PURIFYING_BREW.id} />.</li>
                 <li>Avoid casting <SpellLink id={SPELLS.PURIFYING_BREW.id} /> at less than <SpellLink id={SPELLS.HEAVY_STAGGER_DEBUFF.id} />—but not if it would waste charges! In a raid environment, <SpellLink id={SPELLS.HEAVY_STAGGER_DEBUFF.id} /> is not dangerous in itself. While not every fight will put you into <SpellLink id={SPELLS.HEAVY_STAGGER_DEBUFF.id} /> consistently, this remains a good rule of thumb.</li>
                 <li>If you are going to purify a hit, do so as soon as possible after it lands. Every half-second delayed after the hit causes you to take 5% of the hit's damage from <SpellLink id={SPELLS.STAGGER.id} />.</li>
               </ul>
               For more information on effective use of <SpellLink id={SPELLS.PURIFYING_BREW.id} />, see the <a href="https://www.peakofserenity.com/bfa/brewmaster/purifying/">Peak of Serenity guide</a>.
             </>
           )}
     >
       <AbilityRequirement spell={SPELLS.PURIFYING_BREW.id} name={<><SpellLink id={SPELLS.PURIFYING_BREW.id} /> cast efficiency</>} />
       <Requirement name={<>Maintain <SpellLink id={SPELLS.SHUFFLE.id} /> while tanking</>} thresholds={thresholds.shuffleHits}
                    tooltip="Shuffle increases the power of your Purifies. Maintain it by casting your rotational abilities." />
       <Requirement name="Average Purification Delay" thresholds={thresholds.purifyDelay}
                    tooltip="The delay is tracked from the most recent time you were able to purify after a hit. If the hit occurred when no charges were available, you are not penalized." />
     </Rule>
      <Rule name="Top the Damage Charts"
            description={(
              <>
                While the <em>primary</em> role of a tank is to get hit in the face a bunch and not die in the process, once that is under control we get to spend some energy dealing damage! Maintaining a <a href="https://www.peakofserenity.com/bfa/brewmaster/guide/">correct DPS rotation</a> also provides optimal brew generation. <strong>However, if you are dying, ignore this checklist item!</strong> As much as we may enjoy padding for those sweet orange parses, not-wiping takes precedence.
              </>
            )}>
        <AbilityRequirement spell={SPELLS.KEG_SMASH.id} />
        <AbilityRequirement spell={SPELLS.BLACKOUT_KICK_BRM.id} />
        <AbilityRequirement spell={SPELLS.INVOKE_NIUZAO_THE_BLACK_OX.id} />
        <AbilityRequirement spell={SPELLS.TOUCH_OF_DEATH.id} />
        {combatant.hasTalent(SPELLS.BLACKOUT_COMBO_TALENT.id) && (
          <>
            <Requirement
              name={<><SpellLink id={SPELLS.BLACKOUT_COMBO_TALENT.id} />-empowered <SpellLink id={SPELLS.TIGER_PALM.id} >Tiger Palms</SpellLink></>}
              thresholds={thresholds.bocTp} />
            <Requirement
              name={<><SpellLink id={SPELLS.BLACKOUT_COMBO_TALENT.id}>Blackout Combos</SpellLink> spent on <SpellLink id={SPELLS.TIGER_PALM.id} /></>}
              thresholds={thresholds.bocDpsWaste} />
          </>
        )}
        {combatant.hasTalent(SPELLS.RUSHING_JADE_WIND_TALENT_BREWMASTER.id) && (
          <Requirement name={<><SpellLink id={SPELLS.RUSHING_JADE_WIND.id} /> uptime</>}
                       thresholds={thresholds.rjw} />
        )}
      </Rule>
      <PreparationRule thresholds={thresholds}></PreparationRule>
    </Checklist>
  );
};

export default Component;
