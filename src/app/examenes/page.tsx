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
        "Authorization": "Basic " + btoa(`${correo}:${contrasena}`),
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
    <main className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Exámenes disponibles</h1>
      <button onClick={handleLogout} className="mb-4 bg-red-500 text-white p-2 rounded">
        Cerrar sesión
      </button>
      {mensaje && <p className="mt-4">{mensaje}</p>}
      {examenes.length > 0 && (
        <ul className="mt-4">
          {examenes.map((examen) => (
            <li key={examen.id} className="border p-2 rounded mb-2">
              <Link href={`/responder/${examen.id}`}>
                <b className="cursor-pointer hover:underline">{examen.titulo}</b>
              </Link>
              <p>{examen.descripcion}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}