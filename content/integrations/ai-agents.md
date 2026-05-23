---
title: AI Agents
description: Wire AI coding agents (Claude Code, Anthropic API) to CodeQuill so they can claim repositories, snapshot source, attest builds, and preserve archives without leaving the agent loop.
order: 1
---

AI agents generate and edit code. CodeQuill records what existed and who authorized it. This page explains how to connect the two so an agent's output can be backed by on-chain evidence inside the same loop — no separate "now run CodeQuill" step required.

## Why this matters

- **Agent-generated code needs the same provenance guarantees as human-written code.** If your release pipeline already requires snapshots and attestations, agent-driven contributions should not bypass that requirement.
- **The CodeQuill CLI is the integration surface.** Agents invoke `codequill` exactly the way a developer would. There is no separate "agent API" — anything documented in the [CLI Reference](/cli-reference/authentication) works.
- **A pre-written skill primes the agent** so you don't need to re-teach CodeQuill in every session. The skill ships triggers, the seven primitives, the CLI surface, and the gotchas.

## The CodeQuill Claude Code skill

A maintained [Claude Code](https://claude.com/claude-code) skill lives at:

**[github.com/ophelios-studio/skills/tree/main/skills/codequill](https://github.com/ophelios-studio/skills/tree/main/skills/codequill)**

License: MIT. The skill is a single `SKILL.md` file with YAML frontmatter (`name`, `description`) plus a markdown body. The `description` field encodes the trigger surface — Claude reads it on every session and decides when the skill is relevant. The body teaches CodeQuill's concepts, CLI surface, manifest schemas, and known gotchas.

## Install in Claude Code

Drop the skill folder into your Claude Code skills directory:

```bash
mkdir -p ~/.claude/skills
git clone https://github.com/ophelios-studio/skills.git /tmp/ophelios-skills
cp -R /tmp/ophelios-skills/skills/codequill ~/.claude/skills/codequill
```

Or pull just the CodeQuill subtree directly:

```bash
mkdir -p ~/.claude/skills/codequill
curl -fsSL https://raw.githubusercontent.com/ophelios-studio/skills/main/skills/codequill/SKILL.md \
  -o ~/.claude/skills/codequill/SKILL.md
```

Restart Claude Code (or open a new session) and the skill is auto-discovered. Claude will pull it into context when your prompt mentions any CodeQuill command, primitive, or framing.

To verify it loaded, start a session and ask: *"What CodeQuill skill do you have available?"* — Claude should respond with the skill name and a one-line summary.

## Use from the Anthropic API or SDKs

The same `SKILL.md` is portable beyond Claude Code:

- **Anthropic API Skills**: load `SKILL.md` as a skill resource for `claude-sonnet`, `claude-opus`, etc. See Anthropic's [Skills documentation](https://docs.anthropic.com/en/docs/build-with-claude/skills) for the request shape.
- **Inline system prompt**: paste `SKILL.md` into a `system` message. Cheap and effective when you can't yet use the Skills API.
- **Agent SDK / framework of your choice**: any framework that supports tool descriptions or system primers will accept the markdown verbatim.

## What the skill teaches the agent

Once loaded, the skill primes the agent with:

- **The seven primitives** — claims, snapshots, releases, attestations, preservations, proofs, and the trust index — and the order in which they apply.
- **The full 16-command CLI surface** — `login`, `who`, `quota`, `status`, `log`, `claim`, `snapshot`, `publish`, `pull`, `attest`, `prove`, `verify-proof`, `verify-attestation`, `preserve`, `wait`, `why` — with their flags and what they touch.
- **The two GitHub Actions** — `codequill-claim/actions-snapshot@v1` and `codequill-claim/actions-attest@v1` — for CI-driven evidence.
- **The workspace layout** — what lives in `.codequill/` (snapshots, proofs, config, index) and how repo-local config beats global.
- **The manifest schemas** — `codequill-snapshot:v1`, `codequill-attestation:v1`, `codequill-proof:v1`, `codequill-backup:v1`, `codequill-envelope:v1`.
- **The loud non-guarantees** — what CodeQuill does *not* prove, so the agent doesn't oversell.

The full reference lives in the [skill source](https://github.com/ophelios-studio/skills/tree/main/skills/codequill).

## Example prompts

Three concrete prompts and what the agent should do in response.

### 1. "Claim this repository and publish a snapshot"

The agent will:

1. Run `codequill login` if no valid token is on disk.
2. Run `codequill claim` to bind the GitHub repository to the workspace authority (gasless, one-time).
3. Run `codequill snapshot --commit <sha>` to compute the deterministic source state locally.
4. Run `codequill publish` to upload the manifest to IPFS and anchor the Merkle root on Ethereum.
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
2. Walk you through the second device-code flow — `prove` requires the workspace authority's passkey to derive the path-salted hash.
3. Save the resulting proof under `.codequill/proofs/` and report its filename so you can share or verify it offline.

## Authentication notes

The agent uses the same auth flow as a human:

- First run: `codequill login` opens a browser device-code flow. Tokens land in `~/.codequill/tokens.json` (path overridable via `CODEQUILL_CONFIG_DIR`).
- Subsequent runs: refresh is automatic, serialized by an on-disk lock to avoid token-rotation races.
- **Headless / CI / sandboxed agents**: set `CODEQUILL_TOKEN` to a pre-minted token instead of running the device flow.

Full details in the [authentication reference](/cli-reference/authentication).

## Limits and gotchas

- **`prove` and `preserve` require the workspace authority's passkey.** Agents cannot unilaterally decrypt preservations or sign proofs — those operations always loop a human in via a device-code prompt.
- **`attest` requires the release in ACCEPTED state.** Governance is human-driven by design; an agent cannot self-approve a release before attesting against it.
- **Don't commit secrets.** `~/.codequill/tokens.json` and any environment-set `CODEQUILL_TOKEN` must stay out of the repo. The skill reinforces this rule, but it's worth restating.
- **The CLI is the integration surface today.** Agents shell out; there is no separate "agent API" yet. Treat the CLI commands as your interface contract.

## References

- **Skill repository** — [github.com/ophelios-studio/skills/tree/main/skills/codequill](https://github.com/ophelios-studio/skills/tree/main/skills/codequill)
- **CLI package** — [npmjs.com/package/codequill](https://www.npmjs.com/package/codequill)
- **CLI reference** — [Authentication](/cli-reference/authentication), [Source commands](/cli-reference/source-commands), [Verification commands](/cli-reference/verification-commands)
- **CI/CD** — [Overview](/ci-cd/overview), [Snapshot action](/ci-cd/snapshot-action), [Attestation action](/ci-cd/attestation-action)
- **Anthropic Skills documentation** — [docs.anthropic.com — Skills](https://docs.anthropic.com/en/docs/build-with-claude/skills)
