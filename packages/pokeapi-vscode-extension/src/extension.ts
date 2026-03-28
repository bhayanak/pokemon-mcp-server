import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext): void {
  const serverPath = path.join(context.extensionPath, 'dist', 'server.js');
  const outputChannel = vscode.window.createOutputChannel('PokéAPI MCP');
  context.subscriptions.push(outputChannel);
  outputChannel.appendLine('PokéAPI MCP Server extension activated');

  // Register MCP server definition provider
  const provider: vscode.McpServerDefinitionProvider = {
    provideMcpServerDefinitions(_token: vscode.CancellationToken) {
      const config = vscode.workspace.getConfiguration('pokeapiMcp');
      const env = buildEnvFromConfig(config);
      return [
        new vscode.McpStdioServerDefinition(
          'PokéAPI MCP Server',
          process.execPath,
          [serverPath],
          env,
          context.extension.packageJSON.version,
        ),
      ];
    },
  };

  context.subscriptions.push(
    vscode.lm.registerMcpServerDefinitionProvider('pokeapi-mcp-server', provider),
  );

  // Watch for config changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('pokeapiMcp')) {
        vscode.window.showInformationMessage(
          'PokéAPI MCP configuration changed. Restart the MCP server for changes to take effect.',
        );
      }
    }),
  );

  outputChannel.appendLine('PokéAPI MCP Server registered');
}

export function deactivate(): void {}

function buildEnvFromConfig(config: vscode.WorkspaceConfiguration): Record<string, string> {
  const env: Record<string, string> = {};

  const baseUrl = config.get<string>('baseUrl');
  if (baseUrl) env.POKEAPI_MCP_BASE_URL = baseUrl;

  const cacheTtlMs = config.get<number>('cacheTtlMs');
  if (cacheTtlMs !== undefined) env.POKEAPI_MCP_CACHE_TTL_MS = String(cacheTtlMs);

  const cacheMaxSize = config.get<number>('cacheMaxSize');
  if (cacheMaxSize !== undefined) env.POKEAPI_MCP_CACHE_MAX_SIZE = String(cacheMaxSize);

  const timeoutMs = config.get<number>('timeoutMs');
  if (timeoutMs !== undefined) env.POKEAPI_MCP_TIMEOUT_MS = String(timeoutMs);

  const language = config.get<string>('language');
  if (language) env.POKEAPI_MCP_LANGUAGE = language;

  return env;
}
