---
title: Utility Commands
description: "CLI utility commands: wait for on-chain transaction confirmations and explore the philosophy behind CodeQuill with the why command."
order: 4
---

# Utility Commands

These commands provide supporting functionality: waiting for on-chain transactions and accessing explanatory content about how CodeQuill works.

---

## codequill wait

Wait for a blockchain transaction to reach a specified number of confirmations. This is useful when you have submitted a transaction with `--no-wait` and want to separately track its confirmation, or when you need to gate a subsequent step on transaction finality.

### Syntax

```bash
codequill wait <tx_hash> [options]
```

### Arguments

| Argument | Required | Description |
|---|---|---|
| `tx_hash` | yes | The transaction hash to wait for (e.g. `0xabc123...`) |

### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `--confirmations <n>` | integer | `1` | Number of on-chain confirmations to wait for before returning |
| `--timeout <ms>` | integer | `300000` | Maximum time in milliseconds to wait before timing out |

### Example

```bash
codequill wait 0xabc123def456789...
```

```
Waiting for transaction 0xabc123def456789...
  Confirmations: 0/1

  Confirmations: 1/1
Transaction confirmed.
```

#### Wait for multiple confirmations with a custom timeout

```bash
codequill wait 0xabc123def456789... --confirmations 5 --timeout 600000
```

### Notes

- The default poll interval is **3000ms** (3 seconds). The minimum poll interval is **500ms**. The backend may return a `next_poll_ms` hint with each response, in which case the CLI honors it.
- If the transaction is not confirmed within the `--timeout` period, the command exits with a non-zero exit code.
- This command is particularly useful in CI/CD pipelines where you submit a transaction with `--no-wait` in one step and confirm it in a later step:

  ```bash
  # Step 1: Submit without waiting
  TX_HASH=$(codequill publish --no-confirm --no-wait --json | jq -r '.tx_hash')

  # Step 2: Wait for confirmation separately
  codequill wait "$TX_HASH" --confirmations 3
  ```

- The command polls the CodeQuill backend at `GET /v1/cli/tx/<tx_hash>` to read confirmation status. It does not require authentication, so it can be used in pipelines without exposing a token to the confirmation step.

---

## codequill releases

List the releases registered against the current repository. Useful when you need to find a release UUID to pass to `codequill attest`, or to confirm a release's governance state before automating an attestation.

### Syntax

```bash
codequill releases [options]
```

### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `--repo <owner/name>` | string | git remote | Override the repository name. Defaults to parsing the `origin` git remote. |
| `--accepted` | flag | off | Only show releases whose governance is `ACCEPTED` (the ones `attest` can target). |
| `--json` | flag | off | Emit raw `ReleaseResult[]` as JSON for piping (e.g. into `jq`). |

### Default output

A table with the columns **NAME**, **STATUS**, **GOVERNANCE**, **PUBLISHED**, **ID** (truncated). Status colours: `PUBLISHED` green, `DRAFT` dim, `REVOKED` red, `SUPERSEDED` yellow. Governance colours: `ACCEPTED` green, `PENDING` yellow, `REFUSED` red.

### Examples

List every release for the current repository:

```bash
codequill releases
```

Show only the releases that can be attested against:

```bash
codequill releases --accepted
```

Pipe through `jq` to extract a single release UUID by name:

```bash
RELEASE_ID=$(codequill releases --accepted --json | jq -r '.[] | select(.name=="v0.11.0") | .release_id')
```

### Notes

- The command derives the repo name from `git remote get-url origin` unless `--repo` is set. The repository must be claimed (`codequill claim`) before any release will exist.
- Returns `{ releases: ReleaseResult[] }`. Each `ReleaseResult` contains `release_id`, `name`, `status`, `gouvernance`, `published_at`, `manifest_cid`, `tx_hash`, and other on-chain fields.
- For most workflows you do **not** need to resolve UUIDs manually — `codequill attest <build> <name>` accepts a release name and resolves it via this same endpoint internally. Use the explicit command when scripting around governance state or when you want to surface a list to a human.

---

## codequill why

Explain why CodeQuill works the way it does. This command prints explanatory content about core concepts and design decisions directly in your terminal. It is intended for onboarding, learning, and quick reference.

### Syntax

```bash
codequill why [topic] [options]
```

### Arguments

| Argument | Required | Description |
|---|---|---|
| `topic` | no | A specific topic to explain. Must be one of: `claim`, `snapshot`, `publish`, `prove`, `attest`, `preserve`. If omitted, prints the full overview covering all topics. |

### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `--short` | boolean | `false` | Print a brief, condensed explanation instead of the full text |
| `--ci` | boolean | `false` | Output in a CI-friendly format (no colors, no interactive formatting) |

### Example

```bash
codequill why
```

```
CodeQuill produces verifiable evidence records for source code.

A claim establishes who speaks for a repository...
A snapshot captures the exact state of source at a point in time...
Publishing anchors that snapshot on-chain...
...
```

#### Explain a specific topic

```bash
codequill why snapshot
```

```
A snapshot is a deterministic cryptographic fingerprint of your repository's
tracked files at a specific commit.

CodeQuill reads every tracked file, hashes each one with a per-snapshot salt,
and builds a Merkle tree. The root of that tree is the snapshot's identity.
No source code leaves your machine during this process...
```

#### Short explanation for quick reference

```bash
codequill why attest --short
```

```
An attestation links a build artifact to a release, creating a verifiable
chain from source to binary.
```

#### CI-friendly output

```bash
codequill why snapshot --ci
```

### Notes

- If no topic is provided, the full overview is printed, covering all core concepts in sequence.
- The available topics correspond to the major operations in the CodeQuill workflow: `claim`, `snapshot`, `publish`, `prove`, `attest`, and `preserve`.
- If both `--short` and `--ci` are set, `--short` takes precedence for content formatting. The `--ci` flag primarily affects output styling (disabling colors and interactive formatting), while `--short` affects content length.
- This command runs entirely offline. It does not contact any server.
