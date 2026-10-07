# Signal Rescue - Short Development Cycle

Updated: October 6, 2026
Purpose: Turn the current gameplay research into small, testable increments with useful Git checkpoints.
Status: Coding explicitly resumed; SYS-01 local room/connection cycle completed. Git synchronization occurs through local checkpoints; GitHub remote remains unavailable.

## Working agreement

Use this document as the practical checklist for [development-workflow.md](development-workflow.md). Track progress in [tasks.md](tasks.md), current candidate rules in [candidate-gameplay-spec.md](candidate-gameplay-spec.md), and material choices in `decisions.md`. `game-design.md` is the historical 0.2 audit. Do not create a new analysis report for every small change.

One cycle has one outcome: define it, implement it, verify it, inspect the experience, adjust if needed, and commit it. A cycle may span sessions; a one-hour participant session is a planning aid, not a promise that every feature takes one hour.

## Before the first coding cycle

- [x] Write a short implementation specification naming the rule version to be tested: J1-C1. Distinguish it from audited 0.2; release acceptance remains open.
- [x] Include one asymmetric mission with a complete legal route, each player's knowledge, a tempting failed plan, and a recoverable mistake; paper evidence in the candidate specification.
- [x] State the objective, legal actions, information boundaries, resolution order, and terminal conditions in the candidate specification.
- [x] Make one low-fidelity mobile layout and a simple desktop adaptation: `mobile-wireframe.html`. Device/visual usability remains untested.
- [x] Define authoritative room state and filtered views in `architecture.md`; implementation verification remains pending.
- [x] Establish a project-local Git repository and participant-specified identity; authored files reviewed for the initial checkpoint. Commit outcome is recorded in chat/evidence.
- [ ] Configure the participant's intended remote when its URL and access are available. Local work can proceed while remote setup is pending.

This is one bounded preparation pass. Once these items are coherent enough for a testable candidate, begin the prototype; remaining experience questions belong in its acceptance criteria.

## Visual recommendation

Start with a low-fidelity wireframe, then code the interaction. Suggested participant review time: 15-30 minutes for the first layout, adjusted if needed.

The wireframe should answer:

- Can a player distinguish their own route from the partner's hazard information?
- Are Safe, Danger, and Unknown distinguishable through text or symbols as well as color?
- Are the room code, turn, strikes, partner state, proposed moves, and Ready action easy to locate?
- Can both boards and the main controls be read and used on the target phone?
- Is it clear that joint exit, if selected, permits moving away from an exit?

A grayscale sketch or editable layout is sufficient. Use it to resolve hierarchy and interaction, not to commit to final art. Create polished imagery after the core interaction is understandable and worth refining. A static image cannot verify synchronization, touch interaction, or enjoyment.

## The cycle

| Step | Assistant work | Participant involvement | Exit evidence |
| --- | --- | --- | --- |
| 1. Define | Select one outcome, scope, requirement IDs, and acceptance checks | Resolve a consequential choice if needed | A short task entry with an observable outcome |
| 2. Implement | Build the smallest complete interaction needed for that outcome | Usually none during execution | A runnable increment |
| 3. Verify | Run checks proportional to risk; fix failures | Provide account/device input when necessary | Actual results, including limits |
| 4. Inspect | Walk through the user flow and identify confusion | Try the increment when useful; report concrete behavior | Observations rather than assumed enjoyment |
| 5. Adjust | Fix the highest-impact issue and rerun affected checks | Choose between meaningful product tradeoffs | Acceptance met, or a clearly recorded unresolved defect |
| 6. Record and sync | Update affected docs, inspect the diff, commit, and push to the configured remote | Supply remote access only when required | Commit identifier and confirmed push result, or an explicit local-only checkpoint |

Do not keep revising an accepted increment without a new failure or unmet criterion. After two failed fixes to the same reproduced defect, isolate the cause before making more changes.

## Initial implementation sequence

