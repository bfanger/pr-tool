/**
 * Lightweight alternative to graphql-tag.
 *
 * Install the following extension to enable syntax highlighting, formatting & autocompletion in VSCode:
 * https://marketplace.visualstudio.com/items?itemName=GraphQL.vscode-graphql
 *
 * The query is returned as is, No parsing to AST, automatic imports etc compared to the full graphql-tag.
 */
export default function gql(strings: TemplateStringsArray): string {
  return strings.join("");
}
