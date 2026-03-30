/// <reference types="vite/client" />

/**
 * Monaco Editor environment setup for Chrome Extension.
 *
 * Must be imported BEFORE any @monaco-editor/react component mounts.
 *
 * - In production (extension): bundles Monaco locally, configures workers via Vite ?worker
 * - In development: configures workers for local dev server
 */

import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';

// Configure Monaco to create workers from locally bundled files.
// In production, Vite bundles these as separate chunks served from the extension origin.
// In dev, Vite serves them directly from the dev server.
// Either way, no CDN or blob: issues arise that would violate extension CSP.
(self as unknown as { MonacoEnvironment: object }).MonacoEnvironment = {
  getWorker(_moduleId: string, label: string): Worker {
    if (label === 'json') {
      return new JsonWorker();
    }
    return new EditorWorker();
  },
};

// Tell @monaco-editor/react to use the locally imported Monaco instance
// instead of loading it from a CDN (which is blocked in Chrome extensions).
loader.config({ monaco });
