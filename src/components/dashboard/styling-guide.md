# Dialog Component Styling Guide

## Layout Structure
- Use `maxWidth="md"` and `fullWidth` for consistent dialog sizing
- Implement responsive grid layouts with `gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }`
- Group related information in logical sections with clear headings
- Use full-width sections (`gridColumn: '1 / -1'`) for important content

## Typography
- Dialog titles: `fontSize: '1.25rem', fontWeight: 600`
- Section headings: `variant="subtitle2", color="text.secondary", fontWeight: 600`
- Field labels: `variant="subtitle2", fontWeight: 600, color: '#666'`
- Content text: `variant="body1"` for regular content, `variant="body2"` for secondary content

## Spacing
- Consistent padding: `p: 2` for content sections
- Vertical spacing: `mb: 2` between sections, `mb: 1.5` between items
- Button spacing: `gap: 1` between action buttons
- Dialog content padding: `py: 3`

## Colors and Styling
- Border styling: `borderBottom: '1px solid #e0e0e0'` for section dividers
- Background colors: `bgcolor: '#f5f5f5'` for content boxes
- Button colors:
  - Approve: `color="success"`, hover: `#1b5e20`
  - Push Back: `color="warning"`, hover: `#e65100`
  - Reject: `color="error"`, hover: `#b71c1c`

## Components
- Use `DetailItem` helper component for consistent field display
- Use `Chip` components for tags and categories
- Use `Alert` components for success and error messages
- Use `Divider` to separate logical sections
- Use `IconButton` with `CloseIcon` in dialog headers

## Responsive Design
- Use responsive grid layouts
- Ensure buttons have `minWidth: '120px'` for consistent sizing
- Use `flexWrap: 'wrap'` for tag collections

## State Management
- Reset states when dialog opens/closes
- Handle loading, error, and success states consistently
- Disable buttons appropriately based on current state and permissions
