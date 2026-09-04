# SDD-012 Copilot dock UX

## Requirement

Conversational analytics SHALL be delivered primarily via a **global floating dock**, not only a full-page chat route.

### Collapsed

- Circular bubble, fixed **bottom-right**
- Visible on all authenticated demo pages

### Expanded (window)

- Panel large enough for charts (~720×720 default; max viewport-constrained)
- **Resizable** via top-left drag handle (bottom-right anchored window)
- Header: logo, title “Kopilot Analitik”, **fullscreen** toggle, close
- Body: horizontal demo prompt chips, scrollable messages, input
- Assistant text: **character-by-character** typewriter reveal with caret
- Charts / QueryPlan / evidence / breakdowns: show **immediately** with the message (not typewriter)
- Waiting state: three-dot typing indicator while the agent request is pending

### Fullscreen (app)

- Panel fills the viewport **below the sticky app header** (`top-14` / ~56px)
- Bubble hidden while fullscreen
- **Quit fullscreen**: minimize control or `Escape` (Escape exits fullscreen first, then closes)

### Deep links

- `/copilot` and `/copilot?q=<prompt>` SHALL open the dock (queue prompt) and redirect home
- Home flow cards and nav “Kopilot” SHALL call `ask(prompt?)` from `CopilotProvider`

### Modules

- `src/components/copilot/CopilotProvider.tsx` — open / pendingPrompt / ask
- `src/components/copilot/CopilotDock.tsx` — bubble, resize, fullscreen
- `src/components/copilot/CopilotChat.tsx` — messages, typewriter, send

## Acceptance

- Given any page
- When the user opens the bubble and asks a revenue question
- Then the panel shows typewriter text and a chart when payload includes `result`
- And Maximize fills below the header; Minimize restores the floating window
