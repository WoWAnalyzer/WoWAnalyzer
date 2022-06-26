import { ControlledExpandable } from 'interface/Expandable';
import DropdownIcon from 'interface/icons/Dropdown';
import type { Options } from 'parser/core/Analyzer';
import type CombatLogParser from 'parser/core/CombatLogParser';
import { AnyEvent } from 'parser/core/Events';
import { Info } from 'parser/core/metric';
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
  events: AnyEvent[];
  info: Info;
};
export type Guide<T extends typeof CombatLogParser = any> = (
  props: GuideProps<T>,
) => JSX.Element | null;

export default Guide;

export const SectionHeader = ({ children }: { children: React.ReactNode }) => (
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

export const SubSection = ({
  children,
  title,
  style,
}: React.PropsWithChildren<{ title: string; style?: React.CSSProperties }>) => (
  <section className="subsection">
    <header>{title}</header>
    <div style={style}>{children}</div>
  </section>
);

export function PassFailBar({ pass, total }: { pass: number; total: number }) {
  const perf = pass / total;
  return (
    <div className="pass-fail-bar-container">
      <div className="pass-bar" style={{ minWidth: `${perf * 100}%` }} />
      {perf < 1 && <div className="fail-bar" style={{ minWidth: `${(1 - perf) * 100}%` }} />}
    </div>
  );
}
