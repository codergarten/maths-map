#!/usr/bin/env python3
import json
import sys
from collections import Counter
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parent.parent

ib = json.loads((ROOT / "data" / "item-bank-level-1.json").read_text(encoding="utf-8"))
cur = json.loads((ROOT / "data" / "curriculum.json").read_text(encoding="utf-8"))
l1 = next(l for l in cur["levels"] if l["label"] == "Level 1")
codes = {c["code"] for s in l1["strands"] for c in s["contentDescriptions"]}

items = ib["items"]
print("items:", len(items))
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

print("errors:", errs if errs else "NONE")
print("items per code:", dict(sorted(Counter(it["code"] for it in items).items())))
print("types:", dict(Counter(it["type"] for it in items)))
