## Issue Tracking

This project uses **bd (beads)** for issue tracking.

---

## ⚠️ MANDATORY: ISSUE-FIRST WORKFLOW ⚠️

**BEFORE ANY CODE CHANGES, YOU MUST:**

1. ✋ **STOP** - Do you have an issue for this work?
2. ❌ **NO ISSUE?** → CREATE ONE FIRST (`bd create`)
3. ✅ **HAVE ISSUE?** → CLAIM IT (`bd update <id> --claim`)
4. 📝 **ONLY THEN** → Write code

**NEVER write code without an active, claimed issue.**

If the user asks for implementation and no issue exists, CREATE THE ISSUE FIRST, then implement.

---

**Quick reference:**
- `bd ready` - Find unblocked work
- `bd create "Title" --type task --priority 2` - Create issue
- `bd update <id> --claim` - Claim issue (sets status to in_progress)
- `bd close <id>` - Complete work
- `bd sync` - Sync with git (run at session end)