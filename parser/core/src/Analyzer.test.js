import Events, { EventType } from 'parser/core/Events';
import TestCombatLogParser from 'parser/core/tests/TestCombatLogParser';
import EventEmitter from 'parser/core/modules/EventEmitter';

import Analyzer from './Analyzer';
import { SELECTED_PLAYER, SELECTED_PLAYER_PET } from './EventFilter';

describe('Core/Analyzer', () => {
  let parser;
  let eventEmitter;
  beforeEach(() => {
    parser = new TestCombatLogParser();
    eventEmitter = parser.getModule(EventEmitter);
  });
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
    it('calls the event handler on the class if it exists', () => {
      const onSuccess = jest.fn();
      class MyModule extends Analyzer {
        constructor(options){
          super(options);
          this.addEventListener('success', this.onSuccess);
        }
        onSuccess() {
          onSuccess();
        }
      }
      parser.loadModule(MyModule);
      eventEmitter.triggerEvent({
        type: 'success',
      });
      expect(onSuccess).toBeCalled();
    });
    it('does nothing if the event handler on the class does not exist', () => {
      class MyModule extends Analyzer {}
      parser.loadModule(MyModule);
      eventEmitter.triggerEvent({
        type: 'success',
      });
      // Ummm how do we test for it doing nothing? I guess it just shouldn't crash...
    });
    it('calls on_event on every event if it exists', () => {
      const onEvent = jest.fn();
      class MyModule extends Analyzer {
        constructor(options){
          super(options);
          this.addEventListener(Events.any, this.onEvent);
        }
        onEvent() {
          onEvent();
        }
      }
      parser.loadModule(MyModule);
      eventEmitter.triggerEvent({
        type: EventType.Test,
      });
      expect(onEvent).toBeCalled();
    });
    it('calls convenience handlers byPlayer and toPlayer', () => {
      const onByPlayerTest = jest.fn();
      const onToPlayerTest = jest.fn();
      const onByPlayerPetTest = jest.fn();
      const onToPlayerPetTest = jest.fn();
      class MyModule extends Analyzer {
        constructor(options){
          super(options);
          this.addEventListener(Events.test.by(SELECTED_PLAYER), this.onByPlayerTest);
          this.addEventListener(Events.test.to(SELECTED_PLAYER), this.onToPlayerTest);
          this.addEventListener(Events.test.by(SELECTED_PLAYER_PET), this.onByPlayerPetTest);
          this.addEventListener(Events.test.to(SELECTED_PLAYER_PET), this.onToPlayerPetTest);
        }
        onByPlayerTest() {
          onByPlayerTest();
        }
        onToPlayerTest() {
          onToPlayerTest();
        }
        onByPlayerPetTest() {
          onByPlayerPetTest();
        }
        onToPlayerPetTest() {
          onToPlayerPetTest();
        }
      }
      parser.loadModule(MyModule);
      eventEmitter.triggerEvent({
        type: EventType.Test,
      });
      expect(onByPlayerTest).toBeCalled();
      expect(onToPlayerTest).toBeCalled();
      expect(onByPlayerPetTest).toBeCalled();
      expect(onToPlayerPetTest).toBeCalled();
    });
    it('doesn\'t call convenience handlers byPlayer when event is by someone else', () => {
      const onByPlayerTest = jest.fn();
      const onToPlayerTest = jest.fn();
      const onByPlayerPetTest = jest.fn();
      const onToPlayerPetTest = jest.fn();
      class MyModule extends Analyzer {
        constructor(options){
          super(options);
          this.addEventListener(Events.test.by(SELECTED_PLAYER), this.onByPlayerTest);
          this.addEventListener(Events.test.to(SELECTED_PLAYER), this.onToPlayerTest);
          this.addEventListener(Events.test.by(SELECTED_PLAYER_PET), this.onByPlayerPetTest);
          this.addEventListener(Events.test.to(SELECTED_PLAYER_PET), this.onToPlayerPetTest);
        }
        onByPlayerTest() {
          onByPlayerTest();
        }
        onToPlayerTest() {
          onToPlayerTest();
        }
        onByPlayerPetTest() {
          onByPlayerPetTest();
        }
        onToPlayerPetTest() {
          onToPlayerPetTest();
        }
      }
      parser.byPlayer = jest.fn(() => false);
      parser.loadModule(MyModule);
      eventEmitter.triggerEvent({
        type: EventType.Test,
      });
      expect(onByPlayerTest).not.toBeCalled();
      expect(onToPlayerTest).toBeCalled();
      expect(onByPlayerPetTest).toBeCalled();
      expect(onToPlayerPetTest).toBeCalled();
    });
    it('doesn\'t call convenience handlers toPlayer when event is to someone else', () => {
      const onByPlayerTest = jest.fn();
      const onToPlayerTest = jest.fn();
      const onByPlayerPetTest = jest.fn();
      const onToPlayerPetTest = jest.fn();
      class MyModule extends Analyzer {
        constructor(options){
          super(options);
          this.addEventListener(Events.test.by(SELECTED_PLAYER), this.onByPlayerTest);
          this.addEventListener(Events.test.to(SELECTED_PLAYER), this.onToPlayerTest);
          this.addEventListener(Events.test.by(SELECTED_PLAYER_PET), this.onByPlayerPetTest);
          this.addEventListener(Events.test.to(SELECTED_PLAYER_PET), this.onToPlayerPetTest);
        }
        onByPlayerTest() {
          onByPlayerTest();
        }
        onToPlayerTest() {
          onToPlayerTest();
        }
        onByPlayerPetTest() {
          onByPlayerPetTest();
        }
        onToPlayerPetTest() {
          onToPlayerPetTest();
        }
      }
      parser.toPlayer = jest.fn(() => false);
      parser.loadModule(MyModule);
      eventEmitter.triggerEvent({
        type: EventType.Test,
      });
      expect(onByPlayerTest).toBeCalled();
      expect(onToPlayerTest).not.toBeCalled();
      expect(onByPlayerPetTest).toBeCalled();
      expect(onToPlayerPetTest).toBeCalled();
    });
    it('doesn\'t call convenience handlers byPlayerPet when event is by someone else', () => {
      const onByPlayerTest = jest.fn();
      const onToPlayerTest = jest.fn();
      const onByPlayerPetTest = jest.fn();
      const onToPlayerPetTest = jest.fn();
      class MyModule extends Analyzer {
        constructor(options){
          super(options);
          this.addEventListener(Events.test.by(SELECTED_PLAYER), this.onByPlayerTest);
          this.addEventListener(Events.test.to(SELECTED_PLAYER), this.onToPlayerTest);
          this.addEventListener(Events.test.by(SELECTED_PLAYER_PET), this.onByPlayerPetTest);
          this.addEventListener(Events.test.to(SELECTED_PLAYER_PET), this.onToPlayerPetTest);
        }
        onByPlayerTest() {
          onByPlayerTest();
        }
        onToPlayerTest() {
          onToPlayerTest();
        }
        onByPlayerPetTest() {
          onByPlayerPetTest();
        }
        onToPlayerPetTest() {
          onToPlayerPetTest();
        }
      }
      parser.byPlayerPet = jest.fn(() => false);
      parser.loadModule(MyModule);
      eventEmitter.triggerEvent({
        type: EventType.Test,
      });
      expect(onByPlayerTest).toBeCalled();
      expect(onToPlayerTest).toBeCalled();
      expect(onByPlayerPetTest).not.toBeCalled();
      expect(onToPlayerPetTest).toBeCalled();
    });
    it('doesn\'t call convenience handlers toPlayerPet when event is to someone else', () => {
      const onByPlayerTest = jest.fn();
      const onToPlayerTest = jest.fn();
      const onByPlayerPetTest = jest.fn();
      const onToPlayerPetTest = jest.fn();
      class MyModule extends Analyzer {
        constructor(options){
          super(options);
          this.addEventListener(Events.test.by(SELECTED_PLAYER), this.onByPlayerTest);
          this.addEventListener(Events.test.to(SELECTED_PLAYER), this.onToPlayerTest);
          this.addEventListener(Events.test.by(SELECTED_PLAYER_PET), this.onByPlayerPetTest);
          this.addEventListener(Events.test.to(SELECTED_PLAYER_PET), this.onToPlayerPetTest);
        }
        onByPlayerTest() {
          onByPlayerTest();
        }
        onToPlayerTest() {
          onToPlayerTest();
        }
        onByPlayerPetTest() {
          onByPlayerPetTest();
        }
        onToPlayerPetTest() {
          onToPlayerPetTest();
        }
      }
      parser.toPlayerPet = jest.fn(() => false);
      parser.loadModule(MyModule);
      eventEmitter.triggerEvent({
        type: EventType.Test,
      });
      expect(onByPlayerTest).toBeCalled();
      expect(onToPlayerTest).toBeCalled();
      expect(onByPlayerPetTest).toBeCalled();
      expect(onToPlayerPetTest).not.toBeCalled();
    });
    it('sets `this` to the module', () => {
      const onSuccess = jest.fn();
      class MyModule extends Analyzer {
        constructor(options){
          super(options);
          this.addEventListener('success', this.onSuccess);
        }
        onSuccess() {
          onSuccess.call(this);
        }
      }
      parser.loadModule(MyModule);
      eventEmitter.triggerEvent({
        type: 'success',
      });
      expect(onSuccess.mock.instances[0]).toBe(parser.getModule(MyModule));
    });
  });
});
