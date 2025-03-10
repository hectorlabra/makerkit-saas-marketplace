![Makerkit - Next.js Supabase SaaS Starter Kit \[Lite version\]](apps/web/public/images/makerkit.webp)

# Next.js Supabase SaaS Marketplace Kit

Un kit de inicio para construir un marketplace SaaS usando Next.js 15 + Supabase.

## Características Core

### Arquitectura Base
- 🏗️ Next.js 15 + Turborepo configuración monorepo
- 🎨 Shadcn UI components con TailwindCSS v4
- 🔐 Autenticación Supabase & base de datos
- 🌐 Traducciones i18n (client + server)
- ✨ TypeScript + ESLint v9 + Prettier

### Características del Marketplace
- 👤 Sistema de autenticación de usuarios
- 🛍️ Catálogo de productos
- 🏷️ Sistema de categorías
- 🛒 Carrito de compras
- 💳 Integración con MercadoPago
- 📦 Gestión de pedidos
- 👨‍💼 Panel de vendedor
- 🔒 Rutas protegidas por roles
- 📱 Diseño responsive

### Stack Tecnológico

Este kit utiliza las siguientes tecnologías:

🛠️ **Stack Principal**:
- [Next.js 15](https://nextjs.org/): Framework React para SSR y SSG
- [Tailwind CSS](https://tailwindcss.com/): Framework CSS utility-first
- [Supabase](https://supabase.com/): Base de datos en tiempo real
- [MercadoPago](https://www.mercadopago.com/): Procesamiento de pagos
- [i18next](https://www.i18next.com/): Framework de internacionalización
- [Turborepo](https://turborepo.org/): Herramienta para gestión de monorepo
- [Shadcn UI](https://shadcn.com/): Componentes UI construidos con Tailwind CSS
- [Zod](https://github.com/colinhacks/zod): Validación de esquemas TypeScript
- [React Query](https://tanstack.com/query/v4): Librería para fetch y cache de datos
- [Prettier](https://prettier.io/): Formateador de código
- [Eslint](https://eslint.org/): Herramienta de linting
- [Playwright](https://playwright.dev/): Framework para testing end-to-end

## Empezando

### Prerequisitos

- Node.js 18.x o superior (preferiblemente la última versión LTS)
- Docker
- PNPM

Asegúrate de tener Docker ejecutándose en tu máquina. Esto es necesario para el CLI de Supabase.

### Instalación

#### 1. Clonar el repositorio

```bash
git clone <URL-del-repositorio>
```

#### 2. Instalar dependencias

```bash
pnpm install
```

#### 3. Iniciar Supabase

Asegúrate de tener Docker ejecutándose en tu máquina.

Luego ejecuta el siguiente comando para iniciar Supabase:

```bash
pnpm run supabase:web:start
```

Una vez que el servidor Supabase esté ejecutándose, accede al Dashboard de Supabase usando el puerto en la salida del comando anterior. Normalmente lo encontrarás en [http://localhost:54323](http://localhost:54323).

##### Stopping Supabase

To stop the Supabase server, run the following command:

```bash
pnpm run supabase:web:stop
```

##### Resetting Supabase

To reset the Supabase server, run the following command:

```bash
pnpm run supabase:web:reset
```

##### More Supabase Commands

For more Supabase commands, see the [Supabase CLI documentation](https://supabase.com/docs/guides/cli).

```
# Create new migration
pnpm --filter web supabase migration new <name>

# Link to Supabase project
pnpm --filter web supabase db link

# Push migrations
pnpm --filter web supabase db push
```

#### 4. Iniciar la aplicación Next.js

```bash
pnpm run dev
```

La aplicación estará disponible en http://localhost:3000.

#### 5. Code Health (linting, formatting, etc.)

To format your code, run the following command:

```bash
pnpm run format:fix
```

To lint your code, run the following command:

```bash
pnpm run lint
```

To validate your TypeScript code, run the following command:

```bash
pnpm run typecheck
```

Turborepo will cache the results of these commands, so you can run them as many times as you want without any performance impact.

## Estructura del Proyecto

El proyecto está organizado en las siguientes carpetas:

```
apps/
├── web/                     # Aplicación Next.js
│   ├── app/                # App Router pages
│   │   ├── (marketing)/    # Páginas públicas
│   │   ├── (marketplace)/  # Páginas del marketplace
│   │   ├── auth/          # Páginas de autenticación
│   │   ├── checkout/      # Proceso de checkout
│   │   └── dashboard/     # Panel de vendedor
│   ├── supabase/          # Base de datos & migraciones
│   └── config/            # Configuración de la app
│
packages/
├── ui/                    # Componentes UI compartidos
└── features/             # Paquetes de funcionalidades core
    ├── auth/             # Lógica de autenticación
    ├── marketplace/      # Lógica del marketplace
    └── ...
```

### Environment Variables

You can configure the application by setting environment variables in the `.env.local` file.

Here are the available variables:

| Variable Name | Description | Default Value |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | The URL of your SaaS application | `http://localhost:3000` |
| `NEXT_PUBLIC_PRODUCT_NAME` | The name of your SaaS product | `Makerkit` |
| `NEXT_PUBLIC_SITE_TITLE` | The title of your SaaS product | `Makerkit - The easiest way to build and manage your SaaS` |
| `NEXT_PUBLIC_SITE_DESCRIPTION` | The description of your SaaS product | `Makerkit is the easiest way to build and manage your SaaS. It provides you with the tools you need to build your SaaS, without the hassle of building it from scratch.` |
| `NEXT_PUBLIC_DEFAULT_THEME_MODE` | The default theme mode of your SaaS product | `light` |
| `NEXT_PUBLIC_THEME_COLOR` | The default theme color of your SaaS product | `#ffffff` |
| `NEXT_PUBLIC_THEME_COLOR_DARK` | The default theme color of your SaaS product in dark mode | `#0a0a0a` |
| `NEXT_PUBLIC_SUPABASE_URL` | The URL of your Supabase project | `http://127.0.0.1:54321` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | The anon key of your Supabase project | ''
| `SUPABASE_SERVICE_ROLE_KEY` | The service role key of your Supabase project | ''

## Architecture

This starter kit uses a monorepo architecture.

1. The `apps/web` directory is the Next.js application.
2. The `packages` directory contains all the packages used by the application.
3. The `packages/features` directory contains all the features of the application.
4. The `packages/ui` directory contains all the UI components.

For more information about the architecture, please refer to the [Makerkit blog post about Next.js Project Structure](https://makerkit.dev/blog/tutorials/nextjs-app-router-project-structure).

### Marketing Pages

Marketing pages are located in the `apps/web/app/(marketing)` directory. These pages are used to showcase the features of the SaaS and provide information about the product.

### Authentication

Authenticated is backed by Supabase. The `apps/web/app/auth` directory contains the authentication pages, however, the logic is into its own package `@kit/auth` located in `packages/features/auth`.

This package can be used across multiple applications.

### Gated Pages

Gated pages are located in the `apps/web/app/home` directory. Here is where you can build your SaaS pages that are gated by authentication.

### Database

The Supabase database is located in the `apps/web/supabase` directory. In this directory you will find the database schema, migrations, and seed data.

#### Creating a new migration
To create a new migration, run the following command:

```bash
pnpm --filter web supabase migration new --name <migration-name>
```

This command will create a new migration file in the `apps/web/supabase/migrations` directory. 

#### Applying a migration

Once you have created a migration, you can apply it to the database by running the following command:

```bash
pnpm run supabase:web:reset
```

This command will apply the migration to the database and update the schema. It will also reset the database using the provided seed data.

#### Linking the Supabase database

Linking the local Supabase database to the Supabase project is done by running the following command:

```bash
pnpm --filter web supabase db link
```

This command will link the local Supabase database to the Supabase project.

#### Pushing the migration to the Supabase project

After you have made changes to the migration, you can push the migration to the Supabase project by running the following command:

```bash
pnpm --filter web supabase db push
```

This command will push the migration to the Supabase project. You can now apply the migration to the Supabase database.

## Going to Production

#### 1. Create a Supabase project

To deploy your application to production, you will need to create a Supabase project.

#### 2. Push the migration to the Supabase project

After you have made changes to the migration, you can push the migration to the Supabase project by running the following command:

```bash
pnpm --filter web supabase db push
```

This command will push the migration to the Supabase project.

#### 3. Set the Supabase Callback URL

When working with a remote Supabase project, you will need to set the Supabase Callback URL.

Please set the callback URL in the Supabase project settings to the following URL:

`<url>/auth/callback`

Where `<url>` is the URL of your application.

#### 4. Deploy to Vercel or any other hosting provider

You can deploy your application to any hosting provider that supports Next.js.

#### 5. Deploy to Cloudflare

The configuration should work as is, but you need to set the runtime to `edge` in the root layout file (`apps/web/app/layout.tsx`).

```tsx
export const runtime = 'edge';
```

Remember to enable Node.js compatibility in the Cloudflare dashboard.

## Contributing

Contributions for bug fixed are welcome! However, please open an issue first to discuss your ideas before making a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Support

No support is provided for this kit. Feel free to open an issue if you have any questions or need help, but there is no guaranteed response time, nor guarantee a fix.

For dedicated support, priority fixes, and advanced features, [check out our full version](https://makerkit.dev).
