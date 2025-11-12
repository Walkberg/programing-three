Toolbar Actions
================

Small registry and hook for registering toolbar actions at runtime.

API

- registerToolbarAction(id, config) — register an action
- unregisterToolbarAction(id)
- getRegisteredActions() — list actions for UI rendering
- onRegistryChange(cb) — subscribe to registry changes (used by provider)
- useToolbarActions() — React hook wrapper (see src/hooks)

Example

```tsx
import { registerToolbarAction } from "@/components/ToolbarActions/ToolbarActionRegistry";

registerToolbarAction('myaction', { title: 'My Action', category: 'Tools' });
```
