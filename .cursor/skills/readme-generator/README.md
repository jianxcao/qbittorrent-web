# README Generator Skill

Comprehensive skill for generating bilingual (English + Chinese) README documentation for projects.

## What This Skill Does

This skill teaches the AI agent how to:
- Analyze project structure and dependencies
- Generate comprehensive README.md files
- Create accurate Chinese translations (README.zh-CN.md)
- Maintain consistency between language versions
- Follow documentation best practices
- Validate all content for accuracy

## Files in This Skill

| File | Purpose | Lines |
|------|---------|-------|
| **SKILL.md** | Main instructions and workflow | ~540 |
| **templates.md** | Section-by-section templates | ~450 |
| **translation-guide.md** | Chinese translation guidelines | ~550 |
| **examples.md** | Complete README examples | ~700 |
| **quick-reference.md** | Fast reference checklist | ~150 |

## When This Skill Activates

The agent will automatically use this skill when you:
- Ask to "generate README"
- Request to "create documentation"
- Mention "README.md" or "README.zh-CN.md"
- Ask to "update project documentation"

## Usage Examples

```
"Generate README for this project"
"Create bilingual README documentation"
"Update the README with new features"
"Generate README.md and README.zh-CN.md"
```

## Key Features

### 📋 Comprehensive Analysis
- Reads package.json, project structure, existing docs
- Identifies tech stack and dependencies
- Discovers special features (Docker, i18n, etc.)

### 🌍 Bilingual Support
- Generates English README.md first
- Translates to Chinese README.zh-CN.md
- Maintains technical accuracy in both languages
- Adds language switcher links

### ✅ Quality Validation
- Verifies all commands exist
- Validates file paths
- Checks version numbers
- Tests all links

### 🎨 Template-Based
- Provides templates for different project types
- Includes section-specific examples
- Offers complete README examples

## Skill Design Principles

This skill follows best practices:

1. **Progressive Disclosure**: Main instructions in SKILL.md, detailed reference in separate files
2. **Concise Main File**: SKILL.md is ~540 lines (close to 500 line target)
3. **Action-Oriented**: Clear workflow with checklists
4. **Example-Rich**: Multiple complete examples provided
5. **Third-Person Description**: Clear trigger scenarios in metadata

## Generated README Structure

Standard README includes:

```
# Title + Badges
[Language switcher]

## Description
## Features
## Installation
## Usage
## Development
  - Project Structure
  - Available Scripts
  - Tech Stack
## Configuration (if needed)
## Docker Deployment (if applicable)
## Internationalization (if applicable)
## Contributing
## License
## Acknowledgments
```

## Translation Approach

- **Keep unchanged**: Package names, commands, code, paths, URLs
- **Translate**: Descriptions, explanations, headings
- **Add context**: English in parentheses for ambiguous terms
- **Use proper terms**: Established Chinese technical terminology
- **Maintain spacing**: Space between Chinese and English text

## Output Format

The agent will generate two files:
1. `README.md` - English version
2. `README.zh-CN.md` - Chinese version

Both files include:
- Language switcher at top
- Identical structure
- Consistent formatting
- Working links in both languages

## Quality Guarantees

Before presenting READMEs, the agent validates:
- ✅ All commands exist in package.json
- ✅ All file paths match actual structure  
- ✅ Version numbers are current
- ✅ All links work
- ✅ Both languages have same sections
- ✅ Code blocks are identical
- ✅ No placeholder text (TODO, FIXME)

## Integration with Your Project

This skill is designed for the qb-web project but adapts to any project by:
- Reading project-specific configuration
- Analyzing actual code structure
- Following existing documentation style
- Matching commit conventions

## Further Reading

- [SKILL.md](SKILL.md) - Complete workflow and instructions
- [templates.md](templates.md) - Section templates and examples
- [translation-guide.md](translation-guide.md) - Chinese translation rules
- [examples.md](examples.md) - Full README examples
- [quick-reference.md](quick-reference.md) - Quick checklist

---

**Skill Version**: 1.0.0  
**Created**: 2026-01-23  
**Project**: qb-web  
**Scope**: Project-level skill (shareable with team)
