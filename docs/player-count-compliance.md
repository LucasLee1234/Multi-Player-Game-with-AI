# Two-Player Requirement Check

Checked: October 6, 2026
Conclusion: Exactly two human players meets the documented player-count minimum. This is a source-based assessment, not organizer approval or proof that the unbuilt game satisfies every requirement.

## Source evidence

- Local `info/create.doc`, project requirements: "At least two players can join from separate devices". Exactly two satisfies this minimum. The same section requires understandable rules and cross-device play for people in different locations.
- Its later starter prompt suggests a party game for 2-8 players. That is an example prompt, not an eight-player minimum. Its deployment example also explicitly tests with two players.
- Local `info/start.doc` describes friends joining from phones/laptops with a room code, public access, and no login or installation.
- The [official public mission page](https://joinhandshake.com/learn/create-a-multiplayer-game-8d7d59b5/), reopened on this date, describes a public reusable game with room-code joining, synchronized screens, and no login/install. It adds no larger minimum in its public text.
- The [official contest rules](https://go.joinhandshake.com/rs/390-ZTF-353/images/%5BAI_Skills_Studio_Challenge%5D_Contest_Official_Rules.pdf?version=0), reopened on this date, require submission through the specified mission and judge against the project requirements. They do not specify a four-, six-, or eight-player minimum or a mandatory competitive mode.

## Signal Rescue assessment

| Item | Design coverage | Completion evidence |
| --- | --- | --- |
| At least two players | Exactly two humans; A and B | Design matches; deployed test pending |
| Separate devices and remote play | Public browser room, phone and computer | Different-device/network session pending |
| Shared multiplayer interaction | Both provide information and confirm shared turns | Logical model exists; network synchronization pending |
| Rules understandable without the creator | Tutorial, visible proposals, result explanations | Written design exists; first-time human test pending |
| Public URL, room code, no player login/install | Included in SR-01 and product scope | Azure deployment pending |
| Replayable experience | Retry and candidate missions | Production replay and quality testing pending |

Cooperation is compatible with the stated requirements; the reviewed materials do not mandate player-versus-player competition. Discrete movement turns can still use a live synchronized session. The implementation must demonstrate prompt shared updates instead of two unrelated local games or an asynchronous mockup.

Two robots controlled by one person, bots replacing the second human, or two local tabs alone would not establish the required separate-device experience. Use two actual participants and devices for acceptance evidence. Two tabs remain useful during development.

No documented scoring category awards automatic points for a larger player capacity. Execution, creativity, value, and polish each carry 25%; preserve a reliable, understandable two-player experience before considering expansion. Eligibility, actual ChatGPT Work access, build provenance, submission materials, and public availability remain separate checks in `competition-plan.md`.

Decision: retain exactly two players. Do not expand capacity to satisfy an example prompt. Complete a public two-device proof before claiming delivered compliance.
