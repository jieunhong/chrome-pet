# Screen Pet 🐾 - Browser Extension v1.2

A cute animal companion that hops around your browser!
Choose from **Ginger Cat 🐱 / Maltese 🐶 / Hamster 🐹 / Dino 🦕**.

## Features

- **Personalized Naming**: Give your pet a name that floats above their head!
- **Birthday Celebration**: Your pet wears a party hat all day on its birthday. Click it for a three-second cake and candle-blowing celebration, in both soft and pixel art.
- **Interactive States**: Idle, Walking, Running, Jumping, Dancing, and **Sleeping (Zzz)**.
- **English Dialogue System**: Pets express their thoughts with localized strings and emojis.
- **Real-time Sync**: Changes in name or pet type are instantly reflected across all open tabs.

## Download

[**Install from Chrome Web Store**](https://chromewebstore.google.com/detail/screen-pet-%ED%99%94%EB%A9%B4-%ED%8E%AB/cmecjkngmlhbajpfdbnlnlodohbgkahg)

## Installation (Developer Mode)

1. Unzip the folder.
2. Go to `chrome://extensions` in Chrome.
3. Turn on **"Developer mode"** (top right).
4. Click **"Load unpacked"** (top left).
5. Select the `screen-pet` folder.
6. Open any webpage (refresh any tabs that were already open).

## How to Change Pet & Name

Click the **Screen Pet icon** in your extension toolbar.
- Click a pet card to switch instantly.
- Type a name and click **"Save"** to update your pet's name label.
- Set **Pet Birthday** and click **"Save"** to change its birthday. The default is the local installation date; changing it does not change the recorded installation date. Older installations without a recorded date use the day they first run this version.
- Birthdays repeat on the same local month and day each year (February 29 celebrates on leap years). Hats update at midnight and when returning to a tab. A sleeping pet can celebrate and then return to sleep.

## Controls

| Action | Result |
|---|---|
| **Drag** | Pick up and move the pet (falls with gravity when released) |
| **Double Click** | Pet performs a happy dance |
| **Right Click** | Toggle visibility (Hide/Show) |
| **Bottom Active** | Pet chases your cursor when it's near the bottom of the screen |
| **Idle Time** | Pet might fall asleep (look for Zzz particles!) |

## Pet Personalities

- **🐱 Ginger Cat**: Classic orange kitty with big round "Puss in Boots" eyes.
- **🐶 Maltese**: Cute white puppy with floppy brown ears and a tiny pink tongue.
- **🐹 Hamster**: Fluffy little cheeks and a twitchy tail.
- **🦕 Dino**: A friendly long-necked dinosaur with cute spots.

## File Structure

```
screen-pet/
├── manifest.json     # Extension configuration
├── pets.js           # Shared SVG definitions & pet list
├── birthday.js       # Local birthday rules and shared celebration artwork
├── content.js        # Core logic (physics, state machine, interactions)
├── styles.css        # Visual styles and animations
├── popup.html        # Settings UI (Selection & Naming)
├── popup.js          # Settings logic (Storage & Message passing)
├── icons/            # Extension icons
└── README.md
```

## Technical Overview

- **Storage**: Uses `chrome.storage.local` to persist the selected pet and name.
- **Birthday storage**: `installedOn` and editable `petBirthday` are local `YYYY-MM-DD` strings, initialized once by the background worker.
- **Sync**: Monitors `chrome.storage.onChanged` in `content.js` to update all tabs immediately without refresh.
- **Dialogue**: Uses a weighted random selection from the `PET_THOUGHTS` object in `content.js`.

## Development Checks

For birthday checks, open `dev-preview.html` and use **모자 켜기 / 초 불기 (3초)** to compare all pets in both themes. Clicking a preview pet also plays its celebration. Run `node --test tests/*.test.js` for automated checks.

## How to Add a New Pet

1. Define a new SVG constant in `pets.js`.
2. Update `global.PET_SVGS`, `global.PET_NAMES`, and `global.PET_LIST`.
3. Add a new card in `popup.html` and update `popup.js` to handle the selection.
4. Add specific thoughts for your new pet in `content.js` under `PET_THOUGHTS`.

## Support

Screen Pet is free and non-commercial. If it made your browsing a little nicer,
a coffee is always appreciated.

☕ [**Buy me a coffee (PayPal)**](https://paypal.me/hongbbubbu)

## License

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)** license.

- ✅ Free to use, share, and modify for personal and non-commercial purposes
- ❌ Commercial use is not permitted
- 📄 See [LICENSE](LICENSE) for full details

---
*Created with ❤️ for your browser.*
