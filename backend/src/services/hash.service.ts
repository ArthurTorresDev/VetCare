import crypto from 'node:crypto';
import { authConfig } from '../config/auth.config.js';

export class HashService {
  private static instance: HashService;

  public static getInstance(): HashService {
    if (!HashService.instance) {
      HashService.instance = new HashService();
    }
    return HashService.instance;
  }

  /**
   * Gera um hash criptográfico seguro para a senha utilizando scrypt (OWASP / NIST).
   * O formato resultante é: scrypt$cost=16384,r=8,p=1$<salt_hex>$<derived_key_hex>
   */
  public async hash(password: string): Promise<string> {
    const salt = crypto.randomBytes(authConfig.hash.saltLength);
    const derivedKey = await new Promise<Buffer>((resolve, reject) => {
      crypto.scrypt(
        password,
        salt,
        authConfig.hash.keyLength,
        {
          N: authConfig.hash.cost,
          r: authConfig.hash.blockSize,
          p: authConfig.hash.parallelization,
          maxmem: 64 * 1024 * 1024,
        },
        (err, key) => {
          if (err) reject(err);
          else resolve(key);
        },
      );
    });

    const saltHex = salt.toString('hex');
    const keyHex = derivedKey.toString('hex');
    return `scrypt$N=${authConfig.hash.cost},r=${authConfig.hash.blockSize},p=${authConfig.hash.parallelization}$${saltHex}$${keyHex}`;
  }

  /**
   * Compara uma senha em texto plano com um hash armazenado usando timingSafeEqual
   * para prevenir timing attacks.
   */
  public async compare(password: string, storedHash: string): Promise<boolean> {
    if (!storedHash || !password) return false;

    try {
      const parts = storedHash.split('$');
      if (parts.length !== 4 || parts[0] !== 'scrypt') {
        return false;
      }

      const params = parts[1];
      const saltHex = parts[2];
      const originalKeyHex = parts[3];

      // Parse dos parâmetros scrypt
      const paramMap: Record<string, number> = {};
      params.split(',').forEach((p) => {
        const [k, v] = p.split('=');
        if (k && v) paramMap[k] = Number(v);
      });

      const salt = Buffer.from(saltHex, 'hex');
      const originalKey = Buffer.from(originalKeyHex, 'hex');

      const derivedKey = await new Promise<Buffer>((resolve, reject) => {
        crypto.scrypt(
          password,
          salt,
          originalKey.length,
          {
            N: paramMap.N || authConfig.hash.cost,
            r: paramMap.r || authConfig.hash.blockSize,
            p: paramMap.p || authConfig.hash.parallelization,
            maxmem: 64 * 1024 * 1024,
          },
          (err, key) => {
            if (err) reject(err);
            else resolve(key);
          },
        );
      });

      if (derivedKey.length !== originalKey.length) {
        return false;
      }

      return crypto.timingSafeEqual(derivedKey, originalKey);
    } catch {
      return false;
    }
  }

  /**
   * Executa uma comparação simulada com tempo de computação equivalente
   * para prevenir enumeração de usuários por análise de tempo de resposta (Timing Attack).
   */
  public async dummyCompare(): Promise<void> {
    const dummySalt = crypto.randomBytes(authConfig.hash.saltLength);
    await new Promise<void>((resolve) => {
      crypto.scrypt(
        'dummy_enumeration_defense_password',
        dummySalt,
        authConfig.hash.keyLength,
        {
          N: 1024, // custo moderado para não onerar o servidor, mas nivelar o tempo
          r: authConfig.hash.blockSize,
          p: authConfig.hash.parallelization,
        },
        () => resolve(),
      );
    });
  }
}

export const hashService = HashService.getInstance();
