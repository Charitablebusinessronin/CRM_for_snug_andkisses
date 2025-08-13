import catalyst from 'zcatalyst-sdk-node';
import { logger } from '../../utils/logger';

export class CatalystCacheRepository {
  private static getSegment(segmentId: string) {
    const app = catalyst.initialize({});
    return app.cache().segment(segmentId);
  }

  static async get<T = any>(key: string, segmentId = 'default'): Promise<T | null> {
    try {
      const segment = this.getSegment(segmentId);
      const val: any = await segment.get(key);
      if (val == null) return null;

      // Normalize to string when possible
      const asString = typeof val === 'string' ? val : (Buffer.isBuffer(val) ? val.toString('utf8') : null);
      if (asString !== null) {
        try {
          return JSON.parse(asString) as T;
        } catch {
          return (asString as unknown) as T; // fallback raw string
        }
      }

      // Fallback: return as-is
      return (val as unknown) as T;
    } catch (err) {
      logger.warn('Catalyst cache get failed', { key, segmentId, err });
      return null;
    }
  }

  static async put<T = any>(key: string, value: T, ttlSeconds: number, segmentId = 'default'): Promise<boolean> {
    try {
      const segment = this.getSegment(segmentId);
      const payload = typeof value === 'string' ? value : JSON.stringify(value);
      await segment.put(key, payload, ttlSeconds);
      return true;
    } catch (err) {
      logger.warn('Catalyst cache put failed', { key, segmentId, err });
      return false;
    }
  }

  static async delete(key: string, segmentId = 'default'): Promise<boolean> {
    try {
      const segment = this.getSegment(segmentId);
      await segment.delete(key);
      return true;
    } catch (err) {
      logger.warn('Catalyst cache delete failed', { key, segmentId, err });
      return false;
    }
  }
}
