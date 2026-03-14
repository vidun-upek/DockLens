# DockerLens

**DockerLens** is a **CLI-based Dockerfile linter** (`dockerfile-lint-plus`) that helps developers identify security risks, inefficiencies, performance issues, and maintainability problems in Dockerfiles before they reach production.

Think of it like **ESLint for Dockerfiles** — it checks your Docker configuration against best practices and best practices.

---

## 📋 What This Project Does

`dockerfile-lint-plus` analyzes your Dockerfiles and reports violations based on **7 core rules**:

| Rule | Type | Purpose |
|------|------|---------|
| `no-latest-tag` | ❌ Error | Base images must specify a version tag (not `:latest`) |
| `require-tagged-base-image` | ❌ Error | Base images require an explicit tag |
| `no-curl-bash` | ❌ Error | Prevent piping remote scripts directly into bash |
| `copy-deps-before-source` | ⚠️ Warning | Copy dependency files before copying all source code |
| `require-non-root-user` | ⚠️ Warning | Container should not run as root |
| `prefer-copy-over-add` | ⚠️ Warning | Use COPY instead of ADD when possible |
| `require-explicit-cmd-or-entrypoint` | ⚠️ Warning | Every image should have CMD or ENTRYPOINT |

---

## 🛠️ How It Works

### The Processing Pipeline

```
Dockerfile Input
      ↓
[1] Parser - Extract all instructions (FROM, RUN, COPY, etc.)
      ↓
[2] Rule Engine - Run each of the 7 rules against the instructions
      ↓
[3] Collector - Gather all violations with line numbers and messages
      ↓
[4] Formatter - Format output (human-readable or JSON)
      ↓
Output Results (with exit code for CI/CD)
```

### Code Structure

```
src/
├── cli.ts                    # Main command-line interface
├── analyzer/
│   ├── parseDockerfile.ts   # Parse Dockerfile into instructions
│   ├── runRules.ts          # Execute all rules
│   └── resultFormatter.ts   # Format output
├── rules/                   # Individual rule implementations
│   ├── index.ts             # Rule registry (active rules)
│   ├── noLatestTag.ts
│   ├── requireTaggedBaseImage.ts
│   ├── noCurlBash.ts
│   ├── copyDepsBeforeSource.ts
│   ├── requireNonRootUser.ts
│   ├── preferCopyOverAdd.ts
│   ├── requireExplicitCmdOrEntrypoint.ts
│   └── _helpers.ts          # Shared helper functions
├── types/
│   ├── DockerInstruction.ts # Parsed instruction data
│   ├── Finding.ts           # Violation/finding data
│   └── Rule.ts              # Rule interface
├── config/
│   └── defaultRules.ts      # Default rule configuration
└── utils/
    ├── config.ts            # Config loading/merging
    ├── file.ts              # File system utilities
    ├── logger.ts            # Logging utilities
    └── patterns.ts          # Regex patterns
```

### How Each Rule Works

**Example: `no-latest-tag` Rule**

```typescript
// 1. Find all FROM instructions
// 2. Check if any use :latest tag
// 3. If found, create a Finding with:
//    - Line number where violation is
//    - Clear message explaining the problem
//    - Suggestion on how to fix it
// 4. Return findings to be displayed to user
```

---

## 🚀 How to Use

### Installation

Install the CLI tool `dockerfile-lint-plus` globally:

```bash
npm install -g dockerfile-lint-plus
```

Or use directly without installing:
```bash
npx dockerfile-lint-plus analyze Dockerfile
```

### Commands

#### 1. **Analyze a Dockerfile**
```bash
dockerfile-lint-plus analyze Dockerfile
```

Output:
```
[ERROR] no-latest-tag
  Line 1
  Base image uses the latest tag, which is not reproducible.
  FROM node:latest
  Suggestion: Pin the image to an explicit version such as node:20-alpine.

[WARNING] require-non-root-user
  Line 5
  No USER instruction found. Container may run as root.
  CMD ["npm", "start"]
  Suggestion: Add a non-root USER instruction.

Total findings: 2
```

