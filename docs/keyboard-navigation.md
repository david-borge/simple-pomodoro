# Keyboard navigation guide

This guide covers the main Pomodoro screen in `projects/simple-pomodoro`. Keep the browser's normal focus order and the keyboard behavior built into Ionic controls; add custom key handling only for a clearly defined app shortcut.

## Current controls

- The Edit, Start/Pause, and Cancel controls are `ion-button` elements. Ionic renders these as native buttons, so Tab, Shift+Tab, Enter, and Space work without custom key handlers.
- Timer editing uses `ion-picker-column`. When focused, Ionic supports Arrow Up/Down, Page Up/Down, Home, and End.
- The screen already uses `inert` and `aria-hidden` on several changing regions. Keep them in sync when changing which region is available.

Relevant templates:

- [`simple-pomodoro.page.html`](../projects/simple-pomodoro/src/app/pages/simple-pomodoro/simple-pomodoro.page.html)
- [`timer-and-circle.component.html`](../projects/simple-pomodoro/src/app/components/timer-and-circle/timer-and-circle.component.html)
- [`timer-controls-start-pause-cancel.component.html`](../projects/simple-pomodoro/src/app/components/timer-controls-start-pause-cancel/timer-controls-start-pause-cancel.component.html)
- [`timer-edit.component.html`](../projects/simple-pomodoro/src/app/components/timer-edit/timer-edit.component.html)

## Implementation steps

1. **Keep controls semantic.** Use `ion-button` for actions and links for navigation. Do not add `tabindex` to decorative timer, circle, session bullets, or layout containers. Do not add custom Enter/Space handlers to buttons; that can trigger an action twice.

2. **Preserve a predictable Tab order.** Follow the visual task order: Edit when the timer is idle, the duration picker while editing, then the timer action buttons. When paused, Cancel should be reachable before Start/Continue, matching its DOM order. Avoid positive `tabindex` values.

3. **Remove unavailable content from focus.** When a whole region is inactive, set `inert` on its container as well as `aria-hidden="true"` for assistive technology. `aria-hidden` alone does not prevent keyboard focus. For a single unavailable action, keep the button disabled and make sure its surrounding region does not leave an unreachable focus stop.

4. **Manage focus when editing opens or closes.** On Edit, move focus to the timer-duration picker column and give that column an accessible name such as “Timer duration.” When editing ends, return focus to Edit if it is still available; otherwise move it to the next sensible control, usually Start. The current picker updates the timer immediately when its value changes, so decide whether Escape exits while keeping the new value or restores the previous value before implementing Escape behavior.

5. **Use Ionic's picker keys.** Let `ion-picker-column` handle Arrow Up/Down, Page Up/Down, Home, and End. Do not attach competing key handlers to the picker. Verify this against the installed Ionic version when changing Ionic dependencies.

6. **Add shortcuts only when they help.** Tab navigation is the baseline. If adding a global shortcut such as Space to start/pause, ignore events from buttons, inputs, editable content, and the picker; ignore modified or repeated key events; and call `preventDefault()` only when the shortcut is actually handled. Never let a shortcut fire while focus is on a control whose own key behavior should take precedence. In Angular, use the component `host` event binding for a global listener.

7. **Keep focus visible.** Do not remove browser or Ionic focus indicators. Check focus contrast against both focus and rest session colors, and ensure focus is not hidden by the timer layout or scrolling.

## Manual keyboard pass

With a desktop browser, reload the app and use only the keyboard:

1. Tab and Shift+Tab through the idle screen; verify each focus stop is visible and has an understandable name.
2. Press Enter or Space on Edit. Confirm focus enters the duration picker and changing the value updates the timer.
3. Use Arrow Up/Down, Page Up/Down, Home, and End in the picker. Confirm focus stays in the picker while its value changes.
4. Tab out of editing and through Start/Pause. Start, pause, and resume; verify the Cancel button becomes available only while paused and can be activated by keyboard.
5. Check that hidden/inactive controls never receive focus and that focus is restored sensibly after each state change.

## References

- [Ionic button accessibility](https://ionicframework.com/docs/api/button)
- [Ionic picker accessibility and keyboard interactions](https://ionicframework.com/docs/api/picker)
- [Angular template event binding and keyboard modifiers](https://angular.dev/guide/templates/event-binding)
