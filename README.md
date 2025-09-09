# Animated Diagrams

An application for creating, managing, and sharing animated diagrams generated from Mermaid.js code.

## Repository

GitHub Repository: [https://github.com/DonnyRZ/fucDiagram](https://github.com/DonnyRZ/fucDiagram)

## Description

Animated Diagrams is a web-based tool that allows users to create, edit, and visualize diagrams using Mermaid.js syntax. The application provides a user-friendly interface for designing flowcharts, sequence diagrams, class diagrams, and other diagram types supported by Mermaid.js.

## Features

- **Diagram Creation**: Create diagrams using Mermaid.js syntax with real-time preview
- **Project Management**: Save and manage multiple diagram projects
- **Visualization**: View diagrams with smooth animations
- **History**: Access previously created diagrams
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (usually comes with Node.js)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd animated-diagrams
   ```

3. Install dependencies:
   ```
   npm install
   ```

### Development

To run the application in development mode:

```
npm run dev
```

This will start the development server, typically on `http://localhost:3000`.

### Building for Production

To create a production build:

```
npm run build
```

The built files will be placed in the `dist/` directory.

### Running Production Build

To preview the production build locally:

```
npm run serve
```

## Usage

1. **Create a New Diagram**:
   - Open the application
   - Enter a name for your diagram
   - Write or edit the Mermaid.js code in the editor
   - Use the preview pane to see your diagram in real-time

2. **Save Your Diagram**:
   - Click the "Save Diagram" button to store your work
   - Saved diagrams can be accessed from the history page

3. **View Saved Diagrams**:
   - Navigate to the "My Diagrams" page to see all saved projects
   - Click on any diagram to view or edit it

4. **Animating Diagrams**:
   - Use the animation controls to view diagrams with animated effects

## Project Structure

```
src/
├── components/     # React components
├── context/        # React context for state management
├── hooks/          # Custom React hooks
├── services/       # Business logic and utilities
├── types/          # TypeScript type definitions
└── App.tsx         # Main application component
```

## Technologies Used

- **React** - Frontend library
- **TypeScript** - Typed JavaScript
- **Mermaid.js** - Diagram generation
- **React Router** - Navigation
- **Vite** - Build tool and development server
- **CSS Modules** - Styling

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run serve` - Preview production build
- `npm run test` - Run tests (if configured)

### Dependencies

- `mermaid` - For diagram rendering
- `react` and `react-dom` - Core React libraries
- `react-router-dom` - Routing
- `zustand` - State management (if used)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Commit your changes
5. Push to the branch
6. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Mermaid.js](https://mermaid-js.github.io/) for diagram generation
- [React](https://reactjs.org/) for the UI framework
- [Vite](https://vitejs.dev/) for the build tool