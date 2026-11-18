### Context & Summary
<!-- 2-4 sentences explaining what this PR accomplishes and why -->

### Scope & Phase
- [ ] **Phase 1:** Database Schema & Named Constraints
- [ ] **Phase 2:** Part 1 — Homes & Members API
- [ ] **Phase 3:** Part 2 — Bills & Balances API (Integer Split Math)
- [ ] **Phase 4:** Part 2 — Idempotent Payments & Concurrency
- [ ] **Phase 5:** Web UI Layer (React + TanStack Router & Query)
- [ ] **Phase 6:** Quality Checks, ADR Documentation & Final Polish

---

### Technical Decisions & Invariants
<!-- What design choices were made in this PR, and why? What alternatives were rejected? -->

---

### Edge Cases Handled
<!-- Check all that apply to this PR's scope -->
- [ ] Home with no members (HTTP 422)
- [ ] Invalid / non-positive / fractional monetary amounts (HTTP 422)
- [ ] Deterministic remainder distribution across members in insertion order
- [ ] Idempotent payment replay with identical key (HTTP 200, no double payment)
- [ ] Concurrent payments on the same share (HTTP 409 for the losing request)
- [ ] Missing bill, share, or home resources (HTTP 404)
- [ ] Resilient UI against 500 errors and network delays (no white screen / crash)

---

### Verification & Test Evidence
<!-- Paste the commands executed and test output summaries -->
- **Tests (`pnpm test`):**
  ```text
  <!-- Paste test output here -->
  ```
- **Linter & Formatter (`pnpm check`):**
  ```text
  <!-- Paste Biome output here -->
  ```
- **Type Safety (`pnpm typecheck`):**
  ```text
  <!-- Paste TypeScript compiler output here -->
  ```

---

### Quality Checklist
- [ ] Strict TypeScript enforced — zero `any` types
- [ ] All error responses strictly match `{ "error": "message" }`
- [ ] Database constraints are named and defensible
- [ ] No extraneous dependencies or unexplainable abstractions
