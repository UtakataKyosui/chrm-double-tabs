import './style.css';

const MAX_SELECTION = 2;
const POSITION_LABELS = ['左', '右'];

const list = document.querySelector<HTMLUListElement>('#tab-list')!;
const splitButton = document.querySelector<HTMLButtonElement>('#split')!;

const selected: number[] = [];
const buttons = new Map<number, HTMLButtonElement>();

function updateState() {
  splitButton.disabled = selected.length !== MAX_SELECTION;
  for (const [tabId, button] of buttons) {
    const index = selected.indexOf(tabId);
    const isSelected = index !== -1;
    button.setAttribute('aria-pressed', String(isSelected));
    button.disabled = !isSelected && selected.length >= MAX_SELECTION;
    button.querySelector('.badge')!.textContent = isSelected
      ? POSITION_LABELS[index]
      : '';
  }
}

function toggle(tabId: number) {
  const index = selected.indexOf(tabId);
  if (index !== -1) selected.splice(index, 1);
  else if (selected.length < MAX_SELECTION) selected.push(tabId);
  updateState();
}

function createIcon(tab: chrome.tabs.Tab) {
  const icon = document.createElement('img');
  icon.className = 'icon';
  icon.alt = '';
  if (tab.favIconUrl) icon.src = tab.favIconUrl;
  else icon.classList.add('icon-empty');
  icon.addEventListener('error', () => icon.classList.add('icon-empty'));
  return icon;
}

function renderTab(tab: chrome.tabs.Tab) {
  const item = document.createElement('li');
  const button = document.createElement('button');
  const title = document.createElement('span');
  const badge = document.createElement('span');

  button.type = 'button';
  button.className = 'tab-button';
  button.setAttribute('aria-pressed', 'false');
  button.addEventListener('click', () => toggle(tab.id!));

  title.className = 'title';
  title.textContent = tab.title || tab.url || `Tab ${tab.id}`;
  badge.className = 'badge';

  button.append(createIcon(tab), title, badge);
  item.append(button);
  list.append(item);
  buttons.set(tab.id!, button);
}

async function splitSelectedTabs() {
  const [left, right] = await Promise.all(selected.map((id) => chrome.tabs.get(id)));
  const params = new URLSearchParams({
    left: left.url ?? '',
    right: right.url ?? '',
  });

  await chrome.tabs.create({
    url: chrome.runtime.getURL(`/split.html?${params}`),
    index: Math.max(left.index, right.index) + 1,
  });
  await chrome.tabs.remove(selected);
  window.close();
}

const tabs = await chrome.tabs.query({ currentWindow: true });
tabs.filter((tab) => tab.id !== undefined).forEach(renderTab);
splitButton.addEventListener('click', splitSelectedTabs);
