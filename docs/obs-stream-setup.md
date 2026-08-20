# OBS + the ChessWild overlay — setup, start to finish

*Written 2026-08-19, for doing later. Nothing here is urgent. You can stop after Part 1 and
come back; OBS remembers everything.*

**What OBS is:** a free program that builds a picture on your PC and sends it to Twitch.
Twitch never looks at your screens — it just receives whatever picture OBS made.

---

## PART 1 — You are here: the Auto-Configuration Wizard

The box on your screen right now says **Video Settings**. Two dropdowns:

| Setting | What to pick | Why |
|---|---|---|
| **Base (Canvas) Resolution** | leave it — **Use Current (1920x1080)** | This is the size of the workspace OBS composes on. It should match your monitor or captured windows get scaled oddly. |
| **FPS** | leave it — **Either 60 or 30, prefer 60** | Frames per second. The wizard will settle on whatever your PC handles. |

Click **Next**. The next screen runs a **bandwidth test** — it streams to Twitch for a few
seconds and measures your actual upload speed. Let it finish, then click **Apply Settings**.

**That's the wizard done.** Everything below is either a one-time checkbox or a thing you add
once and never touch again.

---

## PART 2 — Two settings the wizard doesn't ask about

### 2a. Record a local copy every time (do this one)

**Settings** (bottom-right, under Start Streaming) **→ General →** scroll to Output/Recording
→ tick **☑ Automatically record when streaming**.

Now every stream also writes a file to your PC. That file is better quality than Twitch's
copy, never expires, and can never be muted. It is the archive; Twitch and YouTube are just
distribution.

**Settings → Output → Recording** → set **Recording Path** to a folder you'll remember, and
**Recording Format** to `mkv` (it survives a crash; `mp4` can corrupt if OBS closes badly.
You can convert mkv→mp4 later from **File → Remux Recordings**, which takes seconds and
re-encodes nothing).

⚠ **Roughly 2–3 GB per hour.** Your C: drive has ~124 GB free, so about 40–60 hours before
it's full. Worth glancing at every month or two.

### 2b. Resolution — and a correction to what I told you earlier

I said *"720p60 around 4,500 kbps reaches more people than 1080p."* **That is standard advice
for fast-moving gameplay, and it is wrong for what you're actually streaming.**

A chess board and a website are *static and full of small text*. Scaling that down to 720p
makes piece labels and site text mushy — and the thing that makes 1080p expensive is
**motion**, which your content barely has. A near-still picture encodes very cheaply.

**So: leave the output at 1920x1080.**

- **Settings → Video → Output (Scaled) Resolution** → keep **1920x1080**
- **Settings → Output → Video Bitrate** → whatever the wizard chose is fine. If you want a
  number: **4500–6000 kbps**.
- **FPS 30 is plenty** for a chess board and halves the work your PC does. Use 60 only if
  you're showing something that moves.

**"Upload headroom"** just means: your internet's *upload* speed has to be comfortably bigger
than the bitrate. 4500 kbps = 4.5 Mbps, so you want ~5.5 Mbps upload or better. **The wizard's
bandwidth test already measured this for you** — that's what it was doing.

---

## PART 3 — Sources (this is the part I explained badly)

### What a "source" is

OBS builds your picture like a **collage**. Each thing in the collage — a window, a webcam, a
webpage, a microphone — is one **source**. You add them one at a time and drag them where you
want. OBS stacks them like sheets of paper: the top of the list is the front of the picture.

Right now your collage is empty. That's why the preview is a black rectangle.

### Where the button is

⚠ **I told you "bottom-right panel" and that was wrong** — that's the Controls panel with the
Start Streaming button.

**The Sources panel is on the LEFT side, directly below "Scenes."** It currently says
*"You don't have any sources. Click the + button below."* The **`+`** is at the bottom-left
corner of that panel.

### Add these three, one at a time

Each one: click **`+`** → pick the type → it asks for a name (any name, or just click OK) →
then a properties box opens → set what's listed below → **OK**.

