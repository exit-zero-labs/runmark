#!/usr/bin/env node

/**
 * Thin CLI adapter for the shared `runmark` engine.
 *
 * This file should stay focused on argv parsing, command dispatch, terminal
 * formatting, and exit-code mapping. Domain behavior belongs in packages.
 */
import type {
  Diagnostic,
  FlatVariableMap,
} from "@exit-zero-labs/runmark-contracts";
import {
  acceptSnapshotForStep,
  cancelSessionRun,
  describeRequest,
  describeRun,
  explainVariables,
  getSessionState,
  initProject,
  installSignalCancelHandler,
  listProjectDefinitions,
  listSessionArtifacts,
  readSessionArtifact,
  resumeSessionRun,
  runRequest,
  runRun,
  validateProject,
} from "@exit-zero-labs/runmark-execution";
import {
  coerceFlatValue,
  exitCodes,
  RunmarkError,
} from "@exit-zero-labs/runmark-shared";
import packageJson from "../package.json" with { type: "json" };
import { formatCliDiagnostics, toCliFailure } from "./error.js";

/** Dispatch one CLI invocation and return the process exit code to use. */
export async function runCli(argv = process.argv.slice(2)): Promise<number> {
  if (
    argv.length === 0 ||
    argv[0] === "help" ||
    argv[0] === "--help" ||
    argv[0] === "-h"
  ) {
    printUsage();
    return exitCodes.success;
  }

  if (
    (argv.length === 1 && argv[0] === "version") ||
    argv[0] === "--version" ||
    argv[0] === "-v"
  ) {
    process.stdout.write(`${packageJson.version}\n`);
    return exitCodes.success;
  }

  const parsedArgs = parseArgs(argv);
  const command = parsedArgs.positionals[0];
  const projectRoot = parsedArgs.flags["project-root"]?.[0];
  const envId = parsedArgs.flags.env?.[0];
  const stepId = parsedArgs.flags.step?.[0];
  const overrides = parseInputs(parsedArgs.flags.input ?? []);

  if (command === "mcp") {
    // Lazy-import so CLI users who never touch MCP don't pay the cost of
    // parsing @modelcontextprotocol/sdk on every `runmark` invocation.
    const { startMcpServer } = await import("./mcp.js");
    await startMcpServer();
    return exitCodes.success;
  }

  if (command === "init") {
    const result = await initProject(projectRoot ?? process.cwd());
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return exitCodes.success;
  }

  if (command === "list") {
    const listTarget = parsedArgs.positionals[1];
    const result = await listProjectDefinitions({ projectRoot });
    writeDiagnostics(result.diagnostics);

    if (listTarget === "requests") {
      writeLines(
        result.requests.map((request) => `${request.id}\t${request.filePath}`),
      );
      return exitCodes.success;
    }

    if (listTarget === "runs") {
      writeLines(result.runs.map((run) => `${run.id}\t${run.filePath}`));
      return exitCodes.success;
    }

    if (listTarget === "envs") {
      writeLines(
        result.envs.map(
          (environment) => `${environment.id}\t${environment.filePath}`,
        ),
      );
      return exitCodes.success;
    }

    if (listTarget === "sessions") {
      writeLines(
        result.sessions.map(
          (session) =>
            `${session.sessionId}\t${session.state}\t${session.runId}\t${session.envId}\t${session.updatedAt}`,
        ),
      );
      return exitCodes.success;
    }

    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return exitCodes.success;
  }

  if (command === "validate") {
    const result = await validateProject({ projectRoot });
    writeDiagnostics(result.diagnostics);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return result.diagnostics.some((diagnostic) => diagnostic.level === "error")
      ? exitCodes.validationFailure
      : exitCodes.success;
  }

  if (command === "describe") {
    const requestId = parsedArgs.flags.request?.[0];
    const runId = parsedArgs.flags.run?.[0];
    assertSingleTarget(requestId, runId, "describe");

    if (requestId) {
      const result = await describeRequest(requestId, {
        projectRoot,
        envId,
        overrides,
      });
      writeDiagnostics(result.diagnostics);
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      return result.diagnostics.some(
        (diagnostic) => diagnostic.level === "error",
      )
        ? exitCodes.validationFailure
        : exitCodes.success;
    }

    if (runId) {
      const result = await describeRun(runId, {
        projectRoot,
        envId,
        overrides,
      });
      writeDiagnostics(result.diagnostics);
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      return result.diagnostics.some(
        (diagnostic) => diagnostic.level === "error",
      )
        ? exitCodes.validationFailure
        : exitCodes.success;
    }

    throw new RunmarkError(
      "DESCRIBE_TARGET_REQUIRED",
      requiredTargetMessage("describe", "runmark describe --request ping"),
      { exitCode: exitCodes.validationFailure },
    );
  }

  if (command === "run") {
    const requestId = parsedArgs.flags.request?.[0];
    const runId = parsedArgs.flags.run?.[0];
    assertSingleTarget(requestId, runId, "run");
    // Wire SIGINT/SIGTERM so Ctrl-C translates into a cancel marker and the
    // active session transitions to 'interrupted' cleanly.
    installSignalCancelHandler();

    const reporterFlag = parsedArgs.flags.reporter?.[0];

    if (requestId) {
      const result = await runRequest(requestId, {
        projectRoot,
        envId,
        overrides,
      });
      writeDiagnostics(result.diagnostics);
      await maybeWriteReporter(reporterFlag, result);
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      return result.session.state === "failed"
        ? exitCodes.executionFailure
        : exitCodes.success;
    }

    if (runId) {
      const result = await runRun(runId, {
        projectRoot,
        envId,
        overrides,
      });
      writeDiagnostics(result.diagnostics);
      await maybeWriteReporter(reporterFlag, result);
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      return result.session.state === "failed"
        ? exitCodes.executionFailure
        : exitCodes.success;
    }

    throw new RunmarkError(
      "RUN_TARGET_REQUIRED",
      requiredTargetMessage("run", "runmark run --request ping"),
      { exitCode: exitCodes.validationFailure },
    );
  }

  if (command === "snapshot") {
    const sub = parsedArgs.positionals[1];
    if (sub !== "accept") {
      throw new RunmarkError(
        "SNAPSHOT_SUBCOMMAND_REQUIRED",
        "Use runmark snapshot accept <sessionId> --step <stepId>.",
        { exitCode: exitCodes.validationFailure },
      );
    }
    const sessionId = parsedArgs.positionals[2];
    if (!sessionId || !stepId) {
      throw new RunmarkError(
        "SNAPSHOT_ARGS_REQUIRED",
        "Use runmark snapshot accept <sessionId> --step <stepId>.",
        { exitCode: exitCodes.validationFailure },
      );
    }
    const result = await acceptSnapshotForStep(sessionId, stepId, {
      projectRoot,
    });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return exitCodes.success;
  }

  if (command === "cancel") {
    const sessionId = parsedArgs.positionals[1];
    if (!sessionId) {
      throw new RunmarkError(
        "SESSION_ID_REQUIRED",
        "Use runmark cancel <sessionId>.",
        { exitCode: exitCodes.validationFailure },
      );
    }
    const reason = parsedArgs.flags.reason?.[0];
    const result = await cancelSessionRun(sessionId, {
      projectRoot,
      ...(reason ? { reason } : {}),
      source: "cli",
    });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return exitCodes.success;
  }

  if (command === "resume") {
    const sessionId = parsedArgs.positionals[1];
    if (!sessionId) {
      throw new RunmarkError(
        "SESSION_ID_REQUIRED",
        "Use runmark resume <sessionId>.",
        { exitCode: exitCodes.validationFailure },
      );
    }

    installSignalCancelHandler();
    const result = await resumeSessionRun(sessionId, { projectRoot });
    writeDiagnostics(result.diagnostics);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return result.session.state === "failed"
      ? exitCodes.executionFailure
      : exitCodes.success;
  }

  if (command === "session") {
    if (parsedArgs.positionals[1] !== "show") {
      throw new RunmarkError(
        "SESSION_SUBCOMMAND_REQUIRED",
        "Use runmark session show <sessionId>.",
        { exitCode: exitCodes.validationFailure },
      );
    }

    const sessionId = parsedArgs.positionals[2];
    if (!sessionId) {
      throw new RunmarkError(
        "SESSION_ID_REQUIRED",
        "Use runmark session show <sessionId>.",
        { exitCode: exitCodes.validationFailure },
      );
    }

    const result = await getSessionState(sessionId, { projectRoot });
    writeDiagnostics(result.diagnostics);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return exitCodes.success;
  }

  if (command === "artifacts") {
    const subcommand = parsedArgs.positionals[1];
    if (subcommand === "list") {
      const sessionId = parsedArgs.positionals[2];
      if (!sessionId) {
        throw new RunmarkError(
          "SESSION_ID_REQUIRED",
          "Use runmark artifacts list <sessionId>.",
          { exitCode: exitCodes.validationFailure },
        );
      }

      const result = await listSessionArtifacts(sessionId, {
        projectRoot,
        stepId,
      });
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      return exitCodes.success;
    }

    if (subcommand === "read") {
      const sessionId = parsedArgs.positionals[2];
      const relativePath = parsedArgs.positionals[3];
      if (!sessionId || !relativePath) {
        throw new RunmarkError(
          "ARTIFACT_PATH_REQUIRED",
          "Use runmark artifacts read <sessionId> <relativePath>.",
          { exitCode: exitCodes.validationFailure },
        );
      }

      const result = await readSessionArtifact(sessionId, relativePath, {
        projectRoot,
      });
      if (result.text !== undefined) {
        process.stdout.write(`${result.text}\n`);
        return exitCodes.success;
      }

      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      return exitCodes.success;
    }

    throw new RunmarkError(
      "ARTIFACTS_SUBCOMMAND_REQUIRED",
      "Use runmark artifacts list <sessionId> or runmark artifacts read <sessionId> <relativePath>.",
      { exitCode: exitCodes.validationFailure },
    );
  }

  if (command === "explain") {
    if (parsedArgs.positionals[1] !== "variables") {
      throw new RunmarkError(
        "EXPLAIN_SUBCOMMAND_REQUIRED",
        "Use runmark explain variables (--request <id> | --run <id>).",
        { exitCode: exitCodes.validationFailure },
      );
    }

    const requestId = parsedArgs.flags.request?.[0];
    const runId = parsedArgs.flags.run?.[0];
    assertSingleTarget(requestId, runId, "explain variables");
    if (!requestId && !runId) {
      throw new RunmarkError(
        "EXPLAIN_TARGET_REQUIRED",
        requiredTargetMessage(
          "explain variables",
          "runmark explain variables --request ping",
        ),
        { exitCode: exitCodes.validationFailure },
      );
    }
    const result = await explainVariables({
      projectRoot,
      requestId,
      runId,
      stepId,
      envId,
      overrides,
    });
    writeDiagnostics(result.diagnostics);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return result.diagnostics.some((diagnostic) => diagnostic.level === "error")
      ? exitCodes.validationFailure
      : exitCodes.success;
  }

  throw new RunmarkError(
    "UNKNOWN_COMMAND",
    `Unknown command: ${argv.join(" ")}`,
    { exitCode: exitCodes.validationFailure },
  );
}

