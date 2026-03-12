# DockLens - Project Title

# dockerfile-lint-plus

`dockerfile-lint-plus` is a CLI-based Dockerfile analysis tool that helps developers identify security risks, inefficiencies, and maintainability issues in Dockerfiles before they reach production.

The project is designed like a linter for Dockerfiles, similar to how ESLint works for JavaScript. It reads a Dockerfile, parses its instructions, and evaluates it against a set of best-practice rules covering reproducibility, build performance, image size, security, and production readiness.

## Vision

Modern containerized applications rely heavily on Dockerfiles, but many projects still ship with risky or inefficient configurations such as unpinned base images, poor cache usage, oversized layers, root users, and unnecessary runtime dependencies.

`dockerfile-lint-plus` aims to solve that by providing:

- rule-based Dockerfile analysis
- severity-based reporting
- developer-friendly suggestions
- CI-ready output formats
- configurable rule enforcement

## Planned Features

### MVP
- Analyze a Dockerfile from the CLI
- Run a rule engine against Dockerfile instructions
- Report findings by severity (`error`, `warning`, `info`)
- Show line numbers where possible
- Return non-zero exit codes for CI failure conditions
- Support human-readable terminal output
- Support JSON output for automation
- Support config-based rule enable/disable controls

### Future Enhancements
- Dockerfile quality score out of 100
- Group findings by category such as security, performance, and maintainability
- Suggested fixed snippets
- Recursive scans for monorepos
- GitHub Action integration
- Markdown report generation

## Example Usage

```bash
npx dockerfile-lint-plus analyze Dockerfile