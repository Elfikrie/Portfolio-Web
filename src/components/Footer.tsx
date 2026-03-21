import React from "react";

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-salmon-500/20 bg-background py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} Personal Portfolio. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <a href="#" className="hover:text-salmon-400 transition-colors">Twitter</a>
          <a href="#" className="hover:text-salmon-400 transition-colors">GitHub</a>
          <a href="#" className="hover:text-salmon-400 transition-colors">LinkedIn</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
