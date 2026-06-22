const wikiurl = 'https://raw.githubusercontent.com/wiki/kaktuswald/infinitas-chartsearch';

const pageSize = 100;

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
  document.querySelectorAll(".sort-buttons button").forEach(btn => {
    btn.addEventListener("click", () => {
      sortColIndex = parseInt(btn.dataset.col, 10);
      sortOrder = btn.dataset.order;

      document.querySelectorAll(".sort-icon").forEach(element => element.classList.remove("sort-active"));
      btn.classList.add("sort-active");

      search();
    });
  });

  document.querySelectorAll("details button.selection-all").forEach(btn => {
    btn.addEventListener("click", () => {
      const list = btn.parentElement.querySelector("div");
      list.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.checked = true;
      });
    });
  })

  document.querySelectorAll("details button.selection-clear").forEach(btn => {
    btn.addEventListener("click", () => {
      const list = btn.parentElement.querySelector("div");
      list.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
        cb.checked = false;
      });
    });
  })

  document.querySelector("button#selection-category-reverse").addEventListener("click", event => {
    const list = event.target.parentElement.querySelector("div");
    list.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      if(["初期収録曲", "DJP解禁曲", "BIT解禁曲"].includes(cb.value)) return;
      cb.checked = !cb.checked;
    });
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
      load_textfile("versions", "versions.txt", timestamp),
      load_textfile("categories", "categories.txt", timestamp),
      load_csvfile("SP", "SP.csv", timestamp),
      load_csvfile("DP", "DP.csv", timestamp),
    ]);

    data.versions.forEach((key, i) => {
      orderMapVersions[key] = i;
      insert_checkbox(
        document.querySelector("#selected-versions div.checkbox-list"),
        "version",
        key !== "" ? key : "unknown",
        key !== "" ? key : "不明",
      );
    });

    difficulties.forEach((key, i) => {
      orderMapDifficulties[key] = i;
      insert_checkbox(
        document.querySelector("#selected-difficulties div.checkbox-list"),
        "difficulty",
        key,
        key,
      );
    });

    levels.forEach((key, i) => {
      insert_checkbox(
        document.querySelector("#selected-levels div.checkbox-list"),
        "level",
        key,
        key,
      );
    });

    notesradars.forEach((key, i) => {
      orderMapNotesradars[key] = i;
      insert_checkbox(
        document.querySelector("#selected-notesradars div.checkbox-list"),
        "notesradar",
        key !== "" ? key : "unknown",
        key !== "" ? key : "不明",
      );
    });

    data.categories.forEach((key, i) => {
      orderMapCategories[key] = i;
      insert_checkbox(
        document.querySelector("#selected-categories div.checkbox-list"),
        "category",
        key !== "" ? key : "unknown",
        key !== "" ? key : "不明",
      );
    });

    const selected_playmode = await JSON.parse(localStorage.getItem("selected_playmode") || null);
    if(selected_playmode)
      document.querySelector(`input[name="playmode"][value="${selected_playmode}"`).checked = true;

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
  label.append(input);

  label.append(text);
  
  parent.append(label);
}

/**
 * データCSVファイルをロードする
 * @param {String} key キー
 * @param {String} filename ファイル名
 * @param {String} timestamp データのタイムスタンプ
 * @returns Promiseインスタンス
 */
 function load_textfile(key, filename, timestamp) {
  return fetch(`${wikiurl}/${filename}?${timestamp}`)
    .then(response => {
      if(!response.ok) throw new Error(response.status);
      return response.text();
    })
    .then(text => {
      if(text.includes('\r\n'))
        data[key] = text.split('\r\n');
      else
        data[key] = text.split('\n');
    })
}

