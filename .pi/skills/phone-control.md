---
name: phone-control
description: Control an Android phone connected via ADB. Use this skill when the user asks you to operate, check, or interact with their Android phone screen.
---

You have access to tools that control an Android phone connected via ADB. Follow these instructions precisely.

## Core Workflow

Every interaction follows this pattern:

1. **Capture** — Call `phone_capture_ui` to see the current screen
2. **Analyze** — Read the YAML output to understand what's displayed
3. **Act** — Use the appropriate tool to interact with an element
4. **Verify** — Call `phone_capture_ui` again to confirm the result

**Never skip step 1.** Always capture before acting, and always capture after acting to verify.

## Understanding the YAML Output

`phone_capture_ui` returns structured YAML like:

```
- screen:
  - toolbar "My App" [ref=n0]:
    - button "Menu" [ref=n1] [clickable]
  - list "items" [ref=n2] [scrollable]:
    - listitem [ref=n3]:
      - text "Hello"
      - button "Delete" [ref=n4] [clickable]
  - textbox "Search" [ref=n5]
```

Each line: `- role "name" [state] [ref=N] [bounds=x1,y1,x2,y2]`

- **role**: element type (button, text, textbox, list, listitem, link, image, checkbox, switch, combobox, etc.)
- **name**: element's accessible label or displayed text
- **ref**: the identifier you pass to tools (e.g. `n1`, `w3`)
- **state**: clickable, disabled, checked, selected, focused, scrollable, password, etc.
- **bounds**: position in layout coordinates

**WebView screens** have two sections: native tree on top, then `--- Web ---` separator, then web tree with `w`-prefixed refs. Both ref types (`n` and `w`) work with all tools.

**Focused window capture:** The SDK captures the focused window. When a Dialog or PopupWindow is visible, the output shows the popup content (not the main page). Clicking popup elements works via ref as usual.

## Tool Reference

### phone_capture_ui
No parameters. Returns YAML snapshot of the current screen.

### phone_click
Click an element by ref.
- `ref` (required): the element's ref identifier, e.g. `"n1"`

### phone_swipe
Swipe on the screen.
- `direction` (required): `"up"` | `"down"` | `"left"` | `"right"`
- `ref` (optional): swipe within a specific scrollable element

**Direction = finger movement.** `"up"` means finger slides up, content scrolls down (reveals content below). `"down"` means finger slides down, content scrolls up.

### phone_type_text
Type text into an input field.
- `ref` (required): the input element's ref
- `text` (required): text to type
- `clear` (optional, default `true`): clear existing text first

**Tip:** After typing, the on-screen keyboard may cover part of the screen. Call `phone_press_key` with `key="back"` to dismiss it.

### phone_long_press
Long press an element (trigger context menu, selection mode, etc.).
- `ref` (required): the element's ref
- `duration` (optional, default 500): press duration in ms

### phone_check / phone_uncheck
Set a checkbox to checked or unchecked state (idempotent).
- `ref` (required): the checkbox element's ref

For simple toggling, `phone_click` also works on checkboxes.

### phone_select_option
Select an option in a dropdown/combobox.
- `ref` (required): the select element's ref
- `value` (required): the option value to select

### phone_press_key
Press the back key.
- `key` (required): `"back"`

Use to dismiss the on-screen keyboard after typing, close dialogs, or navigate back.

## Common Patterns

### Scroll through a list
```
phone_capture_ui → see list [scrollable] → phone_swipe direction="up" → phone_capture_ui → check new items
```
If the captured UI looks identical after swiping, the list is at its boundary — try the opposite direction.

### Fill a form
```
phone_capture_ui → identify input fields → phone_type_text ref="n5" text="hello" → phone_press_key key="back" (dismiss keyboard) → phone_capture_ui → verify
```

### Handle unknown ref error
If a tool returns "Unknown ref", the screen has changed since your last capture. Call `phone_capture_ui` to get fresh refs and retry.
