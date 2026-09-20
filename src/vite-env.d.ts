/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base de PocketBase. Si no se define, el cliente usa "/pb". */
  readonly VITE_POCKETBASE_URL?: string;
}
