"""Generate self-contained profile SVGs. Standard library only; fail closed on API errors."""
import argparse
from datetime import date, datetime, timedelta, timezone
from html import escape
import json
import os
from pathlib import Path
import random
import urllib.request

ROOT = Path(__file__).resolve().parent
QUERY = """query($login: String!) {
  user(login: $login) {
    login
    repositories(privacy: PUBLIC, ownerAffiliations: OWNER) { totalCount }
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount color } }
      }
    }
  }
}"""

def fetch():
    token = os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN")
    if not token:
        raise RuntimeError("No GitHub authentication. Run with GH_TOKEN from gh auth token.")
    req = urllib.request.Request("https://api.github.com/graphql",
        data=json.dumps({"query":QUERY,"variables":{"login":"mojeebdev"}}).encode(),
        headers={"Authorization":f"Bearer {token}","Content-Type":"application/json",
                 "User-Agent":"mojeebdev-profile-generator"})
    with urllib.request.urlopen(req, timeout=30) as response:
        payload = json.load(response)
    if payload.get("errors") or not payload.get("data",{}).get("user"):
        raise RuntimeError("GitHub GraphQL did not return complete stats; nothing was updated.")
    result = payload["data"]["user"]
    validate(result)
    return result

def validate(data):
    if data["login"] != "mojeebdev":
        raise ValueError("Unexpected GitHub account.")
    cal = data["contributionsCollection"]["contributionCalendar"]
    days = [d for w in cal["weeks"] for d in w["contributionDays"]]
    if len(days) < 360 or any(not isinstance(d["contributionCount"], int) for d in days):
        raise ValueError("Incomplete contribution calendar.")
    if sum(d["contributionCount"] for d in days) != cal["totalContributions"]:
        raise ValueError("Contribution totals do not match calendar.")
    return days

THEMES = {
    "dark": {"bg":"#101714","panel":"#16211c","line":"#34483e","ink":"#edf4ee","muted":"#a1b7a9","accent":"#b6ed8a"},
    "light":{"bg":"#f7f7ef","panel":"#eef0e4","line":"#c6cdbd","ink":"#1a3025","muted":"#506653","accent":"#35671d"},
}

def text(x,y,label,size=16,cls="",fill=None):
    style = f' fill="{fill}"' if fill else ""
    return f'<text x="{x}" y="{y}" font-size="{size}" class="{cls}"{style}>{escape(str(label))}</text>'

def rect(x,y,w,h,cls="panel",rx=10):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" class="{cls}"/>'

def header(width,height,title,theme):
    t=THEMES[theme]
    return [f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title desc">',
        f'<title id="title">{escape(title)}</title><desc id="desc">Mojeeb Titilayo. AI Product Engineer, System Architect and Strategist. Founder of BlindspotLab.</desc>',
        f"""<style>
        :root {{color-scheme:{theme}}}
        text {{font-family:ui-monospace,SFMono-Regular,Consolas,"Liberation Mono",monospace;fill:{t["ink"]}}}
        .bg {{fill:{t["bg"]}}} .panel {{fill:{t["panel"]};stroke:{t["line"]}}}
        .muted {{fill:{t["muted"]}}} .accent {{fill:{t["accent"]}}}
        .rule {{stroke:{t["line"]};stroke-width:1}}
        .reveal {{animation:appear .6s ease both;animation-delay:var(--delay,0s)}}
        .dot {{fill:{t["accent"]};animation:assemble 12s ease-in-out infinite}}
        .cursor {{fill:{t["accent"]};animation:blink 1.1s steps(1) infinite}}
        @keyframes appear {{from{{opacity:0;transform:translateY(5px)}}to{{opacity:1;transform:translateY(0)}}}}
        @keyframes assemble {{0%,100%{{transform:translate(var(--dx),var(--dy));opacity:0.08}}25%,75%{{transform:translate(0,0);opacity:.95}}}}
        @keyframes blink {{50%{{opacity:0}}}}
        @media(prefers-reduced-motion:reduce) {{.reveal,.dot,.cursor{{animation:none!important;transform:none!important;opacity:1!important}}}}
        </style>""",rect(1,1,width-2,height-2,"bg",16)]

