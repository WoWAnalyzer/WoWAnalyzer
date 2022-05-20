import { ControlledExpandable } from 'interface/Expandable';
import DropdownIcon from 'interface/icons/Dropdown';
import type { Options } from 'parser/core/Analyzer';
import type CombatLogParser from 'parser/core/CombatLogParser';
import { useState } from 'react';

import './Guide.scss';

type Constructed<T> = T extends new (options: Options) => infer R ? R : never;
type ConstructedModules<T> = {
  [Key in keyof T]: Constructed<T[Key]>;
};

type HasSpecModules<Deps> = { specModules: Deps };

export type ModulesOf<T extends typeof CombatLogParser> = ConstructedModules<
  typeof CombatLogParser.internalModules
> &
  ConstructedModules<typeof CombatLogParser.defaultModules> &
  (T extends HasSpecModules<infer Deps> ? ConstructedModules<Deps> : never);

export type GuideProps<T extends typeof CombatLogParser> = {
  modules: ModulesOf<T>;
};
export type Guide<T extends typeof CombatLogParser = any> = (
  props: GuideProps<T>,
) => JSX.Element | null;

export default Guide;

const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <header className="flex">
    <div className="flex-main name">{children}</div>
    <div className="flex-sub chevron">
      <DropdownIcon />
    </div>
  </header>
);

export const Section = ({ children, title }: React.PropsWithChildren<{ title: string }>) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <ControlledExpandable
      header={<SectionHeader>{title}</SectionHeader>}
      element="section"
      inverseExpanded={() => setIsExpanded(!isExpanded)}
      expanded={isExpanded}
    >
      {children}
    </ControlledExpandable>
  );
};

export const GuideContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="guide-container">{children}</div>
);

export const SubSection = ({ children, title }: React.PropsWithChildren<{ title: string }>) => (
  <section className="subsection">
    <header>{title}</header>
    {children}
  </section>
);
