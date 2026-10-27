import './style.css';

const params = new URLSearchParams(location.search);
const tab = await chrome.tabs.getCurrent();

if (tab?.id !== undefined) {
  await chrome.declarativeNetRequest.updateSessionRules({
    removeRuleIds: [tab.id],
    addRules: [
      {
        id: tab.id,
        priority: 1,
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
          responseHeaders: [
            {
              header: 'x-frame-options',
              operation: chrome.declarativeNetRequest.HeaderOperation.REMOVE,
            },
            {
              header: 'content-security-policy',
              operation: chrome.declarativeNetRequest.HeaderOperation.REMOVE,
            },
          ],
        },
        condition: {
          resourceTypes: [chrome.declarativeNetRequest.ResourceType.SUB_FRAME],
          tabIds: [tab.id],
        },
      },
    ],
  });
}

document.querySelector<HTMLIFrameElement>('#left')!.src = params.get('left') ?? '';
document.querySelector<HTMLIFrameElement>('#right')!.src = params.get('right') ?? '';
