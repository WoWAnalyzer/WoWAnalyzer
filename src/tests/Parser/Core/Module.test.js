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
    it('calls on_event on every event if it exists', () => {
      const on_event = jest.fn();
      class MyModule extends Module {
        on_event = on_event;
      }
      const myModule = new MyModule();
      myModule.triggerEvent('test');
      expect(on_event).toBeCalled();
    });
    it('calls convenience handlers byPlayer and toPlayer', () => {
      const on_byPlayer_test = jest.fn();
      const on_toPlayer_test = jest.fn();
      class MyModule extends Module {
        on_byPlayer_test = on_byPlayer_test;
        on_toPlayer_test = on_toPlayer_test;
      }
      const myModule = new MyModule({
        byPlayer: () => true,
        toPlayer: () => true,
      });
      myModule.triggerEvent('test', {});
      expect(on_byPlayer_test).toBeCalled();
      expect(on_toPlayer_test).toBeCalled();
    });
    it('doesn\'t call convenience handlers byPlayer when event is by someone else', () => {
      const on_byPlayer_test = jest.fn();
      class MyModule extends Module {
        on_byPlayer_test = on_byPlayer_test;
      }
      const myModule = new MyModule({
        byPlayer: () => false,
        toPlayer: () => true,
      });
      myModule.triggerEvent('test', {});
      expect(on_byPlayer_test).not.toBeCalled();
    });
    it('doesn\'t call convenience handlers toPlayer when event is to someone else', () => {
      const on_toPlayer_test = jest.fn();
      class MyModule extends Module {
        on_toPlayer_test = on_toPlayer_test;
      }
      const myModule = new MyModule({
        byPlayer: () => true,
        toPlayer: () => false,
      });
      myModule.triggerEvent('test', {});
      expect(on_toPlayer_test).not.toBeCalled();
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
