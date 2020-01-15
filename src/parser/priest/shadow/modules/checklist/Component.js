import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Checklist from 'parser/shared/modules/features/Checklist';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import PreparationRule from 'parser/shared/modules/features/Checklist/PreparationRule';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';

const ShadowPriestChecklist = ({ combatant, castEfficiency, thresholds }) => {
  const DotUptime = props => (
    <Requirement
      name={(
        <React.Fragment>
          <SpellLink id={props.id} icon /> uptime
        </React.Fragment>
      )}
      thresholds={props.thresholds}
    />
  );
  DotUptime.propTypes = {
    id: PropTypes.number.isRequired,
  };

  const AbilityRequirement = props => (
    <GenericCastEfficiencyRequirement
      castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
      {...props}
    />
  );
  AbilityRequirement.propTypes = {
    spell: PropTypes.number.isRequired,
  };

  const VoidFormStacks = props => {
    const requirements = [];

    // eslint-disable-next-line react/prop-types
    for (let voidFormIndex = 0; voidFormIndex < props.voidform.voidforms.length; voidFormIndex++) {
      // eslint-disable-next-line react/prop-types
      const thresholds = props.voidform.suggestionStackThresholds(props.voidform.voidforms[voidFormIndex]);
      // If you end the fight in voidform, we want to mark that voidform as green.
      // eslint-disable-next-line react/prop-types
      if (props.voidform.voidforms[voidFormIndex].excluded) {
        thresholds.isLessThan = { minor: 0 };
      }

      requirements.push(<Requirement
        key={voidFormIndex}
        name={`Voidform #${voidFormIndex + 1} stacks`}
        thresholds={thresholds}
      />);

    }
    return requirements;
  };

  return (
    <Checklist>
      <Rule
        name="Maintain your DoTs on the boss"
        description={(
          <React.Fragment>
            Both <SpellLink id={SPELLS.SHADOW_WORD_PAIN.id} /> and <SpellLink id={SPELLS.VAMPIRIC_TOUCH.id} /> duration extends when the target or a nearby target gets hit by <SpellLink id={SPELLS.VOID_BOLT.id} />.
            Due to this, you often only need to apply these spells to new targets and refresh them on targets that are too far away from your primary target.
          </React.Fragment>
        )}
      >
        <DotUptime id={SPELLS.SHADOW_WORD_PAIN.id} thresholds={thresholds.shadowWordPain} />
        <DotUptime id={SPELLS.VAMPIRIC_TOUCH.id} thresholds={thresholds.vampiricTouch} />

        {combatant.hasTalent(SPELLS.SIPHON_LIFE_TALENT.id) && <DotUptime id={SPELLS.SIPHON_LIFE_TALENT.id} thresholds={thresholds.siphonLife} />}
      </Rule>

      <Rule
        name="Use core spells as often as possible"
        description={(
          <React.Fragment>
            Spells such as <SpellLink id={SPELLS.VOID_BOLT.id} />, <SpellLink id={SPELLS.MIND_BLAST.id} />, or <SpellLink id={SPELLS.SHADOW_WORD_VOID_TALENT.id} /> are your most important spells. Try to cast them as much as possible.
          </React.Fragment>
        )}
      >
        <AbilityRequirement spell={SPELLS.VOID_BOLT.id} />
        {combatant.hasTalent(SPELLS.SHADOW_WORD_VOID_TALENT.id) ?
          <AbilityRequirement spell={SPELLS.SHADOW_WORD_VOID_TALENT.id} /> :
          <AbilityRequirement spell={SPELLS.MIND_BLAST.id} />
        }

      </Rule>

      <Rule
        name="Use cooldowns effectively"
        description={(
          <React.Fragment>
            Cooldowns are an important part of your rotation, you should be using them as often as possible.
          </React.Fragment>
        )}
      >
        {combatant.hasTalent(SPELLS.MINDBENDER_TALENT_SHADOW.id) ?
          <AbilityRequirement spell={SPELLS.MINDBENDER_TALENT_SHADOW.id} /> :
          <AbilityRequirement spell={SPELLS.SHADOWFIEND.id} />
        }

        {combatant.hasTalent(SPELLS.DARK_ASCENSION_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.DARK_ASCENSION_TALENT.id} />
        )}

        {combatant.hasTalent(SPELLS.SHADOW_CRASH_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.SHADOW_CRASH_TALENT.id} />
        )}
      </Rule>

      <Rule
        name={(
          <React.Fragment>Maximize <SpellLink id={SPELLS.VOIDFORM.id} /> stacks</React.Fragment>
        )}
        description={(
          <React.Fragment>
            Your Voidforms are an important part of your overall damage.
            Try to get at least 20 stacks every Voidform with proper <SpellLink id={SPELLS.VOID_BOLT.id} /> and <SpellLink id={SPELLS.MIND_BLAST.id} /> usage.
            Use <SpellLink id={SPELLS.MINDBENDER_TALENT_SHADOW.id} /> on cooldown (even outside of Voidform).
          </React.Fragment>
        )}
      >

        <Requirement
          name={(
            <React.Fragment>
              <SpellLink id={SPELLS.VOIDFORM.id} icon /> uptime
            </React.Fragment>
          )}
          thresholds={thresholds.voidform.suggestionUptimeThresholds}
        />

        <VoidFormStacks voidform={thresholds.voidform} />

      </Rule>

      <Rule
        name="Minimize casting downtime"
        description={(
          <React.Fragment>
            Try to minimize your time not casting. Use your core spells on cooldown and fillers when they are not available. If you know you have an upcoming position requirement, stutterstep with each <SpellLink id={SPELLS.VOID_BOLT.id} /> cast towards that location. During high movement you can use <SpellLink id={SPELLS.SHADOW_WORD_PAIN.id} /> as a filler.
          </React.Fragment>
        )}
      >
        <Requirement name="Downtime" thresholds={thresholds.downtime} />
      </Rule>

      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

ShadowPriestChecklist.propTypes = {
  castEfficiency: PropTypes.object.isRequired,
  combatant: PropTypes.shape({
    hasTalent: PropTypes.func.isRequired,
    hasTrinket: PropTypes.func.isRequired,
  }).isRequired,
  thresholds: PropTypes.object.isRequired,
};

export default ShadowPriestChecklist;
