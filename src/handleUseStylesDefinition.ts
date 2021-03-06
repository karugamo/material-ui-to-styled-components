import {NodePath} from '@babel/traverse'
import {
  isArrowFunctionExpression,
  isCallExpression,
  isIdentifier,
  isObjectExpression,
  isObjectProperty,
  ObjectExpression,
  VariableDeclaration
} from '@babel/types'
import {camelCase} from 'lodash'
import MagicString from 'magic-string'
import generateStyleBlock from './generateStyleBlock'
import {StyledComponent} from './generateStyledComponent'
import {removeNode} from './output'

export type StyledComponentByClass = Record<string, StyledComponent>

export default function handleUseStylesDefinition(
  useStylesPath: NodePath<VariableDeclaration>,
  output: MagicString
): StyledComponentByClass {
  const styledComponents = {}
  const classDefinitions = getClassDefinitions(useStylesPath.node)

  if (!classDefinitions) {
    throw new Error('Could not get class definitions from makeStyles')
  }

  for (const property of classDefinitions.properties) {
    if (!isObjectProperty(property))
      throw new Error('useStyles definition has an unexpected property type')
    if (!isIdentifier(property.key))
      throw new Error(
        `useStyles key is expected to be an identifier not ${property.key.type}`
      )

    const className = property.key.name
    const componentName = toUppercaseCamelCase(className)

    if (!isObjectExpression(property.value))
      throw new Error(`useStyles for class ${className} includes non-object`)

    const css = generateStyleBlock(property.value.properties)
    const needsTheme = css.includes('theme')
    styledComponents[className] = {componentName, css, needsTheme}
  }

  removeNode(output, useStylesPath.node)

  return styledComponents
}

function getClassDefinitions(
  node: VariableDeclaration
): ObjectExpression | undefined {
  // const useStyles = makeStyles((theme: Theme) => createStyles({...}));

  const makeStylesFunction = node.declarations[0].init
  if (!isCallExpression(makeStylesFunction)) return
  // makeStyles((theme: Theme) => createStyles({...}));

  const themeArrowFunction = makeStylesFunction.arguments[0]
  if (!isArrowFunctionExpression(themeArrowFunction)) return
  // ((theme: Theme) => createStyles({...})

  const createStyledFunction = themeArrowFunction.body
  if (!isCallExpression(createStyledFunction)) return
  //  createStyles({...})

  const styleObject = createStyledFunction.arguments[0]
  if (!isObjectExpression(styleObject)) return
  // {root: {color: blue}}

  return styleObject
}

function toUppercaseCamelCase(name: string): string {
  return name[0].toUpperCase() + camelCase(name).slice(1)
}
