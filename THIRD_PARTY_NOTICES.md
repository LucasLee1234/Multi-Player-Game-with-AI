# Third-Party Notices

The project MIT License applies to original project material, not to third-party software or supplied contest reference documents.

Dependencies and build tools retain their own copyright and license notices. The runtime image preserves production dependency files, including package licenses. The official Node.js base image also contains its accompanying notices.

| Component | Use | License |
| --- | --- | --- |
| Node.js | Runtime and base image | MIT and bundled third-party licenses |
| ws | WebSocket runtime dependency | MIT |
| TypeScript | Build-time compiler | Apache-2.0 |
| pnpm | Build-time package manager | MIT |
| @types/node, @types/ws | Build-time type definitions | MIT |

Exact versions are recorded in `game/package.json` and `game/pnpm-lock.yaml`. Consult installed package LICENSE files and base image notices for authoritative terms; this table is an index, not a replacement. Release-workflow GitHub Actions retain their own repository licenses.

Local `info/` contest materials are excluded from this repository and container build. External organization names and trademarks retain their respective ownership; mention does not imply endorsement of this game.
