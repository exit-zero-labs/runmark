import { open } from "node:fs/promises";
import {
  createLockOwnerId,
  exitCodes,
  RunmarkError,
  removeFileIfExists,
  stableStringify,
  toIsoTimestamp,
} from "@exit-zero-labs/runmark-shared";
import { isFileExistsError } from "./runtime-errors.js";
import {
  assertValidSessionId,
  ensureRuntimePaths,
  getSessionRuntimePaths,
  runtimeFileMode,
} from "./runtime-paths.js";

export interface SessionLockHandle {
  sessionId: string;
  lockFilePath: string;
  ownerId: string;
}

export async function acquireSessionLock(
  projectRoot: string,
  sessionId: string,
): Promise<SessionLockHandle> {
  assertValidSessionId(sessionId);
  const runtimePaths = await ensureRuntimePaths(projectRoot);
  const sessionPaths = getSessionRuntimePaths(runtimePaths, sessionId);
  const ownerId = createLockOwnerId();
  const handle = await open(
    sessionPaths.lockFilePath,
    "wx",
    runtimeFileMode,
  ).catch((error: unknown) => {
    if (isFileExistsError(error)) {
      throw new RunmarkError(
        "SESSION_LOCKED",
        `Session ${sessionId} is already locked by another process.`,
        {
          exitCode: exitCodes.unsafeResume,
          cause: error,
        },
      );
    }

    throw error;
  });

  try {
    await handle.writeFile(
      `${stableStringify({
        ownerId,
        acquiredAt: toIsoTimestamp(),
      })}\n`,
      "utf8",
    );
  } finally {
    await handle.close();
  }

  return {
    sessionId,
    lockFilePath: sessionPaths.lockFilePath,
    ownerId,
  };
}

export async function releaseSessionLock(
  lockHandle: SessionLockHandle,
): Promise<void> {
  await removeFileIfExists(lockHandle.lockFilePath);
}
