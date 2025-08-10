import { CatalystCacheRepository } from '../repositories/catalyst/cache.repository';

export class CacheService {
  static async get<T = any>(key: string, segment = 'default'): Promise<T | null> {
    return CatalystCacheRepository.get<T>(key, segment);
    }

  static async set<T = any>(key: string, value: T, ttlSeconds: number, segment = 'default'): Promise<boolean> {
    return CatalystCacheRepository.put<T>(key, value, ttlSeconds, segment);
  }

  static async del(key: string, segment = 'default'): Promise<boolean> {
    return CatalystCacheRepository.delete(key, segment);
  }
}
