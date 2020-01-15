import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Checklist from 'parser/shared/modules/features/Checklist';
import Rule, { PERFORMANCE_METHOD } from 'parser/shared/modules/features/Checklist/Rule';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import PreparationRule from 'parser/shared/modules/features/Checklist/PreparationRule';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';

const BrewmasterMonkChecklist = ({ combatant, castEfficiency, thresholds }) => {
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
        performanceMethod={PERFORMANCE_METHOD.FIRST}
        name={<>Mitigate damage with <SpellLink id={SPELLS.IRONSKIN_BREW.id} onClick={e => e.preventDefault()} />.</>}
        description={(
<>
            <SpellLink id={SPELLS.STAGGER.id} /> is our main damage mitigation tool. <SpellLink id={SPELLS.IRONSKIN_BREW.id} /> increases the amount of damage that we can mitigate with Stagger while active. It is possible to maintain 100% uptime without reaching any particular haste threshold due to the cooldown reduction applied by <SpellLink id={SPELLS.KEG_SMASH.id} /> and <SpellLink id={SPELLS.TIGER_PALM.id} />. If you are having difficulty maintaining your buff you may need to improve your cast efficiency or reduce the amount of purification you are doing.
          </>
)}
      >
      <Requirement
        name={<>Hits mitigated with <SpellLink id={SPELLS.IRONSKIN_BREW.id} /></>}
        thresholds={thresholds.isb}
      />
      <AbilityRequirement spell={SPELLS.IRONSKIN_BREW.id}
        name={<><SpellLink id={SPELLS.IRONSKIN_BREW.id} /> Cast Efficiency</>}
        tooltip={<>A low cast efficiency indicates that brews are being wasted to capping charges.<br />The cast efficiency of Ironskin Brew is shared with Purifying Brew.</>}
      />
    </Rule>
    <Rule name={'Generate enough brews through your rotation'}
      performanceMethod={PERFORMANCE_METHOD.FIRST}
      description={(
<>
          <p>The cooldown of all brews is reduced by your key rotational abilities: <SpellLink id={SPELLS.KEG_SMASH.id} /> and <SpellLink id={SPELLS.TIGER_PALM.id} />. Maintaining a proper rotation will help ensure you have enough brews available to maintain <SpellLink id={SPELLS.IRONSKIN_BREW.id} />.</p>

          <p>Note that <SpellLink id={SPELLS.BLACK_OX_BREW_TALENT.id} /> is <em>almost always</em> the best talent for brew generation in a raiding environment. Unless specific fight mechanics require using 3+ brews in rapid succession, use it as close to on cooldown as possible without wasting brew charges. If you are using <SpellLink id={SPELLS.LIGHT_BREWING_TALENT.id} /> and seeing low brew CDR, consider switching talents.</p>
          </>
)} >
      <Requirement name={'Effective CDR from your rotation'}
        thresholds={thresholds.totalCDR} />
      <AbilityRequirement spell={SPELLS.KEG_SMASH.id}
        name={<><SpellLink id={SPELLS.KEG_SMASH.id} /> Cast Efficiency</>} />
      {combatant.hasTalent(SPELLS.BLACK_OX_BREW_TALENT.id) && (
        <AbilityRequirement spell={SPELLS.BLACK_OX_BREW_TALENT.id}
          name={<><SpellLink id={SPELLS.BLACK_OX_BREW_TALENT.id} /> Cast Efficiency</>} />
      )}
      <Requirement name={<><SpellLink id={SPELLS.IRONSKIN_BREW.id} /> duration clipped</>}
        thresholds={thresholds.isbClipping}
        tooltip={<>Ironskin Brew has a <em>cap</em> on total buff duration of three times the base duration. Casting Ironskin Brew with more time remaining than twice the base duration (normally 14 seconds) wastes part of the brew.</>}
      />
    </Rule>
    <Rule name={<>Use <SpellLink id={SPELLS.PURIFYING_BREW.id} onClick={e => e.preventDefault()} /> effectively</>}
      performanceMethod={PERFORMANCE_METHOD.HARMONIC}
      description={(
<>
          Effective use of <SpellLink id={SPELLS.PURIFYING_BREW.id} /> is fundamental to playing Brewmaster successfully. While we cannot <em>automatically</em> tell whether a purify is effective or not, there are some simple guidelines that naturally lead to more effective purifies:
          <ul>
            <li>Avoid casting <SpellLink id={SPELLS.PURIFYING_BREW.id} /> at less than <SpellLink id={SPELLS.HEAVY_STAGGER_DEBUFF.id} />. In a raid environment, <SpellLink id={SPELLS.HEAVY_STAGGER_DEBUFF.id} /> is not dangerous in itself. While not every fight will put you into <SpellLink id={SPELLS.HEAVY_STAGGER_DEBUFF.id} /> consistently, this remains a good rule of thumb.</li>
            <li>If you are going to purify a hit, do so as soon as possible after it lands. Every half-second delayed after the hit causes you to take 5% of the hit's damage from <SpellLink id={SPELLS.STAGGER.id} />.</li>
          </ul>
          For more information on effective use of <SpellLink id={SPELLS.PURIFYING_BREW.id} />, see the <a href="https://www.peakofserenity.com/bfa/brewmaster/purifying/">Peak of Serenity guide</a>.
        </>
)}
    >
      <Requirement name={<>Inefficient <SpellLink id={SPELLS.PURIFYING_BREW.id} /> casts.</>} thresholds={thresholds.purifyHeavy}
        tooltip="A purify is 'inefficient' if it occurs with (relatively) low stagger. The warning threshold is calculated based on how much time you spent in Heavy Stagger." />
      <Requirement name={'Average Purification Delay'} thresholds={thresholds.purifyDelay}
        tooltip="The delay is tracked from the most recent time you were able to purify after a hit. If the hit occurred when no charges were available, you are not penalized." />
      <Requirement name={<>Available <SpellLink id={SPELLS.PURIFYING_BREW.id} /> charges used</>} thresholds={thresholds.purifyCasts}
        tooltip="While maintaining Ironskin is critical to your survival, with proper play it is possible to generate more brews than you need to maintain it. These excess brews should be spent on Purifying." />
    </Rule>
    <Rule
      name={'Top the DPS Charts'}
      description={(
<>
          While the <em>primary</em> role of a tank is to get hit in the face a bunch and not die in the process, once that is under control we get to spend some energy dealing damage! Maintaining a <a href="https://www.peakofserenity.com/bfa/brewmaster/guide/">correct DPS rotation</a> also provides optimal brew generation. <strong>However, if you are dying, ignore this checklist item!</strong> As much as we may enjoy padding for those sweet orange parses, not-wiping takes precedence.
        </>
)} >
      <AbilityRequirement spell={SPELLS.KEG_SMASH.id} />
      <AbilityRequirement spell={SPELLS.BLACKOUT_STRIKE.id} />
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
      {combatant.hasTalent(SPELLS.INVOKE_NIUZAO_THE_BLACK_OX_TALENT.id) && <AbilityRequirement spell={SPELLS.INVOKE_NIUZAO_THE_BLACK_OX_TALENT.id} />}
    </Rule>
    <PreparationRule thresholds={thresholds} />
  </Checklist>
  );
};

BrewmasterMonkChecklist.propTypes = {
  castEfficiency: PropTypes.object.isRequired,
  combatant: PropTypes.shape({
    hasTalent: PropTypes.func.isRequired,
    hasTrinket: PropTypes.func.isRequired,
  }).isRequired,
  thresholds: PropTypes.object.isRequired,
};

export default BrewmasterMonkChecklist;
