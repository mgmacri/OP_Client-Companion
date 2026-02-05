import React, { useState } from 'react';
import type { LogType, TextInput, Metric } from '../types/models';

interface DynamicLogFormProps {
  logType: LogType;
  onSubmit: (fields: Record<string, string | number | boolean>) => void;
  onCancel: () => void;
}

const DynamicLogForm: React.FC<DynamicLogFormProps> = ({ logType, onSubmit, onCancel }) => {
  const [fields, setFields] = useState<Record<string, string | number | boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (key: string, value: string | number | boolean) => {
    setFields(prev => ({ ...prev, [key]: value }));
    // Clear error when user types
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate text inputs
    logType.text_inputs.forEach(input => {
      const value = fields[input.key];
      if (input.type === 'select' && !value) {
        newErrors[input.key] = `${input.label} is required`;
      }
    });

    // Validate metrics
    logType.metrics.forEach(metric => {
      const value = fields[metric.key];
      if (value === undefined || value === '') {
        newErrors[metric.key] = `${metric.label} is required`;
      } else {
        const numValue = Number(value);
        if (isNaN(numValue)) {
          newErrors[metric.key] = `${metric.label} must be a number`;
        } else if (numValue < metric.min) {
          newErrors[metric.key] = `${metric.label} must be at least ${metric.min}`;
        } else if (metric.max !== null && numValue > metric.max) {
          newErrors[metric.key] = `${metric.label} must be at most ${metric.max}`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Convert metric values to numbers
    const processedFields = { ...fields };
    logType.metrics.forEach(metric => {
      if (processedFields[metric.key] !== undefined) {
        processedFields[metric.key] = Number(processedFields[metric.key]);
      }
    });

    onSubmit(processedFields);
  };

  const renderTextInput = (input: TextInput) => {
    const value = (fields[input.key] as string) || '';
    const error = errors[input.key];

    switch (input.type) {
      case 'select':
        return (
          <div key={input.key} className="form-group">
            <label htmlFor={input.key}>{input.label}</label>
            <select
              id={input.key}
              value={value}
              onChange={(e) => updateField(input.key, e.target.value)}
              className={error ? 'error' : ''}
            >
              <option value="">Select an option...</option>
              {input.options?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {error && <span className="form-error">{error}</span>}
          </div>
        );
      
      case 'textarea':
        return (
          <div key={input.key} className="form-group">
            <label htmlFor={input.key}>{input.label}</label>
            <textarea
              id={input.key}
              value={value}
              onChange={(e) => updateField(input.key, e.target.value)}
              rows={4}
              placeholder={`Enter ${input.label.toLowerCase()}...`}
              className={error ? 'error' : ''}
            />
            {error && <span className="form-error">{error}</span>}
          </div>
        );
      
      case 'time':
        return (
          <div key={input.key} className="form-group">
            <label htmlFor={input.key}>{input.label}</label>
            <input
              id={input.key}
              type="time"
              value={value}
              onChange={(e) => updateField(input.key, e.target.value)}
              className={error ? 'error' : ''}
            />
            {error && <span className="form-error">{error}</span>}
          </div>
        );
      
      case 'boolean':
        return (
          <div key={input.key} className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={Boolean(fields[input.key])}
                onChange={(e) => updateField(input.key, e.target.checked)}
              />
              <span>{input.label}</span>
            </label>
          </div>
        );
      
      default:
        return (
          <div key={input.key} className="form-group">
            <label htmlFor={input.key}>{input.label}</label>
            <input
              id={input.key}
              type="text"
              value={value}
              onChange={(e) => updateField(input.key, e.target.value)}
              placeholder={`Enter ${input.label.toLowerCase()}...`}
              className={error ? 'error' : ''}
            />
            {error && <span className="form-error">{error}</span>}
          </div>
        );
    }
  };

  const renderMetric = (metric: Metric) => {
    const value = fields[metric.key] !== undefined ? String(fields[metric.key]) : '';
    const error = errors[metric.key];
    const maxLabel = metric.max !== null ? metric.max : '∞';

    return (
      <div key={metric.key} className="form-group">
        <label htmlFor={metric.key}>
          {metric.label}
          <span className="metric-range">({metric.min} - {maxLabel} {metric.unit})</span>
        </label>
        <div className="metric-input-wrapper">
          <input
            id={metric.key}
            type="number"
            min={metric.min}
            max={metric.max ?? undefined}
            value={value}
            onChange={(e) => updateField(metric.key, e.target.value)}
            placeholder={`${metric.min}`}
            className={error ? 'error' : ''}
          />
          {metric.max !== null && (
            <input
              type="range"
              min={metric.min}
              max={metric.max}
              value={value || metric.min}
              onChange={(e) => updateField(metric.key, e.target.value)}
              className="metric-slider"
            />
          )}
        </div>
        {error && <span className="form-error">{error}</span>}
      </div>
    );
  };

  return (
    <div className="dynamic-form card">
      <div className="form-header">
        <h2>{logType.name}</h2>
        <p className="form-subtitle">
          {logType.target_conditions.join(' • ')}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {logType.text_inputs.length > 0 && (
          <div className="form-section">
            <h3>Details</h3>
            {logType.text_inputs.map(renderTextInput)}
          </div>
        )}

        {logType.metrics.length > 0 && (
          <div className="form-section">
            <h3>Metrics</h3>
            <div className="metrics-grid">
              {logType.metrics.map(renderMetric)}
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Submit Log
          </button>
        </div>
      </form>

      <style>{`
        .dynamic-form {
          padding: var(--spacing-xl);
        }

        .form-header {
          text-align: center;
          margin-bottom: var(--spacing-xl);
          padding-bottom: var(--spacing-lg);
          border-bottom: 2px solid rgba(39, 67, 87, 0.1);
        }

        .form-header h2 {
          margin: 0 0 var(--spacing-xs) 0;
          color: var(--color-primary);
        }

        .form-subtitle {
          color: var(--color-text-muted);
          font-size: 0.875rem;
          margin: 0;
        }

        .form-section {
          margin-bottom: var(--spacing-xl);
        }

        .form-section h3 {
          font-size: 1rem;
          color: var(--color-text);
          margin-bottom: var(--spacing-md);
          padding-bottom: var(--spacing-sm);
          border-bottom: 1px solid rgba(39, 67, 87, 0.1);
        }

        .form-group {
          margin-bottom: var(--spacing-lg);
        }

        .form-group label {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }

        .metric-range {
          font-size: 0.75rem;
          font-weight: 400;
          color: var(--color-text-muted);
        }

        .metric-input-wrapper {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .metric-slider {
          width: 100%;
          height: 8px;
          border-radius: 4px;
          background: linear-gradient(
            to right,
            var(--color-primary) 0%,
            var(--color-accent) 100%
          );
          -webkit-appearance: none;
          appearance: none;
          cursor: pointer;
        }

        .metric-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--color-surface);
          border: 2px solid var(--color-primary);
          cursor: pointer;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-lg);
        }

        .checkbox-group {
          margin-top: var(--spacing-sm);
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          width: 20px;
          height: 20px;
          accent-color: var(--color-primary);
        }

        input.error,
        select.error,
        textarea.error {
          border-color: var(--color-danger);
        }

        .form-error {
          display: block;
          color: var(--color-danger);
          font-size: 0.875rem;
          margin-top: var(--spacing-xs);
        }

        .form-actions {
          display: flex;
          gap: var(--spacing-md);
          justify-content: flex-end;
          padding-top: var(--spacing-lg);
          border-top: 2px solid rgba(39, 67, 87, 0.1);
        }

        @media (max-width: 600px) {
          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column-reverse;
          }

          .form-actions .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default DynamicLogForm;