| Increment | Outcome | Essential verification |
| --- | --- | --- |
| 1. Room and connection | Two clients create/join the same room and see their role and connection state | Third-player rejection, room isolation, correct shared identity |
| 2. One synchronized turn | Public proposals and confirmation produce one authoritative move result | Duplicate requests, stale actions, collisions, same result on both clients |
| 3. Private information and signals | Each player receives only authorized hazard information and can guide the partner | Inspect actual payloads; truthful signals, quota behavior, knowledge persistence |
| 4. Complete candidate mission | The selected rule version supports win, failure, and retry | Level route, terminal precedence, reset behavior, no commands after termination |
| 5. Public device proof | Phone and computer complete the same session through Azure | Public access, different networks, private views, reconnect/restart messaging |
| 6. Experience and polish | Onboarding and controls make the loop understandable | First-time observations, mobile usability, targeted regression checks |

This sequence decomposes TECH-02, BUILD-01, UX-01, and REL-01; it does not replace their acceptance criteria. Verify Azure account/cost requirements before provisioning. Aim for the public proof early rather than waiting for completed art. Keep structured friend tests around October 25-26 and the October 28 submission target unless the participant changes them.

## Reusable cycle checklist

Copy this short block into the active task or session record; a new standalone document is unnecessary.

```text
Cycle / task:
Rule or build version:
Player outcome:
Included / excluded:
Linked requirements:
Acceptance checks:
Observed results and evidence:
Open defects or untested behavior:
Participant observation, if any:
Commit:
Remote synchronization: PUSHED / LOCAL ONLY / FAILED / NOT CONFIGURED
Next smallest task:
```

- [ ] The increment meets its stated outcome.
- [ ] Relevant checks passed; remaining limitations are recorded.
- [ ] Current docs and README describe what actually exists.
- [ ] The staged diff contains the intended project files.
- [ ] A useful checkpoint is committed; remote status is reported accurately.

## Git and GitHub synchronization

Initial inspection on October 6 found no project-local repository and an unrelated parent repository. SYS-01 established this project's own `.git` and `codex/sys-01` branch. Do not use the parent repository or change global ownership/trust settings. Outside-sandbox Git uses a command-scoped trust exception for this exact project because its `.git` was created by the sandbox account.

At setup, verify the repository top level matches the project directory, use the existing valid commit identity or obtain the missing identity, then create the baseline. A new work branch should use the `codex/` prefix unless the participant specifies another convention.

For each accepted coding increment:

1. Inspect project-local status and the diff.
2. Stage the intended code, tests, documentation, and runtime assets; honor `.gitignore`.
3. Review the staged diff and relevant check results.
4. Commit with a concise description of the completed outcome.
5. Push to the participant's designated remote and work branch, without force-pushing or rewriting unrelated history.
6. Report the commit and whether the push succeeded. A commit is a local checkpoint; only a successful push establishes remote synchronization.

If the remote already has content, inspect its branch/history before integration. Do not overwrite an existing repository. If a push fails, preserve the local commit and report the specific blocker. Authentication should use the normal credential flow; never record tokens in project files.

The participant confirmed that the GitHub repository has not been created. Establish local version history at coding start; remote synchronization remains pending repository setup. The intended sync includes code and authored non-code project work, not just source files. Raw materials under `info/` are supplied references; decide their remote inclusion during initial tracked-file review rather than assuming they are authored project assets. Review visibility and the files before the first push; creating a new repository and selecting its visibility require a concrete target decision.

No automatic background synchronization is configured. Sync occurs as part of active coding cycles. The participant's request to synchronize during coding supplies authorization for ordinary commits and pushes to the intended configured destination; repeated permission is unnecessary for those routine steps.

## README maintenance

The root [README](../README.md) is the repository landing page. Keep it concise and truthful:

- State the game premise and exactly two-player scope.
- Mark implemented behavior separately from proposed rules.
- Document actual setup/test commands; do not invent a playable URL or runtime instructions.
- Add screenshots, deployment details, and a demo link when they exist.
- Link to design, current tasks, and verification limits instead of duplicating all rules.
- Document a license only after one is selected; do not imply an open-source license solely because the repository is visible.

Update the README when the runnable app, commands, chosen rules, or deployment changes. Save all project artifacts in English.
