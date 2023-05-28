# The APL Data Section

This component provides a section that includes:

- APL Summary / Description
- Detection of common problems (skipping rules, over-casting filler spells)
- Breakdown of individual mistakes on a snippet of the timeline.

## Usage

Assuming that you already have an APL (see the [wiki](https://github.com/WoWAnalyzer/WoWAnalyzer/wiki/APLCheck) if you don't), you can add the component to your guide using:

```tsx
import { AplSectionData } from 'interface/guide/components/Apl';
// replace this with however you structured your apl checking module
import * as AplCheck from './modules/core/AplCheck';

<Section title="Rotation">
  <p>
    <em>Insert explanation of the rotation.</em>
  </p>
  <AplSectionData checker={AplCheck.check} apl={AplCheck.apl} />
</Section>;
```

## Custom Problem Detection

In addition to the default problems that are detected, you can provide your own
problem definitions to detect spec-specific problems. Check out the
[claims](./violations/claims.tsx) file for the definitions of the default
explainers (`droppedRule` and `overcastFiller`).

### Concepts: Problems, Claims, and Explainers

A _problem_ is something that the player did wrong in their rotation. For
example: they might have cast their filler spell way too often.

An _explainer_ is the code that detects & explains a kind of problem to the
player on WoWA. For example: the `droppedRule` explainer detects problems where
the player skipped rules in the APL. Each rule that gets skipped is a problem.

A _claim_ is an individual mistake (also called a _violation_) that is
"claimed" by a problem. When you write an explainer, you implement a function
`claims` that finds mistakes and claims them. This is used in two ways.

First, the number of claimed mistakes is used to prioritize things in the "Most
Common Problems" list. More claimed mistakes = more common problem. This helps
players focus on fixing things that will be the highest impact.

Second, each mistake is shown only once. This is done by having the _most
common_ problem explain the mistake. Other problems that claimed the mistake
skip it. This helps keep players from getting overwhelmed (which could happen
if we showed a large number of mistakes) or from being distracted by the same
mistake being shown repeatedly.

There are technical details on this in the comments of the claims code, but you
mostly don't have to worry about how this is implemented.

### Defining a Problem

You define a new problem with the interface `ViolationExplainer`, which has 3 required methods:

```tsx
export type ViolationExplainer<T> = {
  /**
   * Examine the results of the APL check and produce a list of problems, each
   * of which claims some of the detected mistakes.
   */
  claim: (apl: Apl, result: CheckResult) => Array<AplProblemData<T>>;
  /**
   * Render an explanation of the overall claims made.
   *
   * This is what shows in the "Most Common Problems" section of the guide.
   */
  render: (problem: AplProblemData<T>, apl: Apl, result: CheckResult) => JSX.Element;
  /**
   * Render a description of an individual violation. What was done wrong? What should be done differently?
   *
   * This is what shows next to the timeline in the guide.
   */
  describe: (props: { apl: Apl; violation: Violation; result: CheckResult }) => JSX.Element | null;
};
```

### Adding the Problem to Your Guide

When you render `<AplSectionData ... />`, add the `violationExplainers` property:

```tsx
<AplSectionData
  checker={AplCheck.check}
  apl={AplCheck.apl}
  violationExplainers={{
    ...defaultExplainers,
    myProblemExplainer,
  }}
/>
```

## Differences from Suggestions

The output of this is very similar to the `suggestions` code we have
historically used, with two differences:

1. You don't need to configure major/average/minor levels yourself. Problems
   are instead detected and prioritized based on the APL---no more spurious
   "You should cast X more" suggestions when doing so would required skipping
   casts of a higher-priority ability.

2. A lot of the suggestions themselves can be auto-generated. The two default
   explainers should cover a lot of ground for DPS and tank specs---adding a
   custom explainer should be fairly rare.

**tl;dr** - You can think of this as "auto-generating" rotational suggestions
based on your APL.
