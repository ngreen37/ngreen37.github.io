# Stockfish (vendored)

A local, offline copy of the [Stockfish](https://stockfishchess.org/) chess engine,
compiled to WebAssembly, used by **The Gauntlet** to play (and to referee-check its own moves).

- **Build:** `stockfish.js` **10.0.2** (nmrugg's Emscripten port — <https://github.com/nmrugg/stockfish.js>)
- **Files:** `stockfish.js` (62 KB glue) + `stockfish.wasm` (367 KB engine)
- **Why this build:** it is **single-threaded** — the pthread calls are stubbed
  (`_pthread_create` returns EAGAIN), so it needs **no `SharedArrayBuffer`** and therefore
  **no COOP/COEP headers**. That matters because GitHub Pages can't set custom headers.
  It loads and runs on a plain static host with zero configuration.
- **How it's loaded:** as a Web Worker, `new Worker('/assets/vendor/stockfish/stockfish.js#/assets/vendor/stockfish/stockfish.wasm')`.
  The `#…` hash tells the engine where its `.wasm` lives. See `assets/js/pjcc-gauntlet-engine.js`.
- **Strength:** ~3400 Elo at full power — far beyond any rung. The bridge throttles it down
  per opponent via UCI `Skill Level` (0–20) + a per-rung move-time budget, and keeps a
  random-blunder chance on the low rungs so beginners can still win.

## License

Stockfish is **GPLv3** (see `COPYING.txt`). It runs here as a **separate program** — a Web
Worker that the site talks to over the UCI text protocol — so the rest of the site's code is
not a derivative work. Source for this exact build: the npm package `stockfish@10.0.2` and the
upstream repo linked above. Do not minify or alter the `.js`/`.wasm` here without preserving
the GPL notice.
