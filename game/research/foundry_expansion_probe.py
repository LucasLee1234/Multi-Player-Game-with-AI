"""Full-information research for proposed factory rooms; not production rules."""
from collections import deque
from itertools import product
import json

WIDTH = 5
FLOOR = frozenset({0, 1, 2, 3, 4, 6, 8, 10, 11, 12, 13, 14})
GATES = {2: (6, True), 11: (8, False)}
EXITS = (4, 10)


def adjacent(cell, cargo=False, service_bay=True):
    x, y = cell % WIDTH, cell // WIDTH
    floor = FLOOR | ({9} if cargo and service_bay else set())
    return [ny * WIDTH + nx for nx, ny in ((x-1,y),(x+1,y),(x,y-1),(x,y+1))
            if 0 <= nx < WIDTH and 0 <= ny < 3 and ny * WIDTH + nx in floor]


def won(state, cargo):
    return state[:2] == EXITS and (not cargo or state[2] == 8)


def actions(position, cargo, service_bay=True, allow_pull=True):
    return [('move', position)] + [(kind, cell) for cell in adjacent(position,cargo,service_bay)
                                 for kind in (('move', 'pull') if cargo and allow_pull else ('move',))]


def step(state, intents, cargo, disabled=None, service_bay=True):
    a, b, crate, latch = state
    if won(state, cargo):
        raise ValueError('Terminal state')

    def open_tile(cell):
        if cell not in GATES:
            return True
        relay, persistent = GATES[cell]
        return cell != disabled and ((persistent and latch) or relay in (a,b,crate))

    candidates = []
    for position, (kind, destination) in zip((a,b), intents):
        if destination != position and destination not in adjacent(position,cargo,service_bay):
            raise ValueError('Invalid geometry')
        next_crate = crate
        if kind == 'pull':
            behind = 2 * position - destination
            valid = cargo and behind == crate and destination != crate and open_tile(position)
            if not valid:
                candidates.append((position, crate, False)); continue
            next_crate = position
        elif destination == crate and destination != position:
            next_crate = 2 * crate - position
            valid = cargo and next_crate in adjacent(crate,cargo,service_bay) and next_crate not in (a,b) and open_tile(next_crate)
            if not valid:
                candidates.append((position, crate, False)); continue
        if destination != position and not open_tile(destination):
            candidates.append((position, crate, False)); continue
        candidates.append((destination, next_crate, next_crate != crate))
    da, ca, ma = candidates[0]
    db, cb, mb = candidates[1]
    if ma and mb:
        return state  # two simultaneous requests for one crate cancel the turn
    final_crate = ca if ma else cb if mb else crate
    if da == db or (da == b and db == a) or final_crate in (da,db):
        return state  # collision cancels the complete movement transaction
    latch = latch or any(after == 2 and after != before for before, after in zip((a,b,crate),(da,db,final_crate)))
    return (da, db, final_crate, bool(latch))


def audit(cargo, disabled=None, service_bay=True, allow_pull=True):
    initial = (0,14,12 if cargo else -1,False)
    routes = {initial: []}; queue = deque([initial]); reverse = {}; transitions = 0
    while queue:
        state = queue.popleft()
        if won(state,cargo):
            continue
        for intent in product(actions(state[0],cargo,service_bay,allow_pull),actions(state[1],cargo,service_bay,allow_pull)):
            following = step(state,intent,cargo,disabled,service_bay)
            transitions += 1
            reverse.setdefault(following,set()).add(state)
            if following not in routes:
                routes[following] = routes[state] + [(intent,following)]
                queue.append(following)
    goals = [state for state in routes if won(state,cargo)]
    recoverable = set(goals); queue = deque(goals)
    while queue:
        for predecessor in reverse.get(queue.popleft(),()):
            if predecessor not in recoverable:
                recoverable.add(predecessor);queue.append(predecessor)
    best = min(goals,key=lambda state:len(routes[state])) if goals else None
    trace = routes[best] if best else []
    waits = sum(intent[0][1] == before[0] for before,(intent,_) in zip([initial]+[s for _,s in trace],trace))
    waits += sum(intent[1][1] == before[1] for before,(intent,_) in zip([initial]+[s for _,s in trace],trace))
    return {
        'level': 'SF-M3 Keep the Power On' if cargo else 'SF-M2 Trade Places',
        'reachable_states':len(routes),'transitions':transitions,'winning_states':len(goals),
        'recoverable_states':len(recoverable),'softlocked_states':len(routes)-len(recoverable),
        'shortest_turns':len(trace) if goals else None,'wait_slots_in_this_shortest_witness':waits,
        'initial_state':initial,'shortest_witness':[{'actions':intent,'state':state} for intent,state in trace],
        'softlock_example':next((state for state in routes if state not in recoverable),None),
    }


