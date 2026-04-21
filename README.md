# Screen Pet 🐾 - Browser Extension v1.2

A cute animal companion that hops around your browser!
Choose from **Ginger Cat 🐱 / Maltese 🐶 / Hamster 🐹 / Dino 🦕**.

## Features

- **Personalized Naming**: Give your pet a name that floats above their head!
- **Interactive States**: Idle, Walking, Running, Jumping, Dancing, and **Sleeping (Zzz)**.
- **English Dialogue System**: Pets express their thoughts with localized strings and emojis.
- **Real-time Sync**: Changes in name or pet type are instantly reflected across all open tabs.

## Installation

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
├── content.js        # Core logic (physics, state machine, interactions)
├── styles.css        # Visual styles and animations
├── popup.html        # Settings UI (Selection & Naming)
├── popup.js          # Settings logic (Storage & Message passing)
├── icons/            # Extension icons
└── README.md
```

## Technical Overview

- **Storage**: Uses `chrome.storage.local` to persist the selected pet and name.
- **Sync**: Monitors `chrome.storage.onChanged` in `content.js` to update all tabs immediately without refresh.
- **Dialogue**: Uses a weighted random selection from the `PET_THOUGHTS` object in `content.js`.

## How to Add a New Pet

1. Define a new SVG constant in `pets.js`.
2. Update `global.PET_SVGS`, `global.PET_NAMES`, and `global.PET_LIST`.
3. Add a new card in `popup.html` and update `popup.js` to handle the selection.
4. Add specific thoughts for your new pet in `content.js` under `PET_THOUGHTS`.

---
*Created with ❤️ for your browser.*
