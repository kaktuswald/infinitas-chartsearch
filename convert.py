# リザルト手帳のCSVから譜面情報だけを取り出したCSVを作る

import csv
from os.path import join

for filename in ("SP.csv", "DP.csv",):
    with open(filename, newline="", encoding="utf-8") as fin, \
        open(join("wiki", filename), "w", newline="", encoding="utf-8") as fout:

        reader = csv.reader(fin)
        writer = csv.writer(fout)

        for row in reader:
            new_row = [row[0], row[1], row[2], row[3], row[23], row[24]]
            writer.writerow(new_row)
