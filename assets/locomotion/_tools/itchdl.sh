# usage: itchdl.sh <game_url> [upload_id outfile]
S=${TMPDIR:-/tmp}
G=$1; CJ=$(mktemp)
curl -sSL -c $CJ -b $CJ $G -o $S/g.html
T=$(grep -oE 'name="csrf_token" value="[^"]*"' $S/g.html | head -1 | sed 's/.*value="//;s/"//')
DU=$(curl -sSL -c $CJ -b $CJ -X POST --data-urlencode "csrf_token=$T" $G/download_url | python3 -c "import json,sys;print(json.load(sys.stdin)['url'])")
curl -sSL -c $CJ -b $CJ "$DU" -o $S/d.html
grep -oE 'upload_id="[0-9]+"|class="name"[^>]*>[^<]*|file_size"><span>[^<]*' $S/d.html | paste - - -
if [ -n "$2" ]; then
 URL=$(curl -sSL -c $CJ -b $CJ -X POST --data-urlencode "csrf_token=$T" "$G/file/$2?source=game_download" | python3 -c "import json,sys;print(json.load(sys.stdin)['url'])")
 curl -sSL -o "$3" "$URL" -w "%{http_code} %{size_download}\n"
fi
