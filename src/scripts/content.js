// Helper function to safely send messages with context validation
const safeRuntimeMessage = (message, callback = null) => {
  try {
    // Check if extension context is still valid
    if (!chrome.runtime?.id) {
      console.log('KeyFlow: Extension context invalidated, please reload page for full functionality');
      return false;
    }

    // Send the message with proper error handling
    if (callback) {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          if (chrome.runtime.lastError.message.includes('Extension context invalidated')) {
            console.log('KeyFlow: Extension updated, please reload page for full functionality');
          } else {
            console.warn('KeyFlow: Runtime error:', chrome.runtime.lastError.message);
          }
          return;
        }
        callback(response);
      });
    } else {
      chrome.runtime.sendMessage(message).catch(err => {
        if (err.message.includes('Extension context invalidated')) {
          console.log('KeyFlow: Extension updated, please reload page for full functionality');
        } else {
          console.warn('KeyFlow: Failed to send message:', err.message);
        }
      });
    }
    return true;
  } catch (error) {
    if (error.message.includes('Extension context invalidated')) {
      console.log('KeyFlow: Extension updated, please reload page for full functionality');
    } else {
      console.warn('KeyFlow: Error sending message:', error.message);
    }
    return false;
  }
};

// Detect login forms and add focus handlers
const detectLoginForms = () => {
  try {
    // Detect password fields
  const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => addKeyFlowToField(input, 'password'));
    
    // Detect username/email fields
    const usernameSelectors = [
      'input[type="email"]',
      'input[type="text"][name*="user"]',
      'input[type="text"][name*="email"]',
      'input[type="text"][name*="login"]',
      'input[type="text"][id*="user"]',
      'input[type="text"][id*="email"]',
      'input[type="text"][id*="login"]',
      'input[autocomplete="username"]',
      'input[autocomplete="email"]',
      'input[name="username"]',
      'input[name="email"]',
      'input[name="login"]',
      'input[placeholder*="email" i]',
      'input[placeholder*="username" i]',
      'input[placeholder*="user" i]'
    ];
    
    usernameSelectors.forEach(selector => {
      const usernameInputs = document.querySelectorAll(selector);
      usernameInputs.forEach(input => {
        // Only add to inputs that are likely username fields (not search, etc.)
        if (isLikelyUsernameField(input)) {
          addKeyFlowToField(input, 'username');
        }
      });
    });
  } catch (error) {
    console.error('KeyFlow: Error in detectLoginForms:', error);
  }
};

// Check if an input field is likely a username field
const isLikelyUsernameField = (input) => {
  const excludePatterns = [
    /search/i,
    /query/i,
    /filter/i,
    /name.*first/i,
    /name.*last/i,
    /fname/i,
    /lname/i,
    /phone/i,
    /address/i,
    /city/i,
    /zip/i,
    /postal/i
  ];
  
  const inputStr = (input.name + ' ' + input.id + ' ' + input.placeholder + ' ' + input.className).toLowerCase();
  
  // Exclude fields that don't look like username fields
  for (const pattern of excludePatterns) {
    if (pattern.test(inputStr)) {
      return false;
    }
  }
  
  // Must be in a form or near a password field to be considered a username field
  const form = input.closest('form');
  if (form) {
    const hasPasswordField = form.querySelector('input[type="password"]');
    return !!hasPasswordField;
  }
  
  // Check if there's a password field nearby
  const nearbyPasswordField = document.querySelector('input[type="password"]');
  return !!nearbyPasswordField;
};

