# Screen Pet 🐾 - Browser Extension v1.2

A cute animal companion that hops around your browser!
Choose from **Ginger Cat 🐱 / Maltese 🐶 / Hamster 🐹 / Dino 🦕**.

## Features

- **Personalized Naming**: Give your pet a name that floats above their head!
- **Birthday Celebration**: Your pet wears a party hat all day on its birthday. Click it for a three-second cake and candle-blowing celebration, in both soft and pixel art.
- **Interactive States**: Idle, Walking, Running, Jumping, Dancing, and **Sleeping (Zzz)**.
- **English Dialogue System**: Pets express their thoughts with localized strings and emojis.
- **Real-time Sync**: Changes in name or pet type are instantly reflected across all open tabs.
- **Timed Hide**: Take a break for 10 minutes, 30 minutes, 1 hour, or 1 day (24 hours). Your pet and bed stay hidden across tabs and page reloads, then return automatically on the active tab.
- **Daily Tarot**: Pick one of three cards above your pet to reveal a card, a score out of 100, a lucky item, and a short reading. The 22 Major Arcana are available in both soft and pixel styles.
- **Pet Language**: Choose automatic, Korean, or English. Automatic uses Korean for a Korean browser UI and English for other browser languages. Pet dialogue and tarot readings follow this choice.

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
- Choose **Pet Language** to change dialogue and tarot text. Changing the language preserves today's selected card and score.

## Daily Fortune

Between **6:00 AM and noon in your local time**, your pet offers three face-down tarot cards once per day. Pick one to see your card, fortune score, lucky item, and reading. Closing the offer stops further automatic offers that day; you can still draw or review it from **Right click → Today's Fortune / 오늘의 운세**, including in the afternoon.

Your first selected result is shared across tabs and survives refreshes and browser restarts. A new local calendar day allows a new draw. Hidden pets, inactive tabs, and docked developer tools do not consume the automatic offer; birthday candle-blowing finishes before an automatic offer appears. Cards and results close when the pet is hidden, and can be dismissed with **×** or **Esc**.

New draws have an equal chance of **Upright / 정방향** or **Reversed / 역방향**. Reversed cards appear upside down and have their own reading and lucky item; they do not simply mean bad luck. The direction is saved with the result and stays the same when reopening it or changing language. Older saved results without a direction remain upright with their original card and score.

New scores use **high (75–100) at 60%, middle (45–74) at 30%, and low (15–44) at 10%**: a **6:3:1** ratio. The band is chosen independently of the card and direction, then an integer score is chosen uniformly within that band. Reversed cards can also score highly. This distribution applies to new draws; previously saved daily scores stay unchanged.

All readings are generated locally for fun, with no server or external API. They are gentle prompts for the day, not predictions or advice about health or money.

## Controls

| Action | Result |
|---|---|
| **Drag** | Pick up and move the pet (falls with gravity when released) |
| **Double Click** | Pet performs a happy dance |
| **Right Click** | Open play, feed, settings, sleep, and **Hide for…** controls |
| **Hide for…** | Choose **10 minutes / 30 minutes / 1 hour / 1 day (24 hours)**; **Back** returns to the main menu |
| **Today's Fortune / 오늘의 운세** | Draw a daily tarot card or review today's saved result |
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
├── language.js       # Browser-language selection and pet dialogue translations
├── fortune.js        # 22 tarot cards, daily state, and serialized local requests
├── fortune-ui.js     # Shared card spread and result panel
├── fortune.css       # Soft and pixel tarot presentation
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
- **Timed hide storage**: `petHiddenUntil` stores an absolute timestamp shared by all tabs. Refreshing or restarting the browser preserves the remaining time. Expiry does not overwrite storage and respects the active-tab and developer-tools visibility rules.
- **Fortune storage**: `fortuneDaily` stores the local date, three offered card IDs, automatic-offer status, and the first chosen card ID/score/slot/direction (`reversed`). New draws use `scoreVersion: 2`; unversioned results retain the original score rules. The background worker serializes requests so simultaneous choices share one result. Translations are applied when displaying it.
- **Language storage**: `petLanguage` is `auto`, `ko`, or `en`; a missing preference means `auto`.
- **Sync**: Monitors `chrome.storage.onChanged` in `content.js` to update all tabs immediately without refresh.
- **Dialogue**: Uses a weighted random selection from the `PET_THOUGHTS` object in `content.js`.

## Development Checks

For birthday checks, open `dev-preview.html` and use **모자 켜기 / 초 불기 (3초)** to compare all pets in both themes. Clicking a preview pet also plays its celebration. Run `node --test tests/*.test.js` for automated checks.

The same preview includes **운세 시연**: choose soft/pixel, Korean/English, and automatic/upright/reversed direction for the next draw. Open the three cards and select one. Changing preview options does not reroll an existing result; **시연 새로 뽑기** resets only the preview's sample result, not your actual daily fortune. The local harness also supports the real fortune request flow and saved daily results.

For timed-hide checks, open `dev-harness.html` in two tabs. Choose **Hide for…**, reload, and check that both pet and bed stay hidden. For a quick expiry check, run `chrome.storage.local.set({ petHiddenUntil: Date.now() + 5000 })` in the harness console and close docked developer tools; the pet should return after five seconds. A day means a full 24 hours, not the next midnight.

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
