---
layout: default
title: Contact
permalink: /contact/
body_class: theme-bw
---

{% comment %} MERGED 2026-07-15 (Nate: "The About and Contact are redundant… combine the two.
     Then remove About."). /about/ is gone; its redirects live in _data/brands.yml and the
     command palette.

     ⛑⛑ STRIPPED TO TWO ELEMENTS 2026-09-07, his call: *"make it way more formal… Basically
     all that's left is the Get in Touch and the brief Zoho line."* Out went the Chesswild840
     address and both Copy buttons, the "Opening the line…" type-out, the Princess photo and
     caption, "One person behind the curtain", and the chess-lessons line.
     ⚠ THE PRINCESS PHOTO IS COMING BACK SOMEWHERE ELSE — *"That's a PJCC thing; we'll add it
     later."* assets/images/Princess-3.jpg is still on disk and is not to be deleted.
     [[removed-not-forgotten]]
     ⚠ THE SIDEBARS ARE HIS: *"We'll use the sidebars to add animations I make to that page."*
     The column is deliberately narrow and centered so there is room either side; don't fill
     it with anything of mine. {% endcomment %}

<div class="hello-page">

  <section class="hello-hero">
    <h1 class="hello-headline" data-jp="お問い合わせ">Get in touch.</h1>
    <div class="hello-rule" aria-hidden="true"></div>
    <p class="hello-line">Correspondence is by email. The address is a Zoho Mail account — the
    name is still being decided, and it will be published here as soon as it is settled.</p>
  </section>

</div>

<style>
/* ── Contact — McPuppy monochrome, formal register ──────────────────────────────────
   ⚠ THE TYPE-OUT AND THE GLOW CAME OUT WITH THE COPY, not as a separate tidy-up: a blinking
   terminal cursor and a pulsing address are the opposite of "way more formal", and both were
   the only users of their keyframes. The rise-in stays — it is the site's ordinary entrance. */
.hello-page { max-width: 720px; margin: 0 auto; padding: 8px 0 56px;
  --ink:#eeeef2; --mut:rgba(238,238,242,0.72); }

.hello-hero { position:relative; text-align:center; padding:76px 30px 72px; border-radius:22px;
  overflow:hidden;
  background:
    radial-gradient(120% 90% at 50% -10%, rgba(255,255,255,0.10), transparent 60%),
    linear-gradient(160deg, #1a1a1e 0%, #0b0b0d 78%);
  border:1px solid rgba(255,255,255,0.14);
  box-shadow:0 24px 60px -28px rgba(0,0,0,0.75);
  animation: hello-rise .9s cubic-bezier(.22,1,.36,1) both; }
/* ⚠ A STATIC HAIRLINE, NOT THE OLD SWEEP. The silver band used to slide across the top of the
   hero on a 7s loop; a moving light on a contact page is a flourish, and this page is not
   flourishing any more. */
.hello-hero::before { content:""; position:absolute; inset:0 0 auto 0; height:3px;
  background:linear-gradient(90deg, rgba(232,232,238,0), #b9b9c2 50%, rgba(232,232,238,0)); }

.hello-headline { font-family:'Poppins',sans-serif; font-weight:700; letter-spacing:-0.5px;
  line-height:1.08; font-size:clamp(34px,4.6vw,52px); margin:0;
  background:linear-gradient(100deg, #fff 0%, #d0d0d6 60%, #8a8a92 100%);
  -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; }

.hello-rule { width:64px; height:1px; margin:26px auto; background:rgba(255,255,255,0.32); }

.hello-line { margin:0 auto; max-width:46ch; font-size:clamp(15px,1.9vw,17px); line-height:1.75;
  color:var(--mut); }

@keyframes hello-rise { from{opacity:0; transform:translateY(26px) scale(.98);} to{opacity:1; transform:none;} }

@media (max-width:700px){ .hello-hero { padding:56px 20px 52px; } }
@media (prefers-reduced-motion: reduce){ .hello-hero { animation:none; } }
</style>
