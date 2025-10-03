import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const wallpapers = [
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1542051841857-5f90071e7989?fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1554147090-e1221a04a025?fit=crop&w=1920&q=80"
];
const passwordLengths = [6, 8, 16];

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
        const fName = firstName.trim();
        const lName = lastName.trim();
        const emailUser = email.split('@')[0];
        let password = '';
        switch (selectedLength) {
            case 6: password = (fName[0]?.toUpperCase()||'X')+(lName[0]?.toLowerCase()||'y')+'!'+(fName.length%10)+(lName.length%10)+(emailUser.length%10); break;
            case 8: const f8=fName.length>4?fName.slice(0,4):fName; password = (f8.charAt(0).toUpperCase()+f8.slice(1).toLowerCase())+'-'+(lName[0]?.toUpperCase()||'Y')+(fName.length)+(lName.length); break;
            case 16: const sub={'a':'@','e':'3','i':'1','o':'0','s':'$'}; const sfn=fName.toLowerCase().split('').map(c=>sub[c]||c).join(''); const rln=lName.toLowerCase().split('').reverse().join(''); password=`${sfn}-${rln}-${emailUser.slice(0,4)}!`; while(password.length<16){password+=emailUser.length;} password=password.slice(0,16); break;
        }
        setGeneratedPassword(password);
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName: fName, lastName: lName, email, password }),
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
    
    const handleCopyPassword = () => { if(generatedPassword){ navigator.clipboard.writeText(generatedPassword); setIsCopied(true); setTimeout(()=>setIsCopied(false), 2000); } };

    return (
        <>
            <Head>
                <title>Create Account - AMU</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
            </Head>
            <main className="min-h-screen flex items-center justify-center p-4 font-inter">
                <div className="max-w-[1000px] w-full bg-card-bg rounded-2xl overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-[45%_55%] animate-fade-in-up">
                    <div className="relative h-64 lg:h-auto">
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
                            <form className="space-y-6 animate-fade-in-up" onSubmit={handleSendOtp}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><input type="text" placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-input-bg border border-border rounded-lg px-4 py-3 text-white placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-accent" /><input type="text" placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-input-bg border border-border rounded-lg px-4 py-3 text-white placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-accent" /></div>
                                <div><input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-input-bg border border-border rounded-lg px-4 py-3 text-white placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-accent" /></div>
                                <button type="submit" disabled={isLoading} className="w-full bg-accent text-white rounded-lg py-3 font-semibold hover:bg-purple-500 transition-all disabled:opacity-50">{isLoading ? 'Sending...' : 'Send Verification Code'}</button>
                            </form>
                        )}

                        {step === 2 && (
                            <form className="space-y-6 animate-fade-in-up" onSubmit={handleVerifyOtp}>
                                <p className="text-placeholder text-center">We've sent a 6-digit code to <span className="text-white">{email}</span>. Please enter it below.</p>
                                <div><input type="text" placeholder="123456" value={otp} onChange={e => setOtp(e.target.value)} maxLength="6" className="w-full bg-input-bg border border-border rounded-lg px-4 py-3 text-white text-center tracking-[0.5em] placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-accent" /></div>
                                <button type="submit" disabled={isLoading} className="w-full bg-accent text-white rounded-lg py-3 font-semibold hover:bg-purple-500 transition-all disabled:opacity-50">{isLoading ? 'Verifying...' : 'Verify Email'}</button>
                            </form>
                        )}
                        
                        {step === 3 && !isSuccess && (
                            <div className="space-y-6 animate-fade-in-up">
                                <p className="text-green-400 text-center font-semibold">Email verified successfully!</p>
                                <p className="text-center text-placeholder text-sm mb-3">Select password length</p>
                                <div className="flex justify-center gap-3">{passwordLengths.map(length => (<button key={length} type="button" onClick={() => setSelectedLength(length)} className={`w-12 h-12 bg-input-bg border-2 rounded-lg text-white font-semibold transition-all ${selectedLength === length ? 'border-accent' : 'border-border'}`}>{length}</button>))}</div>
                                <button type="button" onClick={handleCreateAccount} disabled={isLoading} className="w-full bg-accent text-white rounded-lg py-3 font-semibold hover:bg-purple-500 transition-all disabled:opacity-50">{isLoading ? 'Creating Account...' : 'Create Account & Generate Password'}</button>
                            </div>
                        )}

                        {isSuccess && (
                            <div className="text-center animate-fade-in-up">
                                <p className="text-green-400 font-semibold mb-2">Account created successfully!</p>
                                <p className="text-placeholder text-sm mb-2">Your new password is:</p>
                                <div className="flex items-center justify-center gap-4 bg-black/20 p-2 rounded-lg"><p className="text-white text-xl font-bold tracking-widest">{generatedPassword}</p><button onClick={handleCopyPassword} className="bg-accent/80 text-white px-3 py-1 rounded-md text-sm hover:bg-accent" disabled={isCopied}>{isCopied ? 'Copied!' : 'Copy'}</button></div>
                                <p className="text-placeholder text-xs mt-3">Redirecting to login in {countdown} seconds...</p>
                            </div>
                        )}

                        {error && (<div className="mt-4 text-center animate-fade-in-up"><p className="text-red-400 font-semibold">{error}</p></div>)}
                    </div>
                </div>
            </main>
        </>
    );
}