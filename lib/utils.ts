import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * A utility function that merges Tailwind CSS classes with clsx.
 * @param inputs - The class values to merge.
 * @returns The merged class value.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
