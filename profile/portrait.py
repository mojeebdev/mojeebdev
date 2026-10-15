"""Rebuild dots only when the avatar changes. Requires Pillow and numpy."""
import argparse
import json
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parent

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("photo", nargs="?", default=str(ROOT / "avatar.png"))
    parser.add_argument("--mask", help="Optional white-foreground mask for a different portrait")
    args = parser.parse_args()
    photo = Image.open(args.photo).convert("RGB").resize((460, 460))
    # Hand-traced silhouette for the approved GitHub avatar; excludes its grey backdrop.
    mask = Image.new("L", photo.size)
    outline = [(113,72),(148,33),(200,13),(265,9),(316,27),(348,61),
               (367,108),(366,183),(390,181),(408,197),(403,237),
               (380,273),(354,307),(350,383),(405,427),(453,459),
               (21,459),(94,423),(121,397),(100,355),(80,309),
               (69,259),(75,218),(73,172),(89,120)]
    ImageDraw.Draw(mask).polygon(outline, fill=255)
    if args.mask:
        mask = Image.open(args.mask).convert("L").resize(photo.size)
    gray = np.asarray(ImageOps.autocontrast(ImageOps.grayscale(photo)), dtype=float) / 255
    weights = ((1-gray) ** 1.7 + .025) * (np.asarray(mask)/255)
    rng = np.random.default_rng(142301831)
    idx = rng.choice(weights.size, 2600, replace=False, p=(weights/weights.sum()).ravel())
    dots = []
    for i in idx:
        y,x = divmod(int(i),460)
        dots.append([round(x/460,4),round(y/460,4),round(.45+(1-gray[y,x])*.7,2)])
    (ROOT / "dots.json").write_text(json.dumps(dots, separators=(",",":"))+"\n")
    print(f"Saved {len(dots)} portrait points.")

if __name__ == "__main__":
    main()