def main():
    checks = {}
    def check(name,actual,expected):
        if actual != expected:
            raise AssertionError(f'{name}: {actual!r} != {expected!r}')
        checks[name]='PASS'
    check('pressure door can close without trapping occupant',
          step((4,11,-1,True),(('move',4),('move',10)),False),(4,10,-1,True))
    check('closed pressure door rejects entry',
          step((4,12,-1,True),(('move',4),('move',11)),False),(4,12,-1,True))
    check('new relay occupancy cannot power entry retroactively',
          step((3,12,-1,True),(('move',8),('move',11)),False),(8,12,-1,True))
    check('crate can power a relay while robots leave',
          step((3,12,8,True),(('move',4),('move',11)),True),(4,11,8,True))
    check('pull shifts crate into robot previous cell',
          step((0,13,12,False),(('move',0),('pull',14)),True),(0,14,13,False))
    check('blocked push leaves crate unchanged',
          step((0,13,12,False),(('move',0),('move',12)),True),(0,13,12,False))
    check('two requests for one crate cancel',
          step((6,12,11,True),(('pull',1),('pull',13)),True),(6,12,11,True))
    check('direct robot swap cancels',
          step((0,1,-1,False),(('move',1),('move',0)),False),(0,1,-1,False))
    check('closed onward gate makes following collide and cancel',
          step((0,1,-1,False),(('move',1),('move',2)),False),(0,1,-1,False))
    # The destination gate is closed in the previous check, so both attempted
    # destinations overlap after blocking. Use a latched gate for actual following.
    check('following into a vacated cell with open onward route',
          step((0,1,-1,True),(('move',1),('move',2)),False),(1,2,-1,True))
    check('trying to trade places in the narrow passage blocks',
          step((6,1,-1,True),(('move',1),('move',6)),False),(6,1,-1,True))
    northern_route=[(1,13),(6,8),(6,3),(6,2),(6,1),(6,0),(1,0),(2,1),(3,6),(8,6),(3,11),(4,10)]
    state=(0,14,-1,False)
    for a,b in northern_route:
        state=step(state,(('move',a),('move',b)),False)
        check(f'northern route reaches {(a,b)}',state[:2],(a,b))
    check('northern alternate route completes',won(state,False),True)
    levels=[]
    for cargo in (False,True):
        result=audit(cargo)
        check(f'{result["level"]} has a solution',result['winning_states']>0,True)
        check(f'{result["level"]} all reachable states recover',result['softlocked_states'],0)
        for gate in GATES:
            blocked=audit(cargo,gate)
            result.setdefault('disabled_gate_counterchecks',{})[str(gate)]=blocked['winning_states']==0
        levels.append(result)
    rejected=audit(True,service_bay=False)
    check('original cargo map exposes a softlock',rejected['softlocked_states']>0,True)
    no_pull=audit(True,allow_pull=False)
    check('cargo map requires a pull-capable control',no_pull['winning_states'],0)
    return {'date':'2026-10-07','scope':'Proposed expansion research, not browser/production/human evidence',
            'checks':checks,'levels':levels,'state_fields':['A','B','crate (-1 when absent)','latch for gate 2'],
            'rejected_cargo_map':{key:rejected[key] for key in ('reachable_states','softlocked_states','softlock_example')},
            'push_only_countercheck':{'reachable_states':no_pull['reachable_states'],'winning_states':no_pull['winning_states']},
            'northern_alternate_route':northern_route,
            'limitations':['Full-information model','No timing or networking','Not an actual phone test',
                           'One shortest witness does not characterize every strategy or enjoyment']}


if __name__=='__main__':
    print(json.dumps(main(),indent=2))
