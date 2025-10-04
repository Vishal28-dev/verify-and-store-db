import Head from 'next/head';
import { useState, useEffect } from 'react';
const wallpapers = [
    "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?fit=crop&w=1920&q=80",
    "https://venturebeat.com/_next/image?url=https%3A%2F%2Fimages.ctfassets.net%2Fjdtwqhzvc2n1%2F2WFwPqL7jqO5VqdBqEHFPW%2Fb7a3a9fb6f1640e1f7e65ed2471dd7bb%2FGettyImages-1390013998-e1656427645552.jpg&w=1080&q=75",
    "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?fit=crop&w=1920&q=80"
];

export default function SetupTotpPage() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [email, setEmail] = useState('');
    const [qrCode, setQrCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const slideInterval = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex + 1) % wallpapers.length);
        }, 5000);
        return () => clearInterval(slideInterval);
    }, []);

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
                throw new Error(data.error || 'Failed to set up TOTP.');
            }
            setQrCode(data.qrCode);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Password Generator</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
            </Head>
            <main className="min-h-screen flex items-center justify-center p-4 font-inter">
                <div className="max-w-[1000px] w-full bg-card-bg rounded-2xl overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-[45%_55%] animate-fade-in-up">
                    
                    <div className="relative h-64 lg:h-auto hidden lg:block">
                        <div className="absolute inset-0 bg-purple-900 bg-opacity-70 z-10"></div>
                        <img src={wallpapers[currentIndex]} alt="Security background" className="w-full h-full object-cover transition-opacity duration-1000 ease-in-out" key={currentIndex} />
                        <div className="absolute top-6 left-6 z-20"><div className="text-white font-bold text-2xl">Lets Build</div></div>
                        <div className="absolute bottom-6 left-6 z-20">
                            <h2 className="text-white text-2xl lg:text-3xl font-semibold mb-4">Enhance Your Security</h2>
                            <div className="flex items-center gap-2">
                                {wallpapers.map((_, index) => (
                                    <button key={index} onClick={() => setCurrentIndex(index)} className={`transition-all ${currentIndex === index ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white bg-opacity-40'} rounded-full`} />
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-8 lg:p-12">
                        <div className="mb-8">
                            <h1 className="text-white text-2xl lg:text-3xl font-semibold mb-2">Setup Password Reset</h1>
                            <p className="text-placeholder">
                                Lost your password? Set up authenticator login.
                            </p>
                        </div>

                        {!qrCode ? (
                            <form className="space-y-6" onSubmit={handleGenerateQrCode}>
                                <div>
                                    <input type="email" placeholder="Enter your registered email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-input-bg border border-border rounded-lg px-4 py-3 text-white placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-accent transition-all" />
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
                                {error.includes('not found') && (
                                    <p className="text-placeholder text-sm mt-2">
                                        Don't have an account?{' '}
                                        <a href="/register" className="text-accent hover:underline">Sign up here</a>
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}