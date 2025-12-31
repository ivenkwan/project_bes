# Modal Component

**Location:** `src/components/ui/Modal.tsx`

**Version:** 1.0.0

**Last Updated:** 2025-12-31

---

## Overview

### Purpose

The Modal component provides a reusable, accessible dialog implementation for displaying content in an overlay that requires user attention or action. It follows WAI-ARIA dialog patterns and provides consistent modal behavior across the CISCE Platform.

### Visual Preview

```
┌────────────────────────────────────────────────────────┐
│                  [Full Screen Overlay]                  │
│                                                         │
│        ┌──────────────────────────────────┐            │
│        │  ×                              │            │
│        │  Modal Title                    │  [Header]  │
│        ├──────────────────────────────────┤            │
│        │                                  │            │
│        │  Modal content goes here...     │  [Body]    │
│        │                                  │            │
│        │  - Can include forms            │            │
│        │  - Lists                         │            │
│        │  - Any React components          │            │
│        │                                  │            │
│        ├──────────────────────────────────┤            │
│        │          [Cancel] [Confirm]      │  [Footer]  │
│        └──────────────────────────────────┘            │
│                                                         │
└────────────────────────────────────────────────────────┘
```

### Key Features

- Overlay backdrop with configurable opacity
- Click-outside-to-close (optional)
- Escape key to close
- Focus trap within modal
- Focus restoration on close
- Scrollable content area
- Customizable size (small, medium, large, full)
- Header with close button
- Optional footer for actions
- Animation on open/close
- Portal rendering to body
- Prevents background scroll

---

## Props/Parameters

### Required Props

| Prop Name | Type | Description | Example |
|-----------|------|-------------|---------|
| `isOpen` | `boolean` | Controls modal visibility | `true` |
| `onClose` | `() => void` | Callback when modal should close | `() => setOpen(false)` |
| `children` | `ReactNode` | Modal content | `<div>Content</div>` |

### Optional Props

| Prop Name | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `title` | `string` | `undefined` | Modal header title | `"Confirm Action"` |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'` | Modal width | `"lg"` |
| `showCloseButton` | `boolean` | `true` | Show X button in header | `true` |
| `closeOnOverlayClick` | `boolean` | `true` | Close when clicking backdrop | `false` |
| `closeOnEscape` | `boolean` | `true` | Close when pressing Escape | `true` |
| `footer` | `ReactNode` | `undefined` | Footer content (usually buttons) | `<Button>OK</Button>` |
| `initialFocus` | `RefObject<HTMLElement>` | `undefined` | Element to focus on open | `buttonRef` |
| `className` | `string` | `''` | Additional CSS classes for content | `"p-6"` |
| `overlayClassName` | `string` | `''` | Additional CSS classes for overlay | `"bg-black"` |
| `preventBackgroundScroll` | `boolean` | `true` | Prevent body scroll when open | `true` |
| `ariaDescribedBy` | `string` | `undefined` | ID of element describing modal | `"modal-desc"` |

### Type Definitions

```typescript
import { ReactNode, RefObject } from 'react';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  size?: ModalSize;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  footer?: ReactNode;
  initialFocus?: RefObject<HTMLElement>;
  className?: string;
  overlayClassName?: string;
  preventBackgroundScroll?: boolean;
  ariaDescribedBy?: string;
}
```

---

## Usage Examples

### Basic Usage

```tsx
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

function BasicExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Open Modal
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Basic Modal"
      >
        <p>This is the modal content.</p>
      </Modal>
    </>
  );
}
```

### Confirmation Modal

```tsx
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

function ConfirmationModal() {
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = () => {
    // Perform delete action
    setIsOpen(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Confirm Deletion"
      size="sm"
      footer={
        <div className="flex justify-end space-x-3">
          <Button
            variant="secondary"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      }
    >
      <p>Are you sure you want to delete this item? This action cannot be undone.</p>
    </Modal>
  );
}
```

### Form Modal

```tsx
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

function FormModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Submit form
    await saveData(formData);
    setIsOpen(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Add New User"
      size="md"
      closeOnOverlayClick={false}
      footer={
        <div className="flex justify-end space-x-3">
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" form="user-form">
            Save
          </Button>
        </div>
      }
    >
      <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
      </form>
    </Modal>
  );
}
```

### With Initial Focus

