#!/usr/bin/env node
import { run } from './cli/runner';

run().catch((err: unknown) => {
  if (err instanceof Error) {
    console.error('routewatch error:', err.message);
  } else {
    console.error('routewatch encountered an unexpected error.');
  }
  process.exit(1);
});
