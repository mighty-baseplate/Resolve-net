# Contributing to CivicEngage

Thank you for your interest in contributing to CivicEngage! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful and inclusive. We want CivicEngage to be a welcoming community for all contributors.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Run tests and type checking
6. Commit with clear messages
7. Push to your fork
8. Submit a pull request

## Development Workflow

### Setup Development Environment

```bash
npm install
npm run dev
```

The application will start with both client and server running together.

### Type Checking

Before submitting, ensure your code passes type checking:

```bash
npm run check
```

### Code Style

- Use TypeScript for all new code
- Follow the existing code structure and naming conventions
- Write clear, descriptive variable and function names
- Add comments for complex logic only when necessary

## Commit Messages

Write clear, descriptive commit messages:

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters
- Reference issues and pull requests when applicable

Example:
```
Add user profile page

- Implement profile view component
- Add profile API endpoint
- Add tests for profile functionality

Fixes #123
```

## Pull Request Process

1. Update the README.md if you're adding new features
2. Ensure all tests pass and type checking is clean
3. Provide a clear description of the changes
4. Link related issues
5. Respond to review comments promptly

## Project Structure

```
client/          - React frontend application
server/          - Express backend server
shared/          - Shared types and utilities
uploads/         - Uploaded files directory
```

### Client Structure

```
client/src/
├── components/   - Reusable UI components
├── pages/        - Page-level components
├── hooks/        - Custom React hooks
├── lib/          - Utilities and helpers
└── main.tsx      - Entry point
```

### Server Structure

```
server/
├── index.ts      - Server entry point
├── routes.ts     - API route definitions
├── auth.ts       - Authentication logic
├── db.ts         - Database setup
└── storage.ts    - File storage handling
```

## Issues and Discussions

- Use GitHub Issues for bug reports and feature requests
- Follow the issue template provided
- Search for existing issues before creating new ones
- Use clear titles and descriptions

## Testing

While this project doesn't have extensive tests yet, when adding new features:
- Test your changes manually
- Ensure type checking passes
- Test edge cases

## Need Help?

- Check existing documentation
- Look at similar code in the project
- Ask in GitHub Discussions or Issues
- Check pull requests for examples of similar changes

Thank you for contributing to CivicEngage!
