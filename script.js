const wikiurl = 'https://raw.githubusercontent.com/wiki/kaktuswald/infinitas-chartsearch';

const pageSize = 100;

const versions = [
  "1st&substream",
  "2nd style",
  "3rd style",
  "4th style",
  "5th style",
  "6th style",
  "7th style",
  "8th style",
  "9th style",
  "10th style",
  "IIDX RED",
  "HAPPY SKY",
  "DistorteD",
  "GOLD",
  "DJ TROOPERS",
  "EMPRESS",
  "SIRIUS",
  "Resort Anthem",
  "Lincle",
  "tricoro",
  "SPADA",
  "PENDUAL",
  "copula",
  "SINOBUZ",
  "CANNON BALLERS",
  "Rootage",
  "HEROIC VERSE",
  "BISTROVER",
  "CastHour",
  "RESIDENT",
  "EPOLIS",
  "Pinky Crush",
  "Sparkle Shower",
  "ZINRAI",
  "INFINITAS",
];

const difficulties = [
  "BEGINNER",
  "NORMAL",
  "HYPER",
  "ANOTHER",
  "LEGGENDARIA",
];

const levels = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
];

const notesradars = [
  "NOTES",
  "CHORD",
  "PEAK",
  "SCRATCH",
  "CHARGE",
  "SOF-LAN",
  "",
];

const categories = [
  "初期収録曲",
  "DJP解禁曲",
  "BIT解禁曲",
  "The 4th セレクション 楽曲パック vol.1",
  "楽曲パック vol.29",
  "GITADORA セレクション 楽曲パック vol.1",
  "楽曲パック vol.28",
  "SOUND VOLTEX セレクション 楽曲パック vol.2",
  "楽曲パック vol.27",
  "楽曲パック vol.26",
  "ULTIMATE MOBILE セレクション 楽曲パック vol.1",
  "BPL セレクション 楽曲パック vol.2",
  "楽曲パック vol.25",
  "東方Project セレクション 楽曲パック vol.1",
  "楽曲パック vol.24",
  "楽曲パック vol.23",
  "楽曲パック vol.22",
  "pop'n music セレクション 楽曲パック vol.2",
  "楽曲パック vol.21",
  "楽曲パック vol.20",
  "楽曲パック vol.19",
  "SOUND VOLTEX セレクション 楽曲パック vol.1",
  "楽曲パック vol.18",
  "楽曲パック vol.17",
  "BPL セレクション 楽曲パック vol.1",
  "jubeat セレクション 楽曲パック vol.1",
  "楽曲パック vol.16",
  "スタートアップセレクション 楽曲パック vol.3",
  "楽曲パック vol.15",
  "スタートアップセレクション 楽曲パック vol.2",
  "楽曲パック vol.14",
  "pop'n music セレクション 楽曲パック vol.1",
  "スタートアップセレクション 楽曲パック vol.1",
  "楽曲パック vol.13",
  "楽曲パック vol.12",
  "楽曲パック vol.11",
  "楽曲パック vol.10",
  "楽曲パック vol.9",
  "楽曲パック vol.8",
  "楽曲パック vol.7",
  "楽曲パック vol.6",
  "楽曲パック vol.5",
  "楽曲パック vol.4",
  "楽曲パック vol.3",
  "楽曲パック vol.2",
  "楽曲パック vol.1",
  "",
]

const default_checked = [
  "HYPER",
  "ANOTHER",
];

const data = {};

let resultdata = [];
let currentPage = 1;

let sortColIndex = 1;
let sortOrder = "asc";

let orderMapVersions = {};
let orderMapDifficulties = {};
let orderMapNotesradars = {};
let orderMapCategories = {};

/**
 * ロード完了時の初期処理
 */
