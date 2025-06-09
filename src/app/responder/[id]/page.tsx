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
          pregunta_id: preguntas[indice].id,
          respuesta_texto: respuesta,
          tiempo_respuesta: "0",
          username: correo || "",
          password: contrasena || "",
          enunciado: preguntas[indice].enunciado,
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
      const estudiante_id = localStorage.getItem("estudiante_id") || "1";
      try {
        const res = await fetch(
          `http://localhost:8000/finalizar?estudiante_id=${estudiante_id}&examen_id=${
            Array.isArray(id) ? id[0] : id || ""
          }`,
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
      const timer = setTimeout(() => {
        router.push("/examenes");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [calificacionFinal, router]);

  if (mensaje) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 text-gray-100">
        <h1 className="text-3xl font-extrabold mb-6 tracking-wide text-indigo-400 drop-shadow-lg">
          Responder examen
        </h1>
        <p className="text-lg mb-4">{mensaje}</p>
        {calificacionFinal !== null && (
          <div className="mt-4 p-4 bg-green-700 bg-opacity-80 rounded-lg shadow-md text-white font-semibold">
            <b>Calificación final:</b> {calificacionFinal}
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 text-gray-100">
      <h1 className="text-3xl font-extrabold mb-8 tracking-wide text-indigo-400 drop-shadow-lg">
        Responder examen
      </h1>
      {preguntas.length > 0 ? (
        <div className="w-full max-w-3xl bg-gray-800 bg-opacity-70 rounded-xl p-8 shadow-lg">
          <div className="mb-6">
            <b className="text-lg">
              Pregunta {indice + 1} de {preguntas.length}
            </b>
            <p className="mt-2 text-gray-300 text-lg">{preguntas[indice].enunciado}</p>
          </div>

          {!retro ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
                placeholder="Escribe tu respuesta"
                required
                disabled={enviando}
                className="rounded-md px-4 py-3 bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={enviando}
                className="bg-indigo-600 hover:bg-indigo-700 transition-colors duration-300 text-white font-semibold py-3 rounded-md shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enviando ? "Enviando..." : "Enviar"}
              </button>
            </form>
          ) : (
            <div>
              <div className="mt-6 p-4 bg-gray-700 rounded-md shadow-inner text-gray-100">
                <b className="block mb-2 text-indigo-300">Retroalimentación IA:</b>
                <p>{retro}</p>
                {calificacion !== null && (
                  <p className="mt-4 font-semibold text-indigo-400">
                    Calificación IA: {calificacion}
                  </p>
                )}
              </div>
              <button
                className="mt-6 bg-blue-600 hover:bg-blue-700 transition-colors duration-300 text-white font-semibold py-3 rounded-md shadow-md"
                onClick={handleSiguiente}
              >
                {indice < preguntas.length - 1 ? "Siguiente pregunta" : "Finalizar"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-lg text-gray-400">No hay preguntas para este examen.</p>
      )}
    </main>
  );
}
