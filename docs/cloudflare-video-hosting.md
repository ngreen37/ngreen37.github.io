# Cloudflare R2 — hosting your own video, and what Cloudflare even is

*Written 2026-08-19, for reviewing later. **Recommendation up front: don't do this yet.** The
reasoning is at the bottom. This exists so it's written down when you want it.*

---

## What Cloudflare is

Cloudflare is an **infrastructure company**. They rent out pieces of the internet's plumbing:
storage, delivery, domain names, small programs that run on their servers.

**You already use them.** The Japanese translation on your site runs on a Cloudflare Worker
(`pjcc-translate`), and action item 18 is a second one for the Twitch live indicator.

### "Do people go to Cloudflare.com to view it?"

**No. Never.** Nobody visits cloudflare.com to see your things, the same way nobody visits
`godaddy.com` to read your website or `ups.com` to open a package.

Cloudflare is behind the scenes. What a visitor sees is a normal address on **your** domain:

```
https://video.chesswild.com/2026-08-24-first-stream.mp4
```

That address is yours. The file happens to be sitting on Cloudflare's disks, and the visitor
has no idea and no reason to care. Cloudflare's name appears nowhere.

This is the difference between Cloudflare and YouTube. On YouTube, people go to *YouTube* —
they see YouTube's player, YouTube's logo, YouTube's recommendations for other creators
underneath your video. With Cloudflare they stay on **chesswild.com** the entire time.

---

## What R2 is

**R2 is Cloudflare's hard drive that lives on the internet.** You upload a file, it gives you
a URL, people open the URL.

The name is a joke — Amazon's equivalent is called **S3**, so Cloudflare named theirs **R2**
(one letter back, one number back). It means nothing.

### Why R2 and not the others

Almost all cloud storage bills you **twice**: once to *keep* the file, and again for every
gigabyte anyone *downloads*. That second charge is what makes video expensive, because video
files are large and get downloaded repeatedly.

**R2 doesn't charge for downloads at all.** From Cloudflare's own pricing page:

| | Cost |
|---|---|
| Storage | **$0.015 per GB per month** |
| Downloads (egress) | **free** |
| Free tier | **first 10 GB free**, every month |

**Real numbers for you:** 100 GB of stream archive — call it 30–50 hours — costs about
**$1.35/month**, and it costs the same whether five people watch or fifty thousand.

---

## Why NOT your own website

Your site is on GitHub Pages, which has hard limits:

- **A published site may be no larger than 1 GB.** Your whole site today is **13 MB** — but a
  single 3-hour stream is 3–6 GB. One video doesn't fit, let alone a weekly one.
- **100 GB/month of bandwidth**, for the whole site. A 2 GB video watched **50 times** eats
  the entire month — and takes the front door down with it, not just the video.
- GitHub says plainly it isn't for video hosting. You'd get an email asking you to move.

That's why "put it on my own website" means R2 rather than the repo.

---

## The steps, when you want them

1. **dash.cloudflare.com** → sign in with the account you already have
2. Left sidebar → **R2** → **Create bucket**. A "bucket" is just a folder. Name it something
   like `chesswild-video`.
3. Bucket → **Settings** → **Public access** → connect a subdomain, e.g.
   `video.chesswild.com`. Cloudflare walks you through the DNS.
4. **Upload** → drag your `.mp4` in. Big files take a while; leave the tab open.
5. The file now has a permanent address: `https://video.chesswild.com/your-file.mp4`
6. Put it on a page with a normal HTML video player:

```html
<video controls preload="metadata" width="100%"
       poster="/assets/images/stream-thumb.jpg"
       src="https://video.chesswild.com/2026-08-24-first-stream.mp4"></video>
```

That's it. No plugin, no library, no service worker. The browser does the rest.

### The one real limitation

R2 serves **one file at one quality**. It does not do what YouTube does — automatically make
five versions and hand each viewer the one their connection can handle. So somebody on a weak
phone connection will buffer.

If that ever matters, **Cloudflare Stream** is the upgrade (~$5 per 1,000 minutes stored, $1
per 1,000 minutes delivered). It's the same idea with the multi-quality part added. It costs
noticeably more, and it is not worth paying for until people are actually watching.

---

## The recommendation: not yet

**Don't set any of this up now.** In order of what actually matters:

1. **A second copy of your C: drive.** One external USB drive, ~$60 for 2 TB. Everything you
   own — the site, the story bible, the Godot project, and soon every recording — is on one
   disk with no copy. *This is the only urgent item on this page.*
2. **Record locally** (OBS → Settings → General → Automatically record when streaming). The
   file on your disk is the master. That's what makes everything else optional.
3. **YouTube, when there's something worth showing.** And the thing worth understanding:
   **using YouTube does not cost you ownership.** You own the master. YouTube gets a copy
   because that's where people watch. If they ever pull it, you re-upload it elsewhere that
   afternoon and lose nothing.
4. **R2, only if YouTube becomes a problem** — or the day you want a stream living on
   chesswild.com with no other company's logo near it. It's a 20-minute job and it will be
   exactly as easy in six months.

Full-length streams get very few views anywhere; the short clips are what travel. So the
3-hour file is worth **keeping**, and the 90-second moments are worth **posting** — which is
another argument for the drive first and the hosting much later.
