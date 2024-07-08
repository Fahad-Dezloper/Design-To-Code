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
    <div className="p-4 flex flex-col gap-4 bg-[#2C2C2C] shadow-2xl w-[25%]">
      <div>
      <h2 className="text-xl font-bold mb-2 text-[#b1adad]">Live Code</h2>
      <hr />
      </div>
      <pre className="text-wrap text-sm whitespace-pre-wrap text-white">{generateHTML()}</pre>
    </div>
  );
};

export default LiveCode;
