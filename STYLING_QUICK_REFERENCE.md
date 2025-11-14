# 🎨 Styling System Quick Reference

## Complete Dashboard Styling System

This document provides a quick visual reference for all styling decisions and patterns used in the Co-app-frontend dashboard.

---

## 🎯 Color System

### Primary Theme Color
```
Hex: #323E3E (nevada[700])
RGB: rgb(50, 56, 62)
Name: Secondary.main
Usage: Headers, primary buttons, links, hover states
```

### Hover/Dark Variant
```
Hex: #000814 (nevada[800]) 
RGB: rgb(0, 8, 20)
Name: Secondary.dark
Usage: Button hover states, active elements
```

### Status Colors

#### Approved ✓
```
Background: #e8f5e9 (green light)
Text: #2e7d32 (green dark)
Border: #c8e6c9 (green medium)
Usage: Success, approved, completed states
```

#### Pending ⏳
```
Background: #fff3e0 (orange light)
Text: #e65100 (orange dark)
Border: #ffe0b2 (orange medium)
Usage: Waiting, in-progress, pending states
```

#### Rejected ✕
```
Background: #ffebee (red light)
Text: #c62828 (red dark)
Border: #ffcdd2 (red medium)
Usage: Failed, rejected, error states
```

#### Pushed Back ↩️
```
Background: #f3e5f5 (purple light)
Text: #6a1b9a (purple dark)
Border: #e1bee7 (purple medium)
Usage: Revised, resubmitted states
```

#### Unknown ⓘ
```
Background: #eeeeee (gray light)
Text: #616161 (gray dark)
Border: #e0e0e0 (gray medium)
Usage: Unknown, unset states
```

---

## 📊 Table Styling

### Header Cell
```
Font Weight: 600
Font Size: 0.875rem
Transform: UPPERCASE
Letter Spacing: 0.5px
Background: #f5f5f5
Border Bottom: 2px solid #e0e0e0
```

### Body Cell
```
Font Size: 0.875rem
Padding: 12px 16px
Border Bottom: 1px solid #f0f0f0
```

### Status Badge
```
Padding: 6px 12px
Border Radius: 12px
Font Size: 0.75rem
Font Weight: 600
Transform: capitalize
Letter Spacing: 0.3px
Border: 1px solid (status color)
```

---

## 🔘 Button System

### Primary Action Button (Contained)
```
Type: contained
Color: secondary.main (#323E3E)
Text Color: white
Font Weight: 500
Font Size: 0.875rem
Transform: none
Padding: 8px 16px
Border Radius: 4px

Hover:
  Background: secondary.dark (#000814)
  
Disabled:
  Background: #ccc
  Color: #999
```

### Secondary Action Button (Outlined)
```
Type: outlined
Border Color: secondary.main
Text Color: secondary.main
Font Weight: 500
Font Size: 0.875rem
Padding: 8px 16px
Border Radius: 4px

Hover:
  Border Color: secondary.dark
  Background: rgba(50, 56, 62, 0.04)
```

### Icon Button
```
Size: small (32x32px)
Color: secondary.main
Font Size: small icons

Hover:
  Background: rgba(50, 56, 62, 0.08)
```

### Icon Button - Destructive (Delete)
```
Color: error.main (#d32f2f)
Hover Background: rgba(211, 47, 47, 0.08)
```

### Icon Button - Positive (Approve)
```
Color: success.main (#388e3c)
Hover Background: rgba(46, 125, 50, 0.08)
```

### Icon Button - Warning (Reject)
```
Color: warning.main (#f57c00)
Hover Background: rgba(245, 127, 23, 0.08)
```

---

## 🎭 Modal Styling

### Dialog Title Header
```
Background: secondary.main (#323E3E)
Color: white
Font Weight: 600
Font Size: 1.1rem
Padding: 2.5rem 3rem
Margin: 0
Border Radius: 12px (top corners)
Display: flex
Justify Content: space-between
Align Items: center
```

### Close Button (in Title)
```
Position: top-right
Icon: CloseIcon
Color: white
Hover Background: rgba(255, 255, 255, 0.1)
Size: Default
```

### Dialog Content
```
Padding: 3rem left/right, 2rem top/bottom
Max Height: 60vh
Overflow: auto
Border Bottom: 1px solid #e0e0e0
```

