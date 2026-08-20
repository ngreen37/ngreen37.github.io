# OBS — what's left

*Rewritten 2026-08-19 once the wizard was finished. Everything already done has been cut; what
follows is only what remains.*

## ✅ Already done — no action needed

- OBS installed, Twitch account connected (`chesswild_official`)
- Auto-Configuration Wizard run and applied
- Encoder set to **Hardware (QSV)** — the right call on this machine
- Enhanced Broadcasting / Multitrack left **off** — also right

---

## PART A — Two settings the wizard didn't ask about

### A1 · Record a local copy every time ← **do this one**

**Settings → General →** tick **☑ Automatically record when streaming**

Every stream now also writes a file to your PC. Twitch's copy dies in 7 days and can be muted;
this one can't. **That file is the archive. Twitch and YouTube are just distribution.**

**Settings → Output → Recording:**
- **Recording Path** → a folder you'll remember
- **Recording Format** → `mkv` (survives a crash; `mp4` can corrupt if OBS closes badly).
  Convert later with **File → Remux Recordings** — takes seconds, re-encodes nothing.

⚠ ~2–3 GB per hour. C: has ~124 GB free — roughly **40–60 hours** before it's full.

### A2 · Resolution, depending on what you're streaming

The wizard chose **1280x720 @ 60fps**. That's right for a game and wrong for your website.

| Streaming… | Output (Scaled) Resolution | FPS | Why |
|---|---|---|---|
| **Cult of the Lamb / any game** | **1280x720** *(leave it)* | 60 | Motion matters more than text, and 6000 kbps at 720p is generous — it'll look clean. |
| **chesswild.com / a chess board** | **1920x1080** | **30** | Static and full of small text. Scaling down makes it mushy; a still picture doesn't need 60fps. |

Both live in **Settings → Video**. Change them between streams; it takes ten seconds.

---

## PART B — Streaming the Switch

### ⚠⚠ Why the second monitor doesn't help — measured on your PC

Windows currently sees **two displays**, both 1920x1080:

```
\\.\DISPLAY1   1920 x 1080   primary
\\.\DISPLAY2   1920 x 1080
```

**So your second monitor IS connected to your PC, and Windows is drawing a desktop on it right
now.** Your Switch is plugged into a *different input on that same monitor*. When you press the
monitor's input button, **the monitor** decides which one to show — the PC keeps drawing on its
own input the entire time and never sees the Switch's.

**You can watch this happen:** add a Display Capture of monitor 2 in OBS, then switch the
monitor over to the Switch. **OBS will still show your empty Windows desktop.** That isn't a bug
or a wrong setting — the two signals never meet inside the monitor. A monitor takes pictures
*in*; it doesn't send them anywhere.

### What actually connects them

```
  Switch dock  --HDMI-->  capture card  --USB-->  PC  -->  OBS
                               |
                               \--HDMI passthrough--> your monitor   (get this)
```

**Buy one with HDMI passthrough.** Without it, the Switch's only picture goes to the PC and you
play off OBS's preview — 100–300ms behind your thumbs. Fine for menus; **Cult of the Lamb's
combat is dodge-timing and it would feel broken.** Passthrough sends a zero-lag copy to your
monitor: you play on that, the PC quietly gets its own feed.

| | Roughly | |
|---|---|---|
| **AVerMedia StreamLine MINI+ (GC311G2)** | **~$50** | **The pick.** 1080p60 in, 4K60 passthrough, plug-and-play |
| Generic USB 3.0 stick (MS2130-type) | $20–35 | ⚠ most have **no passthrough** — check the listing |
| Elgato HD60 S refurbished | ~$75–90 | Elgato's own refurb program, full warranty |
| Elgato HD60 X | ~$145 | the no-thinking default |

⚠ Prices come from review round-ups, not retailer pages — check before ordering. Get **USB 3.0**
(blue connector); USB 2.0 sticks drop to 1080p30.

⭐ **HDCP is not a problem.** The Switch leaves copy protection off for games — it only switches
on for Netflix-type apps. Switch 2 behaves the same and the major cards advertise support.

