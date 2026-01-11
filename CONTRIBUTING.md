# Contributing to Habit Tracker

First off, thank you for considering contributing to Habit Tracker! 🎉

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if possible**
- **Note your browser and OS version**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List some examples of how it would be used**

### Pull Requests

1. Fork the repo and create your branch from `main`
2. Make your changes
3. Test your changes thoroughly
4. Update documentation if needed
5. Write clear commit messages
6. Submit a pull request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/habit-tracker.git

# Navigate to the directory
cd habit-tracker

# Create a new branch
git checkout -b feature/your-feature-name

# Make your changes and test

# Commit with a clear message
git commit -m "Add: description of your changes"

# Push to your fork
git push origin feature/your-feature-name
```

## Coding Guidelines

### JavaScript
- Use ES6+ syntax
- Follow consistent indentation (2 spaces)
- Use meaningful variable names
- Add comments for complex logic
- Avoid global variables when possible

### CSS
- Use CSS variables for theming
- Follow BEM naming convention when appropriate
- Keep specificity low
- Add comments for complex selectors

### HTML
- Use semantic HTML5 elements
- Ensure accessibility (ARIA labels, alt text)
- Keep structure clean and organized

## Testing

Before submitting a PR:
- [ ] Test in multiple browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile devices
- [ ] Test dark/light theme switching
- [ ] Test offline functionality (PWA)
- [ ] Verify localStorage operations
- [ ] Check for console errors

## Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Start with a verb (Add, Fix, Update, Remove, Refactor)
- Keep first line under 72 characters
- Reference issues and PRs when relevant

Examples:
```
Add: Pomodoro session categorization
Fix: Theme toggle not working on analytics page
Update: README with new features
Refactor: Simplify calendar rendering logic
```

## Project Structure

Understanding the codebase:
```
routine-tracker/      # Main app pages (HTML)
css/                  # Styling
js/                   # Core logic
  |- app.js          # Main app functionality
  |- pomodoro.js     # Timer logic
  |- analytics.js    # Charts and analytics
  |- routines-data.js # Default data
data/                 # Configuration files
```

## Feature Requests Priority

High Priority:
- Bug fixes
- Performance improvements
- Accessibility enhancements
- Security updates

Medium Priority:
- UI/UX improvements
- New chart types
- Additional analytics

Low Priority:
- New themes
- Additional integrations
- Advanced features

## Questions?

Feel free to open an issue with the label "question" if you need help!

## Recognition

Contributors will be recognized in the README and release notes.

Thank you for contributing! 🚀
