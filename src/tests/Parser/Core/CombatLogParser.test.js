import CombatLogParser from 'Parser/Core/CombatLogParser';

class MyModule {}
const myModule = new MyModule();
class MySubModule extends MyModule {}
const mySubModule = new MySubModule();
class EmptyCombatLogParser extends CombatLogParser {
  static defaultModules = {};
  static specModules = {};
}

describe('Core.CombatLogParser', () => {
  describe('module defining', () => {
    it('loads default modules', () => {
      class MyCombatLogParser extends EmptyCombatLogParser {
        static defaultModules = {
          myModule: MyModule,
        };
      }
      const parser = new MyCombatLogParser(null, null, null);
      expect(parser.modules.myModule).toBeInstanceOf(MyModule);
      expect(Object.keys(parser.modules).length).toBe(1);
    });
    it('loads spec modules', () => {
      class MyCombatLogParser extends EmptyCombatLogParser {
        static specModules = {
          myModule: MyModule,
        };
      }
      const parser = new MyCombatLogParser(null, null, null);
      expect(parser.modules.myModule).toBeInstanceOf(MyModule);
      expect(Object.keys(parser.modules).length).toBe(1);
    });
    it('allows spec modules to override default modules', () => {
      class MyCombatLogParser extends EmptyCombatLogParser {
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
      class MyCombatLogParser extends EmptyCombatLogParser {
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
    it('allows spec modules to disable default modules', () => {
      class MyCombatLogParser extends EmptyCombatLogParser {
        static defaultModules = {
          myModule: MyModule,
        };
        static specModules = {
          myModule: null,
        };
      }
      const parser = new MyCombatLogParser(null, null, null);
      expect(parser.modules.myModule).toBe(undefined);
      expect(Object.keys(parser.modules).length).toBe(0);
    });
  });
  describe('module finding', () => {

  });
  describe('module dependencies', () => {
    it('loads a module without dependencies and reveals it under the `modules` property', () => { // this is more or less just a test whether our test method actually works
      const parser = new EmptyCombatLogParser();
      expect(Object.keys(parser.modules).length).toBe(0); // sanity check
      parser.initializeModules({
        myModule: MyModule,
      });
      expect(parser.modules.myModule).toBeInstanceOf(MyModule);
    });
    it('loads a module with a dependency that\'s in the right order already', () => {
      class MyChildModule {
        static dependencies = {
          parent: MyModule,
        };
      }
      const parser = new EmptyCombatLogParser();
      parser.initializeModules({
        myModule: MyModule,
        myChildModule: MyChildModule,
      });
      expect(Object.keys(parser.modules).length).toBe(2);
      expect(parser.modules.myModule).toBeInstanceOf(MyModule);
      expect(parser.modules.myChildModule).toBeInstanceOf(MyChildModule);
    });
    it('loads a module with a dependency that\'s in the wrong order', () => {
      class MyChildModule {
        static dependencies = {
          parent: MyModule,
        };
      }
      const parser = new EmptyCombatLogParser();
      parser.initializeModules({
        myChildModule: MyChildModule, // this requires MyModule, so loading this will have to be delayed
        myParentModule: MyModule,
      });
      expect(Object.keys(parser.modules).length).toBe(2);
      expect(parser.modules.myParentModule).toBeInstanceOf(MyModule);
      expect(parser.modules.myChildModule).toBeInstanceOf(MyChildModule);
    });
    it('does NOT autoload a dependency when parent is not used by the CombatLogParser', () => {
      class MyChildModule {
        static dependencies = {
          parent: MyModule,
        };
      }
      const parser = new EmptyCombatLogParser();
      expect(() => {
        parser.initializeModules({
          myChildModule: MyChildModule,
        });
      }).toThrow('Maximum call stack size exceeded'); // Relying on this exception might not be the cleaenst solution, but the module loading keeps trying until the parent module is loaded, and aborting after some time could be implemented but isn't easy to write and not useful enough.
    });
    it('accepts classes that extend the class we\'re looking for as dependencies', () => {
      class MyChildModule {
        static dependencies = {
          parent: MyModule,
        };
      }
      const parser = new EmptyCombatLogParser();
      parser.initializeModules({
        myModule: MySubModule,
        myChildModule: MyChildModule,
      });
      expect(Object.keys(parser.modules).length).toBe(2);
      expect(parser.modules.myModule).toBeInstanceOf(MySubModule);
      expect(parser.modules.myChildModule).toBeInstanceOf(MyChildModule);
    });
    it('passes the dependencies as a prop', () => {
      const MyChildModule = jest.fn();
      MyChildModule.dependencies = {
        parent: MyModule,
      };
      const parser = new EmptyCombatLogParser();
      parser.initializeModules({
        myModule: MyModule,
        myChildModule: MyChildModule,
      });
      const dependencies = MyChildModule.mock.calls[0][1];
      expect(Object.keys(dependencies).length).toBe(1);
      expect(dependencies.parent).toBeInstanceOf(MyModule);
    });
    it('automatically assigns priorities as required', () => {
      const MyAlternativeModule = jest.fn();
      const MyParentModule = jest.fn();
      const MyChildModule = jest.fn();
      MyChildModule.dependencies = {
        parent: MyParentModule,
      };
      const parser = new EmptyCombatLogParser();
      parser.initializeModules({
        myAlternativeModule: MyAlternativeModule,
        myChildModule: MyChildModule, // this requires MyModule, so loading this will have to be delayed
        myParentModule: MyParentModule,
      });
      expect(MyAlternativeModule.mock.calls[0][2]).toBe(0);
      expect(MyParentModule.mock.calls[0][2]).toBe(1);
      expect(MyChildModule.mock.calls[0][2]).toBe(2);
    });
  });
  describe('implementation', () => {
    it('has a default config that works', () => {
      const parser = new CombatLogParser(null, null, null);
      expect(Object.keys(parser.modules).length).toBeGreaterThan(0);
    });
  });
});
