import React, { useState, useRef, useEffect, useCallback } from 'react';
import Draggable from 'react-draggable';
import ErrorBoundary from '../components/ErrorBoundary'; // Import ErrorBoundary

const Canvas = ({ elements, setElements }) => {
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [resizing, setResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const [editingTextId, setEditingTextId] = useState(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [guides, setGuides] = useState([]);
  const canvasRef = useRef(null);
  const panelRef = useRef(null);

  // Function to add a new element (rectangle or text)
  // Function to add a new element (rectangle or text)
const addElement = useCallback((type = 'rectangle') => {
  const defaultStyle = {
    backgroundColor: '#db9b9b',
    borderRadius: '0px',
    border: '1px solid #000000',
    boxShadow: '0px 0px 0px #000000',
    color: '#000000',
    fontSize: '16px',
    fontFamily: 'Arial',
    textAlign: 'center',
    lineHeight: 'normal',
  };

  if (type === 'rectangle') {
    defaultStyle.width = '100px';
    defaultStyle.height = '100px';
  }

  setElements((prevElements) => [
    ...prevElements,
    {
      id: Date.now(),
      type: type,
      style: defaultStyle,
      content: type === 'text' ? '' : '', // Default content for text elements
      selected: false,
    },
  ]);
}, [setElements]);

// Smart guide
const calculateGuides = () => {
  const newGuides = [];
  const elements = elementsRef.current; // Use a ref to avoid issues with stale state

  elements.forEach((element) => {
    const rect = element.getBoundingClientRect();

    // Center guides
    newGuides.push({
      type: 'vertical',
      position: rect.left + rect.width / 2,
    });
    newGuides.push({
      type: 'horizontal',
      position: rect.top + rect.height / 2,
    });

    // Edge guides
    newGuides.push({
      type: 'vertical',
      position: rect.left,
    });
    newGuides.push({
      type: 'vertical',
      position: rect.left + rect.width,
    });
    newGuides.push({
      type: 'horizontal',
      position: rect.top,
    });
    newGuides.push({
      type: 'horizontal',
      position: rect.top + rect.height,
    });
  });

  setGuides(newGuides);
};

const elementsRef = useRef([]);


  

  // Function to update element style
  const updateElementStyle = useCallback((id, newStyle) => {
    setElements((prevElements) =>
      prevElements.map((element) => {
        if (element.id === id) {
          let updatedStyle = { ...element.style, ...newStyle };

          // Combine border width and color into a single border property if both are provided
          if (updatedStyle['border-width'] || updatedStyle['border-color']) {
            const currentBorder = updatedStyle.border || '1px solid #000000'; // Default value
            const [currentWidth, currentStyle, currentColor] = currentBorder.split(' ');

            const newWidth = updatedStyle['border-width'] || currentWidth;
            const newColor = updatedStyle['border-color'] || currentColor;
            updatedStyle.border = `${newWidth} solid ${newColor}`;
          }

          // Remove individual border properties if border is updated
          if (updatedStyle.border) {
            delete updatedStyle['border-width'];
            delete updatedStyle['border-color'];
          }

          return { ...element, style: updatedStyle };
        } else {
          return element;
        }
      })
    );
  }, [setElements]);

  // Function to update selected state of element
  const updateElementSelected = useCallback((id, selected) => {
    setElements((prevElements) =>
      prevElements.map((element) =>
        element.id === id ? { ...element, selected } : { ...element, selected: false }
      )
    );
  }, [setElements]);

  // Function to handle style change of an element
  const handleStyleChange = useCallback((e, property) => {
    const value = e.target.value;
    if (selectedElementId) {
      let newStyle = { [property]: value };

      // Special handling for box-shadow
      if (['box-shadow-x', 'box-shadow-y', 'box-shadow-blur', 'box-shadow-color'].includes(property)) {
        const element = elements.find((e) => e.id === selectedElementId);
        if (!element) return;

        const [x = '0px', y = '0px', blur = '0px', color = '#000000'] = element.style.boxShadow.split(' ');
        const newBoxShadow = {
          x: property === 'box-shadow-x' ? value : x,
          y: property === 'box-shadow-y' ? value : y,
          blur: property === 'box-shadow-blur' ? value : blur,
          color: property === 'box-shadow-color' ? value : color,
        };

        newStyle = {
          boxShadow: `${newBoxShadow.x} ${newBoxShadow.y} ${newBoxShadow.blur} ${newBoxShadow.color}`,
        };
      }

      // Special handling for border properties
      if (property === 'border-width' || property === 'border-color') {
        const element = elements.find((e) => e.id === selectedElementId);
        if (element) {
          const currentBorder = element.style.border || '1px solid #000000'; // Default value
          const [currentWidth, currentStyle, currentColor] = currentBorder.split(' ');

          const newWidth = property === 'border-width' ? value : currentWidth;
          const newColor = property === 'border-color' ? value : currentColor;
          newStyle = { border: `${newWidth} solid ${newColor}` };
        }
      }

      updateElementStyle(selectedElementId, newStyle);
    }
  }, [selectedElementId, elements, updateElementStyle]);

  // Function to handle color change
  const handleColorChange = useCallback((e) => {
    const value = e.target.value;
    if (selectedElementId) {
      updateElementStyle(selectedElementId, { backgroundColor: value });
    }
  }, [selectedElementId, updateElementStyle]);

  // Function to handle mouse down event for resizing
  const handleMouseDown = useCallback((e, direction) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(true);
    setResizeDirection(direction);
    setResizeStart({ x: e.clientX, y: e.clientY });
  }, []);

  // Function to handle mouse move event for resizing
  const handleMouseMove = useCallback((e) => {
    if (resizing && selectedElementId) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      const element = elements.find((e) => e.id === selectedElementId);
      if (!element) return;

      let newWidth = parseInt(element.style.width);
      let newHeight = parseInt(element.style.height);
      let newTop = parseInt(element.style.top || '0px');
      let newLeft = parseInt(element.style.left || '0px');

      switch (resizeDirection) {
        case 'right':
          newWidth = Math.max(50, newWidth + deltaX);
          break;
        case 'left':
          newWidth = Math.max(50, newWidth - deltaX);
          newLeft = newLeft + deltaX;
          break;
        case 'bottom':
          newHeight = Math.max(50, newHeight + deltaY);
          break;
        case 'top':
          newHeight = Math.max(50, newHeight - deltaY);
          newTop = newTop + deltaY;
          break;
        case 'bottom-right':
          newWidth = Math.max(50, newWidth + deltaX);
          newHeight = Math.max(50, newHeight + deltaY);
          break;
        case 'bottom-left':
          newWidth = Math.max(50, newWidth - deltaX);
          newHeight = Math.max(50, newHeight + deltaY);
          newLeft = newLeft + deltaX;
          break;
        case 'top-right':
          newWidth = Math.max(50, newWidth + deltaX);
          newHeight = Math.max(50, newHeight - deltaY);
          newTop = newTop + deltaY;
          break;
        case 'top-left':
          newWidth = Math.max(50, newWidth - deltaX);
          newHeight = Math.max(50, newHeight - deltaY);
          newTop = newTop + deltaY;
          newLeft = newLeft + deltaX;
          break;
        default:
          break;
      }

      updateElementStyle(selectedElementId, {
        width: `${newWidth}px`,
        height: `${newHeight}px`,
        top: `${newTop}px`,
        left: `${newLeft}px`,
      });

      setResizeStart({ x: e.clientX, y: e.clientY });
    }
  }, [resizing, selectedElementId, resizeDirection, resizeStart, elements, updateElementStyle]);

  // Function to handle mouse up event for resizing
  const handleMouseUp = useCallback(() => {
    setResizing(false);
    setResizeDirection(null);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  useEffect(() => {
    if (resizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    const handleClickOutside = (e) => {
      if (canvasRef.current && !canvasRef.current.contains(e.target) && !panelRef.current.contains(e.target) && selectedElementId) {
        setSelectedElementId(null);
        updateElementSelected(null, false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, handleMouseMove, handleMouseUp, selectedElementId, updateElementSelected]);

  // Function to handle keydown event for deleting the selected element and adding new elements
  const handleKeyDown = useCallback((e) => {
    // Check if the target element is an input field
    if (e.target.tagName.toLowerCase() === 'input') {
      return;
    }
    if (e.key === 'Delete' && selectedElementId) {
      setElements((prevElements) =>
        prevElements.filter((element) => element.id !== selectedElementId)
      );
      setSelectedElementId(null);
    } else if (e.key === 'r') {
      addElement('rectangle');
    } else if (e.key === 't') {
      addElement('text');
    }
  }, [selectedElementId, setElements, addElement]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div ref={canvasRef} className="relative h-full w-full border border-gray-200" style={{ position: 'relative' }}>
      {elements.map((element) => (
        <Draggable
          key={element.id}
          onStart={() => {
            if (!resizing) {
              setSelectedElementId(element.id);
              updateElementSelected(element.id, true);
            }
          }}
          onStop={() => setSelectedElementId(null)}
          cancel=".resize-handle"
        >
          <div
            className="element-container relative"
            style={{
              ...element.style,
              cursor: resizing ? 'default' : 'move',
              border: element.selected ? '1px solid black' : 'none',
              boxShadow: element.style.boxShadow,
              backgroundColor: element.type === 'text' ? 'transparent' : element.style.backgroundColor,
              textAlign: element.style.textAlign,
              lineHeight: element.style.lineHeight,
              fontSize: element.style.fontSize,
              fontFamily: element.style.fontFamily,
              color: element.style.color,
              overflow: 'hidden',
              display: element.type === 'text' ? 'inline-block' : 'block',
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (!resizing) {
                setSelectedElementId(element.id);
                updateElementSelected(element.id, true);
              }
            }}
            onDoubleClick={(e) => {
              if (element.type === 'text') {
                setEditingTextId(element.id);
              }
            }}            
          >
            {element.type === 'text' ? (
      editingTextId === element.id ? (
        <input
          type="text"
          value={element.content}
          onChange={(e) => {
            const newContent = e.target.value;
            setElements((prevElements) =>
              prevElements.map((el) =>
                el.id === element.id ? { ...el, content: newContent } : el
              )
            );
          }}
          onBlur={() => setEditingTextId(null)}
          autoFocus
          style={{
            fontSize: element.style.fontSize,
            fontFamily: element.style.fontFamily,
            color: element.style.color,
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            width: '100%',
          }}
        />
      ) : (
        <div
          style={{
            fontSize: element.style.fontSize,
            fontFamily: element.style.fontFamily,
            color: element.style.color,
          }}
        >
          {element.content || 'Start typing...'}
        </div>
      )
    ) : null}

            {/* Resize Handles */}
            {element.selected && (
              <>
                <div
                  className="resize-handle absolute right-0 top-1/2 transform translate-y-[-50%] w-1 h-1 bg-blue-500 rounded-full cursor-ew-resize"
                  onMouseDown={(e) => handleMouseDown(e, 'right')}
                />
                <div
                  className="resize-handle absolute bottom-0 left-1/2 transform translate-x-[-50%] w-1 h-1 bg-blue-500 rounded-full cursor-ns-resize"
                  onMouseDown={(e) => handleMouseDown(e, 'bottom')}
                />
                <div
                  className="resize-handle absolute left-0 top-1/2 transform translate-y-[-50%] w-1 h-1 bg-blue-500 rounded-full cursor-ew-resize"
                  onMouseDown={(e) => handleMouseDown(e, 'left')}
                />
                <div
                  className="resize-handle absolute top-0 left-1/2 transform translate-x-[-50%] w-1 h-1 bg-blue-500 rounded-full cursor-ns-resize"
                  onMouseDown={(e) => handleMouseDown(e, 'top')}
                />
                <div
                  className="resize-handle absolute right-0 bottom-0 w-1 h-1 bg-blue-500 rounded-full cursor-se-resize"
                  onMouseDown={(e) => handleMouseDown(e, 'bottom-right')}
                />
                <div
                  className="resize-handle absolute left-0 bottom-0 w-1 h-1 bg-blue-500 rounded-full cursor-sw-resize"
                  onMouseDown={(e) => handleMouseDown(e, 'bottom-left')}
                />
                <div
                  className="resize-handle absolute left-0 top-0 w-1 h-1 bg-blue-500 rounded-full cursor-nw-resize"
                  onMouseDown={(e) => handleMouseDown(e, 'top-left')}
                />
                <div
                  className="resize-handle absolute right-0 top-0 w-1 h-1 bg-blue-500 rounded-full cursor-ne-resize"
                  onMouseDown={(e) => handleMouseDown(e, 'top-right')}
                />
              </>
            )}
          </div>
        </Draggable>
      ))}

      <button onClick={() => addElement('rectangle')} className="absolute bottom-5 left-5 p-2 bg-green-500 text-white">
        Add Rectangle
      </button>
      <button onClick={() => addElement('text')} className="absolute bottom-5 left-24 p-2 bg-blue-500 text-white">
        Add Text
      </button>

      {selectedElementId && (
        <div
          ref={panelRef}
          className="absolute top-0 right-0 h-full p-4 bg-gray-100 border border-gray-300 z-10"
        >
          <h3 className="text-lg font-bold mb-2">Properties</h3>
          <>
            <label className="block mb-2">
              Width:
              <input
                type="text"
                value={elements.find((e) => e.id === selectedElementId)?.style.width || '100px'}
                onChange={(e) => handleStyleChange(e, 'width')}
                className="ml-2 border border-gray-300 p-1"
              />
            </label>
            <label className="block mb-2">
              Height:
              <input
                type="text"
                value={elements.find((e) => e.id === selectedElementId)?.style.height || '100px'}
                onChange={(e) => handleStyleChange(e, 'height')}
                className="ml-2 border border-gray-300 p-1"
              />
            </label>
            <label className="block mb-2">
              Background Color:
              <input
                type="color"
                value={elements.find((e) => e.id === selectedElementId)?.style.backgroundColor || '#0000ff'}
                onChange={handleColorChange}
                className="ml-2"
              />
            </label>
            <label className="block mb-2">
              Border Radius:
              <input
                type="text"
                value={elements.find((e) => e.id === selectedElementId)?.style.borderRadius || '0px'}
                onChange={(e) => handleStyleChange(e, 'borderRadius')}
                className="ml-2 border border-gray-300 p-1"
              />
            </label>
            <label className="block mb-2">
              Stroke Width:
              <input
                type="text"
                value={elements.find((e) => e.id === selectedElementId)?.style.border.split(' ')[0] || '1px'}
                onChange={(e) => handleStyleChange(e, 'border-width')}
                className="ml-2 border border-gray-300 p-1"
              />
            </label>
            <label className="block mb-2">
              Stroke Color:
              <input
                type="color"
                value={elements.find((e) => e.id === selectedElementId)?.style.border.split(' ')[2] || '#000000'}
                onChange={(e) => handleStyleChange(e, 'border-color')}
                className="ml-2"
              />
            </label>
            <label className="block mb-2">
              Box Shadow X:
              <input
                type="text"
                value={elements.find((e) => e.id === selectedElementId)?.style.boxShadow.split(' ')[0] || '0px'}
                onChange={(e) => handleStyleChange(e, 'box-shadow-x')}
                className="ml-2 border border-gray-300 p-1"
              />
            </label>
            <label className="block mb-2">
              Box Shadow Y:
              <input
                type="text"
                value={elements.find((e) => e.id === selectedElementId)?.style.boxShadow.split(' ')[1] || '0px'}
                onChange={(e) => handleStyleChange(e, 'box-shadow-y')}
                className="ml-2 border border-gray-300 p-1"
              />
            </label>
            <label className="block mb-2">
              Box Shadow Blur:
              <input
                type="text"
                value={elements.find((e) => e.id === selectedElementId)?.style.boxShadow.split(' ')[2] || '0px'}
                onChange={(e) => handleStyleChange(e, 'box-shadow-blur')}
                className="ml-2 border border-gray-300 p-1"
              />
            </label>
            <label className="block mb-2">
              Box Shadow Color:
              <input
                type="color"
                value={elements.find((e) => e.id === selectedElementId)?.style.boxShadow.split(' ')[3] || '#000000'}
                onChange={(e) => handleStyleChange(e, 'box-shadow-color')}
                className="ml-2"
              />
            </label>
            {selectedElementId && elements.find((e) => e.id === selectedElementId)?.type === 'text' && (
              <>
                <label className="block mb-2">
                  Font Size:
                  <input
                    type="text"
                    value={elements.find((e) => e.id === selectedElementId)?.style.fontSize || '16px'}
                    onChange={(e) => handleStyleChange(e, 'fontSize')}
                    className="ml-2 border border-gray-300 p-1"
                  />
                </label>
                <label className="block mb-2">
                  Font Family:
                  <input
                    type="text"
                    value={elements.find((e) => e.id === selectedElementId)?.style.fontFamily || 'Arial'}
                    onChange={(e) => handleStyleChange(e, 'fontFamily')}
                    className="ml-2 border border-gray-300 p-1"
                  />
                </label>
                <label className="block mb-2">
                  Text Color:
                  <input
                    type="color"
                    value={elements.find((e) => e.id === selectedElementId)?.style.color || '#000000'}
                    onChange={(e) => handleStyleChange(e, 'color')}
                    className="ml-2"
                  />
                </label>
              </>
            )}
          </>
        </div>
      )}
    </div>
  );
};

export default Canvas;
