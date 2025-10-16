import React, { useState } from 'react';
import './ShapeLibrarySidebar.css';

interface Shape {
  id: string;
  type: string;
  label: string;
  icon: string;
  category: string;
}

const ShapeLibrarySidebar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Define shape categories
  const categories = [
    { id: 'all', name: 'All Shapes' },
    { id: 'basic', name: 'Basic' },
    { id: 'flowchart', name: 'Flowchart' },
    { id: 'bpmn', name: 'BPMN' },
    { id: 'uml', name: 'UML' },
  ];

  // Define available shapes
  const shapes: Shape[] = [
    // Basic shapes
    { id: 'rectangle', type: 'task', label: 'Rectangle', icon: '▭', category: 'basic' },
    { id: 'circle', type: 'event', label: 'Circle', icon: '○', category: 'basic' },
    { id: 'diamond', type: 'gateway', label: 'Diamond', icon: '◇', category: 'basic' },
    { id: 'rounded', type: 'task', label: 'Rounded', icon: '▢', category: 'basic' },
    
    // Flowchart shapes
    { id: 'start', type: 'start', label: 'Start', icon: '●', category: 'flowchart' },
    { id: 'end', type: 'end', label: 'End', icon: '◉', category: 'flowchart' },
    { id: 'process', type: 'task', label: 'Process', icon: '▭', category: 'flowchart' },
    { id: 'decision', type: 'gateway', label: 'Decision', icon: '◇', category: 'flowchart' },
    { id: 'document', type: 'task', label: 'Document', icon: '▭', category: 'flowchart' },
    
    // BPMN shapes
    { id: 'task', type: 'task', label: 'Task', icon: '▭', category: 'bpmn' },
    { id: 'subprocess', type: 'task', label: 'Sub-Process', icon: '▭', category: 'bpmn' },
    { id: 'event-start', type: 'start', label: 'Start Event', icon: '○', category: 'bpmn' },
    { id: 'event-end', type: 'end', label: 'End Event', icon: '◉', category: 'bpmn' },
    { id: 'gateway-exclusive', type: 'gateway', label: 'Exclusive Gateway', icon: '◇', category: 'bpmn' },
    { id: 'gateway-parallel', type: 'gateway', label: 'Parallel Gateway', icon: '◇', category: 'bpmn' },
    
    // UML shapes
    { id: 'class', type: 'task', label: 'Class', icon: '▭', category: 'uml' },
    { id: 'interface', type: 'task', label: 'Interface', icon: '▭', category: 'uml' },
    { id: 'actor', type: 'task', label: 'Actor', icon: ' stickman', category: 'uml' },
  ];

  // Filter shapes based on search term and category
  const filteredShapes = shapes.filter(shape => {
    const matchesSearch = shape.label.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || shape.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle drag start for shapes
  const handleDragStart = (e: React.DragEvent, shape: Shape) => {
    e.dataTransfer.setData('application/reactflow', JSON.stringify(shape));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="shape-library-sidebar">
      <div className="shape-library-header">
        <h3>Shape Library</h3>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search shapes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      
      <div className="categories-container">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-button ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      <div className="shapes-container">
        {filteredShapes.map(shape => (
          <div
            key={shape.id}
            className="shape-item"
            draggable
            onDragStart={(e) => handleDragStart(e, shape)}
            title={shape.label}
          >
            <div className="shape-icon">{shape.icon}</div>
            <div className="shape-label">{shape.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShapeLibrarySidebar;