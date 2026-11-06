"""Erzeugt die App-Sounds in assets/sounds/.

Aufruf:  npm run sounds        (= python3 scripts/cut-sounds.py)
Benötigt macOS (afconvert). Ergebnis: 44,1 kHz, mono, 16 bit WAV –
iOS spielt für Mitteilungen nur WAV/CAF/AIFF, kein MP3.

Quelle: assets/sounds/source/boxing-bell-signals.mp3 (nicht im Repo, siehe README)
        („Boxing Bell Signals“ von freesound_community, Pixabay – Pixabay Content License)
click.wav wird synthetisch erzeugt.
"""
import math
import os
import struct
import subprocess
import sys
import tempfile
import wave

SR = 44100
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "sounds")

SRC_DIR = os.path.join(OUT, "source")
SOURCES = {
    "signals": "boxing-bell-signals.mp3",
}

# Datei -> Quelle, Ausschnitt (s), Lautstärke, Ausblenden (s) und Effekte:
#   pitch:   Tonhöhen-Faktor (<1 = tiefer, Klang wird dabei etwas länger)
#   body:    Anteil einer Oktave tiefer (macht die Glocke größer/"pompöser")
#   reverb:  (Nachhallzeit s, Anteil) – lässt die Glocke ausklingen
#   tail:    Sekunden Stille, die angehängt werden, damit der Nachhall Platz hat
#   highpass: Grenzfrequenz Hz – nimmt Tiefen raus, klingt leichter
CUTS = {
    # Rundenstart UND Rundenende/Training fertig: Doppel-Klingeln, schwer und lange ausklingend
    "bell.wav": dict(src="signals", a=9.2, b=11.6, level=0.97, fade=1.8, body=0.4, reverb=(3.2, 0.5), tail=2.8),
    # Rundenende / Training fertig: dasselbe Doppel-Klingeln, ~4 Halbtöne tiefer und voller
    "bell_end.wav": dict(src="signals", a=9.2, b=11.6, level=0.97, fade=1.8, pitch=0.8, body=0.5, reverb=(3.4, 0.5), tail=2.6),
}


def decode(mp3_path, tmp):
    wav_path = os.path.join(tmp, os.path.basename(mp3_path) + ".wav")
    subprocess.run(["afconvert", "-f", "WAVE", "-d", f"LEI16@{SR}", "-c", "1", mp3_path, wav_path], check=True)
    with wave.open(wav_path) as w:
        n = w.getnframes()
        return [s / 32768 for s in struct.unpack(f"<{n}h", w.readframes(n))]


def resample(x, factor):
    """Tonhöhe um `factor` ändern (0.8 = tiefer und länger), lineare Interpolation."""
    out = []
    n = int(len(x) / factor)
    for i in range(n):
        j = i * factor
        k = int(j)
        f = j - k
        a = x[k] if k < len(x) else 0.0
        b = x[k + 1] if k + 1 < len(x) else 0.0
        out.append(a + (b - a) * f)
    return out


def octave_down(x):
    """Halbe Geschwindigkeit = eine Oktave tiefer (lineare Interpolation)."""
    out = []
    for i in range(len(x) * 2):
        j = i / 2
        k = int(j)
        f = j - k
        a = x[k]
        b = x[k + 1] if k + 1 < len(x) else 0.0
        out.append(a + (b - a) * f)
    return out


def reverb(x, rt60, wet):
    """Einfacher Schroeder-Hall: 4 Kammfilter parallel + 2 Allpässe."""
    combs = [0.0297, 0.0371, 0.0411, 0.0437]
    acc = [0.0] * len(x)
    for d in combs:
        n = int(d * SR)
        g = 10 ** (-3 * d / rt60)
        buf = [0.0] * n
        idx = 0
        lp = 0.0
        for i, s in enumerate(x):
            y = buf[idx]
            lp = y * 0.75 + lp * 0.25  # leichte Dämpfung der Höhen im Hall
            buf[idx] = s + lp * g
            idx = (idx + 1) % n
            acc[i] += y
    for d, g in ((0.005, 0.7), (0.0017, 0.7)):
        n = int(d * SR)
        buf = [0.0] * n
        idx = 0
        for i in range(len(acc)):
            b = buf[idx]
            y = -g * acc[i] + b
            buf[idx] = acc[i] + g * y
            idx = (idx + 1) % n
            acc[i] = y
    return [s * (1 - wet) + r * wet * 0.35 for s, r in zip(x, acc)]


def highpass(x, fc):
    rc = 1 / (2 * math.pi * fc)
    a = rc / (rc + 1 / SR)
    out = [0.0] * len(x)
    prev_x = prev_y = 0.0
    for i, s in enumerate(x):
        prev_y = a * (prev_y + s - prev_x)
        prev_x = s
        out[i] = prev_y
    return out


def render(src, a, b, level, fade, pitch=None, body=0.0, reverb=None, tail=0.0, highpass=None):
    seg = src[int(a * SR) : int(b * SR)]
    if pitch:
        seg = resample(seg, pitch)
    fi = int(0.004 * SR)  # 4 ms Einblenden gegen Knackser
    seg = [s * min(1.0, i / fi) for i, s in enumerate(seg)]
    seg = seg + [0.0] * int(tail * SR)
    if body:
        low = octave_down(seg)[: len(seg)]
        seg = [s + l * body for s, l in zip(seg, low)]
    if highpass:
        seg = globals()["highpass"](seg, highpass)
    if reverb:
        seg = globals()["reverb"](seg, *reverb)
    fo = int(fade * SR)
    for i in range(min(fo, len(seg))):
        seg[-1 - i] *= 0.5 - 0.5 * math.cos(math.pi * i / fo)
    peak = max(abs(s) for s in seg) or 1.0
    return [s / peak * level for s in seg]


def clack(freqs=(2350, 3700, 5200), decay=0.022, gap=0.11, hits=2, level=0.8):
    """Synthetisches Holzblock-Klacken: kurzer Rausch-Anschlag + gedämpfte hohe Teiltöne."""
    import random
    random.seed(7)
    one = []
    for i in range(int(0.09 * SR)):
        t = i / SR
        env = math.exp(-t / decay)
        tone = sum(math.sin(2 * math.pi * f * t) / (k + 1) for k, f in enumerate(freqs))
        noise = (random.random() * 2 - 1) * math.exp(-t / 0.003)
        one.append(tone * env * 0.8 + noise * 0.5)
    out = []
    for h in range(hits):
        out += one
        if h < hits - 1:
            out += [0.0] * int((gap - 0.09) * SR)
    out += [0.0] * int(0.05 * SR)
    peak = max(abs(s) for s in out)
    return [s / peak * level for s in out]


def write(name, seg):
    with wave.open(os.path.join(OUT, name), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(b"".join(struct.pack("<h", int(max(-1, min(1, s)) * 32767)) for s in seg))
    print(f"{name}: {len(seg) / SR:.2f}s")


if __name__ == "__main__":
    src_dir = sys.argv[1] if len(sys.argv) > 1 else SRC_DIR
    os.makedirs(OUT, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        decoded = {k: decode(os.path.join(src_dir, f), tmp) for k, f in SOURCES.items()}
        for name, opts in CUTS.items():
            opts = dict(opts)
            write(name, render(decoded[opts.pop("src")], **opts))
    # 10 s vor Rundenende/-start: helles Klack-Klack als Info-Signal
    write("click.wav", clack())
