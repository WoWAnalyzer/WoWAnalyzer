import Constructed from './Constructed';

type ConstructedModules<T> = {
  [Key in keyof T]: Constructed<T[Key]>;
};

export default ConstructedModules;
