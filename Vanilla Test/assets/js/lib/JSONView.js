function createJSONView(options = {}) {
    // Default properties
    const state = {
      data: options.data || {},
      rootKey: options.rootKey || 'root',
      maxDepth: options.maxDepth || 1,
      colorScheme: options.colorScheme || 'light',
    };
  
    // Utility methods
    function isObject(val) {
      return typeof val === 'object' && val !== null && !Array.isArray(val);
    }
  
    function isArray(val) {
      return Array.isArray(val);
    }
  
    // Recursive function to build the JSON structure
    function build(key, val, depth = 0, path = '', includeKey = true) {
      if (depth > state.maxDepth && state.maxDepth > 0) {
        return document.createTextNode('...');
      }
  
      const container = document.createElement('div');
      container.className = `json-view-depth-${depth}`;
  
      if (includeKey) {
        const keyElement = document.createElement('span');
        keyElement.className = 'json-key';
        keyElement.textContent = `${key}: `;
        container.appendChild(keyElement);
      }
  
      if (isObject(val)) {
        const objectContainer = document.createElement('div');
        objectContainer.className = 'json-object';
        Object.keys(val).forEach((childKey) => {
          const child = build(childKey, val[childKey], depth + 1, `${path}.${childKey}`);
          objectContainer.appendChild(child);
        });
        container.appendChild(objectContainer);
      } else if (isArray(val)) {
        const arrayContainer = document.createElement('div');
        arrayContainer.className = 'json-array';
        val.forEach((item, index) => {
          const child = build(index, item, depth + 1, `${path}[${index}]`, false);
          arrayContainer.appendChild(child);
        });
        container.appendChild(arrayContainer);
      } else {
        const valueElement = document.createElement('span');
        valueElement.className = 'json-value';
        valueElement.textContent = JSON.stringify(val);
        container.appendChild(valueElement);
      }
  
      return container;
    }
  
    // Render the JSON view as a single element
    function render() {
      const rootElement = document.createElement('div');
      rootElement.className = `json-view json-view-${state.colorScheme}`;
      rootElement.appendChild(build(state.rootKey, state.data));
      return rootElement;
    }
  
    // Return the rendered element directly
    return render();
}
export default createJSONView;
  