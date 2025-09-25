# Collectto

A minimalist board-based app for tracking hobbies and collections like films, books, TV series, and videogames in a visual Trello/Notion-like interface.

## Features

- 🎯 **Multiple Customizable Boards** - Create boards for different types of collections
- 🎬 **Collection Templates** - Pre-built templates for movies, games, books, TV series, and blank boards
- 🎨 **Drag & Drop Interface** - Smooth, intuitive card management
- 🌙 **Dark/Light Theme Support** - Plus a secret "Oryso" theme for authenticated users
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 💾 **Data Persistence** - Local storage with versioning and backup system
- 👤 **User Authentication** - Supabase-powered auth with email/password
- 🔗 **Collection Sharing** - Publish collections with shareable read-only links
- 📊 **Dense Mode** - Compact layout for power users
- ⭐ **Rating System** - Rate items in your collections
- 📤 **Import/Export** - Backup and share your collections as JSON files

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- A Supabase project (for authentication and cloud sync)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/collectto.git
   cd collectto
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Supabase credentials in `.env.local`:
   ```env
   VITE_SUPABASE_PROJECT_ID=your_project_id
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Deploy Supabase functions** (if using authentication)
   ```bash
   # Install Supabase CLI first: https://supabase.com/docs/guides/cli
   supabase functions deploy server --project-ref YOUR_PROJECT_ID
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## Deployment

### GitHub Pages (Recommended)

1. **Update package.json** - Change the homepage URL to match your repository
2. **Set up GitHub Secrets** - In your repository settings, add:
   - `VITE_SUPABASE_PROJECT_ID`
   - `VITE_SUPABASE_ANON_KEY`
3. **Push to main branch** - The GitHub Actions workflow will automatically build and deploy

### Other Deployment Options

- **Vercel**: Connect your GitHub repo at [vercel.com](https://vercel.com)
- **Netlify**: Drag and drop the `dist` folder after running `npm run build`
- **Firebase Hosting**: Use `firebase deploy` after building

## Usage

### Getting Started

1. **Create Your First Collection** - Choose from templates or start with a blank board
2. **Add Cards** - Click the "+" button in any column to add items
3. **Organize Items** - Drag cards between columns as your progress changes
4. **Rate & Tag** - Add ratings and tags to keep track of your favorites
5. **Share Collections** - Use the share button to create public links

### Authentication (Optional)

- **Sign Up** - Click the profile circle to create an account
- **Cloud Sync** - Your collections automatically sync across devices
- **Collection Sharing** - Publish collections for others to view

## Project Structure

```
collectto/
├── src/
│   ├── components/          # React components
│   │   ├── auth/           # Authentication components
│   │   ├── sharing/        # Collection sharing features
│   │   └── ui/             # Shadcn/ui components
│   ├── styles/             # Global CSS and Tailwind config
│   ├── utils/              # Utilities and Supabase client
│   └── supabase/           # Supabase edge functions
├── public/                 # Static assets
└── App.tsx                 # Main application component
```

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS v4
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **Build Tool**: Vite
- **UI Components**: Shadcn/ui
- **Drag & Drop**: React DND
- **Animations**: Motion (formerly Framer Motion)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

- 🐛 **Bug Reports**: Open an issue on GitHub
- 💡 **Feature Requests**: Start a discussion in the repository
- 📧 **Email**: [Your contact email if desired]

---

Built with ❤️ for collectors and hobbyists everywhere.