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

/**
 * ロード完了時の初期処理
 */
async function complete_loaded() {
  document.querySelectorAll('.sort-buttons button').forEach(btn => {
    btn.addEventListener('click', () => {
      sortColIndex = parseInt(btn.dataset.col, 10);
      sortOrder = btn.dataset.order;

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

  await Promise.all([
    load_datafile("SP"),
    load_datafile("DP"),
  ]);

  search();
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
 * @returns Promiseインスタンス
 */
function load_datafile(playmode) {
  return new Promise((resolve, reject) => {
    Papa.parse(`https://raw.githubusercontent.com/wiki/kaktuswald/infinitas-chartsearch/${playmode}.csv`, {
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
  const playmode = document.querySelector('input[name="playmode"]:checked').value;

  const selected_version = Array.from(document.querySelectorAll('input[name="version"]:checked'))
                        .map(cb => cb.value);

  const selected_difficulty = Array.from(document.querySelectorAll('input[name="difficulty"]:checked'))
                        .map(cb => cb.value);

  const selected_level = Array.from(document.querySelectorAll('input[name="level"]:checked'))
                        .map(cb => cb.value);

  const selected_notesradar = Array.from(document.querySelectorAll('input[name="notesradar"]:checked'))
                        .map(cb => cb.value);

  const keyword_songname = document.getElementById("keyword_songname").value.toLowerCase();

  const filtered = data[playmode].filter(row => {
    const version = String(row[0] || "");
    const songname = String(row[1] || "").toLowerCase();
    const difficulty = String(row[2] || "");
    const level = String(row[3] || "");
    const notesradar = String(row[5] || "");

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

    return match_version && match_songname && match_difficulty && match_level && match_notesradar;
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
    case 2:
      result = orderMapDifficulties[a] - orderMapDifficulties[b];
      break;
    case 3:
    case 4:
      result = a - b;
      break;
    case 5:
      if(!a.includes("/") && !b.includes("/"))
        result = orderMapNotesradars[a] - orderMapNotesradars[b];
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
        <td class="diff-badge diff-${row[2]}">${row[2] || ""}</td>
        <td class="level-badge level-${row[3]}">${row[3] || ""}</td>
        <td class="notes-badge">${row[4]}</td>
        <td class="notesradar-badge notesradar-${row[5]}">${row[5] || ""}</td>
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
