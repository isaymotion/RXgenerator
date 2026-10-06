# Rx Generator

Offline-capable prescription generator (Philippine setting) that creates a PDF on-device. No server, no libraries, no patient data stored unless you opt in.

## Features
- Multiple physician profiles, each saved on the device: name, PRC Lic. No., PTR No., S2 Lic. No., clinic letterhead, drawn signature
- Patient name, age, sex, weight, address, allergies, date
- Multiple medications: generic name (brand optional), dosage, quantity in numerals and words, route, frequency, duration, indication, extra sig
- Medication templates, and an optional (off by default) patient list and prescription history stored only on the device
- Backup and restore of profiles, signatures and templates (patient data optional) to a JSON file
- Optional dark 16-bit (GBA-style) theme, switchable from the header
- In-app Back button (also works with the iOS swipe-back gesture)
- A5 PDF opens in the iOS share sheet (save, print, AirDrop, send)
- Installs to the Home Screen and works offline

## Deploy with GitHub Pages
1. Create a new GitHub repository and upload all files in this folder to the root.
2. Settings > Pages > Deploy from a branch > `main` / root > Save.
3. Open the `https://<username>.github.io/<repo>/` link on your iPhone/iPad in Safari.
4. Share button > **Add to Home Screen**. Do this so iOS keeps your saved profile and signature.

## Notes
- The form is cleared after every PDF. Patient list and history are saved only if you switch them on in the Saved tab; they stay on the device, so protect it with a passcode.
- Dangerous drugs (S2) still require the official DDB prescription form.
- Verify every prescription before issuing it.

## Credits
The 16-bit theme uses the "Press Start 2P" font by CodeMan38 (SIL Open Font License; see `fonts/OFL.txt`).

---
This app was created by Isabella Navarro, MD. Latest version October 2026. isaymotion@gmail.com
