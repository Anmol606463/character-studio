import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, PerspectiveCamera, Environment, ContactShadows, Html, useProgress } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Activity, Box, Loader2, Maximize2 } from 'lucide-react';
import { HumanModel } from './components/HumanModel';

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-6 bg-[#0a0a0a]/90 backdrop-blur-2xl p-12 rounded-[2rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="relative">
          <Loader2 size={48} className="text-blue-500 animate-spin" />
        </div>
        <div className="space-y-3 text-center">
          <p className="text-2xl font-bold title-font text-white tracking-tight">Generating Body Mesh</p>
          <div className="w-64 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400"
            />
          </div>
          <p className="text-[10px] text-white/40 font-mono uppercase tracking-[0.3em] font-bold">{progress.toFixed(0)}% Assembled</p>
        </div>
      </div>
    </Html>
  );
}

const INITIAL_MEASUREMENTS = {
  gender: 'male' as 'male' | 'female',
  height: 170,
  weight: 70,
  chest: 95,
  waist: 80,
  hips: 92,
  thigh: 55,
  armLength: 60,
};

function App() {
  const [measurements, setMeasurements] = useState(INITIAL_MEASUREMENTS);
  const [skinColor, setSkinColor] = useState('#e8beac');
  const [hairColor, setHairColor] = useState('#3d2b1f');

  const handleUpdate = (key: keyof typeof INITIAL_MEASUREMENTS, value: string | number) => {
    setMeasurements(prev => ({
      ...prev,
      [key]: key === 'gender' ? value : (typeof value === 'string' ? parseFloat(value) || 0 : value)
    }));
  };

  return (
    <div className="relative w-full h-full bg-[#050505] text-white overflow-hidden selection:bg-blue-500/30 font-sans">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1a1919_0%,#000_100%)]" />
        <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows dpr={[1, 2]}>
          <PerspectiveCamera makeDefault position={[0, 1.5, 3.5]} fov={45} />
          <Suspense fallback={<Loader />}>
            <Stage environment="city" intensity={0.6} shadows="contact" adjustCamera={false}>
              <HumanModel measurements={measurements} skinColor={skinColor} hairColor={hairColor} />
            </Stage>
            {/* Soft lighting environment for realistic skin shading look */}
            <Environment preset="studio" />
            <ambientLight intensity={0.4} />
            <spotLight position={[5, 5, 5]} intensity={0.8} castShadow angle={0.3} penumbra={1} />
            <ContactShadows position={[0, -0.9, 0]} opacity={0.6} scale={15} blur={2.5} far={4} color="#000000" />
          </Suspense>
          <OrbitControls 
            makeDefault 
            enableZoom={true}
            minPolarAngle={Math.PI / 4} 
            maxPolarAngle={Math.PI / 1.5} 
            enableDamping
            dampingFactor={0.05}
          />
        </Canvas>
      </div>

      {/* Header */}
      <header className="absolute top-8 left-10 z-10 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-1"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-black/40 rounded-2xl border border-white/10 backdrop-blur-xl shadow-xl">
              <Box size={24} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tighter text-white/90 drop-shadow-sm">Character<span className="text-blue-500">Studio</span></h1>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-bold mt-1">Professional Human Configurator</p>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Main Control UI */}
      <motion.aside 
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        className="absolute right-8 top-1/2 -translate-y-1/2 z-10 w-[340px] bg-black/30 backdrop-blur-2xl p-8 space-y-8 border border-white/10 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-visible"
      >
          {/* Appearance Section */}
          <div className="space-y-4 border-t border-white/5 pt-4">
             <div className="flex items-center gap-2 text-blue-400">
               <Activity size={12} className="opacity-50" />
               <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">Personalization</span>
             </div>
             
             {/* Skin Tone Presets */}
             <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.1em]">Skin Tone</label>
                <div className="flex gap-2">
                   {['#e8beac', '#d09172', '#a06a4f', '#623f2f', '#442a1d'].map(color => (
                     <button 
                       key={color}
                       onClick={() => setSkinColor(color)}
                       className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${skinColor === color ? 'border-blue-500' : 'border-transparent'}`}
                       style={{ backgroundColor: color }}
                     />
                   ))}
                </div>
             </div>

             {/* Hair Color Presets */}
             <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.1em]">Hair Color</label>
                <div className="flex gap-2">
                   {['#3d2b1f', '#201813', '#624233', '#9c6f44', '#f1c27d'].map(color => (
                     <button 
                       key={color}
                       onClick={() => setHairColor(color)}
                       className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${hairColor === color ? 'border-blue-500' : 'border-transparent'}`}
                       style={{ backgroundColor: color }}
                     />
                   ))}
                </div>
             </div>
          </div>

          <div className="space-y-2 border-t border-white/5 pt-4">
            <div className="flex items-center gap-2 text-blue-500">
              <Activity size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Body Proportions</span>
            </div>
            <p className="text-[10px] text-white/50 leading-relaxed pb-2">
              Deep skeletal transformations based on medical-grade average ratios.
            </p>
          </div>

        {/* Input Controls */}
        <div className="space-y-5 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
          
          {/* Gender Toggle */}
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 mb-2">
            <button 
              onClick={() => handleUpdate('gender', 'male')}
              className={`flex-1 py-1.5 text-[10px] font-bold tracking-widest uppercase rounded-lg transition-colors ${measurements.gender === 'male' ? 'bg-blue-500 text-white shadow-lg' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
            >
              Male
            </button>
            <button 
              onClick={() => handleUpdate('gender', 'female')}
              className={`flex-1 py-1.5 text-[10px] font-bold tracking-widest uppercase rounded-lg transition-colors ${measurements.gender === 'female' ? 'bg-pink-500 text-white shadow-lg' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
            >
              Female
            </button>
          </div>

          {(Object.keys(INITIAL_MEASUREMENTS) as Array<keyof typeof INITIAL_MEASUREMENTS>).map((key) => {
            if (key === 'gender') return null;

            const labels: Record<string, string> = {
              height: 'Height (cm)',
              weight: 'Weight (kg)',
              chest: 'Chest Circ. (cm)',
              waist: 'Waist Circ. (cm)',
              hips: 'Hips Circ. (cm)',
              thigh: 'Thigh Circ. (cm)',
              armLength: 'Arm Length (cm)'
            };
            const limits: Record<string, [number, number]> = {
              height: [140, 220],
              weight: [40, 150],
              chest: [70, 140],
              waist: [60, 130],
              hips: [70, 140],
              thigh: [40, 90],
              armLength: [50, 80]
            };

            const val = measurements[key] as number;
            const [min, max] = limits[key];

            return (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="text-[11px] font-bold text-white/60 uppercase tracking-widest">{labels[key]}</label>
                  <span className="text-xs font-mono text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-md">
                    {val.toFixed(1)}
                  </span>
                </div>
                
                <div className="relative group flex items-center h-4">
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step="0.5"
                    value={val}
                    onChange={(e) => handleUpdate(key, e.target.value)}
                    className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all z-10"
                  />
                  {/* Range Track Glow */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-blue-500/40 rounded-full pointer-events-none" 
                    style={{ width: `${((val - min) / (max - min)) * 100}%` }} 
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4 group hover:bg-white/[0.07] transition-colors relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-500/20">
             <Maximize2 size={14} className="text-blue-400" />
          </div>
          <p className="text-[10px] leading-relaxed text-white/50">
            <strong className="text-blue-400/80 mr-1">360° VIEW:</strong> Drag on the model to rotate and inspect proportions.
          </p>
        </div>
      </motion.aside>

      {/* Bottom Info */}
      <div className="absolute bottom-8 left-10 flex items-center gap-6 z-10 pointer-events-none">
        <div className="flex items-center gap-3">
           <div className="relative flex h-3 w-3">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]"></span>
           </div>
           <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Engine Running</p>
        </div>
        <div className="w-px h-4 bg-white/10" />
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Proportions Locked</p>
      </div>
    </div>
  );
}

export default App;
