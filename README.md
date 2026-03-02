# Noter - Obsidian Plugin

A Flomo-style quick note plugin integrated in Obsidian sidebar, providing a smooth card-based note-taking experience.

## Features

- **Quick Notes**: Simple and clean input box for capturing ideas instantly
- **Tag Management**: Auto-detect `#tags`, support tag filtering and tag cloud
- **Review Mode**: Look back at past notes from specific dates or random walks
- **Local Storage**: Notes stored as local Markdown files, you own your data
- **Beautiful UI**: Card-based design, supports Obsidian themes
- **Search**: Search notes by content or tags

## Installation

### Option 1: Manual Installation (Recommended)

1. Download plugin files
   - Download `main.js`, `manifest.json`, and `styles.css` from GitHub Releases

2. Create plugin directory
   - Find `.obsidian/plugins/` in your Obsidian Vault
   - Create a new folder named `noter`

3. Copy files
   - Copy `main.js`, `manifest.json`, and `styles.css` to the `noter` folder

4. Enable plugin
   - Open Obsidian
   - Go to Settings → Community plugins
   - Turn off "Restricted mode" (if using community plugins for the first time)
   - Find "Noter" in "Installed plugins"
   - Toggle to enable the plugin

### Option 2: Development Installation

```bash
# Clone the repository
git clone <repository-url>
cd noter

# Install dependencies
npm install

# Build the plugin
npm run build

# Copy dist folder to Obsidian plugins directory
cp -r dist/* /path/to/your/vault/.obsidian/plugins/noter/
```

## Usage

### Opening Noter

1. **Click sidebar icon**: Click the pencil icon in Obsidian's right sidebar
2. **Use Command Palette**:
   - Press `Cmd/Ctrl + P`
   - Type "Noter"
   - Select "Open Noter"

### Creating Notes

1. Type your content in the input box at the top
2. Add tags using `#tag` syntax (e.g., `#ideas #work`)
3. Press `Ctrl/Cmd + Enter` or click the send button
4. Notes are automatically saved to the configured folder

### Tag Management

- **View all tags**: All tags displayed below the input box
- **Filter notes**: Click a tag in the tag cloud to show only notes with that tag
- **Clear filter**: Click the selected tag again or click "#All"

### Review Features

1. Click the review button in the top right corner
2. Choose review mode:
   - **On This Day**: View notes from the same date in previous years
   - **Random Walk**: Randomly display 10 old notes
3. Use "Previous"/"Next" to navigate through notes

### Note Operations

- **Expand/Collapse**: Click note card to view full content
- **Edit**: Click edit button to open in Obsidian editor
- **Delete**: Click delete button to remove note
- **Link**: Create connections between notes

## Settings

Go to Settings → Noter to configure:

- **Notes Folder**: Folder path for storing notes (default: `Noter/Notes`)
- **Review Feature**: Enable/disable review button (default: Enabled)
- **Date Format**: Date format for note IDs (default: `YYYY-MM-DD-HHmmss`)
- **Send Key Mode**: Choose shortcut key for sending notes (Enter or Ctrl/Cmd+Enter)

## Storage Format

Notes are stored by date in `YYYY/MM/YYYYMMDD.md` format:

```
Vault/Noter/Notes/
└── 2026/
    └── 03/
        └── 20260301.md  # All notes from March 1st
```

### File Content Format

```markdown
[20260301120000] {ideas,product} [2026-03-01T12:00:00.000Z] Had a great product idea today

---
[20260301143000] {work,meeting} [2026-03-01T14:30:00.000Z] Project meeting scheduled for Wednesday

---
[20260301180000] {reading,growth} [2026-03-01T18:00:00.000Z] Thoughts on "Deep Work"...
```

**Format Explanation**:
- `[ID]` - 14-digit unique identifier
- `{tags}` - Comma-separated tag list
- `[timestamp]` - ISO 8601 formatted creation time
- `content` - Note body, supports Markdown

See: [Storage Format Details](STORAGE_FORMAT.md)

## Development

### Requirements

- Node.js >= 18
- npm >= 9

### Commands

```bash
# Install dependencies
npm install

# Development mode (watch for changes)
npm run dev

# Build production version
npm run build

# Type checking
npm run typecheck

# Clean build files
npm run clean
```

### Project Structure

```
noter/
├── src/
│   ├── main.ts              # Plugin entry point
│   ├── FlomoView.ts         # Main view component
│   ├── styles.css           # Stylesheet
│   ├── services/            # Business logic
│   │   ├── NoteService.ts
│   │   └── TagService.ts
│   └── types/               # Type definitions
│       └── index.ts
├── dist/                    # Build output
├── manifest.json            # Plugin manifest
├── package.json
└── README.md
```

## Tips

### Keyboard Shortcuts

- `Ctrl/Cmd + Enter`: Quick send note
- `Ctrl/Cmd + P` → "Noter": Open Noter panel

### Tag Best Practices

1. **Keep it simple**: Use short tag names (e.g., `#work` instead of `#work-related`)
2. **Hierarchical tags**: Use `/` for hierarchy (e.g., `#project/Noter`)
3. **Consistency**: Maintain consistent tag naming

### Data Backup

Since notes are stored as local Markdown files, you can:

- Use Obsidian Sync
- Use Git for version control
- Use iCloud, Dropbox, or other cloud storage

## Troubleshooting

If you encounter issues:

1. Ensure you're using the latest version of Obsidian
2. Try disabling other plugins to check for conflicts
3. Check console for error messages (`Ctrl/Cmd + Shift + I`)

## License

MIT License

## Acknowledgments

- Inspired by [Flomo](https://flomoapp.com/)
- Built on [Obsidian](https://obsidian.md/)

---

**Enjoy quick note-taking!** 📝
