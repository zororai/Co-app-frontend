# Driver ID Card Implementation Summary

## Overview
This document summarizes the implementation of the passport photo upload, driver ID card generation with QR code, and PDF download functionality.

## Changes Made

### 1. Updated DriverFormData Interface
Added two new fields to match the backend model:
- `picture: string` - Base64 encoded passport photo (35mm x 45mm)
- `qrcode: string` - Base64 encoded QR code for driver identification

### 2. Updated Stepper Steps
Added a new step **"Generate Driver ID"** between "Review Details" and "Confirmation":
```
1. Personal Information
2. License Details
3. Contact Information
4. Review Details
5. Generate Driver ID ← NEW
6. Confirmation
```

### 3. Passport Photo Upload Field
Added in the License Details step with:
- **Dimension validation**: Checks for approximately 35mm x 45mm (413px x 531px at 300 DPI)
- **Image preview**: Shows uploaded photo immediately
- **File type validation**: Only accepts image files
- **Required field**: Validation ensures photo is uploaded

### 4. QR Code Generation
- Generates QR code automatically when user clicks "Generate ID" button (on Review step)
- QR code contains:
  - ID Number
  - Full Name
  - License Number
  - License Class
  - Expiry Date
- QR code is 200x200 pixels with black/white colors

### 5. Driver ID Card Design
Implemented a professional ID card matching the provided image with:
- **Header**: Yellow/gold background with "DRIVER" text
- **Photo Section**: 120x155px display of passport photo
- **Details Section**: 
  - Full name in uppercase
  - ID number and license class
  - Address
  - Issue and expiry dates
- **QR Code Section**: 120x120px QR code display
- **Color scheme**: Matches the reference image (gold header, beige background)

### 6. PDF Download Functionality
- **Download Button**: Appears on the "Generate Driver ID" step
- **Filename Format**: `FirstName_LastName_Driver_ID.pdf`
- **PDF Layout**: Landscape A4 format with centered ID card
- **Technology**: Uses html2canvas to capture the ID card and jsPDF to generate PDF

### 7. Form Submission
- All data (including `picture` and `qrcode`) is automatically sent to the backend
- On successful submission:
  - Shows confirmation message with reference number
  - Calls `onRefresh()` callback to refresh the driver table
  - Moves to confirmation step

## Required Dependencies

You need to install the following npm packages:

```bash
npm install qrcode html2canvas jspdf @types/qrcode
```

Or if using pnpm:

```bash
pnpm add qrcode html2canvas jspdf @types/qrcode
```

## Package Details
- **qrcode** (^1.5.x): Generates QR codes
- **html2canvas** (^1.4.x): Captures HTML elements as canvas
- **jspdf** (^2.5.x): Generates PDF documents
- **@types/qrcode** (^1.5.x): TypeScript definitions for qrcode

## Backend Integration

### Expected Backend Model Fields
Ensure your backend model includes:
```java
private String picture;  // Base64 encoded passport photo
private String qrcode;   // Base64 encoded QR code
```

### API Endpoint
The form submits to `authClient.registerDriver(formData)` which should:
1. Accept all form fields including `picture` and `qrcode`
2. Store the driver information in the database
3. Return a success response with a reference number

## User Flow

1. User fills in **Personal Information** (validates age ≥ 18)
2. User fills in **License Details** including:
   - License number, class, expiry date (must be future date)
   - Years of experience (minimum 2 years)
   - Upload license document, ID document, and **passport photo**
3. User fills in **Contact Information**
4. User reviews all details on **Review Details** step
5. User clicks **"Generate ID"** button
6. System generates QR code and displays driver ID card on **Generate Driver ID** step
7. User can **download PDF** of the ID card
8. User clicks **"Send for Approval"** to submit
9. On success:
   - Confirmation message is displayed
   - Driver table is refreshed automatically
   - User can close the dialog

## Validation Rules

### Passport Photo
- Must be an image file (jpg, png, etc.)
- Recommended dimensions: 35mm x 45mm (413px x 531px at 300 DPI)
- Tolerance: ±50 pixels from expected dimensions
- Shows preview after successful upload

### Date of Birth
- Must be at least 18 years old

### License Expiry Date
- Must be at least in the next month (not current month)

### Years of Experience
- Minimum 2 years (can include decimal values like 2.5)

## Features

✅ Passport photo upload with dimension validation
✅ Real-time photo preview
✅ Automatic QR code generation
✅ Professional driver ID card design
✅ PDF download with driver's name as filename
✅ Automatic table refresh on successful submission
✅ Comprehensive validation at each step
✅ Responsive design for all screen sizes

## Notes

1. **Image Quality**: For best results, passport photos should be high quality (300 DPI)
2. **PDF Size**: The PDF is generated in landscape A4 format for optimal ID card display
3. **QR Code Data**: Contains essential driver information for quick verification
4. **Browser Compatibility**: Tested on modern browsers (Chrome, Firefox, Edge, Safari)

## Troubleshooting

### If packages don't install
Try running PowerShell as Administrator and execute:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then retry the npm/pnpm install command.

### If PDF generation fails
Ensure the html2canvas and jspdf libraries are properly imported and the `driver-id-card` element exists in the DOM.

### If QR code doesn't generate
Check that all required driver data is filled in before clicking "Generate ID".

## Future Enhancements

- [ ] Add signature field to ID card
- [ ] Support multiple photo formats and auto-resize
- [ ] Add barcode in addition to QR code
- [ ] Print functionality for physical ID cards
- [ ] Batch ID card generation for multiple drivers
