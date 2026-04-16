# routewatch

A lightweight CLI tool that monitors Next.js API routes and flags unused or undocumented endpoints.

---

## Installation

```bash
npm install -g routewatch
# or
npx routewatch
```

---

## Usage

Run `routewatch` from the root of your Next.js project:

```bash
npx routewatch scan
```

**Example output:**

```
✔ Scanning /pages/api...

⚠ Undocumented: /api/users/[id]
⚠ Unused:       /api/legacy/export
✔ OK:            /api/health
✔ OK:            /api/auth/login

2 issue(s) found.
```

### Options

| Flag              | Description                              |
|-------------------|------------------------------------------|
| `--dir <path>`    | Path to your API routes directory        |
| `--ignore <glob>` | Glob pattern for routes to ignore        |
| `--json`          | Output results as JSON                   |
| `--fail-on-warn`  | Exit with code 1 if any issues are found |

```bash
npx routewatch scan --dir src/app/api --ignore "**/internal/**" --json
```

---

## Configuration

Optionally add a `routewatch.config.ts` file to your project root:

```ts
export default {
  dir: "src/app/api",
  ignore: ["**/internal/**"],
  failOnWarn: true,
};
```

---

## Requirements

- Node.js >= 16
- A Next.js project using the `/pages/api` or `/app/api` structure

---

## License

[MIT](./LICENSE)
