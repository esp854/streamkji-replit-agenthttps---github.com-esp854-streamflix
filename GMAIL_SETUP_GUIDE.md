# 📧 Gmail App Password Setup Guide

This guide will help you configure Gmail for use with the StreamFlix email system.

## Prerequisites

Before you can send emails through Gmail's SMTP server, you need to:

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password specifically for StreamFlix

## Step-by-Step Setup

### Step 1: Enable 2-Factor Authentication

1. Go to your Google Account settings: https://myaccount.google.com/
2. Click on "Security" in the left navigation panel
3. Under "Signing in to Google," click on "2-Step Verification"
4. Click "Get Started" if 2FA is not already enabled
5. Follow the prompts to set up 2FA using your phone number or another method

### Step 2: Generate an App Password

1. While still in your Google Account settings, go to the "Security" section
2. Under "Signing in to Google," click on "App passwords"
   - Note: This option only appears if you have 2FA enabled
3. If prompted, enter your Google password to continue
4. Under "Select app," choose "Mail"
5. Under "Select device," choose "Other (Custom name)"
6. Enter "StreamFlix" as the custom name
7. Click "Generate"
8. You'll see a 16-character password (e.g., "abcd efgh ijkl mnop")
9. Copy this password (without spaces) - this is your EMAIL_PASS

### Step 3: Update Your .env File

1. Open the [.env](file:///c:/Users/Dell/Downloads/streamkji-replit-agent/streamkji-replit-agent/.env) file in the `server` directory
2. Update the EMAIL_PASS value with your new App Password:
   ```
   EMAIL_USER=streamflix234m@gmail.com
   EMAIL_PASS=your_16_character_app_password_here
   ```
3. Save the file

### Step 4: Test the Configuration

1. Run the test script to verify your configuration:
   ```bash
   cd server
   npx tsx test-email.ts
   ```

## Troubleshooting

If you're still experiencing authentication issues:

1. **Double-check the App Password**: Make sure you copied the entire 16-character password without spaces
2. **Regenerate the App Password**: App passwords can become invalid; try generating a new one
3. **Verify 2FA is enabled**: The App Passwords option only appears when 2FA is active
4. **Check for typos**: Ensure there are no extra spaces or characters in your [.env](file:///c:/Users/Dell/Downloads/streamkji-replit-agent/streamkji-replit-agent/.env) file

## Security Notes

- Never share your App Password with others
- App Passwords are application-specific and can be revoked at any time
- If you suspect your App Password has been compromised, generate a new one immediately
- App Passwords bypass 2FA, so keep them secure

## Need Help?

If you continue to have issues after following these steps, please:
1. Verify that the email address is correct and accessible
2. Ensure your Google account is in good standing (not suspended)
3. Check that Gmail's SMTP service is not blocked by your network or firewall