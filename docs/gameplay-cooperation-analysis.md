# Signal Rescue - Cooperation Analysis and Joint Exit Candidate

Date: October 6, 2026
Task: GP-02, continued paper analysis.
Status: Recommendation for discussion, not an adopted rule change or implementation-ready baseline. Prototype construction remains deferred. No new executable model or game was created, and no human playtest occurred.

## Conclusion

Keep the private hazard premise, but evaluate cooperation after information has been exchanged. The smallest promising next candidate is joint exit: both robots remain on the board and the mission succeeds when both simultaneously occupy their own exit cells. An early arrival can move again and may need to make room for the partner.

This avoids adding gates, moving hazards, another resource, or a larger grid before proving that the existing movement puzzle can carry the experience. One existing research map supports a complete five-turn paper solution with a meaningful temporary departure from an exit. Other maps and the full layout family are not validated under this candidate.

## Correct interpretation of the second review

The complete-disclosure counterexample remains valid for 0.2: both partners can reveal both hazards in two Wait turns and then finish every safe-solvable layout in the tested family at full score. That disproves guaranteed sustained private-information navigation. It does not establish that communication failed or that the game cannot be enjoyable.

Players sharing useful information is an intended behavior. The relevant question is whether revealing it leaves a worthwhile cooperative problem. An early information exchange followed by route coordination can fit the selected concept, provided the product description accurately reflects this experience. The second review already allowed this interpretation; this continuation investigates it concretely.

Similarly, equal shortest route length does not mean equal difficulty. A four-turn solution can require more reasoning than a five-turn forced corridor. The prior 422-of-423 count measures shortest safe movement depth, not decision quality. Future level analysis must also describe alternatives, mutual interference, and the consequences of choosing poorly.

## Cooperation requirements

For this project, distinguish three things:

| Property | Example | What it establishes |
| --- | --- | --- |
| Information exchange | B tells A that cell 4 is dangerous for A | The second screen carries useful information |
| Coupled movement | B must vacate a cell before A can pass | One player's action changes the other's available plan |
| Meaningful choice | B chooses a side pocket rather than another blocking position | The participant evaluates consequences instead of only acknowledging a request |

The current design reliably offers the first early in a mission, sometimes offers the second, and has not yet established enough of the third. Ready clicks, mandatory attendance, or hiding more information do not by themselves supply it.

A cooperative puzzle can allow one confident participant to lead. We cannot guarantee equal intellectual participation with interface restrictions. Assess whether both have opportunities to contribute and whether actual players use them; avoid promising that an experienced player can never direct the other.

## Options assessed

| Option | What it addresses | Remaining problem / cost | Recommendation |
| --- | --- | --- | --- |
| Shorten the turn limit or reward speed | Makes two waiting turns less attractive | Can reduce recovery room; does not create a new cooperative decision | Do not use as the first repair |
| Restrict signals to nearby cells | Slows remote map disclosure | Can still become routine instructions; may obstruct helpful warnings | Keep as a later comparison only |
| Add moving hazards or a shared gate mechanic | Could create continuing dependencies | New rules, content constraints, failure cases, and verification work | Defer until simpler geometry is assessed |
| Keep both robots active until joint exit | Removes automatic disappearance; enables yielding and temporary retreat from an exit | Can create deadlocks; disjoint routes still have little interaction | Analyze first |

These are assessments of this project's rules and scope, not claims that one mechanic is universally superior.

## Joint exit candidate: exact paper delta

Candidate identifier: J1. It is not design version 0.3 and is not an approved production baseline.

Retain the 3-by-3 board, two hazard layers, visible proposals, cardinal moves/Wait, truthful signals, both-player confirmation, hazard-before-collision order, blocked direct swaps, and following into successfully vacated cells.

Change only the movement/end behavior for this analysis:

1. Reaching an exit does not extract or remove its robot.
2. A robot at its exit can Wait or move normally on later turns. Its player retains the same controls as before arrival.
3. After hazards and collisions resolve, first apply strike-limit failure, then check whether both robots simultaneously occupy their respective exit cells. If so, succeed immediately. Otherwise, continue or apply turn-limit failure as usual.
4. A previous visit to an exit is not stored as permanent completion. The objective text would need to say "Bring both robots to their exits together. You may need to move away to help your partner."

Keep eight turns as a comparison parameter for the single paper example, not as a validated universal J1 balance setting. Preserve the 0.2 score formula for comparison; do not reinstate a signal penalty.

The old extracted sentinel, extraction-specific controls, and assumptions about an unoccupied exit do not apply to J1. All previously solved levels require fresh validation if J1 is adopted.

## Worked example: make room before leaving together

Use the existing Shared Corridor research layout. Cells are:

```text
0  1  2
3  4  5
6  7  8
```

A starts at 3 and targets 5. B starts at 5 and targets 3. Each hazard layer is `{1,7}`. This particular map has identical layers and is a coordination teaching example, not the flagship evidence of asymmetric information.

