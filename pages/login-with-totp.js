import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function LoginWithTotpPage() {
    const [email, setEmail] = useState('');
    const [token, setToken] = useState(''); // This will hold the 6-digit code
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/verify-totp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, token }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed.');
            }

            // If login is successful, redirect to the dashboard
            router.push('/dashboard');

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Login with Authenticator - AMU</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
            </Head>
            <main className="min-h-screen flex items-center justify-center p-4 font-inter">
                <div className="max-w-md w-full bg-card-bg rounded-2xl overflow-hidden shadow-xl animate-fade-in-up">
                    <div className="p-8 lg:p-12">
                        <div className="mb-8 text-center">
                            <h1 className="text-white text-2xl lg:text-3xl font-semibold mb-2">Authenticator Login</h1>
                            <p className="text-placeholder">
                                Enter the 6-digit code from your authenticator app.
                            </p>
                        </div>

                        <form className="space-y-6" onSubmit={handleLogin}>
                            <div>
                                <input 
                                    type="email" 
                                    placeholder="Email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-input-bg border border-border rounded-lg px-4 py-3 text-white placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                                />
                            </div>
                            <div>
                                <input 
                                    type="text" 
                                    placeholder="6-Digit Code"
                                    value={token}
                                    onChange={e => setToken(e.target.value)}
                                    maxLength="6"
                                    className="w-full bg-input-bg border border-border rounded-lg px-4 py-3 text-white placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-accent transition-all text-center tracking-[0.5em]"
                                />
                            </div>
                            
                            <button type="submit" disabled={isLoading} className="w-full bg-accent text-white rounded-lg py-3 font-semibold hover:bg-purple-500 transition-all transform hover:scale-105 disabled:opacity-50">
                                {isLoading ? 'Verifying...' : 'Log in'}
                            </button>

                            {error && (
                                <div className="mt-4 p-3 bg-input-bg border border-red-500/50 rounded-lg text-center">
                                    <p className="text-red-400 font-semibold">{error}</p>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </main>
        </>
    );
}