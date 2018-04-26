import CritEffectBonus from './CritEffectBonus';

describe('Core/Modules/Helpers/CritEffectBonus', () => {
  describe('module defining', () => {
    it('returns the default crit effect modifier without any hooks', () => {
      const mod = new CritEffectBonus();
      expect(mod.getBonus(null)).toBe(2);
    });
    it('calculates the result using its hooks', () => {
      const mod = new CritEffectBonus();
      mod.hook(critEffectModifier => critEffectModifier + 0.1);
      expect(mod.getBonus(null)).toBe(2.1);
    });
    it('supports countless hooks', () => {
      const mod = new CritEffectBonus();
      mod.hook(critEffectModifier => critEffectModifier + 0.1);
      mod.hook(critEffectModifier => critEffectModifier + 5);
      mod.hook(critEffectModifier => critEffectModifier / 2);
      expect(mod.getBonus(null)).toBe(3.55);
    });
    it('passes event around functional test', () => {
      const mod = new CritEffectBonus();
      const myEvent = {
        mySpecialSauce: 12.34,
      };
      mod.hook((critEffectModifier, event) => critEffectModifier + event.mySpecialSauce);
      expect(mod.getBonus(myEvent)).toBe(14.34);
    });
    it('passes event around technical test', () => {
      const mod = new CritEffectBonus();
      const myEvent = {};
      const myHook = jest.fn();
      mod.hook(myHook);
      mod.getBonus(myEvent);
      expect(myHook.mock.calls[0][1]).toBe(myEvent);
    });
  });
});
