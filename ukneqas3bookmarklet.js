javascript: (function () {
  if (document.getElementById("hlaUploadBtn")) return;

  const ranges = [
    { min: 0, max: 1999, text: "0-1,999" },
    { min: 2000, max: 4999, text: "2,000-4,999" },
    { min: 5000, max: 9999, text: "5,000-9,999" },
    { min: 10000, max: 14999, text: "10,000-14,999" },
    { min: 15000, max: 19999, text: "15,000-19,999" },
    { min: 20000, max: 24999, text: "20,000-24,999" },
    { min: 25000, max: Infinity, text: ">=25,000" },
  ];
  const tableCodes = ["class1", "class2", "dqa", "dpa"];

  const uploadBtn = document.createElement("button");
  uploadBtn.id = "hlaUploadBtn";
  uploadBtn.textContent = "Upload a CSV File";
  Object.assign(uploadBtn.style, buttonStyle("20px"));

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".csv";
  fileInput.style.display = "none";

  fileInput.addEventListener("change", function () {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const parsed = parseCsv(e.target.result)
        .filter((row, index) => row.length >= 2 && !(index === 0 && /^"?hla"?$/i.test(row[0].trim())))
        .map((parts) => {
          const hla = stripCsvValue(parts[0]);
          const mfiText = stripCsvValue(parts[1]);
          const mfi = parseInt(mfiText.replace(/[^\d]/g, ""), 10);
          const unacceptable = ["1", "true", "yes", "y"].includes(stripCsvValue(parts[2] || "").toLowerCase());
          return { hla, mfi, mfiText, unacceptable };
        })
        .filter((row) => row.hla);

      const counts = parsed.reduce(
        (acc, row) => {
          if (applyResult(row)) acc.applied += 1;
          else acc.missing += 1;
          return acc;
        },
        { applied: 0, missing: 0 }
      );

      alert(`HLA antibody data applied: ${counts.applied} row(s).${counts.missing ? ` ${counts.missing} row(s) not found on this form.` : ""}`);
      fileInput.value = "";
    };

    reader.readAsText(file);
  });

  uploadBtn.addEventListener("click", () => fileInput.click());

  document.body.appendChild(uploadBtn);
  document.body.appendChild(fileInput);
  addDownloadButton();

  function addDownloadButton() {
    if (document.getElementById("hlaDownloadBtn")) return;

    const downloadBtn = document.createElement("button");
    downloadBtn.id = "hlaDownloadBtn";
    downloadBtn.textContent = "Download as CSV File";
    Object.assign(downloadBtn.style, buttonStyle("60px"));

    downloadBtn.addEventListener("click", () => {
      const output = [["HLA", "MFI", "UNACCEPTABLE"]];
      collectRows().forEach((row) => output.push(row));

      const csvContent = output.map((row) => row.map(csvEscape).join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = getFilename();
      link.click();
      URL.revokeObjectURL(link.href);
    });

    document.body.appendChild(downloadBtn);
  }

  function buttonStyle(top) {
    return {
      position: "fixed",
      top,
      right: "20px",
      zIndex: 9999,
      padding: "8px 12px",
      fontSize: "14px",
      background: "#265449",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
    };
  }

  function applyResult(row) {
    const { hla, mfi, mfiText, unacceptable } = row;
    const rowEl = findModernRow(hla);
    if (!rowEl) return false;

    const present = rowEl.querySelector('input[type="checkbox"][id$="_present"], input[type="checkbox"][name$="_present"]');
    const mfiSelect = rowEl.querySelector('select[id$="_mfi"], select[name$="_mfi"]');
    const unacc = rowEl.querySelector('input[type="checkbox"][id$="_antigen"], input[type="checkbox"][name$="_antigen"]');

    setChecked(present, true);
    setMfiSelect(mfiSelect, mfi, mfiText);
    setChecked(unacc, unacceptable);

    return true;
  }

  function findModernRow(hla) {
    const candidates = modernHlaCandidates(hla);

    for (const tableCode of tableCodes) {
      for (const candidate of candidates) {
        const row = document.getElementById(`${tableCode}_${domKey(candidate)}`);
        if (row) return row;
      }
    }

    return Array.from(document.querySelectorAll("#grid_class1_body tr, #grid_class2_body tr, #grid_dqa_body tr, #grid_dpa_body tr")).find((row) => {
      const label = row.cells && row.cells[0] ? row.cells[0].textContent : "";
      return candidates.some((candidate) => normaliseHla(label) === normaliseHla(candidate));
    });
  }

  function modernHlaCandidates(hla) {
    const value = String(hla || "").trim();
    const withoutPrefix = value.replace(/^(?:HLA[-\s]*)?(DQA1|DPA1)\*/i, "");
    return Array.from(new Set([value, withoutPrefix]));
  }

  function collectRows() {
    return Array.from(document.querySelectorAll("#grid_class1_body tr, #grid_class2_body tr, #grid_dqa_body tr, #grid_dpa_body tr"))
      .map((row) => {
        const present = row.querySelector('input[type="checkbox"][id$="_present"], input[type="checkbox"][name$="_present"]');
        if (!present || !present.checked) return null;

        const mfiSelect = row.querySelector('select[id$="_mfi"], select[name$="_mfi"]');
        const unacc = row.querySelector('input[type="checkbox"][id$="_antigen"], input[type="checkbox"][name$="_antigen"]');
        const hla = row.cells && row.cells[0] ? row.cells[0].textContent.trim() : "";
        const mfi = getSelectedText(mfiSelect);
        const unacceptable = unacc && unacc.checked ? "1" : "0";

        return [hla, mfi, unacceptable];
      })
      .filter(Boolean);
  }

  function setChecked(input, checked) {
    if (!input) return;
    input.checked = checked;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function setMfiSelect(select, mfi, mfiText) {
    if (!select) return;

    const wantedRange = Number.isFinite(mfi) ? ranges.find((r) => mfi >= r.min && mfi <= r.max) : null;
    const wantedTexts = [wantedRange && wantedRange.text, wantedRange && wantedRange.text.replace(">=", "≥"), mfiText].filter(Boolean);
    const option = Array.from(select.options).find((opt) => wantedTexts.some((text) => normaliseMfiText(opt.textContent) === normaliseMfiText(text)));

    if (option) {
      select.value = option.value;
      select.dispatchEvent(new Event("input", { bubbles: true }));
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  function getSelectedText(select) {
    if (!select || !select.selectedOptions || !select.selectedOptions[0]) return "";
    return select.selectedOptions[0].textContent.trim();
  }

  function normaliseHla(value) {
    return String(value || "")
      .toLowerCase()
      .trim()
      .replace(/^hla[-\s]*/i, "")
      .replace(/^(dqa1|dpa1)\*/i, "")
      .replace(/[^a-z0-9]+/g, "");
  }

  function domKey(value) {
    return String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "_");
  }

  function normaliseMfiText(value) {
    return String(value || "")
      .trim()
      .replace(/^≥/, ">=")
      .replace(/\s+/g, "");
  }

  function parseCsv(text) {
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      const next = text[i + 1];

      if (char === '"' && inQuotes && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        row.push(field);
        field = "";
      } else if ((char === "\n" || char === "\r") && !inQuotes) {
        if (char === "\r" && next === "\n") i += 1;
        row.push(field);
        if (row.some((cell) => cell.trim() !== "")) rows.push(row);
        row = [];
        field = "";
      } else {
        field += char;
      }
    }

    row.push(field);
    if (row.some((cell) => cell.trim() !== "")) rows.push(row);
    return rows;
  }

  function stripCsvValue(value) {
    return String(value || "").trim().replace(/^"|"$/g, "");
  }

  function csvEscape(value) {
    const text = String(value == null ? "" : value);
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  function getFilename() {
    const title = document.querySelector("#resultTitle, h2.zfaces-form-label, h2");
    const titleText = title ? title.textContent.trim() : "";
    const sampleMatch = titleText.match(/Sample\s+[\w/-]+|\(([A-Za-z0-9/_-]+)\)/);
    if (sampleMatch) return `${sampleMatch[1] || sampleMatch[0]}.csv`;
    return "hla_output.csv";
  }
})();
