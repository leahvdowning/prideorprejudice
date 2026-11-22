#!/usr/bin/env python3
"""
Builds data/tds.js, the list of TDs by constituency used by the email builder.

    python3 tools/build_tds.py

Source: data/source/tds_oireachtas_<date>.txt, one line per member of the 34th Dail,
copied from each member's own page on oireachtas.ie:
    constituency|name|party|term|email(s)|page id

To refresh after an election or by-election, save a new dated source file and
change SOURCE and CHECKED below. Never guess an address: if a member's page shows
no email, leave it blank and the site links to their Oireachtas page instead.
"""
import json, pathlib, collections

ROOT = pathlib.Path(__file__).resolve().parent.parent
SOURCE = ROOT / "data" / "source" / "tds_oireachtas_2026-11-22.txt"
CHECKED = "2026-11-22"
OUT = ROOT / "data" / "tds.js"

# Seats per constituency under the Electoral (Amendment) Act 2023. Used as a check.
SEATS = {"Carlow-Kilkenny": 5, "Cavan-Monaghan": 5, "Clare": 4, "Cork East": 4, "Cork North-Central": 5,
         "Cork North-West": 3, "Cork South-Central": 5, "Cork South-West": 3, "Donegal": 5, "Dublin Bay North": 5,
         "Dublin Bay South": 4, "Dublin Central": 4, "Dublin Fingal East": 3, "Dublin Fingal West": 3,
         "Dublin Mid-West": 5, "Dublin North-West": 3, "Dublin Rathdown": 4, "Dublin South-Central": 4,
         "Dublin South-West": 5, "Dublin West": 5, "Dún Laoghaire": 4, "Galway East": 4, "Galway West": 5,
         "Kerry": 5, "Kildare North": 5, "Kildare South": 4, "Laois": 3, "Limerick City": 4, "Limerick County": 3,
         "Longford-Westmeath": 5, "Louth": 5, "Mayo": 5, "Meath East": 4, "Meath West": 3, "Offaly": 3,
         "Roscommon-Galway": 3, "Sligo-Leitrim": 4, "Tipperary North": 3, "Tipperary South": 3, "Waterford": 4,
         "Wexford": 4, "Wicklow": 4, "Wicklow-Wexford": 3}

by = collections.defaultdict(list)
for line in SOURCE.read_text(encoding="utf-8").strip().split("\n"):
    con, name, party, term, mails, slug = line.split("|")
    if term.strip("()").split(" - ")[1].strip():      # the term has an end year: no longer a TD
        continue
    mails = [m for m in mails.split(",") if m]
    own = [m for m in mails if m.endswith("@oireachtas.ie")] or [m for m in mails if "gov.ie" not in m]
    by[con].append({"name": name, "party": party, "email": own[0] if own else "",
                    "page": "https://www.oireachtas.ie/en/members/member/" + slug + "/"})

for con, seats in SEATS.items():
    assert len(by[con]) == seats, "%s has %d TDs listed, expected %d" % (con, len(by[con]), seats)
assert set(by) == set(SEATS), "unknown constituency in source"

data = {"checked": CHECKED, "source": "https://www.oireachtas.ie/en/members/tds/",
        "constituencies": [{"name": c, "tds": sorted(by[c], key=lambda t: t["name"].split()[-1])} for c in sorted(by)]}
OUT.write_text("/* Built by tools/build_tds.py from oireachtas.ie member pages. Do not edit by hand. */\nwindow.POP_TDS = "
               + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
print("constituencies:", len(by), "| TDs:", sum(len(v) for v in by.values()),
      "| without an email:", [t["name"] for v in by.values() for t in v if not t["email"]])