### Information available before movement

For a fully justified information trace, each partner first truthfully signals the other's hazard at 1 and then at 7 over two Wait turns. Each knows there are exactly two hazards, so each can infer that all other cells are safe for their robot. Both now have the same relevant safety knowledge, positions, and public destinations. No hidden route knowledge is assumed in the movement reasoning below.

The following five movement turns are numbered separately; with the disclosure opening they are actual mission turns 3-7.

| Movement turn | A destination | B destination | Result and reason |
| --- | --- | --- | --- |
| 1 | 0 | 4 | A uses the upper side pocket; B approaches the left exit. Both targets are known safe and distinct |
| 2 | 0 (Wait) | 3 | B reaches its exit. A remains above it; the mission continues because A has not reached 5 |
| 3 | 3 | 6 | B temporarily leaves its exit for the lower pocket while A follows into the cell B vacates. This is following, not a swap |
| 4 | 4 | 3 | A moves toward the right exit; B returns to the left exit by following A's departure |
| 5 | 5 | 3 (Wait) | Both occupy their own exits simultaneously; the mission succeeds |

Manual rule check: every move is cardinal or Wait, no attempted destination is 1 or 7, no pair shares a resulting cell, no step is a direct swap, and both goals are occupied at the final step. There are zero strikes. The five-step witness plus two disclosure turns totals seven, within the comparison bound of eight. A scored mission would receive 100 under the retained formula.

This is a paper witness, not an executed J1 engine test, proof of shortest length, proof that novices discover it, or human enjoyment evidence. The existing executable model removes robots at exits and therefore cannot validate J1 without modification; it was deliberately not used to claim this result.

### The decision that remains after full disclosure

At positions `(0,3)`, A cannot move through 1 because it is dangerous. Its useful exit from the pocket is 3, occupied by B.

- If B stays at its exit while A tries 3, their targets overlap and both stay; the turn is lost.
- If B moves to 0 while A moves to 3, that is a direct swap and is blocked.
- If B moves to 6 while A moves to 3, both progress as intended. B can return after A moves to 4.
- If B moves toward 4 instead, movement can be legal but the robots still need to solve passing farther to the right. Legality alone does not establish that this choice fits the remaining turn budget.

The useful choice is where and when to yield, including giving up an apparently completed personal objective. It remains relevant even with every hazard known. The players can reason from current public state and confirmed safety; the example does not require an unverified move.

This supplies one concrete decision opportunity, not a guarantee that two humans will reason equally. A single player could explain the sequence to the other. Human observation must assess whether the interaction feels cooperative rather than merely procedural.

## Counterexamples and remaining risks

### Joint exit does not fix independent routes

The existing tutorial's opposite outer routes can still reach both exits together without needing a yielding decision. Keeping the robots active does not automatically deepen such a map. Use that geometry to teach information and movement, not to prove the main challenge.

### Joint exit can create unsolvable missions

The old rule allows an early finisher to disappear and free space. Removing that behavior can eliminate valid old solutions. A narrow passage without a usable side pocket may prevent passing. Do not carry over the 423-layout solvability count, the old route lengths, or the old zero-strike guarantees to J1.

### A player may still wait

The worked solution includes purposeful Wait actions. Waiting while making space or holding a final position is acceptable when the player understands its consequence. Mandatory Ready after an obvious long sequence can still feel passive. Joint exit reduces forced loss of controls; it does not prove uninterrupted engagement.

### Identical layers are not sufficient asymmetric design

Shared Corridor is deliberately easy to inspect. A release mission still needs different hazard information that changes the players' plans. A later paper example should demonstrate both asymmetric safety and coupled movement, instead of claiming this symmetric witness proves both.

### Static maps remain learnable

J1 does not establish replay variety. Replay may be practice, role exchange, or a more efficient route, and should be described accordingly. More layouts are useful only if they produce different decisions; rotations alone are insufficient evidence.

## Scope and next verification

J1 is a smaller conceptual change than dynamic hazards or gates: it revises end conditions and occupancy instead of adding a new resource/system. Its main cost is rechecking every level, rewriting extraction explanations, and updating turn/state tests. No hour estimate is asserted before that work is scoped.

The next paper task, if this direction is pursued, is one complete asymmetric mission with a justified knowledge trace and a necessary yielding decision. It must include a failed tempting plan, a recoverable mistake, and an explanation of each participant's contribution. The current symmetric witness is insufficient to close G2.

Before implementation acceptance, independently check any candidate route against adjacency, hazards, collisions, goal occupancy, information available at each choice, and the turn bound. Future program checks must use J1 semantics rather than relabeling 0.2 results. Future human tests must still establish understanding and enjoyment.

Keep prototype construction deferred as requested. The actionable result of this analysis is J1 as the first bounded candidate to compare, with explicit benefits, one checked paper witness, and limits. The current 0.2 design file remains the historical audited rule set.