// Add KeyFlow functionality to a field
const addKeyFlowToField = (input, fieldType) => {
  try {
    // Skip if already processed
    if (input.dataset.keyflowProcessed === 'true') {
      return;
    }
    
    // Mark input as processed
    input.dataset.keyflowProcessed = 'true';
    input.dataset.keyflowFieldType = fieldType;
    
    // Check if parent element exists
    const container = input.parentElement;
    if (!container) {
      return;
    }
    
    // Make container relative if needed for positioning
    const computedStyle = window.getComputedStyle(container);
    if (computedStyle.position !== 'absolute' && computedStyle.position !== 'relative' && computedStyle.position !== 'fixed') {
      container.style.position = 'relative';
    }
    
    // Create KeyFlow icon (hidden by default)
    const icon = createKeyFlowIcon(fieldType);
    container.appendChild(icon);
    
    // Store reference to icon on the input for easy access
    input.keyflowIcon = icon;
    
    // Add focus handler to show icon
    input.addEventListener('focus', () => {
      showKeyFlowIcon(icon);
    });
    
    // Add blur handler to hide icon (with small delay)
    input.addEventListener('blur', () => {
      setTimeout(() => {
        hideKeyFlowIcon(icon);
      }, 150); // Small delay to allow clicking on icon
    });
  } catch (error) {
    console.error('KeyFlow: Error adding KeyFlow to field:', error);
  }
};

// Create the KeyFlow icon element
const createKeyFlowIcon = (fieldType = 'password') => {
  const icon = document.createElement('div');
  icon.className = `keyflow-${fieldType}-icon`;
  icon.dataset.fieldType = fieldType;
  
  // Use KeyFlow fill icon
  const img = document.createElement('img');
  img.src = chrome.runtime.getURL('icons/keyflowfill.png');
  img.alt = 'KeyFlow';
  img.style.cssText = `
    width: 16px;
    height: 16px;
    display: block;
  `;
  icon.appendChild(img);
  
  icon.style.cssText = `
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    width: 20px;
    height: 20px;
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    pointer-events: auto;
    transition: all 0.2s ease;
    border-radius: 2px;
  `;
  
  // Add hover effect
  icon.addEventListener('mouseenter', () => {
    icon.style.transform = 'translateY(-50%) scale(1.1)';
    icon.style.opacity = '0.8';
  });
  
  icon.addEventListener('mouseleave', () => {
    icon.style.transform = 'translateY(-50%) scale(1)';
    icon.style.opacity = '1';
  });
    
    // Add click handler to show password suggestions
  icon.addEventListener('mousedown', (e) => {
    e.preventDefault(); // Prevent input from losing focus
  });
  
  icon.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Send different message types based on field type
    const messageType = fieldType === 'username' ? 'SHOW_USERNAME_SUGGESTIONS' : 'SHOW_PASSWORD_SUGGESTIONS';
    
    safeRuntimeMessage({
      type: messageType,
      url: window.location.hostname,
      fieldType: fieldType
    });
  });
  
  return icon;
};

// Show the KeyFlow icon with animation
const showKeyFlowIcon = (icon) => {
  icon.style.display = 'flex';
  setTimeout(() => {
    icon.style.opacity = '1';
    icon.style.transform = 'translateY(-50%) scale(1)';
  }, 10);
};

// Hide the KeyFlow icon with animation
const hideKeyFlowIcon = (icon) => {
  icon.style.opacity = '0';
  icon.style.transform = 'translateY(-50%) scale(0.8)';
  setTimeout(() => {
    icon.style.display = 'none';
  }, 200);
};

// Show save password prompt
const showSavePasswordPrompt = (formData) => {
  try {
    // Remove any existing save prompts
    const existingPrompt = document.querySelector('.keyflow-save-prompt');
    if (existingPrompt) {
      existingPrompt.remove();
    }
    
    // Check if password already exists for this domain
    safeRuntimeMessage({
      type: 'CHECK_EXISTING_PASSWORD',
      domain: formData.domain,
      username: formData.username
    }, (response) => {
      if (response && response.exists) {
        // Password already exists, ask to update
        showUpdatePasswordPrompt(formData);
      } else {
        // New password, show save prompt
        showNewPasswordPrompt(formData);
      }
    });
  } catch (error) {
    console.error('KeyFlow: Error showing save prompt:', error);
  }
};

