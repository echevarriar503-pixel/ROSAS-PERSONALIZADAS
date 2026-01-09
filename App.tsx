
import React, { useState, useCallback, useRef } from 'react';
import { generatePersonalizedRose } from './geminiService';
import { AppStatus, GenerationResult } from './types';

// Components
const Header = () => (
  <header className="py-8 px-4 text-center">
    <h1 className="text-4xl font-bold text-gray-900 mb-2">Personalizador de Rosas Pro</h1>
    <p className="text-gray-600 max-w-2xl mx-auto font-light">
      Crea un diseño único <span className="font-semibold text-rose-600">soldando</span> tu nombre al tallo de una rosa.
    </p>
  </header>
);

const Footer = () => (
  <footer className="py-8 text-center text-gray-400 text-xs">
    <p>&copy; {new Date().getFullYear()} RoseCraft Studio. Calidad premium para corte láser.</p>
  </footer>
);

export default function App() {
  const [name, setName] = useState('');
  const [nameSize, setNameSize] = useState(50); // New state for manual size
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setReferenceImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!name.trim()) {
      setErrorMsg('Por favor, ingresa un nombre.');
      return;
    }

    setStatus(AppStatus.GENERATING);
    setErrorMsg('');

    try {
      const imageUrl = await generatePersonalizedRose(name, nameSize, referenceImage || undefined);
      setResult({
        imageUrl,
        name: name,
        timestamp: Date.now()
      });
      setStatus(AppStatus.SUCCESS);
    } catch (err) {
      console.error(err);
      setStatus(AppStatus.ERROR);
      setErrorMsg('Error de conexión. Inténtalo de nuevo.');
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result.imageUrl;
    link.download = `Rosa_${result.name}_${nameSize}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center">
      <div className="w-full max-w-5xl px-6 py-8">
        <Header />

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-6">
          {/* Controls Section */}
          <div className="lg:col-span-4 bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col gap-8 h-fit lg:sticky lg:top-8">
            
            <section>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-3">
                <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs">1</span>
                Nombre Personalizado
              </label>
              <input
                type="text"
                placeholder="Escribe el nombre aquí..."
                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-rose-500 transition-all outline-none text-lg font-medium"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
              />
            </section>

            <section>
              <div className="flex justify-between items-center mb-3">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
                  <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs">2</span>
                  Tamaño del Nombre
                </label>
                <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-md">{nameSize}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="1"
                value={nameSize}
                onChange={(e) => setNameSize(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-rose-600 transition-all"
              />
              <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                <span>Fino / Pequeño</span>
                <span>Grueso / Grande</span>
              </div>
            </section>

            <section>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-3">
                <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs">3</span>
                Imagen de Referencia
              </label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-36 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-rose-50 hover:border-rose-200 transition-all overflow-hidden group"
              >
                {referenceImage ? (
                  <div className="relative w-full h-full">
                    <img 
                      src={`data:image/png;base64,${referenceImage}`} 
                      className="w-full h-full object-cover" 
                      alt="Referencia" 
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold">
                      Cambiar diseño base
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-xs text-gray-400 font-medium">Sube el ejemplo que quieres replicar</span>
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
              />
            </section>

            <button
              onClick={handleGenerate}
              disabled={status === AppStatus.GENERATING}
              className={`w-full py-5 rounded-2xl font-black text-white shadow-xl transition-all transform active:scale-[0.98] uppercase tracking-widest text-sm ${
                status === AppStatus.GENERATING 
                ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                : 'bg-rose-600 hover:bg-rose-700 hover:shadow-rose-200 shadow-rose-100'
              }`}
            >
              {status === AppStatus.GENERATING ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div>
                  Procesando...
                </div>
              ) : (
                'Generar Diseño'
              )}
            </button>

            {errorMsg && (
              <p className="text-xs text-red-500 text-center font-bold">
                {errorMsg}
              </p>
            )}
          </div>

          {/* Result Section */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-white p-2 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden">
              
              {!result && status === AppStatus.IDLE && (
                <div className="text-center max-w-sm px-8">
                  <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-12 transition-transform hover:rotate-0">
                    <svg className="w-10 h-10 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3 tracking-tight">Personaliza tu arte</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Ajusta el nombre, define el tamaño ideal y nuestro motor de IA creará el diseño perfecto listo para descargar.
                  </p>
                </div>
              )}

              {status === AppStatus.GENERATING && (
                <div className="flex flex-col items-center gap-6">
                  <div className="relative">
                    <div className="w-32 h-32 border-4 border-rose-50 border-t-rose-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl animate-pulse">🌹</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-800 font-bold text-lg mb-1">Esculpiendo diseño...</p>
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">Uniendo letras al tallo</p>
                  </div>
                </div>
              )}

              {status === AppStatus.SUCCESS && result && (
                <div className="w-full flex flex-col items-center p-2">
                  <div className="relative group w-full bg-[#fdfdfd] rounded-[1.5rem] overflow-hidden">
                    <img
                      src={result.imageUrl}
                      alt="Rosa personalizada"
                      className="w-full h-auto object-contain p-8 md:p-12 transition-all duration-700"
                    />
                    <div className="absolute top-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                        onClick={handleDownload}
                        className="p-4 bg-white shadow-2xl rounded-2xl hover:bg-rose-600 hover:text-white transition-all text-gray-800 border border-gray-100"
                        title="Descargar"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1h16v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-8 w-full max-w-2xl flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                    <div className="text-center md:text-left">
                      <p className="text-[10px] uppercase tracking-widest font-black text-rose-500 mb-1">Diseño Generado</p>
                      <h4 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        {result.name} <span className="text-gray-300 font-light">|</span> <span className="text-sm font-medium text-gray-500">{nameSize}% escala</span>
                      </h4>
                    </div>
                    <button 
                      onClick={handleDownload}
                      className="w-full md:w-auto px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl"
                    >
                      Descargar para Corte
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white rounded-3xl border border-gray-100 flex items-start gap-5 shadow-sm">
                <div className="w-12 h-12 shrink-0 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm mb-1">Optimizado para CNC</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">Lineas gruesas y continuas perfectas para corte en madera o metal.</p>
                </div>
              </div>
              <div className="p-6 bg-white rounded-3xl border border-gray-100 flex items-start gap-5 shadow-sm">
                <div className="w-12 h-12 shrink-0 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm mb-1">Soldadura Estética</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">El nombre se fusiona orgánicamente con el tallo para máxima resistencia.</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
