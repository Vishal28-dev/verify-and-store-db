import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const wallpapers = [
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1487088678257-3a541e6e3922?fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?fit=crop&w=1920&q=80"
];
const passwordLengths = [6, 8, 16];

const Spinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export default function RegisterPage() {
    const [step, setStep] = useState(1);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [selectedLength, setSelectedLength] = useState(null);
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [countdown, setCountdown] = useState(8);
    const router = useRouter(); 
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const slideInterval = setInterval(() => { setCurrentIndex(prev => (prev+1)%wallpapers.length) }, 5000);
        return () => clearInterval(slideInterval);
    }, []);

    useEffect(() => {
        let timer;
        if(isSuccess && countdown > 0) { timer = setInterval(() => setCountdown(p => p-1), 1000); }
        else if(isSuccess && countdown === 0) { router.push('/'); }
        return () => clearInterval(timer);
    }, [isSuccess, countdown, router]);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const res = await fetch('/api/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setStep(2);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const res = await fetch('/api/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setStep(3);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCreateAccount = async () => {
        setError('');
        setIsLoading(true); 
        if (!selectedLength) {
            setError('Please select a password length.');
            setIsLoading(false);
            return;
        }
        
        const fName = firstName.trim().toLowerCase();
        const lName = lastName.trim().toLowerCase();
        const emailUser = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        let password = '';

        const base = (fName + lName + emailUser).repeat(5) + "abcdefghijklmnopqrstuvwxyz0123456789";

        switch (selectedLength) {
            case 6:
                const num1 = (fName.length + emailUser.length) % 10;
                const num2 = (lName.length + 1) % 10;
                const num3 = (base.charCodeAt(2) || 0) % 10;
                password = 
                    (fName[0]?.toUpperCase() || 'X') +
                    (lName[0]?.toLowerCase() || 'y') +
                    '!' + num1 + num2 + num3;
                break;
            
            case 8:
                const fInitial = fName[0]?.toUpperCase() || 'X';
                const lInitial = lName[0]?.toUpperCase() || 'Y';
                const numbers8 = ( (fName.length * 3) + (lName.length * 5) + (emailUser.length * 2) ).toString().padEnd(4, '0').slice(0, 4);
                password = `${fInitial}_${lInitial}_${numbers8}`;
                break;

            case 16:
                const substitutions = {'a':'@','e':'3','i':'1','o':'0','s':'$'};
                const substitutedFName = fName.split('').map(c => substitutions[c] || c).join('');
                const reversedLName = lName.split('').reverse().join('');
                let base16 = `${substitutedFName}-${reversedLName}-${emailUser}!`;
                password = base16.padEnd(16, base).slice(0, 16);
                break;
        }
        setGeneratedPassword(password);
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    firstName: fName, 
                    lastName: lName, 
                    email, 
                    password,
                    selectedLength 
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Something went wrong.');
            setIsSuccess(true);
            setError('');
        } catch (err) {
            setError(err.message);
            setIsSuccess(false);
        } finally {
            setIsLoading(false); 
        }
    };
    
    const handleCopyPassword = () => { if(generatedPassword){ navigator.clipboard.writeText(generatedPassword); setIsCopied(true); } };

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
                        <img src={wallpapers[currentIndex]} alt="Background" className="w-full h-full object-cover transition-opacity duration-1000 ease-in-out" key={currentIndex} />
                        <div className="absolute top-6 left-6 z-20"><div className="text-white font-bold text-2xl">Lets Build</div></div>
                        <div className="absolute bottom-6 left-6 z-20">
                            <h2 className="text-white text-2xl lg:text-3xl font-semibold mb-4">Capturing Moments, Creating Memories</h2>
                            <div className="flex items-center gap-2">{wallpapers.map((_, index) => (<button key={index} onClick={() => setCurrentIndex(index)} className={`transition-all ${currentIndex === index ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white bg-opacity-40'} rounded-full`} />))}</div>
                        </div>
                    </div>
                    <div className="p-8 lg:p-12">
                        <div className="mb-8">
                            <h1 className="text-white text-2xl lg:text-3xl font-semibold mb-2">Create an account</h1>
                            <p className="text-placeholder">Already have an account? <a href="/" className="text-accent hover:underline">Log in</a></p>
                        </div>
                        
                        {step === 1 && (
                            <form className="space-y-6" onSubmit={handleSendOtp}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><input type="text" placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-input-bg border border-border rounded-lg px-4 py-3 text-white placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-accent" /><input type="text" placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-input-bg border border-border rounded-lg px-4 py-3 text-white placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-accent" /></div>
                                <div><input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-input-bg border border-border rounded-lg px-4 py-3 text-white placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-accent" /></div>
                                <button type="submit" disabled={isLoading} className="w-full bg-accent text-white rounded-lg py-3 font-semibold flex items-center justify-center transition-all disabled:opacity-50">
                                    {isLoading && <Spinner />}
                                    {isLoading ? 'Sending...' : 'Send Verification Code'}
                                </button>
                            </form>
                        )}

                        {step === 2 && (
                            <form className="space-y-6" onSubmit={handleVerifyOtp}>
                                <p className="text-placeholder text-center">We've sent a 6-digit code to <span className="text-white">{email}</span>. Please enter it below.</p>
                                <div><input type="text" placeholder="123456" value={otp} onChange={e => setOtp(e.target.value)} maxLength="6" className="w-full bg-input-bg border border-border rounded-lg px-4 py-3 text-white text-center tracking-[0.5em] placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-accent" /></div>
                                <button type="submit" disabled={isLoading} className="w-full bg-accent text-white rounded-lg py-3 font-semibold flex items-center justify-center transition-all disabled:opacity-50">
                                    {isLoading && <Spinner />}
                                    {isLoading ? 'Verifying...' : 'Verify Email'}
                                </button>
                            </form>
                        )}
                        
                        {step === 3 && !isSuccess && (
                            <div className="space-y-6">
                                <p className="text-green-400 text-center font-semibold">Email verified successfully!</p>
                                <p className="text-center text-placeholder text-sm mb-3">Select password length</p>
                                <div className="flex justify-center gap-3">{passwordLengths.map(length => (<button key={length} type="button" onClick={() => setSelectedLength(length)} className={`w-12 h-12 bg-input-bg border-2 rounded-lg text-white font-semibold transition-all ${selectedLength === length ? 'border-accent' : 'border-border'}`}>{length}</button>))}</div>
                                <button type="button" onClick={handleCreateAccount} disabled={isLoading} className="w-full bg-accent text-white rounded-lg py-3 font-semibold flex items-center justify-center transition-all disabled:opacity-50">
                                    {isLoading && <Spinner />}
                                    {isLoading ? 'Creating Account...' : 'Create Account & Generate Password'}
                                </button>
                            </div>
                        )}

                        {isSuccess && (
                            <div className="text-center">
                                <p className="text-green-400 font-semibold mb-2">Account created successfully!</p>
                                <p className="text-placeholder text-sm mb-2">Your new password is:</p>
                                <div className="flex items-center justify-center gap-4 bg-black/20 p-2 rounded-lg"><p className="text-white text-xl font-bold tracking-widest">{generatedPassword}</p><button onClick={handleCopyPassword} className="bg-accent/80 text-white px-3 py-1 rounded-md text-sm hover:bg-accent disabled:opacity-70 disabled:cursor-not-allowed" disabled={isCopied}>{isCopied ? 'Copied!' : 'Copy'}</button></div>
                                <p className="text-yellow-500 text-xs mt-3 font-semibold">⚠️ Please save this password. You will not be able to see it again.</p>
                                <p className="text-placeholder text-xs mt-3">Redirecting to login in {countdown} seconds...</p>
                            </div>
                        )}

                        {error && (<div className="mt-4 text-center"><p className="text-red-400 font-semibold">{error}</p></div>)}
                    </div>
                </div>
            </main>
        </>
    );
}