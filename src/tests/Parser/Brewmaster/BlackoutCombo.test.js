import BlackoutCombo from 'Parser/BrewmasterMonk/Modules/Spells/BlackoutCombo';
import SPELLS from 'common/SPELLS';
import { processEvents } from './Fixtures/processEvents';
import { SimpleFight, applybuff, refreshBuff } from './Fixtures/SimpleFight';

describe('Brewmaster.BlackoutCombo', () => {
  let blackoutCombo;
  beforeEach(() => {
    blackoutCombo = new BlackoutCombo();
  });
  it('blackout combo is active by default', () => {
    expect(blackoutCombo.active).toBe(true);
  });
  it('blackout combo checks to see if active while talent is not selected', () => {
    const hasTalentMethod = jest.fn();
    hasTalentMethod.mockReturnValue(false);
    const owner = { selectedCombatant: { hasTalent: hasTalentMethod}};
    blackoutCombo.owner = owner;
    blackoutCombo.triggerEvent('initialized');
    expect(hasTalentMethod).toBeCalledWith(SPELLS.BLACKOUT_COMBO_TALENT.id);
    expect(blackoutCombo.active).toBe(false);
  });
  it('blackout combo checks to see if active while talent is selected', () => {
    const hasTalentMethod = jest.fn();
    hasTalentMethod.mockReturnValue(true);
    const owner = { selectedCombatant: { hasTalent: hasTalentMethod}};
    blackoutCombo.owner = owner;
    blackoutCombo.triggerEvent('initialized');
    expect(hasTalentMethod).toBeCalledWith(SPELLS.BLACKOUT_COMBO_TALENT.id);
    expect(blackoutCombo.active).toBe(true);
  });
  it('track blackout combo buffs applied', () => {
    processEvents([...applybuff, ...refreshBuff], blackoutCombo)
    expect(blackoutCombo.blackoutComboBuffs).toBe(3);
  });
  it('track blackout combos wasted', () => {
    processEvents([...applybuff, ...refreshBuff], blackoutCombo)
    expect(blackoutCombo.blackoutComboWasted).toBe(1);
  });
  it('track blackout combos consumed by other spells', () => {
    processEvents(SimpleFight, blackoutCombo)
    expect(blackoutCombo.blackoutComboConsumed).toBe(2);
  });
});
