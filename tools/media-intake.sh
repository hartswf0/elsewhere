#!/usr/bin/env bash
# Turn large project media into web-sized pieces for the site.
#   tools/media-intake.sh <project-name> <files or folders...>
# For each video: a poster (WebP, 1280 wide), a 6-second silent loop (WebM and MP4, 960 wide, usually under 2 MB),
# and three stills from across its length. For each image: a WebP, 1600 wide.
# Everything lands in media/<project-name>/ with a manifest.json. Full-length videos belong on YouTube or Vimeo;
# put their links in the manifest's "watch" field and the page will link out.
set -euo pipefail
name="$1"; shift
out="media/$name"; mkdir -p "$out"
man="$out/manifest.json"; [ -f "$man" ] || echo '{"watch":[],"items":[]}' > "$man"
add(){ python3 - "$man" "$@" <<'PY'
import json,sys
m=json.load(open(sys.argv[1]));m["items"].append(dict(zip(sys.argv[2::2],sys.argv[3::2])));json.dump(m,open(sys.argv[1],"w"),indent=1)
PY
}
for src in "$@"; do
  find "$src" -type f \( -iname '*.mp4' -o -iname '*.mov' -o -iname '*.m4v' -o -iname '*.webm' -o -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.gif' \) -print0 |
  while IFS= read -r -d '' f; do
    base=$(basename "${f%.*}" | tr ' ' '-' | tr -cd 'A-Za-z0-9._-')
    case "${f,,}" in
      *.png|*.jpg|*.jpeg|*.gif)
        ffmpeg -nostdin -loglevel error -y -i "$f" -vf "scale='min(1600,iw)':-2" -frames:v 1 -c:v libwebp -q:v 72 "$out/$base.webp"
        add type image file "$base.webp" source "$(basename "$f")" ;;
      *)
        d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f" | cut -d. -f1); d=${d:-6}
        mid=$(( d / 3 )); len=$(( d < 6 ? d : 6 ))
        ffmpeg -nostdin -loglevel error -y -ss "$mid" -i "$f" -vf "scale='min(1280,iw)':-2" -frames:v 1 -c:v libwebp -q:v 75 "$out/$base.poster.webp"
        ffmpeg -nostdin -loglevel error -y -ss "$mid" -t "$len" -i "$f" -an -vf "scale='min(960,iw)':-2,fps=24" -c:v libvpx-vp9 -b:v 0 -crf 40 -row-mt 1 "$out/$base.loop.webm"
        ffmpeg -nostdin -loglevel error -y -ss "$mid" -t "$len" -i "$f" -an -vf "scale='min(960,iw)':-2,fps=24" -c:v libx264 -crf 30 -preset slow -pix_fmt yuv420p -movflags +faststart "$out/$base.loop.mp4"
        for k in 1 2 3; do ffmpeg -nostdin -loglevel error -y -ss $(( d * k / 4 )) -i "$f" -vf "scale='min(960,iw)':-2" -frames:v 1 -c:v libwebp -q:v 70 "$out/$base.still$k.webp"; done
        add type video poster "$base.poster.webp" loop_webm "$base.loop.webm" loop_mp4 "$base.loop.mp4" stills "$base.still1.webp,$base.still2.webp,$base.still3.webp" source "$(basename "$f")" seconds "$d" ;;
    esac
    echo "  $f"
  done
done
du -sh "$out"; echo "manifest: $man"
