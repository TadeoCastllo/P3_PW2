"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Examenes() {
  const [examenes, setExamenes] = useState<any[]>([]);
  const [mensaje, setMensaje] = useState("");
  const router = useRouter();

  useEffect(() => {
    const correo = localStorage.getItem("correo");
    const contrasena = localStorage.getItem("contrasena");
    if (!correo || !contrasena) {
      router.push("/login");
      return;
    }

    fetch("http://localhost:8000/examenes", {
      method: "GET",
      headers: {
        Authorization: "Basic " + btoa(`${correo}:${contrasena}`),
      },
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setExamenes(data);
        } else {
          const data = await res.json();
          setMensaje(data.detail || "Error al obtener exámenes");
        }
      })
      .catch(() => setMensaje("Error de conexión"));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("correo");
    localStorage.removeItem("contrasena");
    router.push("/login");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-950 to-black p-8 text-gray-200">
      <h1 className="text-4xl font-extrabold mb-10 tracking-wide text-indigo-400 drop-shadow-[0_2px_8px_rgba(79,70,229,0.9)]">
        Exámenes disponibles
      </h1>

      {mensaje && (
        <p className="mb-6 px-6 py-3 bg-red-800 rounded-md text-red-400 font-semibold drop-shadow-lg max-w-xl text-center">
          {mensaje}
        </p>
      )}

      {examenes.length > 0 ? (
        <ul className="w-full max-w-3xl bg-gray-900 rounded-2xl p-10 shadow-lg shadow-indigo-900/70">
          {examenes.map((examen) => (
            <li
              key={examen.id}
              className="border border-indigo-700 rounded-lg p-5 mb-6 cursor-pointer hover:bg-indigo-900 hover:shadow-md hover:shadow-indigo-600 transition-all duration-300"
            >
              <Link href={`/responder/${examen.id}`}>
                <b className="text-indigo-300 text-2xl hover:underline">
                  {examen.titulo}
                </b>
              </Link>
              <p className="mt-3 text-indigo-400">{examen.descripcion}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-indigo-500 mt-8 text-lg text-center">
          No hay exámenes disponibles.
        </p>
      )}

      <button
        onClick={handleLogout}
        className="mt-12 bg-indigo-700 hover:bg-indigo-800 active:bg-indigo-900 transition-colors duration-300 text-white font-semibold py-4 px-10 rounded-3xl shadow-lg shadow-indigo-900/80"
      >
        Cerrar sesión
      </button>
    </main>
  );
}
