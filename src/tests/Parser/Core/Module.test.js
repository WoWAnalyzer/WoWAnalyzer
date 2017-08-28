import Module from 'Parser/Core/Module';

describe('Core.CombatLogParser', () => {
  describe('module defining', () => {
    it('owner is availabe as property', () => {
      const myOwner = {};
      // noinspection JSCheckFunctionSignatures
      const myModule = new Module(myOwner, {}, null);

      expect(myModule.owner).toBe(myOwner);
    });
    it('dependencies are available as properties', () => {
      const myDependency = {};
      const myModule = new Module(null, {
        myDependency: myDependency,
      }, null);

      expect(myModule.myDependency).toBe(myDependency);
    });
    it('priority is availabe as property', () => {
      const priority = 27;
      const myModule = new Module(null, {}, priority);

      expect(myModule.priority).toBe(priority);
    });
  });
  describe('triggerEvent', () => {
    it('calls the event handler on the class if it exists', () => {
      const on_success = jest.fn();
      class MyModule extends Module {
        on_success = on_success;
      }
      const myModule = new MyModule();
      myModule.triggerEvent('success');
      expect(on_success).toBeCalled();
    });
    it('does nothing if the event handler on the class does not exist', () => {
      class MyModule extends Module {}
      const myModule = new MyModule();
      myModule.triggerEvent('success');
      // Ummm how do we test for it doing nothing? I guess it just shouldn't crash...
    });
    it('passes all arguments to event handler', () => {
      const on_success = jest.fn();
      class MyModule extends Module {
        on_success = on_success;
      }
      const myModule = new MyModule({
        toPlayer: () => true,
        byPlayer: () => true,
      });
      const firstArg = {};
      const secondArg = 'my_second_arg';
      myModule.triggerEvent('success', firstArg, secondArg);
      expect(on_success).toBeCalledWith(firstArg, secondArg);
    });
    it('sets `this` to the module', () => {
      const on_success = jest.fn();
      class MyModule extends Module {
        on_success = on_success;
      }
      const myModule = new MyModule();
      myModule.triggerEvent('success');
      expect(on_success.mock.instances[0]).toBe(myModule);
    });
  });
});
