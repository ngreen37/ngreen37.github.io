/*! pjcc-chess-ai.js — tunable opponent AI for The Gauntlet.
 *
 *  Negamax + alpha-beta over the perft-verified pjcc-chess.js move generator, with
 *  iterative deepening and a wall-clock cap so it never hangs the UI. Strength AND
 *  personality come from a `persona`:
 *    { depth, blunder, mat, pst, aggr, timeMs, name }
 *  - depth   : max search ply (1 = grabby beginner, 4 = the CEO)
 *  - blunder : 0..1 probability of just playing a random legal move (beatable low rungs)
 *  - noise   : centipawns of MISJUDGEMENT at the root — the bot picks a plausible worse
 *              move because it valued it wrong. The strength dial; `blunder` is the
 *              character dial and wants to stay small. See the note in bestMove().
 *  - mat/pst : weights on material vs piece-square placement (mat-only = a greedy recruit)
 *  - aggr    : bonus for own pieces crowding the enemy king (an attacker's bias)
 *
 *  Browser: window.PJCCChessAI. Node: require (auto-loads ./pjcc-chess.js).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./pjcc-chess.js'));
  else root.PJCCChessAI = factory(root.PJCCChess);
}(typeof self !== 'undefined' ? self : this, function (E) {
'use strict';

var VAL = { p:100, n:320, b:330, r:500, q:900, k:0 };
var INF = 1e9, MATE = 100000;

// Piece-square tables, written a1=index0 … h8=index63 (rank 1 first).
var PST = {
  p:[ 0,0,0,0,0,0,0,0, 5,10,10,-20,-20,10,10,5, 5,-5,-10,0,0,-10,-5,5,
      0,0,0,20,20,0,0,0, 5,5,10,25,25,10,5,5, 10,10,20,30,30,20,10,10,
      50,50,50,50,50,50,50,50, 0,0,0,0,0,0,0,0 ],
  n:[ -50,-40,-30,-30,-30,-30,-40,-50, -40,-20,0,0,0,0,-20,-40,
      -30,0,10,15,15,10,0,-30, -30,5,15,20,20,15,5,-30,
      -30,0,15,20,20,15,0,-30, -30,5,10,15,15,10,5,-30,
      -40,-20,0,5,5,0,-20,-40, -50,-40,-30,-30,-30,-30,-40,-50 ],
  b:[ -20,-10,-10,-10,-10,-10,-10,-20, -10,0,0,0,0,0,0,-10,
      -10,0,5,10,10,5,0,-10, -10,5,5,10,10,5,5,-10,
      -10,0,10,10,10,10,0,-10, -10,10,10,10,10,10,10,-10,
      -10,5,0,0,0,0,5,-10, -20,-10,-10,-10,-10,-10,-10,-20 ],
  r:[ 0,0,0,0,0,0,0,0, 5,10,10,10,10,10,10,5, -5,0,0,0,0,0,0,-5,
      -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5,
      -5,0,0,0,0,0,0,-5, 0,0,0,5,5,0,0,0 ],
  q:[ -20,-10,-10,-5,-5,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,5,5,5,0,-10,
      -5,0,5,5,5,5,0,-5, 0,0,5,5,5,5,0,-5, -10,5,5,5,5,5,0,-10,
      -10,0,5,0,0,0,0,-10, -20,-10,-10,-5,-5,-10,-10,-20 ],
  k:[ -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30,
      -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30,
      -20,-30,-30,-40,-40,-30,-30,-20, -10,-20,-20,-20,-20,-20,-20,-10,
      20,20,0,0,0,0,20,20, 20,30,10,0,0,10,30,20 ]
};
// Engine board index i (rank 0 = 8th rank) -> table lookup. White reads the vertically
// mirrored square; Black reads it directly (the tables are White-oriented, rank-1-first).
function pstVal(t, i, color){ var r=(i/8)|0, f=i%8; return color==='b' ? t[i] : t[(7-r)*8+f]; }
function cheb(i,j){ var ri=(i/8)|0, fi=i%8, rj=(j/8)|0, fj=j%8; return Math.max(Math.abs(ri-rj), Math.abs(fi-fj)); }

function evalWhite(S, P){
  var s=0, b=S.b, i, wk=-1, bk=-1, p, c, pl;
  for(i=0;i<64;i++){ p=b[i]; if(!p) continue; c=(p>='A'&&p<='Z')?'w':'b'; pl=p.toLowerCase();
    if(pl==='k'){ if(c==='w') wk=i; else bk=i; }
    var v = P.mat*VAL[pl] + P.pst*pstVal(PST[pl], i, c);
    s += (c==='w'? v : -v);
  }
  if(P.aggr){
    for(i=0;i<64;i++){ p=b[i]; if(!p) continue; pl=p.toLowerCase(); if(pl==='p'||pl==='k') continue;
      c=(p>='A'&&p<='Z')?'w':'b'; var ek = c==='w'? bk : wk; if(ek<0) continue;
      s += (c==='w'? 1 : -1) * P.aggr * (7 - cheb(i, ek));
    }
  }
  return s;
}

function order(moves, b){
  for(var i=0;i<moves.length;i++){ var m=moves[i], t=b[m.to];
    m._s = (t ? (VAL[t.toLowerCase()]||0) - (VAL[b[m.from].toLowerCase()]||0)/10 : 0) + (m.promo?800:0) + (m.ep?100:0);
  }
  moves.sort(function(a,b){ return b._s - a._s; });
}

var NODES=0, DEADLINE=0; var ABORT={abort:true};
function nega(S, depth, alpha, beta, ply, P){
  if((++NODES & 2047)===0 && Date.now()>DEADLINE) throw ABORT;
  var moves = E.legalMoves(S);
  if(!moves.length) return E.inCheck(S, S.turn) ? (-MATE + ply) : 0;
  if(depth<=0){ var w = evalWhite(S, P); return S.turn==='w' ? w : -w; }
  order(moves, S.b);
  var best=-INF;
  for(var i=0;i<moves.length;i++){
    var sc = -nega(E.makeMove(S, moves[i]), depth-1, -beta, -alpha, ply+1, P);
    if(sc>best) best=sc;
    if(best>alpha) alpha=best;
    if(alpha>=beta) break;
  }
  return best;
}

function norm(p){ p=p||{}; return {
  depth: p.depth||2, blunder: p.blunder||0,
  mat: p.mat==null?1:p.mat, pst: p.pst==null?1:p.pst, aggr: p.aggr||0,
  noise: p.noise||0, tilt: p.tilt||0, neverCastle: !!p.neverCastle,
  timeMs: p.timeMs||600, name: p.name||'' }; }

/* ⭐ TILT — THEY FALL APART WHEN THEY ARE LOSING (2026-09-13).
   Nate: *"There could be some weaknesses in the opponents too - especially the lower-tier
   ones - like they fall apart when they lose their queen for example."*
   A losing human gets worse: they stop calculating, they grab, they hope. A bot that plays
   the same accurate game a rook down is the least human thing on the board.
   ⚠ THE THRESHOLD IS IN THE PERSONA'S OWN EVAL UNITS, so with mat=1 a queen is 900 and a
   minor is ~320. 300 means "a piece down or worse" — losing the queen triggers it outright,
   dropping a pawn does not. */
