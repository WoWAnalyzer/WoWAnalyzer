import CombatLogParser from 'Parser/Core/CombatLogParser';

class MyModule {}
const myModule = new MyModule();
class MySubModule extends MyModule {}
const mySubModule = new MySubModule();

describe('Core.CombatLogParser', () => {
  describe('constructor', () => {
    it('loads default modules', () => {
      class MyCombatLogParser extends CombatLogParser {
        static defaultModules = {
          myModule: MyModule,
        };
        static specModules = {};
      }
      const parser = new MyCombatLogParser(null, null, null);
      expect(parser.modules.myModule).toBeInstanceOf(MyModule);
      expect(Object.keys(parser.modules).length).toBe(1);
    });
    it('loads spec modules', () => {
      class MyCombatLogParser extends CombatLogParser {
        static defaultModules = {};
        static specModules = {
          myModule: MyModule,
        };
      }
      const parser = new MyCombatLogParser(null, null, null);
      expect(parser.modules.myModule).toBeInstanceOf(MyModule);
      expect(Object.keys(parser.modules).length).toBe(1);
    });
    it('allows spec modules to override default modules', () => {
      class MyCombatLogParser extends CombatLogParser {
        static defaultModules = {
          myModule: MyModule,
        };
        static specModules = {
          myModule: MySubModule,
        };
      }
      const parser = new MyCombatLogParser(null, null, null);
      expect(parser.modules.myModule).toBeInstanceOf(MySubModule);
      expect(Object.keys(parser.modules).length).toBe(1);
    });
    it('only instantiates the overrider', () => {
      const MyModule = jest.fn();
      const MySubModule = jest.fn();
      class MyCombatLogParser extends CombatLogParser {
        static defaultModules = {
          myModule: MyModule,
        };
        static specModules = {
          myModule: MySubModule,
        };
      }
      const parser = new MyCombatLogParser(null, null, null);
      expect(parser.error).toBeFalsy();
      expect(MyModule.mock.instances.length).toBe(0);
      expect(MySubModule.mock.instances.length).toBe(1);
    });
  });
  describe('implementation', () => {
    it('has a default config that works', () => {
      const parser = new CombatLogParser(null, null, null);
      expect(Object.keys(parser.modules).length).toBeGreaterThan(0);
    });
  });
});