⭐ **On your PC a capture card is the EASY path, not the expensive one.** You have an i5-8400T
with Intel UHD 630 — integrated graphics. With a card your PC never renders the game; it just
receives a finished picture and encodes it, which is far lighter than running a game *and*
encoding at once. *(I earlier suggested buying the game again on Steam as the cheap route. On
this hardware that's the harder one — ignore it.)*

### Steps once the card arrives

⚠ **YOU NEED A SECOND HDMI CABLE.** Right now you have one: Switch → monitor. The chain below
uses two. Your existing cable covers leg 1; check whether the card ships with one for leg 2, and
add a cheap cable (~$8) if not.

1. **Switch dock HDMI OUT → capture card HDMI IN**
2. **Capture card HDMI OUT → your second monitor** *(the passthrough — this is where you play)*
3. **Capture card USB → your PC**, ideally a blue USB 3.0 port
4. Turn the Switch on, set the monitor to that input. You should see the game, lag-free.
5. In OBS, **Sources** panel (bottom-LEFT) → **`+`** → **Video Capture Device** → OK
6. **Device** → pick the capture card → **OK**
7. The game appears in OBS. Drag the corners to fill the canvas.

Game audio arrives over the same USB cable — no separate audio source needed for it.

---

## PART C — Your sources

**Where the button is:** the **Sources** panel, **bottom-LEFT**, under "Scenes." The `+` is in
its bottom-left corner.

**What a source is:** OBS builds your picture like a collage. Each thing in it — a window, a
webpage, a mic, a capture card — is one source. Top of the list = front of the picture.

**The overlay** — works right now, no hardware:

> `+` → **Browser** → OK →
> **URL:** `https://chesswild.com/assets/overlay/`
> **Width:** `480`  **Height:** `140` → OK

Your wordmark plus **"The first 1,000. You would be #4"**, transparent background. Drag it into
a corner. It re-counts every 45 seconds, so it climbs live if somebody signs up mid-stream.

**Your website** — for a chess stream:

> `+` → **Window Capture** → OK → **Window** → your browser
> *(open it to chesswild.com first or it won't be in the list)*

**Your mic:** check the **Audio Mixer** panel first — it already shows **Mic/Aux**. If the green
bar moves when you talk, you're set and need no source at all.

---

## PART C2 — The Stream Information box (title, category, tags, labels)

This is the panel OBS opens before you go live. Everything in it is changeable mid-stream from
Twitch’s own Stream Manager, so none of it is a commitment.

### Title
The headline of the stream. It shows above the video on `twitch.tv/chesswild_official`, in every
browse and search listing, and beside your thumbnail anywhere somebody might find you. The **Go
Live Notification** underneath is separate — that is the push your followers get.
⭐ Put yourself in it, not only the product. People follow a person ([[the-edge-is-him]]).

### Category — the important one
**The single biggest discovery field on Twitch.** People browse BY CATEGORY, so it is how anyone
who does not already know you finds you at all.
- Playing Cult of the Lamb → **Cult of the Lamb**
- The site, or chess → **Chess**
- Just talking → **Just Chatting**

It has to match what is actually on screen (a Twitch rule). Changing it mid-stream when you
switch activities is normal and expected.

### Tags — yes, use them
Free, and pure discovery. Up to 10. Language is automatic, so no tag needed for it.
Starting set: `ChessWild` · `Chess` · `IndieGames` · `CultOfTheLamb` · `SoloDev` · `FirstStream`

### The three at the bottom

| Field | What to do | Why |
|---|---|---|
| **Content Classification** | **leave empty** for Cult of the Lamb | Twitch auto-applies labels for ESRB **Mature** games. Cult of the Lamb is **T for Teen** (Blood, Crude Humor, Fantasy Violence), so nothing is required. Add **Significant Profanity or Vulgarity** if you swear freely — that label is about YOU, not the game. ⭐ Getting it wrong is gentle: a warning, and Twitch applies the right label itself. It is not a suspension. |
| **Rerun** | **leave unchecked** | Only for broadcasting a previously-recorded video instead of being live. |
| **Branded Content** | **leave unchecked** | Only for a paid commercial relationship with a THIRD PARTY — sponsorship, paid placement, endorsement. ⚠ **Promoting your own site is NOT branded content.** Talking about ChessWild on your own channel is just talking about your work. |

Then **Done**.

---

## PART D — After a stream

1. Your local recording is already saved. **That's the master.**
2. Twitch's copy lasts 7 days. No need to download it — yours is better.
3. To put it on YouTube: upload the local file. That's the whole process.

---

## Still to buy

| | Roughly | Why |
|---|---|---|
| **External hard drive, 2 TB** | ~$60 | Everything you own is on one disk with no copy. The only urgent item here. |
| **Capture card with passthrough** | ~$50 | The only thing between you and streaming the Switch. |
| **HDMI cable** | ~$8 | Only if the card does not include one — the passthrough leg needs a second cable. |

## Later

- **Music** — not Spotify or the radio. It mutes your VOD in six-minute blocks and takes your
  commentary with it. Free and cleared for Twitch *and* YouTube: **StreamBeats**, Outertone, NCS.
- **Recording Quality** currently reads *"Same as stream."* A higher-quality separate recording
  is possible but it's a second encode, and this PC has enough to do. Leave it — a permanent,
  unmuted copy at stream quality already beats anything Twitch keeps.
