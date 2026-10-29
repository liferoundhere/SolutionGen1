#!/usr/bin/env python3
"""Render narration clips with edge-tts. Usage: gen_audio.py narr.json out_dir"""
import asyncio, json, os, sys
import edge_tts

SRC, OUT = sys.argv[1], sys.argv[2]
data = json.load(open(SRC))
SEM = asyncio.Semaphore(6)


async def clip(voice, text, path):
    async with SEM:
        for attempt in range(4):
            try:
                com = edge_tts.Communicate(text, voice, boundary="WordBoundary")
                audio, words = bytearray(), []
                async for ch in com.stream():
                    if ch["type"] == "audio":
                        audio.extend(ch["data"])
                    elif ch["type"] == "WordBoundary":
                        words.append([round(ch["offset"] / 1e7, 3),
                                      round(ch["duration"] / 1e7, 3), ch["text"]])
                open(path, "wb").write(audio)
                end = words[-1][0] + words[-1][1] if words else 0
                return {"words": words, "dur": round(end + 0.35, 2)}
            except Exception as e:  # network hiccups
                print("retry", path, e)
                await asyncio.sleep(2 ** attempt)
        raise RuntimeError(path)


async def main():
    manifest = {}
    for v in data["voices"]:
        d = os.path.join(OUT, v["key"])
        os.makedirs(d, exist_ok=True)
        jobs, keys = [], []
        for si, sid in enumerate(data["ids"]):
            for st, text in enumerate(data["narr"][sid]):
                keys.append(f"{si}-{st}")
                jobs.append(clip(v["voice"], text, os.path.join(d, f"{si}-{st}.mp3")))
        res = await asyncio.gather(*jobs)
        manifest[v["key"]] = dict(zip(keys, res))
        print(v["key"], "done", round(sum(r["dur"] for r in res) / 60, 1), "min")
    json.dump(manifest, open(os.path.join(OUT, "manifest.json"), "w"), separators=(",", ":"))


asyncio.run(main())
