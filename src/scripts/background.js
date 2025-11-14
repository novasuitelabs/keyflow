chrome.runtime.onInstalled.addListener(() => {
  // KeyFlow extension installed
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_PASSWORDS') {
    // Handle password retrieval
    chrome.storage.local.get(['passwords'], (result) => {
      sendResponse({ passwords: result.passwords || [] });
    });
    return true; // Keep the message channel open for async response
  }
  
  if (request.type === 'SAVE_PASSWORD') {
    // Handle password saving
    chrome.storage.local.get(['passwords'], (result) => {
      const passwords = result.passwords || [];
      const newPassword = {
        id: Date.now(),
        createdAt: new Date().toISOString(),
        ...request.password
      };
      passwords.push(newPassword);
      chrome.storage.local.set({ passwords }, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }
  
  if (request.type === 'CHECK_EXISTING_PASSWORD') {
    // Check if password already exists for domain/username
    chrome.storage.local.get(['passwords'], (result) => {
      const passwords = result.passwords || [];
      const exists = passwords.some(password => {
        const passwordDomain = extractRootDomain(password.url || password.site);
        const currentDomain = extractRootDomain(request.domain);
        return passwordDomain === currentDomain && 
               password.username === request.username;
      });
      sendResponse({ exists });
    });
    return true;
  }
  
  if (request.type === 'ADD_NEVER_SAVE') {
    // Add domain to never save list
    chrome.storage.local.get(['neverSaveDomains'], (result) => {
      const neverSaveDomains = result.neverSaveDomains || [];
      if (!neverSaveDomains.includes(request.domain)) {
        neverSaveDomains.push(request.domain);
        chrome.storage.local.set({ neverSaveDomains }, () => {
          sendResponse({ success: true });
        });
      } else {
        sendResponse({ success: true });
      }
    });
    return true;
  }
  
  if (request.type === 'CHECK_VAULT_STATUS') {
    // Check if vault is currently locked
    chrome.storage.local.get(['autoLockTimer'], (result) => {
      const timerData = result.autoLockTimer;
      let isVaultLocked = true;
      
      if (timerData && timerData.unlockTime) {
        const now = Date.now();
        const elapsed = (now - timerData.unlockTime) / 1000; // seconds elapsed
        const AUTO_LOCK_TIME = 5 * 60; // 5 minutes in seconds
        const remaining = AUTO_LOCK_TIME - elapsed;
        
        // Vault is unlocked if time hasn't expired
        isVaultLocked = remaining <= 0;
      }
      
      sendResponse({ locked: isVaultLocked });
    });
    return true;
  }
  
  if (request.type === 'SHOW_PASSWORD_SUGGESTIONS' || request.type === 'SHOW_USERNAME_SUGGESTIONS') {
    // Handle password/username suggestions request from content script
    const currentUrl = request.url;
    const fieldType = request.fieldType || 'password';
    
    // First check if vault is locked
    chrome.storage.local.get(['autoLockTimer'], (timerResult) => {
      const timerData = timerResult.autoLockTimer;
      let isVaultLocked = true;

      if (timerData && timerData.unlockTime) {
        const now = Date.now();
        const elapsed = (now - timerData.unlockTime) / 1000; // seconds elapsed
        const AUTO_LOCK_TIME = 5 * 60; // 5 minutes in seconds
        const remaining = AUTO_LOCK_TIME - elapsed;

        // Vault is unlocked if time hasn't expired
        isVaultLocked = remaining <= 0;
      }

      if (isVaultLocked) {
        // Vault is locked, send locked response
        chrome.tabs.sendMessage(sender.tab.id, {
          type: 'DISPLAY_VAULT_LOCKED',
          url: currentUrl,
          fieldType: fieldType
        });
        sendResponse({ success: false, locked: true });
        return;
      }
      
      // Vault is unlocked, proceed with password suggestions
      chrome.storage.local.get(['passwords'], (result) => {
        const passwords = result.passwords || [];
        
        // Find passwords matching the current domain (including subdomains)
        const matchingPasswords = passwords.filter(password => {
          return isMatchingDomain(currentUrl, password);
        });
        
        // Sort by relevance (exact matches first, then subdomains)
        matchingPasswords.sort((a, b) => {
          const aScore = getDomainMatchScore(currentUrl, a);
          const bScore = getDomainMatchScore(currentUrl, b);
          return bScore - aScore; // Higher score first
        });
        
        // Send matching passwords back to content script
        chrome.tabs.sendMessage(sender.tab.id, {
          type: 'DISPLAY_CREDENTIAL_SUGGESTIONS',
          passwords: matchingPasswords,
          url: currentUrl,
          fieldType: fieldType
        });
        
        sendResponse({ success: true, count: matchingPasswords.length });
      });
    });
    return true;
  }
  
  if (request.type === 'OPEN_POPUP') {
    // Handle request to open the extension popup
    chrome.action.openPopup()
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});

// Enhanced domain matching function
const isMatchingDomain = (currentUrl, password) => {
  try {
    // Get domains from password
    const passwordDomains = getDomainsFromPassword(password);
    const currentDomain = extractRootDomain(currentUrl);
    
    // Check if any password domain matches current domain
    return passwordDomains.some(passwordDomain => {
      const passwordRoot = extractRootDomain(passwordDomain);
      
      // Exact domain match
      if (passwordDomain === currentUrl || currentUrl === passwordDomain) {
        return true;
      }
      
      // Root domain match (handles subdomains)
      if (passwordRoot === currentDomain && passwordRoot) {
        return true;
      }
      
      // Subdomain matching (both directions)
      if (passwordDomain.endsWith('.' + currentDomain) || currentUrl.endsWith('.' + passwordRoot)) {
        return true;
      }
      
      // Handle www prefix
      const wwwPasswordDomain = passwordDomain.replace(/^www\./, '');
      const wwwCurrentDomain = currentUrl.replace(/^www\./, '');
      if (wwwPasswordDomain === wwwCurrentDomain) {
        return true;
      }
      
      return false;
    });
  } catch (error) {
    // Domain matching error - return false
    return false;
  }
};

// Get all possible domains from a password entry
const getDomainsFromPassword = (password) => {
  const domains = [];
  
  // From URL field
  if (password.url) {
    try {
      const parsedUrl = new URL(password.url);
      domains.push(parsedUrl.hostname);
    } catch (e) {
      // If URL parsing fails, try to extract domain from string
      const domainMatch = password.url.match(/(?:https?:\/\/)?(?:www\.)?([^\/\s]+)/);
      if (domainMatch) {
        domains.push(domainMatch[1]);
      }
    }
  }
  
  // From site name (try to convert to domain)
  if (password.site) {
    const siteLower = password.site.toLowerCase();
    
    // Common patterns to convert site names to domains
    const sitePatterns = [
      { pattern: /^(.+)$/, replacement: '$1.com' },  // "github" -> "github.com"
      { pattern: /^(.+)$/, replacement: '$1.org' },  // "wikipedia" -> "wikipedia.org"
      { pattern: /^(.+)$/, replacement: '$1.net' },  // "sourceforge" -> "sourceforge.net"
    ];
    
    // If site looks like a domain already
    if (siteLower.includes('.')) {
      domains.push(siteLower);
    } else {
      // Try common TLD patterns
      domains.push(siteLower + '.com');
      domains.push(siteLower + '.org');
      domains.push(siteLower + '.net');
    }
    
    // Also add the site name as-is for partial matching
    domains.push(siteLower);
  }
  
  return [...new Set(domains)]; // Remove duplicates
};

// Extract root domain from hostname
const extractRootDomain = (hostname) => {
  if (!hostname) return '';
  
  // Remove protocol if present
  hostname = hostname.replace(/^https?:\/\//, '');
  
  // Remove www prefix
  hostname = hostname.replace(/^www\./, '');
  
  // Remove path if present
  hostname = hostname.split('/')[0];
  
  // Split by dots and get the last two parts (domain.tld)
  const parts = hostname.split('.');
  if (parts.length >= 2) {
    return parts.slice(-2).join('.');
  }
  
  return hostname;
};

// Score domain matches for sorting (higher score = better match)
const getDomainMatchScore = (currentUrl, password) => {
  const passwordDomains = getDomainsFromPassword(password);
  let bestScore = 0;
  
  passwordDomains.forEach(passwordDomain => {
    let score = 0;
    
    // Exact match gets highest score
    if (passwordDomain === currentUrl) {
      score = 100;
    }
    // Same root domain
    else if (extractRootDomain(passwordDomain) === extractRootDomain(currentUrl)) {
      score = 80;
    }
    // Subdomain match
    else if (passwordDomain.includes(currentUrl) || currentUrl.includes(passwordDomain)) {
      score = 60;
    }
    // Partial match
    else if (passwordDomain.includes(extractRootDomain(currentUrl))) {
      score = 40;
    }
    
    bestScore = Math.max(bestScore, score);
  });
  
  return bestScore;
};