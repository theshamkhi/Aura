<!DOCTYPE html>
<html>
<head>
    <style>
        /* Base Styles */
        .email-container {
            max-width: 680px;
            margin: 0 auto;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #2d3748;
        }

        /* Header Section */
        .header {
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            padding: 2.5rem 1.5rem;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .header h2 {
            color: white;
            margin: 0;
            font-size: 1.8rem;
            font-weight: 600;
            letter-spacing: -0.025em;
        }
        .header p {
            color: #e2e8f0;
            margin: 0.5rem 0 0;
            font-size: 0.95rem;
        }

        /* Content Section */
        .content {
            padding: 2.5rem;
            background: white;
            border-radius: 0 0 8px 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        /* Sender Information */
        .sender-info {
            margin-bottom: 2rem;
            padding-bottom: 1.5rem;
            border-bottom: 1px solid #e2e8f0;
        }
        .sender-info h3 {
            color: #1e40af;
            margin: 0 0 1rem;
            font-size: 1.25rem;
            font-weight: 600;
        }
        .sender-info p {
            margin: 0.5rem 0;
            font-size: 1rem;
        }

        /* Visitor Info */
        .visitor-info {
            background: #f8fafc;
            padding: 1.25rem;
            border-radius: 6px;
            margin-top: 1.5rem;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }
        .visitor-info p {
            margin: 0;
            font-size: 0.9rem;
            color: #4a5568;
        }
        .visitor-info strong {
            color: #2d3748;
            font-weight: 500;
        }

        /* Message Box */
        .message-box {
            background: #f8fafc;
            padding: 1.5rem;
            border-radius: 6px;
            margin: 2rem 0;
            border-left: 4px solid #3b82f6;
        }
        .message-box h3 {
            margin: 0 0 1rem;
            font-size: 1.25rem;
            color: #1e40af;
        }
        .message-box p {
            white-space: pre-wrap;
            margin: 0;
            line-height: 1.7;
            color: #4a5568;
        }

        /* Action Buttons */
        .actions {
            display: flex;
            gap: 1rem;
            margin-top: 2.5rem;
            flex-wrap: wrap;
        }
        .button {
            display: inline-flex;
            align-items: center;
            padding: 0.75rem 1.5rem;
            background-color: #3b82f6;
            color: white !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            transition: all 0.2s ease;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        .button:hover {
            background-color: #2563eb;
            transform: translateY(-1px);
            box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
        }

        /* Footer */
        .footer {
            margin-top: 3rem;
            padding-top: 2rem;
            text-align: center;
            color: #718096;
            font-size: 0.85rem;
            border-top: 1px solid #e2e8f0;
        }
        .footer p {
            margin: 0.4rem 0;
        }

        /* Responsive Design */
        @media (max-width: 640px) {
            .content {
                padding: 1.5rem;
            }
            .header {
                padding: 1.5rem 1rem;
            }
            .header h2 {
                font-size: 1.5rem;
            }
            .actions {
                flex-direction: column;
            }
            .button {
                justify-content: center;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h2>📬 New Message Alert</h2>
            <p>Portfolio: {{ $portfolio->title ?? 'Portfolio #' . $message->portfolio_id }}</p>
        </div>

        <div class="content">
            <div class="sender-info">
                <h3>Message Details</h3>
                <p>{{ $message->sender_name }} &lt;{{ $message->sender_email }}&gt;</p>
                
                @if($visitor)
                <div class="visitor-info">
                    <p><strong>Visitor ID:</strong> #{{ $visitor->id }}</p>
                    <p><strong>Location:</strong> {{ $visitor->city ?? 'Unknown' }}, {{ $visitor->country ?? 'Unknown' }}</p>
                </div>
                @endif
            </div>

            <div class="message-box">
                <h3>Message Content</h3>
                <p>{{ $message->message }}</p>
            </div>

            <div class="actions">
                <a href="mailto:{{ $message->sender_email }}" class="button">
                    ✉️ Reply Directly
                </a>
            </div>
        </div>

        <div class="footer">
            <p>📅 Received at: {{ $message->created_at }}</p>
            <p>⚡ Automated notification from {{ config('app.name') }}</p>
        </div>
    </div>
</body>
</html>