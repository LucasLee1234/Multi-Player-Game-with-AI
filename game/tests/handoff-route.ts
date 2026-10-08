import type { Role } from '../src/contracts/lobby.js';
export const handoffRoute: [Role,number,'move'|'pull'][] = [
  ['A',1,'move'],['A',6,'move'],['B',9,'move'],['B',8,'move'],['B',3,'move'],['B',2,'move'],
  ['A',1,'move'],['A',0,'move'],['B',1,'move'],['B',6,'move'],['A',1,'move'],['A',2,'move'],
  ['A',3,'move'],['A',8,'move'],['B',11,'move'],['B',16,'move'],['A',13,'move'],['A',14,'pull'],
  ['A',9,'move'],['A',8,'move'],['A',13,'move'],['A',8,'move'],['B',11,'move'],['A',9,'move'],
  ['A',4,'move'],['B',10,'move']
];
