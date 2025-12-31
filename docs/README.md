# CISCE Platform Component Documentation

This directory contains comprehensive documentation for all reusable components in the CISCE Platform.

## Documentation Structure

```
docs/
├── README.md                     # This file
├── COMPONENT_TEMPLATE.md         # Template for new component docs
└── components/
    ├── Button.md                 # Button component documentation
    ├── Modal.md                  # Modal component documentation
    └── [ComponentName].md        # Additional components
```

## Quick Start

### For Component Users

1. Browse the `components/` directory to find the component you need
2. Read the documentation to understand:
   - Component purpose and use cases
   - Available props and their types
   - Usage examples
   - Accessibility features
   - Known limitations

### For Component Authors

1. Copy `COMPONENT_TEMPLATE.md` as starting point
2. Fill in all sections thoroughly
3. Include practical code examples
4. Document all props with types
5. Cover accessibility requirements
6. List known issues and workarounds
7. Add tests and maintain test coverage

## Documentation Standards

### Required Sections

Every component documentation must include:

- **Overview** - What it does and why it exists
- **Props/Parameters** - Complete type definitions
- **Usage Examples** - Practical, copy-paste ready code
- **Accessibility** - WCAG compliance and keyboard navigation
- **Edge Cases** - Boundary conditions and error handling

### Optional Sections

Include these when relevant:

- **Styling** - Customization options
- **Performance** - Optimization considerations
- **Dependencies** - External and internal dependencies
- **Testing** - Test examples and coverage
- **Migration Guide** - Upgrading from old versions
- **Related Components** - Similar or complementary components

## Writing Guidelines

### Code Examples

- Use TypeScript for all code examples
- Include complete, runnable examples
- Show both basic and advanced usage
- Use realistic variable names
- Comment complex logic

```tsx
// Good: Complete, realistic example
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';

function CreateUserButton() {
  const handleClick = () => {
    console.log('Creating user...');
  };

  return (
    <Button
      variant="primary"
      leftIcon={<Plus className="w-4 h-4" />}
      onClick={handleClick}
    >
      Add New User
    </Button>
  );
}

// Avoid: Incomplete or unclear
<Button onClick={handler}>Text</Button>
```

### Prop Documentation

Always include:
- Prop name and type
- Description of what it does
- Default value (if applicable)
- Example value
- Whether it's required or optional

```markdown
| Prop Name | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `variant` | `'primary' \| 'secondary'` | `'primary'` | Visual style | `"primary"` |
```

### Accessibility Documentation

Document these aspects:
- WCAG compliance level
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- Color contrast ratios
- ARIA attributes used

### Edge Cases

List scenarios that might cause issues:
- Empty or null values
- Very long content
- Rapid interactions
- Network failures (for async components)
- Browser-specific quirks

## Examples

### Complete Documentation Examples

- **[Button.md](./components/Button.md)** - Simple, stateless component
- **[Modal.md](./components/Modal.md)** - Complex, stateful component with portal rendering

### Documentation Checklist

Use this checklist when documenting a new component:

- [ ] Component name and location specified
- [ ] Version and last updated date included
- [ ] Purpose and key features described
- [ ] All props documented with types
- [ ] At least 3 usage examples provided
- [ ] Basic, advanced, and edge case examples included
- [ ] Accessibility section completed
- [ ] WCAG compliance level specified
- [ ] Keyboard navigation documented
- [ ] Screen reader support described
- [ ] Focus management explained
- [ ] Color contrast ratios verified
- [ ] Edge cases and error handling covered
- [ ] Browser compatibility table included
- [ ] Testing examples provided
- [ ] Known issues documented
- [ ] Related components linked
- [ ] Changelog maintained

## Component Documentation Workflow

### Creating New Component Documentation

1. **Start with template**
   ```bash
   cp docs/COMPONENT_TEMPLATE.md docs/components/MyComponent.md
   ```

2. **Fill in basic information**
   - Component name, location, version
   - Purpose and overview
   - Key features

3. **Document the API**
   - All props with types
   - Type definitions
   - Default values

4. **Add examples**
   - Basic usage
   - Common patterns
   - Edge cases

5. **Cover accessibility**
   - WCAG compliance
   - Keyboard support
   - Screen reader testing

6. **Review and test**
   - Verify all examples work
   - Check for completeness
   - Get peer review

### Updating Existing Documentation

1. **Maintain changelog**
   - Document what changed
   - Include version number
   - Add date of change

2. **Update affected sections**
   - Props that changed
   - New examples needed
   - Migration guide if breaking

3. **Version accordingly**
   - Major: Breaking changes
   - Minor: New features
   - Patch: Bug fixes, docs

## Best Practices

### Do's

✅ Write clear, concise descriptions
✅ Provide complete, runnable examples
✅ Document all edge cases
✅ Include accessibility information
✅ Keep examples up-to-date
✅ Link to related components
✅ Maintain changelog

### Don'ts

❌ Skip accessibility section
❌ Use incomplete code examples
❌ Assume prior knowledge
❌ Document implementation details
❌ Forget to update version
❌ Leave TODOs in published docs

## Accessibility Requirements

All components must meet **WCAG 2.1 Level AA** standards:

### Required Documentation

- Keyboard navigation support
- Screen reader compatibility
- Focus management behavior
- Color contrast verification
- ARIA attributes usage

### Testing Checklist

- [ ] Keyboard-only navigation works
- [ ] Screen reader announces correctly
- [ ] Focus visible at all times
- [ ] Color contrast meets AA standards
- [ ] No keyboard traps exist
- [ ] Interactive elements have sufficient size (44x44px minimum)

## Contributing

### Adding New Components

1. Create component in `src/components/`
2. Write comprehensive tests
3. Document using template
4. Get accessibility review
5. Submit pull request

### Improving Documentation

Found unclear documentation? Ways to help:

1. **Fix typos** - Submit PR directly
2. **Add examples** - Show additional use cases
3. **Clarify sections** - Make it easier to understand
4. **Update screenshots** - Keep visuals current
5. **Report issues** - Open GitHub issue

## Resources

### Internal Resources

- Design System Guidelines: `/docs/design-system/`
- Accessibility Standards: `/docs/accessibility/`
- Testing Guide: `/docs/testing/`

### External Resources

- [React Documentation](https://react.dev/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Support

### Getting Help

- **Component questions**: #component-library Slack channel
- **Accessibility questions**: #accessibility-guild
- **Documentation feedback**: Open GitHub issue
- **General questions**: Platform UI Team

### Reporting Issues

When reporting documentation issues:

1. Specify the component name
2. Link to the problematic section
3. Describe what's unclear
4. Suggest improvements if possible

## License

This documentation is part of the CISCE Platform and follows the same license as the main project.

---

**Last Updated:** 2025-12-31
**Maintained By:** Platform UI Team
