# リザルト手帳のCSVから譜面情報だけを取り出したCSVを作る

import csv
from os.path import join
from datetime import datetime

SONGS_FILENAME = "songs.csv"
CHARTS_FILENAME = "charts.csv"

with open(SONGS_FILENAME, encoding="utf-8") as f:
    songs = {row[0]: (row[1:]) for row in csv.reader(f)}

with open(CHARTS_FILENAME, encoding="utf-8") as f:
    reader = csv.reader(f)
    next(reader)
    charts = list(reader)

result = {'SP': [], 'DP': []}
for chart in charts:
    result[chart[1]].append((
        songs[chart[0]][1],
        chart[0],
        songs[chart[0]][4],
        songs[chart[0]][2],
        chart[2],
        chart[3],
        chart[4],
        chart[5],
        songs[chart[0]][5],
        chart[6],
    ))

for playmode, values in result.items():
    with open(join("wiki", f"{playmode}.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(("バージョン", "曲名", "アーティスト", "ACバージョン", "難易度", "レベル", "ノーツ数", "ノーツレーダー属性", "カテゴリ", "AC収録"))
        writer.writerows(values)

with open(join("wiki", "timestamp.txt"), "w", encoding="utf-8") as f:
    f.write(datetime.now().strftime("%Y%m%d%H%M%S"))
