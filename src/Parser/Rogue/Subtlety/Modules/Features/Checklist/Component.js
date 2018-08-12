import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Checklist from 'Parser/Core/Modules/Features/Checklist2';
import Rule from 'Parser/Core/Modules/Features/Checklist2/Rule';
import Requirement from 'Parser/Core/Modules/Features/Checklist2/Requirement';
import PreparationRule from 'Parser/Core/Modules/Features/Checklist2/PreparationRule';
import GenericCastEfficiencyRequirement from 'Parser/Core/Modules/Features/Checklist2/GenericCastEfficiencyRequirement';

class SubRogueChecklist extends React.PureComponent {
  static propTypes = {
    castEfficiency: PropTypes.object.isRequired,
    combatant: PropTypes.shape({
      hasTalent: PropTypes.func.isRequired,
      hasTrinket: PropTypes.func.isRequired,
    }).isRequired,
    thresholds: PropTypes.object.isRequired,
  };

  render() {
    const { combatant, castEfficiency, thresholds } = this.props;

    const AbilityRequirement = props => (
      <GenericCastEfficiencyRequirement
        castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
        {...props}
      />
    );

    return (
      <Checklist>
        <Rule
          name="Use your offensive cooldowns"
          description={(
            <React.Fragment>
              Subtlety rotation revolves around using your cooldowns effectively. To maximize your damage, you need to stack your cooldowns. Your cooldowns dictate your rotation. A base rule of thumb is: use <SpellLink id={SPELLS.SYMBOLS_OF_DEATH.id} /> on cooldown, and use <SpellLink id={SPELLS.SHADOW_DANCE.id} /> when symbols are active. However you should never cap on <SpellLink id={SPELLS.SHADOW_DANCE.id} /> charges. 
            </React.Fragment>
          )}
        >
          <AbilityRequirement spell={SPELLS.SHADOW_DANCE.id} />
          <AbilityRequirement spell={SPELLS.SYMBOLS_OF_DEATH.id} />
          <AbilityRequirement spell={SPELLS.VANISH.id} />
          {combatant.hasTalent(SPELLS.SECRET_TECHNIQUE_TALENT.id) && (
            <AbilityRequirement spell={SPELLS.SECRET_TECHNIQUE_TALENT.id} />
          )}
        </Rule>
        <Rule
          name="Don't waste resources"
          description={(
            <React.Fragment>
              Since all of Subtlety's damage is tied to resources, it is important to waste as little of them as possible. You should make sure you do not find yourself being Energy capped or casting Combo Point generating abilities when at maximum Combo Points. 
            </React.Fragment>
          )}
        >
          <Requirement
            name={(
              <React.Fragment>
                Wasted combo points
              </React.Fragment>
            )}
            thresholds={thresholds.comboPoints}
          />
          <Requirement
            name={(
              <React.Fragment>
                Wasted energy
              </React.Fragment>
            )}
            thresholds={thresholds.energy}
          />
        </Rule>
        <Rule
          name="Manage Nightblade correctly"
          description={(
            <React.Fragment>
              <SpellLink id={SPELLS.NIGHTBLADE.id} /> is a crucial part of Subtlety rotation, due to the 15% damage buff it provides. However you do not want to apply it during <SpellLink id={SPELLS.SYMBOLS_OF_DEATH.id} /> or <SpellLink id={SPELLS.SHADOW_DANCE.id} /> if speced in to <SpellLink id={SPELLS.DARK_SHADOW_TALENT.id} /> because it will take the place of an <SpellLink id={SPELLS.EVISCERATE.id} />. <SpellLink id={SPELLS.NIGHTBLADE.id} /> <dfn data-tip="refresh it when Symbols has less then 5 seconds cooldown left">Instead, you should refresh early*</dfn>
            </React.Fragment>
          )}
        >
          <Requirement
            name={(
              <React.Fragment>
                <SpellLink id={SPELLS.NIGHTBLADE.id} /> uptime
              </React.Fragment>
            )}
            thresholds={thresholds.nightbladeUptime}
          />
          <Requirement
            name={(
              <React.Fragment>
                <SpellLink id={SPELLS.NIGHTBLADE.id} /> refreshed during  <SpellLink id={SPELLS.SYMBOLS_OF_DEATH.id} />
              </React.Fragment>
            )}
            thresholds={thresholds.nightbladeDuringSymbols}
          />
          {combatant.hasTalent(SPELLS.DARK_SHADOW_TALENT.id) && (
          <Requirement
            name={(
              <React.Fragment>
                <SpellLink id={SPELLS.NIGHTBLADE.id} /> refreshed during <SpellLink id={SPELLS.SHADOW_DANCE.id} /> with  <SpellLink id={SPELLS.DARK_SHADOW_TALENT.id} />
              </React.Fragment>
            )}
            thresholds={thresholds.darkShadowNightblade}
          />
          )}
        </Rule>
        <Rule
          name="Utilize Stealth and Shadow Dance to full potential"
          description={(
            <React.Fragment>
              Stealth is a core mechanic for Subtlety. When using <SpellLink id={SPELLS.SHADOW_DANCE.id} />, <SpellLink id={SPELLS.VANISH.id} /> or <SpellLink id={SPELLS.SUBTERFUGE_TALENT.id} /> you need to make the most of your stealth abilities, using up every GCD. To achieve this you might need to pool some energy. Depending on your talents, the amount of energy required differs between 60 and 90. Its also important to use correct spells in stealth, for example <SpellLink id={SPELLS.BACKSTAB.id} /> should be replaced by <SpellLink id={SPELLS.SHADOWSTRIKE.id} />
            </React.Fragment>
          )}
        >
          <Requirement
            name={(
              <React.Fragment>
                <dfn data-tip="includes Subterfuge if talented">Casts  in Stealth/Vanish*</dfn>                
              </React.Fragment>
            )}
            thresholds={thresholds.castsInStealth}
          />
          <Requirement
            name={(
              <React.Fragment>
                Casts  in <SpellLink id={SPELLS.SHADOW_DANCE.id} />
              </React.Fragment>
            )}
            thresholds={thresholds.castsInShadowDance}
          />
          <Requirement
            name={(
              <React.Fragment>
                <SpellLink id={SPELLS.BACKSTAB.id} />   used from <SpellLink id={SPELLS.SHADOW_DANCE.id} />
              </React.Fragment>
            )}
            thresholds={thresholds.backstabInShadowDance}
          />
          <Requirement
            name={(
              <React.Fragment>
                <SpellLink id={SPELLS.BACKSTAB.id} /> <dfn data-tip="includes Vanish and Subterfuge if talented">used from Stealth*</dfn>
              </React.Fragment>
            )}
            thresholds={thresholds.backstabInStealth}
          />
          {combatant.hasTalent(SPELLS.FIND_WEAKNESS_TALENT.id) && (
          <Requirement
            name={(
              <React.Fragment>
                With <SpellLink id={SPELLS.FIND_WEAKNESS_TALENT.id} /> use <SpellLink id={SPELLS.VANISH.id} /> only when Find Weakness is not up or about to run out
              </React.Fragment>
            )}
            thresholds={thresholds.findWeaknessVanish}
          /> )}
        </Rule>
        <PreparationRule thresholds={thresholds} />

      </Checklist>
    );
  }
}

export default SubRogueChecklist;
