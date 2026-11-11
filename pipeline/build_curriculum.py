#!/usr/bin/env python3
"""
Maths Map - VC2 Mathematics curriculum data pipeline.

Reads the official VCAA CSV export (VC2_AS-CD-Elab_11-11-2026.csv, one row per
elaboration) and generates data/curriculum.json used by the app.

Source licence: © VCAA, licensed CC-BY-NC 3.0 Australia (non-commercial use only).
"""
import csv
import json
import re
import sys
from datetime import date
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
SOURCE = ROOT.parent / "Level 1" / "VC2_AS-CD-Elab_11-11-2026.csv"
OUT = ROOT / "data" / "curriculum.json"

LEVEL_ORDER = [
    "Foundation Level A", "Foundation Level B", "Foundation Level C",
    "Foundation Level D", "Foundation",
    "Level 1", "Level 2", "Level 3", "Level 4", "Level 5", "Level 6",
    "Level 7", "Level 8", "Level 9", "Level 10", "Level 10A",
]

def level_id(band: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", band.lower()).strip("-")

def strand_id(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")

def main() -> None:
    if not SOURCE.exists():
        sys.exit(f"Source CSV not found: {SOURCE}")

    with open(SOURCE, encoding="utf-8-sig", newline="") as fh:
        rows = list(csv.reader(fh))
    # First two rows: copyright URL line + blank line; then header row.
    header = rows[2]
    body = [r for r in rows[3:] if len(r) == len(header)]
    idx = {name: i for i, name in enumerate(header)}

    levels = {}
    order_index = {band: i for i, band in enumerate(LEVEL_ORDER)}

    for r in body:
        band = r[idx["Level/Band"]].strip()
        strand = r[idx["Strand"]].strip()
        code = r[idx["Content description code"]].strip()
        if not code or not band:
            continue
        cd_text = r[idx["Content description"]].strip()
        cd_stem = r[idx["Content description stem"]].strip()
        elab = r[idx["Elaboration"]].strip()
        achievement = r[idx["Achievement standard"]].strip()

        lvl = levels.setdefault(band, {
            "id": level_id(band),
            "label": band,
            "achievementStandard": achievement,
            "strands": {},
        })
        # achievement standard is constant per level; keep the first seen
        st = lvl["strands"].setdefault(strand, {
            "id": strand_id(strand),
            "name": strand,
            "contentDescriptions": {},
        })
        cd = st["contentDescriptions"].setdefault(code, {
            "code": code,
            "stem": cd_stem,
            "description": cd_text,
            "elaborations": [],
        })
        if elab and elab not in cd["elaborations"]:
            cd["elaborations"].append(elab)

    out = {
        "meta": {
            "title": "Victorian Curriculum F-10 (2.0) - Mathematics",
            "source": "VCAA CSV export VC2_AS-CD-Elab_11-11-2026.csv",
            "sourceUrl": "https://f10.vcaa.vic.edu.au/overview/about",
            "licence": "Content descriptions and elaborations © VCAA, licensed CC-BY-NC 3.0 Australia. Non-commercial use only.",
            "generated": date.today().isoformat(),
        },
        "levels": [],
    }
    for band in sorted(levels, key=lambda b: order_index.get(b, 999)):
        lvl = levels[band]
        strands = []
        for sname in sorted(lvl["strands"], key=lambda s: ["Number","Algebra","Measurement","Space","Statistics","Probability"].index(s) if s in ["Number","Algebra","Measurement","Space","Statistics","Probability"] else 99):
            st = lvl["strands"][sname]
            cds = sorted(st["contentDescriptions"].values(), key=lambda c: c["code"])
            strands.append({
                "id": st["id"],
                "name": st["name"],
                "contentDescriptions": cds,
            })
        out["levels"].append({
            "id": lvl["id"],
            "label": lvl["label"],
            "achievementStandard": lvl["achievementStandard"],
            "strands": strands,
        })

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(out, indent=2, ensure_ascii=False), encoding="utf-8")

    total_cds = sum(len(s["contentDescriptions"]) for l in out["levels"] for s in l["strands"])
    print(f"Wrote {OUT}")
    print(f"Levels: {len(out['levels'])} | content descriptions: {total_cds}")

if __name__ == "__main__":
    main()