var TILT_CP = 300;

// Best move for the side to move under `persona`. Returns a move object, or null if none.
function bestMove(S, persona){
  var P = norm(persona);
  var moves = E.legalMoves(S);
  if(!moves.length) return null;
  if(moves.length===1) return moves[0];
  if(P.blunder && Math.random() < P.blunder) return moves[(Math.random()*moves.length)|0];

  /* ⭐ A WEAKNESS YOU CAN SEE AND AIM AT (2026-09-13). Nate: *"How about one character
     REFUSES to castle (a low rated player) so you can take advantage of that."*
     Every other dial here makes a bot worse INVISIBLY — you cannot watch noise happen. An
     uncastled king is a target sitting in the middle of the board, so this is the only
     weakness that teaches the player something by existing.
     ⚠ THE GUARD IS NOT PARANOIA. Castling can be the only move that keeps a search alive in
     a constructed position, and returning an empty list here would resolve to null and read
     as stalemate to the caller. Filter, then fall back if nothing survives. */
  if(P.neverCastle){
    var noCastle = moves.filter(function(m){ return !m.castle; });
    if(noCastle.length) moves = noCastle;
  }

  /* ⚠⚠ DEPTH IS WHAT COLLAPSES, NOT NOISE — measured, not chosen. At depth 2 the noise dial
     is nearly flat (n160 = -783, n220 = -808, twenty-five points for sixty centipawns), so
     piling on noise when a low rung is losing would do almost nothing. Losing a PLY is the
     cliff: d2n0 is -609 and d1n0 is -1269. So tilt takes a ply first and raises noise second,
     which is why a tilted beginner genuinely comes apart instead of just wobbling. */
  /* ⚠⚠ TILT IS A PROBABILITY, NOT A MAGNITUDE — AND THE FIRST VERSION WASN'T (2026-09-13).
     Built first as "when losing, drop a ply AND scale noise by (1+tilt)". Measured, that was
     a switch wearing a dial's clothes: 0.05 / 0.10 / 0.15 / 0.20 all salvaged the same 2.5%
     from a queen down, because ONE LOST PLY IS A CLIFF (d3→d2 is 287 points, d2→d1 is 660).
     The noise half did nothing at all — "ply drop only" and "both" both scored 2.5% — and
     noise ALONE made the losing bot BETTER (32.5% vs 15.0% untilted), the third time noise
     has run backwards in a losing or shallow position.
     So tilt now asks, per move, whether the bot stumbles: at 0.25 it loses its ply on a
     quarter of its moves while behind. Measured slope, 20 games a row:
         0 → 35.0%   ·   0.25 → 12.5%   ·   0.5 → 12.5%   ·   0.75 → 5.0%
     ⚠ Those bands are ±18%, so this buys about THREE honest settings (none / some / lots),
     not a continuum. Do not read 0.25 and 0.5 as different things. */
  var useDepth = P.depth, useNoise = P.noise;
  if(P.tilt){
    var ev = evalWhite(S, P), mine = (S.turn==='w') ? ev : -ev;
    if(mine <= -TILT_CP && Math.random() < P.tilt) useDepth = Math.max(1, P.depth - 1);
  }

  NODES=0; DEADLINE = Date.now() + P.timeMs;
  var best = moves[0];
  for(var d=1; d<=useDepth; d++){
    var aBest=null, aScore=-INF, alpha=-INF, prev=best;
    // search the previous-best move first for better pruning
    moves.sort(function(a,b){ return (b===prev?1:0) - (a===prev?1:0); });
    try {
      for(var i=0;i<moves.length;i++){
        var sc = -nega(E.makeMove(S, moves[i]), d-1, -INF, -alpha, 1, P);
        /* ⭐ MISJUDGEMENT, NOT DICE (2026-09-12). Nate: "re-calibrate so the bots
           consistently play at their level, not just best-move-or-blunder."
           `blunder` throws the position away and plays a RANDOM LEGAL MOVE, which does not
           read as a weaker player — it reads as a strong one having a seizure, because the
           moves either side of it are still the engine's best. `noise` instead perturbs how
           the bot VALUES each candidate, so it picks a plausible move that happens to be
           worse. That is what a weak human does, and it is a continuous dial where depth
           has only five steps. It is judgment error, not a coin flip.
           ⚠ APPLIED AT THE ROOT ONLY. Inside `nega` the same position would score
           differently on every visit, which breaks alpha-beta's assumptions and makes the
           search unstable rather than the judgment wrong. */
        if(useNoise) sc += (Math.random()*2 - 1) * useNoise;
        if(sc > aScore){ aScore = sc; aBest = moves[i]; }
        if(sc > alpha) alpha = sc;
      }
    } catch(e){ if(e===ABORT) break; throw e; }
    if(aBest) best = aBest;
    if(Date.now() > DEADLINE) break;
    if(aScore >= MATE - 100) break;   // found a forced mate; stop deepening
  }
  return best;
}

// Score a position from White's POV (exposed for tests / debugging).
function evalPosition(S, persona){ return evalWhite(S, norm(persona)); }

return { bestMove: bestMove, evalPosition: evalPosition };
}));
