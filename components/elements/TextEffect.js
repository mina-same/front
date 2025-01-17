'use client'
import { useState, useEffect, useCallback } from 'react';

const TextEffect = ({ 
  texts = [], 
  typingSpeed = 100,
  pauseTime = 2000
}) => {
  const [displayText, setDisplayText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [isTypingForward, setIsTypingForward] = useState(true);
  const [isWaiting, setIsWaiting] = useState(false);

  const typeText = useCallback(() => {
    const currentFullText = texts[textIndex];

    if (isWaiting) return;

    if (isTypingForward) {
      if (displayText.length < currentFullText.length) {
        setDisplayText(currentFullText.slice(0, displayText.length + 1));
      } else {
        setIsWaiting(true);
        setTimeout(() => {
          setIsWaiting(false);
          setIsTypingForward(false);
        }, pauseTime);
      }
    } else {
      if (displayText.length > 0) {
        setDisplayText(currentFullText.slice(0, displayText.length - 1));
      } else {
        setIsTypingForward(true);
        setTextIndex((prev) => (prev + 1) % texts.length);
      }
    }
  }, [displayText, textIndex, isTypingForward, isWaiting, texts, pauseTime]);

  useEffect(() => {
    if (texts.length === 0) return;

    const timer = setInterval(typeText, typingSpeed);
    return () => clearInterval(timer);
  }, [typeText, typingSpeed, texts]);

  return (
    <div className="inline-block">
      <span>{displayText}</span>
      <span className="border-r-2 border-black ml-1 animate-pulse">|</span>
    </div>
  );
};

export default TextEffect;