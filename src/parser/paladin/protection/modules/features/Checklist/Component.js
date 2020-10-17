import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Checklist from 'parser/shared/modules/features/Checklist';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import PreparationRule from 'parser/shared/modules/features/Checklist/PreparationRule';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';

const ProtectionPaladinChecklist = ({ castEfficiency, thresholds, extras }) => {
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
        name="Use core abilities as often as possible."
        description="These should generally always be recharging to maximize efficiency."
      >
        <AbilityRequirement spell={SPELLS.AVENGERS_SHIELD.id} />
        <AbilityRequirement spell={SPELLS.JUDGMENT_CAST_PROTECTION.id} />
        <Requirement
          name={<>Bad <SpellLink id={extras.hotrAbility.id} /> casts</>}
          tooltip={<>This is a <em>filler</em> ability and should only be cast while your other spells are on cooldown.</>}
          thresholds={thresholds.hotrBadCasts}
        />
        <AbilityRequirement spell={SPELLS.AVENGING_WRATH.id} />
      </Rule>

      <Rule
        name={(
          <>
            Mitigate incoming damage with <SpellLink id={SPELLS.SHIELD_OF_THE_RIGHTEOUS.id} /> and <SpellLink id={SPELLS.CONSECRATION_CAST.id} />
          </>
        )}
        description={(
          <>
            Maintain <SpellLink id={SPELLS.CONSECRATION_CAST.id} /> to reduce all incoming damage by a flat amount and use it as a rotational filler if necessary.<br />
            Use <SpellLink id={SPELLS.SHIELD_OF_THE_RIGHTEOUS.id} /> to smooth out your physical damage taken. <SpellLink id={SPELLS.ARDENT_DEFENDER.id} /> can be used either as a cooldown to mitigate boss abilities or to cover time when <SpellLink id={SPELLS.SHIELD_OF_THE_RIGHTEOUS.id} /> is unavailable.
          </>
        )}
      >
        <Requirement name="Use your Holy Power efficiently" thresholds={thresholds.hpWaste} />
        <Requirement
          name={(
            <>Good <SpellLink id={SPELLS.SHIELD_OF_THE_RIGHTEOUS.id} /> casts</>
          )}
          thresholds={thresholds.shieldOfTheRighteous}
        />
        <Requirement
          name={(
            <>Hits Mitigated with <SpellLink id={SPELLS.CONSECRATION_CAST.id} /></>
          )}
          thresholds={thresholds.consecration}
        />
        <AbilityRequirement spell={SPELLS.ARDENT_DEFENDER.id}
          name={(<><SpellLink id={SPELLS.ARDENT_DEFENDER.id} /> cast efficiency</>)}
        />
      </Rule>
      <Rule name={<>Use <SpellLink id={SPELLS.WORD_OF_GLORY.id}/> to heal yourself</>}
        description={(
          <>
            You should use <SpellLink id={SPELLS.WORD_OF_GLORY.id} /> to heal yourself (or others, with <SpellLink id={SPELLS.HAND_OF_THE_PROTECTOR_TALENT.id} />). However, you should <b>not</b> do this at the expense of <SpellLink id={SPELLS.SHIELD_OF_THE_RIGHTEOUS.id} /> uptime. Instead, take advantage of <SpellLink id={SPELLS.SHINING_LIGHT.id} /> to make most of your <SpellLink id={SPELLS.WORD_OF_GLORY.id} /> casts free.
          </>
        )}>
        <Requirement name={<>Don't Overheal with <SpellLink id={SPELLS.WORD_OF_GLORY.id} /></>}
                     thresholds={thresholds.wogOverheal} />
        <Requirement name={<>Don't let <SpellLink id={SPELLS.SHINING_LIGHT.id} /> expire</>}
                     thresholds={thresholds.wogSlWaste}/>
        <Requirement name={<>Spend <SpellLink id={SPELLS.SHINING_LIGHT.id} /> quickly to avoid wasting stacks.</>}
                     thresholds={thresholds.wogSotrCasts}
                     tooltip="The number of Shining Light stacks wasted."/>
      </Rule>
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

ProtectionPaladinChecklist.propTypes = {
  castEfficiency: PropTypes.object.isRequired,
  combatant: PropTypes.shape({
    hasTalent: PropTypes.func.isRequired,
  }).isRequired,
  thresholds: PropTypes.object.isRequired,
  extras: PropTypes.object.isRequired,
};

export default ProtectionPaladinChecklist;
