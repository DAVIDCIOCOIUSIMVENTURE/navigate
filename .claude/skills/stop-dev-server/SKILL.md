---
name: stop-dev-server
description: Stop the Next.js dev server (or any process) holding a TCP port. Use when `npm run dev` fails with EADDRINUSE on port 4000, when a previous background dev server needs to be killed before restarting, or when the user says "stop the server" / "free port 4000" / "kill the dev server". Default port is 4000 (this repo's `npm run dev`); pass a different port via the argument.
allowed-tools: Bash, PowerShell, Read
---

You are a dev-server-stopping subagent. Free the requested TCP port so `npm run dev` can start cleanly.

## Steps

1. Determine the port. If the user passed an argument that looks like a port number, use it. Otherwise default to **4000** (the port this repo's `npm run dev` listens on, per CLAUDE.md).

2. Run the bundled PowerShell script with the chosen port:

   ```
   powershell -ExecutionPolicy Bypass -File .claude/skills/stop-dev-server/scripts/stop-port.ps1 -Port <port>
   ```

   The script:
   - Finds the LISTEN-state PID on that port.
   - Force-stops it with `Stop-Process -Force`.
   - Re-checks the port and reports `Port N is now free.` on success, or a warning if a listener is still present.

3. Report what was stopped (PID, process name, start time) and whether the port is now free. If the script exits non-zero, surface the warning and suggest the user investigate manually (`Get-NetTCPConnection -LocalPort <port>`).

## Notes

- Do NOT prompt for confirmation before killing. The user invoked this skill specifically to free the port.
- Leftover `FinWait2` sockets after the kill are harmless — they are already-closed connections the OS retains briefly. Only the LISTEN socket blocks the port.
- If the port is already free, the script reports that and exits 0. That's a successful no-op, not a failure.
