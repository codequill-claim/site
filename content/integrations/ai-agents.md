---
title: AI Agents
description: Install the CodeQuill agent skill so any agentskills.io-compatible coding assistant can claim repositories, snapshot source, attest builds, and preserve archives without leaving the agent loop.
order: 1
---

# AI Agents

AI agents generate and edit code. CodeQuill records what existed and who authorized it. This page explains how to wire the two together so an agent's output can be backed by on-chain evidence inside the same loop.

## Why this matters

- Agent-generated code needs the same provenance guarantees as human-written code. If your release pipeline already requires snapshots and attestations, agent-driven contributions should not bypass that.
- The CodeQuill CLI is the integration surface. Agents invoke `codequill` exactly the way a developer would. There is no separate "agent API" - anything documented in the [CLI Reference](/cli-reference/authentication) works.
- A pre-written skill primes the agent so you don't need to re-teach CodeQuill in every session. The skill ships the triggers, the seven primitives, the CLI surface, and the gotchas.

## The CodeQuill agent skill

A maintained agent skill lives at:

**[github.com/ophelios-studio/skills](https://github.com/ophelios-studio/skills)** (folder: `skills/codequill`)

The skill implements the [agentskills.io](https://agentskills.io) spec and works with any compatible coding assistant - **Claude Code, Cursor, Codex, Cline, Gemini CLI**, and any other tool that follows the spec. It is a single `SKILL.md` file: YAML frontmatter (`name`, `description`) plus a markdown body. The `description` field encodes the trigger surface so the agent knows when the skill is relevant; the body teaches CodeQuill's concepts, CLI surface, manifest schemas, and known gotchas.

License: MIT.

## Install

The canonical install uses the `skills` CLI:

```bash
npx skills add ophelios-studio/skills --skill codequill
```

This installs the skill to `~/.agents/skills/codequill/` and symlinks it into your agent's skill directory (for example `~/.claude/skills/`, `~/.cursor/skills/`, etc.). The CLI handles the per-agent symlink so the same skill works across every assistant you use.

To pull every Ophelios skill at once (CodeQuill, Leaf, Zephyrus, Kintsugi, 0g, AXL, AXL-pubsub):

```bash
npx skills add ophelios-studio/skills
```

Restart your agent or open a new session and the skill is auto-discovered. To confirm it loaded, ask the agent: *"What CodeQuill skill do you have available?"* It should respond with the skill name and a one-line summary.

## What the skill teaches the agent

Once loaded, the skill primes the agent with:

- The seven primitives - claims, snapshots, releases, attestations, preservations, proofs, and the trust index - and the order in which they apply.
- The full 16-command CLI surface - `login`, `who`, `quota`, `status`, `log`, `claim`, `snapshot`, `publish`, `pull`, `attest`, `prove`, `verify-proof`, `verify-attestation`, `preserve`, `wait`, `why`.
- The two GitHub Actions - `codequill-claim/actions-snapshot@v1` and `codequill-claim/actions-attest@v1` - for CI-driven evidence.
- The workspace layout - what lives in `.codequill/` (snapshots, proofs, config, index) and how repo-local config beats global.
- The manifest schemas - `codequill-snapshot:v1`, `codequill-attestation:v1`, `codequill-proof:v1`, `codequill-backup:v1`, `codequill-envelope:v1`.
- The loud non-guarantees - what CodeQuill does *not* prove, so the agent doesn't oversell.

The full reference lives in the [skill source](https://github.com/ophelios-studio/skills/tree/main/skills/codequill).

## Example prompts

Three concrete prompts and what the agent should do in response.

### 1. "Claim this repository and publish a snapshot"

The agent will:

1. Run `codequill login` if no valid token is on disk.
2. Run `codequill claim` to bind the GitHub repository to the workspace authority (gasless, one-time).
3. Run `codequill snapshot --commit <sha>` to compute the deterministic source state locally.
4. Run `codequill publish` to upload the manifest to IPFS and anchor the Merkle root on-chain.
5. Report back the snapshot ID and the published transaction.

### 2. "Attest the build at `dist/cli.tgz` against release v0.11.0"

The agent will:

1. Resolve `v0.11.0` to a release ID and confirm it is in **ACCEPTED** state (a server-side requirement).
2. Run `codequill attest dist/cli.tgz <releaseId>` to record the artifact-to-release lineage on-chain.
3. Report back the attestation ID.

If the release is not yet ACCEPTED, the agent stops and asks you to drive the governance step in the [web app](https://app.codequill.xyz). Attestations cannot bypass governance.

### 3. "Prove that `src/main.ts` was in snapshot `<snapshotId>`"

The agent will:

1. Run `codequill prove src/main.ts <snapshotId>`.
2. Walk you through the second device-code flow - `prove` requires the workspace authority's passkey to derive the path-salted hash.
3. Save the resulting proof under `.codequill/proofs/` and report its filename so you can share or verify it offline.

## Authentication notes

The agent uses the same auth flow as a human:

- First run: `codequill login` opens a browser device-code flow. Tokens land in `~/.codequill/tokens.json` (path overridable via `CODEQUILL_CONFIG_DIR`).
- Subsequent runs: refresh is automatic, serialized by an on-disk lock to avoid token-rotation races.
- Headless, CI, or sandboxed agents: set `CODEQUILL_TOKEN` to a pre-minted token instead of running the device flow.

Full details in the [authentication reference](/cli-reference/authentication).

## Limits and gotchas

- `prove` requires the workspace authority's passkey via a second device-code flow. The agent runs the command, the user approves in the browser, the agent picks up the proof.
- `preserve` runs unattended. It uses the workspace's public X25519 key to wrap the per-archive DEK, so an agent (or CI) can preserve a snapshot without any passkey prompt. **Decrypting** a preservation is the operation that needs the passkey, and that happens in the web app, not from the CLI.
- `attest` requires the release in ACCEPTED state. Governance is human-driven by design; an agent cannot self-approve a release before attesting against it.
- Agents must not commit `~/.codequill/tokens.json` or any environment-set `CODEQUILL_TOKEN` to the repo. The skill reinforces this rule, but it is worth restating.
- The CLI is the integration surface today. Agents shell out; there is no separate "agent API" yet. Treat the CLI commands as your interface contract.

## References

- **Skill collection** - [github.com/ophelios-studio/skills](https://github.com/ophelios-studio/skills)
- **CodeQuill skill** - [skills/codequill/SKILL.md](https://github.com/ophelios-studio/skills/tree/main/skills/codequill)
- **Spec** - [agentskills.io](https://agentskills.io)
- **CLI package** - [npmjs.com/package/codequill](https://www.npmjs.com/package/codequill)
- **CLI reference** - [Authentication](/cli-reference/authentication), [Source commands](/cli-reference/source-commands), [Verification commands](/cli-reference/verification-commands)
- **CI/CD** - [Overview](/ci-cd/overview), [Snapshot action](/ci-cd/snapshot-action), [Attestation action](/ci-cd/attestation-action)
