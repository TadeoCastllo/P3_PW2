"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function ResponderExamen() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [preguntas, setPreguntas] = useState<any[]>([]);
  const [mensaje, setMensaje] = useState("");
  const [indice, setIndice] = useState(0);
  const [respuesta, setRespuesta] = useState("");
  const [retro, setRetro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [calificacion, setCalificacion] = useState<number | null>(null);
  const [calificacionFinal, setCalificacionFinal] = useState<number | null>(null);

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
          examen_id: Array.isArray(id) ? id[0] : id || "",
          pregunta_id: preguntas[indice].id, // <--- ¡Esto es clave!
          respuesta_texto: respuesta,
          tiempo_respuesta: "0",
          username: correo || "",
          password: contrasena || "",
          enunciado: preguntas[indice].enunciado, // si tu prompt lo necesita
        }).toString(),
      });

      if (!res.ok) throw new Error("Error al enviar la respuesta");
      const data = await res.json();
      setRetro(data.retroalimentacion_ia || "Respuesta recibida.");
      setCalificacion(data.calificacion);
      setRespuesta("");
    } catch (err) {
      setMensaje("Error al enviar la respuesta");
    } finally {
      setEnviando(false);
    }
  };

  const handleSiguiente = async () => {
    setRetro(null);
    setCalificacion(null);
    if (indice < preguntas.length - 1) {
      setIndice(indice + 1);
    } else {
      // Llamar al endpoint /finalizar para obtener la calificación final
      const estudiante_id = localStorage.getItem("estudiante_id") || "1";
      try {
        const res = await fetch(
          `http://localhost:8000/finalizar?estudiante_id=${estudiante_id}&examen_id=${Array.isArray(id) ? id[0] : id || ""}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }
        );
        const data = await res.json();
        console.log("Respuesta finalizar:", data);
        setCalificacionFinal(data.calificacion_final);
        setMensaje("¡Examen completado!");
      } catch {
        setMensaje("¡Examen completado! (No se pudo obtener la calificación final)");
      }
    }
  };

  useEffect(() => {
    if (calificacionFinal !== null) {
      // Espera 5 segundos y redirige
      const timer = setTimeout(() => {
        router.push("/examenes");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [calificacionFinal, router]);

  if (mensaje) {
    return (
      <main className="p-4">
        <h1 className="text-xl font-bold mb-4">Responder examen</h1>
        <p>{mensaje}</p>
        {/* Mostrar la calificación final siempre que exista */}
        {calificacionFinal !== null && (
          <div className="mt-4 p-2 bg-green-100 rounded text-black">
            <b>Calificación final:</b> {calificacionFinal}
          </div>
        )}
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
          {!retro ? (
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
          ) : (
            <div>
              <div className="mt-4 p-2 bg-gray-100 rounded text-black">
                <b>Retroalimentación IA:</b>
                <div>{retro}</div>
                {calificacion !== null && (
                  <div className="mt-2 text-black">
                    <b>Calificación IA:</b> {calificacion}
                  </div>
                )}
              </div>
              <button
                className="mt-4 bg-blue-500 text-white p-2 rounded"
                onClick={handleSiguiente}
              >
                {indice < preguntas.length - 1
                  ? "Siguiente pregunta"
                  : "Finalizar"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <p>No hay preguntas para este examen.</p>
      )}
    </main>
  );
}