// Show new password save prompt
const showNewPasswordPrompt = (formData) => {
  const prompt = document.createElement('div');
  prompt.className = 'keyflow-save-prompt';
  prompt.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    z-index: 10002;
    width: 350px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    animation: slideIn 0.3s ease-out;
  `;
  
  prompt.innerHTML = `
    <div style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
      <div style="display: flex; align-items: center; margin-bottom: 8px;">
        <div style="width: 20px; height: 20px; background: #4f46e5; border-radius: 4px; margin-right: 8px; display: flex; align-items: center; justify-content: center;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L9 7V9C9 10.1 9.9 11 11 11V22H13V11C14.1 11 15 10.1 15 9H21Z"/>
          </svg>
        </div>
        <span style="font-weight: 600; color: #1f2937;">Save Password?</span>
        <button onclick="this.closest('.keyflow-save-prompt').remove()" style="margin-left: auto; background: none; border: none; font-size: 18px; cursor: pointer; color: #6b7280;">×</button>
      </div>
      <div style="color: #6b7280; font-size: 14px;">
        Save password for <strong>${formData.site}</strong>?
      </div>
    </div>
    <div style="padding: 12px 16px;">
      <div style="margin-bottom: 8px; font-size: 14px;">
        <strong>Site:</strong> ${formData.site}
      </div>
      ${formData.username ? `<div style="margin-bottom: 12px; font-size: 14px;"><strong>Username:</strong> ${formData.username}</div>` : ''}
      <div style="display: flex; gap: 8px;">
        <button class="keyflow-save-btn" style="
          flex: 1;
          background: #4f46e5;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        ">Save</button>
        <button class="keyflow-never-btn" style="
          flex: 1;
          background: #e5e7eb;
          color: #374151;
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        ">Never</button>
        <button class="keyflow-cancel-btn" style="
          background: none;
          border: none;
          color: #6b7280;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        ">Not now</button>
      </div>
    </div>
  `;
  
  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  // Add event listeners for the buttons
  const saveBtn = prompt.querySelector('.keyflow-save-btn');
  const neverBtn = prompt.querySelector('.keyflow-never-btn');
  const cancelBtn = prompt.querySelector('.keyflow-cancel-btn');
  
  saveBtn.addEventListener('click', () => {
    handleSavePassword(formData, 'save');
    prompt.remove();
  });
  
  neverBtn.addEventListener('click', () => {
    handleSavePassword(formData, 'never');
    prompt.remove();
  });
  
  cancelBtn.addEventListener('click', () => {
    prompt.remove();
  });
  
  document.body.appendChild(prompt);
  
  // Auto-dismiss after 10 seconds
  setTimeout(() => {
    if (prompt.parentNode) {
      prompt.remove();
    }
  }, 10000);
};

// Handle save password actions
const handleSavePassword = (formData, action) => {
  try {
    
    if (action === 'save') {
      // Check if vault is unlocked before saving
      safeRuntimeMessage({
        type: 'CHECK_VAULT_STATUS'
      }, (response) => {
        if (response && response.locked) {
          // Vault is locked, show unlock message
          showVaultLockedForSaveMessage();
          return;
        }
        
        // Vault is unlocked, proceed with save
        safeRuntimeMessage({
          type: 'SAVE_PASSWORD',
          password: {
            site: formData.site,
            username: formData.username,
            password: formData.password,
            url: formData.url
          }
        }, (saveResponse) => {
          if (saveResponse && saveResponse.success) {
            console.log('KeyFlow: Password saved successfully');
            showSaveSuccessMessage();
          } else {
            console.error('KeyFlow: Failed to save password');
          }
        });
      });
    } else if (action === 'never') {
      // Add to never save list (this doesn't require vault to be unlocked)
      safeRuntimeMessage({
        type: 'ADD_NEVER_SAVE',
        domain: formData.domain
      });
    }
  } catch (error) {
    console.error('KeyFlow: Error handling save action:', error);
  }
};

// Show vault locked message for save operation
const showVaultLockedForSaveMessage = () => {
  const message = document.createElement('div');
  message.className = 'keyflow-save-locked';
  message.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    border: 1px solid #e5e7eb;
    border-left: 4px solid #dc2626;
    border-radius: 6px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    z-index: 10003;
    padding: 16px;
    max-width: 300px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    animation: slideInRight 0.3s ease-out;
  `;
  
  message.innerHTML = `
    <div style="display: flex; align-items: start; gap: 12px;">
      <div style="width: 20px; height: 20px; background: #fee2e2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-top: 2px;">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="#dc2626">
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L9 7V9C9 10.1 9.9 11 11 11V22H13V11C14.1 11 15 10.1 15 9H21Z"/>
        </svg>
      </div>
      <div style="flex: 1;">
        <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px; font-size: 14px;">Cannot Save Password</div>
        <div style="color: #6b7280; font-size: 13px; line-height: 1.4; margin-bottom: 12px;">
          KeyFlow vault is locked. Unlock it to save passwords.
        </div>
        <button onclick="this.closest('.keyflow-save-locked').remove(); chrome.runtime.sendMessage({type: 'OPEN_POPUP'});" style="
          background: #4f46e5;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
        ">Unlock KeyFlow</button>
      </div>
      <button onclick="this.closest('.keyflow-save-locked').remove()" style="
        background: none;
        border: none;
        color: #9ca3af;
        cursor: pointer;
        font-size: 16px;
        line-height: 1;
        padding: 0;
        width: 20px;
        height: 20px;
      ">×</button>
    </div>
  `;
  
  // Add CSS for slide-in animation
  if (!document.querySelector('#keyflow-slide-animations')) {
    const style = document.createElement('style');
    style.id = 'keyflow-slide-animations';
    style.textContent = `
      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(100%);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(message);
  
  // Auto-dismiss after 6 seconds
  setTimeout(() => {
    if (message.parentNode) {
      message.remove();
    }
  }, 6000);
};

// Show save success message
const showSaveSuccessMessage = () => {
  const message = document.createElement('div');
  message.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 12px 16px;
    border-radius: 6px;
    z-index: 10003;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
  `;
  message.textContent = '✓ Password saved to KeyFlow';
  
  document.body.appendChild(message);
  
  setTimeout(() => {
    message.remove();
  }, 3000);
};

// Form submission detection for auto-save
let formSubmissionData = null;

// Detect and monitor forms with password fields
const detectForms = () => {
  try {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      // Skip if already processed
      if (form.dataset.keyflowMonitored === 'true') {
        return;
      }
      
      // Check if form has password fields
      const passwordFields = form.querySelectorAll('input[type="password"]');
      if (passwordFields.length === 0) {
        return;
      }
      
      // Mark as monitored
      form.dataset.keyflowMonitored = 'true';
      
      // Add form submit listener
      form.addEventListener('submit', (e) => {
        handleFormSubmission(form, e);
      });
      
      console.log('KeyFlow: Monitoring form for auto-save:', form);
    });
  } catch (error) {
    console.error('KeyFlow: Error detecting forms:', error);
  }
};

