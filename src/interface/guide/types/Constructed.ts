import type { Options } from 'parser/core/Analyzer';

type Constructed<T> = T extends new (options: Options) => infer R ? R : never;

export default Constructed;
