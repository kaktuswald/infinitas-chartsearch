# リザルト手帳のCSVから譜面情報だけを取り出したCSVを作る

import csv
from os.path import join
from datetime import datetime

SONGS_FILENAME = 'songs.csv'

with open(SONGS_FILENAME, encoding="utf-8") as f:
    songs = {row[0]: (row[1:]) for row in csv.reader(f)}

for filename in ("SP.csv", "DP.csv",):
    with open(filename, encoding="utf-8") as fin, \
        open(join("wiki", filename), "w", newline="", encoding="utf-8") as fout:

        reader = list(csv.reader(fin))[1:]
        writer = csv.writer(fout)
        writer.writerow(("バージョン", "曲名", "アーティスト", "難易度", "レベル", "ノーツ数", "ノーツレーダー属性", "カテゴリ", "AC収録"))

        for row in reader:
            if not row[1] in songs.keys():
                print(f"Not exist: {row[1]}")
                continue

            writer.writerow((
                row[0],
                row[1],
                songs[row[1]][1],
                row[2],
                row[3],
                row[23],
                row[24],
                songs[row[1]][2],
                songs[row[1]][3],
            ))

    with open(join("wiki", 'timestamp.txt'), "w", encoding="utf-8") as f:
        f.write(datetime.now().strftime("%Y%m%d%H%M%S"))
