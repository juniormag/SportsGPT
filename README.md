# SportsGPT

A modern sports betting assistant built with Next.js, TypeScript, and Tailwind CSS, following the design specifications from Figma.

## Features

### 🏠 Landing Page
- **SportsGPT branding** with dark theme design
- **Team selection interface** with Brazilian football team logos
- **Horizontal scrolling** navigation with arrow controls  
- **Interactive question cards** for quick access to common queries
- **Fully responsive** design optimized for mobile and desktop

### 💬 Chat Interface
- **Real-time conversation** with SportsGPT assistant
- **Sports betting analysis** and recommendations
- **Team-specific insights** based on selected teams
- **Intelligent responses** for common betting questions
- **Smooth transitions** between landing and chat views

### 🎨 Design System
- **Dark theme** with neutral colors (#000000 background, #ffffff text)
- **Inter font family** for modern typography
- **Hover animations** and smooth transitions
- **ShadcnUI components** with consistent styling
- **Mobile-first responsive** design

## Technology Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS v4** - Utility-first CSS framework
- **ShadcnUI** - High-quality UI components
- **Lucide React** - Modern icon library

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SportsGPT
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── globals.css     # Global styles and animations
│   ├── layout.tsx      # Root layout component
│   └── page.tsx        # Main page with routing logic
├── components/         # React components
│   ├── ui/             # ShadcnUI base components
│   │   ├── button.tsx
│   │   └── card.tsx
│   ├── chat-interface.tsx    # Chat conversation UI
│   ├── landing-page.tsx      # Main landing page
│   ├── loading-spinner.tsx   # Loading animations
│   └── team-logos.tsx        # Brazilian team logos
└── lib/
    └── utils.ts        # Utility functions
```

## Features Overview

### Team Selection
- **14 Brazilian football teams** with custom SVG logos
- **Multi-select functionality** with visual feedback
- **Horizontal scrolling** with arrow navigation
- **Responsive sizing** (smaller on mobile, full size on desktop)

### Question Cards
- **3 pre-defined questions** for quick access
- **Desktop**: 3-column grid layout
- **Tablet**: 2-column grid layout  
- **Mobile**: Horizontal scrolling cards

### Chat Experience
- **Simulated AI responses** with sports betting insights
- **Context-aware answers** based on selected teams
- **Real-time typing indicators** with animated dots
- **Message history** with timestamps
- **Responsive message bubbles** with proper spacing

### Responsive Design
- **Mobile-first approach** with progressive enhancement
- **Flexible team logo sizing** based on screen size
- **Optimized navigation** for touch and mouse interaction
- **Smooth animations** and transitions throughout

## Customization

### Adding New Teams
1. Add team data to `teams` array in `landing-page.tsx`
2. Create SVG logo in `team-logos.tsx` 
3. Update the `TeamLogos` object with new team ID

### Modifying AI Responses
Update the `simulateAIResponse` function in `chat-interface.tsx` to customize the assistant's behavior and responses.

### Styling Changes
- Global styles: `src/app/globals.css`
- Component styles: Individual component files using Tailwind classes
- Color scheme: Update CSS variables in `globals.css`

## Design Specifications

The application follows the provided Figma design with:
- **Exact color matching**: Background #000000, Text #ffffff, Borders with opacity
- **Typography**: Inter font family with specified font weights and sizes
- **Spacing**: Consistent padding and margins as per design
- **Component sizing**: Team logos (70px), cards (169px height), etc.
- **Interactive states**: Hover effects, selection states, and transitions

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.