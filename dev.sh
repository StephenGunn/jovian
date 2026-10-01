#!/bin/bash
# Dev session for Jovian Moon
# Starts SvelteKit site and PartyKit multiplayer server in a tmux session

SESSION="jovian-dev"

# If session exists, reattach
if tmux has-session -t "$SESSION" 2>/dev/null; then
    exec ghostty -e tmux attach -t "$SESSION"
fi

# Create new session with website
tmux new-session -d -s "$SESSION" -n "website" -c "$HOME/projects/jovian"
tmux send-keys -t "$SESSION:website" "cd $HOME/projects/jovian && pnpm dev" C-m

# PartyKit multiplayer server
tmux new-window -t "$SESSION" -n "party" -c "$HOME/projects/jovian"
tmux send-keys -t "$SESSION:party" "cd $HOME/projects/jovian && npx partykit dev" C-m

# Focus first window and attach
tmux select-window -t "$SESSION:website"
exec ghostty -e tmux attach -t "$SESSION"