/** Print the human-facing CLI usage summary. */
function printUsage(): void {
  const usage = `runmark

Usage:
  runmark --help
  runmark --version
  runmark init [--project-root <path>]
  runmark list [requests|runs|envs|sessions] [--project-root <path>]
  runmark validate [--project-root <path>]
  runmark describe --request <id> [--env <id>] [--input key=value]
  runmark describe --run <id> [--env <id>] [--input key=value]
  runmark run --request <id> [--env <id>] [--input key=value]
  runmark run --run <id> [--env <id>] [--input key=value] [--reporter <spec>]
  runmark cancel <sessionId> [--reason <text>] [--project-root <path>]
  runmark snapshot accept <sessionId> --step <stepId> [--project-root <path>]
  runmark resume <sessionId> [--project-root <path>]
  runmark session show <sessionId> [--project-root <path>]
  runmark artifacts list <sessionId> [--step <id>] [--project-root <path>]
  runmark artifacts read <sessionId> <relativePath> [--project-root <path>]
  runmark explain variables (--request <id> | --run <id>) [--step <id>] [--env <id>] [--input key=value]
  runmark mcp                                       (start the stdio MCP server)

List targets:
  requests   list tracked request definitions
  runs       list tracked run definitions
  envs       list tracked environment definitions
  sessions   list persisted runtime sessions

Notes:
  - When --project-root is omitted, runmark discovers the nearest runmark/config.yaml.
  - Outputs are JSON by default, except list subcommands which print tab-separated rows.

Examples:
  runmark list requests
  runmark list sessions
  runmark describe --request ping
  runmark run --run smoke
  runmark artifacts list <sessionId>
  runmark resume <sessionId>
`;

  process.stdout.write(`${usage}\n`);
}

