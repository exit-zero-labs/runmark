/**
 * Shared project-loading helpers used by the execution package.
 *
 * These functions keep project discovery and common validation failures
 * consistent across CLI commands and MCP tools.
 */
import type {
  CompiledRequestStep,
  CompiledRunSnapshot,
  FlatVariableMap,
  SessionRecord,
  SessionStepRecord,
} from "@exit-zero-labs/runmark-contracts";
import {
  findProjectRoot,
  loadProjectFiles,
} from "@exit-zero-labs/runmark-definitions";
import { exitCodes, RunmarkError } from "@exit-zero-labs/runmark-shared";
import type { EngineOptions, LoadedProjectContext } from "./types.js";

/** Normalized compile options passed into the definitions snapshot compiler. */
export function buildCompileOptions(
  envId?: string,
  overrides?: FlatVariableMap,
): {
  envId?: string | undefined;
  overrides?: FlatVariableMap | undefined;
  processEnv: Record<string, string | undefined>;
} {
  return {
    envId,
    overrides,
    processEnv: process.env,
  };
}

/** Request-only entrypoints compile to a single synthetic request step. */
export function getSingleRequestStep(
  compiled: CompiledRunSnapshot,
  targetId: string,
): CompiledRequestStep {
  const step = compiled.steps[0];
  if (!step || step.kind !== "request") {
    throw new RunmarkError(
      "INVALID_COMPILED_REQUEST",
      `Compiled request ${targetId} did not produce a request step.`,
    );
  }

  return step;
}

/** Read one step record or surface an internal-invariant failure. */
export function getSessionStepRecord(
  session: SessionRecord,
  stepId: string,
): SessionStepRecord {
  const stepRecord = session.stepRecords[stepId];
  if (!stepRecord) {
    throw new RunmarkError(
      "STEP_NOT_FOUND",
      `Step ${stepId} was not found in session ${session.sessionId}.`,
      { exitCode: exitCodes.internalError },
    );
  }

  return stepRecord;
}

/** Discover the project root and load all tracked definitions once. */
export async function loadProjectContext(
  options: EngineOptions,
): Promise<LoadedProjectContext> {
  const rootDir = await findProjectRoot(options);
  const project = await loadProjectFiles(rootDir);
  return {
    rootDir,
    project,
  };
}