```tsx
import { useState, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

function FocusExample() {
  const [isOpen, setIsOpen] = useState(false);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Important Action"
      initialFocus={confirmButtonRef}
    >
      <p>Please confirm this action.</p>
      <div className="flex justify-end space-x-3 mt-4">
        <Button variant="secondary" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
        <Button ref={confirmButtonRef} variant="primary">
          Confirm
        </Button>
      </div>
    </Modal>
  );
}
```

### Large Content with Scrolling

```tsx
import { Modal } from '@/components/ui/Modal';

function ScrollingModal({ isOpen, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Terms and Conditions"
      size="lg"
    >
      <div className="space-y-4 max-h-96 overflow-y-auto">
        <p>Lorem ipsum dolor sit amet...</p>
        <p>Consectetur adipiscing elit...</p>
        {/* Long content that scrolls */}
      </div>
    </Modal>
  );
}
```

### Common Patterns

#### Pattern 1: Critical Action Warning
```tsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Warning"
  size="sm"
  closeOnOverlayClick={false}
  closeOnEscape={false}
>
  <div className="flex items-start space-x-3">
    <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
    <div>
      <p className="text-sm text-gray-900">
        This action requires your attention and cannot be cancelled.
      </p>
    </div>
  </div>
</Modal>
```

#### Pattern 2: Multi-Step Wizard
```tsx
const [step, setStep] = useState(1);

<Modal
  isOpen={isOpen}
  onClose={onClose}
  title={`Step ${step} of 3`}
  footer={
    <div className="flex justify-between w-full">
      <Button
        variant="ghost"
        onClick={() => setStep(step - 1)}
        disabled={step === 1}
      >
        Back
      </Button>
      <Button onClick={() => setStep(step + 1)}>
        {step === 3 ? 'Finish' : 'Next'}
      </Button>
    </div>
  }
>
  {/* Step content */}
</Modal>
```

#### Pattern 3: Detail View Modal
```tsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title={item.name}
  size="xl"
>
  <div className="grid grid-cols-2 gap-6">
    <div>
      <h3 className="font-medium mb-2">Details</h3>
      {/* Details content */}
    </div>
    <div>
      <h3 className="font-medium mb-2">Activity</h3>
      {/* Activity content */}
    </div>
  </div>
</Modal>
```

---

## Styling

### Default Styles

The Modal component uses Tailwind CSS with the following default styling:
- Overlay: Semi-transparent dark background (`bg-black bg-opacity-50`)
- Content: White background with rounded corners and shadow
- Animation: Fade in/out with scale transform
- Positioning: Centered vertically and horizontally
- Z-index: High value to appear above other content

### Customization

```tsx
// Custom modal content styling
<Modal
  isOpen={isOpen}
  onClose={onClose}
  className="bg-gray-50 rounded-xl"
>
  {/* Content */}
</Modal>

// Custom overlay styling
<Modal
  isOpen={isOpen}
  onClose={onClose}
  overlayClassName="bg-blue-900 bg-opacity-75"
>
  {/* Content */}
</Modal>
```

### Size Variants

| Size | Max Width | Usage |
|------|-----------|-------|
| `sm` | `400px` | Small confirmations, simple alerts |
| `md` | `500px` | Default, forms with few fields |
| `lg` | `700px` | Forms with many fields, detail views |
| `xl` | `900px` | Complex layouts, multiple columns |
| `full` | `95vw` | Maximum screen usage, dashboards |

---

## Accessibility

### WCAG Compliance