// Handle form submission
const handleFormSubmission = (form, event) => {
  try {
    // Extract form data
    const formData = extractFormData(form);
    
    if (formData && formData.password) {
      // Store form data temporarily
      formSubmissionData = {
        ...formData,
        url: window.location.href,
        domain: window.location.hostname,
        timestamp: Date.now()
      };
      
      // Show save prompt after a brief delay to allow form submission
      setTimeout(() => {
        showSavePasswordPrompt(formSubmissionData);
      }, 1000);
    }
  } catch (error) {
    console.error('KeyFlow: Error handling form submission:', error);
  }
};

// Extract username and password from form
const extractFormData = (form) => {
  try {
    const formData = {
      username: '',
      password: '',
      site: ''
    };
    
    // Find password field
    const passwordField = form.querySelector('input[type="password"]');
    if (!passwordField || !passwordField.value) {
      return null;
    }
    
    formData.password = passwordField.value;
    formData.site = window.location.hostname;
    
    // Find username field (try multiple strategies)
    const usernameSelectors = [
      'input[type="email"]',
      'input[type="text"][name*="user"]',
      'input[type="text"][name*="email"]',
      'input[type="text"][name*="login"]',
      'input[type="text"][id*="user"]',
      'input[type="text"][id*="email"]',
      'input[type="text"][id*="login"]',
      'input[autocomplete="username"]',
      'input[autocomplete="email"]',
      'input[name="username"]',
      'input[name="email"]',
      'input[name="login"]'
    ];
    
    // Try to find username field in the same form
    for (const selector of usernameSelectors) {
      const usernameField = form.querySelector(selector);
      if (usernameField && usernameField.value) {
        formData.username = usernameField.value;
        break;
      }
    }
    
    // If no username found in form, try nearby inputs
    if (!formData.username) {
      for (const selector of usernameSelectors) {
        const usernameField = document.querySelector(selector);
        if (usernameField && usernameField.value) {
          formData.username = usernameField.value;
          break;
        }
      }
    }
    
    return formData;
  } catch (error) {
    console.error('KeyFlow: Error extracting form data:', error);
    return null;
  }
};

