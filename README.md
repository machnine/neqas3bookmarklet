# 🧬 UK NEQAS H&I Scheme 3 Bookmarklet

This tool helps users participating in the UK NEQAS H&I Scheme 3 to efficiently populate and extract HLA antibody data directly from the online results form using a bookmarklet.

## 🔧 How to Use

1. Go to [https://machnine.github.io/neqas3bookmarklet/](https://machnine.github.io/neqas3bookmarklet/)
2. Drag the bookmarklet button (**🧬 NEQAS H&I Scheme 3 Tool**) to your browser’s bookmarks bar.
3. Open the NEQAS Scheme 3 results webpage.
4. Click the bookmarklet from your bookmarks bar.
5. Use the **Upload** and **Download** buttons that appear in the top-right of the page.

---

## 📄 Upload CSV

The **Upload HLA CSV** button allows you to upload a `.csv` file that contains your HLA antibody data. The tool will automatically find and populate the correct fields.

### ✅ CSV Format
```
    HLA,MFI,UNACCEPTABLE
    A2,24000,1
    B44,2500,0
    DR1,30000,1
```
- `HLA`: The HLA antigen name (e.g. A2, B44, DR1)
- `MFI`: The MFI value (plain number, e.g. 24000)
- `UNACCEPTABLE`: Either `1` (checked) or `0` (unchecked)

**Note:** You can include both Class I and Class II antigens in the same file. The tool will process both, even if only one class is currently visible on the webpage.

---

## ⬇️ Download CSV

The **Download Processed Data** button will collect all rows where the `PRESENT` checkbox is ticked and export them as a `.csv` file.

### ✅ Output Format
```
    "HLA","MFI","UNACCEPTABLE"
    "A2","20,000-24,999",1
    "B44","2,000-4,999",0
    "DR1","≥25,000",1
```
- `HLA`: The antigen
- `MFI`: The selected dropdown range
- `UNACCEPTABLE`: `1` if ticked, `0` if not

### 🗂 Filename
The output file is named automatically using the sample title from the form (e.g. `Sample 01/2025.csv`).

---

## 🔗 Bookmarklet Script

The tool is loaded via this minified JS file:  
`https://machnine.github.io/neqas3bookmarklet/ukneqas3bookmarklet.min.js`

If you're embedding or sharing directly, you can use this wrapped form as a bookmarklet:
```javascript
javascript:(function(){const s=document.createElement('script');s.src='https://machnine.github.io/neqas3bookmarklet/ukneqas3bookmarklet.min.js';document.body.appendChild(s);})();
```
## 📎 License
MIT License – feel free to reuse and adapt with credit.