#### 2. **List All Available Rules**
```bash
dockerfile-lint-plus rules
```

Output:
```
no-latest-tag [error] - Avoid latest tags
require-tagged-base-image [error] - Require tagged base image
no-curl-bash [error] - Do not pipe curl or wget into shell
copy-deps-before-source [warning] - Copy dependency files first
require-non-root-user [warning] - Require non-root user
prefer-copy-over-add [warning] - Prefer COPY over ADD
require-explicit-cmd-or-entrypoint [warning] - Require CMD or ENTRYPOINT
```

#### 3. **Get Help on a Specific Rule**
```bash
dockerfile-lint-plus explain no-latest-tag
```

Output:
```
no-latest-tag

Avoid latest tags
Severity: error
Category: base-image

What it checks:
Flags FROM instructions that use the latest tag.

Why it matters:
latest changes over time and makes builds unpredictable.

Suggestion:
Use a pinned version such as node:20-alpine.
```

#### 4. **Initialize a Config File**
```bash
dockerfile-lint-plus init
```
Creates `dockerfile-lint-plus.config.json` with default configuration that you can customize.

### Command Options

```bash
dockerfile-lint-plus analyze Dockerfile [options]

Options:
  -f, --format <format>    Output format: 'stylish' (default) or 'json'
  -c, --config <path>      Path to config file
  -r, --recursive          Scan all Dockerfiles in a directory
  --strict                 Fail on warnings too (not just errors)
```

### Examples

**Analyze with JSON output:**
```bash
dockerfile-lint-plus analyze Dockerfile --format json
```

**Analyze with custom config:**
```bash
dockerfile-lint-plus analyze Dockerfile --config my-rules.json
```

**Fail on both errors and warnings:**
```bash
dockerfile-lint-plus analyze Dockerfile --strict
```

**Use in CI/CD:**
```bash
dockerfile-lint-plus analyze Dockerfile
if [ $? -ne 0 ]; then
  echo "Dockerfile failed linting"
  exit 1
fi
```

---

## 🧪 Testing

The project includes comprehensive tests covering:

- **Unit Tests** — Individual rule testing (each rule is tested)
- **Integration Tests** — Full analyzer testing with multiple rules
- **Edge Cases** — Empty files, comments, multi-stage builds, etc.
- **Parser Tests** — Dockerfile parsing with line continuations
- **JSON Output Validation** — Correct JSON format

### Run Tests

```bash
npm test
```

### Test Coverage

- **82 tests** all passing ✅
- **12 test files** covering different aspects
- **Edge cases** like empty Dockerfiles, comments-only files
- **Multi-stage builds** tested for correctness

**Test files:**
```
tests/
├── analyzer/
│   ├── parseDockerfile.test.ts     # Parser tests
│   ├── runRules.test.ts            # Rule engine tests
│   └── jsonOutputValidation.test.ts # Output format tests
├── rules/
│   ├── noLatestTag.test.ts
│   ├── requireTaggedBaseImage.test.ts
│   ├── noCurlBash.test.ts
│   ├── copyDepsBeforeSource.test.ts
│   ├── requireNonRootUser.test.ts
│   ├── preferCopyOverAdd.test.ts
│   └── requireExplicitCmdOrEntrypoint.test.ts
├── edge-cases/
│   └── edgeCases.test.ts           # Unusual input handling
└── integration/
    └── fullEngine.test.ts          # Full pipeline tests
```

### Test Execution
```bash
npm test                    # Run all tests
npm run build              # Compile TypeScript
npm run dev                # Run with live reloading (development)
npm run lint:sample        # Test against sample Dockerfile
```

---

## 🔮 Future Implementations

The following features are planned for future versions:

