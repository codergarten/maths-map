#!/usr/bin/env python3
"""Structural validation of Maths Map item banks against the generated curriculum slices."""
import json
import sys
from collections import Counter
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"

failures = 0

for bank_path in sorted(DATA.glob("item-bank-*.json")):
    level_id = bank_path.stem.replace("item-bank-", "")
    slim_path = DATA / f"curriculum.{level_id}.json"
    print(f"=== {bank_path.name} (level: {level_id}) ===")

    if not slim_path.exists():
        print(f"  MISSING {slim_path.name} — run build_curriculum.py first\n")
        failures += 1
        continue

    ib = json.loads(bank_path.read_text(encoding="utf-8"))
    cur = json.loads(slim_path.read_text(encoding="utf-8"))
    level = next((l for l in cur["levels"] if l["id"] == level_id), None)
    if level is None:
        print(f"  Level {level_id} not found in {slim_path.name}\n")
        failures += 1
        continue

    codes = {c["code"] for s in level["strands"] for c in s["contentDescriptions"]}
    items = ib["items"]
    print(f"items: {len(items)} | codes in level: {len(codes)}")
    errs = []
    for it in items:
        iid = it["id"]
        if it["code"] not in codes:
            errs.append(f"{iid}: unknown code {it['code']}")
        for p in it["proficiency"]:
            if p not in ib["meta"]["proficiencyTags"]:
                errs.append(f"{iid}: bad proficiency {p}")
        if it["type"] == "choice":
            if not isinstance(it["answer"], int) or not (0 <= it["answer"] < len(it["options"])):
                errs.append(f"{iid}: bad choice answer")
        elif it["type"] == "order":
            if sorted(it["answer"]) != sorted(it["items"]):
                errs.append(f"{iid}: order answer mismatch")
        elif it["type"] == "observe":
            if "observeScript" not in it:
                errs.append(f"{iid}: missing observeScript")
            rubric = it.get("observeRubric", {})
            if set(rubric) != {"secure", "partial", "notYet"}:
                errs.append(f"{iid}: rubric keys wrong: {list(rubric)}")
        else:
            errs.append(f"{iid}: unknown type {it['type']}")

    for c in sorted(codes):
        n = sum(1 for it in items if it["code"] == c)
        if n < 4:
            errs.append(f"{c}: only {n} items")

    if errs:
        failures += 1
        for e in errs:
            print("  ERROR", e)
    else:
        print("errors: NONE")
        print("types:", dict(Counter(it["type"] for it in items)))
    print()

if failures:
    sys.exit(f"{failures} bank(s) failed validation")
print("All item banks valid.")
