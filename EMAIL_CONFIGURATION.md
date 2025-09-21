# Email Configuration for StreamFlix

This document explains how to configure the email system for StreamFlix so that users receive welcome emails when they register.

## Prerequisites

1. A Gmail account (or Google Workspace account)
2. 2-Factor Authentication enabled on your Google account
3. An App Password generated for the application

## Setup Instructions

### 1. Enable 2-Factor Authentication

1. Go to your Google Account settings: https://myaccount.google.com/
2. Click on "Security" in the left sidebar
3. Under "Signing in to Google", click on "2-Step Verification"
4. Follow the prompts to set up 2-Step Verification

### 2. Generate an App Password

1. While still in your Google Account settings, under "Security" section
2. Click on "App passwords" (you may need to scroll down)
3. If prompted, enter your password
4. Under "Select app", choose "Other (Custom name)"
5. Give it a name like "StreamFlix"
6. Click "Generate"
7. Copy the 16-character password that is generated

### 3. Configure Environment Variables

1. Open the `.env` file in the root of your project
2. Update the following variables:
   ```
   EMAIL_USER=your_actual_gmail_address@gmail.com
   EMAIL_PASS=the_16_character_app_password
   ```

### 4. Test the Configuration

1. Run the test email script to verify your configuration works:
   ```bash
   cd server
   npx ts-node test-email.ts
   ```

2. If successful, you should receive a test email at the EMAIL_USER address

## Troubleshooting

### Common Issues

1. **Authentication failed**: Make sure you're using an App Password, not your regular Gmail password
2. **Email not received**: Check your spam/junk folder
3. **Environment variables not loading**: Make sure the .env file is in the root directory and properly formatted

### Error Messages

- **EAUTH**: Authentication failed - check your EMAIL_USER and EMAIL_PASS values
- **ECONNREFUSED**: Network connection issue - check your internet connection
- **ENOTFOUND**: DNS lookup failed - check your network settings

## How It Works

When a user registers:
1. The system creates their account in the database
2. The system attempts to send a welcome email using the configured email settings
3. If the email fails to send, the registration still completes but logs the error
4. The email includes a personalized welcome message with the user's username

## Security Notes

- Never commit your actual .env file to version control
- The App Password has limited access compared to your regular password
- The email configuration is only used for sending system emails, not for receiving

## Testing Registration Emails

To test the registration email flow:
1. Start your application
2. Go to the registration page
3. Create a new account with a real email address
4. Check that email inbox (and spam folder) for the welcome email