// Display credential suggestions (unified function for username and password fields)
const displayCredentialSuggestions = (passwords, url, fieldType = 'password') => {
  try {
    // Remove any existing suggestions
    const existingSuggestions = document.querySelector('.keyflow-suggestions');
    if (existingSuggestions) {
      existingSuggestions.remove();
    }
    
    if (passwords.length === 0) {
      showNoPasswordsMessage(url);
      return;
    }
    
    // Create suggestions dropdown
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'keyflow-suggestions';
    suggestionsContainer.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      z-index: 10001;
      min-width: 300px;
      max-width: 400px;
      max-height: 400px;
      overflow-y: auto;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    // Header with different text based on field type
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 16px;
      border-bottom: 1px solid #e5e7eb;
      font-weight: 600;
      color: #1f2937;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    
    const headerText = fieldType === 'username' ? '👤 KeyFlow - Choose Account' : '🔐 KeyFlow - Choose Password';
    header.innerHTML = `
      <span>${headerText}</span>
      <button style="background: none; border: none; font-size: 18px; cursor: pointer; color: #6b7280;">×</button>
    `;
    
    // Close button functionality
    header.querySelector('button').addEventListener('click', () => {
      suggestionsContainer.remove();
    });
    
    suggestionsContainer.appendChild(header);
    
    // Password list
    passwords.forEach((password, index) => {
      const passwordItem = document.createElement('div');
      passwordItem.style.cssText = `
        padding: 12px 16px;
        border-bottom: 1px solid #f3f4f6;
        cursor: pointer;
        transition: background-color 0.2s;
      `;
      
      passwordItem.innerHTML = `
        <div style="font-weight: 500; color: #1f2937; margin-bottom: 4px;">${password.site}</div>
        <div style="font-size: 14px; color: #6b7280;">${password.username}</div>
      `;
      
      // Hover effect
      passwordItem.addEventListener('mouseenter', () => {
        passwordItem.style.backgroundColor = '#f9fafb';
      });
      
      passwordItem.addEventListener('mouseleave', () => {
        passwordItem.style.backgroundColor = 'white';
      });
      
      // Click to fill both username and password (complete auto-fill)
      passwordItem.addEventListener('click', () => {
        fillPassword(password); // Always fill both fields for best UX
        suggestionsContainer.remove();
      });
      
      suggestionsContainer.appendChild(passwordItem);
    });
    
    document.body.appendChild(suggestionsContainer);
    
    // Close on click outside
    const closeOnOutsideClick = (e) => {
      if (!suggestionsContainer.contains(e.target)) {
        suggestionsContainer.remove();
        document.removeEventListener('click', closeOnOutsideClick);
      }
    };
    
    setTimeout(() => {
      document.addEventListener('click', closeOnOutsideClick);
    }, 100);
    
  } catch (error) {
    console.error('KeyFlow: Error displaying credential suggestions:', error);
  }
};

