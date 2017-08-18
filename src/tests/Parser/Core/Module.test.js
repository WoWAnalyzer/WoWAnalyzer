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
});
