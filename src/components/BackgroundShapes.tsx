'use client';

export default function BackgroundShapes() {
    return (
        <div className="mesh-bg-container overflow-hidden bg-slate-50">
            {/* Vibrant Mesh Gradient Blobs */}
            <div className="mesh-blob mesh-1 mix-blend-multiply"></div>
            <div className="mesh-blob mesh-2 mix-blend-multiply"></div>
            <div className="mesh-blob mesh-3 mix-blend-multiply"></div>
            <div className="mesh-blob mesh-4 mix-blend-multiply"></div>
            <div className="mesh-blob mesh-5 mix-blend-multiply"></div>

            {/* Colorful Geometric Figures */}

            {/* 1. Purple & Orange Gradient Sphere */}
            <div
                className="absolute top-[5%] right-[5%] w-40 h-40 md:w-72 md:h-72 rounded-full animate-float shadow-2xl opacity-80"
                style={{
                    background: 'linear-gradient(135deg, #f97316 0%, #a855f7 100%)',
                    animationDelay: '0s'
                }}
            >
                <div className="absolute top-4 left-4 w-1/2 h-1/2 bg-white/40 rounded-full blur-md"></div>
            </div>

            {/* 2. Vibrant Blue & Green Cube (Rotated) */}
            <div
                className="absolute bottom-[20%] left-[8%] w-32 h-32 md:w-56 md:h-56 animate-float shadow-xl rounded-2xl md:rounded-[40px] opacity-80"
                style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #22c55e 100%)',
                    animationDelay: '-3s',
                    transform: 'rotate(25deg)'
                }}
            >
                <div className="absolute top-2 left-2 w-full h-4 bg-white/30 blur-[2px] rounded-t-3xl"></div>
            </div>

            {/* 3. Pink & Purple Pill Shape */}
            <div
                className="absolute top-[40%] right-[15%] w-20 h-40 md:w-32 md:h-64 rounded-full animate-float shadow-lg opacity-80"
                style={{
                    background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                    animationDelay: '-1.5s',
                    transform: 'rotate(-35deg)'
                }}
            >
                <div className="absolute top-4 left-4 w-4 h-1/2 bg-white/30 rounded-full blur-sm"></div>
            </div>

            {/* 4. Bright Yellow Floating Ring */}
            <div
                className="absolute top-[60%] left-[20%] w-24 h-24 md:w-40 md:h-40 border-[16px] border-yellow-400 rounded-full animate-float opacity-70"
                style={{ animationDelay: '-6s' }}
            ></div>

            {/* 5. Floating Triangle SVG */}
            <div
                className="absolute top-[20%] left-[40%] w-20 h-20 animate-spin-slow opacity-60"
                style={{ animationDuration: '20s' }}
            >
                <svg viewBox="0 0 100 100" className="w-full h-full text-red-500 fill-current drop-shadow-lg">
                    <polygon points="50,10 90,90 10,90" />
                </svg>
            </div>

            {/* Floating Glass Panel to add depth */}
            <div className="absolute bottom-[10%] right-[30%] w-48 h-32 glass-3d rounded-xl animate-float" style={{ animationDelay: '-4s', transform: 'rotate(-10deg) skewX(10deg)' }}></div>

            {/* Tiny Colorful Accents */}
            <div className="absolute top-[15%] left-[20%] w-6 h-6 rounded-full bg-blue-500 blur-[2px] animate-pulse-slow"></div>
            <div className="absolute bottom-[40%] right-[45%] w-10 h-10 rounded-lg bg-orange-400 rotate-45 animate-float" style={{ animationDelay: '-2s' }}></div>
            <div className="absolute top-[80%] left-[50%] w-4 h-4 rounded-full bg-green-500 blur-[1px] animate-pulse-slow"></div>

            {/* Subtle Grid overlay for texture */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            {/* Glass Overlay to ensure text readability */}
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[4px]"></div>
        </div>
    );
}
