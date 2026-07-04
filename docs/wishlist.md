# Wishlist

Ideas and features the AI can add to this list.

## Format

- Each item should be a brief description
- Include context on why it would be useful
- AI can add items here when it identifies opportunities during work

## Items

- **Enhance `task complete` to accept optional message**: Agents try `aip task complete "message"` but the message gets interpreted as a task slug. Either make the alias smarter (detect trailing positional → convert to `--log`), or add `task finish "msg"` → `task update --status done --log "msg"`. Evidence: 2026-07-02 agent tried positional, failed, then learned to use `--message` flag.