- **Level:** AA
- **Standards Met:**
  - 2.1.2 No Keyboard Trap - Users can navigate and exit modal
  - 2.4.3 Focus Order - Logical focus order maintained
  - 3.2.1 On Focus - No context changes on focus
  - 4.1.2 Name, Role, Value - Proper dialog role and labels

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Escape` | Closes the modal (if closeOnEscape is true) |
| `Tab` | Cycles focus through focusable elements within modal |
| `Shift + Tab` | Cycles focus backward through modal elements |

### Screen Reader Support

- Modal uses `role="dialog"` for proper semantics
- `aria-modal="true"` indicates modal behavior
- `aria-labelledby` links to title for accessible name
- `aria-describedby` links to description if provided
- Focus moved to modal on open (announces dialog)
- Background content marked `aria-hidden="true"`
- Close button has `aria-label="Close dialog"`

### Focus Management

- Focus trapped within modal when open
- Initial focus on first focusable element (or `initialFocus` ref)
- Focus returns to trigger element on close
- Close button always focusable
- Tab cycles only through modal elements

### Color Contrast

- Title text: 7:1 contrast ratio (AAA)
- Body text: 4.5:1 minimum (AA)
- Close button: 3:1 for icon (AA)
- Overlay provides sufficient separation from background
- All interactive elements meet contrast requirements

---

## Edge Cases & Error Handling

### Edge Case 1: Modal Opens on Page Load

**Scenario:** `isOpen` is true on initial render

**Expected Behavior:** Modal opens immediately, focus trapped correctly

**Example:**
```tsx
const [isOpen] = useState(true); // Opens on mount

<Modal isOpen={isOpen} onClose={onClose}>
  Welcome message
</Modal>
```

### Edge Case 2: Nested Modals

**Scenario:** Opening a modal from within another modal

**Expected Behavior:** Both modals render, latest has highest z-index, focus trapped in topmost

**Note:** While supported, nested modals should be avoided for better UX

```tsx
<Modal isOpen={isOpen1} onClose={closeFirst}>
  <Button onClick={() => setIsOpen2(true)}>Open Second</Button>

  <Modal isOpen={isOpen2} onClose={closeSecond}>
    Second modal content
  </Modal>
</Modal>
```

### Edge Case 3: Content Taller Than Viewport

**Scenario:** Modal content exceeds available screen height

**Expected Behavior:** Modal body scrolls while header/footer remain fixed

**Example:**
```tsx
<Modal isOpen={isOpen} onClose={onClose}>
  <div style={{ height: '2000px' }}>
    Very long content...
  </div>
</Modal>
```

### Edge Case 4: No Focusable Elements

**Scenario:** Modal contains only static text, no buttons

**Expected Behavior:** Focus placed on close button or modal container

### Edge Case 5: Rapid Open/Close

**Scenario:** Modal opened and closed quickly in succession

**Expected Behavior:** Cleanup properly handled, no memory leaks, focus restored

### Error States

| Error Condition | Component Behavior | User Feedback |
|-----------------|-------------------|---------------|
| Missing onClose | Console error in dev | Modal can't be closed |
| isOpen undefined | Treated as false | Modal not shown |
| Children is null | Empty modal shown | Blank content area |
| Invalid size prop | Falls back to 'md' | Default size used |

### Boundary Conditions

- **Mobile viewport:** Modal adjusts to smaller screens, may be full-screen
- **No title:** Header still renders with close button
- **No footer:** Footer area not rendered
- **Empty children:** Modal displays but empty
- **Unmount while open:** Properly cleans up event listeners and body scroll lock

---

## Performance Considerations

### Rendering

- Uses `React.createPortal` for rendering outside component hierarchy
- Only renders when `isOpen` is true
- Animation handled with CSS transitions
- No virtual DOM reconciliation of background content

### Best Practices

- **Use when:** User attention required, confirmation needed, complex forms
- **Avoid when:** Simple tooltips, non-critical information, frequent actions
- **Optimize by:**
  - Lazy load modal content if heavy
  - Memoize modal children if they don't need updates
  - Avoid nesting modals when possible

```tsx
// Good: Lazy load heavy content
const HeavyContent = lazy(() => import('./HeavyContent'));

<Modal isOpen={isOpen} onClose={onClose}>
  <Suspense fallback={<Spinner />}>
    <HeavyContent />
  </Suspense>
