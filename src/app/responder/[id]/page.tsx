"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResponderExamen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [preguntas, setPreguntas] = useState<any[]>([]);
  const [mensaje, setMensaje] = useState("");
  const [indice, setIndice] = useState(0);
  const [respuesta, setRespuesta] = useState("");
  const [retro, setRetro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:8000/examenes/${id}/preguntas`)
      .then((res) => res.json())
      .then((data) => setPreguntas(data))
      .catch(() => setMensaje("No se pudieron cargar las preguntas"));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setRetro(null);

    const correo = localStorage.getItem("correo");
    const contrasena = localStorage.getItem("contrasena");
    const estudiante_id = localStorage.getItem("estudiante_id") || "1";

    try {
      const res = await fetch("http://localhost:8000/responder", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          estudiante_id,
          examen_id: id || "",
          respuesta_texto: respuesta,
          tiempo_respuesta: "0",
          username: correo || "",
          password: contrasena || "",
          enunciado: preguntas[indice].enunciado, // Aquí se envía el enunciado
        }).toString(),
      });

      if (!res.ok) throw new Error("Error al enviar la respuesta");
      const data = await res.json();
      setRetro(data.retroalimentacion_ia || "Respuesta recibida.");

      setRespuesta("");
      if (indice < preguntas.length - 1) {
        setTimeout(() => {
          setIndice(indice + 1);
          setRetro(null);
        }, 2000);
      } else {
        setMensaje("¡Examen completado!");
      }
    } catch (err) {
      setMensaje("Error al enviar la respuesta");
    } finally {
      setEnviando(false);
    }
  };

  if (mensaje) {
    return (
      <main className="p-4">
        <h1 className="text-xl font-bold mb-4">Responder examen</h1>
        <p>{mensaje}</p>
      </main>
    );
  }

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-4">Responder examen</h1>
      {preguntas.length > 0 ? (
        <div>
          <div>
            <b>
              Pregunta {indice + 1} de {preguntas.length}
            </b>
            <div className="mt-2 mb-2">{preguntas[indice].enunciado}</div>
          </div>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={respuesta}
              onChange={(e) => setRespuesta(e.target.value)}
              placeholder="Escribe tu respuesta"
              required
              disabled={enviando}
            />
            <button type="submit" disabled={enviando}>
              {enviando ? "Enviando..." : "Enviar"}
            </button>
          </form>
          {retro && (
            <div className="mt-4 p-2 bg-gray-100 rounded">
              <b>Retroalimentación IA:</b>
              <div>{retro}</div>
            </div>
          )}
        </div>
      ) : (
        <p>No hay preguntas para este examen.</p>
      )}
    </main>
  );
}