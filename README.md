# Rx Generator

Offline-capable prescription generator (Philippine setting) that creates a PDF on-device. No server, no libraries, no patient data stored.

## Features
- Physician profile saved on the device: name, PRC Lic. No., PTR No., S2 Lic. No., clinic letterhead, drawn signature
- Patient name, age, sex, weight, address, allergies, date
- Multiple medications: generic name (brand optional), dosage, quantity in numerals and words, route, frequency, duration, indication, extra sig
- A5 PDF opens in the iOS share sheet (save, print, AirDrop, send)
- Installs to the Home Screen and works offline

## Deploy with GitHub Pages
1. Create a new GitHub repository and upload all files in this folder to the root.
2. Settings > Pages > Deploy from a branch > `main` / root > Save.
3. Open the `https://<username>.github.io/<repo>/` link on your iPhone/iPad in Safari.
4. Share button > **Add to Home Screen**. Do this so iOS keeps your saved profile and signature.

## Notes
- Patient details are cleared after every PDF.
- Dangerous drugs (S2) still require the official DDB prescription form.
- Verify every prescription before issuing it.

---
This app was created by Isabella Navarro, MD. Latest version October 2026. isaymotion@gmail.com
