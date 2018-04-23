import Analyzer from './Analyzer';

describe('Core.CombatLogParser', () => {
  describe('module defining', () => {
    it('owner is availabe as property', () => {
      const myOwner = {};
      // noinspection JSCheckFunctionSignatures
      const myModule = new Analyzer(myOwner, {}, null);

      expect(myModule.owner).toBe(myOwner);
    });
    it('dependencies are available as properties', () => {
      const myDependency = {};
      const myModule = new Analyzer(null, {
        myDependency,
      }, null);

      expect(myModule.myDependency).toBe(myDependency);
    });
    it('priority is availabe as property', () => {
      const priority = 27;
      const myModule = new Analyzer(null, {}, priority);

      expect(myModule.priority).toBe(priority);
    });
  });
  describe('triggerEvent', () => {
    it('calls the event handler on the class if it exists', () => {
      const on_success = jest.fn();
      class MyModule extends Analyzer {
        on_success = on_success;
      }
      const myModule = new MyModule();
      myModule.triggerEvent({
        type: 'success',
      });
      expect(on_success).toBeCalled();
    });
    it('does nothing if the event handler on the class does not exist', () => {
      class MyModule extends Analyzer {}
      const myModule = new MyModule();
      myModule.triggerEvent({
        type: 'success',
      });
      // Ummm how do we test for it doing nothing? I guess it just shouldn't crash...
    });
    it('calls on_event on every event if it exists', () => {
      const on_event = jest.fn();
      class MyModule extends Analyzer {
        on_event = on_event;
      }
      const myModule = new MyModule();
      myModule.triggerEvent({
        type: 'test',
      });
      expect(on_event).toBeCalled();
    });
    it('calls convenience handlers byPlayer and toPlayer', () => {
      const on_byPlayer_test = jest.fn();
      const on_toPlayer_test = jest.fn();
      const on_byPlayerPet_test = jest.fn();
      const on_toPlayerPet_test = jest.fn();
      class MyModule extends Analyzer {
        on_byPlayer_test = on_byPlayer_test;
        on_toPlayer_test = on_toPlayer_test;
        on_byPlayerPet_test = on_byPlayerPet_test;
        on_toPlayerPet_test = on_toPlayerPet_test;
      }
      const myModule = new MyModule({
        byPlayer: () => true,
        toPlayer: () => true,
        byPlayerPet: () => true,
        toPlayerPet: () => true,
      });
      myModule.triggerEvent({
        type: 'test',
      });
      expect(on_byPlayer_test).toBeCalled();
      expect(on_toPlayer_test).toBeCalled();
      expect(on_byPlayerPet_test).toBeCalled();
      expect(on_toPlayerPet_test).toBeCalled();
    });
    it('doesn\'t call convenience handlers byPlayer when event is by someone else', () => {
      const on_byPlayer_test = jest.fn();
      class MyModule extends Analyzer {
        on_byPlayer_test = on_byPlayer_test;
      }
      const myModule = new MyModule({
        byPlayer: () => false,
        toPlayer: () => true,
        byPlayerPet: () => true,
        toPlayerPet: () => true,
      });
      myModule.triggerEvent({
        type: 'test',
      });
      expect(on_byPlayer_test).not.toBeCalled();
    });
    it('doesn\'t call convenience handlers toPlayer when event is to someone else', () => {
      const on_toPlayer_test = jest.fn();
      class MyModule extends Analyzer {
        on_toPlayer_test = on_toPlayer_test;
      }
      const myModule = new MyModule({
        byPlayer: () => true,
        toPlayer: () => false,
        byPlayerPet: () => true,
        toPlayerPet: () => true,
      });
      myModule.triggerEvent({
        type: 'test',
      });
      expect(on_toPlayer_test).not.toBeCalled();
    });
    it('doesn\'t call convenience handlers byPlayerPet when event is by someone else', () => {
      const on_byPlayerPet_test = jest.fn();
      class MyModule extends Analyzer {
        on_byPlayerPet_test = on_byPlayerPet_test;
      }
      const myModule = new MyModule({
        byPlayer: () => true,
        toPlayer: () => true,
        byPlayerPet: () => false,
        toPlayerPet: () => true,
      });
      myModule.triggerEvent({
        type: 'test',
      });
      expect(on_byPlayerPet_test).not.toBeCalled();
    });
    it('doesn\'t call convenience handlers toPlayerPet when event is to someone else', () => {
      const on_toPlayerPet_test = jest.fn();
      class MyModule extends Analyzer {
        on_toPlayerPet_test = on_toPlayerPet_test;
      }
      const myModule = new MyModule({
        byPlayer: () => true,
        toPlayer: () => true,
        byPlayerPet: () => true,
        toPlayerPet: () => false,
      });
      myModule.triggerEvent({
        type: 'test',
      });
      expect(on_toPlayerPet_test).not.toBeCalled();
    });
    it('sets `this` to the module', () => {
      const on_success = jest.fn();
      class MyModule extends Analyzer {
        on_success = on_success;
      }
      const myModule = new MyModule();
      myModule.triggerEvent({
        type: 'success',
      });
      expect(on_success.mock.instances[0]).toBe(myModule);
    });
  });
});
