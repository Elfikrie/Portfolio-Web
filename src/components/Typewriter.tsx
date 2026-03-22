"use client";

import React, { useState, useEffect } from 'react';

export interface TypewriterWord {
  text: string;
  className?: string; // e.g. "text-salmon-500"
}

interface TypewriterProps {
  words: (string | TypewriterWord)[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
}

export const Typewriter: React.FC<TypewriterProps> = ({
  words,
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseDuration = 2000,
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Normalize words array
  const normalizedWords = words.map(w => 
    typeof w === 'string' ? { text: w, className: '' } : w
  );

  useEffect(() => {
    const handleTyping = () => {
      const currentWordObj = normalizedWords[currentWordIndex];
      const currentWord = currentWordObj.text;
      
      if (isDeleting) {
        setCurrentText(currentWord.substring(0, currentText.length - 1));
      } else {
        setCurrentText(currentWord.substring(0, currentText.length + 1));
      }

      let timeoutSpeed = isDeleting ? deletingSpeed : typingSpeed;

      if (!isDeleting && currentText === currentWord) {
        timeoutSpeed = pauseDuration;
        setIsDeleting(true);
      } else if (isDeleting && currentText === '') {
        setIsDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % normalizedWords.length);
        timeoutSpeed = 500;
      }
      
      return timeoutSpeed;
    };

    const timer = setTimeout(handleTyping, isDeleting ? deletingSpeed : typingSpeed);
    
    if (!isDeleting && currentText === normalizedWords[currentWordIndex].text) {
       clearTimeout(timer);
       setTimeout(() => setIsDeleting(true), pauseDuration);
    } else if (isDeleting && currentText === '') {
       clearTimeout(timer);
       setTimeout(() => {
         setIsDeleting(false);
         setCurrentWordIndex((prev) => (prev + 1) % normalizedWords.length);
       }, 500);
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIndex, normalizedWords, typingSpeed, deletingSpeed, pauseDuration]);

  const activeClassName = normalizedWords[currentWordIndex].className || "";

  return (
    <span className={`inline-block min-w-[20px] border-r-2 border-salmon-500 pr-1 animate-pulse transition-colors duration-300 ${activeClassName}`}>
      {currentText}
    </span>
  );
};
