# OBS — what's left

*Rewritten 2026-09-11. The gear lands around 09-19; this is only what's left, in the order you'll
do it.*

## ✅ Already done — no action needed

- OBS installed, Twitch account connected (`chesswild_official`), wizard run and applied
- Encoder set to **Hardware (QSV)**, Multitrack **off** — both right on this machine
- Recording format **Hybrid MP4** — survives a crash, plays everywhere, no remux
- **Automatically record when streaming: ON** (2026-09-11). Every stream writes a file, and **that
  file is the archive. Twitch and YouTube are just distribution.**

---

## PART A — Do now, before anything arrives

You already own the mic, the MultiMix and its USB cable, so your voice can be working a week early.

### A1 · Hook up the mic

1. Mic → XLR cable → a **mic input** on the MultiMix. Plug in its power and switch it on.
2. MultiMix **USB** (the square port) → your PC.
3. ⚠ Windows may move ALL your sound to the mixer the moment it's plugged in. If the PC goes
   quiet: **Settings → System → Sound → Output** → **Speaker/Headphone (Realtek(R) Audio)**.
4. OBS → **Settings → Audio → Mic/Auxiliary Audio** → the device named **USB Audio CODEC**.
5. Talk at stream volume and raise that channel's **Gain** knob until the **Mic/Aux** bar in OBS's
   Audio Mixer peaks in the **yellow** — never red.
   - Nothing at all? Flip the MultiMix's **phantom power (+48V)** switch. A condenser mic needs it;
     an ordinary dynamic mic ignores it.

### A2 · Test it

OBS → **Start Recording** → talk for 30 seconds → **Stop Recording** → **File → Show Recordings** →
play the file.
- Clear, in both ears? Done.
- Only in one ear? **Edit → Advanced Audio Properties** → tick **Mono** on the mic.

### A3 · Count your free USB ports

Arrival day needs **two more**: the drive and the capture card. Your HP's rectangular USB ports are
USB 3, which both want. One short? The card also runs from one of the PC's **USB-C** ports on a
USB-C cable — but only a cable rated for USB 3 data; a phone-charging cable may not be.

---

## PART B — Arrival day, in this order

### B1 · The drive — first, about ten minutes

1. Plug the Seagate into a USB port.
2. **File Explorer → This PC** → right-click the drive → **Properties** → **File system**.
   If it says **exFAT**: right-click → **Format** → **NTFS** → **Quick Format** → **Start**. It's
   empty, and NTFS survives a knocked cable far better.
3. Make a folder on it called **Recordings**.
4. OBS → **Settings → Output → Recording Path** → that folder. At your settings it holds about
   700 hours.
5. Start menu → search **File History** → **Select drive** → the Seagate → **Turn on**. From now on
   it copies your Desktop and Documents every hour — the website and the Godot project.

Leave the drive plugged in. If it's unplugged when you go live, nothing records.

### B2 · The arm and the headphones

- Clamp the **PSA1+** to the desk edge (up to 70 mm thick). Its thread adaptor fits your mic's clip.
- Put the mic about **a fist from your mouth**, aimed from slightly to one side so your breath goes
  past it.
- **Headphones → your PC's headphone jack, not the mixer's.** Sending PC sound through the mixer
  can loop the game back into your mic channel.

### B3 · The capture card

```
  Switch dock  --HDMI-->  capture card  --USB-->  PC  -->  OBS
                               |
                               +--HDMI (your spare)-->  Odyssey monitor   <- you play HERE
```

1. Switch dock **HDMI OUT** → card **HDMI IN** (the cable the Switch uses now)
2. Card **HDMI OUT** → the Odyssey (your spare HDMI cable)
3. Card **USB** → the PC
4. Switch on, monitor on that input: the game appears, lag-free. **Play on the monitor, never on
   OBS's preview** — the preview runs 100–300 ms behind your thumbs.
5. OBS → **Scenes** panel → **`+`** → name it **Switch**. Then **Sources** → **`+`** → **Video
   Capture Device** → **Device** → the card → **OK**. Drag its corners to fill the canvas.
