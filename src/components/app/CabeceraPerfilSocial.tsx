import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { obtenerPocketBase } from "@/lib/pocketbase";
import {
  obtenerPerfilPublicoPorAlias,
  estoySiguiendoA,
  seguirAUsuario,
  dejarDeSeguirAUsuario,
  iniciarConversacionCon,
  type PerfilBusqueda,
} from "@/datos/servicios";

/** Cabecera social del perfil público: avatar, alias, bio + Seguir y Enviar mensaje. */
export default function CabeceraPerfilSocial({ alias }: { alias: string }) {
  const navegar = useNavigate();
  const [perfil, setPerfil] = useState<PerfilBusqueda | null>(null);
  const [siguiendo, setSiguiendo] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const yo = obtenerPocketBase()?.authStore.model?.id ?? null;

  useEffect(() => {
    let vivo = true;
    (async () => {
      const p = await obtenerPerfilPublicoPorAlias(alias).catch(() => null);
      if (!vivo) return;
      setPerfil(p);
      setSiguiendo(p ? await estoySiguiendoA(p.id).catch(() => false) : false);
    })();
    return () => { vivo = false; };
  }, [alias]);

  if (!perfil || (yo && perfil.id === yo)) return null;

  const alternarSeguir = async () => {
    setOcupado(true);
    try {
      if (siguiendo) await dejarDeSeguirAUsuario(perfil.id);
      else await seguirAUsuario(perfil.id);
      setSiguiendo(!siguiendo);
    } finally {
      setOcupado(false);
    }
  };

  const enviarMensaje = async () => {
    setOcupado(true);
    try {
      const id = await iniciarConversacionCon(perfil.id);
      navegar({ to: "/mensajes", search: { hiloId: id } });
    } finally {
      setOcupado(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4">
      {perfil.avatarUrl ? (
        <img src={perfil.avatarUrl} alt={"Avatar de " + perfil.alias} className="h-16 w-16 rounded-full object-cover" />
      ) : (
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-2xl font-bold">
          {perfil.alias.slice(0, 1).toUpperCase()}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-xl font-bold">@{perfil.alias}</h1>
        {perfil.bio ? <p className="truncate text-sm text-muted-foreground">{perfil.bio}</p> : null}
      </div>
      <div className="flex shrink-0 gap-2">
        <Button variant={siguiendo ? "contorno" : "default"} size="sm" onClick={alternarSeguir} disabled={ocupado}>
          {siguiendo ? "Dejar de seguir" : "Seguir"}
        </Button>
        <Button variant="contorno" size="sm" onClick={enviarMensaje} disabled={ocupado}>
          Enviar mensaje
        </Button>
      </div>
    </div>
  );
}