### Scrollbar (Custom)
```
Width: 6px
Background Track: #f1f1f1
Thumb Color: rgb(5, 5, 68)
Thumb Border Radius: 3px
```

### Section Card (inside Dialog)
```
Border: 1px solid #e0e0e0
Border Radius: 8px
Padding: 3rem
Background: white
Margin Bottom: 3rem
```

### Success State Section
```
Background: #e8f5e9
Border: 1px solid #b9f6ca
Border Radius: 8px
Padding: 2rem
Text Color: #2e7d32
```

### Dialog Action Bar (Bottom)
```
Position: sticky
Bottom: 0
Background: #fafafa
Border Top: 1px solid #e0e0e0
Padding: 2rem
Display: flex
Justify Content: space-between
Align Items: center
```

---

## 🔍 Filter Section

### Container
```
Padding: 2.5rem
Margin Bottom: 2rem
Border Radius: 8px
Background: #fafafa
Box Shadow: 0px 1px 3px rgba(0, 0, 0, 0.08)
Border: 1px solid #e0e0e0
```

### Search Box
```
Display: flex
Align Items: center
Border: 1px solid #e0e0e0
Border Radius: 6px
Padding: 1.5rem left/right, 0.75rem top/bottom
Min Width: 240px
Background: white
Transition: all 0.2s ease

Focus Within:
  Border Color: #06131f
  Box Shadow: 0px 0px 0px 3px rgba(6, 19, 31, 0.1)
```

### Filter Dropdown
```
Min Width: 160px
Border Radius: 6px
Background: white
Font Size: 0.875rem
Font Weight: 500
```

---

## 🏗️ Layout Spacing

### Padding/Margin Scale
```
0.25rem (4px)
0.5rem (8px)
1rem (16px)
1.5rem (24px)
2rem (32px)
2.5rem (40px)
3rem (48px)
```

### Gap Scale (Flexbox)
```
gap: 0.5 (4px) - for action buttons
gap: 1 (8px) - for form fields
gap: 2 (16px) - for sections
gap: 3 (24px) - for major layout
```

---

## 📝 Typography

### Heading (h6)
```
Font Size: 1.25rem
Font Weight: 600
Line Height: 1.334
```

### Subtitle1
```
Font Size: 1rem
Font Weight: 500
```

### Subtitle2
```
Font Size: 0.875rem
Font Weight: 600
```

### Body1
```
Font Size: 1rem
Font Weight: 400
```

### Body2
```
Font Size: 0.875rem
Font Weight: 400
```

### Caption
```
Font Size: 0.75rem
Font Weight: 500
```

---

## ✨ Shadow System

### Subtle Shadow
```
Box Shadow: 0px 1px 3px rgba(0, 0, 0, 0.08)
```

### Medium Shadow
```
Box Shadow: 0px 1px 3px rgba(0, 0, 0, 0.1)
```

### Deep Shadow
```
Box Shadow: 0px 2px 8px rgba(0, 0, 0, 0.15)
```

---

## 🔄 Transition/Animation

### Default Transition
```
Transition: all 0.2s ease
```

### Button Hover
```
Transition: background-color 0.2s ease
```

---

## 🎪 Component Quick Reference

### Table Component
```
Header:     TABLE_STYLES.headerCell
Body Cell:  TABLE_STYLES.bodyCell
Badge:      TABLE_STYLES.statusBadge + STATUS_COLORS
Filter:     FILTER_STYLES.container
Search:     FILTER_STYLES.searchBox
```

### Modal Component
```
Title:      bgcolor: secondary.main, color: white
Close Btn:  CloseIcon, white color
Stepper:    Custom styling with secondary.main colors
Content:    Max height 60vh, custom scrollbar
Section:    border: 1px solid #e0e0e0
Success:    bgcolor: #e8f5e9, color: #2e7d32
Action Bar: position: sticky, bottom: 0
```

### Dialog Component
```
Primary Btn:   variant="contained", bgcolor: secondary.main
Secondary Btn: variant="outlined", borderColor: secondary.main
Icon Btn:      color: secondary.main
Delete Btn:    color: error.main
```

---

## 📋 Icon Usage

