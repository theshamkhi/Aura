<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\Message;
use Illuminate\Mail\Mailables\Address;

class NewMessageNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Message $message) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(config('mail.from.address'), config('mail.from.name')),
            subject: 'New Message Received on Portfolio #' . $this->message->portfolio_id,
            replyTo: [
                new Address(
                    $this->message->sender_email,
                    $this->message->sender_name
                ),
            ],
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.newMessage',
            with: [
                'message' => $this->message,
                'portfolio' => $this->message->portfolio,
                'visitor' => $this->message->visitor,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}