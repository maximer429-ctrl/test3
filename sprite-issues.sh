#!/bin/bash
# List sprite-related issues for sprite artists

echo "🎨 Sprite Development Issues"
echo "=============================="
echo ""

echo "📊 Current Status:"
bd list | grep -iE "sprite|theme|ruminant|power|animated|visual|polish" | head -20

echo ""
echo ""
echo "✅ Quick Commands:"
echo "  bd ready                    - See all available work"
echo "  bd show <issue-id>          - View issue details"
echo "  bd update <id> --status in_progress  - Start working"
echo "  bd close <id>               - Mark complete"
echo ""
echo "🔧 Tools:"
echo "  Sprite Viewer: http://localhost:8080/sprite-viewer.html"
echo "  Main Game: http://localhost:8080"
echo ""
echo "📖 Documentation:"
echo "  CONTRIBUTING.md - Full sprite development guide"
echo "  README.md - Project overview"
