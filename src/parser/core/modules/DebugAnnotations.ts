import { AnyEvent } from '../Events';
import Module from '../Module';

type AnnotationSet = Map<AnyEvent, Annotation[]>;

export interface Annotation {
  /**
   * CSS Color string. This is the color of the dot shown in the UI.
   */
  color: string;
  /**
   * A brief text-only description of the annotation. This is shown in the tooltip.
   */
  summary: string;
  /**
   * (Optional) added details about the event. This can use JSX, but it does NOT
   * (currently) render inside the guide context (so `useInfo` won't work, but
   * `useAnalyzer` might).
   */
  details?: JSX.Element | string;
  /**
   * Used to determine which color and summary to display for an event when multiple
   * annotations are present in the same module.
   *
   * Higher number = higher priority.
   *
   * If you want an easy way to make a "default" annotation get overridden by any
   * other annotation, use `priority: -Infinity`.
   */
  priority?: number;
}

export interface AnnotatedEvent {
  event: AnyEvent;
  annotations: Annotation[];
}

export interface ModuleAnnotations {
  module: Module;
  annotations: Array<AnnotatedEvent>;
}

export default class DebugAnnotations extends Module {
  private annotations: Map<Module, AnnotationSet> = new Map();

  addAnnotation(module: Module, event: AnyEvent, annotation: Annotation) {
    const ann = this.moduleAnnotations(module);
    appendAnnotation(ann, event, annotation);
  }

  private moduleAnnotations(module: Module): AnnotationSet {
    if (!this.annotations.has(module)) {
      this.annotations.set(module, new Map());
    }
    return this.annotations.get(module)!;
  }

  getModuleAnnotations(module: Module): ModuleAnnotations {
    return {
      module,
      annotations: Array.from(this.moduleAnnotations(module).entries()).map(
        ([event, annotations]) => ({ event, annotations }),
      ),
    };
  }

  getAll(): ModuleAnnotations[] {
    return Array.from(this.annotations.keys()).map(this.getModuleAnnotations.bind(this));
  }
}

function appendAnnotation(set: AnnotationSet, event: AnyEvent, annotation: Annotation) {
  if (!set.has(event)) {
    set.set(event, []);
  }
  set.get(event)?.push(annotation);
}
