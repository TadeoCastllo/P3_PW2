"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Perfil() {
  const [usuario, setUsuario] = useState<any>(null);
  const [mensaje, setMensaje] = useState("");
  const [mejores, setMejores] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const correo = localStorage.getItem("correo");
    const contrasena = localStorage.getItem("contrasena");
    if (!correo || !contrasena) {
      router.push("/dashboard");
      return;
    }

    fetch("http://localhost:8000/usuario/me", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `username=${encodeURIComponent(correo)}&password=${encodeURIComponent(contrasena)}`
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setUsuario(data);
          if (data.rol === "estudiante") {
            router.push("/examenes");
          }
        } else {
          setMensaje("No autorizado");
        }
      })
      .catch(() => setMensaje("Error de conexión"));
  }, [router]);

  useEffect(() => {
    if (usuario?.rol === "profesor") {
      fetch("http://localhost:8000/mejores-calificaciones")
        .then(res => res.json())
        .then(setMejores);
    }
  }, [usuario]);

  const handleLogout = () => {
    localStorage.removeItem("correo");
    localStorage.removeItem("contrasena");
    router.push("/login");
  };

  if (mensaje) return <p className="text-center text-red-500 mt-10">{mensaje}</p>;
  if (!usuario) return <p className="text-center text-white mt-10">Cargando...</p>;

  if (usuario.rol === "profesor") {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col items-center justify-start p-8">
        <h1 className="text-4xl font-extrabold text-indigo-400 mb-4 font-[cursive] tracking-wider text-center drop-shadow-lg">
          Panel del Profesor
        </h1>
        <p className="text-lg text-gray-300 text-center mb-6">
          Aquí se mostrará la calificación más alta de cada alumno.
        </p>
        <div className="overflow-x-auto w-full max-w-5xl">
          <table className="w-full table-auto border-collapse border border-indigo-500 shadow-lg bg-gray-800 rounded-lg">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="border border-indigo-500 px-4 py-2 text-center">Nombre</th>
                <th className="border border-indigo-500 px-4 py-2 text-center">Correo</th>
                <th className="border border-indigo-500 px-4 py-2 text-center">Calificación más alta</th>
                <th className="border border-indigo-500 px-4 py-2 text-center">Examen</th>
              </tr>
            </thead>
            <tbody>
              {mejores.map((m) => (
                <tr key={m.correo} className="hover:bg-indigo-700 transition-colors">
                  <td className="border border-indigo-500 px-4 py-2 text-center">{m.nombre}</td>
                  <td className="border border-indigo-500 px-4 py-2 text-center">{m.correo}</td>
                  <td className="border border-indigo-500 px-4 py-2 text-center">{m.calificacion}</td>
                  <td className="border border-indigo-500 px-4 py-2 text-center">{m.examen}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          onClick={handleLogout}
          className="mt-8 bg-red-600 hover:bg-red-700 transition-colors text-white font-semibold py-2 px-6 rounded-full shadow-md"
        >
          Cerrar sesión
        </button>
      </main>
    );
  }

  // Si es estudiante, ya fue redirigido a /examenes
  return null;
}
