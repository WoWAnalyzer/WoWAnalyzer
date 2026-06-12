import {
  API,
  ArrowFunctionExpression,
  Expression,
  FileInfo,
  Identifier,
  JSCodeshift,
  MemberExpression,
  TaggedTemplateExpression,
} from 'jscodeshift';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as child from 'node:child_process';

const UNPROCESSED = (t: string) => `/* UNPROCESSED<!${t}!> */`;

const convertMemberExpression = (j: JSCodeshift, expr: MemberExpression): string => {
  let leftMost = expr;
  while (j.MemberExpression.check(leftMost)) {
    if (!j.MemberExpression.check(leftMost.object)) {
      break;
    }
    leftMost = leftMost.object;
  }

  if (j.Identifier.check(leftMost.object) && leftMost.object.name === 'design') {
    return `design.$${j(expr).toSource().substring('design.'.length).replaceAll('.', '_')}`;
  }

  return UNPROCESSED(j(expr).toSource());
};

const isPropAccess = (
  j: JSCodeshift,
  expr: Expression,
  propsName: string,
): expr is MemberExpression & { property: Identifier } =>
  j.MemberExpression.check(expr) &&
  j.Identifier.check(expr.object) &&
  expr.object.name === propsName &&
  j.Identifier.check(expr.property);

const convertSimpleArrows = (
  j: JSCodeshift,
  expr: ArrowFunctionExpression,
): { css: string; props: string[] } => {
  if (j.Identifier.check(expr.params[0])) {
    const propsName = expr.params[0].name;
    if (isPropAccess(j, expr.body, propsName)) {
      return {
        css: `var(--${expr.body.property.name})`,
        props: [expr.body.property.name],
      };
    }

    let body = expr.body;
    while (j.ParenthesizedExpression.check(body)) {
      body = body.expression;
    }

    if (
      j.ConditionalExpression.check(body) &&
      isPropAccess(j, body.test, propsName) &&
      j.Literal.check(body.consequent) &&
      j.Literal.check(body.alternate)
    ) {
      const name = body.test.property.name;
      const ifTrue = body.consequent;
      const ifFalse = body.alternate;

      if (typeof ifTrue.value !== 'string' || ifTrue.value.indexOf(':') === -1) {
        // not a css rule
        return {
          css: `var(--${name}, ${ifFalse.value}) ${ifTrue.value}`,
          props: [name],
        };
      }
    }

    if (
      j.ConditionalExpression.check(body) &&
      isPropAccess(j, body.test, propsName) &&
      isPropAccess(j, body.consequent, propsName) &&
      body.test.property.name === body.consequent.property.name &&
      j.Literal.check(body.alternate)
    ) {
      const name = body.test.property.name;
      return {
        css: `var(--${name}, ${body.alternate.value})`,
        props: [name],
      };
    }

    if (
      j.LogicalExpression.check(body) &&
      body.operator === '??' &&
      isPropAccess(j, body.left, propsName) &&
      j.Literal.check(body.right)
    ) {
      const name = body.left.property.name;
      return {
        css: `var(--${name}, ${body.right.value})`,
        props: [name],
      };
    }
  }

  console.warn(`could not process arrow expression: ${j(expr).toSource()}`);
  return {
    css: UNPROCESSED(j(expr).toSource()),
    props: [],
  };
};

const extractStyledTarget = (j: JSCodeshift, expr: TaggedTemplateExpression['tag']) => {
  if (j.MemberExpression.check(expr) && j.Identifier.check(expr.property)) {
    return j.types.builders.literal(expr.property.name);
  } else if (
    j.CallExpression.check(expr) &&
    (j.Identifier.check(expr.arguments[0]) || j.Literal.check(expr.arguments[0]))
  ) {
    return expr.arguments[0];
  }

  throw new Error('could not extract styled target from node: ' + expr.type);
};

export default function transform(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);

  const imports = root.find(j.ImportDeclaration);

  const emotionImport = imports
    .filter((import_) => import_.node.source.value === '@emotion/styled')
    .paths()[0];

  if (!emotionImport) {
    return file.source;
  }

  const identifier = emotionImport.node.specifiers?.find(
    (spec) => spec.type === 'ImportDefaultSpecifier',
  )?.local;

  if (!identifier || typeof identifier.name !== 'string') {
    throw new Error('could not process import of emotion in ' + file.path);
  }

  const builders = j.types.builders;

  emotionImport.replace(
    builders.importDeclaration(
      [builders.importDefaultSpecifier(builders.identifier('cssComponent'))],
      builders.literal('interface/utils/css-component'),
    ),
  );

  const references = root
    .find(j.Identifier, { name: identifier.name })
    .filter((ref) => ref.node !== identifier);

  let css = '';

  const templates = references.closest(j.TaggedTemplateExpression);

  templates.forEach((template) => {
    let currentCss = '';
    let i = 0;
    let cont = true;
    const props = [];
    while (cont) {
      const text = template.node.quasi.quasis[i];
      const expr = text.tail ? null : template.node.quasi.expressions[i];

      currentCss += text.value.raw;
      if (expr) {
        switch (expr.type) {
          case 'MemberExpression':
            currentCss += convertMemberExpression(j, expr);
            break;
          case 'Identifier':
            // need to handle these in the usage, i think.
            currentCss += `.${expr.name}/* TODO-OVERRIDE */`;
            break;
          case 'ArrowFunctionExpression':
            const { css: newCss, props: newProps } = convertSimpleArrows(j, expr);
            props.push(...newProps);
            currentCss += newCss;
            break;
          default:
            console.warn(
              `[${file.path}] unsupported expression type ${expr.type}: ${j(expr).toSource()}`,
            );
            currentCss += UNPROCESSED(j(expr).toSource());
        }
      }
      cont = !text.tail;
      i += 1;
    }

    const assignment = j(template).closest(j.VariableDeclarator).paths()[0];

    if (assignment && j.Identifier.check(assignment.node.id)) {
      css += `.${assignment.node.id.name} {
        ${currentCss}
      }\n\n`;
      template.replace(
        builders.callExpression(builders.identifier('cssComponent'), [
          extractStyledTarget(j, template.node.tag),
          builders.memberExpression(builders.identifier('styles'), assignment.node.id),
          builders.tsAsExpression(
            builders.arrayExpression(
              Array.from(new Set(props)).map((prop) => builders.literal(prop)),
            ),
            builders.tsTypeReference(builders.identifier('const')),
          ),
        ]),
      );
    } else {
      console.log(assignment, template);
      throw new Error(`unable to process styled expression assignment`);
    }
  });

  if (css !== '') {
    if (css.indexOf('design.$') !== undefined) {
      css = `@use 'interface/design-system' as design;

        ${css}`;
    }

    let filename = path.basename(file.path);
    filename = filename.split('.').slice(0, -1).join('.');
    filename = `./${filename}.module.scss`;
    const filepath = path.join(path.dirname(file.path), filename);
    fs.writeFileSync(filepath, css);
    // not using oxfmt import because of CJS/MJS issues that we have little control over due to jscodeshift
    try {
      child.execSync(`pnpm exec oxfmt ${filepath}`);
    } catch (e) {
      console.warn(`failed to format SCSS ${filepath}: ${e}`);
    }

    emotionImport.insertAfter(
      builders.importDeclaration(
        [builders.importDefaultSpecifier(builders.identifier('styles'))],
        builders.literal(filename),
      ),
    );
  }

  return root.toSource();
}
