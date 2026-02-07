# Shadcn Component Rules

Guidelines for using and customizing shadcn-vue components in the Taisen project.

## General Principles

- **Prefer shadcn-vue**: Always check if a component is available in shadcn-vue before creating a custom one.
- **MCP first**: ALWAYS use the `shadcnVue` MCP tool to search for existing components or check if a component can be added.
    - Example: `shadcnVue.search_components({ query: "dialog" })`
- **Location**: All shadcn components must reside in `app/components/ui`.
- **Customization**: If a shadcn component needs customization (e.g., specific "cyber" variants), modify the component directly in its `app/components/ui` folder. Do not create separate "Cyber" wrappers unless absolutely necessary for complex logic.
- **Consistent Utils**: Use `@/lib/utils` (specifically the `cn` function) for all class merging.

## MCP Tool Usage

The `shadcnVue` MCP tool is configured in `.vscode/mcp.json`. Use it for:
1. **Discovery**: Search for available shadcn-vue components.
2. **Installation**: Add new components to the project.
3. **Verification**: Check if the current implementation aligns with shadcn-vue standards.

## Project Structure

```
app/components/ui/
├── [component-name]/
│   ├── [ComponentName].vue
│   └── index.ts (for variants and exports)
```

## Styling

- Follow the project's "cyber" aesthetic when customizing variants.
- Use Tailwind CSS variables defined in `tailwind.config.js` and `app/assets/css/main.css`.
- Ensure all interactive elements have unique, descriptive IDs for browser testing.
