
import { BusinessCard } from "../../types";

export interface StorageOperationResult {
  success: boolean;
  data?: BusinessCard;
  error?: string;
}

export interface StorageConfig {
  useSupabase: boolean;
  fallbackToLocal: boolean;
}
