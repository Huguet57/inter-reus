# Joc QR Interactiu 🎯

Una aplicació web per crear jocs de caça del tresor amb codis QR. Els jugadors escanegen QRs repartits per una zona i responen preguntes de diversos tipus.

## Característiques

- 🎮 **Diferents tipus de preguntes**: Text, Foto, Vídeo, Veritat/Fals, Selecció Múltiple
- 👥 **Sistema d'equips**: Cada dispositiu crea el seu equip automàticament
- 📱 **QR automàtics**: Genera codis QR per cada pregunta
- 📊 **Panell d'admin**: Gestiona preguntes i veure respostes
- 🏆 **Classificació**: Seguiment de puntuacions en temps real

## Tecnologies

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Estils**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Storage)
- **Llibreries**: qrcode, react-webcam

## Configuració

### 1. Crear projecte Supabase

1. Ves a [supabase.com](https://supabase.com) i crea un projecte nou
2. Un cop creat, ves a **SQL Editor** i executa el contingut de `supabase-schema.sql`
3. Ves a **Storage** i crea un bucket anomenat `answers` amb accés públic

### 2. Configurar variables d'entorn

Copia les credencials del teu projecte Supabase:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
NEXT_PUBLIC_ADMIN_PASSWORD=la_teva_contrasenya_admin
```

### 3. Instal·lar i executar

```bash
# Instal·lar dependències
npm install

# Executar en mode desenvolupament
npm run dev

# Obrir http://localhost:3000
```

## Ús

### Per als administradors

1. Ves a `/admin` i introdueix la contrasenya
2. Crea preguntes amb el formulari
3. Descarrega els QRs generats i imprimeix-los
4. Reparteix els QRs per la zona de joc
5. Monitoritza les respostes en temps real

### Per als jugadors

1. Escaneja un codi QR amb el mòbil
2. Crea el teu equip (només el primer cop)
3. Respon la pregunta
4. Continua buscant més QRs!

## Tipus de preguntes

| Tipus | Descripció | Resposta correcta |
|-------|------------|-------------------|
| Text | Resposta escrita lliure | Manual |
| Foto | Enviar una imatge | Manual |
| Vídeo | Gravar o pujar vídeo | Manual |
| V/F | Veritat o Fals | Automàtica |
| Múltiple | Selecció múltiple | Automàtica |

## Estructura del projecte

```
src/
├── app/
│   ├── page.tsx              # Pàgina principal
│   ├── equip/page.tsx        # Registre d'equip
│   ├── pregunta/[qrCode]/    # Pàgines de preguntes
│   └── admin/                # Panell d'administració
├── components/
│   ├── questions/            # Components de preguntes
│   ├── TeamRegistration.tsx
│   └── QRGenerator.tsx
├── lib/
│   ├── supabase.ts           # Client Supabase
│   └── device-id.ts          # Identificació dispositiu
└── types/
    └── index.ts              # Tipus TypeScript
```

## Deploy a Vercel

1. Puja el projecte a GitHub
2. Importa el repositori a [Vercel](https://vercel.com)
3. Afegeix les variables d'entorn
4. Deploy!

## Llicència

MIT