6. **Hear the game.** With passthrough, the Switch's own sound goes to the monitor, not to you.
   **Edit → Advanced Audio Properties** → the capture card → **Monitor and Output**. Then
   **Settings → Audio → Advanced → Monitoring Device** → **Speaker/Headphone (Realtek(R) Audio)**.
   - No game bar moving in OBS's Audio Mixer? Right-click the card → **Properties** → tick **Use
     custom audio device** → pick the card.
7. **Test:** record a minute of play and watch it back. You should hear the game AND you, with you
   louder. Game drowning you out? Pull the card's fader down in the **Audio Mixer**.

⭐ A black picture is not HDCP — the Switch leaves copy protection off for games. Check the cables and
the **Device** dropdown.

---

## PART C — Every stream

**Before you go live:** the drive is plugged in, and **Settings → Video** matches what you're
streaming:

| Streaming… | Output (Scaled) Resolution | FPS | Why |
|---|---|---|---|
| **Cult of the Lamb / any game** | **1280x720** *(leave it)* | 60 | Motion matters more than text, and 6000 kbps at 720p is generous — it'll look clean. |
| **chesswild.com / a chess board** | **1920x1080** | **30** | Static and full of small text. Scaling down makes it mushy; a still picture doesn't need 60fps. |

### The Stream Information box (title, category, tags, labels)

This is the panel OBS opens before you go live. Everything in it is changeable mid-stream from
Twitch’s own Stream Manager, so none of it is a commitment.

#### Title
The headline of the stream. It shows above the video on `twitch.tv/chesswild_official`, in every
browse and search listing, and beside your thumbnail anywhere somebody might find you. The **Go
Live Notification** underneath is separate — that is the push your followers get.
⭐ Put yourself in it, not only the product. People follow a person ([[the-edge-is-him]]).

#### Category — the important one
**The single biggest discovery field on Twitch.** People browse BY CATEGORY, so it is how anyone
who does not already know you finds you at all.
- Playing Cult of the Lamb → **Cult of the Lamb**
- The site, or chess → **Chess**
- Just talking → **Just Chatting**

It has to match what is actually on screen (a Twitch rule). Changing it mid-stream when you
switch activities is normal and expected.

#### Tags — yes, use them
Free, and pure discovery. Up to 10. Language is automatic, so no tag needed for it.
Starting set: `ChessWild` · `Chess` · `IndieGames` · `CultOfTheLamb` · `SoloDev` · `FirstStream`

#### The three at the bottom

| Field | What to do | Why |
|---|---|---|
| **Content Classification** | **leave empty** for Cult of the Lamb | Twitch auto-applies labels for ESRB **Mature** games. Cult of the Lamb is **T for Teen** (Blood, Crude Humor, Fantasy Violence), so nothing is required. Add **Significant Profanity or Vulgarity** if you swear freely — that label is about YOU, not the game. ⭐ Getting it wrong is gentle: a warning, and Twitch applies the right label itself. It is not a suspension. |
| **Rerun** | **leave unchecked** | Only for broadcasting a previously-recorded video instead of being live. |
| **Branded Content** | **leave unchecked** | Only for a paid commercial relationship with a THIRD PARTY — sponsorship, paid placement, endorsement. ⚠ **Promoting your own site is NOT branded content.** Talking about ChessWild on your own channel is just talking about your work. |

Then **Done**.

### After a stream

1. The recording is on the drive. **That's the master.**
2. Twitch's copy lasts 7 days — download it only if your own recording failed.
3. To put it on YouTube: upload the file from the drive. That's the whole process.

---

## Reference — sources you can add any time

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

## Later

- **Music** — not Spotify or the radio. It mutes your VOD in six-minute blocks and takes your
  commentary with it. Free and cleared for Twitch *and* YouTube: **StreamBeats**, Outertone, NCS.
- **Recording Quality** currently reads *"Same as stream."* A higher-quality separate recording
  is possible but it's a second encode, and this PC has enough to do. Leave it — a permanent,
  unmuted copy at stream quality already beats anything Twitch keeps.