async function complete_loaded() {
  document.querySelectorAll('.sort-buttons button').forEach(btn => {
    btn.addEventListener('click', () => {
      sortColIndex = parseInt(btn.dataset.col, 10);
      sortOrder = btn.dataset.order;

      document.querySelectorAll(".sort-icon").forEach(element => element.classList.remove("sort-active"));
      btn.classList.add("sort-active");

      search();
    });
  });

  versions.forEach((key, i) => {
    orderMapVersions[key] = i;
    insert_checkbox(
      document.querySelector("div#version"),
      "version",
      key,
      key,
    );
  });

  difficulties.forEach((key, i) => {
    orderMapDifficulties[key] = i;
    insert_checkbox(
      document.querySelector("div#difficulty"),
      "difficulty",
      key,
      key,
    );
  });

  levels.forEach((key, i) => {
    insert_checkbox(
      document.querySelector("div#level"),
      "level",
      key,
      key,
    );
  });

  notesradars.forEach((key, i) => {
    orderMapNotesradars[key] = i;
    insert_checkbox(
      document.querySelector("div#notesradar"),
      "notesradar",
      key !== "" ? key : "unknown",
      key !== "" ? key : "不明",
    );
  });

  categories.forEach((key, i) => {
    orderMapCategories[key] = i;
    insert_checkbox(
      document.querySelector("div#category"),
      "category",
      key !== "" ? key : "unknown",
      key !== "" ? key : "不明",
    );
  });

  const response = await fetch(`${wikiurl}/timestamp.txt`, {cache: "no-store"});
  if(response.ok) {
    const timestamp = await response.text();

    const year = timestamp.slice(0, 4);
    const month = timestamp.slice(4, 6);
    const day = timestamp.slice(6, 8);
    const hour = timestamp.slice(8, 10);
    const minute = timestamp.slice(10, 12);
    document.querySelector("span#last-modefied").textContent = `${year}年${month}月${day}日 ${hour}時${minute}分`;

    await Promise.all([
      load_datafile("SP", timestamp),
      load_datafile("DP", timestamp),
    ]);

    const selected_playmode = await JSON.parse(localStorage.getItem("selected_playmode") || null);
    if(selected_playmode)
      document.querySelector(`input[name="playmode"][value="${selected_playmode}"`).checked = true;
    // document.querySelectorAll('input[name="playmode"]').forEach(cb => {
    //   cb.checked = selected_playmode == cb.value;
    // });

    const selected_version = await JSON.parse(localStorage.getItem("selected_version") || "[]");
    document.querySelectorAll('input[name="version"]').forEach(cb => {
      cb.checked = selected_version.includes(cb.value);
    });

    const selected_difficulty = await JSON.parse(localStorage.getItem("selected_difficulty") || "[]");
    document.querySelectorAll('input[name="difficulty"]').forEach(cb => {
      cb.checked = selected_difficulty.includes(cb.value);
    });

    const selected_level = await JSON.parse(localStorage.getItem("selected_level") || "[]");
    document.querySelectorAll('input[name="level"]').forEach(cb => {
      cb.checked = selected_level.includes(cb.value);
    });

    const selected_notesradar = await JSON.parse(localStorage.getItem("selected_notesradar") || "[]");
    document.querySelectorAll('input[name="notesradar"]').forEach(cb => {
      cb.checked = selected_notesradar.includes(cb.value);
    });

    const selected_category = await JSON.parse(localStorage.getItem("selected_category") || "[]");
    document.querySelectorAll('input[name="category"]').forEach(cb => {
      cb.checked = selected_category.includes(cb.value);
    });

    search();
  }
}

/**
 * チェックボックスを親要素に挿入
 * @param {*} parent 親要素
 * @param {String} name チェックボックスのname
 * @param {String} value チェックボックスのvalue
 */
function insert_checkbox(parent, name, value, text) {
    const label = document.createElement("label");

    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = name;
    input.value = value;
    if(default_checked.includes(value)) input.checked = true;
    label.append(input);

    label.append(text);
    parent.append(label);
}

/**
 * データCSVファイルをロードする
 * @param {String} playmode プレイモード
 * @param {String} timestamp データのタイムスタンプ
 * @returns Promiseインスタンス
 */
 function load_datafile(playmode, timestamp) {
  return new Promise((resolve, reject) => {
    Papa.parse(`${wikiurl}/${playmode}.csv?${timestamp}`, {
      download: true,
      header: false,
      skipEmptyLines: true,
      dynamicTyping: {
        3: true,
        4: true,
      },
      complete: function(results) {
        data[playmode] = results.data.slice(1);
        resolve();
      }
    });
  });
}

/**
 * 検索する
 */
