import type { MissionView } from '../contracts/lobby.js';

export type SoundCue = 'step' | 'crate' | 'gateOpen' | 'gateClose' | 'park' | 'win' | 'signal';
/** State changes only: snapshots, failed moves and new missions are silent. */
export function transitionSound(previous: MissionView | undefined, current: MissionView): SoundCue | null {
  if(!previous || previous.id!==current.id || !previous.foundry || !current.foundry) return null;
  if(current.result==='success' && previous.result!=='success') return 'win';
  const before=previous.foundry.crate, after=current.foundry.crate;
  if(before && after && before.cell!==after.cell) return after.cell===after.target?'park':'crate';
  if(current.foundry.gates.some(g=>g.open && previous.foundry!.gates.some(old=>old.cell===g.cell&&!old.open))) return 'gateOpen';
  if(current.foundry.gates.some(g=>!g.open && previous.foundry!.gates.some(old=>old.cell===g.cell&&old.open))) return 'gateClose';
  return previous.positions.A!==current.positions.A || previous.positions.B!==current.positions.B?'step':null;
}

/** Quiet, original synthesized effects: no downloads, music or audio assets. */
export class GameAudio {
  enabled=true;
  private context?: AudioContext;
  private master?: GainNode;
  private unlocked=false;
  constructor() { try { this.enabled=localStorage.getItem('foundry.sound.v1')!=='off'; } catch { /* Storage is optional. */ } }
  unlock() {
    if(!this.enabled || typeof AudioContext==='undefined') return;
    try {
      if(!this.context) { this.context=new AudioContext(); this.master=this.context.createGain();this.master.gain.value=.12;this.master.connect(this.context.destination); }
      this.unlocked=true;
      if(this.context.state==='suspended') void this.context.resume().catch(()=>{});
    } catch { /* Sound must never prevent play. */ }
  }
  toggle() {
    this.enabled=!this.enabled;
    try { localStorage.setItem('foundry.sound.v1',this.enabled?'on':'off'); } catch { /* Storage is optional. */ }
    if(this.master && this.context) this.master.gain.setValueAtTime(this.enabled?.12:0,this.context.currentTime);
    if(this.enabled) { this.unlock(); this.play('signal'); }
  }
  play(cue:SoundCue) {
    const ctx=this.context;
    if(!this.enabled || !this.unlocked || !ctx || ctx.state!=='running' || document.visibilityState==='hidden') return;
    const patterns:Record<SoundCue,number[]>={step:[110],crate:[180],gateOpen:[220,440],gateClose:[330,165],park:[660,880],win:[523,659,784],signal:[880]};
    const duration=cue==='step'?.06:cue==='signal'?.08:.12;
    try { patterns[cue].forEach((frequency,index)=>{
      const start=ctx.currentTime+index*(duration+.025), oscillator=ctx.createOscillator(), gain=ctx.createGain();
      oscillator.type=cue==='crate'?'sawtooth':cue==='step'?'triangle':'sine';
      oscillator.frequency.setValueAtTime(frequency,start);
      if(cue==='crate'||cue==='step') oscillator.frequency.exponentialRampToValueAtTime(frequency*.55,start+duration);
      gain.gain.setValueAtTime(0,start); gain.gain.linearRampToValueAtTime(cue==='crate'?.09:.2,start+.008); gain.gain.exponentialRampToValueAtTime(.001,start+duration);
      oscillator.connect(gain); gain.connect(this.master!); oscillator.start(start);oscillator.stop(start+duration+.015);
      oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
    }); } catch { /* An unavailable audio device must never interrupt gameplay. */ }
  }
}