// Display password suggestions to the user (legacy function)
const displayPasswordSuggestions = (passwords, url) => {
  try {
    // Remove any existing suggestions
    const existingSuggestions = document.querySelector('.keyflow-suggestions');
    if (existingSuggestions) {
      existingSuggestions.remove();
    }
    
    if (passwords.length === 0) {
      showNoPasswordsMessage(url);
      return;
    }
    
    // Create suggestions dropdown
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'keyflow-suggestions';
    suggestionsContainer.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      z-index: 10001;
      min-width: 300px;
      max-width: 400px;
      max-height: 400px;
      overflow-y: auto;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 16px;
      border-bottom: 1px solid #e5e7eb;
      font-weight: 600;
      color: #1f2937;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    header.innerHTML = `
      <span>🔐 KeyFlow - Choose Password</span>
      <button style="background: none; border: none; font-size: 18px; cursor: pointer; color: #6b7280;">×</button>
    `;
    
    // Close button functionality
    header.querySelector('button').addEventListener('click', () => {
      suggestionsContainer.remove();
    });
    
    suggestionsContainer.appendChild(header);
    
    // Password list
    passwords.forEach((password, index) => {
      const passwordItem = document.createElement('div');
      passwordItem.style.cssText = `
        padding: 12px 16px;
        border-bottom: 1px solid #f3f4f6;
        cursor: pointer;
        transition: background-color 0.2s;
      `;
      
      passwordItem.innerHTML = `
        <div style="font-weight: 500; color: #1f2937; margin-bottom: 4px;">${password.site}</div>
        <div style="font-size: 14px; color: #6b7280;">${password.username}</div>
      `;
      
      // Hover effect
      passwordItem.addEventListener('mouseenter', () => {
        passwordItem.style.backgroundColor = '#f9fafb';
      });
      
      passwordItem.addEventListener('mouseleave', () => {
        passwordItem.style.backgroundColor = 'white';
      });
      
      // Click to fill both username and password (complete auto-fill)
      passwordItem.addEventListener('click', () => {
        fillPassword(password); // Always fill both fields for best UX
        suggestionsContainer.remove();
      });
      
      suggestionsContainer.appendChild(passwordItem);
    });
    
    document.body.appendChild(suggestionsContainer);
    
    // Close on click outside
    const closeOnOutsideClick = (e) => {
      if (!suggestionsContainer.contains(e.target)) {
        suggestionsContainer.remove();
        document.removeEventListener('click', closeOnOutsideClick);
      }
    };
    
    setTimeout(() => {
      document.addEventListener('click', closeOnOutsideClick);
    }, 100);
    
  } catch (error) {
    console.error('KeyFlow: Error displaying suggestions:', error);
  }
};

// Display vault locked message
const displayVaultLockedMessage = (url, fieldType = 'password') => {
  try {
    console.log('KeyFlow: displayVaultLockedMessage called with url:', url, 'fieldType:', fieldType);
    
    // Remove any existing suggestions
    const existingSuggestions = document.querySelector('.keyflow-suggestions');
    if (existingSuggestions) {
      existingSuggestions.remove();
    }

    // Create locked vault message
    const message = document.createElement('div');
    message.className = 'keyflow-vault-locked';
    message.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      z-index: 10001;
      padding: 24px;
      text-align: center;
      min-width: 300px;
      max-width: 400px;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      animation: scaleIn 0.3s ease-out;
    `;

    const actionText = fieldType === 'username' ? 'fill usernames' : 'access passwords';
    
    message.innerHTML = `
      <div style="margin-bottom: 16px;">
        <div style="width: 60px; height: 60px; background: #fee2e2; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#dc2626">
            <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 7C13.1 7 14 7.9 14 9C14 10.1 13.1 11 12 11C10.9 11 10 10.1 10 9C10 7.9 10.9 7 12 7ZM17 19H7V17.5C7 15.5 11 14.5 12 14.5C13 14.5 17 15.5 17 17.5V19Z"/>
          </svg>
        </div>
        <div style="font-weight: 600; color: #1f2937; margin-bottom: 8px; font-size: 18px;">🔒 Vault Locked</div>
        <div style="color: #6b7280; margin-bottom: 20px; line-height: 1.5;">
          KeyFlow vault is locked. You need to unlock it to ${actionText}.
        </div>
      </div>
      
      <div style="display: flex; gap: 8px; justify-content: center;">
        <button id="keyflow-unlock-vault" style="
          background: #4f46e5;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
          transition: all 0.2s ease;
        ">Open KeyFlow</button>
        <button onclick="this.closest('.keyflow-vault-locked').remove()" style="
          background: #e5e7eb;
          color: #374151;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        ">Cancel</button>
      </div>
    `;

    // Add hover effects
    const unlockButton = message.querySelector('#keyflow-unlock-vault');
    unlockButton.addEventListener('mouseenter', () => {
      unlockButton.style.background = '#4338ca';
      unlockButton.style.transform = 'translateY(-1px)';
    });
    unlockButton.addEventListener('mouseleave', () => {
      unlockButton.style.background = '#4f46e5';
      unlockButton.style.transform = 'translateY(0)';
    });

    // Handle unlock button click
    unlockButton.addEventListener('click', () => {
      // Open KeyFlow popup by simulating extension icon click
      try {
        chrome.runtime.sendMessage({ type: 'OPEN_POPUP' });
        message.remove();
      } catch (error) {
        // Fallback: show instruction to manually open KeyFlow
        unlockButton.textContent = 'Click KeyFlow icon in toolbar';
        unlockButton.style.background = '#6b7280';
        unlockButton.disabled = true;
        setTimeout(() => {
          message.remove();
        }, 3000);
      }
    });

    document.body.appendChild(message);

    // Auto-dismiss after 8 seconds
    setTimeout(() => {
      if (message.parentNode) {
        message.remove();
      }
    }, 8000);

    // Close on click outside
    const closeOnOutsideClick = (e) => {
      if (!message.contains(e.target)) {
        message.remove();
        document.removeEventListener('click', closeOnOutsideClick);
      }
    };

    setTimeout(() => {
      document.addEventListener('click', closeOnOutsideClick);
    }, 100);

  } catch (error) {
    console.error('KeyFlow: Error displaying vault locked message:', error);
  }
};

