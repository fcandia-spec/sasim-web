import { supabase } from '@/lib/supabase';

/**
 * COMENTARIO SERVICE
 * 
 * Gestiona operaciones de comentarios con enfoque en administración.
 * - Borrado seguro con backup
 * - Filtrado por fecha
 * - Solo para roles admin
 */

export interface DeleteCommentResult {
  success: boolean;
  deletedCount: number;
  error?: string;
}

/**
 * Opción B: Borrar TODOS los comentarios vía RPC (Stored Procedure en Supabase)
 * 
 * IMPORTANTE: Esta función requiere una función SQL en Supabase.
 * Ver instrucciones en docs/SETUP_COMMENTS_CLEANUP.md
 */
export async function deleteAllCommentsViaRPC(): Promise<DeleteCommentResult> {
  try {
    const { data, error } = await supabase
      .rpc('delete_all_comments_with_backup');

    if (error) {
      console.error('Error ejecutando RPC:', error);
      return {
        success: false,
        deletedCount: 0,
        error: `Error en operación: ${error.message}`
      };
    }

    return {
      success: true,
      deletedCount: data?.deleted_count || 0,
      error: undefined
    };
  } catch (e) {
    console.error('Error inesperado en deleteAllCommentsViaRPC:', e);
    return {
      success: false,
      deletedCount: 0,
      error: 'Error inesperado al eliminar comentarios'
    };
  }
}

/**
 * Opción B: Borrar comentarios más antiguos que X días
 * 
 * Más seguro que borrar todos - permite limpiar gradualmente
 * 
 * @param daysOld - Número de días. Ej: 7 = borra comentarios de hace 7+ días
 */
export async function deleteOldComments(daysOld: number): Promise<DeleteCommentResult> {
  if (daysOld < 1) {
    return {
      success: false,
      deletedCount: 0,
      error: 'daysOld debe ser mayor a 0'
    };
  }

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    const cutoffISO = cutoffDate.toISOString();

    // Primero contar cuántos vamos a borrar
    const { count } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', cutoffISO);

    // Luego borrar
    const { error } = await supabase
      .from('comments')
      .delete()
      .lt('created_at', cutoffISO);

    if (error) {
      return {
        success: false,
        deletedCount: 0,
        error: `Error borrando: ${error.message}`
      };
    }

    return {
      success: true,
      deletedCount: count || 0,
      error: undefined
    };
  } catch (e) {
    console.error('Error en deleteOldComments:', e);
    return {
      success: false,
      deletedCount: 0,
      error: 'Error inesperado'
    };
  }
}

/**
 * Opción C - INFORMACIÓN: Crear backup manual de comentarios
 * 
 * Esta función LEERÁ todos los comentarios para respaldarlos localmente
 * (no los borra, solo los descarga)
 * 
 * NUNCA ejecutar esta automáticamente - solo manualmente desde admin panel
 */
export async function backupAllComments(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return {
        success: false,
        error: `Error leyendo comentarios: ${error.message}`
      };
    }

    // Descargar como JSON (el usuario lo guarda en su PC)
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `comments-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return {
      success: true,
      data,
      error: undefined
    };
  } catch (e) {
    console.error('Error en backupAllComments:', e);
    return {
      success: false,
      error: 'Error descargando backup'
    };
  }
}

/**
 * RESTAURAR desde backup JSON
 * 
 * Si borras comentarios accidentalmente, puedes restaurarlos
 * Sube el archivo JSON descargado anteriormente
 */
export async function restoreCommentBackup(jsonFile: File): Promise<DeleteCommentResult> {
  try {
    const text = await jsonFile.text();
    const comments = JSON.parse(text);

    if (!Array.isArray(comments)) {
      return {
        success: false,
        deletedCount: 0,
        error: 'El archivo JSON debe ser un array'
      };
    }

    // Insertar todos los comentarios
    const { error } = await supabase
      .from('comments')
      .insert(comments);

    if (error) {
      return {
        success: false,
        deletedCount: 0,
        error: `Error restaurando: ${error.message}`
      };
    }

    return {
      success: true,
      deletedCount: comments.length,
      error: undefined
    };
  } catch (e) {
    console.error('Error en restoreCommentBackup:', e);
    return {
      success: false,
      deletedCount: 0,
      error: 'Error leyendo archivo JSON'
    };
  }
}
