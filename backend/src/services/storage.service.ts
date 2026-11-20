import { getSupabaseClient, SUPABASE_BUCKET_PET_FOTOS } from './supabase.service.js';

export class StorageService {
  /**
   * Realiza o upload de uma foto de pet para o Supabase Storage no bucket `pet-fotos`.
   * Gera nome único para evitar colisões e retorna a URL pública acessível.
   */
  async uploadPetFoto(
    petId: string,
    fileBuffer: Buffer,
    mimeType: string,
    originalName: string,
  ): Promise<string> {
    const supabase = getSupabaseClient();
    const ext = originalName.split('.').pop() || 'jpg';
    const uniqueFileName = `${petId}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = `pets/${uniqueFileName}`;

    if (!supabase) {
      // Quando o Supabase ainda não estiver configurado com credenciais válidas,
      // geramos um caminho canônico simulado/local seguro pronto para a transição
      return `/storage/${SUPABASE_BUCKET_PET_FOTOS}/${filePath}`;
    }

    const { error: uploadError } = await supabase.storage
      .from(SUPABASE_BUCKET_PET_FOTOS)
      .upload(filePath, fileBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Falha no upload para o Supabase Storage: ${uploadError.message}`);
    }

    const { data } = supabase.storage
      .from(SUPABASE_BUCKET_PET_FOTOS)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  /**
   * Remove uma fotografia anterior do pet para evitar arquivos órfãos no bucket.
   */
  async deletePetFoto(fotoUrl?: string): Promise<void> {
    if (!fotoUrl) return;

    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      // Extrair o caminho relativo dentro do bucket se for URL do Supabase
      const match = fotoUrl.match(new RegExp(`/${SUPABASE_BUCKET_PET_FOTOS}/(.+)$`));
      if (match && match[1]) {
        const filePath = decodeURIComponent(match[1]);
        await supabase.storage.from(SUPABASE_BUCKET_PET_FOTOS).remove([filePath]);
      }
    } catch (err) {
      console.warn('[StorageService] Aviso ao remover foto antiga:', err);
    }
  }
}

export const storageService = new StorageService();
