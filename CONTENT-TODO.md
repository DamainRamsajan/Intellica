# Content to confirm or supply

## Needs your decision
- [ ] **VeriCrypt claims.** Its README and arc42 describe `.pqc` reports, Lean 4 proofs, TEE attestation and an air-gapped single binary. Its own `CLAIMS.md` says those are NOT implemented yet and must not be claimed. The site follows `CLAIMS.md` (reports are `report.json`, commands are `vericrypt analyze` and `vericrypt verify`). When those capabilities ship and `CLAIMS.md` moves them, change `templates/prefill/vericrypt.json` and the docs.
- [ ] **VeriChain status.** The site says pre-release: spec frozen, core log and verifier built. Update when later gates pass.
- [ ] **Where binaries are hosted** (all `downloads.json` are empty). Options: GitHub Releases on each repo, or Cloudflare R2. Every entry needs a SHA-256.
- [ ] **Support assistant:** owner and backend. The Support tab is a contact page until then.
- [ ] **Kit distribution:** copy and sync (current) or hosted at one URL.
- [ ] **Accent colors.** AgentSeed coral #FF7A59 is a proposal (its own green is close to VeriChain's).
- [ ] **Sovereign ERP:** the code drop has no arc42; share `arc42-v*.md` for a fuller page and an audience statement.

## AgentSeed: run these in a terminal and tell me the output
I could not reach npm or the GitHub API from my environment.
```
npm view @agentseed/cli name version
npm view @asl-lang/cli name version
gh release list -R agentseedlanguage-cpu/agentseed
```
- [ ] Which package name is real (landing page says `@agentseed/cli`; `cli/npm/package.json` says `@asl-lang/cli`; the manual cites `agentseed.org/install.sh`)
- [ ] Is there a GitHub release with binaries? Then I fill `downloads.json` with checksums.
- [ ] WebAssembly build of seedc and seedvm for the Demo tab (their playground says "coming soon")
- [ ] Cloudflare must be able to read the `agentseedlanguage-cpu` repo, or fork it under your account
- [ ] Their landing page links a placeholder PDF for the paper

## Demos (from the product chats)
- [ ] VeriChain: browser verifier (the `vc-verify` WASM build is unverified)
- [ ] VeriCrypt: browser verifier
- [ ] OMC: browser demo of the paired audit
- [ ] Sovereign ERP: browser Period Controller
- [ ] AgentSeed: browser compiler and VM
