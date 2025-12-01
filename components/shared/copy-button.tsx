"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  text: string;
  className?: string;
  variant?: "default" | "ghost" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  label?: string;
  copiedLabel?: string;
  onCopied?: () => void;
}

/**
 * Reusable Copy to Clipboard Button
 * Used across shops (Lucy's LyricsCard, etc.)
 */
export function CopyButton({
  text,
  className,
  variant = "outline",
  size = "sm",
  label = "Copy",
  copiedLabel = "Copied!",
  onCopied,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopied?.();
      
      // Reset after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  }, [text, onCopied]);

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={cn(
        "transition-all duration-200",
        copied && "bg-green-600 hover:bg-green-600 text-white border-green-600",
        className
      )}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 mr-1" />
          {copiedLabel}
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 mr-1" />
          {label}
        </>
      )}
    </Button>
  );
}

/**
 * Hook for copy functionality without the button UI
 * Useful when you need custom copy behavior
 */
export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch (err) {
      console.error("Failed to copy:", err);
      return false;
    }
  }, []);

  return { copied, copy };
}





