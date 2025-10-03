import Head from 'next/head';
import { useState } from 'react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [qrCode, setQrCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateQrCode = async (e) => {
        e.preventDefault();
        setError('');
        setQrCode('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/setup-totp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to set up 2FA.');
            }

            setQrCode(data.qrCode); // Save the QR code image data

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Forgot Password - AMU</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
            </Head>
            <main className="min-h-screen flex items-center justify-center p-4 font-inter">
                <div className="max-w-md w-full bg-card-bg rounded-2xl overflow-hidden shadow-xl animate-fade-in-up">
                    <div className="p-8 lg:p-12">
                        <div className="mb-8 text-center">
                            <h1 className="text-white text-2xl lg:text-3xl font-semibold mb-2">Setup Password Reset</h1>
                            <p className="text-placeholder">
                                Enter your email to generate a QR code for your authenticator app.
                            </p>
                        </div>

                        {!qrCode ? (
                            <form className="space-y-6" onSubmit={handleGenerateQrCode}>
                                <div>
                                    <input 
                                        type="email" 
                                        placeholder="Enter your registered email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full bg-input-bg border border-border rounded-lg px-4 py-3 text-white placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                                    />
                                </div>
                                <button type="submit" disabled={isLoading} className="w-full bg-accent text-white rounded-lg py-3 font-semibold hover:bg-purple-500 transition-all transform hover:scale-105 disabled:opacity-50">
                                    {isLoading ? 'Generating...' : 'Generate QR Code'}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center">
                                <p className="text-white mb-4">Scan this QR code with your authenticator app (like Google Authenticator).</p>
                                <div className="bg-white p-4 rounded-lg inline-block">
                                    <img src={qrCode} alt="TOTP QR Code" />
                                </div>
                                <p className="text-placeholder mt-4 text-sm">Once scanned, you can use the 6-digit code from the app to log in.</p>
                                <a href="/login-with-totp" className="block mt-6 text-accent hover:underline">
                                    Go to TOTP Login Page
                                </a>
                            </div>
                        )}

                        {error && (
                            <div className="mt-4 p-3 bg-input-bg border border-red-500/50 rounded-lg text-center">
                                <p className="text-red-400 font-semibold">{error}</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}