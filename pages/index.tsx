import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const wallpapers = [
    "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?fit=crop&w=1920&q=80", 
    "https://images.unsplash.com/photo-1516321497487-e288fb19713f?fit=crop&w=1920&q=80", 
    "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?fit=crop&w=1920&q=80"
];

export default function LoginPage() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const slideInterval = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex + 1) % wallpapers.length);
        }, 5000);
        return () => clearInterval(slideInterval);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Login failed.');
            }
            router.push(`/dashboard?name=${data.firstName}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Login - AMU</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
            </Head>
            <main className="min-h-screen flex items-center justify-center p-4 font-inter">
                <div className="max-w-[1000px] w-full bg-card-bg rounded-2xl overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-[45%_55%] animate-fade-in-up" style={{ '--delay': '0s' }}>
                    
                    <div className="relative h-64 lg:h-auto hidden lg:block">
                        <div className="absolute inset-0 bg-purple-900 bg-opacity-70 z-10"></div>
                        <img src={wallpapers[currentIndex]} alt="Background" className="w-full h-full object-cover transition-opacity duration-1000 ease-in-out" key={currentIndex} />
                        <div className="absolute top-6 left-6 z-20"><div className="text-white font-bold text-2xl">Lets Build</div></div>
                        <div className="absolute bottom-6 left-6 z-20">
                            <h2 className="text-white text-2xl lg:text-3xl font-semibold mb-4">Welcome to the Community</h2>
                            <div className="flex items-center gap-2">
                                {wallpapers.map((_, index) => (
                                    <button key={index} onClick={() => setCurrentIndex(index)} className={`transition-all ${currentIndex === index ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white bg-opacity-40'} rounded-full`} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-8 lg:p-12">
                        <div className="mb-8">
                            <h1 className="text-white text-2xl lg:text-3xl font-semibold mb-2">Welcome Back</h1>
                            <p className="text-placeholder">
                                Don't have an account?{' '}
                                <a href="/register" className="text-accent hover:underline">Sign up</a>
                            </p>
                        </div>
                        
                        {/* UPDATED: Removed the unnecessary tabs */}
                        <form className="space-y-6" onSubmit={handleLogin}>
                            <div>
                                <input 
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email} 
                                    onChange={e => setEmail(e.target.value)} 
                                    className="w-full bg-input-bg border border-border rounded-lg px-4 py-3 text-white placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-accent transition-all" />
                            </div>
                            <div>
                                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-input-bg border border-border rounded-lg px-4 py-3 text-white placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-accent transition-all" />
                            </div>
                            <div className="text-right">
                                <a href="/setup-totp" className="text-sm text-placeholder hover:text-accent transition-colors">Forgot Password?</a>
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full bg-accent text-white rounded-lg py-3 font-semibold hover:bg-purple-500 transition-all transform hover:scale-105 disabled:opacity-50 disabled:scale-100">
                                {isLoading ? 'Logging in...' : 'Log in'}
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