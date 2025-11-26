import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { addLog } from '@/lib/logsStore'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({})) as any
    const name = String(body?.name || '').trim()
    const email = String(body?.email || '').trim()
    const subject = String(body?.subject || '').trim()
    const message = String(body?.message || '').trim()

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // Log to Superadmin for visibility regardless of email status
    await addLog({
      type: 'contact_message',
      message: `Contact form submitted: ${subject}`,
      context: { name, email, subject, message },
    })

    // Email configuration via environment variables
    const SMTP_HOST = process.env.SMTP_HOST
    const SMTP_PORT = Number(process.env.SMTP_PORT || 587)
    const SMTP_USER = process.env.SMTP_USER
    const SMTP_PASS = process.env.SMTP_PASS
    const CONTACT_EMAIL_TO = process.env.CONTACT_EMAIL_TO || 'manishants@gmail.com'
    const MAIL_FROM = process.env.MAIL_FROM || SMTP_USER || 'noreply@smartpdfx.local'

    let emailSent = false
    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: SMTP_HOST,
          port: SMTP_PORT,
          secure: SMTP_PORT === 465,
          auth: { user: SMTP_USER, pass: SMTP_PASS },
        })
        await transporter.sendMail({
          from: MAIL_FROM,
          to: CONTACT_EMAIL_TO,
          replyTo: email,
          subject: `[Contact] ${subject}`,
          text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
          html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p>${message.replace(/\n/g, '<br/>')}</p>`,
        })
        emailSent = true
      } catch (err) {
        // Swallow email errors and return success with logged entry
        await addLog({
          type: 'contact_message',
          message: 'Email send failed for contact submission',
          context: { error: String((err as Error)?.message || err) },
        })
      }
    }

    return NextResponse.json({ ok: true, emailSent })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}