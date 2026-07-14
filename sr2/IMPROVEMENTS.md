# Screen Recorder — Improvements

## 1. Settings Persistence
Toggle states, cam position, and cam size are saved to `localStorage` and restored on page load. Repeat users no longer need to re-configure on every visit.

## 2. Auto-Timestamp Filename
Default filename is now `screenRecording-YYYY-MM-DD-HH-MM` so downloads never silently overwrite each other.

## 3. Embedded Playback in Panel
After recording stops, a `<video>` preview appears directly inside the settings panel. A Download button sits alongside it — no new blank window required.

## 4. Styled Error / Permission Messages
`alert()` calls replaced with a dismissible in-panel error banner (red strip). The common "permission denied" case shows a targeted help message linking to the permission guide image.

## 5. Device Selector for Mic / Camera
`<select>` dropdowns (populated via `enumerateDevices()`) appear under the Mic and Camera toggles so users can pick from available audio inputs and cameras — useful with multiple mics or external webcams.

## 6. Countdown ON by Default
`useCountdown` now defaults to `true`. Recording no longer starts instantly on click — the 3-second countdown gives time to switch to the target window.

## 7. ARIA Labels & Keyboard Accessibility
All icon buttons (Record, Pause, Stop, Pop-out, Settings) have `aria-label` attributes so screen readers announce meaningful names.

## 8. Touch Drag Support
`touchstart` / `touchmove` / `touchend` handlers mirror the existing mouse drag, making the floating panel repositionable on touch screens and tablets.
