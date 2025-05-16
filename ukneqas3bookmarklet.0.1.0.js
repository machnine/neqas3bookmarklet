javascript:(function() {
  if (document.getElementById('hlaUploadBtn')) return;

  const ranges = [
    { min: 0, max: 1999, text: "0-1,999" },
    { min: 2000, max: 4999, text: "2,000-4,999" },
    { min: 5000, max: 9999, text: "5,000-9,999" },
    { min: 10000, max: 14999, text: "10,000-14,999" },
    { min: 15000, max: 19999, text: "15,000-19,999" },
    { min: 20000, max: 24999, text: "20,000-24,999" },
    { min: 25000, max: Infinity, text: "≥25,000" }
  ];

  const uploadBtn = document.createElement('button');
  uploadBtn.id = 'hlaUploadBtn';
  uploadBtn.textContent = '📄 Upload HLA CSV';
  Object.assign(uploadBtn.style, {
    position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
    padding: '8px 12px', fontSize: '14px', background: '#265449',
    color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer'
  });

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.csv';
  fileInput.style.display = 'none';

  fileInput.addEventListener('change', function () {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const lines = e.target.result.split(/\r?\n/).filter(Boolean);
      const parsed = lines.map(line => {
        const parts = line.split(",");
        if (parts.length < 2) return null;
        const hla = parts[0].trim();
        const mfi = parseInt(parts[1].replace(/,/g, ""));
        const unacceptable = parts[2] && parts[2].trim() === "1";
        return { hla, mfi, unacceptable };
      }).filter(Boolean);

      parsed.forEach(({ hla, mfi, unacceptable }) => {
        const input = Array.from(document.querySelectorAll('input[type="hidden"][id="HLA"]'))
          .find(inp => inp.value.toLowerCase() === hla.toLowerCase());
        if (!input) return;

        const baseName = input.name.replace(/\[HLA\]$/, "");
        const present = document.querySelector(`input[name="${baseName}[PRESENT]"]`);
        const mfiSelect = document.querySelector(`select[name="${baseName}[MFI]"]`);
        const unacc = document.querySelector(`input[name="${baseName}[UNACCEPTABLEANTIGENLISTING]"]`);

        if (present) present.checked = true;

        if (mfiSelect) {
          const match = ranges.find(r => mfi >= r.min && mfi <= r.max);
          if (match) {
            Array.from(mfiSelect.options).forEach(opt => {
              opt.selected = (opt.text === match.text);
            });
            mfiSelect.dispatchEvent(new Event("change", { bubbles: true }));
          }
        }

        if (unacc) unacc.checked = unacceptable;
      });

        uploadBtn.remove();
		fileInput.remove();
		setTimeout(() => {
		  addDownloadButton();
		  alert("HLA data applied!");
		}, 200);
    };

    reader.readAsText(file);
  });

  uploadBtn.addEventListener('click', () => fileInput.click());

  document.body.appendChild(uploadBtn);
  document.body.appendChild(fileInput);

  function addDownloadButton() {
    const downloadBtn = document.createElement('button');
    downloadBtn.id = 'hlaDownloadBtn';
    downloadBtn.textContent = '⬇️ Download Processed Data';
    Object.assign(downloadBtn.style, {
      position: 'fixed', top: '60px', right: '20px', zIndex: 9999,
      padding: '8px 12px', fontSize: '14px', background: '#265449',
      color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer'
    });

    downloadBtn.addEventListener('click', () => {
      const rows = Array.from(document.querySelectorAll('tr'));
      const output = [["HLA", "MFI", "UNACCEPTABLE"]];

      rows.forEach(row => {
        const hlaInput = row.querySelector('input[type="hidden"][id="HLA"]');
        if (!hlaInput) return;

        const baseName = hlaInput.name.replace(/\[HLA\]$/, "");
        const present = document.querySelector(`input[name="${baseName}[PRESENT]"]`);
        if (!present || !present.checked) return;

        const mfiSelect = document.querySelector(`select[name="${baseName}[MFI]"]`);
        const unacc = document.querySelector(`input[name="${baseName}[UNACCEPTABLEANTIGENLISTING]"]`);

        const hla = hlaInput.value;
        const mfi = mfiSelect ? mfiSelect.selectedOptions[0].text : "";
        const unacceptable = unacc && unacc.checked ? "1" : "0";

        output.push([`"${hla}"`, `"${mfi}"`, unacceptable]);
      });

      const csvContent = output.map(row => row.join(",")).join("\n");

      const title = document.querySelector('h2.zfaces-form-label');
      let filename = 'hla_output.csv';
      if (title) {
        const match = title.textContent.match(/Sample\s+[\w/]+/);
        if (match) filename = match[0] + '.csv';
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    });

    document.body.appendChild(downloadBtn);
  }
})();