function search() {
  const selected_playmode = document.querySelector('input[name="playmode"]:checked').value;

  const selected_version = Array.from(document.querySelectorAll('input[name="version"]:checked'))
                        .map(cb => cb.value);

  const selected_difficulty = Array.from(document.querySelectorAll('input[name="difficulty"]:checked'))
                        .map(cb => cb.value);

  const selected_level = Array.from(document.querySelectorAll('input[name="level"]:checked'))
                        .map(cb => cb.value);

  const selected_notesradar = Array.from(document.querySelectorAll('input[name="notesradar"]:checked'))
                        .map(cb => cb.value);

  const selected_category = Array.from(document.querySelectorAll('input[name="category"]:checked'))
                        .map(cb => cb.value);

  const keyword_songname = document.getElementById("keyword_songname").value.toLowerCase();

  localStorage.setItem("selected_playmode", JSON.stringify(selected_playmode));
  localStorage.setItem("selected_version", JSON.stringify(selected_version));
  localStorage.setItem("selected_difficulty", JSON.stringify(selected_difficulty));
  localStorage.setItem("selected_level", JSON.stringify(selected_level));
  localStorage.setItem("selected_notesradar", JSON.stringify(selected_notesradar));
  localStorage.setItem("selected_category", JSON.stringify(selected_category));

  const filtered = data[selected_playmode].filter(row => {
    const version = String(row[0] || "");
    const songname = String(row[1] || "").toLowerCase();
    const difficulty = String(row[3] || "");
    const level = String(row[4] || "");
    const notesradar = String(row[6] || "");
    const category = String(row[7] || "");

    const match_version =
      selected_version.length === 0 || selected_version.includes(version);

    const match_songname =
      keyword_songname === "" || songname.includes(keyword_songname);

    const match_difficulty =
      selected_difficulty.length === 0 || selected_difficulty.includes(difficulty);

    const match_level =
      selected_level.length === 0 || selected_level.includes(level);

    const match_notesradar =
      selected_notesradar.length === 0 ||
      selected_notesradar.some(v => (v === "unknown" && notesradar === "") || notesradar.includes(v));

    const match_category =
      selected_category.length === 0 ||
      selected_category.some(v => (v === "unknown" && category === "") || category.includes(v));

    return match_version && match_songname && match_difficulty && match_level && match_notesradar && match_category;
  });

  if(sortColIndex === 1) {
    if(sortOrder === "desc")
      filtered.reverse();
    resultdata = filtered;
  }
  else {
    resultdata = filtered.sort((rowA, rowB) => {
      const cellA = rowA[sortColIndex];
      const cellB = rowB[sortColIndex];

      return compareValues(cellA, cellB, sortOrder);
    });
  }

  currentPage = 1;

  renderPage();
}

/**
 * 2つの値の比較
 * @param {*} a 値A
 * @param {*} b 値B
 * @param {*} order 正順/逆順
 * @returns 
 */
function compareValues(a, b, order) {
  let result;

  switch(sortColIndex) {
    case 0:
      result = orderMapVersions[a] - orderMapVersions[b];
      break;
    case 3:
      result = orderMapDifficulties[a] - orderMapDifficulties[b];
      break;
    case 4:
    case 5:
      result = a - b;
      break;
    case 6:
      if(!a.includes("/") && !b.includes("/"))
        result = orderMapNotesradars[a] - orderMapNotesradars[b];
      else
        result = a.includes("/") ? -1 : 1;
      break;
    case 7:
      if(!a.includes("/") && !b.includes("/"))
        result = orderMapCategories[a] - orderMapCategories[b];
      else
        result = a.includes("/") ? -1 : 1;
      break;
  }

  return order === 'asc' ? result : -result;
}

/**
 * 次のページに移動する
 */
function nextPage() {
  currentPage++;
  renderPage();
}

/**
 * 前のページに移動する
 */
function prevPage() {
  currentPage--;
  renderPage();
}

/**
 * 検索結果をレンダリングする
 */
function renderPage() {
  const table = document.getElementById("result");
  const pager = document.getElementById("pager");

  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageRows = resultdata.slice(start, end);

  let html = "";
  
  pageRows.forEach(row => {
    html += `
      <tr>
        <td class="version-badge ver-${row[0].replace(" ", "_")}">${row[0] || ""}</td>
        <td class="songname-badge">${row[1] || ""}</td>
        <td class="artist-badge">${row[2] || ""}</td>
        <td class="diff-badge diff-${row[3]}">${row[3] || ""}</td>
        <td class="level-badge level-${row[4]}">${row[4] || ""}</td>
        <td class="notes-badge">${row[5]}</td>
        <td class="notesradar-badge notesradar-${row[6]}">${row[6] || ""}</td>
        <td class="categor-badge categor-${row[7]}">${row[7] || ""}</td>
      </tr>
    `;
  });

  table.innerHTML = html || '<tr><td colspan="6">該当なし</td></tr>';
  
  const totalPages = Math.ceil(resultdata.length / pageSize);

  let pagerHtml = `${resultdata.length} 件`;

  if (currentPage > 1)
    pagerHtml += `<button onclick="prevPage()">前へ</button>`;
  else
    pagerHtml += `<button onclick="prevPage()" disabled>前へ</button>`;

  pagerHtml += ` ${currentPage} / ${totalPages} `;
  
  if (currentPage < totalPages)
    pagerHtml += `<button onclick="nextPage()">次へ</button>`;
  else
    pagerHtml += `<button onclick="nextPage() disabled">次へ</button>`;

  pager.innerHTML = pagerHtml;
}

document.addEventListener("DOMContentLoaded", complete_loaded);