### Phase 2: Advanced Features
- **Recursive scanning** — Scan entire directories for all Dockerfiles
- **JSON output** — Machine-readable output for CI/CD integration
- **Dockerfile quality score** — Rate Dockerfile quality 0-100
- **GitHub Action** — Use as a GitHub Action in workflows
- **Configuration profiles** — Preset configs for different use cases

### Phase 3: Enhancement & Optimization
- **More rules** — Additional best-practice rules for security and performance
- **Custom rules** — Allow users to write their own rules
- **Markdown reports** — Generate detailed HTML/Markdown reports
- **Quick fixes** — Automatic suggestion-based fixes
- **Multi-format support** — Docker Compose files support
- **Performance metrics** — Analyze build layer sizes and caching efficiency

### Phase 4: Integration
- **GitLab CI support** — Integration templates
- **pre-commit hooks** — Use as git pre-commit hook
- **Docker plug-in** — Embedded in Docker CLI
- **IDE extensions** — VSCode extension for real-time linting

---

## 📦 Configuration

Create a `dockerfile-lint-plus.config.json` file to customize rules:

```json
{
  "failOn": ["error"],
  "format": "stylish",
  "rules": {
    "no-latest-tag": "error",
    "require-tagged-base-image": "error",
    "no-curl-bash": "error",
    "copy-deps-before-source": "warning",
    "require-non-root-user": "warning",
    "prefer-copy-over-add": "warning",
    "require-explicit-cmd-or-entrypoint": "warning"
  }
}
```

### Configuration Options

- **failOn** — Which severities cause exit code 1 (array of 'error', 'warning', 'info')
- **format** — Output format ('stylish' for humans, 'json' for machines)
- **rules** — Set severity per rule or 'off' to disable

---

## 💡 Use Cases

### 1. **Local Development**
```bash
dockerfile-lint-plus analyze Dockerfile
```
Check your Dockerfile before committing.

### 2. **CI/CD Integration**
```yaml
# GitHub Actions example
- name: Lint Dockerfile
  run: dockerfile-lint-plus analyze Dockerfile --strict
```

### 3. **Pre-commit Hook**
```bash
#!/bin/bash
dockerfile-lint-plus analyze Dockerfile
[ $? -eq 0 ] && git add Dockerfile
```

### 4. **Production Deployment**
```bash
dockerfile-lint-plus analyze Dockerfile --format json > report.json
if grep -q '"severity": "error"' report.json; then
  exit 1
fi
```

---

## 🔧 Development

### Setup

```bash
git clone <repo>
cd dockerfile-lint-plus
npm install
npm run build
npm test
```

### Project Structure

- **Source** — TypeScript in `src/`
- **Tests** — Vitest in `tests/`
- **Build output** — Compiled JavaScript in `dist/`
- **Config** — TypeScript compiler in `tsconfig.json`

### Key Dependencies

- **commander** — CLI argument parsing
- **chalk** — Colored terminal output
- **typescript** — Type-safe JavaScript

---

## 📄 Project Information

- **Project Name** — DockerLens
- **CLI Package Name** — dockerfile-lint-plus
- **Version** — 1.0.0
- **License** — MIT
- **Author** — DockerLens Contributors
- **Repository** — GitHub
- **NPM Package** — Available as `dockerfile-lint-plus`

---

## 🎯 Quick Start (5 Minutes)

1. **Install DockerLens**
   ```bash
   npm install -g dockerfile-lint-plus
   ```

2. **Check your Dockerfile with DockerLens**
   ```bash
   dockerfile-lint-plus analyze Dockerfile
   ```

3. **View violations**
   ```
   [ERROR] no-latest-tag - Line 1
   [WARNING] require-non-root-user - Line 5
   Total findings: 2
   ```

4. **Get help on a rule**
   ```bash
   dockerfile-lint-plus explain no-latest-tag
   ```

5. **Fix violations** based on suggestions

Done! Your Dockerfile is now more secure and reproducible. ✅

---

## 💬 Support

For issues, feature requests, or contributions, please visit the DockerLens repository.

---

*DockerLens — Made with ❤️ for better Docker practices*
