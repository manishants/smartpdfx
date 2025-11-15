# SmartPDFx

Secure, fast, and modern PDF tooling built with Next.js.

## Password Protection (AES‑256 via qpdf)

SmartPDFx now applies real password encryption using qpdf on the server. This fixes prior behavior where PDFs appeared “protected” but opened without a prompt.

### How it works
- The server action writes the uploaded PDF to a temp file.
- qpdf is invoked with AES‑256 and both user and owner passwords set to your chosen password to enforce an open prompt.
- Permissions are restricted (print: none, modify: none, extract: n).
- The encrypted file is returned to the browser as a data URI for download.

### Requirements
- qpdf must be installed on the server or developer machine.
- Optionally set `QPDF_PATH` to a full path (e.g., `C:\Program Files\qpdf\bin\qpdf.exe`). If unset, we use `qpdf` from `PATH`.

### Install qpdf
- macOS: `brew install qpdf`
- Ubuntu/Debian: `sudo apt-get install qpdf`
- Windows (recommended):
  - Chocolatey: `choco install qpdf`
  - Winget: `winget install QPDF.QPDF`
  - Manual: download from SourceForge/GitHub releases and add the `bin` folder to `PATH`

### Verification
- The server runs `qpdf --show-encryption` for the output file. You should see `R = 6` and `AESv3` indicating modern AES‑256 encryption.
- You can also verify locally: `qpdf --show-encryption yourfile.pdf`

### Cross‑reader testing
To confirm universal password prompts, test opening the protected PDF in:
- Adobe Acrobat Reader
- Chrome/Edge built‑in viewer
- macOS Preview
- Foxit Reader (optional)

Each should prompt for the password before rendering content.

### Notes
- Accessibility extraction is always allowed for modern encryption formats (per qpdf); other extraction is disabled.
- If qpdf is missing, the app returns a clear error instructing you to install/configure qpdf.

## Development
Run locally with Node 18+:

```
npm install
npm run dev
```

Ensure qpdf is installed and available to the server process if you plan to use the Protect PDF tool.