</Modal>
```

---

## Dependencies

### External Libraries

- `react@18.2.0` - Core React library
- `react-dom@18.2.0` - Portal rendering
- `focus-trap-react@^10.0.0` - Focus trapping functionality

### Internal Dependencies

- `clsx@2.1.0` - Conditional className utility
- `tailwind-merge@2.2.1` - Tailwind class merging
- `@/hooks/useBodyScrollLock` - Prevent background scrolling
- `@/hooks/useKeyPress` - Escape key detection

### Browser APIs Used

- `document.body` - Portal mounting point
- `document.activeElement` - Focus restoration
- `window.addEventListener` - Escape key listener
- `IntersectionObserver` - Scroll detection (optional)

---

## Testing

### Unit Tests

Location: `src/components/ui/__tests__/Modal.test.tsx`

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

describe('Modal', () => {
  it('should not render when closed', () => {
    render(
      <Modal isOpen={false} onClose={() => {}}>
        Content
      </Modal>
    );
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('should render when open', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        Content
      </Modal>
    );
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should call onClose when close button clicked', () => {
    const handleClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test">
        Content
      </Modal>
    );

    fireEvent.click(screen.getByLabelText('Close dialog'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Escape pressed', () => {
    const handleClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={handleClose}>
        Content
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when overlay clicked', () => {
    const handleClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={handleClose}>
        Content
      </Modal>
    );

    fireEvent.click(screen.getByRole('dialog').parentElement);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should not close on overlay click when disabled', () => {
    const handleClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} closeOnOverlayClick={false}>
        Content
      </Modal>
    );

    fireEvent.click(screen.getByRole('dialog').parentElement);
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('should trap focus within modal', async () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <button>First</button>
        <button>Last</button>
      </Modal>
    );

    const first = screen.getByText('First');
    const last = screen.getByText('Last');

    first.focus();
    await userEvent.tab();
    expect(last).toHaveFocus();

    await userEvent.tab();
    expect(first).toHaveFocus(); // Wrapped back to first
  });
});
```

### Test Coverage

- [x] Renders when open
- [x] Does not render when closed
- [x] Closes on close button click
- [x] Closes on Escape key
- [x] Closes on overlay click
- [x] Respects closeOnOverlayClick prop
- [x] Respects closeOnEscape prop
- [x] Traps focus within modal
- [x] Restores focus on close
- [x] Prevents background scroll
- [x] Applies correct size classes
- [x] Renders title and footer
- [x] Sets proper ARIA attributes

---

## Browser Compatibility

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome | 90+ | Fully supported |
| Firefox | 88+ | Fully supported |
| Safari | 14+ | Fully supported, focus trap may need polyfill |
| Edge | 90+ | Fully supported |
| Mobile Safari | iOS 14+ | Fully supported |
| Chrome Mobile | Android 90+ | Fully supported |

**Note:** Focus trap requires IntersectionObserver support (all modern browsers)

---

## Known Issues

### Issue 1: iOS Safari Scroll Bounce

**Description:** On iOS Safari, background may still scroll slightly despite scroll lock

**Workaround:** Apply `touch-action: none` to body when modal open

**Tracking:** Inherent iOS behavior, CSS workaround applied

### Issue 2: VoiceOver Double Announcement

**Description:** VoiceOver may announce modal title twice on open

**Workaround:** None needed, user feedback indicates this is acceptable

**Tracking:** N/A

---

## Migration Guide

### From Legacy Modal

```tsx
// Old way (deprecated)
<LegacyModal
  visible={isOpen}
  onHide={onClose}
  header="Title"
>
  Content
</LegacyModal>

// New way (current)
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Title"
>
  Content
</Modal>
```

### Prop Name Changes

- `visible` → `isOpen`
- `onHide` → `onClose`
- `header` → `title`
- `closable` → `showCloseButton`
- `maskClosable` → `closeOnOverlayClick`

---

## Related Components

- [Dialog](./Dialog.md) - Simpler confirmation dialogs
- [Drawer](./Drawer.md) - Slide-in panel from screen edge
- [Alert](./Alert.md) - Simple inline notifications
- [Toast](./Toast.md) - Temporary notifications

---

## Changelog

### Version 1.0.0 (2025-12-31)
- Initial release
- Support for sm, md, lg, xl, and full sizes
- Focus trap implementation
- Escape key handling
- Overlay click handling
- Background scroll prevention
- Portal rendering
- Full accessibility compliance (WCAG AA)
- Comprehensive test coverage

---

## Contributing

Guidelines for contributing improvements to this component:

1. Maintain accessibility standards
2. Test focus management thoroughly
3. Ensure keyboard navigation works in all scenarios
4. Add tests for any new features
5. Update documentation
6. Test on mobile devices
7. Verify screen reader compatibility

---

## Support

For questions or issues with this component:
- Component owner: Platform UI Team
- GitHub: [Open an issue](https://github.com/org/repo/issues)
- Accessibility questions: #accessibility-guild
- Internal docs: Design system accessibility guidelines
