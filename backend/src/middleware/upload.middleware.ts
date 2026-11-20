import multer from 'multer';

// Armazenamento em memória (RAM Buffer) para upload direto ao Supabase Storage
const storage = multer.memoryStorage();

// Tipos MIME permitidos para fotos de animais
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Limite razoável de tamanho: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const uploadPetFotoMiddleware = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          'Formato de arquivo inválido. Permitido apenas imagens JPEG, PNG, WebP e GIF.',
        ),
      );
    }
  },
});
