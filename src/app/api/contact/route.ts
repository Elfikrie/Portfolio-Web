import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { message: 'Semua field harus diisi.' },
        { status: 400 }
      );
    }

    // Configure Gmail SMTP transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: 'muhammadfikrie775@gmail.com',
      replyTo: email,
      subject: `[Portfolio] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f97066;">New Contact Message</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; font-weight: bold; color: #666;">Name:</td>
              <td style="padding: 8px;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; color: #666;">Email:</td>
              <td style="padding: 8px;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; color: #666;">Subject:</td>
              <td style="padding: 8px;">${subject}</td>
            </tr>
          </table>
          <div style="margin-top: 16px; padding: 16px; background-color: #f5f5f5; border-radius: 8px;">
            <p style="font-weight: bold; color: #666; margin-top: 0;">Message:</p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <p style="margin-top: 16px; font-size: 12px; color: #999;">This message was sent from your portfolio contact form.</p>
        </div>
      `,
    });

    return NextResponse.json({ message: 'Pesan berhasil dikirim!' }, { status: 200 });
  } catch (error: any) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { message: 'Gagal mengirim pesan. Pastikan konfigurasi email sudah benar.' },
      { status: 500 }
    );
  }
}