// Show message when no passwords found
const showNoPasswordsMessage = (url) => {
  const message = document.createElement('div');
  message.className = 'keyflow-no-passwords';
  message.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    z-index: 10001;
    padding: 24px;
    text-align: center;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  
  message.innerHTML = `
    <div style="font-size: 48px; margin-bottom: 16px;">🔐</div>
    <div style="font-weight: 600; color: #1f2937; margin-bottom: 8px;">No passwords found</div>
    <div style="color: #6b7280; margin-bottom: 16px;">No saved passwords for ${url}</div>
    <button style="background: #4f46e5; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">OK</button>
  `;
  
  message.querySelector('button').addEventListener('click', () => {
    message.remove();
  });
  
  document.body.appendChild(message);
  
  setTimeout(() => {
    message.remove();
  }, 3000);
};

// Fill username into form fields
const fillUsername = (password) => {
  try {
    // Find username field (various types)
    const usernameSelectors = [
      'input[type="email"]',
      'input[type="text"][name*="user"]',
      'input[type="text"][name*="email"]',
      'input[type="text"][name*="login"]',
      'input[type="text"][id*="user"]',
      'input[type="text"][id*="email"]',
      'input[type="text"][id*="login"]',
      'input[autocomplete="username"]',
      'input[autocomplete="email"]',
      'input[name="username"]',
      'input[name="email"]',
      'input[name="login"]'
    ];
    
    let usernameField = null;
    for (const selector of usernameSelectors) {
      usernameField = document.querySelector(selector);
      if (usernameField) break;
    }
    
    // Fill the username field
    if (usernameField && password.username) {
      usernameField.value = password.username;
      usernameField.dispatchEvent(new Event('input', { bubbles: true }));
      usernameField.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Focus on the username field to show it was filled
      usernameField.focus();
      console.log('KeyFlow: Username filled successfully');
    }
    
  } catch (error) {
    console.error('KeyFlow: Error filling username:', error);
  }
};

