# UK NEQAS H&I Scheme 3 Bookmarklet

This bookmarklet helps users participating in UK NEQAS H&I Scheme 3 populate and extract HLA antibody data on the migrated 2026 results form.

It targets the current Power Apps based Scheme 3 form layout. The previous hidden-field form used by the retired site is no longer supported.

## How to Use

1. Go to [https://machnine.github.io/neqas3bookmarklet/](https://machnine.github.io/neqas3bookmarklet/)
2. Drag the bookmarklet button (**NEQAS H&I Scheme 3 Tool**) to your browser's bookmarks bar.
3. Open the migrated NEQAS Scheme 3 results webpage.
4. Click the bookmarklet from your bookmarks bar.
5. Use the **Upload** and **Download** buttons that appear in the top-right of the page.

---

## Upload CSV

The **Upload a CSV File** button uploads a `.csv` file containing HLA antibody data. The tool matches each antigen to the generated 2026 grid rows and populates:

- `Present`
- `MFI`
- `Unacceptable Antigen Listing`

### CSV Format
```
HLA,MFI,UNACCEPTABLE
A2,24000,1
B44,2500,0
DR1,30000,1
DQA1*01:01,26000,0
```

- `HLA`: The antigen name, for example `A2`, `B44`, `DR1`, `DPB1*04:01`, `DQA1*01:01`, or `01:01` for DQA/DPA rows.
- `MFI`: The MFI value as a plain number, for example `24000`.
- `UNACCEPTABLE`: Either `1` (checked) or `0` (unchecked)

The upload parser also accepts downloaded MFI ranges, for example `"2,000-4,999"`, because downloaded CSV files quote values containing commas.

You can include Class I, Class II, DQA, and DPA antigens in the same file. The 2026 page builds all four grid sections in the page DOM, so the bookmarklet can match rows across the whole Scheme 3 form.

---

## Download CSV

The **Download as CSV File** button collects all rows where `Present` is ticked and exports them as a `.csv` file.

### Output Format
```
HLA,MFI,UNACCEPTABLE
A2,"20,000-24,999",1
B44,"2,000-4,999",0
DR1,"≥25,000",1
```

- `HLA`: The antigen label shown in the form row
- `MFI`: The selected dropdown range
- `UNACCEPTABLE`: `1` if ticked, `0` if not

### Filename
The output file is named automatically from the sample code in the form title when available. Otherwise it uses `hla_output.csv`.

---

## Bookmarklet Script

The tool is loaded via this JavaScript file:
`https://machnine.github.io/neqas3bookmarklet/ukneqas3bookmarklet.min.js`

If you're embedding or sharing directly, you can use this wrapped form as a bookmarklet:
```javascript
javascript:(function(){const s=document.createElement('script');s.src='https://machnine.github.io/neqas3bookmarklet/ukneqas3bookmarklet.min.js';document.body.appendChild(s);})();
```
## License
MIT License - feel free to reuse and adapt with credit.
