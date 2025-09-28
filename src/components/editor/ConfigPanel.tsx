import React, { useState, useEffect } from 'react';
import { MermaidConfig } from '../../types';
import { Button } from '../ui/Button';
import './ConfigPanel.css';

interface ConfigPanelProps {
  config: MermaidConfig;
  onChange: (config: MermaidConfig) => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onChange }) => {
  const [localConfig, setLocalConfig] = useState<MermaidConfig>(config);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleChange = (field: keyof MermaidConfig, value: any) => {
    const newConfig = { ...localConfig, [field]: value };
    setLocalConfig(newConfig);
    onChange(newConfig);
  };

  const handleFlowchartChange = (field: string, value: any) => {
    const newConfig = {
      ...localConfig,
      flowchart: {
        ...(localConfig.flowchart || {}),
        [field]: value
      }
    };
    setLocalConfig(newConfig);
    onChange(newConfig);
  };

  return (
    <div className="config-panel">
      <div className="config-section">
        <h3>General Settings</h3>
        
        <div className="config-field">
          <label htmlFor="theme">Theme</label>
          <select
            id="theme"
            value={localConfig.theme || 'default'}
            onChange={(e) => handleChange('theme', e.target.value)}
          >
            <option value="default">Default</option>
            <option value="forest">Forest</option>
            <option value="dark">Dark</option>
            <option value="neutral">Neutral</option>
          </select>
        </div>

        <div className="config-field">
          <label htmlFor="securityLevel">Security Level</label>
          <select
            id="securityLevel"
            value={localConfig.securityLevel || 'strict'}
            onChange={(e) => handleChange('securityLevel', e.target.value as any)}
          >
            <option value="strict">Strict</option>
            <option value="loose">Loose</option>
            <option value="antiscript">Anti-script</option>
            <option value="sandbox">Sandbox</option>
          </select>
        </div>

        <div className="config-field checkbox-field">
          <label htmlFor="startOnLoad">Start on Load</label>
          <input
            type="checkbox"
            id="startOnLoad"
            checked={localConfig.startOnLoad || false}
            onChange={(e) => handleChange('startOnLoad', e.target.checked)}
          />
        </div>
      </div>

      <div className="config-section">
        <h3>Flowchart Settings</h3>
        
        <div className="config-field">
          <label htmlFor="diagramPadding">Diagram Padding</label>
          <input
            type="number"
            id="diagramPadding"
            value={localConfig.flowchart?.diagramPadding || 8}
            onChange={(e) => handleFlowchartChange('diagramPadding', parseInt(e.target.value))}
          />
        </div>

        <div className="config-field">
          <label htmlFor="nodeSpacing">Node Spacing</label>
          <input
            type="number"
            id="nodeSpacing"
            value={localConfig.flowchart?.nodeSpacing || 50}
            onChange={(e) => handleFlowchartChange('nodeSpacing', parseInt(e.target.value))}
          />
        </div>

        <div className="config-field">
          <label htmlFor="rankSpacing">Rank Spacing</label>
          <input
            type="number"
            id="rankSpacing"
            value={localConfig.flowchart?.rankSpacing || 50}
            onChange={(e) => handleFlowchartChange('rankSpacing', parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="config-actions">
        <Button 
          variant="secondary" 
          onClick={() => {
            const defaultConfig: MermaidConfig = {};
            setLocalConfig(defaultConfig);
            onChange(defaultConfig);
          }}
        >
          Reset to Default
        </Button>
      </div>
    </div>
  );
};

export default ConfigPanel;