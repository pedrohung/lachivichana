// Panel de administración: constantes y utilidades de cliente.
// El control de acceso REAL vive en el servidor:
//  - regla 'listRule' de la colección 'users' en PocketBase (solo CuquiPro)
//  - server function 'listarUsuariosAdmin' (verifica el email autenticado)
// Este módulo solo decide si se muestra el enlace en la interfaz.

export const ADMIN_EMAIL = "hungpedros@gmail.com";

export function esAdmin(email: string | null | undefined): boolean {
  return !!email && email.toLowerCase() === ADMIN_EMAIL;
}
