import crypto from 'crypto'
import nodemailer from 'nodemailer'
import { Resend } from 'resend'

/**
 * Generate a cryptographically secure random token (48 hex chars)
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(24).toString('hex')
}

export interface SendVerificationEmailOptions {
  email: string
  name: string
  token: string
}

export interface EmailSendResult {
  success: boolean
  provider: 'resend' | 'smtp' | 'console-dev'
  verificationUrl: string
  messageId?: string
  error?: string
}

/**
 * Get base URL for email links
 */
export function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
  }
  return 'http://localhost:3000'
}

/**
 * Sends a real verification email via Resend or Nodemailer/SMTP,
 * or logs cleanly if no external credentials are configured in .env.
 */
export async function sendVerificationEmail({
  email,
  name,
  token,
}: SendVerificationEmailOptions): Promise<EmailSendResult> {
  const baseUrl = getAppBaseUrl()
  const verificationUrl = `${baseUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`

  const subject = 'Verify your email address - VYAYAM AI Gym Portal'
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f17; color: #f1f5f9; padding: 24px; margin: 0; }
          .container { max-width: 560px; margin: 0 auto; background: #131926; border: 1px solid #1e293b; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
          .logo { font-size: 20px; font-weight: 800; color: #10b981; letter-spacing: -0.5px; margin-bottom: 24px; }
          h1 { font-size: 22px; font-weight: 700; color: #ffffff; margin-top: 0; }
          p { font-size: 14px; line-height: 1.6; color: #94a3b8; }
          .button-container { margin: 32px 0; text-align: center; }
          .button { display: inline-block; background-color: #10b981; color: #ffffff !important; font-weight: 700; font-size: 14px; padding: 14px 32px; border-radius: 10px; text-decoration: none; }
          .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #1e293b; font-size: 12px; color: #64748b; }
          .token-box { background: #0f172a; padding: 12px; border-radius: 8px; font-family: monospace; word-break: break-all; color: #38bdf8; font-size: 12px; margin-top: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">VYAYAM AI • Gym Portal</div>
          <h1>Verify your email address</h1>
          <p>Hello ${name || 'Gym Owner'},</p>
          <p>Thank you for registering your gym on VYAYAM AI. Please verify your email address to activate your account and proceed with your gym onboarding setup.</p>
          
          <div class="button-container">
            <a href="${verificationUrl}" class="button" target="_blank" rel="noopener noreferrer">
              Verify Email Address
            </a>
          </div>

          <p>This verification link is valid for 24 hours. If you did not create an account on VYAYAM AI, you can safely ignore this email.</p>
          
          <p>Or paste this link into your browser:</p>
          <div class="token-box">${verificationUrl}</div>

          <div class="footer">
            © ${new Date().getFullYear()} VYAYAM AI Gym Management Portal. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `

  const textContent = `Hello ${name || 'Gym Owner'},\n\nPlease verify your email address for VYAYAM AI by visiting this link:\n${verificationUrl}\n\nThis link will expire in 24 hours.`

  // 1. Try Resend if RESEND_API_KEY is provided
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const fromEmail = process.env.EMAIL_FROM || 'VYAYAM AI <onboarding@resend.dev>'
      const data = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject,
        html: htmlContent,
        text: textContent,
      })
      console.log('Verification email sent via Resend:', data)
      return {
        success: true,
        provider: 'resend',
        verificationUrl,
        messageId: data.data?.id,
      }
    } catch (err: any) {
      console.error('Error sending email with Resend:', err)
      // Fall through to SMTP or fallback
    }
  }

  // 2. Try SMTP if SMTP_HOST and SMTP_USER are provided
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })

      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || `"VYAYAM AI" <${process.env.SMTP_USER}>`,
        to: email,
        subject,
        html: htmlContent,
        text: textContent,
      })
      console.log('Verification email sent via SMTP:', info.messageId)
      return {
        success: true,
        provider: 'smtp',
        verificationUrl,
        messageId: info.messageId,
      }
    } catch (err: any) {
      console.error('Error sending email via SMTP:', err)
      // Fall through to console fallback
    }
  }

  // 3. Development / Local Fallback with rich console output & returned URL
  console.log('========================================================')
  console.log('✉️ [EMAIL SERVICE] Email verification link generated:')
  console.log(`Recipient: ${email} (${name})`)
  console.log(`Verification URL: ${verificationUrl}`)
  console.log('========================================================')

  return {
    success: true,
    provider: 'console-dev',
    verificationUrl,
  }
}