// F1: CI reporter. Minimal JSON reporter supported in this slice.
// Format: --reporter json:./path.json  (shorthand `json` writes to runmark/artifacts/reports/run.json)
// Additional formats (junit, tap, github) ship in follow-up work.
/** Write an optional reporter artifact for CI or automation consumers. */
async function maybeWriteReporter(
  spec: string | undefined,
  result: unknown,
): Promise<void> {
  if (!spec) return;
  const { writeFile, mkdir } = await import("node:fs/promises");
  const { dirname, resolve: resolvePath } = await import("node:path");
  const [rawFormat, rawPath] = spec.split(":", 2);
  const format = (rawFormat ?? "json").toLowerCase();
  if (format !== "json") {
    process.stderr.write(
      `[runmark] --reporter=${format} is not yet implemented; only 'json' ships in this release. Skipping.\n`,
    );
    return;
  }
  const target = resolvePath(
    process.cwd(),
    rawPath && rawPath.length > 0 ? rawPath : "runmark/artifacts/reports/run.json",
  );
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  process.stderr.write(`[runmark] wrote JSON reporter to ${target}\n`);
}

/** Minimal flag parser for the published CLI surface. */
function parseArgs(argv: string[]): {
  positionals: string[];
  flags: Record<string, string[]>;
} {
  const positionals: string[] = [];
  const flags: Record<string, string[]> = {};

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (!argument) {
      continue;
    }
    if (!argument.startsWith("--")) {
      positionals.push(argument);
      continue;
    }

    const flagName = argument.slice(2);
    const equalsIndex = flagName.indexOf("=");
    if (equalsIndex !== -1) {
      const normalizedFlagName = flagName.slice(0, equalsIndex);
      const flagValue = flagName.slice(equalsIndex + 1);
      flags[normalizedFlagName] = [
        ...(flags[normalizedFlagName] ?? []),
        flagValue,
      ];
      continue;
    }

    const nextArgument = argv[index + 1];
    if (!nextArgument || nextArgument.startsWith("--")) {
      flags[flagName] = [...(flags[flagName] ?? []), "true"];
      continue;
    }

    flags[flagName] = [...(flags[flagName] ?? []), nextArgument];
    index += 1;
  }

  return {
    positionals,
    flags,
  };
}

