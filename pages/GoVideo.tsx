
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { 
    Video, 
    Upload, 
    Sparkles, 
    Play, 
    Download, 
    RefreshCw, 
    Type, 
    Image as ImageIcon,
    Zap,
    MessageSquare,
    ChevronRight,
    AlertTriangle
} from '../components/icons/LucideIcons';
import { ImageUploader } from '../components/ImageUploader';
import { FeatureHeader } from '../components/FeatureHeader';
import { StepHeader } from '../components/StepHeader';
import { Spinner } from '../components/Spinner';
import { generateVideo, generateTextToVideo, suggestMotionPrompt } from '../services/geminiService';
import { PromoCard } from '../components/PromoCard';

type VideoMode = 'image-to-video' | 'text-to-video';

const GoVideo: React.FC = () => {
    const { t } = useLanguage();
    const [mode, setMode] = useState<VideoMode>('image-to-video');
    const [image, setImage] = useState<{ dataUrl: string; mimeType: string } | null>(null);
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState('16:9');
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [isSuggesting, setIsSuggesting] = useState(false);

    const loadingMessages = [
        "Sabar ya, bikin video emang butuh waktu...",
        "Lagi ngatur kamera dan pencahayaan...",
        "Render frame demi frame biar halus...",
        "Dikit lagi jadi kok, hasilnya bakal keren!",
        "Menghidupkan gambar Anda...",
        "Menambahkan sentuhan sinematik..."
    ];

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isLoading) {
            setLoadingMessage(loadingMessages[0]);
            let i = 1;
            interval = setInterval(() => {
                setLoadingMessage(loadingMessages[i % loadingMessages.length]);
                i++;
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    const handleImageUpload = (dataUrl: string, mimeType: string) => {
        setImage({ dataUrl, mimeType });
        setVideoUrl(null);
        setError(null);
    };

    const handleSuggestPrompt = async () => {
        if (!image) return;
        setIsSuggesting(true);
        try {
            const suggested = await suggestMotionPrompt(image);
            setPrompt(suggested);
        } catch (err) {
            console.error("Failed to suggest prompt:", err);
        } finally {
            setIsSuggesting(false);
        }
    };

    const handleGenerate = async () => {
        if (mode === 'image-to-video' && !image) {
            setError("Harap unggah gambar terlebih dahulu.");
            return;
        }
        if (!prompt.trim()) {
            setError("Harap masukkan deskripsi gerakan.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setVideoUrl(null);

        try {
            let url;
            if (mode === 'image-to-video' && image) {
                url = await generateVideo(prompt, image);
            } else {
                url = await generateTextToVideo(prompt, aspectRatio);
            }
            
            if (url) {
                setVideoUrl(url);
            } else {
                throw new Error("Gagal mendapatkan URL video.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal membuat video.');
        } finally {
            setIsLoading(false);
        }
    };

    const videoStyles = [
        { id: 'product-animation', name: 'Product Animation', prompt: 'Smooth cinematic product showcase, 360 rotation, soft lighting, high detail, professional commercial style.' },
        { id: 'review-style', name: 'Review Style', prompt: 'Handheld camera movement, close-up details of the product, natural lighting, unboxing feel, authentic review aesthetic.' },
        { id: 'cinematic-zoom', name: 'Cinematic Zoom', prompt: 'Slow dramatic zoom in towards the center of the product, shallow depth of field, elegant atmosphere, particles in the air.' },
        { id: 'dynamic-motion', name: 'Dynamic Motion', prompt: 'Fast-paced camera transitions, energetic movement, vibrant colors, modern commercial look, high energy.' },
    ];

    const applyStyle = (stylePrompt: string) => {
        setPrompt(stylePrompt);
    };

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-8">
            <FeatureHeader 
                title="Go Video" 
                description="Ubah foto produk menjadi video atau buat video dari teks secara instan menggunakan AI tercanggih."
            />

            <div className="flex justify-center mb-8">
                <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl flex gap-1 shadow-inner">
                    <button
                        onClick={() => setMode('image-to-video')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            mode === 'image-to-video' 
                            ? 'bg-white dark:bg-gray-700 text-violet-600 dark:text-violet-400 shadow-md' 
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        <ImageIcon className="w-4 h-4" />
                        Image to Video
                    </button>
                    <button
                        onClick={() => setMode('text-to-video')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            mode === 'text-to-video' 
                            ? 'bg-white dark:bg-gray-700 text-violet-600 dark:text-violet-400 shadow-md' 
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        <Type className="w-4 h-4" />
                        Text to Video
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Panel: Controls */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-white/5">
                        {mode === 'image-to-video' ? (
                            <div className="space-y-6">
                                <div>
                                    <StepHeader step={1} title="Unggah Foto Produk" description="Pilih foto produk yang ingin Anda hidupkan." />
                                    <ImageUploader 
                                        onImageUpload={handleImageUpload} 
                                        uploadedImage={image?.dataUrl || null} 
                                        label="Upload Product Image"
                                    />
                                </div>

                                <div>
                                    <StepHeader step={2} title="Pilih Gaya Video" description="Pilih gaya gerakan yang Anda inginkan." />
                                    <div className="grid grid-cols-2 gap-3 mt-4">
                                        {videoStyles.map((style) => (
                                            <button
                                                key={style.id}
                                                onClick={() => applyStyle(style.prompt)}
                                                className="p-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 hover:border-violet-500 dark:hover:border-violet-500 transition-all text-left group"
                                            >
                                                <p className="text-sm font-bold text-gray-800 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400">{style.name}</p>
                                                <p className="text-[10px] text-gray-500 mt-1 line-clamp-1 italic">Preset gerakan profesional</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <StepHeader step={1} title="Pilih Ukuran Video" description="Tentukan aspect ratio video Anda." />
                                    <div className="grid grid-cols-3 gap-3 mt-4">
                                        {['16:9', '9:16', '1:1'].map((ratio) => (
                                            <button
                                                key={ratio}
                                                onClick={() => setAspectRatio(ratio)}
                                                className={`py-3 rounded-xl text-sm font-bold border transition-all ${
                                                    aspectRatio === ratio 
                                                    ? 'bg-violet-600 text-white border-violet-600 shadow-lg shadow-violet-500/30' 
                                                    : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-600 dark:text-gray-400 hover:border-violet-500'
                                                }`}
                                            >
                                                {ratio}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-8 pt-8 border-t border-gray-100 dark:border-white/5">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Deskripsi Gerakan</label>
                                {mode === 'image-to-video' && image && (
                                    <button 
                                        onClick={handleSuggestPrompt}
                                        disabled={isSuggesting}
                                        className="text-[10px] font-bold text-violet-600 dark:text-violet-400 flex items-center gap-1 hover:underline disabled:opacity-50"
                                    >
                                        {isSuggesting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                        Bantu Bikin Deskripsi
                                    </button>
                                )}
                            </div>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder={mode === 'image-to-video' ? "Contoh: Kamera zoom in perlahan ke produk, ada asap tipis mengepul..." : "Contoh: Pemandangan pegunungan saat matahari terbenam, sinematik, 4k..."}
                                className="w-full bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 min-h-[120px] transition-all"
                            />
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || (mode === 'image-to-video' && !image) || !prompt.trim()}
                            className="w-full mt-6 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold flex items-center justify-center gap-2 shadow-xl shadow-violet-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {isLoading ? (
                                <>
                                    <Spinner className="w-5 h-5 text-white" />
                                    <span>Memproses...</span>
                                </>
                            ) : (
                                <>
                                    <Zap className="w-5 h-5" />
                                    <span>Buat Video</span>
                                </>
                            )}
                        </button>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-2xl p-4 flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                        <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                            <strong>Info:</strong> Fitur Video ini adalah BONUS ujicoba. Google membatasi kuota pembuatan video (sekitar 10 video per akun). Jika gagal, mungkin kuota harian Anda sudah habis.
                        </p>
                    </div>
                </div>

                {/* Right Panel: Result */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-white/5 min-h-[500px] flex flex-col">
                        <StepHeader step={3} title="Hasil Video" description="Video hasil karya AI Anda." />
                        
                        <div className="flex-grow mt-6 bg-gray-50 dark:bg-black/20 rounded-3xl border-2 border-dashed border-gray-200 dark:border-white/5 flex items-center justify-center overflow-hidden relative group">
                            <AnimatePresence mode="wait">
                                {isLoading ? (
                                    <motion.div 
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col items-center text-center p-8"
                                    >
                                        <div className="relative mb-6">
                                            <Spinner className="w-16 h-16 text-violet-600" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Video className="w-6 h-6 text-violet-600 animate-pulse" />
                                            </div>
                                        </div>
                                        <p className="text-lg font-bold text-gray-800 dark:text-white mb-2">{loadingMessage}</p>
                                        <p className="text-sm text-gray-500">Proses ini memakan waktu sekitar 1-2 menit.</p>
                                    </motion.div>
                                ) : videoUrl ? (
                                    <motion.div 
                                        key="video"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="w-full h-full flex flex-col"
                                    >
                                        <video 
                                            src={videoUrl} 
                                            controls 
                                            autoPlay 
                                            loop 
                                            className="w-full h-full object-contain bg-black"
                                        />
                                        <div className="absolute bottom-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <a 
                                                href={videoUrl} 
                                                download="generated-video.mp4"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-xl text-gray-800 dark:text-white hover:scale-110 transition-all"
                                            >
                                                <Download className="w-5 h-5" />
                                            </a>
                                        </div>
                                    </motion.div>
                                ) : error ? (
                                    <motion.div 
                                        key="error"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex flex-col items-center text-center p-8"
                                    >
                                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                                            <AlertTriangle className="w-8 h-8 text-red-600" />
                                        </div>
                                        <p className="text-lg font-bold text-red-600 mb-2">Gagal Membuat Video</p>
                                        <p className="text-sm text-gray-500 mb-6">{error}</p>
                                        <button 
                                            onClick={handleGenerate}
                                            className="px-6 py-2 bg-gray-800 dark:bg-white text-white dark:text-gray-800 rounded-xl font-bold text-sm"
                                        >
                                            Coba Lagi
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="placeholder"
                                        className="flex flex-col items-center text-center p-8 text-gray-400"
                                    >
                                        <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-3xl flex items-center justify-center mb-6 rotate-3">
                                            <Play className="w-10 h-10 opacity-20" />
                                        </div>
                                        <p className="font-black uppercase tracking-widest text-xs">Video Preview</p>
                                        <p className="text-sm mt-2">Hasil video Anda akan muncul di sini.</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {videoUrl && (
                            <div className="mt-6 flex gap-4">
                                <button 
                                    onClick={() => setVideoUrl(null)}
                                    className="flex-1 py-4 rounded-2xl border border-gray-200 dark:border-white/10 font-bold text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                                >
                                    Buat Baru
                                </button>
                                <a 
                                    href={videoUrl} 
                                    download="generated-video.mp4"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 py-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
                                >
                                    <Download className="w-4 h-4" />
                                    Simpan Video
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-12">
                <PromoCard />
            </div>
        </div>
    );
};

export default GoVideo;