**1 · Your website**
> `+` → **Window Capture** → OK → in **Window**, pick your browser
> *(open your browser to chesswild.com first, or it won't be in the list)*

**2 · The counter overlay**
> `+` → **Browser** → OK → set:
> - **URL:** `https://chesswild.com/assets/overlay/`
> - **Width:** `480`   **Height:** `140`
> - leave everything else alone → **OK**

It'll appear as a small floating box with your wordmark and **"The first 1,000. You would be
#4"**. Drag it wherever you want; the background is transparent, so only the text shows.

**3 · Your microphone**
> `+` → **Audio Input Capture** → OK → in **Device**, pick your mic
>
> *Check first:* the **Audio Mixer** panel at the bottom-center already shows **Mic/Aux**. If
> the green bar moves when you talk, your mic is already working and **you can skip this
> source entirely.** Only add it if Mic/Aux is silent or is picking the wrong device.

---

## PART 3b — Streaming the Switch (Cult of the Lamb)

⚠⚠ **THIS NEEDS HARDWARE YOU DO NOT HAVE YET. There is no OBS setting that fixes it.**

Your Switch is plugged into your second monitor by HDMI. That monitor is *displaying* it, but
your PC has no idea the Switch exists — a monitor is an output, not an input. OBS can only
capture things the PC itself is drawing. There is no source type, driver or setting that
reaches an HDMI cable going into a different device.

**What actually connects them is a capture card:**

```
  Switch dock  --HDMI-->  capture card  --USB-->  PC  -->  OBS
                               |
                               \--HDMI passthrough--> your monitor  (this part matters)
```

### ⭐ Buy one WITH HDMI passthrough. This is the part people get wrong.

Without passthrough, the Switch’s only picture goes to the PC, so you play by watching **OBS’s
preview** — which lags 100–300ms behind your thumbs. For a menu-driven game that is survivable.
**For Cult of the Lamb it is not** — the combat is dodge-timing, and a third of a second of
delay makes it feel broken. Passthrough sends a zero-lag copy straight to your monitor; you
play on that and the PC quietly gets its own feed.

| Option | Roughly | Notes |
|---|---|---|
| Generic USB 3.0 stick (MS2130-type) | **$20–35** | Fine picture. ⚠ Most have **no passthrough** — check before buying. |
| **AVerMedia StreamLine MINI+ (GC311G2)** | **~$50** | 1080p60 capture, 4K60 passthrough, plug-and-play in OBS. **The sweet spot.** |
| Elgato HD60 S, refurbished | ~$75–90 | Elgato’s own refurb program, full warranty. |
| Elgato HD60 X | ~$145 | The reliable default if money is not the question. |

⚠ Prices are off review round-ups, not retailer pages — check before ordering. Get **USB 3.0**
(blue connector); USB 2.0 sticks drop to 1080p30.

⭐ **HDCP is not a problem.** The Switch leaves copy protection OFF for games (it only switches
on for Netflix-type apps), so gameplay captures normally. Switch 2 behaves the same way and
the major cards advertise support for it.

### Once the card arrives

Plug it in, then in the **Sources** panel (bottom-LEFT):

> `+` → **Video Capture Device** → OK → in **Device**, pick the capture card → **OK**

The game appears in the preview. Resize it to fill the canvas. Game audio comes in over the
same USB cable, so you do not need a second audio source for it — only your mic.

### The zero-hardware alternative, if you want to stream this week

**Cult of the Lamb is also on PC (Steam).** If you own it there — or would rather spend ~$25
on the game than $50 on a card — you need no hardware at all:

> `+` → **Game Capture** → Mode: **Capture specific window** → pick Cult of the Lamb

That works tonight. It is a real choice, not a consolation: buying the game again is cheaper
than the card, and you would still want the card eventually for anything Switch-only.

### Then

Look at the preview window. If you can see your site with the counter on top of it, you're
done. **Start Streaming** is the top button in the Controls panel, bottom-right.

---

## PART 4 — After a stream

1. Your local recording is already saved in the folder from step 2a. **That's the master.**
2. Twitch's copy stays up for 7 days. You don't need to download it — you have a better one.
3. To put a stream on YouTube: upload the local file. That's the whole process.

---

## Later, not now

- **Music** — don't play Spotify or the radio. It gets your VOD muted in six-minute blocks,
  which takes your commentary with it. Free and safe: **StreamBeats**, Outertone, NCS.
- **Streaming your Switch** — needs a **capture card** (~$20–40). A Switch plugged into a
  monitor is invisible to your PC; a monitor is an output, not an input.
- **A second copy of the C: drive.** One external USB drive, ~$60 for 2 TB. It's the only
  thing in this whole document with any urgency, because everything you own is on one disk.