def card(data, dots, theme):
    days=validate(data)
    total=data["contributionsCollection"]["contributionCalendar"]["totalContributions"]
    active=sum(d["contributionCount"]>0 for d in days)
    longest=run=0
    for d in days:
        run=run+1 if d["contributionCount"] else 0
        longest=max(longest,run)
    s=header(1080,1040,"Mojeeb Titilayo | whoami",theme)
    s += [f'<path class="rule" d="M1 57H1079"/>']
    for i,c in enumerate(["#e18171","#d6b665","#8abc73"]):
        s.append(f'<circle cx="{27+i*20}" cy="29" r="5" fill="{c}"/>')
    s += [text(106,34,"mojeebdev@github:~ $ whoami",15,"muted"),
          text(827,34,"PROFILE / 01",13,"muted"),
          text(28,104,"MOJEEB TITILAYO",27,"accent"),
          text(28,132,"Turning rough ideas into useful products.",16,"muted"),
          rect(28,161,276,340),text(45,186,"VISUAL.MAP",13,"muted"),
          text(45,483,"IDENTITY / RESOLVED",12,"muted"),
          '<defs><clipPath id="portrait"><rect x="40" y="202" width="252" height="257" rx="6"/></clipPath></defs>',
          '<g clip-path="url(#portrait)">']
    rng=random.Random(42)
    for x,y,r in dots:
        dx,dy=rng.uniform(-120,120),rng.uniform(-110,110)
        s.append(f'<circle class="dot" cx="{46+x*240:.2f}" cy="{207+y*240:.2f}" r="{r}" style="--dx:{dx:.1f}px;--dy:{dy:.1f}px"/>')
    s.append('</g>')
    stats=[(total,"CONTRIBUTIONS"),(data["repositories"]["totalCount"],"PUBLIC REPOS"),
           (active,"ACTIVE DAYS"),(f"{longest}d","LONGEST STREAK")]
    for i,(value,label) in enumerate(stats):
        x=28+(i%2)*143;y=518+(i//2)*97
        s += [rect(x,y,133,84),text(x+13,y+34,f"{value:,}" if isinstance(value,int) else value,25,"accent"),
              text(x+13,y+62,label,10,"muted")]
    s += [text(28,730,"Activity: last 12 months",12,"muted"),
          text(28,750,"Public GitHub API snapshot",12,"muted"),
          text(28,770,"Through "+days[-1]["date"],12,"muted"),
          text(28,829,"BLINDSPOTLAB",20,"accent"),
          text(28,854,"AI-native product studio",13,"muted"),
          text(28,882,"Strategy. Systems. Shipping.",12,"muted"),
          text(28,950,"BUILD WITH INTENTION.",13,"muted"),
          '<path class="rule" d="M326 161V968"/>']
    counter=0
    def row(y,label,value):
        nonlocal counter
        counter+=1
        s.append(f'<g class="reveal" style="--delay:{counter*.07:.2f}s">')
        s.extend([text(350,y,label,15,"muted"),text(453,y,"....",15,"muted"),text(506,y,value,15)])
        s.append('</g>')
    def heading(y,label):
        s.extend([text(350,y,label,12,"accent"),f'<path class="rule" d="M350 {y+12}H1048"/>'])
    def pills(y,label,items):
        row(y,label,"")
        x=506
        for item in items:
            w=len(item)*7.8+18
            s.extend([rect(x,y-19,w,28),text(x+9,y,item,13)])
            x+=w+7
    heading(174,"01 / IDENTITY")
    row(215,"Role","AI Product Engineer")
    row(242,"Focus","System Architect / Strategist")
    row(277,"Status","Building BlindspotLab + Arcapush")
    heading(320,"02 / TOOLKIT")
    pills(359,"Tools",["Codex","Claude Code","ChatGPT"])
    pills(397,"Editor",["VS Code","GitHub"])
    pills(445,"Frontend",["TypeScript","React","Next.js"])
    pills(483,"Backend",["APIs","Prisma","Solidity"])
    pills(521,"Database",["PostgreSQL","Supabase","Firebase","D1"])
    pills(559,"Cloud",["Cloudflare","Vercel"])
    heading(606,"03 / SELECTED BUILDS")
    for y,name,desc in [(645,"Arcapush","Product discovery + distribution"),
                        (675,"StackBrief","Repo context for developers + agents"),
                        (705,"Revel","Actionable website + product audits"),
                        (735,"SiteHook","Prospect research + outreach previews"),
                        (765,"Admon","GitHub activity meets on-chain identity")]:
        row(y,name,desc)
    heading(808,"04 / TRACK RECORD")
    row(847,"Built","40+ products, tools + experiments")
    row(877,"Experience","12+ yrs Web2 / 4+ yrs Web3")
    heading(920,"05 / CONTACT")
    s += [text(350,953,"hello@mojeeb.xyz  /  mojeeb@blindspotlab.xyz",15),
          text(350,979,"mojeeb.xyz  ·  X @MojeebMotion  ·  LinkedIn /in/tmojeeb",13,"muted"),
          text(28,1017,"mojeebdev@github:~ $",14,"muted"),
          '<rect class="cursor" x="214" y="1004" width="9" height="16"/>',
          text(771,1017,"READY FOR THE NEXT BUILD.",12,"accent"),'</svg>']
    return "\n".join(s)+"\n"

def snake(data):
    days=validate(data)
    start=date.fromisoformat(days[0]["date"])
    sunday=start-timedelta(days=(start.weekday()+1)%7)
    cells=[]
    for d in days:
        delta=(date.fromisoformat(d["date"])-sunday).days
        cells.append((delta//7,delta%7,d))
    # A closed Hamiltonian path on a padded, even-column board. Every real cell is eaten.
    columns=max(c for c,r,d in cells)+1
    columns+=columns%2
    path=[(0,r) for r in range(7)]
    for c in range(1,columns):
        path.extend((c,r) for r in (range(6,0,-1) if c%2 else range(1,7)))
    path.extend((c,0) for c in range(columns-1,0,-1))
    assert len(set(path)) == columns*7
    duration=42
    order={p:i for i,p in enumerate(path)}
    s=header(1080,238,"Mojeeb's contribution calendar and animated snake","dark")
    s += [text(28,32,"CONTRIBUTIONS / LAST 12 MONTHS",14,"accent"),
          text(28,57,f'{days[0]["date"]} → {days[-1]["date"]}  ·  {sum(d["contributionCount"] for d in days):,} contributions',12,"muted"),
          '<style>@keyframes eaten{0%,100%{opacity:1}1%,18%{opacity:.12}55%{opacity:1}}']
    for k in range(6):
        keyframes=[]
        for i in range(len(path)+1):
            c,r=path[(i-k)%len(path)]
            keyframes.append(f'{i/len(path)*100:.4f}%{{transform:translate({34+c*18}px,{83+r*18}px)}}')
        s.append(f'@keyframes move{k}{{'+''.join(keyframes)+'}')
    s.append('@media(prefers-reduced-motion:reduce){.cell,.snake{animation:none!important}.snake{display:none}}</style>')
    for c,r,d in cells:
        i=order[c,r]
        # Negative delay keeps all cells visible on initial load; eating aligns with head visit.
        delay=i/len(path)*duration-duration
        color=d["color"] if d["contributionCount"] else "#25362c"
        s.append(f'<rect class="cell" x="{28+c*18}" y="{77+r*18}" width="13" height="13" rx="3" fill="{color}" style="animation:eaten {duration}s linear infinite;animation-delay:{delay:.5f}s"><title>{d["date"]}: {d["contributionCount"]} contributions</title></rect>')
    for k in reversed(range(6)):
        s.append(f'<rect class="snake" x="-6" y="-6" width="12" height="12" rx="4" fill="{["#f4ffd9","#c8ee98","#b0db81","#98c36e","#80a95b","#698e48"][k]}" style="animation:move{k} {duration}s linear infinite"/>')
    s += [text(28,222,"A growing body of work. One contribution at a time.",12,"muted"),'</svg>']
    return "\n".join(s)+"\n"

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--snapshot",type=Path,help="Render a previously verified GitHub response, without calling API")
    args=p.parse_args()
    data=json.loads(args.snapshot.read_text()) if args.snapshot else fetch()
    validate(data)
    dots=json.loads((ROOT/"dots.json").read_text())
    # Build all output in memory before touching the previous successful snapshot.
    results={f"{theme}.svg":card(data,dots,theme) for theme in THEMES}
    results["snake.svg"]=snake(data)
    results["stats.json"]=json.dumps(data,separators=(",",":"))+"\n"
    for name,content in results.items():
        tmp=ROOT/(name+".tmp")
        tmp.write_text(content)
        tmp.replace(ROOT/name)
    print("Generated light.svg, dark.svg and snake.svg from verified GitHub stats.")

if __name__=="__main__":
    main()