// Fill password into form fields
const fillPassword = (password) => {
  try {
    // Find username field (various types)
    const usernameSelectors = [
      'input[type="email"]',
      'input[type="text"][name*="user"]',
      'input[type="text"][name*="email"]',
      'input[type="text"][id*="user"]',
      'input[type="text"][id*="email"]',
      'input[autocomplete="username"]',
      'input[autocomplete="email"]'
    ];
    
    let usernameField = null;
    for (const selector of usernameSelectors) {
      usernameField = document.querySelector(selector);
      if (usernameField) break;
    }
    
    // Find password field
    const passwordField = document.querySelector('input[type="password"]');
    
    // Fill the fields
    if (usernameField && password.username) {
      usernameField.value = password.username;
      usernameField.dispatchEvent(new Event('input', { bubbles: true }));
      usernameField.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    if (passwordField && password.password) {
      passwordField.value = password.password;
      passwordField.dispatchEvent(new Event('input', { bubbles: true }));
      passwordField.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    console.log('KeyFlow: Password filled successfully');
    
  } catch (error) {
    console.error('KeyFlow: Error filling password:', error);
  }
};

// Create observer only if document.body exists
if (document.body) {
  const observer = new MutationObserver((mutations) => {
    // Only process if we added new nodes (not our own icons)
    const hasNewNodes = mutations.some(mutation => 
      mutation.type === 'childList' && 
      mutation.addedNodes.length > 0 &&
      Array.from(mutation.addedNodes).some(node => 
        node.nodeType === Node.ELEMENT_NODE && 
        !node.classList?.contains('keyflow-password-icon') &&
        !node.classList?.contains('keyflow-username-icon') &&
        !node.classList?.contains('keyflow-suggestions') &&
        !node.classList?.contains('keyflow-no-passwords') &&
        !node.classList?.contains('keyflow-save-prompt')
      )
    );
    
    if (hasNewNodes) {
      debouncedDetection();
    }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('KeyFlow: Content script received message:', request.type);
  
  if (request.type === 'DISPLAY_PASSWORD_SUGGESTIONS') {
    displayPasswordSuggestions(request.passwords, request.url);
    sendResponse({ success: true });
  } else if (request.type === 'DISPLAY_CREDENTIAL_SUGGESTIONS') {
    displayCredentialSuggestions(request.passwords, request.url, request.fieldType);
    sendResponse({ success: true });
  } else if (request.type === 'DISPLAY_VAULT_LOCKED') {
    console.log('KeyFlow: Displaying vault locked message for fieldType:', request.fieldType);
    displayVaultLockedMessage(request.url, request.fieldType);
    sendResponse({ success: true });
  }
});

// Listen for dynamic content changes with debouncing
let observerTimeout;
const debouncedDetection = () => {
  clearTimeout(observerTimeout);
  observerTimeout = setTimeout(() => {
    try {
      detectLoginForms();
      detectForms(); // Also detect new forms
    } catch (error) {
      console.error('KeyFlow: Observer detection failed:', error);
    }
  }, 100);
};

// Initialize with proper error handling
const initializeKeyFlow = () => {
  try {
    detectLoginForms();
    detectForms(); // Add form detection
  } catch (error) {
    console.error('KeyFlow: Initialization failed:', error);
  }
};

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeKeyFlow);
} else {
  initializeKeyFlow();
}

// Fallback for when body doesn't exist during observer creation
if (!document.body) {
  const bodyWatcher = new MutationObserver(() => {
    if (document.body) {
      initializeKeyFlow();
      bodyWatcher.disconnect();
    }
  });
  
  bodyWatcher.observe(document.documentElement, {
    childList: true
  });
}