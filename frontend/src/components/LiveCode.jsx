// LiveCode.jsx
import React from 'react';

const LiveCode = ({ elements }) => {
  const generateHTML = () => {
    return elements
      .map((element) => {
        const styles = Object.entries(element.style)
          .map(([key, value]) => `${key}: ${value};`)
          .join(' ');

        if (element.type === 'rectangle') {
          return `<div style="${styles}"></div>`;
        } else if (element.type === 'text') {
          return `<div style="${styles}">${element.content}</div>`;
        }
        return '';
      })
      .join('\n');
  };

  return (
    <div className="p-4 border border-gray-300 bg-gray-100 w-[30%]">
      <h2 className="text-xl font-bold mb-2">Live Code</h2>
      <pre className="text-wrap text-sm whitespace-pre-wrap">{generateHTML()}</pre>
    </div>
  );
};

export default LiveCode;
