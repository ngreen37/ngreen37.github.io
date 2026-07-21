/*! pjcc-chess.js — PJCC shared chess engine (Phase 1 of The Gauntlet).
 *
 *  Extracted from the move generator shipping in pjcc_blindfold.html, which is
 *  perft-verified against the standard reference positions (startpos, Kiwipete,
 *  positions 3-5) — full legal rules incl. castling, en passant, promotion, and
 *  check/pin filtering. This module adds what a *whole game* needs beyond puzzle
 *  generation: FEN output, halfmove/fullmove clocks, insufficient-material and
 *  draw detection, repetition keys, and disambiguated SAN.
 *
 *  Board model: S.b is a length-64 array, index = rank*8 + file, rank 0 = the 8th
 *  rank (Black's back rank). Pieces are letters — UPPERCASE white, lowercase black,
 *  '' empty. State: { b, turn:'w'|'b', cast:{K,Q,k,q}, ep:index|-1, half, full }.
 *  Moves: { from, to, promo?, castle?, ep?, dbl? }.
 *
 *  Usable as a browser global (window.PJCCChess) or a Node module (require).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PJCCChess = factory();
}(typeof self !== 'undefined' ? self : this, function () {
'use strict';

function isW(p){ return !!p && p>='A' && p<='Z'; }
function isB(p){ return !!p && p>='a' && p<='z'; }
function colorOf(p){ return isW(p)?'w':isB(p)?'b':null; }
var START_FEN='rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

function parseFEN(fen){
  var parts=(fen||START_FEN).trim().split(/\s+/), rows=parts[0].split('/'), b=new Array(64).fill('');
  for(var r=0;r<8;r++){ var f=0, row=rows[r]||''; for(var i=0;i<row.length;i++){ var ch=row[i];
    if(ch>='1'&&ch<='8') f+=+ch; else { b[r*8+f]=ch; f++; } } }
  var c=parts[2]||'-';
  return { b:b, turn:(parts[1]==='b'?'b':'w'),
    cast:{K:c.indexOf('K')>=0,Q:c.indexOf('Q')>=0,k:c.indexOf('k')>=0,q:c.indexOf('q')>=0},
    ep:(parts[3]&&parts[3]!=='-')?sqFromName(parts[3]):-1,
    half:parts[4]?(+parts[4]||0):0, full:parts[5]?(+parts[5]||1):1 };
}
function toFEN(S){
  var rows=[];
  for(var r=0;r<8;r++){ var row='', e=0; for(var f=0;f<8;f++){ var p=S.b[r*8+f];
    if(!p){ e++; } else { if(e){ row+=e; e=0; } row+=p; } } if(e) row+=e; rows.push(row); }
  var c=(S.cast.K?'K':'')+(S.cast.Q?'Q':'')+(S.cast.k?'k':'')+(S.cast.q?'q':''); if(!c) c='-';
  var ep=S.ep>=0?nameFromSq(S.ep):'-';
  return rows.join('/')+' '+S.turn+' '+c+' '+ep+' '+(S.half||0)+' '+(S.full||1);
}
function sqFromName(s){ return (8-(+s[1]))*8 + (s.charCodeAt(0)-97); }
function nameFromSq(i){ return String.fromCharCode(97+(i%8)) + (8-((i/8)|0)); }
function rf(i){ return [(i/8)|0, i%8]; }
function onb(r,f){ return r>=0&&r<8&&f>=0&&f<8; }

var KNJ=[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
var KGJ=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
var DIAG=[[-1,-1],[-1,1],[1,-1],[1,1]];
var ORTH=[[-1,0],[1,0],[0,-1],[0,1]];

function isAttacked(b, sq, by){
  var p=rf(sq), r=p[0], f=p[1], i, nr, nf;
  for(i=0;i<8;i++){ nr=r+KNJ[i][0]; nf=f+KNJ[i][1]; if(onb(nr,nf)){ var k=b[nr*8+nf]; if(k===(by==='w'?'N':'n')) return true; } }
  for(i=0;i<8;i++){ nr=r+KGJ[i][0]; nf=f+KGJ[i][1]; if(onb(nr,nf)){ var kk=b[nr*8+nf]; if(kk===(by==='w'?'K':'k')) return true; } }
  var dir = by==='w' ? -1 : 1; var pr=r-dir;
  if(onb(pr,f-1) && b[pr*8+(f-1)]===(by==='w'?'P':'p')) return true;
  if(onb(pr,f+1) && b[pr*8+(f+1)]===(by==='w'?'P':'p')) return true;
  for(i=0;i<4;i++){ nr=r+DIAG[i][0]; nf=f+DIAG[i][1];
    while(onb(nr,nf)){ var d=b[nr*8+nf]; if(d){ if(colorOf(d)===by && (d.toLowerCase()==='b'||d.toLowerCase()==='q')) return true; break; } nr+=DIAG[i][0]; nf+=DIAG[i][1]; } }
  for(i=0;i<4;i++){ nr=r+ORTH[i][0]; nf=f+ORTH[i][1];
    while(onb(nr,nf)){ var o=b[nr*8+nf]; if(o){ if(colorOf(o)===by && (o.toLowerCase()==='r'||o.toLowerCase()==='q')) return true; break; } nr+=ORTH[i][0]; nf+=ORTH[i][1]; } }
  return false;
}
function kingSq(b, color){ var t=color==='w'?'K':'k'; for(var i=0;i<64;i++) if(b[i]===t) return i; return -1; }
function inCheck(S, color){ var ks=kingSq(S.b,color); return ks>=0 && isAttacked(S.b, ks, color==='w'?'b':'w'); }

function genPseudo(S){
  var b=S.b, turn=S.turn, moves=[], i;
  for(i=0;i<64;i++){ var p=b[i]; if(!p||colorOf(p)!==turn) continue;
    var pr=rf(i), r=pr[0], f=pr[1], pl=p.toLowerCase(), j, nr, nf, ni, t;
    if(pl==='p'){
      var dir=turn==='w'?-1:1, startR=turn==='w'?6:1, promoR=turn==='w'?0:7;
      nr=r+dir; if(onb(nr,f) && !b[nr*8+f]){ addPawn(moves,i,nr*8+f,nr===promoR,turn);
        if(r===startR && !b[(r+2*dir)*8+f]) moves.push({from:i,to:(r+2*dir)*8+f,dbl:true}); }
      for(j=-1;j<=1;j+=2){ nf=f+j; nr=r+dir; if(!onb(nr,nf)) continue; ni=nr*8+nf; t=b[ni];
        if(t && colorOf(t)!==turn) addPawn(moves,i,ni,nr===promoR,turn);
        else if(ni===S.ep) moves.push({from:i,to:ni,ep:true}); }
    } else if(pl==='n'){ for(j=0;j<8;j++){ nr=r+KNJ[j][0]; nf=f+KNJ[j][1]; if(!onb(nr,nf)) continue; ni=nr*8+nf; t=b[ni]; if(!t||colorOf(t)!==turn) moves.push({from:i,to:ni}); } }
    else if(pl==='k'){ for(j=0;j<8;j++){ nr=r+KGJ[j][0]; nf=f+KGJ[j][1]; if(!onb(nr,nf)) continue; ni=nr*8+nf; t=b[ni]; if(!t||colorOf(t)!==turn) moves.push({from:i,to:ni}); } castleMoves(S,i,moves); }
    else { var dirs = pl==='b'?DIAG : pl==='r'?ORTH : DIAG.concat(ORTH);
      for(j=0;j<dirs.length;j++){ nr=r+dirs[j][0]; nf=f+dirs[j][1];
        while(onb(nr,nf)){ ni=nr*8+nf; t=b[ni]; if(!t){ moves.push({from:i,to:ni}); } else { if(colorOf(t)!==turn) moves.push({from:i,to:ni}); break; } nr+=dirs[j][0]; nf+=dirs[j][1]; } } }
  }
  return moves;
}
function addPawn(moves, from, to, promo, turn){
  if(promo){ ['q','r','b','n'].forEach(function(pp){ moves.push({from:from,to:to,promo: turn==='w'?pp.toUpperCase():pp}); }); }
  else moves.push({from:from,to:to});
}
function castleMoves(S,i,moves){
  var b=S.b;
  if(S.turn==='w' && i===60){
    if(S.cast.K && !b[61] && !b[62] && !isAttacked(b,60,'b') && !isAttacked(b,61,'b') && !isAttacked(b,62,'b')) moves.push({from:60,to:62,castle:'K'});
    if(S.cast.Q && !b[59] && !b[58] && !b[57] && !isAttacked(b,60,'b') && !isAttacked(b,59,'b') && !isAttacked(b,58,'b')) moves.push({from:60,to:58,castle:'Q'});
  } else if(S.turn==='b' && i===4){
    if(S.cast.k && !b[5] && !b[6] && !isAttacked(b,4,'w') && !isAttacked(b,5,'w') && !isAttacked(b,6,'w')) moves.push({from:4,to:6,castle:'k'});
    if(S.cast.q && !b[3] && !b[2] && !b[1] && !isAttacked(b,4,'w') && !isAttacked(b,3,'w') && !isAttacked(b,2,'w')) moves.push({from:4,to:2,castle:'q'});
  }
}
function makeMove(S, m){
  var b=S.b.slice(), cast={K:S.cast.K,Q:S.cast.Q,k:S.cast.k,q:S.cast.q};
  var piece=b[m.from], turn=S.turn, dir=turn==='w'?-1:1;
  var capture=(b[m.to]!=='')||!!m.ep, pl=piece.toLowerCase();
  b[m.from]='';
  if(m.ep){ var capR=((m.to/8)|0)-dir, capF=m.to%8; b[capR*8+capF]=''; }
  b[m.to]= m.promo ? m.promo : piece;
  if(m.castle){ if(m.castle==='K'){ b[61]=b[63]; b[63]=''; } else if(m.castle==='Q'){ b[59]=b[56]; b[56]=''; }
    else if(m.castle==='k'){ b[5]=b[7]; b[7]=''; } else if(m.castle==='q'){ b[3]=b[0]; b[0]=''; } }
  if(pl==='k'){ if(turn==='w'){ cast.K=cast.Q=false; } else { cast.k=cast.q=false; } }
  [m.from,m.to].forEach(function(sq){ if(sq===56) cast.Q=false; else if(sq===63) cast.K=false; else if(sq===0) cast.q=false; else if(sq===7) cast.k=false; });
  var ep=-1; if(m.dbl) ep=(((m.from/8)|0)+dir)*8 + (m.from%8);
  var half=(pl==='p'||capture) ? 0 : (S.half||0)+1;
  var full=(S.full||1) + (turn==='b'?1:0);
  return { b:b, turn: turn==='w'?'b':'w', cast:cast, ep:ep, half:half, full:full };
}
function legalMoves(S){
  var ps=genPseudo(S), out=[], me=S.turn;
  for(var i=0;i<ps.length;i++){ var ns=makeMove(S,ps[i]); if(!inCheck({b:ns.b,turn:me},me)) out.push(ps[i]); }
  return out;
}
function isCheckmate(S){ return inCheck(S,S.turn) && legalMoves(S).length===0; }
function isStalemate(S){ return !inCheck(S,S.turn) && legalMoves(S).length===0; }

// Light-square vs dark-square color of a board index (for the bishop-vs-bishop draw).
function sqColor(i){ var r=(i/8)|0, f=i%8; return (r+f)&1; }
function insufficientMaterial(S){
  var minors=[];   // [colorOfPiece, squareColor]
  for(var i=0;i<64;i++){ var p=S.b[i]; if(!p) continue; var pl=p.toLowerCase();
    if(pl==='p'||pl==='r'||pl==='q') return false;            // a pawn/rook/queen can still mate
    if(pl==='b'||pl==='n') minors.push([colorOf(p), pl, sqColor(i)]); }
  if(minors.length===0) return true;                          // K vs K
  if(minors.length===1) return true;                          // K + single minor vs K
  if(minors.length===2 && minors[0][1]==='b' && minors[1][1]==='b' && minors[0][2]===minors[1][2]) return true; // KB vs KB, same color
  return false;
}
// Repetition key: position identity ignoring the move clocks (board + turn + rights + ep).
// Empty squares are '' in S.b, so they MUST be given a placeholder here — a bare
// join('') would drop every gap and collapse different positions onto one key (a
// rook sliding along an empty rank would read identical), firing a false threefold.
function posKey(S){
  var board=''; for(var i=0;i<64;i++){ board += S.b[i] || '.'; }
  return board+'|'+S.turn+'|'+(S.cast.K?'K':'')+(S.cast.Q?'Q':'')+(S.cast.k?'k':'')+(S.cast.q?'q':'')+'|'+S.ep;
}
// Outcome of the position. repCount = how many times this exact position has occurred (for threefold).
function gameResult(S, repCount){
  if(legalMoves(S).length===0) return inCheck(S,S.turn) ? 'checkmate' : 'stalemate';
  if(insufficientMaterial(S)) return 'material';
  if((S.half||0) >= 100) return 'fifty';
  if(repCount && repCount >= 3) return 'threefold';
  return null;
}

function perft(S, d){ if(d===0) return 1; var mv=legalMoves(S), n=0; for(var i=0;i<mv.length;i++) n+=perft(makeMove(S,mv[i]), d-1); return n; }

// SAN with full disambiguation (file / rank / both) + check & mate suffixes.
function toSAN(S, m){
  var b=S.b, piece=b[m.from], pl=piece.toLowerCase();
  if(m.castle==='K'||m.castle==='k') return checkSuffix(S,m,'O-O');
  if(m.castle==='Q'||m.castle==='q') return checkSuffix(S,m,'O-O-O');
  var cap=(!!b[m.to])||!!m.ep, dest=nameFromSq(m.to), s='', fromName=nameFromSq(m.from);
  if(pl==='p'){ if(cap) s=fromName[0]+'x'+dest; else s=dest; if(m.promo) s+='='+m.promo.toUpperCase(); }
  else {
    s=piece.toUpperCase();
    var others=legalMoves(S).filter(function(x){ return x.to===m.to && x.from!==m.from && b[x.from] && b[x.from].toUpperCase()===piece.toUpperCase(); });
    if(others.length){
      var sameFile=others.some(function(x){ return (x.from%8)===(m.from%8); });
      var sameRank=others.some(function(x){ return ((x.from/8)|0)===((m.from/8)|0); });
      if(!sameFile) s+=fromName[0]; else if(!sameRank) s+=fromName[1]; else s+=fromName;
    }
    if(cap) s+='x'; s+=dest;
  }
  return checkSuffix(S,m,s);
}
function checkSuffix(S,m,s){ var ns=makeMove(S,m); if(isCheckmate(ns)) return s+'#'; if(inCheck(ns,ns.turn)) return s+'+'; return s; }

// Find a legal move matching from/to (+ optional promotion letter, case-insensitive).
// If from/to is a promotion and no promo is given, defaults to the queen.
function findMove(S, from, to, promo){
  var lm=legalMoves(S), fallback=null;
  for(var i=0;i<lm.length;i++){ var x=lm[i];
    if(x.from!==from || x.to!==to) continue;
    if(promo){ if(x.promo && x.promo.toLowerCase()===String(promo).toLowerCase()) return x; }
    else { if(!x.promo) return x; if(x.promo && x.promo.toUpperCase()==='Q') fallback=x; }
  }
  return fallback;
}

return {
  START_FEN: START_FEN,
  parseFEN: parseFEN, toFEN: toFEN,
  sqFromName: sqFromName, nameFromSq: nameFromSq,
  colorOf: colorOf, kingSq: kingSq, isAttacked: isAttacked,
  legalMoves: legalMoves, makeMove: makeMove,
  inCheck: inCheck, isCheckmate: isCheckmate, isStalemate: isStalemate,
  insufficientMaterial: insufficientMaterial, gameResult: gameResult, posKey: posKey,
  toSAN: toSAN, findMove: findMove, perft: perft
};
}));
