# 💸 SubTrackr

**SubTrackr** es una plataforma de gestión de suscripciones diseñada para centralizar y optimizar el control de gastos recurrentes. Construida con un enfoque en la experiencia de usuario (UX) y la seguridad de datos.

![Snapshot de la App](https://via.placeholder.com/800x400?text=SubTrackr+Dashboard) 
> *HACER EN PROCESO.*

---

## 🚀 Stack Tecnológico

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router & Server Actions)
- **Backend as a Service:** [Supabase](https://supabase.com/) (Auth, PostgreSQL & RLS)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
- **Iconos:** [Lucide React](https://lucide.dev/)
- **Despliegue:** [Vercel](https://vercel.com/)

---

## 🧠 Desafíos Técnicos y Soluciones

### 1. Gestión de Sesiones en el Servidor (SSR)
Implementé la nueva convención de **Middleware/Proxy** para asegurar que la sesión del usuario sea persistente y segura entre el cliente y el servidor, evitando parpadeos de contenido (FOUC) y mejorando la seguridad en las peticiones a la API.

### 2. Seguridad a Nivel de Fila (RLS)
La base de datos está protegida mediante políticas de **Row Level Security (RLS)** de Supabase, garantizando que los usuarios solo puedan leer, crear o borrar sus propios datos, incluso si las peticiones se realizan desde el cliente.

### 3. UI Dinámica e Inteligente
El formulario de entrada utiliza un sistema de **Presets**. Al seleccionar servicios populares (Netflix, Spotify, etc.), la app precarga categorías y estilos visuales específicos, reduciendo la fricción en la entrada de datos.

---

## ✨ Características Principales

- **Dashboard de Gastos:** Visualización instantánea del gasto mensual y proyección anual.
- **Categorización Dinámica:** Estilos visuales que se adaptan automáticamente al tipo de servicio.
- **Empty States:** Experiencia de usuario pulida para nuevos usuarios.
- **Responsive Design:** Optimizado para dispositivos móviles y escritorio.

---

## 🛠️ Instalación Local

1. Clona el repositorio:
   ```
   git clone [https://github.com/tu-usuario/subtrackr.git](https://github.com/tu-usuario/subtrackr.git)
Instala las dependencias:


npm install
Configura las variables de entorno en un archivo .env.local:

Fragmento de código
NEXT_PUBLIC_SUPABASE_URL=tu_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key
Lanza el servidor de desarrollo:


npm run dev


Desarrollado con <3 por Erik Gomez - 2026


---

## 💡 Consejos para que brille más:

1.  **Captura de pantalla:** EN PROCESO
2.  **GIF animado:** EN PROCESO

---

