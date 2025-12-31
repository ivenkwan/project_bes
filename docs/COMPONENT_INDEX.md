# Component Index

Quick reference guide to all documented components in the CISCE Platform.

## UI Components

### Actions & Controls

| Component | Purpose | Documentation |
|-----------|---------|---------------|
| **[Button](./components/Button.md)** | Clickable action element with variants and states | [View Docs](./components/Button.md) |

### Overlays & Modals

| Component | Purpose | Documentation |
|-----------|---------|---------------|
| **[Modal](./components/Modal.md)** | Dialog overlay for focused user interactions | [View Docs](./components/Modal.md) |

## Coming Soon

The following components will be documented:

### Forms & Inputs

- [ ] Input - Text input field
- [ ] Select - Dropdown selection
- [ ] Checkbox - Binary selection control
- [ ] Radio - Single selection from group
- [ ] Switch - Toggle control
- [ ] TextArea - Multi-line text input
- [ ] FileUpload - File selection and upload

### Data Display

- [ ] Table - Data table with sorting and filtering
- [ ] Card - Content container
- [ ] Badge - Status indicator
- [ ] Avatar - User profile image
- [ ] Tooltip - Contextual information
- [ ] Alert - Notification message
- [ ] Toast - Temporary notification

### Navigation

- [ ] Tabs - Tabbed content navigation
- [ ] Breadcrumb - Hierarchical navigation
- [ ] Pagination - Page navigation control
- [ ] Dropdown - Menu with actions
- [ ] Sidebar - Side navigation panel

### Layout

- [ ] Container - Responsive content wrapper
- [ ] Grid - Grid layout system
- [ ] Stack - Vertical/horizontal stack
- [ ] Divider - Content separator

### Feedback

- [ ] Spinner - Loading indicator
- [ ] ProgressBar - Progress visualization
- [ ] Skeleton - Loading placeholder
- [ ] EmptyState - No data placeholder

## Component Categories

### By Complexity

**Simple Components** (Stateless, no dependencies)
- Button
- Badge
- Avatar
- Divider

**Medium Components** (Some state, few dependencies)
- Input
- Select
- Checkbox
- Card
- Alert

**Complex Components** (Stateful, multiple dependencies)
- Modal
- Table
- Dropdown
- FileUpload
- DatePicker

### By Accessibility Priority

**High Priority** (Requires careful accessibility implementation)
- Modal
- Dropdown
- Tabs
- Table
- Form inputs

**Medium Priority**
- Tooltip
- Alert
- Toast
- Pagination

**Standard Priority** (Basic accessibility requirements)
- Button
- Card
- Badge
- Avatar

## Quick Links

- [Component Template](./COMPONENT_TEMPLATE.md) - Template for new documentation
- [Documentation README](./README.md) - Documentation guidelines
- [Design System](../README.md) - Overall design system documentation

## Usage Statistics

Popular components by usage (approximate):

1. Button - Used in ~80% of pages
2. Modal - Used in ~60% of pages
3. Input - Used in ~50% of pages
4. Card - Used in ~40% of pages
5. Table - Used in ~30% of pages

## Component Decision Tree

**Need user interaction?**
- Yes → Button, Input, Select
- No → Card, Badge, Text

**Need to show data?**
- List/Table format → Table
- Individual items → Card
- Status/Category → Badge

**Need user attention?**
- Blocking → Modal
- Non-blocking → Toast, Alert
- Contextual → Tooltip

**Need navigation?**
- Between sections → Tabs
- Between pages → Pagination, Breadcrumb
- Menu of actions → Dropdown

## Component Relationships

```
Button
  ├─ Used in: Modal, Alert, Card
  └─ Related to: IconButton, LinkButton

Modal
  ├─ Contains: Button, Form inputs
  └─ Related to: Drawer, Dialog

Table
  ├─ Contains: Button, Badge, Checkbox
  └─ Related to: Pagination, Card

Form Inputs (Input, Select, etc.)
  ├─ Used in: Modal, Card, Forms
  └─ Related to: Button, Alert
```

## Naming Conventions

Components follow these naming patterns:

- **Action verbs**: Button, Link, Toggle
- **Descriptive nouns**: Modal, Card, Table
- **Purpose-based**: FileUpload, ColorPicker
- **Avoid**: Generic names like "Component" or "Element"

## Version History

| Component | Current Version | Last Updated |
|-----------|----------------|--------------|
| Button | 1.0.0 | 2025-12-31 |
| Modal | 1.0.0 | 2025-12-31 |

## Contributing

To add a new component to this index:

1. Create component documentation using the template
2. Add entry to appropriate category above
3. Update component count
4. Add to relationships diagram if applicable
5. Submit pull request

---

**Last Updated:** 2025-12-31
**Total Components Documented:** 2
**Components Planned:** 25+