### View/Read Actions
```
Icon: VisibilityIcon
Color: secondary.main
Tooltip: "View Details"
```

### Edit Actions
```
Icon: EditIcon
Color: secondary.main
Tooltip: "Edit"
```

### Delete Actions
```
Icon: DeleteIcon
Color: error.main
Tooltip: "Delete"
```

### Approve Actions
```
Icon: CheckCircleIcon
Color: success.main
Tooltip: "Approve"
```

### Reject Actions
```
Icon: CancelIcon
Color: warning.main
Tooltip: "Reject"
```

### Download/Export
```
Icon: DownloadIcon
Color: secondary.main
Tooltip: "Download"
```

### Print
```
Icon: PrintIcon
Color: secondary.main
Tooltip: "Print"
```

### Copy
```
Icon: ContentCopyIcon
Color: secondary.main
Tooltip: "Copy to clipboard"
```

### Close
```
Icon: CloseIcon
Color: white (in header)
Tooltip: "Close"
```

### Check/Success
```
Icon: CheckCircleIcon
Color: success.main (#2e7d32)
Size: 60px
```

---

## ✅ Implementation Checklist

### When Building Tables
- [ ] Use TABLE_STYLES constants
- [ ] Apply STATUS_COLORS for badges
- [ ] Use FILTER_STYLES for filters
- [ ] All actions are IconButtons
- [ ] Every icon has a Tooltip
- [ ] Icons size="small"
- [ ] Proper color from guidelines
- [ ] Hover states implemented

### When Building Modals
- [ ] Dark header with theme color
- [ ] Close button top-right
- [ ] Include stepper if multi-step
- [ ] Scrollable content area
- [ ] Section cards with borders
- [ ] Success state with checkmark
- [ ] Copy button for references
- [ ] Fixed action bar at bottom
- [ ] Proper spacing (2.5rem, 3rem)

### When Styling Dialogs
- [ ] Buttons use correct variant
- [ ] Primary = contained, secondary = outlined
- [ ] Colors from theme palette
- [ ] Proper hover states
- [ ] Icon buttons use secondary.main
- [ ] Destructive actions use error.main
- [ ] Text is not capitalized
- [ ] FontWeight: 500 for buttons

---

## 🚀 Quick Copy-Paste Patterns

### Icon Button Pattern
```tsx
<Tooltip title="Action Description">
  <IconButton 
    onClick={handleAction}
    size="small"
    sx={{
      color: 'secondary.main',
      '&:hover': { bgcolor: 'rgba(50, 56, 62, 0.08)' }
    }}
  >
    <IconName fontSize="small" />
  </IconButton>
</Tooltip>
```

### Status Badge Pattern
```tsx
<Box sx={{
  ...TABLE_STYLES.statusBadge,
  backgroundColor: statusColor.bg,
  color: statusColor.text,
  border: `1px solid ${statusColor.border}`,
}}>
  {status}
</Box>
```

### Primary Button Pattern
```tsx
<Button 
  variant="contained"
  sx={{ 
    bgcolor: 'secondary.main', 
    color: 'white', 
    '&:hover': { bgcolor: 'secondary.dark' }
  }}
>
  Action
</Button>
```

---

## 📞 Support

### Reference Guide
Location: `docs/markdown/PAGE_STYLING_GUIDE.md`

### Example Components
- Table: `src/components/dashboard/useronboard/miner-status-table.tsx`
- Modal: `src/components/dashboard/Transport_cost/add-tax-dialog.tsx`

### Material-UI Docs
- https://mui.com/material-ui/getting-started/
- https://mui.com/material-ui/react-button/
- https://mui.com/material-ui/react-table/

---

**Quick Reference Card**

- **Primary Color**: #323E3E (secondary.main)
- **Dark Color**: #000814 (secondary.dark)
- **Success**: #e8f5e9 bg, #2e7d32 text
- **Error**: #d32f2f
- **Warning**: #f57c00
- **Max Modal Height**: 60vh
- **Border Radius**: 12px (modals), 8px (cards), 4px (buttons)
- **Icon Size**: small
- **Button Padding**: 8px 16px
- **Button FontWeight**: 500

---

**End of Quick Reference**

Version: 1.0.0  
Updated: November 14, 2025  
Status: Complete
