import React from 'react';
import { Link } from 'react-router-dom';
import './Breadcrumb.css';

interface BreadcrumbItem {
  title: string;
  path?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <ol>
        {items.map((item, index) => (
          <li key={index} className="breadcrumb-item">
            {item.path ? (
              <Link to={item.path}>
                {item.icon && <span className="breadcrumb-icon">{item.icon}</span>}
                <span>{item.title}</span>
              </Link>
            ) : (
              <span className="current" aria-current="page">
                {item.icon && <span className="breadcrumb-icon">{item.icon}</span>}
                <span>{item.title}</span>
              </span>
            )}
            {index < items.length - 1 && <span className="separator" aria-hidden="true">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;