/**
 * データCSVファイルをロードする
 * @param {String} key キー
 * @param {String} filename ファイル名
 * @param {String} timestamp データのタイムスタンプ
 * @returns Promiseインスタンス
 */
 function load_csvfile(key, filename, timestamp) {
  return new Promise((resolve, reject) => {
    Papa.parse(`${wikiurl}/${filename}?${timestamp}`, {
      download: true,
      header: false,
      skipEmptyLines: true,
      dynamicTyping: {
        3: true,
        4: true,
      },
      complete: function(results) {
        data[key] = results.data.slice(1);
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

  const selected_versions = Array.from(document.querySelectorAll('input[name="version"]:checked'))
                        .map(cb => cb.value);

  const selected_difficulties = Array.from(document.querySelectorAll('input[name="difficulty"]:checked'))
                        .map(cb => cb.value);

  const selected_levels = Array.from(document.querySelectorAll('input[name="level"]:checked'))
                        .map(cb => cb.value);

  const selected_notesradars = Array.from(document.querySelectorAll('input[name="notesradar"]:checked'))
                        .map(cb => cb.value);

  const selected_categories = Array.from(document.querySelectorAll('input[name="category"]:checked'))
                        .map(cb => cb.value);

  const keyword_songname = document.getElementById("keyword_songname").value.toLowerCase();

  document.querySelector("#selected-versions .summary-values").textContent = `${selected_versions.join(', ')}`;
  document.querySelector("#selected-difficulties .summary-values").textContent = `${selected_difficulties.join(', ')}`;
  document.querySelector("#selected-levels .summary-values").textContent = `${selected_levels.join(', ')}`;
  document.querySelector("#selected-notesradars .summary-values").textContent = `${selected_notesradars.join(', ')}`;
  document.querySelector("#selected-categories .summary-values").textContent = `${selected_categories.join(', ')}`;

  localStorage.setItem("selected_playmode", JSON.stringify(selected_playmode));
  localStorage.setItem("selected_version", JSON.stringify(selected_versions));
  localStorage.setItem("selected_difficulty", JSON.stringify(selected_difficulties));
  localStorage.setItem("selected_level", JSON.stringify(selected_levels));
  localStorage.setItem("selected_notesradar", JSON.stringify(selected_notesradars));
  localStorage.setItem("selected_category", JSON.stringify(selected_categories));

  const filtered = data[selected_playmode].filter(row => {
    const version = String(row[0] || "");
    const songname = String(row[1] || "").toLowerCase();
    const difficulty = String(row[3] || "");
    const level = String(row[4] || "");
    const notesradar = String(row[6] || "");
    const category = String(row[7] || "");

    const match_version =
      selected_versions.length === 0 || selected_versions.includes(version);

    const match_songname =
      keyword_songname === "" || songname.includes(keyword_songname);

    const match_difficulty =
      selected_difficulties.length === 0 || selected_difficulties.includes(difficulty);

    const match_level =
      selected_levels.length === 0 || selected_levels.includes(level);

    const match_notesradar =
      selected_notesradars.length === 0 ||
      selected_notesradars.some(v => (v === "unknown" && notesradar === "") || notesradar.includes(v));

    const match_category =
      selected_categories.length === 0 ||
      selected_categories.some(v => (v === "unknown" && category === "") || category.includes(v));

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
 * 一番下へスクロール
 */
function toBottom() {
  window.scrollTo(0, document.body.scrollHeight);
}

/**
 * 一番上へスクロール
 */
function toTop() {
  window.scrollTo(0, 0);
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
  toTop();
}

/**
 * 前のページに移動する
 */
function prevPage() {
  currentPage--;
  renderPage();
  toTop();
}

/**
 * 検索結果をレンダリングする
 */
function renderPage() {
  const table = document.getElementById("result");

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

  table.innerHTML = html || '<tr><td colspan="8">該当なし</td></tr>';
  
  const totalPages = Math.max(1, Math.ceil(resultdata.length / pageSize));

  let pagerHtml = `${resultdata.length} 件`;

  if (currentPage > 1)
    pagerHtml += `<button onclick="prevPage()">前へ</button>`;
  else
    pagerHtml += `<button onclick="prevPage()" disabled>前へ</button>`;

  pagerHtml += ` ${currentPage} / ${totalPages} `;
  
  if (currentPage < totalPages)
    pagerHtml += `<button onclick="nextPage()">次へ</button>`;
  else
    pagerHtml += `<button onclick="nextPage()" disabled>次へ</button>`;

  document.querySelectorAll(".pager").forEach(element => {
    element.innerHTML = pagerHtml;
  });
}

document.addEventListener("DOMContentLoaded", complete_loaded);
