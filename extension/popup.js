// Add to existing popup.js
const importer = new BookmarkImporter();

// Import functionality
document.getElementById('import-all-btn').addEventListener('click', async () => {
  const bookmarkTree = await importer.getAllBookmarks();
  const bookmarks = importer.flattenBookmarks(bookmarkTree);
  
  if (bookmarks.length === 0) {
    alert('No bookmarks found to import.');
    return;
  }
  
  if (confirm(`Import ${bookmarks.length} bookmarks from your browser?`)) {
    await performImport(bookmarks);
  }
});

document.getElementById('select-folder-btn').addEventListener('click', async () => {
  const bookmarkTree = await importer.getAllBookmarks();
  const folders = importer.buildFolderTree(bookmarkTree);
  
  displayFolderSelection(folders);
});

document.getElementById('import-selected-btn').addEventListener('click', async () => {
  const bookmarkTree = await importer.getAllBookmarks();
  const bookmarks = importer.flattenBookmarks(bookmarkTree, importer.selectedFolders);
  
  if (bookmarks.length === 0) {
    alert('No bookmarks found in selected folders.');
    return;
  }
  
  await performImport(bookmarks);
});

document.getElementById('cancel-selection-btn').addEventListener('click', () => {
  document.getElementById('folder-selection').style.display = 'none';
  importer.selectedFolders.clear();
});

function displayFolderSelection(folders) {
  const folderTree = document.getElementById('folder-tree');
  folderTree.innerHTML = '';
  
  folders.forEach(folder => {
    const div = document.createElement('div');
    div.className = 'folder-item';
    div.style.marginLeft = `${folder.level * 20}px`;
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `folder-${folder.id}`;
    checkbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        importer.selectedFolders.add(folder.id);
      } else {
        importer.selectedFolders.delete(folder.id);
      }
    });
    
    const label = document.createElement('label');
    label.htmlFor = `folder-${folder.id}`;
    label.textContent = `${folder.title} (${folder.bookmarkCount} bookmarks)`;
    
    div.appendChild(checkbox);
    div.appendChild(label);
    folderTree.appendChild(div);
  });
  
  document.getElementById('folder-selection').style.display = 'block';
}

async function performImport(bookmarks) {
  const progressDiv = document.getElementById('import-progress');
  const progressText = document.getElementById('progress-text');
  
  progressDiv.style.display = 'block';
  
  const result = await importer.importBookmarks(bookmarks, (imported, total) => {
    progressText.textContent = `${imported} / ${total} imported`;
  });
  
  progressDiv.style.display = 'none';
  alert(`Import complete! ${result.imported} of ${result.total} bookmarks imported successfully.`);
  
  // Refresh bookmark list
  loadBookmarks();
}