/** Parse repeated `--input key=value` flags into typed flat overrides. */
function parseInputs(inputAssignments: string[]): FlatVariableMap {
  return inputAssignments.reduce<FlatVariableMap>((result, assignment) => {
    const separatorIndex = assignment.indexOf("=");
    if (separatorIndex === -1) {
      throw new RunmarkError(
        "INVALID_INPUT",
        `Invalid --input value ${assignment}. Expected key=value.`,
        { exitCode: exitCodes.validationFailure },
      );
    }

    const key = assignment.slice(0, separatorIndex);
    const rawValue = assignment.slice(separatorIndex + 1);
    if (key.length === 0) {
      throw new RunmarkError(
        "INVALID_INPUT",
        `Invalid --input value ${assignment}. Expected key=value.`,
        { exitCode: exitCodes.validationFailure },
      );
    }

    result[key] = coerceFlatValue(rawValue);
    return result;
  }, {});
}

function assertSingleTarget(
  requestId: string | undefined,
  runId: string | undefined,
  commandName: string,
): void {
  if (requestId && runId) {
    throw new RunmarkError(
      "TARGET_AMBIGUOUS",
      `${commandLabel(commandName)} accepts either --request <id> or --run <id>, not both.`,
      { exitCode: exitCodes.validationFailure },
    );
  }
}

function requiredTargetMessage(commandName: string, example: string): string {
  return `${commandLabel(commandName)} requires either --request <id> or --run <id>.\nExample: ${example}`;
}

function commandLabel(commandName: string): string {
  return `${commandName[0]?.toUpperCase() ?? ""}${commandName.slice(1)} command`;
}

function writeLines(lines: string[]): void {
  if (lines.length === 0) {
    return;
  }

  process.stdout.write(`${lines.join("\n")}\n`);
}

function writeDiagnostics(diagnostics: Diagnostic[]): void {
  if (diagnostics.length === 0) {
    return;
  }

  process.stderr.write(`${formatCliDiagnostics(diagnostics)}\n`);
}

async function main(): Promise<void> {
  try {
    const exitCode = await runCli();
    process.exitCode = exitCode;
  } catch (error) {
    const failure = toCliFailure(error);
    process.stderr.write(`${failure.message}\n`);
    process.exitCode = failure.exitCode;
  }
}

void main();
