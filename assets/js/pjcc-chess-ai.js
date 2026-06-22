/*! pjcc-chess-ai.js — tunable opponent AI for The Gauntlet.
 *
 *  Negamax + alpha-beta over the perft-verified pjcc-chess.js move generator, with
 *  iterative deepening and a wall-clock cap so it never hangs the UI. Strength AND
 *  personality come from a `persona`:
 *    { depth, blunder, mat, pst, aggr, timeMs, name }
 *  - depth   : max search ply (1 = grabby beginner, 4 = the CEO)
 *  - blunder : 0..1 probability of just playing a random legal move (beatable low rungs)
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
  timeMs: p.timeMs||600, name: p.name||'' }; }

// Best move for the side to move under `persona`. Returns a move object, or null if none.
function bestMove(S, persona){
  var P = norm(persona);
  var moves = E.legalMoves(S);
  if(!moves.length) return null;
  if(moves.length===1) return moves[0];
  if(P.blunder && Math.random() < P.blunder) return moves[(Math.random()*moves.length)|0];
  NODES=0; DEADLINE = Date.now() + P.timeMs;
  var best = moves[0];
  for(var d=1; d<=P.depth; d++){
    var aBest=null, aScore=-INF, alpha=-INF, prev=best;
    // search the previous-best move first for better pruning
    moves.sort(function(a,b){ return (b===prev?1:0) - (a===prev?1:0); });
    try {
      for(var i=0;i<moves.length;i++){
        var sc = -nega(E.makeMove(S, moves[i]), d-1, -INF, -alpha, 1, P);
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
