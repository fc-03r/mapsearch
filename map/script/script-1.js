/************************************************
 * 資材マップ用 script.js 完成版
 * - map.csv を読み込む
 * - 検索（部品番号 / 部品名）で棚をハイライト
 * - 棚クリックで部品一覧を表示
 ************************************************/

/* ===============================
   CSV 読み込み & データ保持
================================ */

let mapData = [];

// CSV を fetch で読み込む
fetch("../map.csv")
  .then(response => response.text())
  .then(csvText => {
    mapData = parseCSV(csvText);
    console.log("map.csv 読み込み完了", mapData);
  })
  .catch(error => {
    console.error("map.csv の読み込みに失敗しました", error);
  });

/*CSV文字列 → JSON配列に変換*/
function parseCSV(csv) {
  const lines = csv.trim().split("\n");

  // ヘッダ行を削除
  lines.shift();

  return lines
    .filter(line => line.trim() !== "")
    .map(line => {
      const cols = line.split(",");

      return {
        partNo: cols[0]?.trim() || "",
        partName: cols[1]?.trim() || "",
        location: cols[2]?.trim() || "",
        level: cols[3]?.trim() || "",
        areaName: cols[4]?.trim() || ""
      };
    });
}

/* ===============================
   検索 → 棚ハイライト
================================ */

/** 検索ボタンから呼ばれる関数　部品番号 / 部品名で検索し、該当棚をハイライト*/
function highlightArea() {
  const input = document.getElementById("searchInput").value.trim();

  const areas = document.querySelectorAll(
    ".area, .area-vertical, .area-square, .area-AB-vertical"
  );

  const panelTitle = document.getElementById("panel-title");
  const partList = document.getElementById("part-list");

  // すべての棚ハイライトを解除
  areas.forEach(area => area.classList.remove("highlight"));

  // 右側詳細をクリア
  panelTitle.textContent = "検索結果";
  partList.innerHTML = "";

  if (input === "") return;

  // CSVデータから検索（部品番号 or 部品名）
  const hits = mapData.filter(p =>
    p.partNo.includes(input) || p.partName.includes(input)
  );

  // ヒット棚を抽出
  const hitLocations = new Set(hits.map(p => p.location));

  // 左側マップ：棚をハイライト
  hitLocations.forEach(loc => {
    const el = document.getElementById(loc);
    if (el) {
      el.classList.add("highlight");
    }
  });

  // 右側詳細：件数表示
  panelTitle.textContent = `検索結果（${hits.length}件）`;

  // 右側詳細：部品一覧＋該当部品ハイライト
  hits.forEach(p => {
    const li = document.createElement("li");

    // ✅ この部品が検索語に直接ヒットしているか判定
    const isDirectHit =
      p.partNo.includes(input) || p.partName.includes(input);

    if (isDirectHit) {
      li.classList.add("part-hit-strong");
    }

    li.textContent =
      `${p.partNo} ／ ${p.partName} 【${p.location}` +
      (p.level ? `・${p.level}` : "") + "】";

    partList.appendChild(li);
  });
}

/* ===============================
   棚クリック → 一覧表示
================================ */

const areas = document.querySelectorAll(
  ".area, .area-vertical, .area-square, .area-AB-vertical"
);

const panelTitle = document.getElementById("panel-title");
const partList = document.getElementById("part-list");

areas.forEach(area => {
  area.addEventListener("click", () => {
    const shelfId = area.id;

    // 対象棚の部品を抽出
    const parts = mapData.filter(p => p.location === shelfId);

    // 表示初期化
    partList.innerHTML = "";

    if (parts.length === 0) {
      panelTitle.textContent = `棚 ${shelfId}`;
      partList.innerHTML = "<li>登録部品はありません</li>";
      return;
    }

    // 名称（置き場）をまとめて取得（重複排除）
    const areaNames = [...new Set(
      parts.map(p => p.areaName).filter(name => name !== "")
    )];

    panelTitle.textContent =
      `棚 ${shelfId}` +
      (areaNames.length ? `（${areaNames.join(" / ")}）` : "");

    // 部品一覧を表示
    parts.forEach(p => {
      const li = document.createElement("li");
      li.textContent =
        `${p.partNo} ／ ${p.partName}` +
        (p.level ? `（${p.level}）` : "");
      partList.appendChild(li);
    });
  });
});

// 検索欄で Enter キーを押したら検索実行
document.getElementById("searchInput").addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    event.preventDefault(); // フォーム送信などを防止
    highlightArea();        // 検索ボタンと同じ処理
  }
});