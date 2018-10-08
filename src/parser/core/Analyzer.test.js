import TestCombatLogParser from 'parser/core/tests/TestCombatLogParser';

import Analyzer from './Analyzer';

describe('Core/Analyzer', () => {
  describe('module defining', () => {
    it('owner is availabe as property', () => {
      const myOwner = {};
      // noinspection JSCheckFunctionSignatures
      const myModule = new Analyzer({
        owner: myOwner,
      });

      expect(myModule.owner).toBe(myOwner);
    });
    it('dependencies are available as properties', () => {
      const myDependency = {};
      const myModule = new Analyzer({
        myDependency,
      });

      expect(myModule.myDependency).toBe(myDependency);
    });
    it('priority is availabe as property', () => {
      const priority = 27;
      const myModule = new Analyzer({
        priority,
      });

      expect(myModule.priority).toBe(priority);
    });
  });
  describe('triggerEvent', () => {
    let parser;
    beforeEach(() => {
      parser = new TestCombatLogParser();
    });
    it('calls the event handler on the class if it exists', () => {
      const on_success = jest.fn();
      class MyModule extends Analyzer {
        on_success() {
          on_success();
        }
      }
      // eslint-disable-next-line no-new
      new MyModule({ owner: parser });
      parser.triggerEvent({
        type: 'success',
      });
      expect(on_success).toBeCalled();
    });
    it('does nothing if the event handler on the class does not exist', () => {
      class MyModule extends Analyzer {}
      // eslint-disable-next-line no-new
      new MyModule({ owner: parser });
      parser.triggerEvent({
        type: 'success',
      });
      // Ummm how do we test for it doing nothing? I guess it just shouldn't crash...
    });
    it('calls on_event on every event if it exists', () => {
      const on_event = jest.fn();
      class MyModule extends Analyzer {
        on_event() {
          on_event();
        }
      }
      // eslint-disable-next-line no-new
      new MyModule({ owner: parser });
      parser.triggerEvent({
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
        on_byPlayer_test() {
          on_byPlayer_test();
        }
        on_toPlayer_test() {
          on_toPlayer_test();
        }
        on_byPlayerPet_test() {
          on_byPlayerPet_test();
        }
        on_toPlayerPet_test() {
          on_toPlayerPet_test();
        }
      }
      // eslint-disable-next-line no-new
      new MyModule({ owner: parser });
      parser.triggerEvent({
        type: 'test',
      });
      expect(on_byPlayer_test).toBeCalled();
      expect(on_toPlayer_test).toBeCalled();
      expect(on_byPlayerPet_test).toBeCalled();
      expect(on_toPlayerPet_test).toBeCalled();
    });
    it('doesn\'t call convenience handlers byPlayer when event is by someone else', () => {
      const on_byPlayer_test = jest.fn();
      const on_toPlayer_test = jest.fn();
      const on_byPlayerPet_test = jest.fn();
      const on_toPlayerPet_test = jest.fn();
      class MyModule extends Analyzer {
        on_byPlayer_test() {
          on_byPlayer_test();
        }
        on_toPlayer_test() {
          on_toPlayer_test();
        }
        on_byPlayerPet_test() {
          on_byPlayerPet_test();
        }
        on_toPlayerPet_test() {
          on_toPlayerPet_test();
        }
      }
      parser.byPlayer = jest.fn(() => false);
      // eslint-disable-next-line no-new
      new MyModule({ owner: parser });
      parser.triggerEvent({
        type: 'test',
      });
      expect(on_byPlayer_test).not.toBeCalled();
      expect(on_toPlayer_test).toBeCalled();
      expect(on_byPlayerPet_test).toBeCalled();
      expect(on_toPlayerPet_test).toBeCalled();
    });
    it('doesn\'t call convenience handlers toPlayer when event is to someone else', () => {
      const on_byPlayer_test = jest.fn();
      const on_toPlayer_test = jest.fn();
      const on_byPlayerPet_test = jest.fn();
      const on_toPlayerPet_test = jest.fn();
      class MyModule extends Analyzer {
        on_byPlayer_test() {
          on_byPlayer_test();
        }
        on_toPlayer_test() {
          on_toPlayer_test();
        }
        on_byPlayerPet_test() {
          on_byPlayerPet_test();
        }
        on_toPlayerPet_test() {
          on_toPlayerPet_test();
        }
      }
      parser.toPlayer = jest.fn(() => false);
      // eslint-disable-next-line no-new
      new MyModule({ owner: parser });
      parser.triggerEvent({
        type: 'test',
      });
      expect(on_byPlayer_test).toBeCalled();
      expect(on_toPlayer_test).not.toBeCalled();
      expect(on_byPlayerPet_test).toBeCalled();
      expect(on_toPlayerPet_test).toBeCalled();
    });
    it('doesn\'t call convenience handlers byPlayerPet when event is by someone else', () => {
      const on_byPlayer_test = jest.fn();
      const on_toPlayer_test = jest.fn();
      const on_byPlayerPet_test = jest.fn();
      const on_toPlayerPet_test = jest.fn();
      class MyModule extends Analyzer {
        on_byPlayer_test() {
          on_byPlayer_test();
        }
        on_toPlayer_test() {
          on_toPlayer_test();
        }
        on_byPlayerPet_test() {
          on_byPlayerPet_test();
        }
        on_toPlayerPet_test() {
          on_toPlayerPet_test();
        }
      }
      parser.byPlayerPet = jest.fn(() => false);
      // eslint-disable-next-line no-new
      new MyModule({ owner: parser });
      parser.triggerEvent({
        type: 'test',
      });
      expect(on_byPlayer_test).toBeCalled();
      expect(on_toPlayer_test).toBeCalled();
      expect(on_byPlayerPet_test).not.toBeCalled();
      expect(on_toPlayerPet_test).toBeCalled();
    });
    it('doesn\'t call convenience handlers toPlayerPet when event is to someone else', () => {
      const on_byPlayer_test = jest.fn();
      const on_toPlayer_test = jest.fn();
      const on_byPlayerPet_test = jest.fn();
      const on_toPlayerPet_test = jest.fn();
      class MyModule extends Analyzer {
        on_byPlayer_test() {
          on_byPlayer_test();
        }
        on_toPlayer_test() {
          on_toPlayer_test();
        }
        on_byPlayerPet_test() {
          on_byPlayerPet_test();
        }
        on_toPlayerPet_test() {
          on_toPlayerPet_test();
        }
      }
      parser.toPlayerPet = jest.fn(() => false);
      // eslint-disable-next-line no-new
      new MyModule({ owner: parser });
      parser.triggerEvent({
        type: 'test',
      });
      expect(on_byPlayer_test).toBeCalled();
      expect(on_toPlayer_test).toBeCalled();
      expect(on_byPlayerPet_test).toBeCalled();
      expect(on_toPlayerPet_test).not.toBeCalled();
    });
    it('sets `this` to the module', () => {
      const on_success = jest.fn();
      class MyModule extends Analyzer {
        on_success() {
          on_success.call(this);
        }
      }
      const myModule = new MyModule({ owner: parser });
      parser.triggerEvent({
        type: 'success',
      });
      expect(on_success.mock.instances[0]).toBe(myModule);
    });
  });
});
