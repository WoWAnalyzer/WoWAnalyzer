import Module from 'parser/core/Module';

type ModuleList<T> = {
  [Key in keyof T]: T[Key] extends typeof Module ? InstanceType<T[Key]> : never;
};

export default ModuleList;
