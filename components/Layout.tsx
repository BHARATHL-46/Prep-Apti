
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  headerContent?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children, headerContent }) => {
  return (
    <div className="min-h-screen flex flex-col items-center bg-[#FBFBFD]">
      <header className="w-full h-14 flex items-center justify-between px-6 md:px-12 sticky top-0 z-50 bg-white/80 apple-blur border-b border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-black rounded-sm flex items-center justify-center">
              <span className="text-white font-black text-[10px]">P</span>
            </div>
            <span className="font-black text-sm tracking-[0.2em] uppercase">PreAptiAI</span>
          </div>
          
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border border-gray-100 bg-gray-50/50">
            <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">
              Personal Edition
            </span>
          </div>
        </div>
        <div>
          {headerContent}
        </div>
      </header>
      <main className="w-full max-w-5xl px-6 py-12 md:py-16 flex-grow">
        {children}
      </main>
      <footer className="w-full py-8 text-center text-gray-300 text-[10px] font-black uppercase tracking-[0.3em] border-t border-gray-50">
        &copy; {new Date().getFullYear()} PreAptiAI • Professional Mastery Suite
      </footer>
    </div>
  );
};

export default Layout;
